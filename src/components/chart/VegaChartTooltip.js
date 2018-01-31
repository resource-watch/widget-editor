import React from 'react';
import PropTypes from 'prop-types';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';

class VegaChartTooltip extends React.Component {
  getParsedValue(field) { // eslint-disable-line class-methods-use-this
    if (field.format && field.type === 'number') {
      return format(field.format)(field.value);
    } else if (field.type === 'date') {
      const date = new Date(field.value);
      // NOTE: it's important to have a default format for
      // the manually-created widgets, otherwise if field.format
      // is not defined, timeFormat will return a date
      // object and the app will crash in dev environment
      // and the tooltip won't show in prod
      const f = field.format || '%d %b %Y';
      return timeFormat(f)(date);
    }

    return field.value;
  }

  render() {
    const fieldsName = Object.keys(this.props.item);
    return (
      <div className="c-we-chart-tooltip">
        <div className="labels">
          { fieldsName.length && fieldsName.map(fieldName => (
            this.props.item[fieldName].label
              ? (
                <span key={this.props.item[fieldName].label}>
                  {this.props.item[fieldName].label}
                </span>
              )
              : false
          ))}
        </div>
        <div className="values">
          { fieldsName.length && fieldsName.map(fieldName => (
            this.props.item[fieldName].value
              ? (
                <span key={this.props.item[fieldName].label}>
                  {this.getParsedValue(this.props.item[fieldName])}
                </span>
              )
              : false
          ))}
        </div>
      </div>
    );
  }
}

// const columnType = PropTypes.shape({
//   type: PropTypes.oneOf(['number', 'string', 'date']),
//   label: PropTypes.string,
//   format: PropTypes.string,
//   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object])
// });

VegaChartTooltip.propTypes = {
  item: PropTypes.object
};

export default VegaChartTooltip;
