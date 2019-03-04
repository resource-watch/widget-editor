/**
 * ANY CHANGE TO THIS FILE SHOULD BE COPIED OVER
 * InteractiveVegaChartLegend
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import uniqBy from 'lodash/uniqBy';
import { timeFormat as format } from 'd3-time-format';

// Redux
import { toggleTooltip } from 'reducers/tooltip';

// Components
import Title from 'components/ui/Title';
import Icon from 'components/ui/Icon';
import InteractiveVegaChartLegendTooltip from 'components/chart/legend/InteractiveVegaChartLegendTooltip';

// Helpers
import { getSINumber, getTimeFormat } from 'helpers/WidgetHelper';

class InteractiveVegaChartLegend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened: true,
      colorTooltipOpened: false
    };

    this.onClick = this.onClick.bind(this);
    this.onScrollLegend = this.onScrollLegend.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.onClick);

    if (this.scrollableContainer) {
      this.scrollableContainer.addEventListener('scroll', this.onScrollLegend, { passive: true });
    }
  }

  componentDidUpdate(previousProps, previousState) {
    // We move the focus to the legend when it's being
    // opened and we add a listener for the clicks
    if (!previousState.opened && this.state.opened) {
      this.legend.focus();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onClick);

    if (this.scrollableContainer) {
      this.scrollableContainer.removeEventListener('scroll', this.onScrollLegend);
    }
  }

  /**
   * Event handler executed when the user presses a key while
   * the focus is on the legend
   * @param {KeyboardEvent} e Event object
   */
  onKeyDown(e) {
    const code = e.keyCode;
    const { toggleTooltip } = this.props; // eslint-disable-line no-shadow
    const { opened } = this.state;

    // If the user presses the ESC key, we close the legend
    if (opened && code === 27) {
      e.preventDefault();
      this.setState({ opened: false });
      toggleTooltip(false);
    }
  }

  /**
   * Event handler executed when the user clicks on the color
   * of an item
   * @param {{ label: string, value: string }} item Legend item
   * @param {MouseEvent} event Button click event
   */
  onClickLegendItem(item, event) {
    const { toggleTooltip, theme, onChangeTheme } = this.props; // eslint-disable-line no-shadow
    const rects = event.target.getBoundingClientRect();

    const position = {
      x: window.scrollX + rects.x + (rects.width / 2),
      y: window.scrollY + rects.y + (rects.height / 2)
    };

    this.setState({ colorTooltipOpened: true });

    toggleTooltip(true, {
      follow: false,
      position,
      direction: 'top',
      children: InteractiveVegaChartLegendTooltip,
      childrenProps: {
        theme,
        onPickColor: (color) => {
          // We swap the color the user picked with the
          // color of the item
          const oldColorIndex = theme.range.category20.indexOf(item.value);
          const newColorIndex = theme.range.category20.indexOf(color);

          const newColorRange = [...theme.range.category20];
          newColorRange[oldColorIndex] = color;
          newColorRange[newColorIndex] = item.value;

          // The color the user changed might be the default color
          // of the marks, symbols, rects or lines
          // Because they don't use the category20 scale, we might also
          // need to update them
          const additionalChanges = {};

          if (theme.mark.fill === item.value) {
            additionalChanges.mark = {
              ...theme.mark,
              fill: color
            };
          }

          if (theme.symbol.fill === item.value) {
            additionalChanges.symbol = {
              ...theme.symbol,
              fill: color
            };
          }

          if (theme.rect.fill === item.value) {
            additionalChanges.rect = {
              ...theme.rect,
              fill: color
            };
          }

          if (theme.line.stroke === item.value) {
            additionalChanges.line = {
              ...theme.line,
              stroke: color
            };
          }

          const newTheme = {
            ...theme,
            // The name might help the host app know the theme has
            // been customized by the user
            name: 'user-custom',
            range: {
              ...theme.range,
              category20: newColorRange
            },
            ...additionalChanges
          };

          // We save the previous theme colors so we can always display
          // the same color options in the tooltip
          if (!theme.range.category20_original) {
            newTheme.range.category20_original = [...theme.range.category20];
          }

          // We close the tooltip since the widget will be reloaded
          this.setState({ colorTooltipOpened: false });
          toggleTooltip(false);

          onChangeTheme(newTheme);
        }
      }
    });
  }

  /**
   * Event handler executed when the user clicks outside of the tooltip
   * @param {MouseEvent} e Event
   */
  onClick(e) {
    const { toggleTooltip } = this.props; // eslint-disable-line no-shadow
    const { colorTooltipOpened } = this.state;
    const el = document.querySelector('.c-we-tooltip');
    const clickOutside = el && el.contains && !el.contains(e.target);

    if (colorTooltipOpened && clickOutside) {
      toggleTooltip(false);
    }
  }

  /**
   * Event handler executed when the user scrolls in the legend
   */
  onScrollLegend() {
    const { toggleTooltip } = this.props; // eslint-disable-line no-shadow
    const { colorTooltipOpened } = this.state;
    if (colorTooltipOpened) {
      toggleTooltip(false);
    }
  }

  /**
   * Render the "color" legend corresponding to the config
   * This legend is specific for marks which the color varies
   * @param {object} config Check InteractiveVegaChartLegend.propTypes.config for the types
   */
  renderColorLegend(config) {
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
    // hasn't used an aggregation method yet
    const items = uniqBy(config.values, 'label');

    return (
      <div className="legend -color" key={uniqueId}>
        {config.label && <Title className="-default">{config.label}</Title>}
        <div className="items">
          {items.map((item, i, values) => (
            <div className="item" key={item.label}>
              <button
                type="button"
                className={`shape -${config.shape || 'square'}`}
                style={{ backgroundColor: item.value }}
                aria-label="Change item color"
                onClick={e => this.onClickLegendItem(item, e)}
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
   * @param {object} config Check InteractiveVegaChartLegend.propTypes.config for the types
   */
  renderSizeLegend(config) {
    // Kind of a trick, if there's something better, use it
    const uniqueId = config.values.slice(0, 5).map(v => v.label).join('');

    const label = config.label
      ? config.label[0].toUpperCase()
      + config.label.slice(1, config.label.length)
      : null;

    return (
      <div className="legend -size" key={uniqueId}>
        {label && <Title className="-default">{label}</Title>}
        <div className="items">
          {config.values.map(item => (
            <div className="item" key={item.label}>
              <div className="shape-container">
                <button
                  type="button"
                  className={`shape -${config.shape || 'square'}`}
                  style={{
                    width: `${2 * item.value}px`,
                    height: `${2 * item.value}px`,
                    backgroundColor: item.color
                  }}
                  aria-label="Change item color"
                  onClick={e => this.onClickLegendItem({ label: item.label, value: item.color }, e)}
                />
              </div>
              <span className="label">{getSINumber(item.label)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render the legend corresponding to the config
   * @param {object} config Check InteractiveVegaChartLegend.propTypes.config for the types
   */
  renderLegend(config) { // eslint-disable-line consistent-return
    if (config.type === 'color') {
      return this.renderColorLegend(config);
    } else if (config.type === 'size') {
      return this.renderSizeLegend(config);
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
          <div className="content" ref={(node) => { this.scrollableContainer = node; }}>
            {this.props.config.map(config => this.renderLegend(config))}
          </div>
        </div>
      </div>
    );
  }
}

InteractiveVegaChartLegend.propTypes = {
  theme: PropTypes.object.isRequired,
  config: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['color', 'size']),
    label: PropTypes.string,
    scale: PropTypes.string,
    shape: PropTypes.oneOf(['square', 'circle', 'line']),
    values: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }))
  })).isRequired,
  onChangeTheme: PropTypes.func.isRequired,
  // From Redux
  toggleTooltip: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
  toggleTooltip: (...params) => dispatch(toggleTooltip(...params))
});

export default connect(null, mapDispatchToProps)(InteractiveVegaChartLegend);
