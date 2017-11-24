import 'isomorphic-fetch';

// Helpers
import { getConfig } from 'helpers/ConfigHelper';

export default class UserService {
  constructor(token, email) {
    this.token = token;
    this.email = email;
  }

  /**
   * Gets the user that is currently logged
   */
  getLoggedUser() {
    return new Promise((resolve) => {
      fetch(`${getConfig().authUrl}/check-logged`, {
        headers: {
          Authorization: this.token
        }
      })
        .then(response => response.json())
        .then(jsonData => resolve(jsonData.data));
    });
  }

  /**
   * Gets the contents that have been starred/favourited by the user that is
   * currently logged
   */
  getFavouriteWidgets() {
    return this.getFavourites(this.token, 'widget', true);
  }

  /**
   * Gets the contents that have been starred/favourited by the user that is
   * currently logged
   */
  getFavourites(resourceType = null, include = true) {
    const resourceTypeSt = (resourceType !== null) ? `&resourceType=${resourceType}` : '';
    return new Promise((resolve) => {
      fetch(`${getConfig().url}/favourite?include=${include}${resourceTypeSt}`, {
        headers: {
          Authorization: this.token
        }
      })
        .then(response => response.json())
        .then(jsonData => resolve(jsonData.data));
    });
  }

  /**
   * Deletes a favourite
   * @param {string} resourceId ID of the resource that will be unfavourited
   */
  deleteFavourite(resourceId) {
    return fetch(`${getConfig().url}/favourite/${resourceId}`, {
      method: 'DELETE',
      headers: { Authorization: this.token }
    }).then(response => response.json());
  }

  /**
   * Creates a new favourite for a widget
   * @param {string} widgetId Widget ID
   */
  createFavouriteWidget(widgetId) {
    return this.createFavourite('widget', widgetId, this.token);
  }

  /**
   * Creates a new favourite for a resource
   * @param {'dataset'|'layer'|'widget'} resourceType Type of the resource
   * @param {string} resourceId Resource ID
   */
  createFavourite(resourceType, resourceId) {
    const bodyObj = {
      resourceType,
      resourceId
    };
    return fetch(`${getConfig().url}/favourite`, {
      method: 'POST',
      body: JSON.stringify(bodyObj),
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.token
      }
    })
      .then(response => response.json());
  }

  /**
   * Creates a subscription for a pair of dataset and country
   */
  createSubscriptionToArea(areaId, datasets, datasetsQuery, name = '') {
    const bodyObj = {
      name,
      application: getConfig().applications,
      language: 'en',
      datasets,
      datasetsQuery,
      resource: {
        type: 'EMAIL',
        content: this.email
      },
      params: {
        area: areaId
      }
    };
    return fetch(`${getConfig().url}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify(bodyObj),
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.token
      }
    })
      .then(response => response.json());
  }

  /**
   *  Update Subscription
   */
  updateSubscriptionToArea(subscriptionId, datasets, datasetsQuery) {
    const bodyObj = {
      application: getConfig().applications,
      language: 'en',
      datasets,
      datasetsQuery
    };
    return fetch(`${getConfig().url}/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(bodyObj),
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.token
      }
    })
      .then(response => response.json());
  }

  /**
   *  Get Subscriptions
   */
  getSubscriptions() {
    return new Promise((resolve) => {
      fetch(`${getConfig().url}/subscriptions?${[getConfig().applications].join(',')}`, {
        headers: {
          Authorization: this.token
        }
      })
        .then(response => response.json())
        .then(jsonData => resolve(jsonData.data));
    });
  }

  /**
   * Deletes a subscription
   * @param {string} subscriptionId ID of the subscription that will be deleted
   * @returns {Promise}
   */
  deleteSubscription(subscriptionId) {
    return fetch(`${getConfig().url}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: this.token
      }
    })
      .then(response => response.json());
  }

  /**
   * Get user areas
   */
  getUserAreas() {
    return new Promise((resolve, reject) => {
      fetch(`${getConfig().url}/area?${[getConfig().applications].join(',')}`, {
        headers: {
          Authorization: this.token
        }
      })
        .then((response) => {
          if (response.ok) return response.json();
          throw new Error(response.statusText);
        })
        .then(jsonData => resolve(jsonData.data))
        .catch(err => reject(err.message));
    });
  }

  /**
   * Create new area
   */
  createNewArea(name, geostore) {
    const bodyObj = {
      name,
      application: getConfig().applications,
      geostore
    };

    return fetch(`${getConfig().url}/area`, {
      method: 'POST',
      body: JSON.stringify(bodyObj),
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.token
      }
    })
      .then(response => response.json());
  }

  /**
  * Update area
  */
  updateArea(id, name) {
    const bodyObj = {
      name,
      application: getConfig().applications
    };

    return fetch(`${getConfig().url}/area/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(bodyObj),
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.token
      }
    })
      .then(response => response.json());
  }

  /**
   * Deletes an area
   * @param {string} areaId ID of the area that will be deleted
   * @returns {Promise}
   */
  deleteArea(areaId) {
    return fetch(`${getConfig().url}/area/${areaId}`, {
      method: 'DELETE',
      headers: {
        Authorization: this.token
      }
    })
      .then(response => response.json());
  }

  /**
   * Get area
   */
  getArea(id) {
    return fetch(`${getConfig().url}/area/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.token
      }
    })
      .then(response => response.json());
  }
}
