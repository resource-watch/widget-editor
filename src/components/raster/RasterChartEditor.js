import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';
import { toastr } from 'react-redux-toastr';
import isEmpty from 'lodash/isEmpty';
import truncate from 'lodash/truncate';
import { format } from 'd3-format';

// Redux
import { connect } from 'react-redux';
import { setBand } from 'reducers/widgetEditor';
import { toggleModal } from 'reducers/modal';

// Components
import Select from 'components/form/SelectInput';
import Spinner from 'components/ui/Spinner';

// Services
import RasterService from 'services/RasterService';

// Helpers
import { canRenderChart } from 'helpers/WidgetHelper';

class RasterChartEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false, // Whether the component is loading
      error: null, // Whether an error happened
      /** @type {{ name: string, alias?: string, type?: string, description?: string }[]} bands */
      bands: [], // List of the bands
      bandStatsInfo: {}, // Statistical information of the selected band
      bandStatsInfoLoading: false
    };

    this.rasterService = new RasterService(props.datasetId, props.tableName, props.provider);
  }

  componentDidMount() {
    this.fetchBandNames();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.datasetId !== this.props.datasetId
      || nextProps.tableName !== this.props.tableName) {
      this.rasterService = new RasterService(
        nextProps.datasetId,
        nextProps.tableName,
        nextProps.provider
      );
      this.fetchBandNames();
    }
  }

  /**
   * Event handler executed when the user selects a band
   * @param {string} bandName - Name of the band
   */
  @Autobind
  onChangeBand(bandName) {
    const band = this.state.bands.find(b => b.name === bandName);
    this.props.setBand(band);

    // We fetch the stats info about the band
    this.setState({ bandStatsInfoLoading: true });
    this.rasterService.getBandStatsInfo(bandName)
      .then(bandStatsInfo => this.setState({ bandStatsInfo }))
      .catch(() => toastr.error('Error', 'Unable to fetch the statistical information of the band'))
      .then(() => this.setState({ bandStatsInfoLoading: false }));
  }

  /**
   * Event handler executed when the user clicks the
   * "Read more" button
   */
  @Autobind
  onClickReadMore() {
    this.props.toggleModal(true, {
      children: () => (
        <div>
          <h2>Description of the band</h2>
          <p>{this.props.band.description}</p>
        </div>
      )
    });
  }

  /**
   * Fetch the name of the bands and set it in the state
   */
  fetchBandNames() {
    this.setState({ loading: true, error: null });
    this.rasterService.getBandNames()
      // We merge the band names with the information that comes from
      // the metadata of the dataset (type, alias and description)
      .then((bands) => { // eslint-disable-line arrow-body-style
        return bands.map((band) => {
          let res = { name: band };

          const bandInfo = this.props.bandsInfo[band];
          if (bandInfo) {
            res = Object.assign({}, res, bandInfo);
          } else if (this.props.provider === 'cartodb') {
            // If there's no alias for a Carto dataset, then
            // we use a prettier name than just a number
            res = Object.assign({}, res, { alias: `Band ${band}` });
          }

          return res;
        });
      })
      .then((bands) => {
        // We save the bands
        this.setState({ bands }, () => {
          // At this point, if this.props.band is defined, it's
          // because we're restoring the state of the widget editor
          // That means that this.props.band only has its name attribute
          // defined (we don't have the alias nor the description), we thus
          // need to reset the band based on the band list
          if (this.props.band) {
            this.onChangeBand(this.props.band.name);
          }
        });
      })
      .catch(({ message }) => this.setState({ error: message }))
      .then(() => this.setState({ loading: false }));
  }

  render() {
    const { loading, bands, error, bandStatsInfo, bandStatsInfoLoading } = this.state;
    const { band, mode, showSaveButton, hasGeoInfo, widgetEditor, provider } = this.props;

    const canSave = canRenderChart(widgetEditor, provider);
    const canShowSaveButton = showSaveButton && canSave;

    let description = band && band.description;
    const longDescription = description && description.length > 250;
    description = truncate(description, { length: 250, separator: /,?.* +/ });

    return (
      <div className="c-we-raster-chart-editor">
        <div className="content">
          <div className="selectors-container">
            <div className="c-we-field">
              <label htmlFor="raster-bands">
                Bands { loading && <Spinner isLoading className="-light -small -inline" /> }
              </label>
              { error && <div className="error"><span>Error:</span> {error}</div> }
              { !error && (
                <Select
                  properties={{
                    id: 'raster-bands',
                    name: 'raster-bands',
                    default: band && band.name
                  }}
                  options={bands.map(b => ({ label: b.alias || b.name, value: b.name }))}
                  onChange={this.onChangeBand}
                />
              ) }
            </div>
          </div>
          { band && band.description && (
            <p className="description">
              {description}
              { longDescription &&
                <button type="button" onClick={() => this.onClickReadMore()}>Read more</button>
              }
            </p>
          ) }
          <div className="c-we-table stats">
            <Spinner isLoading={bandStatsInfoLoading} className="-light -small" />
            { bandStatsInfo && !isEmpty(bandStatsInfo) && (
              <table>
                <thead>
                  <tr>
                    { Object.keys(bandStatsInfo).map(name => <th key={name}>{name}</th>) }
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    { Object.keys(bandStatsInfo).map((name) => {
                      const number = format('.4s')(bandStatsInfo[name]);
                      return (
                        <td key={name}>{number}</td>
                      );
                    }) }
                  </tr>
                </tbody>
              </table>
            ) }
          </div>
        </div>
        <div className="buttons">
          <span /> {/* Help align the button to the right */}
          {
            canShowSaveButton &&
            <button
              type="button"
              className="c-we-button -primary"
              onClick={this.props.onSave}
            >
              {mode === 'save' ? 'Save visualization' : 'Update visualization'}
            </button>
          }
        </div>
      </div>
    );
  }
}

RasterChartEditor.propTypes = {
  /**
   * Dataset ID
   */
  datasetId: PropTypes.string.isRequired,
  tableName: PropTypes.string.isRequired,
  hasGeoInfo: PropTypes.bool.isRequired,
  provider: PropTypes.string.isRequired,
  mode: PropTypes.oneOf(['save', 'update']),
  /**
   * Whether the save/update button should be shown
   * when a widget is rendered
   */
  showSaveButton: PropTypes.bool.isRequired,
  /**
   * Callback executed when the save/update button
   * is clicked
   */
  onSave: PropTypes.func,

  // REDUX
  band: PropTypes.object,
  bandsInfo: PropTypes.object,
  toggleModal: PropTypes.func.isRequired,
  setBand: PropTypes.func.isRequired
};

const mapStateToProps = ({ widgetEditor }) => ({
  widgetEditor,
  band: widgetEditor.band,
  bandsInfo: widgetEditor.bandsInfo
});

const mapDispatchToProps = dispatch => ({
  toggleModal: (...args) => dispatch(toggleModal(...args)),
  setBand: band => dispatch(setBand(band))
});

export default connect(mapStateToProps, mapDispatchToProps)(RasterChartEditor);
