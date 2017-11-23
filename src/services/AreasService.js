import 'isomorphic-fetch';

// Helpers
import { getConfig } from 'helpers/ConfigHelper';

export default class AreasService {
  /**
   * Fetch countries
   */
  fetchCountries() {
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
  getCountry(iso) {
    return fetch(`${getConfig().url}/query/134caa0a-21f7-451d-a7fe-30db31a424aa?sql=SELECT name_engli as label, st_asgeojson(the_geom_simple) as geojson, bbox as bounds from gadm28_countries WHERE iso = '${iso}'`)
      .then(response => response.json());
  }

  /**
   * Get Geostore
   */
  getGeostore(id) {
    return fetch(`${getConfig().url}/geostore/${id}`)
      .then(response => response.json());
  }
}
