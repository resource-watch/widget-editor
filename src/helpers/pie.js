import deepClone from 'lodash/cloneDeep';
import { schemeCategory10 } from 'd3-scale';

/* eslint-disable */
const defaultChart = {
  "$schema": "https://vega.github.io/schema/vega/v3.0.json",
  "data": [
    {
      "name": "table",
      "transform": [
        {
          "type": "window",
          "ops": ["row_number"], "as": ["rank"]
        },
        {
          "type": "formula",
          "as": "category",
          "expr": "datum.rank < 10 ? datum.x : 'Others'"
        },
        {
          "type": "aggregate",
          "groupby": ["category"],
          "ops": ["sum"],
          "fields": ["y"],
          "as": ["value"]
        },
        {
          "type": "pie",
          "field": "value",
          "startAngle":  0,
          "endAngle":  6.29
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "c",
      "type": "ordinal",
      "range": { "scheme": "category10" },
      "domain": { "data": "table", "field": "category" }
    }
  ],
  "marks": [
    {
      "type": "arc",
      "from": { "data": "table" },
      "encode": {
        "enter": {
          "fill": { "scale": "c", "field": "category" },
          "x": { "signal": "width / 2" },
          "y": { "signal": "height / 2" }
        },
        "update": {
          "startAngle": { "field": "startAngle" },
          "endAngle": { "field": "endAngle" },
          "innerRadius": { "signal": "width > height ? height / 4 : width / 4" },
          "outerRadius": { "signal": "width > height ? height / 2 : width / 2" }
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
            "key": "y",
            "label": "y",
            "format": ".2s"
          },
          {
            "key": "category",
            "label": "x"
          }
        ]
      }
    }
  ]
}

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

 if (columns.color.present) {
   const colorScale = config.scales.find(scale => scale.name === 'c');
   colorScale.domain.field = 'color';
 }

  // We add a default legend to the chart
  // In the default template above, category20 is used
  const colorRange = schemeCategory10;
  const values = data.slice(0, 10)
    .map((d, i) => ({ label: i === 9 ? 'Others' : d.x, value: colorRange[i % 10], type: columns.x.type }));

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
