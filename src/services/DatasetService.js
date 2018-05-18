import 'isomorphic-fetch';

// Helpers
import { getSimplifiedFieldType } from 'helpers/WidgetHelper';
import { getConfig } from 'helpers/ConfigHelper';

/**
 * Dataset service
 * @example:
    import DatasetService from '..path';
    const ds = new DatasetService('42de3f98-ba1c-4572-a227-2e18d45239a5');
    ds.getFilters().then((data) => {
      console.log(data)
    });
 */
export default class DatasetService {
  constructor(datasetId) {
    this.datasetId = datasetId;
  }

  /**
   * Get dataset info
   */
  fetchData(includes = '', applications = [getConfig().applications]) {
    return fetch(`${getConfig().url}/dataset/${this.datasetId}?application=${applications.join(',')}&env=${getConfig().env}&language=${getConfig().locale}&includes=${includes}&page[size]=999`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }

  /**
   * Get filtered data
   */
  fetchFilteredData(query) {
    return fetch(`${getConfig().url}/query/${this.datasetId}?${query}`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }

  /**
   * Returns the list of fields of the dataset
   * @returns {{ columnName: string, columnType: string }[]}
   */
  getFields() {
    return fetch(`${getConfig().url}/fields/${this.datasetId}`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        /** @type {{ [field: string]: { type: string } }} */
        const fieldToType = data.fields;

        return Object.keys(fieldToType)
          .map((field) => {
            // We make sure the type of the field is the simplified
            // version of it
            const columnType = getSimplifiedFieldType(fieldToType[field].type);
            if (!columnType) return null;

            return {
              columnName: field,
              columnType
            };
          })
          // We filter out the fields whose type is not supported
          .filter(field => !!field && field.columnName !== 'cartodb_id');
      });
  }

  getLayers() {
    return fetch(`${getConfig().url}/dataset/${this.datasetId}/layer?app=${getConfig().applications}&env=${getConfig().env}&page[size]=9999`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }

  /**
   * Get a specific layer
   * @param {string} layerId Layer ID
   * @returns {Promise<object>}
   */
  getLayer(layerId) {
    return fetch(`${getConfig().url}/dataset/${this.datasetId}/layer/${layerId}?app=${getConfig().applications}&env=${getConfig().env}`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }

  getSimilarDatasets() {
    return fetch(`${getConfig().url}/graph/query/similar-dataset/${this.datasetId}`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }

  /**
   * Return the min an max value of a numeric column
   * @param {string} columnName Name of the field/column
   * @param {string} tableName Name of the table
   * @param {string} [geostore] ID of the geostore, if any
   * @returns {{ min: number, max: number }}
   */
  getColumnMinAndMax(columnName, tableName, geostore) {
    const query = `SELECT min(${columnName}) AS min, max(${columnName}) AS max FROM ${tableName}`;
    const qGeostore = geostore ? `&geostore=${geostore}` : '';

    return this.fetchFilteredData(`sql=${query}${qGeostore}`)
      .then(data => data ? data[0] : {});
  }

  /**
   * Get the values of a columns
   * @param {string} columnName Name of the field/column
   * @param {string} tableName Name of the table
   * @param {boolean} [uniq=true] Get unique value
   * @param {string} [geostore] ID of the geostore, if any
   */
  getColumnValues(columnName, tableName, uniq = true, geostore) {
    const uniqQueryPart = uniq ? `GROUP BY ${columnName}` : '';
    const query = `SELECT ${columnName} FROM ${tableName} ${uniqQueryPart} ORDER BY ${columnName}`;
    const qGeostore = geostore ? `&geostore=${geostore}` : '';

    return this.fetchFilteredData(`sql=${query}${qGeostore}`)
      .then(data => (data || []).map(d => d[columnName]));
  }

  /**
   * Get Jiminy chart suggestions
   * NOTE: the API might be really slow to give a result (or even fail
   * to do so)
   * @static
   * @param {string} query - SQL query to pass to Jiminy
   * @param {number} [timeout=10000] Timeout before rejecting the provise
   * @returns {Promise<any>}
   */
  static getJiminySuggestions(query) {
    return fetch(`${getConfig().url}/jiminy`, {
      method: 'POST',
      body: JSON.stringify({ sql: query }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }
}
