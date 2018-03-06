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

  static saveUserWidget(widget, datasetId, token) {
    const widgetObj = {
      application: [getConfig().applications],
      // published: false,
      // default: false,
      dataset: datasetId
    };
    const bodyObj = Object.assign({}, widget, widgetObj);
    return fetch(`${getConfig().url}/dataset/${datasetId}/widget`, {
      method: 'POST',
      body: JSON.stringify(bodyObj),
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

  static updateUserWidget(widget, datasetId, widgetId, token) {
    console.log(widget)
    return fetch(`${getConfig().url}/dataset/${datasetId}/widget/${widgetId}`, {
      method: 'PATCH',
      body: JSON.stringify(widget),
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
