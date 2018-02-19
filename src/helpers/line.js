import deepClone from 'lodash/cloneDeep';

// Helpers
import { getTimeFormat } from 'helpers/WidgetHelper';

/* eslint-disable */
const defaultChart = {
  "signals": [
    {
      "name": "hover",
      "value": null,
      "on": [
        {
          "events": "@cell:mouseover",
          "update": "datum"
        },
        {
          "events": "@cell:mouseout",
          "update": "null"
        }
      ]
    }
  ],
  "data": [
    { "name": "table" },
    {
      "name":"dots",
      "source":"table",
      "transform":[
        {
          "type": "filter",
          "expr": "hover && hover.datum.x === datum.x"

        }
      ]
    }
  ],
  "scales": [
    {
      "name": "x",
      "type": "linear",
      "range": "width",
      "nice": true,
      "round": true,
      "zero": false,
      "domain": { "data": "table", "field": "x" }
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
      "encode": {
        "labels": {
          "update": {
            "align": { "value": "center" },
            "baseline": { "value": "top"}
          }
        }
      }
    },
    {
      "orient": "left",
      "scale": "y",
      "labelOverlap": "parity"
    }
  ],
  "marks": [
    {
      "name": "lines",
      "interactive": false,
      "type": "line",
      "from": { "data": "table" },
      "encode": {
        "enter": {
          "x": { "scale": "x", "field": "x" },
          "y": { "scale": "y", "field": "y" },
          "strokeCap": { "value": "round" },
          "strokeWidth": { "value": 2 }
        }
      }
    },
    {
      "name": "points",
      "interactive": false,
      "type": "symbol",
      "from": {"data": "dots"},
      "encode": {
        "enter": {
          "x": { "scale": "x", "field": "x" },
          "y": { "scale": "y", "field": "y" }
        },
        "update": {
          "opacity": { "value": 1 }
        }
      }
    },
    {
      "name": "cell",
      "type": "path",
      "from": { "data": "lines" },
      "transform": [
        {
          "type": "voronoi",
          "x": "datum.x",
          "y": "datum.y",
          "size": [
            { "signal": "width" },
            { "signal": "height" }
          ]
        }
      ],
      "encode": {
        "update": {
          "path": { "field": "path" },
          "opacity": { "value": 0 }
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
            "column": "datum.y",
            "property": "y",
            "type": "number",
            "format": ".2s"
          },
          {
            "column": "datum.x",
            "property": "x",
            "type": "number",
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
 * @param {any} { columns, data, url, embedData }
 */
export default function ({ columns, data, url, embedData }) {
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
  }

  // We save the name of the columns for the tooltip
  const xField = config.interaction_config[0].config.fields[1];
  {
    const yField = config.interaction_config[0].config.fields[0];
    xField.property = columns.x.alias || columns.x.name;
    yField.property = columns.y.alias || columns.y.name;
  }

  // If the x column is a date, we need to use a
  // temporal x scale and parse the x column as a date
  if (columns.x.type === 'date') {
    // We update the scale
    const xScale = config.scales.find(scale => scale.name === 'x');
    xScale.type = 'utc';
    xScale.domain.sort =  true;

    // We update the tooltip
    xField.type = 'date';
    xField.format = '';

    // We parse the x column as a date
    if (!config.data[0].format) config.data[0].format = {};
    config.data[0].format.parse = { x: 'date' };

    // We compute an optimal format for the tooltip
    const temporalData = data.map(d => d.x);
    const format = getTimeFormat(temporalData);

    if (format) {
      const xAxis = config.axes.find(a => a.scale === 'x');
      xAxis.encode.labels.update.text = { "signal": `utcFormat(datum.value, '${format}')` };
      xField.format = format;
    }

  } else if (columns.x.type === 'number') {
    const allIntegers = data.length && data.every(d => parseInt(d.x, 10) === d.x);
    if (allIntegers) {
      xField.format = 'd';

      const xAxis = config.axes.find(a => a.scale === 'x');
      xAxis.encode.labels.update.text = { "signal": "format(datum.value, 'd')" };
    }
  }

  // If all the "dots" have the exact same y position,
  // the chart won't have any height
  // To fix that, we force the domain of the y scale
  // to be around the value
  const oneYValue = data.length && data.every(d => d.y === data[0].y);
  if (data.length === 1 || oneYValue) {
    const yScale = config.scales.find(scale => scale.name === 'y');

    // The step is 20% of the value
    const step = data[0].y * 0.2;

    // We fix the domain around the value
    yScale.domain = [data[0].y - step, data[0].y + step];
  }

  return config;
};
