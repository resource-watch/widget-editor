import deepClone from 'lodash/cloneDeep';

// Helpers
import { getTimeFormat } from 'helpers/WidgetHelper';

/* eslint-disable */
const defaultChart = {
  "$schema": "https://vega.github.io/schema/vega/v3.0.json",
    "autosize": "fit",
  "data": [
    {
      "name": "table",

    },
    {
      "name": "stats",
    }
  ],

  "scales": [
        {
            "name": "x",
            "type": "band",
            "range": "width",
            "domain": {
                "data": "table",
                "field": "x"
            }
        },
        {
            "name": "y",
            "type": "linear",
            "range": "height",
            "nice": true,
            "zero": true,
            "domain": {
                "data": "table",
                "field": "y"
            }
        }
    ],
    "axes": [
        {
            "orient": "bottom",
            "scale": "x",
            "labelOverlap": "parity",
            "ticks":false,
            "encode": {
                "labels": {
                    "update": {
                        "align": {
                            "value": "left"
                        },
                        "angle": {"signal": "width < 100 ? 90 : 0"},
                        "baseline": {
                            "value": "top"
                        }
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
            "type": "rect",
            "from": {
                "data": "table"
            },
            "encode": {
                "enter": {
                    "x": {
                        "scale": "x",
                        "field": "x"
                    },
                    "width": {
                        "scale": "x",
                        "band": 1
                    },
                    "y": {
                        "scale": "y",
                        "field": "y"
                    },
                    "y2": {
                        "scale": "y",
                        "value": 0
                    }
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

//    // If the dataset is a raster one, we save the provider and the
//    // band in the config so we can later re-render the chart
//    // correctly (we need the info to parse the data)
//    if (provider && band) {
//      config.data[0].format = { provider, band };
//    }
  }
//
//  if (columns.color.present) {
//    // We add the color scale
//    config.scales.push({
//      "name": "c",
//      "type": "ordinal",
//      "domain": {"data": "table", "field": "color"},
//      "range": "category10"
//    });
//
//    // We update the marks
//    config.marks[0].marks[0].properties.enter.fill = {
//      "scale": "c",
//      "field": "color"
//    };
//  }
//
//  // We save the name of the columns for the tooltip
//  {
//    const xField = config.interaction_config[0].config.fields[1];
//    const yField = config.interaction_config[0].config.fields[0];
//    xField.label = columns.x.alias || columns.x.name;
//    yField.label = columns.y.alias || columns.y.name;
//  }
//
//  // If the x column is a date, we need to use a
//  // a temporal x axis and parse the x column as a date
//  if (columns.x.type === 'date') {
//    // We update the axis
//    const xAxis = config.marks[0].marks[2].axes[0];
//    xAxis.formatType = 'time';
//
//    // We parse the x column as a date
//    if (!config.data[0].format) config.data[0].format = {};
//    config.data[0].format.parse = { x: 'date' };
//
//    // We compute an optimal format for the ticks
//    const temporalData = data.map(d => d.x);
//    const format = getTimeFormat(temporalData);
//    if (format) xAxis.format = format;
//
//    // We also set the format for the tooltip
//    config.interaction_config[0].config.fields[1].format = format;
//
//    // The x axis has a template used to truncate the
//    // text. Nevertheless, when using it, a date will
//    // be displayed as a timestamp.
//    // One solution is just to remove the template
//    // and Vega will use d3 to determine the best format
//    // or the provided format if we have access to the
//    // data.
//    // In such a case, we don't truncate the tick, but
//    // it shouldn't be necessary because usually the
//    // result is short.
//    // NOTE: actually if we just remove the template,
//    // "text" will be an empty object and Vega won't
//    // display any tick, so we need to remove text
//    // instead
//    delete xAxis.properties.labels.text;
//  } else if (columns.x.type === 'number') {
//    const allIntegers = data.length && data.every(d => parseInt(d.x, 10) === d.x);
//    if (allIntegers) {
//      const xField = config.interaction_config[0].config.fields[1];
//      xField.format = '';
//    }
//  }
//
//  // In case the dataset contains only one value (thus one)
//  // column, Vega fails to render the chart:
//  // https://github.com/vega/vega/issues/927
//  // The same happens if all the bars have the same height
//  // As a temporary solution, we force domain of the scale
//  // to be around the value
//  const oneYValue = data.length && data.every(d => d.y === data[0].y);
//  if (data.length === 1 || oneYValue) {
//    const yScale = config.scales[1];
//
//    // The step is 20% of the value
//    const step = data[0].y * 0.2;
//
//    // We fix the domain around the value
//    yScale.domain = [data[0].y - step, data[0].y + step];
//  }

  return config;
};