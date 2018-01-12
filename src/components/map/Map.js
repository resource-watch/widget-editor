import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { BASEMAPS, LABELS } from 'components/map/constants';

// Components
import Spinner from 'components/ui/Spinner';

// Types
/**
 * Basemap
 * @typedef {{ id: string, label: string, value: string, options: any }} Basemap
 */

// Leaflet can't be imported on the server because it's not isomorphic
const L = (typeof window !== 'undefined') ? require('leaflet') : null;

const MAP_CONFIG = {
  zoom: 2,
  minZoom: 2,
  latLng: {
    lat: 30,
    lng: -120
  },
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

    const mapOptions = Object.assign({}, MAP_CONFIG, this.props.mapConfig || {});
    mapOptions.center = [mapOptions.latLng.lat, mapOptions.latLng.lng];

    if (!this.mapNode) return;

    this.map = L.map(this.mapNode, mapOptions);

    if (this.props.setMapInstance) {
      this.props.setMapInstance(this.map);
    }

    if (this.props.mapConfig && this.props.mapConfig.bounds) {
      this.fitBounds(this.props.mapConfig.bounds.geometry);
    }

    // Disable interaction if necessary
    if (!this.props.interactionEnabled) {
      this.map.dragging.disable();
      this.map.touchZoom.disable();
      this.map.doubleClickZoom.disable();
      this.map.scrollWheelZoom.disable();
      this.map.boxZoom.disable();
      this.map.keyboard.disable();
    }

    // SETTERS
    this.setAttribution();
    this.setZoomControl();
    this.setBasemap(this.props.basemap);
    this.setMapEventListeners();

    this.setLabels(this.props.labels);

    // Add layers
    this.setLayerManager();
    const layers = this.props.layerGroups
      .filter(l => l.visible)
      .map(l => l.layers.find(la => la.active));
    this.addLayers(layers, this.props.filters);
  }

  componentWillReceiveProps(nextProps) {
    const filtersChanged = !isEqual(nextProps.filters, this.props.filters);

    const layerGroups = this.props.layerGroups.filter(l => l.visible);
    const nextLayerGroups = nextProps.layerGroups.filter(l => l.visible);

    const layerGroupsChanged = !isEqual(layerGroups, nextLayerGroups);

    const opacities = layerGroups.map(d => ({
      dataset: d.dataset, opacity: d.layers[0].opacity !== undefined ? d.layers[0].opacity : 1
    }));
    const nextOpacities = nextLayerGroups.map(d => ({
      dataset: d.dataset, opacity: d.layers[0].opacity !== undefined ? d.layers[0].opacity : 1
    }));

    if (!isEqual(opacities, nextOpacities)) {
      // Set opacity if changed
      const nextLayers = nextLayerGroups
        .map(l => l.layers.find(la => la.active));
      this.layerManager.setOpacity(nextLayers);
    }

    if (filtersChanged || layerGroupsChanged) {
      const layers = layerGroups
        .map(l => l.layers.find(la => la.active));
      const nextLayers = nextLayerGroups
        .map(l => l.layers.find(la => la.active));

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
  }

  shouldComponentUpdate(nextProps, nextState) {
    const loadingChanged = this.state.loading !== nextState.loading;
    const offsetChanged = this.props.horizontalOffset !== nextProps.horizontalOffset;
    return loadingChanged || offsetChanged;
  }

  componentWillUnmount() {
    this.hasBeenMounted = false;

    // Remember to remove the listeners before removing the map
    // or they will stay in memory
    if (this.props.setMapParams) this.removeMapEventListeners();
    if (this.map) this.map.remove();
  }


  // SETTERS
  setLayerManager() {
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

  setAttribution() {
    this.map.attributionControl.addAttribution('&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>');
  }

  setZoomControl() {
    if (this.map.zoomControl) {
      this.map.zoomControl.setPosition('topright');
    }
  }

  setBasemap(basemap) {
    if (this.tileLayer) this.tileLayer.remove();

    this.tileLayer = L.tileLayer(basemap.value, basemap.options)
      .addTo(this.map)
      .setZIndex(0);
  }

  setLabels(enabled) {
    if (this.labelLayer && !enabled) this.labelLayer.remove();

    if (enabled) {
      this.labelLayer = L.tileLayer(LABELS.value, LABELS.options || {})
        .addTo(this.map)
        .setZIndex(this.props.layerGroups.length + 1);
    }
  }

  // GETTERS
  getMapParams() {
    const params = {
      zoom: this.getZoom(),
      latLng: this.getCenter()
    };
    return params;
  }

  // MAP FUNCTIONS
  getCenter() { return this.map.getCenter(); }

  getZoom() { return this.map.getZoom(); }

  // MAP LISTENERS
  setMapEventListeners() {
    function mapChangeHandler() {
      // Dispatch the action to set the params
      this.props.setMapParams(this.getMapParams());
    }

    if (this.props.setMapParams) {
      this.map.on('zoomend', mapChangeHandler.bind(this));
      this.map.on('dragend', mapChangeHandler.bind(this));
    }
  }

  setSpinnerPosition() {
    return this.props.horizontalOffset / 2;
  }

  fitBounds(geoJson) {
    const geojsonLayer = L.geoJson(geoJson);
    this.map.fitBounds(geojsonLayer.getBounds(), {
      paddingTopLeft: [this.props.horizontalOffset || 0, 0],
      paddingBottomRight: [0, 0]
    });
  }

  removeMapEventListeners() {
    this.map.off('zoomend');
    this.map.off('dragend');
  }

  // LAYER METHODS
  addLayers(layers, filters) {
    if (!layers) return;
    if (layers.length) this.setState({ loading: true });
    layers.forEach((layer) => {
      this.layerManager.addLayer(layer, {
        ...(filters || this.props.filters),
        zIndex: layer.order
      });
    });
  }

  removeLayer(layer) {
    if (layer) this.layerManager.removeLayer(layer.id);
    else this.layerManager.removeLayers();
  }

  // RENDER
  render() {
    const spinnerStyles = { marginLeft: this.setSpinnerPosition() };

    return (
      <div className="c-we-map">
        <Spinner isLoading={this.state.loading} style={spinnerStyles} />
        <div ref={(node) => { this.mapNode = node; }} className="map-leaflet" />
      </div>
    );
  }
}

Map.propTypes = {
  interactionEnabled: PropTypes.bool,
  setMapInstance: PropTypes.func,
  /**
   * Selected basemap
   * @type {Basemap} basemap
   */
  basemap: PropTypes.object,
  /**
   * Whether the labels are show or not
   * @type {boolean} labels
   */
  labels: PropTypes.bool,
  /**
   * Horizontal offset for the center of the map and
   * loader
   */
  horizontalOffset: PropTypes.number,
  // STORE
  mapConfig: PropTypes.object,
  filters: PropTypes.object,
  LayerManager: PropTypes.func,
  layerGroups: PropTypes.array, // List of LayerGroup items
  // ACTIONS
  setMapParams: PropTypes.func
};

Map.defaultProps = {
  basemap: BASEMAPS.dark,
  labels: false,
  interactionEnabled: true,
  horizontalOffset: 0
};

export default Map;
