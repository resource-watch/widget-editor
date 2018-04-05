import 'isomorphic-fetch';

// Helpers
import { getConfig } from 'helpers/ConfigHelper';

export default class AreasService {
  /**
   * Fetch countries
   */
  fetchCountries() { // eslint-disable-line class-methods-use-this
    return fetch(`${getConfig().url}/geostore/admin/list`)
      .then(response => response.json())
      .then(array => array.data.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        } else if (a.name > b.name) {
          return 1;
        } else { // eslint-disable-line no-else-return
          return 0;
        }
      }));
  }

  /**
   * Get country
   */
  getCountry(iso) { // eslint-disable-line class-methods-use-this
    return fetch(`${getConfig().url}/query/134caa0a-21f7-451d-a7fe-30db31a424aa?sql=SELECT name_engli as label, st_asgeojson(the_geom_simple) as geojson, bbox as bounds from gadm28_countries WHERE iso = '${iso}'`)
      .then(response => response.json());
  }

  /**
   * Get a geostore area
   */
  getArea(id) { // eslint-disable-line class-methods-use-this
    return fetch(`${getConfig().url}/geostore/${id}`)
      .then(response => response.json());
  }

  /**
   * Create a geostore area
   * @param {object} geojson Geojson
   * @returns {Promise<string>}
   */
  createArea(geojson) { // eslint-disable-line class-methods-use-this
    return fetch(`${getConfig().url}/geostore`, {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      body: JSON.stringify({ geojson })
    }).then((response) => {
      if (!response.ok) throw new Error('The file couldn\'t be processed correctly. Try again in a few minutes.');
      return response.json();
    }).then(({ data }) => data.id);
  }

  /**
   * Convert a file with one of these formats to a geojson one:
   * .csv, .kml, .kmz, .wkt, .shp
   * @param {File} file File to convert
   * @returns {Promise<Object>} geojson object
   */
  convertToJSON(file) { // eslint-disable-line class-methods-use-this
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${getConfig().url}/ogr/convert`, {
      method: 'POST',
      body: formData,
      multipart: true
    })
      .then((response) => {
        if (!response.ok) throw new Error('The file couldn\'t be processed correctly. Make sure the format is supported. If it is, try again in a few minutes.');
        return response.json();
      })
      .then(({ data }) => {
        const features = data.attributes.features;

        if (!features || !features.length || !Array.isArray(features)) {
          throw new Error('The geometry seems to be empty. Please make sure the file isn\'t empty.');
        }

        return data.attributes;
      });
  }
}
