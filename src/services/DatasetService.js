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
   * Get subscribable datasets
   */
  getSubscribableDatasets(includes = '') {
    return fetch(`${getConfig().url}/dataset?${[getConfig().applications].join(',')}&includes=${includes}&subscribable=true&page[size]=999`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }

  /**
   * Get dataset info
   * @returns {Promise}
   */
  fetchData(includes = '', applications = [getConfig().applications]) {
    return fetch(`${getConfig().url}/dataset/${this.datasetId}?application=${applications.join(',')}&includes=${includes}&page[size]=999`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }

  /**
   * Get filtered data
   * @returns {Promise}
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
   * Get Jiminy chart suggestions
   * NOTE: the API might be really slow to give a result (or even fail
   * to do so) so a timeout is necessary
   * @param {string} query - SQL query to pass to Jiminy
   * @param {number} [timeout=10000] Timeout before rejecting the provise
   * @returns {Promise<any>}
   */
  fetchJiminy(query) {
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


  /**
   *  Get max and min or values depending on field type
   *  @returns {Promise}
   */
  getFilter(fieldData) {
    return new Promise((resolve) => {
      const newFieldData = fieldData;
      if (fieldData.type === 'number' || fieldData.type === 'date') {
        this.getMinAndMax(fieldData.columnName, fieldData.tableName, fieldData.geostore).then((data) => {
          newFieldData.properties = data;
          resolve(newFieldData);
        });
      } else {
        this.getValues(fieldData.columnName, fieldData.tableName).then((data) => {
          newFieldData.properties = data;
          resolve(newFieldData);
        });
      }
    });
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
          .filter(f => !!f);
      });
  }

  getMinAndMax(columnName, tableName, geostore) {
    if (!this.tableName && !tableName) {
      throw Error('tableName was not specified.');
    }
    const table = tableName || this.tableName;
    const query = `SELECT min(${columnName}) AS min, max(${columnName}) AS max FROM ${table}`;
    const qGeostore = (geostore) ? `&geostore=${geostore}` : '';

    return new Promise((resolve) => {
      // TODO: remove cache param
      fetch(`https://api.resourcewatch.org/v1/query/${this.datasetId}?sql=${query}${qGeostore}`)
        .then((response) => {
          if (!response.ok) throw new Error(response.statusText);
          return response.json();
        })
        .then((jsonData) => {
          if (jsonData.data) {
            resolve(jsonData.data[0]);
          } else {
            resolve({});
          }
        });
    });
  }

  getValues(columnName, tableName, uniqs = true) {
    if (!this.tableName && !tableName) {
      throw Error('tableName was not specified.');
    }
    const table = tableName || this.tableName;
    const uniqQueryPart = uniqs ? `GROUP BY ${columnName}` : '';
    const query = `SELECT ${columnName} FROM ${table} ${uniqQueryPart} ORDER BY ${columnName}`;
    return new Promise((resolve) => {
      // TODO: remove cache param
      fetch(`https://api.resourcewatch.org/v1/query/${this.datasetId}?sql=${query}`)
        .then((response) => {
          if (response.status >= 400) throw new Error(response.statusText);
          return response.json();
        })
        .then((jsonData) => {
          const parsedData = (jsonData.data || []).map(data => data[columnName]);
          resolve(parsedData);
        });
    });
  }

  getLayers() {
    return fetch(`${getConfig().url}/dataset/${this.datasetId}/layer?app=rw`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }

  getDownloadURI(tableName, datasetName) {
    // emulates trigger of download creating a link in memory and clicking on it
    const a = document.createElement('a');
    a.href = `${getConfig().url}/download/${this.datasetId}?sql=SELECT * FROM ${tableName}`;
    a.style.display = 'none';
    a.download = datasetName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
   * Fetch several datasets at once
   * @static
   * @param {string[]} datasetIDs - List of dataset IDs
   * @param {string} [includes=''] - List of entities to fetch
   * (string of values separated with commas)
   * @param {string[]} [applications=[getConfig().applications]] List of applications
   * @returns {object[]}
   */
  static getDatasets(datasetIDs, includes = '', applications = [getConfig().applications]) {
    return fetch(`${getConfig().url}/dataset/?ids=${datasetIDs}&includes=${includes}&application=${applications.join(',')}&page[size]=999`)
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }

  searchDatasetsByConcepts(topics, geographies, dataTypes) {
    let counter = 0;
    const topicsSt = (topics || []).map((val, index) => `concepts[${counter}][${index}]=${val}`).join('&');
    counter++;
    const geographiesSt = (geographies || []).map((val, index) => `concepts[${counter}][${index}]=${val}`).join('&');
    counter++;
    const dataTypesSt = (dataTypes || []).map((val, index) => `concepts[${counter}][${index}]=${val}`).join('&');
    const querySt = `&${topicsSt}${geographiesSt}${dataTypesSt}`;


    return fetch(`${getConfig().url}/graph/query/search-datasets?${querySt}`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }
}
