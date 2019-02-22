import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class InteractiveVegaChartLegendTooltip extends PureComponent {
  render() {
    const { theme, onPickColor } = this.props;
    const colors = (!theme.range || (!theme.range.category20_original && !theme.range.category20))
      ? []
      : (theme.range.category20_original || theme.range.category20);

    return (
      <div className="c-we-vega-chart-legend-tooltip">
        <ul>
          {colors.map(color => (
            <li key={color} style={{ backgroundColor: color }}>
              <button
                type="button"
                aria-label="Pick color"
                onClick={() => onPickColor(color)}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

InteractiveVegaChartLegendTooltip.propTypes = {
  // Theme of the widget
  theme: PropTypes.object.isRequired,
  // Get passed the color hex
  onPickColor: PropTypes.func.isRequired
};

export default InteractiveVegaChartLegendTooltip;
