import deepClone from 'lodash/cloneDeep';
import { defaultTheme } from 'src/helpers/theme';

/* eslint-disable */
const defaultChart = {
  "data": [
    { "name": "table" }
  ],
  "scales": [
    {
      "name": "x",
      "type": "linear",
      "round": true,
      "nice": true,
      "zero": false,
      "domain": { "data": "table", "field": "x" },
      "range": "width"
    },
    {
      "name": "y",
      "type": "linear",
      "round": true,
      "nice": true,
      "zero": true,
      "domain": { "data": "table", "field": "y" },
      "range": "height"
    }
  ],
  "axes": [
    {
      "scale": "x",
      "labelOverlap": "parity",
      "orient": "bottom",
      "encode": {
        "labels": {
          "update": {
            "align": { "value": "center" },
            "baseline": { "value": "top" }
          }
        }
      }
    },
    {
      "scale": "y",
      "labelOverlap": "parity",
      "orient": "left",
      "format": "s"
    }
  ],
  "marks": [
    {
      "name": "marks",
      "type": "symbol",
      "from": { "data": "table" },
      "encode": {
        "update": {
          "x": { "scale": "x", "field": "x" },
          "y": { "scale": "y", "field": "y" },
          "strokeOpacity": { "value": 0 },
          "zindex": { "value": 0 },
          "opacity": { "value": 0.5 }
        },
        "hover": {
          "strokeOpacity": { "value": 1 },
          "zindex": { "value": 1 },
          "opacity": { "value": 1 }
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
export default function ({ columns, data, url, embedData, theme }) {
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

  if (columns.x.type === 'number') {
    const allIntegers = data.length && data.every(d => parseInt(d.x, 10) === d.x);
    if (allIntegers) {
      xField.format = 'd';

      const xAxis = config.axes.find(a => a.scale === 'x');
      xAxis.encode.labels.update.text = { "signal": "format(datum.value, 'd')" };
    }
  }

  // if (columns.color.present) {
  //   // We add the color scale
  //   config.scales.push({
  //     "name": "c",
  //     "type": "ordinal",
  //     "domain": { "data": "table", "field": "color" },
  //     "range": { "scheme": "category20" }
  //   });

  //   // We update the marks
  //   config.marks[0].encode.enter.fill = {
  //     "scale": "c",
  //     "field": "color"
  //   };
  // }

  if (columns.size.present) {
    const sizeScaleType = 'linear';
    const sizeScaleRange = (theme || defaultTheme).range.dotSize;

    // The following formula comes from:
    // https://github.com/vega/vega-scenegraph/blob/master/src/path/symbols.js#L10
    const getCircleRadius = (d) => Math.sqrt(d) / 2;

    // We add the scale
    config.scales.push({
      "name": "s",
      "type": sizeScaleType,
      "domain": { "data": "table", "field": "size" },
      "range": "dotSize",
      "zero": false
    });

    // We update the marks
    config.marks[0].encode.update.size = {
      "scale": "s",
      "field": "size"
    };

    // We add a legend to explain what the size
    // variation means
    const sizeDate = data.map(d => d.size);
    config.legend = [
      {
        type: 'size',
        label: columns.size.alias || columns.size.name,
        shape: 'circle',
        scale: sizeScaleType,
        values: [
          {
            label: Math.max(...sizeDate),
            value: getCircleRadius(sizeScaleRange[1]),
            color: (theme || defaultTheme).symbol.fill
          },
          {
            label: Math.min(...sizeDate),
            value: getCircleRadius(sizeScaleRange[0]),
            color: (theme || defaultTheme).symbol.fill
          }
        ]
      }
    ];
  }

  // If all the dots have the exact same y position,
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
