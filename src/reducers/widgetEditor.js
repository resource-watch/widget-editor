/**
 * CONSTANTS
*/
const ADD_FILTER = 'WIDGET_EDITOR/ADD_FILTER';
const SET_FILTER_VALUE = 'WIDGET_EDITOR/SET_FILTER_VALUE';
const SET_FILTERS = 'WIDGET_EDITOR/SET_FILTERS';
const REMOVE_FILTER = 'WIDGET_EDITOR/REMOVE_FILTER';
const SET_COLOR = 'WIDGET_EDITOR/SET_COLOR';
const REMOVE_COLOR = 'WIDGET_EDITOR/REMOVE_COLOR';
const SET_SIZE = 'WIDGET_EDITOR/SET_SIZE';
const REMOVE_SIZE = 'WIDGET_EDITOR/REMOVE_SIZE';
const SET_CATEGORY = 'WIDGET_EDITOR/SET_CATEGORY';
const REMOVE_CATEGORY = 'WIDGET_EDITOR/REMOVE_CATEGORY';
const SET_VALUE = 'WIDGET_EDITOR/SET_VALUE';
const REMOVE_VALUE = 'WIDGET_EDITOR/REMOVE_VALUE';
const SET_CHART_TYPE = 'WIDGET_EDITOR/SET_CHART_TYPE';
const SET_AGGREGATE_FN = 'WIDGET_EDITOR/SET_AGGREGATE_FN';
const SET_ORDER_BY = 'WIDGET_EDITOR/SET_ORDER_BY';
const REMOVE_ORDER_BY = 'WIDGET_EDITOR/REMOVE_ORDER_BY';
const SHOW_LAYER = 'WIDGET_EDITOR/SHOW_LAYER';
const SET_FIELDS = 'WIDGET_EDITOR/SET_FIELDS';
const SET_LIMIT = 'WIDGET_EDITOR/SET_LIMIT';
const RESET = 'WIDGET_EDITOR/RESET';
const SET_AREA_INTERSEACTION = 'WIDGET_EDITOR/SET_AREA_INTERSEACTION';
const SET_VISUALIZATION_TYPE = 'WIDGET_EDITOR/SET_VISUALIZATION_TYPE';
const SET_BAND = 'WIDGET_EDITOR/SET_BAND';
const SET_LAYER = 'WIDGET_EDITOR/SET_LAYER';
const SET_TITLE = 'WIDGET_EDITOR/SET_TITLE';
const SET_CAPTION = 'WIDGET_EDITOR/SET_CAPTION';
const SET_BANDS_INFO = 'WIDGET_EDITOR/SET_BANDS_INFO';
const SET_ZOOM = 'WIDGET_EDITOR/SET_ZOOM';
const SET_LATLNG = 'WIDGET_EDITOR/SET_LATLNG';
const SET_BOUNDS = 'WIDGET_EDITOR/SET_BOUNDS';
const SET_DATASET_ID = 'WIDGET_EDITOR/SET_DATASET_ID';
const SET_TABLENAME = 'WIDGET_EDITOR/SET_TABLENAME';

/**
 * REDUCER
*/
const initialState = {
  aggregateFunction: null,
  orderBy: null,
  filters: [],
  color: null,
  size: null,
  category: null,
  value: null,
  layer: null,
  fields: [],
  chartType: null,
  visualizationType: null,
  title: null, // Title of the widget / graph
  caption: null, // Caption of the widget
  limit: 500,
  areaIntersection: null, // ID of the geostore object
  band: null, // Band of the raster dataset
  /** @type {{ [name: string]: { type: string, alias: string, description: string } }} bandsInfo */
  bandsInfo: {}, // Information of the raster bands
  zoom: 3,
  latLng: { lat: 0, lng: 0 },
  /** @type {number[][]} bounds */
  bounds: null // Bounds of the map (south west, then north east)
};

export default function (state = initialState, action) {
  switch (action.type) {
    case ADD_FILTER: {
      const filters = state.filters.slice(0);
      const element = action.payload;
      const found = filters.find(val => val.name === element.name);
      if (!found) {
        filters.push(action.payload);
      }
      return Object.assign({}, state, {
        filters
      });
    }

    case SET_FILTER_VALUE: {
      const index = state.filters.findIndex(f => f.name === action.payload.name);
      const filters = state.filters.map((filter, i) => {
        if (i !== index) return filter;
        return Object.assign({}, filter, {
          value: action.payload.value,
          notNull: action.payload.notNull
        });
      });
      return Object.assign({}, state, { filters });
    }

    case REMOVE_FILTER: {
      const filters = state.filters.slice(0);
      const element = action.payload;
      let index = 0;
      for (let i = 0; i < filters.length; i++) {
        if (filters[i].name === element.name) {
          index = i;
        }
      }
      filters.splice(index, 1);
      return Object.assign({}, state, {
        filters
      });
    }

    case SET_COLOR: {
      return Object.assign({}, state, {
        color: action.payload
      });
    }

    case REMOVE_COLOR: {
      return Object.assign({}, state, {
        color: null
      });
    }

    case SET_SIZE: {
      return Object.assign({}, state, {
        size: action.payload
      });
    }

    case REMOVE_SIZE: {
      return Object.assign({}, state, {
        size: null
      });
    }

    case SET_CATEGORY: {
      return Object.assign({}, state, {
        category: action.payload
      });
    }

    case REMOVE_CATEGORY: {
      return Object.assign({}, state, {
        category: null
      });
    }

    case SET_VALUE: {
      return Object.assign({}, state, {
        value: action.payload
      });
    }

    case REMOVE_VALUE: {
      return Object.assign({}, state, {
        value: null
      });
    }

    case SET_ORDER_BY: {
      return Object.assign({}, state, {
        orderBy: action.payload
      });
    }

    case REMOVE_ORDER_BY: {
      return Object.assign({}, state, {
        orderBy: null
      });
    }

    case SET_CHART_TYPE: {
      return Object.assign({}, state, {
        chartType: action.payload
      });
    }

    case SET_AGGREGATE_FN: {
      return Object.assign({}, state, {
        aggregateFunction: action.payload
      });
    }

    case RESET: {
      return Object.assign(
        {},
        initialState,
        !action.payload // If not a hard reset...
          ? { fields: state.fields, bandsInfo: state.bandsInfo }
          : {}
      );
    }

    case SHOW_LAYER: {
      return Object.assign({}, state, {
        layer: action.payload
      });
    }

    case SET_FIELDS: {
      return Object.assign({}, state, {
        fields: action.payload
      });
    }

    case SET_LIMIT: {
      return Object.assign({}, state, {
        limit: action.payload
      });
    }

    case SET_FILTERS: {
      return Object.assign({}, state, {
        filters: action.payload
      });
    }

    case SET_AREA_INTERSEACTION: {
      return Object.assign({}, state, {
        areaIntersection: action.payload
      });
    }

    case SET_VISUALIZATION_TYPE: {
      return Object.assign({}, state, {
        visualizationType: action.payload
      });
    }

    case SET_BAND: {
      return Object.assign({}, state, {
        band: action.payload
      });
    }

    case SET_BANDS_INFO: {
      return Object.assign({}, state, { bandsInfo: action.payload });
    }

    case SET_LAYER: {
      return Object.assign({}, state, {
        layer: action.payload
      });
    }

    case SET_TITLE: {
      return Object.assign({}, state, {
        title: action.payload
      });
    }

    case SET_CAPTION: {
      return Object.assign({}, state, {
        caption: action.payload
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

    case SET_BOUNDS: {
      return Object.assign({}, state, {
        bounds: action.payload
      });
    }

    case SET_DATASET_ID: {
      return Object.assign({}, state, {
        datasetId: action.payload
      });
    }

    case SET_TABLENAME: {
      return Object.assign({}, state, {
        tableName: action.payload
      });
    }

    default:
      return state;
  }
}

/**
 * ACTIONS
 * - addFilter
 * - setFilterValue
 * - removeFilter
 * - setFilters
 * - setColor
 * - removeColor
 * - setSize
 * - removeSize
 * - setCategory
 * - removeCategory
 * - setValue
 * - removeValue
 * - setChartType
 * - resetWidgetEditor
 * - showLayer
 * - setFields
 * - setOrderBy
 * - removeOrderBy
 * - setLimit
 * - setGeoInfo
 * - setTitle
*/
export function addFilter(filter) {
  return dispatch => dispatch({ type: ADD_FILTER, payload: filter });
}
export function setFilterValue(name, value, notNull) {
  return dispatch => dispatch({ type: SET_FILTER_VALUE, payload: { name, value, notNull } });
}
export function setFilters(filters) {
  return dispatch => dispatch({ type: SET_FILTERS, payload: filters });
}
export function removeFilter(filter) {
  return dispatch => dispatch({ type: REMOVE_FILTER, payload: filter });
}
export function setColor(color) {
  return dispatch => dispatch({ type: SET_COLOR, payload: color });
}
export function removeColor(color) {
  return dispatch => dispatch({ type: REMOVE_COLOR, payload: color });
}
export function setSize(size) {
  return dispatch => dispatch({ type: SET_SIZE, payload: size });
}
export function removeSize(size) {
  return dispatch => dispatch({ type: REMOVE_SIZE, payload: size });
}
export function setCategory(category) {
  return dispatch => dispatch({ type: SET_CATEGORY, payload: category });
}
export function removeCategory(category) {
  return dispatch => dispatch({ type: REMOVE_CATEGORY, payload: category });
}
export function setValue(value) {
  return dispatch => dispatch({ type: SET_VALUE, payload: value });
}
export function removeValue(value) {
  return dispatch => dispatch({ type: REMOVE_VALUE, payload: value });
}
export function setOrderBy(orderBy) {
  return dispatch => dispatch({ type: SET_ORDER_BY, payload: orderBy });
}
export function removeOrderBy(orderBy) {
  return dispatch => dispatch({ type: REMOVE_ORDER_BY, payload: orderBy });
}
export function setChartType(type) {
  return dispatch => dispatch({ type: SET_CHART_TYPE, payload: type });
}
export function setAggregateFunction(value) {
  return dispatch => dispatch({ type: SET_AGGREGATE_FN, payload: value });
}

/**
 * Reset the state of the widget editor
 * If hardReset is set to false, only the user selection will be erased,
 * not the results from the API
 * @export
 * @param {boolean} [hardReset=true]
 * @returns
 */
export function resetWidgetEditor(hardReset = true) {
  return dispatch => dispatch({ type: RESET, payload: hardReset });
}

export function showLayer(layer) {
  return dispatch => dispatch({ type: SHOW_LAYER, payload: layer });
}
export function setFields(layer) {
  return dispatch => dispatch({ type: SET_FIELDS, payload: layer });
}
export function setLimit(limit) {
  return dispatch => dispatch({ type: SET_LIMIT, payload: limit });
}

export function setAreaIntersection(id) {
  return dispatch => dispatch({ type: SET_AREA_INTERSEACTION, payload: id });
}

export function setVisualizationType(vis) {
  return dispatch => dispatch({ type: SET_VISUALIZATION_TYPE, payload: vis });
}

export function setBand(band) {
  return dispatch => dispatch({ type: SET_BAND, payload: band });
}

export function setBandsInfo(bandsInfo) {
  return dispatch => dispatch({ type: SET_BANDS_INFO, payload: bandsInfo });
}

export function setLayer(layer) {
  return dispatch => dispatch({ type: SET_LAYER, payload: layer });
}

export function setTitle(title) {
  return dispatch => dispatch({ type: SET_TITLE, payload: title });
}

export function setCaption(caption) {
  return dispatch => dispatch({ type: SET_CAPTION, payload: caption });
}

export function setZoom(zoom) {
  return dispatch => dispatch({ type: SET_ZOOM, payload: zoom });
}

export function setLatLng(latLng) {
  return dispatch => dispatch({ type: SET_LATLNG, payload: latLng });
}

export function setBounds(bounds) {
  return dispatch => dispatch({ type: SET_BOUNDS, payload: bounds });
}

export function setDatasetId(datasetId) {
  return dispatch => dispatch({ type: SET_DATASET_ID, payload: datasetId });
}

export function setTableName(tableName) {
  return dispatch => dispatch({ type: SET_TABLENAME, payload: tableName });
}
