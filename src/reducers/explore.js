/* global config */
import 'isomorphic-fetch';
// import { Router } from 'routes';

// Services
import UserService from 'services/UserService';

// Helpers
import { getConfig } from 'helpers/ConfigHelper';

import { BASEMAPS } from 'components/map/constants';

/**
 * CONSTANTS
*/
const GET_DATASETS_SUCCESS = 'explore/GET_DATASETS_SUCCESS';
const GET_DATASETS_ERROR = 'explore/GET_DATASETS_ERROR';
const GET_DATASETS_LOADING = 'explore/GET_DATASETS_LOADING';

const GET_FAVORITES_SUCCESS = 'explore/GET_FAVORITES_SUCCESS';
const GET_FAVORITES_ERROR = 'explore/GET_FAVORITES_ERROR';
const GET_FAVORITES_LOADING = 'explore/GET_FAVORITES_LOADING';

const ADD_FAVORITE_DATASET = 'explore/ADD_FAVORITE_DATASET';
const REMOVE_FAVORITE_DATASET = 'explore/REMOVE_FAVORITE_DATASET';

const SET_DATASETS_PAGE = 'explore/SET_DATASETS_PAGE';
const SET_DATASETS_SEARCH_FILTER = 'explore/SET_DATASETS_SEARCH_FILTER';
const SET_DATASETS_TOPICS_FILTER = 'explore/SET_DATASETS_TOPICS_FILTER';
const SET_DATASETS_DATA_TYPE_FILTER = 'explore/SET_DATASETS_DATA_TYPE_FILTER';
const SET_DATASETS_GEOGRAPHIES_FILTER = 'explore/SET_DATASETS_GEOGRAPHIES_FILTER';
const SET_FILTERS_LOADING = 'explore/SET_FILTERS_LOADING';

const SET_DATASETS_FILTERED_BY_CONCEPTS = 'explore/SET_DATASETS_FILTERED_BY_CONCEPTS';

const SET_DATASETS_MODE = 'explore/SET_DATASETS_MODE';

const SET_LAYERGROUP_TOGGLE = 'explore/SET_LAYERGROUP_TOGGLE';
const SET_LAYERGROUP_VISIBILITY = 'explore/SET_LAYERGROUP_VISIBILITY';
const SET_LAYERGROUP_ACTIVE_LAYER = 'explore/SET_LAYERGROUP_ACTIVE_LAYER';
const SET_LAYERGROUP_ORDER = 'explore/SET_LAYERGROUP_ORDER';
const SET_LAYERGROUP_OPACITY = 'explore/SET_LAYERGROUP_OPACITY';
const SET_LAYERGROUPS = 'explore/SET_LAYERGROUPS';

const SET_SIDEBAR = 'explore/SET_SIDEBAR';

const SET_TOPICS_TREE = 'explore/SET_TOPICS_TREE';
const SET_DATA_TYPE_TREE = 'explore/SET_DATA_TYPE_TREE';
const SET_GEOGRAPHIES_TREE = 'explore/SET_GEOGRAPHIES_TREE';

const SET_ZOOM = 'explore/SET_ZOOM';
const SET_LATLNG = 'explore/SET_LATLNG';
const SET_BASEMAP = 'explore/SET_BASEMAP';
const SET_LABELS = 'explore/SET_LABELS';

/**
 * Layer
 * @typedef {Object} Layer
 * @property {string} id - ID of the associated layer
 * @property {boolean} active - If the layer is the one to be displayed
 */

/**
 * Group of layers
 * @typedef {Object} LayerGroup
 * @property {string} dataset - ID of the associated dataset
 * @property {boolean} visible - Indicates whether the group is visible
 * @property {Layer[]} layers - Actual list of layers
 */

/**
 * REDUCER
*/
const initialState = {
  datasets: {
    list: [],
    favorites: [],
    loading: false,
    error: false,
    page: 1,
    limit: 9,
    mode: 'grid' // 'grid' or 'list'
  },
  // List of layers (corresponding to the datasets
  // set as active)
  //
  // NOTES:
  //  * If a layer is removed from the map, it is removed
  // from this list
  //  * This list does not contain the attributes of the
  // layers, just the information necessary to retrieve
  // the layers in the list of datasets
  //  * The groups are sorted according to the order the
  // user has set in the legend
  /** @type {LayerGroup[]} */
  layers: [],
  filters: {
    search: null,
    topics: null,
    dataType: null,
    geographies: null,
    datasetsFilteredByConcepts: [],
    loading: false
  },
  sidebar: {
    open: true,
    width: 0
  },
  zoom: 3,
  latLng: { lat: 0, lng: 0 },
  basemap: BASEMAPS.dark,
  basemapControl: {
    basemaps: BASEMAPS
  },
  geographiesTree: null,
  topicsTree: null,
  dataTypeTree: null,
  labels: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_DATASETS_SUCCESS: {
      const datasets = Object.assign({}, state.datasets, {
        list: action.payload,
        loading: false,
        error: false
      });
      return Object.assign({}, state, { datasets });
    }

    case GET_DATASETS_ERROR: {
      const datasets = Object.assign({}, state.datasets, {
        loading: false,
        error: true
      });
      return Object.assign({}, state, { datasets });
    }

    case GET_DATASETS_LOADING: {
      const datasets = Object.assign({}, state.datasets, {
        loading: true,
        error: false
      });
      return Object.assign({}, state, { datasets });
    }

    case GET_FAVORITES_SUCCESS: {
      const datasets = Object.assign({}, state.datasets, {
        favorites: action.payload,
        loadingFavorites: false,
        error: false
      });
      return Object.assign({}, state, { datasets });
    }

    case GET_FAVORITES_ERROR: {
      const datasets = Object.assign({}, state.datasets, {
        loadingFavorites: false,
        error: true
      });
      return Object.assign({}, state, { datasets });
    }

    case GET_FAVORITES_LOADING: {
      const datasets = Object.assign({}, state.datasets, {
        loadingFavorites: true,
        error: false
      });
      return Object.assign({}, state, { datasets });
    }

    case ADD_FAVORITE_DATASET: {
      const newFavorites = [...state.datasets.favorites, action.payload];
      const datasets = Object.assign({}, state.datasets, {
        favorites: newFavorites
      });
      return Object.assign({}, state, { datasets });
    }

    case REMOVE_FAVORITE_DATASET: {
      const favorites = state.datasets.favorites.filter(elem => elem.id !== action.payload.id);
      const datasets = Object.assign({}, state.datasets, {
        favorites
      });
      return Object.assign({}, state, { datasets });
    }

    case SET_LAYERGROUP_TOGGLE: {
      if (action.payload.add) { // We add a layer group
        const dataset = state.datasets.list.find(d => d.id === action.payload.dataset);
        if (!dataset) return state;
        const layers = [...state.layers];
        layers.unshift({
          dataset: dataset.id,
          visible: true,
          layers: dataset.attributes.layer.map((l, index) => ({ id: l.id, active: index === 0 }))
        });
        return Object.assign({}, state, { layers });
      // eslint-disable-next-line no-else-return
      } else { // We remove a layer group
        const layers = state.layers.filter(l => l.dataset !== action.payload.dataset);
        return Object.assign({}, state, { layers });
      }
    }

    case SET_LAYERGROUP_VISIBILITY: {
      const layers = state.layers.map((l) => {
        if (l.dataset !== action.payload.dataset) return l;
        const datasetLayers = l.layers.map(lay => Object.assign({}, lay, { opacity: 1 }));
        return Object.assign({}, l, { visible: action.payload.visible, layers: datasetLayers });
      });
      return Object.assign({}, state, { layers });
    }

    case SET_LAYERGROUP_ACTIVE_LAYER: {
      const layerGroups = state.layers.map((l) => {
        if (l.dataset !== action.payload.dataset) return l;
        const layers = l.layers.map((la) => { // eslint-disable-line arrow-body-style
          return Object.assign({}, la, { active: la.id === action.payload.layer, opacity: 1 });
        });
        return Object.assign({}, l, { layers });
      });
      return Object.assign({}, state, { layers: layerGroups });
    }

    case SET_LAYERGROUP_ORDER: {
      const layers = action.payload.map(d => state.layers.find(l => l.dataset === d));
      return Object.assign({}, state, { layers });
    }

    case SET_LAYERGROUP_OPACITY: {
      const layerGroups = state.layers.map((l) => {
        if (l.dataset !== action.payload.dataset) return l;
        const layers = l.layers.map((la) => { // eslint-disable-line arrow-body-style
          return Object.assign({}, la, { opacity: action.payload.opacity });
        });
        return Object.assign({}, l, { layers });
      });
      return Object.assign({}, state, { opacity: action.payload.opacity, layers: layerGroups });
    }

    case SET_LAYERGROUPS: {
      return Object.assign({}, state, { layers: action.payload });
    }

    case SET_DATASETS_PAGE: {
      const datasets = Object.assign({}, state.datasets, {
        page: action.payload
      });
      return Object.assign({}, state, { datasets });
    }

    case SET_DATASETS_MODE: {
      const datasets = Object.assign({}, state.datasets, {
        mode: action.payload
      });
      return Object.assign({}, state, { datasets });
    }

    case SET_DATASETS_SEARCH_FILTER: {
      const filters = Object.assign({}, state.filters, {
        search: action.payload
      });
      return Object.assign({}, state, { filters });
    }

    case SET_DATASETS_TOPICS_FILTER: {
      const filters = Object.assign({}, state.filters, {
        topics: action.payload
      });
      return Object.assign({}, state, { filters });
    }

    case SET_DATASETS_DATA_TYPE_FILTER: {
      const filters = Object.assign({}, state.filters, {
        dataType: action.payload
      });
      return Object.assign({}, state, { filters });
    }

    case SET_DATASETS_GEOGRAPHIES_FILTER: {
      const filters = Object.assign({}, state.filters, {
        geographies: action.payload
      });
      return Object.assign({}, state, { filters });
    }

    case SET_FILTERS_LOADING: {
      const filters = Object.assign({}, state.filters, {
        loading: action.payload
      });
      return Object.assign({}, state, { filters });
    }

    case SET_DATASETS_FILTERED_BY_CONCEPTS: {
      const filters = Object.assign({}, state.filters, {
        datasetsFilteredByConcepts: action.payload
      });
      return Object.assign({}, state, { filters });
    }

    case SET_SIDEBAR: {
      return Object.assign({}, state, {
        sidebar: Object.assign({}, state.sidebar, action.payload)
      });
    }

    case SET_GEOGRAPHIES_TREE: {
      return Object.assign({}, state, {
        geographiesTree: action.payload
      });
    }

    case SET_DATA_TYPE_TREE: {
      return Object.assign({}, state, {
        dataTypeTree: action.payload
      });
    }

    case SET_TOPICS_TREE: {
      return Object.assign({}, state, {
        topicsTree: action.payload
      });
    }

    case SET_BASEMAP: {
      return Object.assign({}, state, {
        basemap: action.payload
      });
    }

    case SET_LABELS: {
      return Object.assign({}, state, {
        labels: action.payload
      });
    }

    case SET_ZOOM: {
      return Object.assign({}, state, {
        zoom: action.payload
      });
    }

    case SET_LATLNG: {
      return Object.assign({}, state, {
        latLng: action.payload
      });
    }

    default:
      return state;
  }
}

// Let's use {replace} instead of {push}, that's how we will allow users to
// go away from the current page
export function setUrlParams() {
  return (dispatch, getState) => {
    const { explore } = getState();
    const layerGroups = explore.layers;
    const { zoom, latLng } = explore;
    const { page } = explore.datasets;
    const { search, topics, dataType, geographies } = explore.filters;

    const query = { page };

    if (layerGroups.length) {
      query.layers = encodeURIComponent(JSON.stringify(layerGroups));
    }

    if (search && search.value) {
      query.search = search.value;
    }

    if (topics) {
      if (topics.length > 0) {
        query.topics = JSON.stringify(topics);
      } else {
        delete query.topics;
      }
    }

    if (dataType) {
      if (dataType.length > 0) {
        query.dataType = JSON.stringify(dataType);
      } else {
        delete query.dataType;
      }
    }

    if (geographies) {
      if (geographies.length > 0) {
        query.geographies = JSON.stringify(geographies);
      } else {
        delete query.geographies;
      }
    }

    if (zoom) {
      query.zoom = zoom;
    }

    if (latLng) {
      query.latLng = JSON.stringify(latLng);
    }

    // Router.replaceRoute('explore', query);
  };
}

export function getFavoriteDatasets(token) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FAVORITES_LOADING });

    const userService = new UserService();

    return userService.getFavouriteDatasets(token)
      .then((response) => {
        dispatch({
          type: GET_FAVORITES_SUCCESS,
          payload: response
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_FAVORITES_ERROR,
          payload: err.message
        });
      });
  };
}

export function getDatasets({ pageNumber, pageSize }) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_DATASETS_LOADING });

    return fetch(new Request(`${getConfig().url}/dataset?${[getConfig().applications].join(',')}&status=saved&published=true&includes=widget,layer,metadata,vocabulary&page[size]=${pageSize || 999}&page[number]=${pageNumber || 1}&sort=-updatedAt`))
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((response) => {
        // TODO: We should check which app do we want here
        // Filtering datasets that have widget or layer
        // and only belong to RW app
        const datasets = response.data;
        dispatch({
          type: GET_DATASETS_SUCCESS,
          payload: datasets
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_DATASETS_ERROR,
          payload: err.message
        });
      });
  };
}

export function setDatasetsPage(page) {
  return (dispatch) => {
    dispatch({
      type: SET_DATASETS_PAGE,
      payload: page
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

/**
 * Add or remove a layer group from the map and legend
 * @export
 * @param {string} dataset - ID of the dataset
 * @param {boolean} addLayer - Whether to add the group or remove it
 */
export function toggleLayerGroup(dataset, addLayer) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUP_TOGGLE,
      payload: { dataset, [addLayer ? 'add' : 'remove']: true }
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

/**
 * Show or hide a layer group on the map
 * @export
 * @param {string} dataset - ID of the dataset
 * @param {boolean} visible - Whether to show the group or hide it
 */
export function toggleLayerGroupVisibility(dataset, visible) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUP_VISIBILITY,
      payload: { dataset, visible }
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

/**
 * Set which of the layer group's layers is the active one
 * (the one to be displayed)
 * @export
 * @param {string} dataset - ID of the dataset
 * @param {string} layer - ID of the layer
 */
export function setLayerGroupActiveLayer(dataset, layer) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUP_ACTIVE_LAYER,
      payload: { dataset, layer }
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

/**
 * Change the order of the layer groups according to the
 * order of the dataset IDs
 * @export
 * @param {string[]} datasets - List of dataset IDs
 */
export function setLayerGroupsOrder(datasets) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUP_ORDER,
      payload: datasets
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

/**
 * Set which of the layer group's layers is the active one
 * (the one to be displayed)
 * @export
 * @param {string} dataset - ID of the dataset
 * @param {number} opacity - opacity
 */
export function setLayerGroupOpacity(dataset, opacity, updateUrl = false) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUP_OPACITY,
      payload: { dataset, opacity }
    });

    // We also update the URL
    if (typeof window !== 'undefined' && updateUrl) dispatch(setUrlParams());
  };
}

/**
 * Set the layer attribute of the store
 * This method is used when the layer groups are retrieved
 * from the URL to restore the state
 * @export
 * @param {LayerGroup[]} layerGroups
 */
export function setLayerGroups(layerGroups) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUPS,
      payload: layerGroups
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function setSidebar(options) {
  return {
    type: SET_SIDEBAR,
    payload: options
  };
}

export function setDatasetsSearchFilter(search) {
  return (dispatch) => {
    dispatch({
      type: SET_DATASETS_SEARCH_FILTER,
      payload: search
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function setDatasetsTopicsFilter(topics) {
  return (dispatch) => {
    dispatch({
      type: SET_DATASETS_TOPICS_FILTER,
      payload: topics
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function setDatasetsGeographiesFilter(topics) {
  return (dispatch) => {
    dispatch({
      type: SET_DATASETS_GEOGRAPHIES_FILTER,
      payload: topics
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function setDatasetsDataTypeFilter(dataTypes) {
  return (dispatch) => {
    dispatch({
      type: SET_DATASETS_DATA_TYPE_FILTER,
      payload: dataTypes
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function setDatasetsFilteredByConcepts(datasetList) {
  return (dispatch) => {
    dispatch({
      type: SET_DATASETS_FILTERED_BY_CONCEPTS,
      payload: datasetList
    });
  };
}

export function setFiltersLoading(loading) {
  return {
    type: SET_FILTERS_LOADING,
    payload: loading
  };
}

export function setDatasetsMode(mode) {
  return {
    type: SET_DATASETS_MODE,
    payload: mode
  };
}

export function setTopicsTree(tree) {
  return {
    type: SET_TOPICS_TREE,
    payload: tree
  };
}

export function setDataTypeTree(tree) {
  return {
    type: SET_DATA_TYPE_TREE,
    payload: tree
  };
}

export function setGeographiesTree(tree) {
  return {
    type: SET_GEOGRAPHIES_TREE,
    payload: tree
  };
}

export function setBasemap(basemap) {
  return {
    type: SET_BASEMAP,
    payload: basemap
  };
}

export function setLabels(labelEnabled) {
  return {
    type: SET_LABELS,
    payload: labelEnabled
  };
}


export function setZoom(zoom, updateUrl = true) {
  return (dispatch) => {
    dispatch({ type: SET_ZOOM, payload: zoom });

    // We also update the URL
    if (updateUrl && typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function setLatLng(latLng, updateUrl = true) {
  return (dispatch) => {
    dispatch({ type: SET_LATLNG, payload: latLng });

    // We also update the URL
    if (updateUrl && typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function addFavoriteDataset(favorite) {
  return {
    type: ADD_FAVORITE_DATASET,
    payload: favorite
  };
}

export function removeFavoriteDataset(favorite) {
  return {
    type: REMOVE_FAVORITE_DATASET,
    payload: favorite
  };
}
