import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import { BASEMAPS, LABELS, BOUNDARIES } from 'components/map/constants';
import { connect } from 'react-redux';

// Redux
import { setZoom, setLatLng, setBounds } from 'reducers/widgetEditor';

// Components
import Spinner from 'components/ui/Spinner';

// Types
/**
 * Basemap
 * @typedef {{ id: string, label: string, value: string, options: any }} Basemap
 */
/**
 * Label
 * @typedef {{ id: string, label: string, value: string, options: any }} Label
 */

const MAP_CONFIG = {
  minZoom: 2,
  zoomControl: true
};

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  componentDidMount() {
    this.hasBeenMounted = true;
    this.instantiateMap();

    // If the bounds are not defined, we set them in the store
    if (!this.props.mapConfig.bounds) {
      this.onMapChange();
    }
  }

  componentWillReceiveProps(nextProps) {
    const layerGroups = this.props.layerGroups.filter(l => l.visible);
    const nextLayerGroups = nextProps.layerGroups.filter(l => l.visible);

    const layerGroupsChanged = !isEqual(layerGroups, nextLayerGroups);

    const opacities = layerGroups.map(d => ({
      dataset: d.dataset,
      opacity: d.layers[0].opacity !== undefined
        ? d.layers[0].opacity
        : 1
    }));
    const nextOpacities = nextLayerGroups.map(d => ({
      dataset: d.dataset,
      opacity: d.layers[0].opacity !== undefined
        ? d.layers[0].opacity
        : 1
    }));

    const opacitiesChanged = !isEqual(opacities, nextOpacities);

    if (opacitiesChanged) {
      const nextLayers = nextLayerGroups.map(l => l.layers.find(la => la.active));
      this.layerManager.setOpacity(nextLayers);
    }

    if (layerGroupsChanged) {
      const layers = layerGroups.map(l => l.layers.find(la => la.active));
      const nextLayers = nextLayerGroups.map(l => l.layers.find(la => la.active));

      const layersIds = layers.map(l => l.id);
      const nextLayersIds = nextLayers.map(l => l.id);

      const union = new Set([...layers, ...nextLayers]);
      const difference = layersIds.filter(id => !nextLayersIds.find(id2 => id === id2));

      // Test whether old & new layers are the same & only have to change the order
      if (layers.length === nextLayers.length && !difference.length) {
        this.layerManager.setZIndex(nextLayers);
      } else {
        union.forEach((layer) => {
          if (!layersIds.find(id => id === layer.id)) {
            this.addLayers([layer]);
          } else if (!nextLayersIds.find(id => id === layer.id)) {
            this.removeLayer(layer);
          }
        });
      }
    }

    if (this.props.basemap !== nextProps.basemap) {
      this.setBasemap(nextProps.basemap);
    }

    if (this.props.labels !== nextProps.labels) {
      this.setLabels(nextProps.labels);
    }

    if (this.props.boundaries !== nextProps.boundaries) {
      this.setBoundaries(nextProps.boundaries);
    }

    // We automatically pan to the bounds if they are provided
    // or updated
    if ((!this.props.mapConfig.bounds && nextProps.mapConfig.bounds)
      || (nextProps.mapConfig && this.props.mapConfig.bounds !== nextProps.mapConfig.bounds
      && nextProps.mapConfig.bounds)) {
      this.map.fitBounds(nextProps.mapConfig.bounds, { animate: false });

      // If only the bounds were updated, we make sure the store
      // also has the correct center and zoom
      if (this.props.mapConfig.latLng.lat === nextProps.mapConfig.latLng.lat
        && this.props.mapConfig.latLng.lng === nextProps.mapConfig.latLng.lng
        && this.props.mapConfig.zoom === nextProps.mapConfig.zoom) {
        const mapParams = this.getMapParams();
        this.props.setLatLng(mapParams.latLng);
        this.props.setZoom(mapParams.zoom);
      }
    } else if (this.props.editorContracted !== nextProps.editorContracted) {
      // The size of the map container has changed so we tell
      // Leaflet about it
      this.map.invalidateSize();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const loadingChanged = this.state.loading !== nextState.loading;
    return loadingChanged;
  }

  componentWillUnmount() {
    this.hasBeenMounted = false;

    // Remember to remove the listeners before removing the map
    // or they will stay in memory
    if (this.props.setMapParams) this.removeMapEventListeners();
    if (this.map) this.map.remove();
  }

  /**
   * Event handler executed when the state of
   * the map has changed
   */
  onMapChange() {
    this.props.setMapParams(this.getMapParams());
  }

  /**
   * Return the map options of the map for
   * its instantiation
   * @returns {object}
   */
  getMapOptions() {
    const mapOptions = Object.assign(
      {},
      MAP_CONFIG,
      pick(this.props.mapConfig, ['zoom']) || {}
    );

    mapOptions.center = [this.props.mapConfig.latLng.lat, this.props.mapConfig.latLng.lng];

    return mapOptions;
  }

  /**
   * Set the map's basemap
   * @param {Basemap} basemap Basemap
   */
  setBasemap(basemap) {
    if (this.tileLayer) this.tileLayer.remove();

    this.tileLayer = L.tileLayer(basemap.value, basemap.options)
      .addTo(this.map)
      .setZIndex(0);
  }

  /**
   * Set the map's labels
   * @param {Label} labels Labels
   */
  setLabels(labels) {
    if (this.labelsLayer) this.labelsLayer.remove();

    if (labels.id !== 'none') {
      this.labelsLayer = L.tileLayer(labels.value, labels.options || {})
        .addTo(this.map)
        .setZIndex(this.props.layerGroups.length + 1);
    }
  }

  /**
   * Toggle the visibility of the boundaries on the map
   * @param {boolean} showBoundaries
   */
  setBoundaries(showBoundaries) {
    if (this.boundariesLayer) this.boundariesLayer.remove();

    if (showBoundaries) {
      this.boundariesLayer = L.tileLayer(BOUNDARIES.dark.value, BOUNDARIES.dark.options || {})
        .addTo(this.map)
        .setZIndex(this.props.layerGroups.length + 2);
    }
  }

  /**
   * Return the state of the map
   * @returns {{ zoom: number, latLng: number[], bounds: any }}
   */
  getMapParams() {
    const bounds = this.map.getBounds();
    const params = {
      zoom: this.map.getZoom(),
      latLng: this.map.getCenter(),
      bounds: [
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng]
      ]
    };
    return params;
  }

  /**
   * Set the event listeners for the map
   */
  setEventListeners() {
    if (this.props.setMapParams) {
      this.map.on('zoomend', () => this.onMapChange());
      this.map.on('dragend', () => this.onMapChange());
    }
  }

  /**
   * Remove the event handlers associated with
   * the map
   */
  removeMapEventListeners() {
    this.map.off('zoomend');
    this.map.off('dragend');
  }

  /**
   * Add layers to the map
   * @param {object[]} layers List of layers
   */
  addLayers(layers) {
    if (!layers) return;

    this.setState({ loading: true });
    layers.forEach((layer) => {
      this.layerManager.addLayer(layer, {
        zIndex: layer.order
      });
    });
  }

  /**
   * Remove a layer from the map
   * If any paramater is passed, all the layers are removed
   * @param {object} [layer] Layer to remove
   */
  removeLayer(layer) {
    if (layer) {
      this.layerManager.removeLayer(layer.id);
    } else {
      this.layerManager.removeLayers();
    }
  }

  /**
   * Instantiate the map
   */
  instantiateMap() {
    if (!this.mapNode) return;

    this.map = L.map(this.mapNode, this.getMapOptions());
    this.map.scrollWheelZoom.disable();

    // If the layer has bounds, we just pan in the
    // area
    if (this.props.mapConfig.bounds) {
      this.map.fitBounds(this.props.mapConfig.bounds);
    }

    // Disable interaction if necessary
    if (!this.props.interactionEnabled) {
      this.map.dragging.disable();
      this.map.touchZoom.disable();
      this.map.doubleClickZoom.disable();
      this.map.boxZoom.disable();
      this.map.keyboard.disable();
    }

    this.map.attributionControl.addAttribution('&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>');
    if (this.map.zoomControl) {
      this.map.zoomControl.setPosition('topright');
    }

    // We set the current basemap and labels
    this.setBasemap(this.props.basemap);
    this.setLabels(this.props.labels);
    this.setBoundaries(this.props.boundaries);

    // We add the event listeners
    this.setEventListeners();


    // Add layers
    this.instantiateLayerManager();

    const layers = this.props.layerGroups
      .filter(l => l.visible)
      .map(l => l.layers.find(la => la.active));

    this.addLayers(layers);
  }

  /**
   * Instantiate the layer manager
   */
  instantiateLayerManager() {
    const stopLoading = () => {
      // Don't execute callback if component has been unmounted
      if (!this.hasBeenMounted) return;
      this.setState({ loading: false });
    };

    this.layerManager = new this.props.LayerManager(this.map, {
      onLayerAddedSuccess: stopLoading,
      onLayerAddedError: stopLoading
    });
  }

  render() {
    return (
      <div className="c-we-map">
        <Spinner isLoading={this.state.loading} />
        <div ref={(node) => { this.mapNode = node; }} className="map-leaflet" />
      </div>
    );
  }
}

Map.propTypes = {
  interactionEnabled: PropTypes.bool,
  /**
   * Selected basemap
   * @type {Basemap} basemap
   */
  basemap: PropTypes.object.isRequired,
  /**
   * Selected labels
   * @type {Label} labels
   */
  labels: PropTypes.object.isRequired,
  /**
   * Whether to show the boundaries or not
   */
  boundaries: PropTypes.bool.isRequired,
  /**
   * Whether the left panel of the editor is contracted
   */
  editorContracted: PropTypes.bool.isRequired,
  /**
   * Configuration of the map
   */
  mapConfig: PropTypes.shape({
    zoom: PropTypes.number,
    latLng: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    }),
    bounds: PropTypes.array
  }),
  /**
   * Layer manager
   */
  LayerManager: PropTypes.func,
  /**
   * List of LayerGroup items
   */
  layerGroups: PropTypes.array,
  /**
   * Callback called with the configuration of the map
   * each time its state is updated
   * @type {function({ zoom: number, latLng: number[], bounds: number[][] }): any} setMapParams
   */
  setMapParams: PropTypes.func,
  setLatLng: PropTypes.func,
  setZoom: PropTypes.func
};

Map.defaultProps = {
  interactionEnabled: true
};

const mapStateToProps = ({ widgetEditor }) => ({
  basemap: BASEMAPS[widgetEditor.basemapLayers.basemap],
  labels: LABELS[widgetEditor.basemapLayers.labels || 'none'],
  boundaries: widgetEditor.basemapLayers.boundaries,
  editorContracted: widgetEditor.contracted,
  mapConfig: {
    zoom: widgetEditor.zoom,
    latLng: widgetEditor.latLng,
    bounds: widgetEditor.bounds
  }
});

const mapDispatchToProps = dispatch => ({
  setMapParams: ({ zoom, latLng, bounds }) => {
    dispatch(setZoom(zoom));
    dispatch(setLatLng(latLng));
    if (bounds) dispatch(setBounds(bounds));
  },
  setLatLng: latLng => dispatch(setLatLng(latLng)),
  setZoom: zoom => dispatch(setZoom(zoom))
});

export default connect(mapStateToProps, mapDispatchToProps)(Map);
