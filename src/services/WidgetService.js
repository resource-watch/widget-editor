import 'isomorphic-fetch';

// Helpers
import { getConfig } from 'helpers/ConfigHelper';

export default class WidgetService {
  constructor(widgetId) {
    this.widgetId = widgetId;
  }

  fetchData(includes = '') {
    return fetch(`${getConfig().url}/widget/${this.widgetId}?application=${getConfig().applications}&env=${getConfig().env}&includes=${includes}&page[size]=999`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }

  /**
   * Create a widget in the API and its associated metadata (optional)
   * @param {string} datasetId ID of the dataset
   * @param {string} token Token of the user
   * @param {object} widgetBody Content of request to create the widget
   * @param {object} metadataBody Content of the request to create the metadata
   * @param {object} layerBody Content of the request to create the layer, if any
   */
  static saveUserWidget(datasetId, token, widgetBody, metadataBody = null, layerBody) {
    const widget = Object.assign({}, widgetBody, {
      application: [getConfig().applications],
      published: false,
      default: false,
      dataset: datasetId
    });

    const metadata = !metadataBody
      ? null
      : Object.assign({}, metadataBody, {
        language: getConfig().locale,
        application: getConfig().applications
      });

    const layer = !layerBody
      ? null
      : Object.assign({}, layerBody, {
        application: getConfig().applications.split(',')
      });

    const getRequestOptions = body => ({
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    return new Promise((resolve, reject) => {
      if (layer) {
        fetch(`${getConfig().url}/dataset/${datasetId}/layer`, getRequestOptions(layer))
          .then(resolve)
          .catch(reject);
        return;
      }

      resolve(null);
    })
      .then((res) => {
        if (layer) {
          if (!res.ok) {
            console.error('Unable to create the layer');
            throw new Error(res.statusText);
          }
          return res.json();
        }

        return res;
      })
      .then(({ data }) => {
        if (layer) {
          const layerId = data.id;
          widget.widgetConfig.layer_id = layerId;
          widget.widgetConfig.paramsConfig.layer = layerId;
        }

        return fetch(`${getConfig().url}/dataset/${datasetId}/widget`, getRequestOptions(widget));
      })
      .then((res) => {
        if (!res.ok) {
          console.error('Unable to create the widget');
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        if (metadata) {
          return fetch(`${getConfig().url}/dataset/${datasetId}/widget/${data.data.id}/metadata`, getRequestOptions(metadata));
        }
        return data;
      })
      .then((res) => {
        if (metadata) {
          if (!res.ok) {
            console.error('Unable to create the metadata');
            throw new Error(res.statusText);
          }
          return res.json();
        }

        return res;
      });
  }

  /**
   * Update a widget of the API and its associated metadata (optional)
   * @param {string} datasetId ID of the dataset
   * @param {string} widgetId ID of the dataset
   * @param {string} token Token of the user
   * @param {object} widgetBody Content of request to create the widget
   * @param {object} metadataBody Content of the request to create the metadata
   * @param {object} layerBody Content of the request to create the layer, if any
   */
  static updateUserWidget(datasetId, widgetId, token, widgetBody, metadataBody = null, layerBody) {
    const widget = Object.assign({}, widgetBody, {
      application: [getConfig().applications],
      published: false,
      default: false,
      dataset: datasetId
    });

    const metadata = !metadataBody
      ? null
      : Object.assign({}, metadataBody, {
        language: getConfig().locale,
        application: getConfig().applications
      });

    const getRequestOptions = body => ({
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const layer = !layerBody
      ? null
      : Object.assign({}, layerBody, {
        application: getConfig().applications.split(',')
      });

    return new Promise((resolve, reject) => {
      if (layer) {
        const requestOptions = getRequestOptions(layer);
        requestOptions.method = 'POST';

        fetch(`${getConfig().url}/dataset/${datasetId}/layer`, requestOptions)
          .then(resolve)
          .catch(reject);
        return;
      }

      resolve(null);
    })
      .then((res) => {
        if (layer) {
          if (!res.ok) {
            console.error('Unable to create the layer');
            throw new Error(res.statusText);
          }
          return res.json();
        }

        return res;
      })
      .then(({ data }) => {
        if (layer) {
          const layerId = data.id;
          widget.widgetConfig.layer_id = layerId;
          widget.widgetConfig.paramsConfig.layer = layerId;
        }

        return fetch(`${getConfig().url}/dataset/${datasetId}/widget/${widgetId}`, getRequestOptions(widget));
      })
      .then((res) => {
        if (!res.ok) {
          console.error('Unable to update the widget');
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        if (metadata) {
          return fetch(`${getConfig().url}/dataset/${datasetId}/widget/${widgetId}/metadata`, getRequestOptions(metadata));
        }
        return data;
      })
      .then((res) => {
        if (metadata) {
          if (!res.ok) {
            console.error('Unable to update the metadata');
            throw new Error(res.statusText);
          }
          return res.json();
        }

        return res;
      });
  }

  static removeUserWidget(widgetId, token) {
    return fetch(`${getConfig().url}/widget/${widgetId}?env=${getConfig().env}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      });
  }

  static getUserWidgets(userId, sortByUpdatedAt = true, direction = 'asc', includes = '') {
    const directionPart = (direction === 'asc') ? '&sort=updatedAt' : '&sort=-updatedAt';
    const sortSt = sortByUpdatedAt ? directionPart : '';
    return fetch(`${getConfig().url}/widget/?userId=${userId}${sortSt}&includes=${includes}&application=${getConfig().applications}&env=${getConfig().env}&page[size]=999`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then(jsonData => jsonData.data);
  }

  static getUserWidgetCollections(user) {
    return fetch(`${getConfig().url}/vocabulary/widget_collections?${[getConfig().applications].join(',')}`)
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      })
      .then((jsonData) => {
        const dataObj = jsonData.data;
        const result = [];
        if (dataObj.length) {
          const widgets = dataObj[0].attributes.resources
            .filter(val => val.type === 'widget')
            .map(val => ({ id: val.id, tags: val.tags }))
            .filter(val => val.tags.find(tag => tag.startsWith(user.id)));
          return widgets;
        }
        return result;
      });
  }

  static updateWidgetCollections(user, widget, widgetCollections, method = 'PATCH') {
    const bodyObj = {
      tags: widgetCollections.map(val => `${user.id}-${val}`)
    };
    return fetch(`${getConfig().url}/dataset/${widget.attributes.dataset}/widget/${widget.id}/vocabulary/widget_collections`, {
      method,
      body: method === 'DELETE' ? '' : JSON.stringify(bodyObj),
      headers: {
        'Content-Type': 'application/json',
        Authorization: user.token
      }
    })
      .then((response) => {
        if (response.status >= 400) throw new Error(response.statusText);
        return response.json();
      });
  }
}
