import deepClone from 'lodash/cloneDeep';

// Helpers
import { getTimeFormat } from 'helpers/WidgetHelper';

/* eslint-disable */
const defaultChart = {
  "data": [
    {
      "name": "table",
      "transform": [
        { "type": "identifier", "as": "id" },
        { "type": "joinaggregate", "as": ["count"] }
      ]
    }
  ],
  "scales": [
    {
      "name": "x",
      "type": "band",
      "range": "width",
      "padding": 0.05,
      "domain": { "data": "table", "field": "id" }
    },
    {
      "name": "y",
      "type": "linear",
      "range": "height",
      "nice": true,
      "zero": true,
      "domain": { "data": "table", "field": "y" }
    }
  ],
  "axes": [
    {
      "orient": "bottom",
      "scale": "x",
      "labelOverlap": "parity",
      "ticks": false,
      "encode": {
        "labels": {
          "update": {
            "text": { "signal": "width < 300 || data('table')[0].count > 10 ? truncate(data('table')[datum.value - 1].x, 12) : data('table')[datum.value - 1].x" },
            "align": { "signal": "width < 300 || data('table')[0].count > 10 ? 'right' : 'center'" },
            "baseline": { "signal": "width < 300 || data('table')[0].count > 10 ? 'middle' : 'top'" },
            "angle": { "signal": "width < 300 || data('table')[0].count > 10 ? -90 : 0" }
          }
        }
      }
    },
    {
      "orient": "left",
      "scale": "y",
      "labelOverlap": "parity",
      "format": "s",
      "encode": {
        "labels": {
          "update": {
            "align": { "value": "right" },
            "baseline": { "value": "bottom" }
          }
        }
      }
    }
  ],
  "marks": [
    {
      "type": "rect",
      "from": { "data": "table" },
      "encode": {
        "update": {
          "opacity": { "value": 1 },
          "x": { "scale": "x", "field": "id" },
          "width": { "scale": "x", "band": 1 },
          "y": { "scale": "y", "field": "y" },
          "y2": { "scale": "y", "value": 0 }
        },
        "hover": {
          "opacity": { "value": 0.8 }
        }
      }
    }
  ],
  "interaction_config": [
    {
      "name": "tooltip",
      "config": {
        "fields": [
          {
            "column": "y",
            "property": "y",
            "type": "number",
            "format": ".2s"
          },
          {
            "column": "x",
            "property": "x",
            "type": "string",
            "format": ".2f"
          }
        ]
      }
    }
  ]
};

/**
 * Return the Vega chart configuration
 *
 * @export
 * @param {any} { columns, data, url, embedData, provider, band, theme }
 */
export default function ({ columns, data, url, embedData, provider, band, theme }) {
  const config = deepClone(defaultChart);

  if (embedData) {
    // We directly set the data
    config.data[0].values = data;

    // We also add a legend to customize the color
    // of the bars
    config.legend = [
      {
        type: 'color',
        label: null,
        shape: 'square',
        values: [
          { label: 'Value', value: theme.range.category20[0] }
        ]
      }
    ];
  } else {
    // We set the URL of the dataset
    config.data[0].url = url;
    config.data[0].format = {
      "type": "json",
      "property": "data"
    };

    // If the dataset is a raster one, we save the provider and the
    // band in the config so we can later re-render the chart
    // correctly (we need the info to parse the data)
    if (provider && band) {
      config.data[0].format = { provider, band };
    }
  }

  // We save the name of the columns for the tooltip
  const xField = config.interaction_config[0].config.fields[1];
  {
    const yField = config.interaction_config[0].config.fields[0];
    xField.property = columns.x.alias || columns.x.name;
    yField.property = columns.y.alias || columns.y.name;
  }

  // If the x column is a date, we need to use a
  // a temporal x axis and parse the x column as a date
  if (columns.x.type === 'date') {
    // We update the axis and tooltip
    const xAxis = config.axes.find(a => a.scale === 'x');
    xField.type = 'date';
    xField.format = '';

    // We parse the x column as a date
    if (!config.data[0].format) config.data[0].format = {};
    config.data[0].format.parse = { x: 'date' };

    // We compute an optimal format for the ticks
    const temporalData = data.map(d => d.x);
    const format = getTimeFormat(temporalData);
    if (format) {
      xField.format = format;
      xAxis.encode.labels.update.text = { "signal": `utcFormat(data('table')[datum.value - 1].x, '${format}')` };
    }

    // We also set the format for the tooltip
    config.interaction_config[0].config.fields[1].format = format;
  } else if (columns.x.type === 'number') {
    xField.type = 'number';

    const allIntegers = data.length && data.every(d => parseInt(d.x, 10) === d.x);
    if (allIntegers) {
      xField.format = 'd';

      const xAxis = config.axes.find(a => a.scale === 'x');
      xAxis.encode.labels.update.text = { "signal": "format(data('table')[datum.value - 1].x, 'd')" };
    }
  }

  return config;
};
