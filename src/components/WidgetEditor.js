import React from 'react';
import PropTypes from 'prop-types';
import HTML5Backend from 'react-dnd-html5-backend';
import Autobind from 'autobind-decorator';
import { DragDropContext } from 'react-dnd';
import isEqual from 'lodash/isEqual';
import { toastr } from 'react-redux-toastr';
import AutosizeInput from 'react-input-autosize';

import 'css/index.scss';

// Redux
import { connect } from 'react-redux';
import {
  resetWidgetEditor,
  setFields,
  setBandsInfo,
  setVisualizationType,
  setTitle,
  setZoom,
  setLatLng,
  setFilters,
  setColor,
  setCategory,
  setValue,
  setSize,
  setOrderBy,
  setBand,
  setLayer,
  setAggregateFunction,
  setLimit,
  setChartType,
  setAreaIntersection,
  setEmbed
} from 'reducers/widgetEditor';
import { toggleModal } from 'reducers/modal';

// Services
import DatasetService from 'services/DatasetService';
import WidgetService from 'services/WidgetService';

// Components
import Select from 'components/form/SelectInput';
import Spinner from 'components/ui/Spinner';
import VegaChart from 'components/chart/VegaChart';
import Map from 'components/map/Map';
import MapControls from 'components/map/MapControls';
import BasemapControl from 'components/map/controls/BasemapControl';
import Legend from 'components/ui/Legend';
import TableView from 'components/table/TableView';
import ShareModalExplore from 'components/modal/ShareModalExplore';
import EmbedTableModal from 'components/modal/EmbedTableModal';

// Editors
import ChartEditor from 'components/chart/ChartEditor';
import MapEditor from 'components/map/MapEditor';
import RasterChartEditor from 'components/raster/RasterChartEditor';
import NEXGDDPEditor from 'components/nexgddp/NEXGDDPEditor';



// Helpers
import {
  getChartInfo,
  getChartConfig,
  canRenderChart,
  getChartType,
  checkEditorRestoredState,
  getWidgetConfig
} from 'helpers/WidgetHelper';
import { getConfig } from 'helpers/ConfigHelper';
import ChartTheme from 'helpers/theme';
import LayerManager from 'helpers/LayerManager';
import getQueryByFilters from 'helpers/getQueryByFilters';

const VISUALIZATION_TYPES = [
  { label: 'Chart', value: 'chart', available: true },
  { label: 'Chart', value: 'raster_chart', available: false },
  { label: 'Map', value: 'map', available: true },
  { label: 'Table', value: 'table', available: true }
];

const CHART_TYPES = [
  { label: '1d_scatter', value: '1d_scatter' },
  { label: '1d_tick', value: '1d_tick' },
  { label: 'bar', value: 'bar' },
  { label: 'line', value: 'line' },
  { label: 'pie', value: 'pie' },
  { label: 'scatter', value: 'scatter' }
];

const DEFAULT_STATE = {
  // DATASET
  datasetType: null, // Type of the dataset
  datasetProvider: null, // Name of the provider

  // FIELDS
  fieldsLoaded: false,
  fieldsError: false,

  hasGeoInfo: false, // Whether the dataset includes geographical information
  tableName: null, // Name of the table
  chartLoading: false, // Whether the chart is loading its data/rendering
  initializing: false, // Flag to prevent rendering the vis before the end of the init

  // CHART CONFIG
  chartConfig: null, // Vega chart configuration
  chartConfigError: null, // Error message when fetching the chart configuration
  chartConfigLoading: false, // Whether we're loading the config

  // JIMINY
  jiminy: {},
  jiminyLoaded: false,
  jiminyError: false,

  // LAYERS
  layers: [],
  layersLoaded: false,
  layersError: false,

  // DATASET INFO
  datasetInfoLoaded: false,

  visualizationOptions: [] // Available visualizations
};

/**
 * GANTT TO "LOADED" STATE
 *
 * |-initComponent (1)-|
 *                     ⮑|-restoreWidget (2)-|
 *                     ⮑|-loadData-(3)-----------------------------------------------------------------------------|
 *                       |-getDatasetInfo (4)-|
 *                                            ⮑|-getFields (5)-|
 *                                            |                 ⮑|-getJiminy (6)-|
 *                                            |                 |                  ⮑|-checkEditorRestoredState (7)-|
 *                                            ⮑|-getLayers (8)-|
 *                                                              ⮑|-setVisualizationOptions (9)-|
 *
 * (1) Reset the state of the component and Redux
 * (2) If this.props.widgetId is provided, load the widget info and set Redux' state
 * (3) Get all the information about the dataset to display the UI
 * (4) Get the dataset info (type, provider, etc.), the aliases and descriptions of the fields, the relevant ones
 * (5) Depend on (4). Get the actual list of fields and their types. Filter them according to (4). Not executed
 *     if dataset is a raster.
 * (6) Depend on (5). Get the chart recommendations. Not executed if dataset is a raster.
 * (7) Depend on and (6). Check that the widget is based on fields that still exist and update the fields
 *     aliases and descriptions. Not executed if dataset is a raster.
 * (8) Depend on (4). Get the list of layers.
 * (9) Depend on (5) and (8). Set the defaut vizualization. Executed even if (5) is not.
 */

@DragDropContext(HTML5Backend)
class WidgetEditor extends React.Component {
  constructor(props) {
    super(props);

    // We init the state, store and services
    this.state = this.initComponent(props);
  }

  /**
  * COMPONENT LIFECYCLE
  * - componentWillMount
  * - componentDidMount
  * - componentWillReceiveProps
  * - componentDidUpdate
  */

  componentDidMount() {
    // We load the initial data
    this.loadData(true);

    if (this.props.widgetId) {
      this.restoreWidget(this.props.widgetId);
    }

    if (this.props.provideWidgetConfig) {
      this.props.provideWidgetConfig(this.getWidgetConfig.bind(this));
    }
  }

  componentWillReceiveProps(nextProps) {
    // If the dataset changes...
    if (nextProps.datasetId !== this.props.datasetId || nextProps.widgetId !== this.props.widgetId) {
      this.setState(this.initComponent(nextProps), () => {
        this.loadData();
        if (nextProps.widgetId) {
          this.restoreWidget(nextProps.widgetId);
        }
      });
    } else if (!isEqual(this.props.widgetEditor.layer, nextProps.widgetEditor.layer)) {
      // We update the layerGroups each time the layer changes
      this.setState({
        layerGroups: nextProps.widgetEditor.layer
          ? [{
            dataset: nextProps.widgetEditor.layer.dataset,
            visible: true,
            layers: [{
              id: nextProps.widgetEditor.layer.id,
              active: true,
              ...nextProps.widgetEditor.layer
            }]
          }]
          : []
      });
    }
  }

  componentDidUpdate(previousProps, previousState) {
    // If the configuration of the chart is updated, then we
    // fetch the Vega chart config again
    // NOTE: this can't be moved to componentWillUpdate because
    // this.fetchChartConfig uses the store

    // This is a list of the attributes of the widget editor
    // that don't force a re-rendering of the chart when updated
    // NOTE: the sorting is mandatory to compute if there's been
    // a change or not
    const staticKeys = ['title'].sort();

    // List of the attribute names of the widget editor
    const widgetEditorKeys = Object.keys(Object.assign(
      {},
      previousProps.widgetEditor,
      this.props.widgetEditor
    ));

    // List of the attributes that have changed
    // NOTE: the sorting is mandatory to compute if there's been
    // a change or not
    const updatedWidgetEditorKeys = widgetEditorKeys.filter((key) => {
      const updated = !isEqual(previousProps.widgetEditor[key], this.props.widgetEditor[key]);
      return updated;
    }).sort();

    // Indicate whether only the static keys have been updated
    const onlyStaticKeysUpdated = updatedWidgetEditorKeys.length === staticKeys.length
      && updatedWidgetEditorKeys.every((k, i) => k === staticKeys[i]);

    // Indicate whetger the widgetEditor prop forces a re-render
    const hasChangedWidgetEditor = updatedWidgetEditorKeys.length > 0 && !onlyStaticKeysUpdated;

    if (this.state.datasetInfoLoaded
      && canRenderChart(this.props.widgetEditor, this.state.datasetProvider)
      && this.props.widgetEditor.visualizationType !== 'table'
      && this.props.widgetEditor.visualizationType !== 'map'
      && (hasChangedWidgetEditor || previousState.tableName !== this.state.tableName)
      && !this.state.initializing) {
      this.fetchChartConfig();
    }
  }

  componentWillUnmount() {
    this.props.toggleTooltip(false);

    if (this.props.provideWidgetConfig) {
      this.props.provideWidgetConfig(null);
    }
  }

  /**
   * Event handler executed when the user toggles the
   * visibility of a layer group
   * @param {LayerGroup} layerGroup - Layer group to toggle
   */
  onToggleLayerGroupVisibility(layerGroup) {
    const layerGroups = this.state.layerGroups.map((l) => {
      if (l.dataset !== layerGroup.dataset) return l;
      return Object.assign({}, l, { visible: !layerGroup.visible });
    });

    this.setState({ layerGroups: [...layerGroups] });
  }

  /**
   * Event handler executed when the user clicks the
   * embed button of the map
   */
  onClickShareMap() {
    const layerGroups = [{
      dataset: this.props.widgetEditor.layer.dataset,
      visible: true,
      layers: [{
        id: this.props.widgetEditor.layer.id,
        active: true
      }]
    }];

    const options = {
      children: ShareModalExplore,
      childrenProps: {
        url: window.location.href,
        layerGroups,
        toggleModal: this.props.toggleModal
      }
    };

    this.props.toggleModal(true, options);
  }

  /**
   * Fetch the fields and save them in the state
   * @param {{ metadata: { [name: string]: { alias?: string, description?: string }}, relevantFields: string[] }} fieldsInfo
   * Information about the fields (alias, description, relevant or not)
   * @returns {Promise<{ columnName: string, columnType: string, alias?: string, description?: string }[]>}
   */
  getFields(fieldsInfo) {
    // Functions to resolve and reject the promise
    let resolve;
    let reject;

    // Actual promise
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.setState({ fieldsLoaded: false, fieldsError: false });

    this.datasetService.getFields()
      .then((fields) => {
        const fieldsError = !fields || !fields.length || fields.length === 0;
        this.setState({ fieldsError, fieldsLoaded: true });
        if (fieldsError) throw new Error('The dataset doesn\'t have fields');

        const filteredFields = fields
          .map(f => Object.assign({}, f, fieldsInfo.metadata[f.columnName] || {}))
          .filter(f => !fieldsInfo.relevantFields.length
            || fieldsInfo.relevantFields.indexOf(f.columnName) !== -1);

        this.props.setFields(filteredFields);
        resolve(filteredFields);
      })
      .catch(() => this.setState({ fieldsError: true, fieldsLoaded: true }, resolve([])));

    return promise;
  }

  /**
   * Fetch the information about the layers and save it in the state
   * @returns {Promise<any>}
   */
  getLayers() {
    this.setState({ layersError: false, layersLoaded: false });
    return this.datasetService.getLayers()
      .then(response => new Promise(resolve => this.setState({
        layers: response.map(val => ({
          id: val.id,
          name: val.attributes.name,
          subtitle: val.attributes.subtitle,
          ...val.attributes,
          order: 1,
          hidden: false
        }))
      }, resolve)))
      // TODO: properly handle this in the UI
      .catch((err) => {
        toastr.error('Error', `Unable to fetch the layers${err}`);
        return new Promise(resolve => this.setState({ layersError: true }, resolve));
      })
      .then(() => new Promise(resolve => this.setState({ layersLoaded: true }, resolve)));
  }

  /**
   * Fetch the recommendations from Jiminy and save them in the
   * state
   * @returns {Promise<any>}
   */
  getJiminy(fields) {
    this.setState({ jiminyError: false, jiminyLoaded: false });

    // We get the name of the columns that we can use to build the
    // charts
    const fieldsSt = fields.map(elem => elem.columnName);

    const querySt = `SELECT ${fieldsSt} FROM ${this.props.datasetId} LIMIT 300`;
    return DatasetService.getJiminySuggestions(querySt)
      .then(jiminy => new Promise(resolve => this.setState({ jiminy, jiminyError: typeof jiminy === 'undefined' }, resolve)))
      .catch(() => new Promise(resolve => this.setState({ jiminyError: true }, resolve)))
      .then(() => new Promise(resolve => this.setState({ jiminyLoaded: true }, resolve)));
  }

  /**
   * Fetch the name of the table, the aliases and descriptions
   * of the columns and save all of that in the store
   * Return the info about the fields
   * @returns {Promise<{ metadata: { [name: string]: { alias?: string, description?: string }}, relevantFields: string[] }>}
   */
  getDatasetInfo() {
    return this.datasetService.fetchData('metadata')
      .then(({ attributes }) => { // eslint-disable-line arrow-body-style
        return new Promise((resolve) => {
          const metadata = (attributes.metadata.length && attributes.metadata[0] && attributes.metadata[0].attributes.columns)
            ? attributes.metadata[0].attributes.columns
            : {};

          // Return the metadata's field for the specified column
          const getMetadata = (column, field) =>((metadata && metadata[column])
            ? metadata[column][field]
            : undefined
          );

          // Object that is returned by the function
          // Contains the metadata information associated with
          // the fields, as well as the relevant ones
          const fieldsInfo = {
            metadata: Object.keys(metadata).map(field => ({
              alias: getMetadata(field, 'alias'),
              description: getMetadata(field, 'description'),
            })),
            relevantFields: attributes.widgetRelevantProps
          };

          // If the widget is a raster one, we save the information
          // related to its bands (alias, description, etc.)
          if (attributes.type === 'raster' && metadata) {
            // Here metadata is an object whose keys are names of bands
            // and the values the following:
            // { type: string, alias: string, description: string }
            // NOTE: The object is not exhaustive and it might be empty
            // whereas there are bands
            this.props.setBandsInfo(metadata);
          }

          this.setState({
            datasetInfoLoaded: true,
            tableName: attributes.tableName,
            hasGeoInfo: attributes.geoInfo,
            datasetType: attributes.type,
            datasetProvider: attributes.provider
          }, () => resolve(fieldsInfo));
        });
      })
      // TODO: handle the error case in the UI
      .catch(err => toastr.error('Error', `Unable to load the information about the dataset.`));
  }

  /**
   * Return whether the editor is loading
   * @returns {boolean}
   */
  isLoading() {
    return !this.state.layersLoaded
      || !this.state.fieldsLoaded
      || (!this.state.fieldsError && !this.state.jiminyLoaded);
  }

  /**
   * Return the visualization itself
   * @returns {HTMLElement}
   */
  getVisualization() {
    const {
      tableName,
      chartLoading,
      layersLoaded,
      fieldsError,
      jiminyLoaded,
      datasetProvider
    } = this.state;

    const { widgetEditor, datasetId, selectedVisualizationType } = this.props;
    const { chartType, layer, zoom, latLng } = widgetEditor;

    const chartTitle = (
      <div className="chart-title">
        {getConfig().userToken &&
          <AutosizeInput
            name="widget-title"
            value={widgetEditor.title || ''}
            placeholder="Title..."
            onChange={this.handleTitleChange}
          />
        }
        {!getConfig().userToken &&
          <span>{widgetEditor.title}</span>
        }
      </div>
    );

    let visualization = null;
    switch (selectedVisualizationType) {
      // Vega chart
      case 'chart':
        if (!tableName) {
          visualization = (
            <div className="visualization -chart">
              <Spinner className="-light" isLoading={this.isLoading()} />
              {chartTitle}
            </div>
          );
        } else if (this.state.chartConfigLoading) {
          visualization = (
            <div className="visualization -chart">
              <Spinner className="-light" isLoading />
              {chartTitle}
            </div>
          );
        } else if (this.state.chartConfigError) {
          visualization = (
            <div className="visualization -error">
              {chartTitle}
              <div>
                {'Unfortunately, the chart couldn\'t be rendered'}
                <span>{this.state.chartConfigError}</span>
              </div>
            </div>
          );
        } else if (!canRenderChart(widgetEditor, datasetProvider) || !this.state.chartConfig) {
          visualization = (
            <div className="visualization -chart">
              {chartTitle}
              Select a type of chart and columns
            </div>
          );
        } else if (!getChartType(chartType)) {
          visualization = (
            <div className="visualization -chart">
              {chartTitle}
              {'This chart can\'t be previewed'}
            </div>
          );
        } else {
          visualization = (
            <div className="visualization -chart">
              <Spinner className="-light" isLoading={chartLoading} />
              {chartTitle}
              <VegaChart
                reloadOnResize
                data={this.state.chartConfig}
                theme={ChartTheme()}
                toggleLoading={val => this.setState({ chartLoading: val })}
              />
            </div>
          );
        }
        break;

      // Leaflet map
      case 'map':
        if (layer) {
          const mapConfig = {
            zoom,
            latLng
          };

          visualization = (
            <div className="visualization">
              {chartTitle}
              <Map
                LayerManager={LayerManager}
                mapConfig={mapConfig}
                layerGroups={this.state.layerGroups}
                setMapParams={params => this.props.setMapParams(params)}
              />

              <MapControls>
                <BasemapControl />
              </MapControls>

              <Legend
                layerGroups={this.state.layerGroups}
                className={{ color: '-dark' }}
                toggleLayerGroupVisibility={
                  layerGroup => this.onToggleLayerGroupVisibility(layerGroup)
                }
                setLayerGroupsOrder={() => {}}
                setLayerGroupActiveLayer={() => {}}
                readonly
                interactionDisabled
                expanded={false}
              />
            </div>
          );
        } else {
          visualization = (
            <div className="visualization">
              {chartTitle}
              Select a layer
            </div>
          );
        }
        break;

      case 'raster_chart':
        if (this.state.chartConfigLoading) {
          visualization = (
            <div className="visualization -chart">
              <Spinner className="-light" isLoading />
              {chartTitle}
            </div>
          );
        } else if (this.state.chartConfigError) {
          visualization = (
            <div className="visualization -error">
              {chartTitle}
              <div>
                {'Unfortunately, the chart couldn\'t be rendered'}
                <span>{this.state.chartConfigError}</span>
              </div>
            </div>
          );
        } else if (!this.state.chartConfig || !this.props.band) {
          visualization = (
            <div className="visualization -chart">
              {chartTitle}
              Select a band
            </div>
          );
        } else {
          visualization = (
            <div className="visualization -chart">
              <Spinner className="-light" isLoading={chartLoading} />
              {chartTitle}
              <VegaChart
                reloadOnResize
                data={this.state.chartConfig}
                theme={ChartTheme()}
                toggleLoading={val => this.setState({ chartLoading: val })}
              />
            </div>
          );
        }
        break;

      // HTML table
      case 'table':
        if (!canRenderChart(widgetEditor, datasetProvider)) {
          visualization = (
            <div className="visualization">
              {chartTitle}
              Select a type of chart and columns
            </div>
          );
        } else {
          visualization = (
            <div className="visualization">
              {chartTitle}
              <TableView
                datasetId={datasetId}
                tableName={tableName}
              />
            </div>
          );
        }
        break;

      default:
    }

    return visualization;
  }

  /**
   * Set the available visualization options based on the state of the
   * component and a default option, if possible
   * @param {boolean} resetStore Whether to reset the store (this
   * is used to avoid storing params for a different visualization)
   */
  setVisualizationOptions(resetStore) {
    // We filter out the visualizations that aren't present in
    // this.props.availableVisualizations
    // We don't use this.props.availableVisualizations directly
    // because we want access to the whole object
    let visualizationOptions = VISUALIZATION_TYPES
      .filter(viz => viz.available)
      .filter(viz => this.props.availableVisualizations.includes(viz.value));

    // If there was an error retrieving the fields we remove standard chart and table
    // as visualization options
    if (this.state.fieldsError) {
      visualizationOptions = visualizationOptions.filter(val => val.value === 'map');
    }

    // If there are no layers created for this dataset we remove the map optiion
    // from the options
    if (this.state.layersLoaded
      && (!this.state.layers || (this.state.layers && this.state.layers.length === 0))) {
      visualizationOptions = visualizationOptions.filter(val => val.value !== 'map');
    }

    // In case the dataset is a raster one, we add a special chart option which is
    // different from the other one (the user won't have to choose columns but bands)
    if (this.state.datasetType === 'raster') {
      visualizationOptions = visualizationOptions.filter(val => val.value !== 'chart' && val.value !== 'table');
      visualizationOptions.push(VISUALIZATION_TYPES.find(vis => vis.value === 'raster_chart'));
    }

    let defaultVis = null;
    if (visualizationOptions.find(vis => vis.value === 'chart')) {
      defaultVis = 'chart';
    } else if (visualizationOptions.find(vis => vis.value === 'map')) {
      defaultVis = 'map';
    } else if (visualizationOptions.find(vis => vis.value === 'raster_chart')) {
      defaultVis = 'raster_chart';
    }

    this.setState({ visualizationOptions }, () => {
      if (this.props.selectedVisualizationType === null) {
      // We only set a default visualization if none of them has been set in the past
        // (we don't want to conflict with the "state restoration" made in My RW)
        this.handleVisualizationTypeChange(defaultVis, resetStore);
      }
    });
  }

  /**
   * Event handler executed when the user changes the
   * title of the graph
   * @param {InputEvent} event
   */
  @Autobind
  handleTitleChange(event) {
    const title = event.target.value;
    this.props.setTitle(title);
  }

  /**
   * Initialize the componnent by setting its initial state, resetting
   * the store and instantiating the services
   * The method resolves when the initialization is done
   *
   * @param {object} props Current props
   * @returns {Promise<void>}
   */
  initComponent(props) {
    // First, we init the services
    this.datasetService = new DatasetService(props.datasetId);

    // Each time the editor is opened again, we reset the Redux's state
    // associated with it
    props.resetWidgetEditor();

    // If the there's a layer, we compute the LayerGroup
    // representation
    const layerGroups = [];
    if (props.widgetEditor.layer) {
      layerGroups.push({
        dataset: props.widgetEditor.layer.dataset,
        visible: true,
        layers: [{
          id: props.widgetEditor.layer.id,
          active: true,
          ...props.widgetEditor.layer
        }]
      });
    }

    // Then we reset the state of the component
    return {
      ...DEFAULT_STATE,
      layerGroups
    };
  }

  /**
   * Restore the state of the editor according to the widget
   * @param {string} widgetId Widget ID
   */
  restoreWidget(widgetId) {
    const widgetService = new WidgetService(widgetId);

    widgetService.fetchData()
      .then((data) => {
        console.log(data);
        const { widgetConfig, name } = data.attributes;
        const { paramsConfig, zoom, lat, lng } = widgetConfig;
        const {
          visualizationType,
          band,
          value,
          category,
          color,
          size,
          aggregateFunction,
          orderBy,
          filters,
          limit,
          chartType,
          layer,
          areaIntersection,
          embed
        } = paramsConfig;

        // We restore the type of visualization
        // We default to "chart" to maintain the compatibility with previously created
        // widgets (at that time, only "chart" widgets could be created)
        this.props.setVisualizationType(visualizationType || 'chart');

        if (band) this.props.setBand(band);
        if (layer) this.props.setLayer(layer);
        if (aggregateFunction) this.props.setAggregateFunction(aggregateFunction);
        if (value) this.props.setValue(value);
        if (size) this.props.setSize(size);
        if (color) this.props.setColor(color);
        if (orderBy) this.props.setOrderBy(orderBy);
        if (category) this.props.setCategory(category);
        if (filters) this.props.setFilters(filters);
        if (limit) this.props.setLimit(limit);
        if (chartType) this.props.setChartType(chartType);
        if (areaIntersection) this.props.setAreaIntersection(areaIntersection);
        if (name) this.props.setTitle(name);
        if (zoom) this.props.setZoom(zoom);
        if (lat && lng) this.props.setLatLng({ lat, lng });
        if (embed) this.props.setEmbed(embed);
      });
  }

  /**
   * Load all the initial data needed to render the component and
   * set the available visualization types
   * NOTE: If the initialLoading param is set to true, the widget
   * editor's data saved in the store won't be resetted
   * @param {boolean} [initialLoading=false] Whether this is the inital loading
   */
  loadData(initialLoading = false) {
    let fieldsInfo;

    this.setState({ initializing: true })

    this.getDatasetInfo()
      .then(info => { fieldsInfo = info; })
      .then(() => {
        // This promise basically calls this.getFields but makes
        // sure that if the dataset is a raster, we don't call it
        const getFields = new Promise((resolve, reject) => {
          if (this.state.datasetType === 'raster') {
            this.setState({ fieldsError: false, fieldsLoaded: true }, resolve);
          } else {
            this.getFields(fieldsInfo)
              .then(resolve)
              .catch(reject);
          }
        });

        // This promise basically calls this.getJiminy but makes
        // sure that if the dataset is a raster, we don't call it
        const getJiminy = fields => new Promise((resolve, reject) => {
          if (this.state.datasetType === 'raster') {
            this.setState({ jiminyLoaded: true, jiminyError: false }, resolve);
          } else {
            return this.getJiminy(fields)
              .then(resolve)
              .catch(reject);
          }
        });

        const checkEditorRestoredState = () => {
          if (this.state.datasetType !== 'raster') {
            this.checkEditorRestoredState(fieldsInfo);
          }
        };

        Promise.all([
          getFields
            .then((fields) => {
              getJiminy(fields)
                // If the editor is initially loaded, a previous state might have
                // been restored. In such a case, we make sure the data is still
                // up to date (for example, the aliases)
                .then(() => checkEditorRestoredState())
                .then(() => this.setState({ initializing: false }));
            }),
          this.getLayers()
        ])
          // If this is the inital call to this method (when the component is
          // mounted), we don't want to reset the store because we might set it
          // from the outside when editing an existing widget
          .then(() => this.setVisualizationOptions(!initialLoading));
      });
  }

  /**
   * Check if the restored state of the editor is up to date,
   * if any
   */
  checkEditorRestoredState() {
    const { widgetEditor } = this.props;

    const attrToSetter = {
      category: this.props.setCategory,
      value: this.props.setValue,
      size: this.props.setSize,
      color: this.props.setColor,
      orderBy: this.props.setOrderBy,
      filters: this.props.setFilters
    };

    checkEditorRestoredState(widgetEditor, attrToSetter);
  }

  /**
   * Fetch the Vega chart configuration and store it in
   * the state
   * NOTE: the vega chart *will* contain the whole dataset
   * inside and not the URL of the data
   */
  fetchChartConfig() {
    const { tableName, datasetType, datasetProvider } = this.state;
    const { widgetEditor, datasetId, band } = this.props;

    this.setState({ chartConfigLoading: true, chartConfigError: null });

    const chartInfo = getChartInfo(datasetId, datasetType, datasetProvider, widgetEditor);

    getChartConfig(
      datasetId,
      datasetType,
      tableName,
      band,
      datasetProvider,
      chartInfo,
      true
    )
      .then((chartConfig) => this.setState({ chartConfig }))
      .catch(({ message }) => this.setState({ chartConfig: null, chartConfigError: message }))
      .then(() => this.setState({ chartConfigLoading: false }));
  }

  /**
   * Return the widget config of the widget
   * NOTE: If no widget is rendered, rejects
   * NOTE: this method is public
   * @returns {Promise<object>}
   */
  getWidgetConfig() {
    const { tableName, datasetType, datasetProvider, datasetInfoLoaded } = this.state;
    const { widgetEditor, datasetId, band } = this.props;

    if (!datasetInfoLoaded || !canRenderChart(widgetEditor, datasetProvider)) {
      return new Promise((_, reject) => reject());
    }

    return getWidgetConfig(datasetId, datasetType, datasetProvider, tableName, widgetEditor);
  }

  @Autobind
  handleEmbedTable() {
    const { tableName } = this.state;
    const { datasetId, widgetEditor } = this.props;
    const { filters, fields, value, aggregateFunction, category, orderBy,
      limit, areaIntersection } = widgetEditor;
    const aggregateFunctionExists = aggregateFunction && aggregateFunction !== 'none';

    const arrColumns = fields.filter(val => val.columnName !== 'cartodb_id' && val.columnType !== 'geometry').map(
      (val) => {
        if (value && value.name === val.columnName && aggregateFunctionExists) {
          // Value
          return { value: val.columnName, key: val.columnName, aggregateFunction, group: false };
        } else if (category && category.name === val.columnName && aggregateFunctionExists) {
          // Category
          return { value: val.columnName, key: val.columnName, group: true };
        } else { // eslint-disable-line
          // Rest of columns
          return {
            value: val.columnName,
            key: val.columnName,
            remove: aggregateFunctionExists
          };
        }
      }
    ).filter(val => !val.remove);

    const orderByColumn = orderBy ? [orderBy] : [];
    if (orderByColumn.length > 0 && value && orderByColumn[0].name === value.name && aggregateFunction && aggregateFunction !== 'none') {
      orderByColumn[0].name = `${aggregateFunction}(${value.name})`;
    }

    const geostore = areaIntersection ? `&geostore=${areaIntersection}` : '';

    const sortOrder = orderBy ? orderBy.orderType : 'asc';
    const query = `${getQueryByFilters(tableName, filters, arrColumns, orderByColumn, sortOrder)} LIMIT ${limit}`;
    const queryURL = `${getConfig().url}/query/${datasetId}?sql=${query}${geostore}`;

    const options = {
      children: EmbedTableModal,
      childrenProps: {
        url: window.location.href,
        queryURL,
        toggleModal: this.props.toggleModal
      }
    };

    this.props.toggleModal(true, options);
  }

  /**
   * Change the selected visualization in the state
   * @param {string} selectedVisualizationType Visualization type
   * @param {boolean} [resetStore=true] Whether to reset the store (this
   * is used to avoid storing params for a different visualization)
   */
  @Autobind
  handleVisualizationTypeChange(selectedVisualizationType, resetStore = true) {
    // If we don't reset the widget editor before changing the
    // type of visualization, then the store might contain
    // information relative to the old one (for example: the band,
    // the layer, etc) which might interfere with other part
    // of the app (for example, My RW)
    if (resetStore) this.props.resetWidgetEditor(false);

    this.props.setVisualizationType(selectedVisualizationType);
  }

  /**
   * Handler for when the save/update button of the editors
   * is clicked
   */
  onClickSave() {
    if (this.props.onSave) this.props.onSave();
  }

  render() {
    const {
      tableName,
      jiminy,
      jiminyError,
      jiminyLoaded,
      fieldsError,
      fieldsLoaded,
      layersError,
      layersLoaded,
      layers,
      datasetType,
      datasetProvider,
      visualizationOptions,
      hasGeoInfo
    } = this.state;

    const {
      datasetId,
      widgetId,
      saveButtonMode,
      showNotLoggedInText,
      selectedVisualizationType
    } = this.props;

    const editorMode = !widgetId ? 'save' : 'update';
    const showSaveButton = saveButtonMode === 'always'
      || (saveButtonMode === 'auto' && !!getConfig().userToken);

    const visualization = this.getVisualization();

    // TODO: instead of hiding the whole UI, let's show an error message or
    // some kind of feedback for the user
    // If the dataset is a raster, the fields won't load and it's possible
    // we don't have layer either so the editor should show anyway
    const componentShouldNotShow = datasetType !== 'raster'
      && fieldsError
      && (layersError || (layers && layers.length === 0));

    if (componentShouldNotShow) {
      return <div className="c-widget-editor" />;
    }

    // TODO: could be saved in the state instead of computing it
    // each time
    let chartOptions = CHART_TYPES;
    if (!jiminyError && jiminyLoaded && datasetType !== 'raster') {
      chartOptions = jiminy.general.map(val => ({ label: val, value: val }));
    }

    return (
      <div className="c-widget-editor">
        <div className="customize-visualization">
          { this.isLoading() && <Spinner className="-light" isLoading /> }
          <h2
            className="title"
          >
            Customize Visualization
          </h2>
          <div className="visualization-type">
            <div className="c-field">
              <label htmlFor="visualization-type-select">
                Visualization type
              </label>
              <Select
                id="visualization-type-select"
                properties={{
                  className: 'visualization-type-selector',
                  name: 'visualization-type',
                  value: selectedVisualizationType
                }}
                options={visualizationOptions}
                onChange={value => this.handleVisualizationTypeChange(value, false)}
              />
            </div>
          </div>
          {
            (selectedVisualizationType === 'chart' ||
            selectedVisualizationType === 'table')
              && !fieldsError && tableName && datasetProvider !== 'nexgddp'
              && (
                <ChartEditor
                  datasetId={datasetId}
                  datasetType={datasetType}
                  datasetProvider={datasetProvider}
                  chartOptions={chartOptions}
                  tableName={tableName}
                  tableViewMode={selectedVisualizationType === 'table'}
                  mode={editorMode}
                  showSaveButton={showSaveButton}
                  onSave={() => this.onClickSave()}
                  hasGeoInfo={hasGeoInfo}
                  onEmbedTable={this.handleEmbedTable}
                />
              )
          }
          {
            (selectedVisualizationType === 'chart' ||
            selectedVisualizationType === 'table')
              && !fieldsError && tableName && datasetProvider === 'nexgddp'
              && (
                <NEXGDDPEditor
                  datasetId={datasetId}
                  datasetType={datasetType}
                  datasetProvider={datasetProvider}
                  chartOptions={chartOptions}
                  tableName={tableName}
                  tableViewMode={selectedVisualizationType === 'table'}
                  mode={editorMode}
                  showSaveButton={showSaveButton}
                  onSave={() => this.onClickSave()}
                  hasGeoInfo={hasGeoInfo}
                  onEmbedTable={this.handleEmbedTable}
                />
              )
          }
          {
            selectedVisualizationType === 'map'
              && layers && layers.length > 0
              && tableName
              && datasetProvider
              && (
                <MapEditor
                  datasetId={datasetId}
                  tableName={tableName}
                  provider={datasetProvider}
                  datasetType={datasetType}
                  layerGroups={this.state.layerGroups}
                  layers={layers}
                  mode={editorMode}
                  showSaveButton={showSaveButton}
                  onSave={() => this.onClickSave()}
                />
              )
          }
          {
            selectedVisualizationType === 'raster_chart'
              && tableName
              && datasetProvider
              && (
                <RasterChartEditor
                  datasetId={datasetId}
                  tableName={tableName}
                  provider={datasetProvider}
                  mode={editorMode}
                  hasGeoInfo={hasGeoInfo}
                  showSaveButton={showSaveButton}
                  onSave={() => this.onClickSave()}
                />
              )
          }
        </div>
        {visualization}
      </div>
    );
  }
}

const mapStateToProps = ({ widgetEditor }) => ({
  widgetEditor,
  selectedVisualizationType: widgetEditor.visualizationType,
  band: widgetEditor.band
});

const mapDispatchToProps = dispatch => ({
  resetWidgetEditor: hardReset => dispatch(resetWidgetEditor(hardReset)),
  setFields: (fields) => { dispatch(setFields(fields)); },
  setBandsInfo: bands => dispatch(setBandsInfo(bands)),
  setVisualizationType: vis => dispatch(setVisualizationType(vis)),
  toggleModal: (open, options) => dispatch(toggleModal(open, options)),
  setTitle: title => dispatch(setTitle(title)),
  setMapParams: (params) => {
    dispatch(setZoom(params.zoom));
    dispatch(setLatLng(params.latLng));
  },
  setFilters: filter => dispatch(setFilters(filter)),
  setColor: filter => dispatch(setColor(filter)),
  setCategory: filter => dispatch(setCategory(filter)),
  setValue: filter => dispatch(setValue(filter)),
  setSize: filter => dispatch(setSize(filter)),
  setOrderBy: filter => dispatch(setOrderBy(filter)),
  setBand: (...params) => dispatch(setBand(...params)),
  setLayer: (...params) => dispatch(setLayer(...params)),
  setAggregateFunction: (...params) => dispatch(setAggregateFunction(...params)),
  setLimit: (...params) => dispatch(setLimit(...params)),
  setChartType: (...params) => dispatch(setChartType(...params)),
  setAreaIntersection: (...params) => dispatch(setAreaIntersection(...params)),
  setEmbed: (...params) => dispatch(setEmbed(...params))
});

WidgetEditor.propTypes = {
  /**
   * Dataset ID
   */
  datasetId: PropTypes.string.isRequired,
  /**
   * Widget ID (if the editor is used to edit an existing  widget)
   */
  widgetId: PropTypes.string,
  /**
   * List of visualizations that are available to the widget editor
   */
  availableVisualizations: PropTypes.arrayOf(
    PropTypes.oneOf(VISUALIZATION_TYPES.map(viz => viz.value))
  ),
  /**
   * When to show the save/update button in the editor:
   *  * "auto": only if a user token is set in ConfigHelper
   *  * "always": always shown
   *  * "never": never shown
   */
  saveButtonMode: PropTypes.oneOf(['auto', 'always', 'never']),
  /**
   * Callback executed when the user clicks the save/update button
   */
  onSave: PropTypes.func,
  /**
   * Callback executed at mounting time to provide a function
   * to get the widget config
   */
  provideWidgetConfig: PropTypes.func,
  // Store
  band: PropTypes.object,
  widgetEditor: PropTypes.object.isRequired,
  modal: PropTypes.object,
  resetWidgetEditor: PropTypes.func.isRequired,
  setFields: PropTypes.func.isRequired,
  setVisualizationType: PropTypes.func.isRequired,
  selectedVisualizationType: PropTypes.string,
  toggleModal: PropTypes.func,
  setBandsInfo: PropTypes.func,
  setTitle: PropTypes.func,
  setMapParams: PropTypes.func,
  setFilters: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setColor: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setCategory: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setValue: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setSize: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setOrderBy: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setBand: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setLayer: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setAggregateFunction: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setLimit: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setChartType: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setAreaIntersection: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  setEmbed: PropTypes.func // eslint-disable-line react/no-unused-prop-types
};

WidgetEditor.defaultProps = {
  saveButtonMode: 'auto',
  availableVisualizations: VISUALIZATION_TYPES.map(viz => viz.value)
};

export default connect(mapStateToProps, mapDispatchToProps)(WidgetEditor);
