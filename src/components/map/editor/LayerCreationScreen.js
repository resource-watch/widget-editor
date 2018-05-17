import React from 'react';
import PropTypes from 'prop-types';
import Flatpickr from 'react-flatpickr';

// Redux
import { connect } from 'react-redux';
import { showLayer } from 'reducers/widgetEditor';

// Helpers
import { revertTimezoneOffset } from 'helpers/date';

// Components
import Select from 'components/form/SelectInput';
import Icon from 'components/ui/Icon';
import Checkbox from 'components/form/Checkbox';

const LAYER_TYPES = [
  // { label: 'WMS', value: 'wms' },
  // { label: 'Other', value: 'other' },
  { label: 'GEE', value: 'gee' },
  { label: 'Carto', value: 'cartodb' }
].sort((a, b) => b.label - a.label);

class LayerCreationScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      /**
       * Name of the new layer
       * @type {string} name
       */
      name: '',
      /**
       * Description of the new layer
       * @type {string} description
       */
      description: '',
      /**
       * Type of layer (value attribute of LAYER_TYPES)
       * @type {string} type
       */
      type: '',
      /**
       * Minimum zoom of the layer
       * @type {number} minZoom
       */
      minZoom: 0,
      /**
       * Minimum zoom of the layer
       * @type {number} minZoom
       */
      maxZoom: 18,
      /**
       * Bounding box of the layer
       * NOTE: the format is [SW long, SW lat, NE long, NE lat]
       * @type {number[]} bbox
       */
      bbox: null,
      cartodb: {
        /**
         * Name of the account
         * @type {string} account
         */
        account: props.connectorUrl && props.connectorUrl.match(/^https?:\/\/(.*).carto.com/).length > 1
          ? props.connectorUrl.match(/^https?:\/\/(.*).carto.com/)[1]
          : '',
        /**
         * SQL query
         * @type {string} sql
         */
        sql: props.tableName ? `SELECT * FROM ${props.tableName}` : '',
        /**
         * CartoCSS
         * @type {string} cartocss
         */
        cartocss: ''
      },
      gee: {
        /**
         * Whether the layer is a collection of images
         * @type {boolean} imageCollection
         */
        imageCollection: false,
        /**
         * Position of the image to show
         * @type {'first'|'last'} position
         */
        position: null,
        /**
         * Dates filter for the images
         * NOTE: UTC dates only
         * @type {Date[]} datesFilter
         */
        datesFilter: [],
        /**
         * Type of styles
         * @type {'sld'|'standard'} styleType
         */
        styleType: null,
        /**
         * SLD (Styled Layer Descriptor) for the image
         * @type {string} sldValue
         */
        sldValue: ''
      }
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.canRenderLayer(this.state)) {
      this.props.showLayer(this.getLayer(this.state, this.props));
    } else if (this.canRenderLayer(prevState, prevProps)
      && !this.canRenderLayer(this.state, this.props)) {
      this.props.showLayer(null);
    }
  }

  componentWillUnmount() {
    // By removing the layer from the map, we avoid
    // showing a preview of a layer that can't be restored
    this.props.showLayer(null);
  }

  /**
   * Event handler executed when the user changes
   * the date range of a GEE layer
   * @param {Date[]} dates Dates
   */
  onChangeDatesFilter(dates) {
    if (dates.length < 2) {
      this.setState({
        gee: Object.assign({}, this.state.gee, {
          datesFilter: []
        })
      });
      return;
    }

    // NOTE: we revert the timezone offset of the dates
    // coming from Flatpickr because the library is unable to
    // display UTC dates

    this.setState({
      gee: Object.assign({}, this.state.gee, {
        datesFilter: [
          revertTimezoneOffset(dates[0]),
          revertTimezoneOffset(dates[1])
        ]
      })
    });
  }

  /**
   * Get the configuration of the layer
   * @param {object} state State of the component
   * @param {object} props Props of the component
   * @returns {object}
   */
  getLayer(state, props) { // eslint-disable-line class-methods-use-this
    let layerConfig = {};

    if (state.type === 'cartodb') {
      layerConfig = Object.assign(
        {
          account: state.cartodb.account,
          body: Object.assign(
            {
              layers: [
                {
                  type: 'cartodb',
                  options: {
                    sql: state.cartodb.sql,
                    cartocss: state.cartodb.cartocss,
                    cartocss_version: '2.3.0'
                  }
                }
              ]
            },
            state.minZoom !== null && state.minZoom !== undefined
              ? { minzoom: state.minZoom }
              : {},
            state.maxZoom !== null && state.maxZoom !== undefined
              ? { maxzoom: state.maxZoom }
              : {}
          )
        },
        state.bbox
          ? { bbox: state.bbox }
          : {}
      );
    } else if (state.type === 'gee') {
      layerConfig = Object.assign(
        {
          type: 'gee',
          body: Object.assign(
            {
              isImageCollection: state.gee.imageCollection,
              styleType: state.gee.styleType
            },
            state.gee.imageCollection
              ? { position: state.gee.position }
              : {},
            state.gee.imageCollection && state.gee.datesFilter.length
              ? { filterDates: state.gee.datesFilter.map(d => `${d.getUTCFullYear()}-${`${d.getUTCMonth() + 1}`.padStart(2, '0')}-${`${d.getUTCDate()}`.padStart(2, '0')}`) }
              : {},
            state.gee.styleType === 'sld'
              ? { sldValue: state.gee.sldValue }
              : {},
            state.minZoom !== null && state.minZoom !== undefined
              ? { minzoom: state.minZoom }
              : {},
            state.maxZoom !== null && state.maxZoom !== undefined
              ? { maxzoom: state.maxZoom }
              : {}
          )
        },
        state.bbox
          ? { bbox: state.bbox }
          : {}
      );
    }

    return {
      // Fake ID necessary for the layer to render
      // NOTE: do not change without updating WidgetEditor too
      id: `widget-editor-layer-${+(new Date())}`,
      name: state.name,
      description: state.description,
      dataset: props.datasetId,
      provider: state.type,
      layerConfig
    };
  }

  /**
   * Return whether the layer can be rendered on the map
   * @param {object} state State of the component
   * @returns {boolean}
   */
  canRenderLayer(state) { // eslint-disable-line class-methods-use-this
    const { name, type, cartodb, gee } = state;

    const cartodbCond = cartodb.account && cartodb.sql && cartodb.cartocss;
    const geeCond = (gee.imageCollection ? gee.position : true) && gee.styleType
      && (gee.styleType === 'sld' ? gee.sldValue : true);

    return !!name && !!type
      && (type === 'cartodb' ? !!cartodbCond : true)
      && (type === 'gee' ? !!geeCond : true);
  }

  render() {
    const { onChangeScreen } = this.props;
    const { name, description, type, minZoom, maxZoom, bbox, cartodb, gee } = this.state;

    return (
      <div className="layer-creation-screen">
        <div className="breadcrumbs">
          <button
            type="button"
            className="c-we-button -compressed"
            onClick={() => onChangeScreen(null)}
          >
            <Icon name="icon-arrow-left" className="-smaller" /> Back
          </button>
        </div>
        <div className="c-we-field">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            value={name}
            onChange={({ target }) => this.setState({ name: target.value })}
          />
        </div>
        <div className="c-we-field">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id="description"
            placeholder="Description"
            value={description}
            onChange={({ target }) => this.setState({ description: target.value })}
          />
        </div>
        <div className="c-we-field">
          <label htmlFor="select-layer-type">Layer type *</label>
          <Select
            properties={{
              name: 'select-layer-type',
              value: type || null
            }}
            options={LAYER_TYPES.map(({ label, value }) => ({ label, value }))}
            onChange={value => this.setState({ type: value })}
          />
        </div>
        { type === 'cartodb' && (
          <div>
            <div className="c-we-field">
              <label htmlFor="cartodb-account">Account *</label>
              <input
                type="text"
                name="cartodb-account"
                id="cartodb-account"
                placeholder="Account"
                value={cartodb.account}
                onChange={({ target }) => this.setState({
                  cartodb: Object.assign({}, cartodb, { account: target.value })
                })}
              />
            </div>
            <div className="c-we-field">
              <label htmlFor="cartodb-sql">SQL query *</label>
              <textarea
                name="cartodb-sql"
                id="cartodb-sql"
                placeholder="SQL query"
                value={cartodb.sql}
                onChange={({ target }) => this.setState({
                  cartodb: Object.assign({}, cartodb, { sql: target.value })
                })}
              />
            </div>
            <div className="c-we-field">
              <label htmlFor="cartodb-css">CartoCSS *</label>
              <textarea
                name="cartodb-css"
                id="cartodb-css"
                placeholder="CartoCSS"
                value={cartodb.cartocss}
                onChange={({ target }) => this.setState({
                  cartodb: Object.assign({}, cartodb, { cartocss: target.value })
                })}
              />
            </div>
          </div>
        ) }
        { type === 'gee' && (
          <div>
            <div className="c-we-field">
              <Checkbox
                properties={{
                  name: 'image-collection',
                  title: 'Image collection',
                  checked: gee.imageCollection,
                  default: gee.imageCollection
                }}
                onChange={({ checked }) => this.setState({
                  gee: Object.assign({}, gee, { imageCollection: checked })
                })}
              />
            </div>
            { gee.imageCollection && (
              <div className="c-we-field">
                <label htmlFor="select-gee-position">Image position *</label>
                <Select
                  properties={{
                    name: 'select-gee-position',
                    value: gee.position,
                    default: gee.position
                  }}
                  options={[{ label: 'First', value: 'first' }, { label: 'Last', value: 'last' }]}
                  onChange={value => this.setState({
                    gee: Object.assign({}, gee, { position: value })
                  })}
                />
              </div>
            ) }
            { gee.imageCollection && (
              <div className="c-we-field">
                <label htmlFor="gee-dates-filter">Date range</label>
                <Flatpickr
                  id="gee-dates-filter"
                  options={{
                    mode: 'range',
                    locale: { firstDayOfWeek: 1 }
                  }}
                  onChange={(dates) => this.onChangeDatesFilter(dates)}
                />
              </div>
            ) }
            <div className="c-we-field">
              <label htmlFor="select-style-type">Type of styles *</label>
              <Select
                properties={{
                  name: 'select-style-type',
                  value: gee.styleType,
                  default: gee.styleType
                }}
                options={[{ label: 'SLD', value: 'sld' }, { label: 'Standard', value: 'standard' }]}
                onChange={value => this.setState({
                  gee: Object.assign({}, gee, { styleType: value })
                })}
              />
            </div>
            { gee.styleType === 'sld' && (
              <div className="c-we-field">
                <label htmlFor="gee-sld-value">SLD (Styled Layer Descriptor) *</label>
                <textarea
                  name="gee-sld-value"
                  id="gee-sld-value"
                  placeholder="SLD"
                  value={gee.sldValue}
                  onChange={({ target }) => this.setState({
                    gee: Object.assign({}, gee, { sldValue: target.value })
                  })}
                />
              </div>
            ) }
          </div>
        ) }
        <div className="c-we-field">
          <label htmlFor="min-zoom">Mimimum zoom</label>
          <input
            type="number"
            name="min-zoom"
            id="min-zoom"
            placeholder="Maximum zoom"
            value={minZoom}
            min="0"
            max={maxZoom}
            onChange={({ target }) => this.setState({ minZoom: +target.value })}
          />
        </div>
        <div className="c-we-field">
          <label htmlFor="max-zoom">Maximum zoom</label>
          <input
            type="number"
            name="max-zoom"
            id="max-zoom"
            placeholder="Minimum zoom"
            value={maxZoom}
            min={minZoom}
            max="18"
            onChange={({ target }) => this.setState({ maxZoom: +target.value })}
          />
        </div>
        <div className="c-we-field">
          <Checkbox
            properties={{
              name: 'bbox',
              title: 'Add a bounding box',
              checked: !!bbox,
              default: !!bbox
            }}
            onChange={({ checked }) => this.setState({
              bbox: checked ? [-180, -90, 180, 90] : null
            })}
          />
        </div>
        { bbox && (
          <fieldset className="c-we-field">
            <legend>Bounding box</legend>
            <div className="c-we-field">
              <label htmlFor="bbox-sw-long">South west longitude</label>
              <input
                type="number"
                name="bbox-sw-long"
                id="bbox-sw-long"
                placeholder="South west longitude"
                value={bbox[0]}
                min="-180"
                max={bbox[2]}
                onChange={({ target }) => this.setState({
                  bbox: [+target.value, ...bbox.slice(1)]
                })}
              />
            </div>
            <div className="c-we-field">
              <label htmlFor="bbox-sw-lat">South west latitude</label>
              <input
                type="number"
                name="bbox-sw-lat"
                id="bbox-sw-lat"
                placeholder="South west latitude"
                value={bbox[1]}
                min="-90"
                max={bbox[3]}
                onChange={({ target }) => this.setState({
                  bbox: [bbox[0], +target.value, ...bbox.slice(2)]
                })}
              />
            </div>
            <div className="c-we-field">
              <label htmlFor="bbox-ne-long">North east longitude</label>
              <input
                type="number"
                name="bbox-ne-long"
                id="bbox-ne-long"
                placeholder="North east longitude"
                value={bbox[2]}
                min={bbox[0]}
                max="180"
                onChange={({ target }) => this.setState({
                  bbox: [...bbox.slice(0, 2), +target.value, bbox[3]]
                })}
              />
            </div>
            <div className="c-we-field">
              <label htmlFor="bbox-ne-lat">North east latitude</label>
              <input
                type="number"
                name="bbox-ne-lat"
                id="bbox-ne-lat"
                placeholder="North east latitude"
                value={bbox[3]}
                min={bbox[1]}
                max="90"
                onChange={({ target }) => this.setState({
                  bbox: [...bbox.slice(0, 3), +target.value]
                })}
              />
            </div>
          </fieldset>
        ) }
      </div>
    );
  }
}

LayerCreationScreen.propTypes = {
  /**
   * Connector URL of the dataset
   * @type {string} connectorUrl
   */
  connectorUrl: PropTypes.string,
  /**
   * Name of the table
   * @type {string} tableName
   */
  tableName: PropTypes.string,
  /**
   * Callback to execute to change the active screen
   * @type {(Component: function|null) => void} onChangeScreen
   */
  onChangeScreen: PropTypes.func.isRequired,
  /**
   * ID of the dataset
   * @type {string} datasetId
   */
  datasetId: PropTypes.string.isRequired,
  /**
   * Show a layer on the map
   * @type {(layer: any) => void} showLayer
   */
  showLayer: PropTypes.func.isRequired
};

LayerCreationScreen.defaultProps = {
  connectorUrl: null,
  tableName: null
};

const mapStateToProps = ({ widgetEditor }) => ({
  datasetId: widgetEditor.datasetId
});

const mapDispatchToProps = dispatch => ({
  showLayer: layer => dispatch(showLayer(layer))
});

export default connect(mapStateToProps, mapDispatchToProps)(LayerCreationScreen);
