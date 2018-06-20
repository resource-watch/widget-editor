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
      "name": "y",
      "type": "band",
      "range": "height",
      "padding": 0.05,
      "domain": { "data": "table", "field": "id" }
    },
    {
      "name": "x",
      "type": "linear",
      "range": "width",
      "nice": true,
      "zero": true,
      "domain": { "data": "table", "field": "y" }
    }
  ],
  "axes": [
    {
      "orient": "left",
      "scale": "y",
      "ticks":false,
      "grid": false,
      "encode": {
        "labels": {
          "update": {
            "text": { "signal": "truncate(data('table')[datum.value - 1].x, 12)" },
            "align": { "signal": "'right'" },
            "baseline": { "signal": "'middle'" }
          }
        }
      }
    },
    {
      "orient": "bottom",
      "scale": "x",
      "labelOverlap": "parity",
      "format": "s",
      "grid": true,
      "encode": {
        "labels": {
          "update": {
            "align": { "value": "center" },
            "baseline": { "value": "middle" }
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
          "opacity":{"value":1},
          "x": { "scale": "x", "value": 0 },
          "width": { "scale": "x", "field": "y" },
          "y": { "scale": "y", "field": "id" },
          "height": { "scale": "y", "band": 1 },
        },
        "hover":{
          "opacity":{"value":0.8}
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
 * @param {any} { columns, data, url, embedData, provider, band }
 */
export default function ({ columns, data, url, embedData, provider, band  }) {
  const config = deepClone(defaultChart);

  if (embedData) {
    // We directly set the data
    config.data[0].values = data;
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

  if (columns.color.present) {
    // We add the color scale
    config.scales.push({
      "name": "c",
      "type": "ordinal",
      "domain": { "data": "table", "field": "color" },
      "range": { "scheme": "category20" }
    });

    // We update the marks
    config.marks[0].encode.enter.fill = {
      "scale": "c",
      "field": "color"
    };
  }

  // We save the name of the columns for the tooltip
  const xField = config.interaction_config[0].config.fields[1];
  {
    const yField = config.interaction_config[0].config.fields[0];
    xField.property = columns.x.alias || columns.x.name;
    yField.property = columns.y.alias || columns.y.name;
  }

  // If the x column is a date, we need to use a
  // a temporal y axis and parse the x column as a date
  if (columns.x.type === 'date') {
    // We update the axis and tooltip
    const yAxis = config.axes.find(a => a.scale === 'y');
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
      yAxis.encode.labels.update.text = { "signal": `utcFormat(data('table')[datum.value - 1].x, '${format}')` };
    }

    // We also set the format for the tooltip
    config.interaction_config[0].config.fields[1].format = format;
  } else if (columns.x.type === 'number') {
    xField.type = 'number';

    const allIntegers = data.length && data.every(d => parseInt(d.x, 10) === d.x);
    if (allIntegers) {
      xField.format = 'd';

      const yAxis = config.axes.find(a => a.scale === 'y');
      yAxis.encode.labels.update.text = { "signal": "format(data('table')[datum.value - 1].x, 'd')" };
    }
  }

  return config;
};
