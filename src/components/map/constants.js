const BASEMAPS = {
  dark: {
    id: 'dark',
    value: 'https://api.mapbox.com/styles/v1/jcawri/cj0mhglox00a92slahe3obtpq/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamNhd3JpIiwiYSI6ImNqMDd6N2NybzAwMHcyd29iZWlsems0enEifQ.eIqQeyQn5oCLkyivGtiVLg',
    label: 'Dark',
    options: {
      attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> <a href="http://www.openstreetmap.org/about/" target="_blank">© OpenStreetMap</a>'
    }
  },
  light: {
    id: 'light',
    value: 'https://api.mapbox.com/styles/v1/jcawri/cj0mhlipx00aa2slaxd738db2/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamNhd3JpIiwiYSI6ImNqMDd6N2NybzAwMHcyd29iZWlsems0enEifQ.eIqQeyQn5oCLkyivGtiVLg',
    label: 'Light',
    options: {
      attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> <a href="http://www.openstreetmap.org/about/" target="_blank">© OpenStreetMap</a>'
    }
  },
  satellite: {
    id: 'satellite',
    value: 'https://api.mapbox.com/styles/v1/jcawri/cj0cl6k8h00bu2sobqze86bcm/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamNhd3JpIiwiYSI6ImNqMDd6N2NybzAwMHcyd29iZWlsems0enEifQ.eIqQeyQn5oCLkyivGtiVLg',
    label: 'Satellite',
    options: {
      attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> <a href="http://www.openstreetmap.org/about/" target="_blank">© OpenStreetMap</a>'
    }
  },
  terrain: {
    id: 'terrain',
    value: 'https://api.mapbox.com/styles/v1/jcawri/cj8emql45a7g92suc538h2shw/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamNhd3JpIiwiYSI6ImNqMDd6N2NybzAwMHcyd29iZWlsems0enEifQ.eIqQeyQn5oCLkyivGtiVLg',
    label: 'Terrain',
    options: {
      attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> <a href="http://www.openstreetmap.org/about/" target="_blank">© OpenStreetMap</a>'
    }
  }
};

const LABELS = {
  none: {
    id: 'none',
    label: 'No labels',
    value: 'no_labels'
  },
  light: {
    id: 'light',
    label: 'Labels light',
    value: 'https://api.mapbox.com/styles/v1/prepdata/cjc6dank251222rnm74g4qmin/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHJlcGRhdGEiLCJhIjoiY2piZmNrcTRjMXRsdzJxbm9uNm1nOXJtNSJ9.Jm14P-FBGvNxiaB-3mzSPw'
  },
  dark: {
    id: 'dark',
    label: 'Labels dark',
    value: 'https://api.mapbox.com/styles/v1/prepdata/cjc6c1e9o4wa42slf54h8ccix/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHJlcGRhdGEiLCJhIjoiY2piZmNrcTRjMXRsdzJxbm9uNm1nOXJtNSJ9.Jm14P-FBGvNxiaB-3mzSPw'
  }
};

const BOUNDARIES = {
  dark: {
    id: 'dark',
    label: 'Boundaries',
    value: 'https://api.mapbox.com/styles/v1/prepdata/cjbfcn5o51al72so1u5avqcur/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHJlcGRhdGEiLCJhIjoiY2piZmNrcTRjMXRsdzJxbm9uNm1nOXJtNSJ9.Jm14P-FBGvNxiaB-3mzSPw'
  }
};

export { BASEMAPS, LABELS, BOUNDARIES };
