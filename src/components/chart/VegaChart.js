import React from 'react';
import PropTypes from 'prop-types';
import vega from 'vega';
import vegaTooltip from 'vega-tooltip';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

// Components
import VegaChartLegend from 'components/chart/VegaChartLegend';

// Utils
import { fetchRasterData } from 'helpers/WidgetHelper';

class VegaChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      vegaConfig: null
    };

    // BINDINGS
    this.triggerResize = debounce(this.triggerResize.bind(this), 250);
  }

  componentDidMount() {
    this.mounted = true;
    this.renderChart();
    window.addEventListener('resize', this.triggerResize);

    // We pass the callback to force the re-render of the chart
    if (this.props.getForceUpdate) {
      this.props.getForceUpdate(this.forceUpdate.bind(this));
    }
  }

  componentWillReceiveProps(nextProps) {
    // We pass the callback to force the re-render of the chart
    if (nextProps.getForceUpdate) {
      nextProps.getForceUpdate(this.forceUpdate.bind(this));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextProps.data, this.props.data)
    || !isEqual(nextState.vegaConfig, this.state.vegaConfig);
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.data, prevProps.data)) {
      this.renderChart();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('resize', this.triggerResize);
    if (this.view) {
      this.view.finalize();
    }
  }

  setSize() {
    if (this.chartViewportContainer) {
      const computedStyles = getComputedStyle(this.chartViewportContainer);
      const padding = {
        top: +computedStyles.paddingTop.replace('px', ''),
        right: +computedStyles.paddingRight.replace('px', ''),
        bottom: +computedStyles.paddingBottom.replace('px', ''),
        left: +computedStyles.paddingLeft.replace('px', '')
      };

      this.width = (this.props.width || this.chartViewportContainer.offsetWidth)
        - (padding.left + padding.right);
      this.height = (this.props.height || this.chartViewportContainer.offsetHeight)
        - (padding.top + padding.bottom);
    }
  }

  /**
   * Return the Vega configuration of the chart
   * This method is necessary because we need to define the size of
   * the chart, as well as a signal to display a tooltip
   * @returns {Promise<object>}
   */
  async getVegaConfig() {
    // We toggle on the loading but we don't do it off because
    // it will be done once the parsing of the Vega config is done
    this.toggleLoading(true);

    return new Promise((resolve, reject) => {
      const autosize = {
        type: 'fit',
        contains: 'padding'
      };

      const size = {
        width: this.props.data.width || this.width,
        height: this.props.data.height || this.height
      };

      const config = Object.assign({}, this.props.data, size, { autosize });

      // If the widget represents a raster dataset, we need to fetch
      // and parse the data
      if (config.data[0].format && config.data[0].format.band) {
        fetchRasterData(
          config.data[0].url,
          config.data[0].format.band,
          config.data[0].format.provider
        )
          .then((data) => {
            const dataObj = Object.assign({}, config.data[0]);
            dataObj.values = data;

            // If we don't remove the format and the URL, Vega won't use
            // the data we pass in
            delete dataObj.format;
            delete dataObj.url;

            resolve(Object.assign(
              {},
              config,
              { data: [dataObj].concat(config.data.slice(1, config.data.length)) }
            ));
          })
          .catch(() => reject('Unable to get the raster data'));
      } else {
        resolve(config);
      }
    });
  }

  /**
   * Return the fields of the tooltip config within the interaction config
   * of the vega config
   * @returns {{ key: string, label: string, format: string }[]}
  */
  getTooltipConfigFields() {
    const vegaConfig = this.state.vegaConfig;

    // We don't have the interaction config object defined
    if (!vegaConfig || !vegaConfig.interaction_config || !vegaConfig.interaction_config.length) {
      return [];
    }

    const tooltipConfig = vegaConfig.interaction_config.find(c => c.name === 'tooltip');

    // We don't have the tooltip config defined
    if (!tooltipConfig || !tooltipConfig.config || !tooltipConfig.config.fields
        || !tooltipConfig.config.fields.length) {
      return [];
    }

    return tooltipConfig.config.fields;
  }

  /**
   * Toggle the visibility of the loader depending of the
   * passed value
   * @param {boolean} isLoading
   */
  toggleLoading(isLoading) {
    if (this.mounted && this.props.toggleLoading) {
      this.props.toggleLoading(isLoading);
    }
  }

  parseVega() {
    const theme = this.props.theme || {};
    const vegaConfig = this.state.vegaConfig;

    // While Vega parses the configuration and renders the chart
    // we display a loader
    this.toggleLoading(true);

    try {
      const runtime = vega.parse(vegaConfig, theme);
      this.view = new vega.View(runtime)
        .initialize(this.chart)
        .renderer('canvas')
        .hover()
        .run();

      // We only show the tooltip if the interaction_config
      // object is defined
      if (vegaConfig.interaction_config && vegaConfig.interaction_config.length) {
        this.instantiateTooltip(this.view);
      }
    } catch (err) {
      console.error(err);
      if (this.props.onError) this.props.onError();
    }

    this.toggleLoading(false);
  }

  /**
   * Instantiate the tooltip for the chart
   * @param {any} view Vega view object
   */
  instantiateTooltip(view) {
    const fields = this.getTooltipConfigFields();

    vegaTooltip.vega(view, {
      showAllFields: false,
      fields: fields.map(({ column, property, type, format }) => ({
        field: column,
        title: property,
        formatType: type === 'date' ? 'time' : type,
        format
      }))
    });
  }

  triggerResize() {
    if (this.props.reloadOnResize) {
      if (this.view) {
        this.setSize();
        this.view = this.view
          .width(this.width)
          .height(this.height)
          .run();
        this.instantiateTooltip(this.view);
      } else {
        this.renderChart();
      }
    }
  }

  renderChart() {
    this.setSize();
    this.getVegaConfig()
      .then(vegaConfig => new Promise(resolve => this.setState({ vegaConfig }, resolve)))
      .then(() => this.parseVega())
      .catch(err => console.error(err));
  }

  render() {
    const { vegaConfig } = this.state;

    return (
      <div
        className="c-we-chart"
        ref={(el) => { this.chartViewportContainer = el; }}
      >
        <div ref={(c) => { this.chart = c; }} className="chart" />
        { this.props.showLegend && vegaConfig && vegaConfig.legend
          && <VegaChartLegend config={vegaConfig.legend} /> }
      </div>
    );
  }
}

VegaChart.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,

  reloadOnResize: PropTypes.bool.isRequired,
  showLegend: PropTypes.bool,
  // Define the chart data
  data: PropTypes.object,
  theme: PropTypes.object,
  // Callbacks
  toggleLoading: PropTypes.func,
  onError: PropTypes.func,
  // This callback should be passed the function
  // to force the re-render of the chart
  getForceUpdate: PropTypes.func
};

VegaChart.defaultProps = {
  width: 0,
  height: 0,
  showLegend: true
};

export default VegaChart;
