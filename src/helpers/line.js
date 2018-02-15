import deepClone from 'lodash/cloneDeep';

// Helpers
import { getTimeFormat } from 'helpers/WidgetHelper';

/* eslint-disable */
const defaultChart = {
  "$schema": "https://vega.github.io/schema/vega/v3.0.json",
  
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
    }],
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
      "round":true,
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
      "interpolate": { "value": "linear" },
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
      "from": {
        "data": "table"
      },
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
    { "name": "cell",
      "type": "path",
      "from": { "data": "lines" },
      "encode": {
        "update": {
          "path": {
            "field": "path"
          },
          "fill": {
            "value": "red"
          },
          "opacity": {
            "value": 0
          }
        }
      },
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
      ]
    }
  ],
  "interaction_config": [
    {
      "name": "tooltip",
      "config": {
        "fields": [
          {
            "key": "y",
            "label": "y",
            "format": ".2s"
          },
          {
            "key": "x",
            "label": "x",
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
  {
    const xField = config.interaction_config[0].config.fields[1];
    const yField = config.interaction_config[0].config.fields[0];
    xField.label = columns.x.alias || columns.x.name;
    yField.label = columns.y.alias || columns.y.name;
  }

  // If the x column is a date, we need to use a
  // temporal x scale and parse the x column as a date
  if (columns.x.type === 'date') {
    // We update the scale
    const xScale = config.scales.find(scale => scale.name === 'x');
    xScale.type = 'utc';
    xScale.domain.sort =  true;

    // We parse the x column as a date
    if (!config.data[0].format) config.data[0].format = {};
    config.data[0].format.parse = { x: 'date' };

    // We compute an optimal format for the tooltip
    const temporalData = data.map(d => d.x);
    const format = getTimeFormat(temporalData);
    config.interaction_config[0].config.fields[1].format = format;
  } else if (columns.x.type === 'number') {
    const allIntegers = data.length && data.every(d => parseInt(d.x, 10) === d.x);
    if (allIntegers) {
      const xField = config.interaction_config[0].config.fields[1];
      xField.format = '';
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
