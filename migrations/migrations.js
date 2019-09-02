require = require('esm')(module); // eslint-disable-line no-global-assign

const theme = require('../src/helpers/theme');

const defaultTheme = theme.defaultTheme;

// Please sort the migrations by their version number (DESC)
module.exports = [
  {
    version: '0.1.3',
    description: 'Update the widgetConfig parameters stored to detect map widgets',
    needsMigration(widget) {
      const { widgetConfig } = widget.attributes;
      if (!widgetConfig || !widgetConfig.paramsConfig || widgetConfig.paramsConfig.visualizationType !== 'map') {
        return false;
      }

      if (widgetConfig.type === 'map' && widgetConfig.layer_id !== undefined) {
        return false;
      }

      return true;
    },
    migrate(widget) {
      const { widgetConfig } = widget.attributes;
      return {
        ...widget,
        attributes: {
          ...widget.attributes,
          widgetConfig: {
            ...widgetConfig,
            type: 'map',
            layer_id: widgetConfig.paramsConfig.layer
          }
        }
      };
    }
  },
  {
    version: '1.4.0',
    description: 'Update the color scale of the legend of the pies charts',
    needsMigration(widget) {
      const { widgetConfig } = widget.attributes;
      if (!widgetConfig || !widgetConfig.paramsConfig || widgetConfig.paramsConfig.chartType !== 'pie'
        || !widgetConfig.scales || !widgetConfig.scales.length) {
        return false;
      }

      const colorScale = widgetConfig.scales.find(scale => scale.name === 'c');
      if (!colorScale || colorScale.range !== 'category') {
        return false;
      }

      return true;
    },
    migrate(widget) {
      const { widgetConfig } = widget.attributes;
      const { legend, scales } = widgetConfig;

      // We modify the colors of the legend so they use the new category20 range
      const newLegendValues = legend[0].values.map((value, i) => ({
        ...value,
        value: defaultTheme.range.category20[i % defaultTheme.range.category20.length]
      }));

      const colorScaleIndex = scales.findIndex(scale => scale.name === 'c');
      const colorScale = scales[colorScaleIndex];

      // We use the category20 range for the marks too
      const newColorScale = {
        ...colorScale,
        range: 'category20'
      };

      const newScales = [...scales];
      newScales.splice(colorScaleIndex, 1, newColorScale);

      return {
        ...widget,
        attributes: {
          ...widget.attributes,
          widgetConfig: {
            ...widgetConfig,
            legend: [
              {
                ...legend[0],
                values: newLegendValues
              }
            ],
            scales: newScales
          }
        }
      };
    }
  }
];
