import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { showLayer } from 'reducers/widgetEditor';

// Components
import Select from 'components/form/SelectInput';
import Icon from 'components/ui/Icon';

const LAYER_TYPES = [
  // { label: 'WMS', value: 'wms' },
  // { label: 'Other', value: 'other' },
  // { label: 'GEE', value: 'gee' },
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
      }
    };
  }

  componentDidUpdate() {
    if (this.canRenderLayer(this.state)) {
      this.props.showLayer(this.getLayer(this.state, this.props));
    }
  }

  componentWillUnmount() {
    // By removing the layer from the map, we avoid
    // showing a preview of a layer that can't be restored
    this.props.showLayer(null);
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
      layerConfig = {
        account: state.cartodb.account,
        body: {
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
        }
      };
    }

    return {
      // Fake ID necessary for the layer to render
      id: `xxx-widget-editor-${+(new Date())}`,
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
    const cartodb = state.cartodb.account && state.cartodb.sql && state.cartodb.cartocss;
    return state.name && state.type && (state.type === 'cartodb' ? cartodb : true);
  }

  render() {
    const { onChangeScreen } = this.props;
    const { name, description, type, cartodb } = this.state;

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
          <label htmlFor="name">Name</label>
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
          <label htmlFor="select-layer-type">Layer type</label>
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
              <label htmlFor="cartodb-account">Account</label>
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
              <label htmlFor="cartodb-sql">SQL query</label>
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
              <label htmlFor="cartodb-css">CartoCSS</label>
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
