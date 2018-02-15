import deepClone from 'lodash/cloneDeep';

/* eslint-disable */
const defaultChart = {
  "$schema": "https://vega.github.io/schema/vega/v3.0.json",
  "data": [
    { "name": "table" }
  ],
  "scales": [
    {
      "name": "x",
      "type": "linear",
      "range": "width",
      "zero": false,
      "domain": { "data": "table", "field": "x" }
    }
  ],
  "axes": [
    { "orient": "bottom", "scale": "x" }
  ],
  "marks": [
    {
      "type": "symbol",
      "from": { "data": "table" },
      "encode": {
        "update": {
          "x": { "scale": "x", "field": "x" },
          "y": { "signal": "height / 2" },
          "fillOpacity": { "value": 0.2 },
          "zindex": { "value":0 },
          "strokeOpacity": { "value": 0 }
        },
        "hover": {
          "opacity": { "value": 0.5 },
          "zindex": { "value":1 },
          "strokeOpacity": { "value": 1 }
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
    const xField = config.interaction_config[0].config.fields[0];
    xField.label = columns.x.alias || columns.x.name;
  }

  if (columns.x.type === 'number') {
    const allIntegers = data.length && data.every(d => parseInt(d.x, 10) === d.x);
    if (allIntegers) {
      const xField = config.interaction_config[0].config.fields[0];
      xField.format = '';
    }
  }

  if (columns.color.present) {
    // We add the color scale
    config.scales.push({
      "name": "c",
      "type": "ordinal",
      "domain": { "data": "table", "field": "color" },
      "range": { "scheme": "category10" }
    });

    // We update the marks
    config.marks[0].encode.enter.fill = {
      "scale": "c",
      "field": "color"
    };
  }

  if (columns.size.present) {
    // We add the scale
    config.scales.push({
      "name": "s",
      "type": "linear",
<<<<<<< HEAD
      "domain": { "data": "table", "field": "size" },
      "range": [10, 150],
=======
      "domain": {"data": "table", "field": "size"},
      "range": "dotSize",
>>>>>>> 854a9bf6d29094a378bcc2231585b3005d2a3a07
      "zero": false
    });

    // We update the marks
    config.marks[0].encode.update.size = {
      "scale": "s",
      "field": "size"
    };
  }

  return config;
};
