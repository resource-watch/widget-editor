import deepClone from 'lodash/cloneDeep';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';

// Helpers
import { getTimeFormat } from 'helpers/WidgetHelper';

/* eslint-disable */
const defaultChart = {
  "data": [
    {
      "name": "table",
      "transform": [
        { "type": "joinaggregate", "ops": ["distinct"], "fields": ["x"], "as": ["count"] }
      ]
    }
  ],
  "scales": [
    {
      "name": "x",
      "type": "band",
      "range": "width",
      "padding": 0.1,
      "domain": { "data": "table", "field": "x" }
    },
    {
      "name": "y",
      "type": "linear",
      "range": "height",
      "nice": true,
      "zero": true,
      "domain": { "data": "table", "field": "y" }
    },
    {
      "name": "color",
      "type": "ordinal",
      "range": "category20",
      "domain": { "data": "table", "field": "color" }
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
            "text": { "signal": "width < 300 || data('table')[0].count > 10 ? truncate(datum.value, 12) : datum.value" },
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
      "type": "group",
      "from": {
        "facet": {
          "data": "table",
          "name": "facet",
          "groupby": "x"
        }
      },
      "encode": {
        "enter": {
          "x": { "scale": "x", "field": "x" }
        }
      },
      "signals": [
        { "name": "width", "update": "bandwidth('x')" }
      ],
      "scales": [
        {
          "name": "pos",
          "type": "band",
          "range": "width",
          "domain": {
            "data": "facet",
            "field": "color",
            "sort": true
          }
        }
      ],
      "marks": [
        {
          "type": "rect",
          "from": { "data": "facet" },
          "encode": {
            "update": {
              "opacity": { "value": 1 },
              "fill": { "scale": "color", "field": "color" },
              "x": { "scale": "pos", "field": "color" },
              "width": { "scale": "pos", "band": 1 },
              "y": { "scale": "y", "field": "y" },
              "y2": { "scale": "y", "value": 0 }
            },
            "hover": {
              "opacity": { "value": 0.8 }
            }
          }
        }
      ]
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
            "column": "color",
            "property": "color",
            "type": "string",
            "format": ".2f"
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
export default function ({ columns, data, url, embedData, provider, band, theme }) {
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

  // We save the name of the columns for the tooltip
  const xField = config.interaction_config[0].config.fields[2];
  {
    const yField = config.interaction_config[0].config.fields[0];
    const colorField = config.interaction_config[0].config.fields[1];
    xField.property = columns.x.alias || columns.x.name;
    colorField.property = columns.color.alias || columns.color.name;
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
      xAxis.encode.labels.update.text = { "signal": `utcFormat(datum.value, '${format}')` };
    }

    // We also set the format for the tooltip
    config.interaction_config[0].config.fields[1].format = format;
  } else if (columns.x.type === 'number') {
    xField.type = 'number';

    const allIntegers = data.length && data.every(d => parseInt(d.x, 10) === d.x);
    if (allIntegers) {
      xField.format = 'd';

      const xAxis = config.axes.find(a => a.scale === 'x');
      xAxis.encode.labels.update.text = { "signal": "format(datum.value, 'd')" };
    }
  }

  // We add a legend to the chart
  const colorValuesOrder = [...new Set(data.map(d => d.color))];
  const getColor = d => colorRange[colorValuesOrder.indexOf(d.color)];
  const colorRange = theme.range.category20;
  const values = sortBy(uniqBy(data, 'color'), ['color'], ['asc'])
    .map(d => ({ label: d.color, value: getColor(d), type: columns.color.type }));

  config.legend = [
    {
      type: 'color',
      label: null,
      shape: 'square',
      values
    }
  ];

  return config;
};
