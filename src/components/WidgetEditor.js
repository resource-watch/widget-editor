import React from 'react';
import PropTypes from 'prop-types';
import HTML5Backend from 'react-dnd-html5-backend';
import Autobind from 'autobind-decorator';
import { DragDropContext } from 'react-dnd';
import isEqual from 'lodash/isEqual';
import { toastr } from 'react-redux-toastr';
import AutosizeInput from 'react-input-autosize';
import classnames from 'classnames';
import { Legend, LegendItemTypes, Icons } from 'wri-api-components';

// Redux
import { connect } from 'react-redux';
import {
  resetWidgetEditor,
  setFields,
  setBandsInfo,
  setVisualizationType,
  setTitle,
  setCaption,
  setZoom,
  setLatLng,
  setBounds,
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
  setDatasetId,
  setTableName,
  setContracted,
  setBasemap,
  setLabels,
  setBoundaries
} from 'reducers/widgetEditor';
import { toggleModal } from 'reducers/modal';
import { toggleTooltip } from 'reducers/tooltip';

// Services
import DatasetService from 'services/DatasetService';
import WidgetService from 'services/WidgetService';

// Components
import Spinner from 'components/ui/Spinner';
import VegaChart from 'components/chart/VegaChart';
import Map from 'components/map/Map';
import MapControls from 'components/map/MapControls';
import BasemapControl from 'components/map/controls/BasemapControl';
import TableView from 'components/table/TableView';
import Icon from 'components/ui/Icon';

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

const VISUALIZATION_TYPES = [
  { label: 'Chart', value: 'chart', available: true },
  { label: 'Chart', value: 'raster_chart', available: false },
  { label: 'Map', value: 'map', available: true },
  { label: 'Table', value: 'table', available: true }
];

const CHART_TYPES = [
  { label: 'Bar', value: 'bar' },
  { label: 'Line', value: 'line' },
  { label: 'Pie', value: 'pie' },
  { label: 'Scatter', value: 'scatter' }
  // { label: '1d_scatter', value: '1d_scatter' },
  // { label: '1d_tick', value: '1d_tick' }
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
 *                                            |                 ⮑|-checkEditorRestoredState (7)-|
 *                                            ⮑|-getLayers (8)-|
 *                                                              ⮑|-setVisualizationOptions (9)-|
 *
 * (1) Reset the state of the component and Redux
 * (2) If this.props.widgetId is provided, load the widget info and set Redux' state
 * (3) Get all the information about the dataset to display the UI
 * (4) Get the dataset info (type, provider, etc.), the aliases and descriptions of the fields, the relevant ones
 * (5) Depend on (4). Get the actual list of fields and their types. Filter them according to (4). Not executed
 *     if dataset is a raster.
 * (7) Depend on and (5). Check that the widget is based on fields that still exist and update the fields
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

    // We set the default position of the map according
    // to the external prop
    this.setDefaultMapState(props);

    // If the title is controlled from the outside and
    // has a value, then we set it in the store
    if (props.widgetTitle) {
      props.setTitle(props.widgetTitle);
    }

    // If the caption is controlled from the outside and
    // has a value, then we set it in the store
    if (props.widgetCaption) {
      props.setCaption(props.widgetCaption);
    }
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

    this.props.setDatasetId(this.props.datasetId);

    if (this.props.widgetId) {
      this.restoreWidget(this.props.widgetId);
    }

    if (this.props.provideWidgetConfig) {
      this.props.provideWidgetConfig(this.getWidgetConfig.bind(this));
    }
  }

  componentWillReceiveProps(nextProps) {
    // If the default state of the map is updated...
    if (!isEqual(this.props.mapConfig, nextProps.mapConfig)) {
      this.setDefaultMapState(nextProps);
    }

    // If the dataset changes...
    if (nextProps.datasetId !== this.props.datasetId
      || nextProps.widgetId !== this.props.widgetId) {
      this.setState(this.initComponent(nextProps), () => {
        this.loadData();
        this.props.setDatasetId(this.props.datasetId);
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

    // If the title is controlled from the outside and
    // its value has changed, then we update the store
    if (this.props.widgetTitle !== nextProps.widgetTitle) {
      this.props.setTitle(nextProps.widgetTitle);
    }

    // If the caption is controlled from the outside and
    // its value has changed, then we update the store
    if (this.props.widgetCaption !== nextProps.widgetCaption) {
      this.props.setCaption(nextProps.widgetCaption);
    }

    // Whenever the title changes, we call the callback
    if (this.props.widgetEditor.title !== nextProps.widgetEditor.title
      && this.props.onChangeWidgetTitle) {
      this.props.onChangeWidgetTitle(nextProps.widgetEditor.title);
    }

    // Whenever the caption changes, we call the callback
    if (this.props.widgetEditor.caption !== nextProps.widgetEditor.caption
      && this.props.onChangeWidgetCaption) {
      this.props.onChangeWidgetCaption(nextProps.widgetEditor.caption);
    }
  }

  componentDidUpdate(previousProps, previousState) {
    // If the configuration of the chart is updated, then we
    // fetch the Vega chart config again
    // NOTE: this can't be moved to componentWillUpdate because
    // this.fetchChartConfig uses the store

    // This is a list of the attributes of the widget editor
    // that don't force a re-rendering of the chart when updated
    const staticKeys = ['title', 'caption'];

    // List of the attribute names of the widget editor
    const widgetEditorKeys = Object.keys(Object.assign(
      {},
      previousProps.widgetEditor,
      this.props.widgetEditor
    ));

    // List of the attributes that have changed
    const updatedWidgetEditorKeys = widgetEditorKeys.filter((key) => {
      const updated = !isEqual(previousProps.widgetEditor[key], this.props.widgetEditor[key]);
      return updated;
    });

    // Indicate whether only the static keys have been updated
    const onlyStaticKeysUpdated = updatedWidgetEditorKeys
      .every(key => staticKeys.indexOf(key) !== -1);

    // Indicate whetger the widgetEditor prop forces a re-render
    const hasChangedWidgetEditor = updatedWidgetEditorKeys.length > 0 && !onlyStaticKeysUpdated;

    if (this.state.datasetInfoLoaded
      && canRenderChart(this.props.widgetEditor, this.state.datasetProvider)
      && this.props.widgetEditor.visualizationType !== 'table'
      && this.props.widgetEditor.visualizationType !== 'map'
      && (hasChangedWidgetEditor || previousState.tableName !== this.state.tableName
        || previousState.initializing !== this.state.initializing)
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
   * Handler for when the save/update button of the editors
   * is clicked
   */
  onClickSave() {
    if (this.props.onSave) this.props.onSave();
  }

  /**
   * Handler for when the embed button of the editors is
   * clicked
   */
  onClickEmbed() {
    if (this.props.onEmbed) this.props.onEmbed();
  }

  /**
   * Set the default state of the map
   * @param {object} props Props of the component
   */
  setDefaultMapState(props) {
    if (props.mapConfig) {
      const { zoom, lat, lng } = props.mapConfig;
      this.props.setMapParams({
        zoom,
        latLng: { lat, lng }
      });
    }
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
   * Fetch the name of the table, the aliases and descriptions
   * of the columns and save all of that in the store
   * Return the info about the fields
   * @returns {Promise<{ metadata: { [name: string]: { alias?: string, description?: string }}, relevantFields: string[] }>}
   */
  getDatasetInfo() {
    return this.datasetService.fetchData('widget, metadata')
      .then(({ attributes }) => { // eslint-disable-line arrow-body-style
        return new Promise((resolve) => {
          const metadata = ((attributes.metadata.length && attributes.metadata[0]
            && attributes.metadata[0].attributes.columns))
            ? attributes.metadata[0].attributes.columns
            : {};

          // Return the metadata's field for the specified column
          const getMetadata = (column, field) => ((metadata && metadata[column])
            ? metadata[column][field]
            : undefined
          );

          // Object that is returned by the function
          // Contains the metadata information associated with
          // the fields, as well as the relevant ones
          const fieldsInfo = {
            metadata: Object.keys(metadata).reduce((res, field) => Object.assign(res, {
              [field]: {
                alias: getMetadata(field, 'alias'),
                description: getMetadata(field, 'description')
              }
            }), {}),
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

          const defaultWidget = attributes.widget && attributes.widget.length &&
            attributes.widget.find(w => w.attributes.defaultEditableWidget);

          this.props.setTableName(attributes.tableName);

          this.setState({
            datasetInfoLoaded: true,
            tableName: attributes.tableName,
            hasGeoInfo: attributes.geoInfo,
            datasetType: attributes.type,
            datasetProvider: attributes.provider,
            defaultWidget
          }, () => resolve(fieldsInfo));
        });
      })
      // TODO: handle the error case in the UI
      .catch((err) => {
        console.error(err);
        toastr.error('Error', 'Unable to load the information about the dataset.');
      });
  }

  /**
   * Return the visualization itself
   * @returns {HTMLElement}
   */
  getVisualization() {
    const {
      tableName,
      chartLoading,
      datasetProvider
    } = this.state;

    const { widgetEditor, datasetId, selectedVisualizationType, theme } = this.props;
    const { chartType, layer, zoom, latLng, bounds, title, caption,
      visualizationType, basemapLayers } = widgetEditor;

    let chartTitle = <div>{title}</div>;
    if (this.props.titleMode === 'always'
      || (this.props.titleMode === 'auto' && getConfig().userToken)) {
      chartTitle = (
        <AutosizeInput
          name="widget-title"
          value={title || ''}
          placeholder="Widget title"
          onChange={this.handleTitleChange}
        />
      );
    }

    let chartCaption = <div>{caption}</div>;
    if (this.props.titleMode === 'always'
      || (this.props.titleMode === 'auto' && getConfig().userToken)) {
      chartCaption = (
        <AutosizeInput
          name="widget-caption"
          value={caption || ''}
          placeholder="Caption"
          onChange={this.handleCaptionChange}
        />
      );
    }

    const titleCaption = (
      <div
        className={classnames('chart-title', {
          '-light': visualizationType === 'map' && (basemapLayers.basemap === 'dark' || basemapLayers.basemap === 'satellite')
        })}
      >
        {chartTitle}
        {chartCaption}
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
              {titleCaption}
            </div>
          );
        } else if (this.state.chartConfigLoading) {
          visualization = (
            <div className="visualization -chart">
              <Spinner className="-light" isLoading />
              {titleCaption}
            </div>
          );
        } else if (this.state.chartConfigError) {
          visualization = (
            <div className="visualization -error">
              {titleCaption}
              <div>
                {'Unfortunately, the chart couldn\'t be rendered'}
                <span>{this.state.chartConfigError}</span>
              </div>
            </div>
          );
        } else if (!canRenderChart(widgetEditor, datasetProvider) || !this.state.chartConfig) {
          visualization = (
            <div className="visualization -chart">
              {titleCaption}
              Select a type of chart and columns
            </div>
          );
        } else if (!getChartType(chartType)) {
          visualization = (
            <div className="visualization -chart">
              {titleCaption}
              {'This chart can\'t be previewed'}
            </div>
          );
        } else {
          visualization = (
            <div className="visualization -chart">
              <Spinner className="-light" isLoading={chartLoading} />
              {titleCaption}
              <VegaChart
                reloadOnResize
                data={this.state.chartConfig}
                theme={theme}
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
            latLng,
            bounds
          };

          visualization = (
            <div className="visualization">
              {titleCaption}
              <Map
                LayerManager={LayerManager}
                mapConfig={mapConfig}
                layerGroups={this.state.layerGroups}
                setMapParams={params => this.props.setMapParams(params)}
              />

              <MapControls>
                <BasemapControl />
              </MapControls>

              <div className="c-we-legend-map">
                <Icons />
                <Legend
                  layerGroups={this.state.layerGroups}
                  expanded={false}
                  sortable={false}
                  maxHeight={250}
                  LegendItemTypes={<LegendItemTypes />}
                />
              </div>
            </div>
          );
        } else {
          visualization = (
            <div className="visualization">
              {titleCaption}
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
              {titleCaption}
            </div>
          );
        } else if (this.state.chartConfigError) {
          visualization = (
            <div className="visualization -error">
              {titleCaption}
              <div>
                {'Unfortunately, the chart couldn\'t be rendered'}
                <span>{this.state.chartConfigError}</span>
              </div>
            </div>
          );
        } else if (!this.state.chartConfig || !this.props.band) {
          visualization = (
            <div className="visualization -chart">
              {titleCaption}
              Select a band
            </div>
          );
        } else {
          visualization = (
            <div className="visualization -chart">
              <Spinner className="-light" isLoading={chartLoading} />
              {titleCaption}
              <VegaChart
                reloadOnResize
                data={this.state.chartConfig}
                theme={theme}
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
              {titleCaption}
              Select a type of chart and columns
            </div>
          );
        } else {
          visualization = (
            <div className="visualization">
              {titleCaption}
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
      // WMS dataset aren't attached to any table so they can only
      // be represented as maps
      if (this.state.datasetProvider !== 'wms') {
        visualizationOptions.push(VISUALIZATION_TYPES.find(vis => vis.value === 'raster_chart'));
      }
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
   * Fetch the fields and save them in the state
   * @param {{ metadata: { [name: string]: { alias?: string, description?: string }}, relevantFields: string[] }} fieldsInfo
   * Information about the fields (alias, description, relevant or not)
   * @returns {Promise<{ columnName: string, columnType: string, alias?: string, description?: string }[]>}
   */
  getFields(fieldsInfo) {
    // Function to resolve the promise
    let resolve;

    // Actual promise
    const promise = new Promise((res) => { resolve = res; });

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
   * Return the widget config of the widget
   * NOTE: If no widget is rendered, rejects
   * NOTE: this method is public
   * @returns {Promise<object>}
   */
  getWidgetConfig() {
    const { tableName, datasetType, datasetProvider, datasetInfoLoaded } = this.state;
    const { widgetEditor, datasetId } = this.props;

    if (!datasetInfoLoaded || !canRenderChart(widgetEditor, datasetProvider)) {
      return new Promise((_, reject) => reject());
    }

    return getWidgetConfig(datasetId, datasetType, datasetProvider, tableName, widgetEditor);
  }

  /**
   * Fetch the Vega chart configuration and store it in
   * the state
   * NOTE: the vega chart *will* contain the whole dataset
   * inside and not the URL of the data
   * NOTE 2: only update the state with the result of the
   * latest query
   */
  fetchChartConfig() {
    const { tableName, datasetType, datasetProvider } = this.state;
    const { widgetEditor, datasetId, band } = this.props;

    // We store in the instance the ID of the last time
    // this method has been called
    if (!this.lastRequestId) {
      this.lastRequestId = 0;
    }

    // Each time the method gets called, we increment the
    // ID and save it locally so if getChartConfig resolves
    // after this method has been called once again, we will
    // discard the result
    // The aim is to consistently show the result of the user's
    // last interaction
    const requestId = ++this.lastRequestId;

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
      .then(chartConfig => new Promise((resolve) => {
        // If the ID of the last request is different than the
        // current one, then we discard the result
        if (requestId === this.lastRequestId) {
          this.setState({ chartConfig }, resolve);
        } else {
          resolve();
        }
      }))
      .catch(({ message }) => this.setState({ chartConfig: null, chartConfigError: message }))
      .then(() => {
        if (requestId === this.lastRequestId) {
          this.setState({ chartConfigLoading: false });
        }
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
   * Load all the initial data needed to render the component and
   * set the available visualization types
   * NOTE: If the initialLoading param is set to true, the widget
   * editor's data saved in the store won't be resetted
   * @param {boolean} [initialLoading=false] Whether this is the inital loading
   */
  loadData(initialLoading = false) {
    let fieldsInfo;

    this.setState({ initializing: true });

    this.getDatasetInfo()
      .then((info) => { fieldsInfo = info; })
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

        const checkEditorRestoredState = () => { // eslint-disable-line no-shadow
          if (this.state.datasetType !== 'raster') {
            this.checkEditorRestoredState(fieldsInfo);
          }
        };

        Promise.all([
          getFields
            .then(() => {
              // If the editor is initially loaded, a previous state might have
              // been restored. In such a case, we make sure the data is still
              // up to date (for example, the aliases)
              checkEditorRestoredState();
              this.setState({ initializing: false });
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
   * Restore the state of the editor according to the widget
   * @param {string} widgetId Widget ID
   */
  restoreWidget(widgetId) {
    const widgetService = new WidgetService(widgetId);

    widgetService.fetchData('metadata')
      .then((data) => {
        const { widgetConfig, name, metadata } = data.attributes;
        const { paramsConfig, zoom, lat, lng, bbox, basemapLayers } = widgetConfig;
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
          areaIntersection
        } = paramsConfig;

        let caption;
        if (metadata && metadata.length && metadata[0].attributes.info
          && metadata[0].attributes.info.caption) {
          caption = metadata[0].attributes.info.caption;
        }

        // We restore the type of visualization
        // We default to "chart" to maintain the compatibility with previously created
        // widgets (at that time, only "chart" widgets could be created)
        this.props.setVisualizationType(visualizationType || 'chart');

        if (band) this.props.setBand(band);
        if (layer) {
          // layer is a string but we need the actual API's object
          this.datasetService.getLayer(layer)
            .then(l => this.props.setLayer(Object.assign({}, l, { ...l.attributes })));
        }
        if (value) this.props.setValue(value);
        // NOTE: the aggregation must be restored after the value
        // because when the value changes, the aggregation is reset
        if (aggregateFunction) this.props.setAggregateFunction(aggregateFunction);
        if (size) this.props.setSize(size);
        if (color) this.props.setColor(color);
        if (orderBy) this.props.setOrderBy(orderBy);
        if (category) this.props.setCategory(category);
        if (filters) this.props.setFilters(filters);
        if (limit) this.props.setLimit(limit);
        if (chartType) this.props.setChartType(chartType);
        if (areaIntersection) this.props.setAreaIntersection(areaIntersection);
        if (name) this.props.setTitle(name);
        if (caption) this.props.setCaption(caption);
        if (zoom) this.props.setZoom(zoom);
        if (lat && lng) this.props.setLatLng({ lat, lng });
        if (bbox) this.props.setBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
        if (basemapLayers) {
          if (basemapLayers.basemap) this.props.setBasemap(basemapLayers.basemap);
          if (basemapLayers.labels !== undefined) this.props.setLabels(basemapLayers.labels);
          if (basemapLayers.boundaries !== undefined && basemapLayers.boundaries !== null) {
            this.props.setBoundaries(basemapLayers.boundaries);
          }
        }
      });
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

    // We also reset the default map state
    this.setDefaultMapState(props);

    // We contract/expand the let panel
    this.props.setContracted(this.props.contracted);

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
   * Event handler executed when the user changes the
   * caption of the graph
   * @param {InputEvent} event
   */
  @Autobind
  handleCaptionChange(event) {
    const caption = event.target.value;
    this.props.setCaption(caption);
    if (this.props.onChangeWidgetCaption) {
      this.props.onChangeWidgetCaption(caption);
    }
  }

  /**
   * Return whether the editor is loading
   * @returns {boolean}
   */
  isLoading() {
    return !this.state.layersLoaded
      || !this.state.fieldsLoaded
      || this.state.fieldsError;
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
    if (resetStore) {
      this.props.resetWidgetEditor(false);
      this.setDefaultMapState(this.props);
    }

    this.props.setVisualizationType(selectedVisualizationType);
  }

  render() {
    const {
      tableName,
      fieldsError,
      layersError,
      layers,
      datasetType,
      datasetProvider,
      visualizationOptions,
      hasGeoInfo,
      defaultWidget
    } = this.state;

    const {
      datasetId,
      widgetId,
      saveButtonMode,
      embedButtonMode,
      selectedVisualizationType,
      widgetEditor
    } = this.props;

    const editorMode = !widgetId ||
      (defaultWidget && defaultWidget.id === widgetId) ? 'save' : 'update';
    const showSaveButton = saveButtonMode === 'always'
      || (saveButtonMode === 'auto' && !!getConfig().userToken);
    const showEmbedButton = embedButtonMode === 'always'
      || (embedButtonMode === 'auto' && !!getConfig().userToken);

    const mapButtonClassName = classnames({
      '-active': selectedVisualizationType === 'map'
    });
    const tableButtonClassName = classnames({
      '-active': selectedVisualizationType === 'table'
    });
    const chartButtonClassName = classnames({
      '-active': selectedVisualizationType === 'chart'
    });

    const visualization = this.getVisualization();

    // TODO: instead of hiding the whole UI, let's show an error message or
    // some kind of feedback for the user
    // If the dataset is a raster, the fields won't load and it's possible
    // we don't have layer either so the editor should show anyway
    const componentShouldNotShow = datasetType !== 'raster'
      && fieldsError
      && (layersError || (layers && layers.length === 0));

    if (componentShouldNotShow) {
      return <div className="c-we-widget-editor" />;
    }

    return (
      <div className="c-we-widget-editor">
        <div className={classnames('customize-visualization', { '-contracted': widgetEditor.contracted })}>
          <button
            type="button"
            className={classnames('btn-toggle', { '-contracted': widgetEditor.contracted })}
            onClick={() => this.props.setContracted(!widgetEditor.contracted)}
            aria-label="Toggle panel"
          >
            <Icon name="icon-arrow-left" />
          </button>
          <div className="content">
            { this.isLoading() && <Spinner className="-light" isLoading /> }
            <h2
              className="title"
            >
              Customize Visualization
            </h2>
            <div className="visualization-type-buttons">
              {visualizationOptions.find(v => v.value === 'chart') &&
                <button
                  type="button"
                  onClick={() => this.handleVisualizationTypeChange('chart', false)}
                  className={chartButtonClassName}
                >
                  Chart
                </button>
              }
              {visualizationOptions.find(v => v.value === 'map') &&
                <button
                  type="button"
                  onClick={() => this.handleVisualizationTypeChange('map', false)}
                  className={mapButtonClassName}
                >
                  Map
                </button>
              }
              {visualizationOptions.find(v => v.value === 'table') &&
                <button
                  type="button"
                  onClick={() => this.handleVisualizationTypeChange('table', false)}
                  className={tableButtonClassName}
                >
                  Table
                </button>
              }
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
                    chartOptions={CHART_TYPES}
                    tableName={tableName}
                    tableViewMode={selectedVisualizationType === 'table'}
                    mode={editorMode}
                    showSaveButton={showSaveButton}
                    showEmbedButton={showEmbedButton}
                    onSave={() => this.onClickSave()}
                    onEmbed={() => this.onClickEmbed()}
                    hasGeoInfo={hasGeoInfo}
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
                    chartOptions={CHART_TYPES}
                    tableName={tableName}
                    tableViewMode={selectedVisualizationType === 'table'}
                    mode={editorMode}
                    showSaveButton={showSaveButton}
                    showEmbedButton={showEmbedButton}
                    onSave={() => this.onClickSave()}
                    onEmbed={() => this.onClickEmbed()}
                    hasGeoInfo={hasGeoInfo}
                  />
                )
            }
            {
              selectedVisualizationType === 'map'
                && layers && layers.length > 0
                && datasetProvider
                && (
                  <MapEditor
                    datasetId={datasetId}
                    widgetId={widgetId}
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
  toggleTooltip: (...params) => dispatch(toggleTooltip(...params)),
  setTitle: title => dispatch(setTitle(title)),
  setCaption: caption => dispatch(setCaption(caption)),
  setMapParams: ({ zoom, latLng, bounds }) => {
    dispatch(setZoom(zoom));
    dispatch(setLatLng(latLng));
    if (bounds) dispatch(setBounds(bounds));
  },
  setZoom: (...params) => dispatch(setZoom(...params)),
  setLatLng: (...params) => dispatch(setLatLng(...params)),
  setBounds: (...params) => dispatch(setBounds(...params)),
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
  setDatasetId: (...params) => dispatch(setDatasetId(...params)),
  setTableName: (...params) => dispatch(setTableName(...params)),
  setContracted: (...params) => dispatch(setContracted(...params)),
  setBasemap: (...params) => dispatch(setBasemap(...params)),
  setLabels: (...params) => dispatch(setLabels(...params)),
  setBoundaries: (...params) => dispatch(setBoundaries(...params))
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
   * Widget title (if the editor is used to edit an existing  widget)
   */
  widgetTitle: PropTypes.string,
  /**
   * Widget caption (if the editor is used to edit an existing  widget)
   */
  widgetCaption: PropTypes.string,
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
   * When to show the embed button in the editor:
   *  * "auto": only if a user token is set in ConfigHelper
   *  * "always": always shown
   *  * "never": never shown
   */
  embedButtonMode: PropTypes.oneOf(['auto', 'always', 'never']),
  /**
   * When to make the title editable in the editor:
   *  * "auto": only if a user token is set in ConfigHelper
   *  * "always": always editable
   *  * "never": never
   */
  titleMode: PropTypes.oneOf(['auto', 'always', 'never']),
  /**
   * Set the default state of the map for geographical
   * widgets
   */
  mapConfig: PropTypes.shape({
    zoom: PropTypes.number,
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  /**
   * Initially display the editor with its left panel contracted
   */
  contracted: PropTypes.bool,
  /**
   * Theme to apply to the Vega visualizations
   */
  theme: PropTypes.object,
  /**
   * Let the user creates a layer when selecting a map visualization
   */
  useLayerEditor: PropTypes.bool,
  /**
   * Callback executed when the user clicks the save/update button
   */
  onSave: PropTypes.func,
  /**
   * Callback executed when the user clicks the embed button
   */
  onEmbed: PropTypes.func,
  /**
   * Callback executed at mounting time to provide a function
   * to get the widget config
   */
  provideWidgetConfig: PropTypes.func,
  /**
   * Callback executed when the value of the title is updated
   * The callback gets passed the new value
   */
  onChangeWidgetTitle: PropTypes.func,
  /**
   * Callback executed when the value of the caption is updated
   * The callback gets passed the new value
   */
  onChangeWidgetCaption: PropTypes.func,
  // Store
  band: PropTypes.object,
  widgetEditor: PropTypes.object.isRequired,
  resetWidgetEditor: PropTypes.func.isRequired,
  setFields: PropTypes.func.isRequired,
  setVisualizationType: PropTypes.func.isRequired,
  selectedVisualizationType: PropTypes.string,
  toggleModal: PropTypes.func,
  toggleTooltip: PropTypes.func,
  setBandsInfo: PropTypes.func,
  setTitle: PropTypes.func,
  setCaption: PropTypes.func,
  setMapParams: PropTypes.func,
  setZoom: PropTypes.func,
  setLatLng: PropTypes.func,
  setBounds: PropTypes.func,
  setFilters: PropTypes.func,
  setColor: PropTypes.func,
  setCategory: PropTypes.func,
  setValue: PropTypes.func,
  setSize: PropTypes.func,
  setOrderBy: PropTypes.func,
  setBand: PropTypes.func,
  setLayer: PropTypes.func,
  setAggregateFunction: PropTypes.func,
  setLimit: PropTypes.func,
  setChartType: PropTypes.func,
  setAreaIntersection: PropTypes.func,
  setDatasetId: PropTypes.func,
  setTableName: PropTypes.func,
  setContracted: PropTypes.func,
  setBasemap: PropTypes.func,
  setLabels: PropTypes.func,
  setBoundaries: PropTypes.func
};

WidgetEditor.defaultProps = {
  saveButtonMode: 'auto',
  embedButtonMode: 'auto',
  titleMode: 'auto',
  contracted: false,
  theme: ChartTheme(),
  useLayerEditor: false,
  availableVisualizations: VISUALIZATION_TYPES.map(viz => viz.value)
};

export default connect(mapStateToProps, mapDispatchToProps)(WidgetEditor);
