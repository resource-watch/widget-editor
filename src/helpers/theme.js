import deepClone from 'lodash/cloneDeep';

// color schemes and sizes as global variables for easy mainteinance


const defaultTheme = {
  //height: 0, // Don't touch this without testing all the charts
  // and particularly the bar chart with or without
  // scrolling and its vertical alignment
  //padding: 'auto', // Do not set something different than 'auto'
  // because it will break several graphs
  // (primarly the bar and pie ones)
  //render: {
  //  retina: true
  //},
  // Color scheme for categories 6 / 15 colors. also added a gradient for ordinal ramps.
  range: {
    dotSize: [20, 250],
    category: [
      '#3BB2D0',
      '#2C75B0',
      '#FAB72E',
      '#EF4848',
      '#65B60D',
      '#717171'
    ],
    category20: [
      '#3BB2D0',
      '#2C75B0',
      '#FAB72E',
      '#EF4848',
      '#65B60D',
      '#C32D7B',
      '#F577B9',
      '#5FD2B8',
      '#F1800F',
      '#9F1C00',
      '#A5E9E3',
      '#B9D765',
      '#393F44',
      '#CACCD0',
      '#717171'
    ],
    ordinal: {scheme: 'greens'},
    ramp: {scheme: 'purples'}
  },
  axis: {
    labelFontSize: 13,
    labelFont: 'Lato',
    labelColor: '#717171',
    labelPadding: 10,
    ticks: true,
    tickSize: 8,
    tickColor: '#A9ABAD',
    tickOpacity: 0.5,
    tickExtra: false
  },
  axisX: {
    bandPosition: 0.5,
    domainWidth: 1.2,
    domainColor: '#A9ABAD',
    labelAlign: 'center',
    labelBaseline: 'top'
  },
  axisY: {
    domain: false,
    labelAlign: 'left',
    labelBaseline: 'bottom',
    tickOpacity: 0.5,
    grid: true,
    gridColor: '#A9ABAD',
    gridOpacity: 0.5
  },
  mark: {
    fill: '#3BB2D0'
  },
  symbol: {
    fill: '#3BB2D0',
    stroke: '#fff'
  },
  rect: {
    cornerRadius: 3,
    fill: '#3BB2D0'
  },
  line: {
    interpolate: 'monotone',
    stroke: '#3BB2D0',
    fillOpacity: 0
  }
};

/**
 * Return the theme of the vega chart
 * @param {boolean} [thumbnail=false]
 * @return {object}
 */
export default function (thumbnail = false) {
  const theme = deepClone(defaultTheme);

  if (thumbnail) {
    // We remove the configuration of each of
    // the axes
    delete theme.axis_x;
    delete theme.axis_y;
    theme.rage.dotSize = [10, 150];
    // We hide the axes and their ticks and
    // labels
    theme.axis = {
      ticks: 0,
      tickSize: 0,
      axisWidth: 0,
      tickLabelFontSize: 0
    };
  }

  return theme;
}
