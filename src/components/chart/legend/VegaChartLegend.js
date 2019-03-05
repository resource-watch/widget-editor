import React from 'react';
import PropTypes from 'prop-types';
import uniqBy from 'lodash/uniqBy';
import { timeFormat as format } from 'd3-time-format';

// Components
import Title from 'components/ui/Title';
import Icon from 'components/ui/Icon';

// Helpers
import { capitalize } from 'helpers/functions';
import { getSINumber, getTimeFormat } from 'helpers/WidgetHelper';

class VegaChartLegend extends React.Component {
  /**
   * Render the "color" legend corresponding to the config
   * This legend is specific for marks which the color varies
   * @static
   * @param {object} config Check VegaChartLegend.propTypes.config for the types
   * @return {JSX}
   */
  static renderColorLegend(config) {
    // Kind of a trick, if there's something better, use it
    const uniqueId = config.values.slice(0, 5).map(v => v.label).join('');

    // This is only used if the labels are dates
    let timeFormat;
    const formatDateLabel = (values, label) => {
      if (!timeFormat) timeFormat = getTimeFormat(values.map(v => v.label));
      return format(timeFormat)(new Date(label));
    };

    // Format the label according to its type
    const formatLabel = (values, value) => {
      if (value.type === 'date') return formatDateLabel(values, value.label);
      return value.label;
    };

    // We use uniqBy to remove the duplicates in case the user
    // hasn't use an aggregation method yet
    const items = uniqBy(config.values, 'label');

    return (
      <div className="legend -color" key={uniqueId}>
        {config.label && <Title className="-default">{config.label}</Title>}
        <div className="items">
          {items.map((item, i, values) => (
            <div className="item" key={item.label}>
              <span
                className={`shape -${config.shape || 'square'}`}
                style={{ backgroundColor: item.value }}
              />
              <span className="label">{formatLabel(values, item)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render the "size" legend corresponding to the config
   * This legend is specific for marks which the size varies
   * @static
   * @param {object} config Check VegaChartLegend.propTypes.config for the types
   * @return {JSX}
   */
  static renderSizeLegend(config) {
    // Kind of a trick, if there's something better, use it
    const uniqueId = config.values.slice(0, 5).map(v => v.label).join('');

    const label = capitalize(config.label);

    return (
      <div className="legend -size" key={uniqueId}>
        {label && <Title className="-default">{label}</Title>}
        <div className="items">
          {config.values.map(value => (
            <div className="item" key={value.label}>
              <div className="shape-container">
                <span
                  className={`shape -${config.shape || 'square'}`}
                  style={{
                    width: `${2 * value.value}px`,
                    height: `${2 * value.value}px`,
                    backgroundColor: value.color
                  }}
                />
              </div>
              <span className="label">{getSINumber(value.label)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render the legend corresponding to the config
   * @param {object} config Check VegaChartLegend.propTypes.config for the types
   */
  static renderLegend(config) { // eslint-disable-line consistent-return
    if (config.type === 'color') {
      return VegaChartLegend.renderColorLegend(config);
    } else if (config.type === 'size') {
      return VegaChartLegend.renderSizeLegend(config);
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      opened: true
    };
  }

  componentDidUpdate(previousProps, previousState) {
    // We move the focus to the legend when it's being
    // opened and we add a listener for the clicks
    if (!previousState.opened && this.state.opened) {
      this.legend.focus();
    }
  }

  /**
   * Event handler executed when the user presses a key while
   * the focus is on the legend
   * @param {KeyboardEvent} e Event object
   */
  onKeyDown(e) {
    const code = e.keyCode;

    // If the user presses the ESC key, we close the legend
    if (code === 27) {
      e.preventDefault();
      this.setState({ opened: false });
    }
  }

  render() {
    // Kind of a trick, if there's something better, use it
    const uniqueId = this.props.config[0].label
      || (this.props.config[0].values.length && this.props.config[0].values[0].value)
      || +(new Date());

    return (
      <div className="c-we-vega-chart-legend" ref={(node) => { this.el = node; }}>
        <button
          type="button"
          className="toggle-button"
          aria-label="Toggle the legend of the chart"
          aria-controls={`chart-legend-${uniqueId}`}
          onClick={() => this.setState({ opened: !this.state.opened })}
        >
          <span>i</span>
          Legend
        </button>
        <div // eslint-disable-line jsx-a11y/no-noninteractive-element-interactions
          className="container"
          id={`chart-legend-${uniqueId}`}
          aria-hidden={!this.state.opened}
          role="tooltip"
          tabIndex="0" // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
          ref={(node) => { this.legend = node; }}
          onKeyDown={e => this.onKeyDown(e)}
        >
          <button
            type="button"
            className="close-button"
            onClick={() => this.setState({ opened: false })}
            aria-label="Close legend"
          >
            <Icon
              name="icon-cross"
              className="-smaller"
            />
          </button>
          <div className="content">
            {this.props.config.map(config => VegaChartLegend.renderLegend(config))}
          </div>
        </div>
      </div>
    );
  }
}

VegaChartLegend.propTypes = {
  config: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['color', 'size']),
    label: PropTypes.string,
    scale: PropTypes.string,
    shape: PropTypes.oneOf(['square', 'circle', 'line']),
    values: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }))
  })).isRequired
};

export default VegaChartLegend;
