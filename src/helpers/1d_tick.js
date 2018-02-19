import deepClone from 'lodash/cloneDeep';

/* eslint-disable */
const defaultChart = {
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
      "type": "rect",
      "from": { "data": "table" },
      "encode": {
        "update": {
          "xc": { "scale": "x", "field": "x" },
          "width": { "value": 1 },
          "height": { "signal": "height" },
          "fillOpacity": { "value": 0.4 }
        },
        "hover": {
          "fillOpacity": { "value": 0.1 }
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
            "column": "x",
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
  const xField = config.interaction_config[0].config.fields[0];
  xField.property = columns.x.alias || columns.x.name;

  if (columns.x.type === 'number') {
    const allIntegers = data.length && data.every(d => parseInt(d.x, 10) === d.x);
    if (allIntegers) {
      xField.format = 'd';

      const xAxis = config.axes.find(a => a.scale === 'x');
      xAxis.encode = {
        "labels": {
          "update": {
            "text": { "signal": "format(datum.value, 'd')" }
          }
        }
      };
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
     "domain": { "data": "table", "field": "size" },
     "range": [1, 5],
     "zero": false
   });

   // We update the marks
   config.marks[0].encode.enter.width = {
     "scale": "s",
     "field": "size"
   };
 }

  return config;
};
