import deepClone from 'lodash/cloneDeep';
import { defaultTheme } from 'src/helpers/theme';

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
          "expr": "datum.rank < 6 ? datum.x : 'Others'"
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
      "range": "category",
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
          "opacity": { "value": 1 },
          "startAngle": { "field": "startAngle" },
          "endAngle": { "field": "endAngle" },
          "innerRadius": { "signal": "width > height ? height / 3 : width / 3" },
          "outerRadius": { "signal": "width > height ? height / 2 : width / 2" }
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
  const colorRange = defaultTheme.range.category;
  const values = data.slice(0, 6)
    .map((d, i) => ({ label: i === 5 ? 'Others' : d.x, value: colorRange[i % 6], type: columns.x.type }));

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
