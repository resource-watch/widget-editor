import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AutosizeInput from 'react-input-autosize';

import { setXAxisTitle, setYAxisTitle } from 'reducers/widgetEditor';

// This component renders the editable titles of the axes
class AxisTitle extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      editing: false
    };

    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onClickAxisTitle = this.onClickAxisTitle.bind(this);
  }

  /**
   * Event handler executed when the axis title changes
   * @param {Event} e
   */
  onChange(e) {
    const { target: { value } } = e;
    const { setAxisTitle } = this.props;
    setAxisTitle(value);
  }

  /**
   * Event handler executed when the input loses its focus
   */
  onBlur() {
    this.setState({ editing: false });
  }

  /**
   * Event handler executed when the user types in the input
   * @param {KeyboardEvent} e
   */
  onKeyPress(e) {
    const { key } = e;
    if (key === 'Enter') {
      this.setState({ editing: false });
    }
  }

  /**
   * Event handler executed when the user clicks on the
   * axis title
   */
  onClickAxisTitle() {
    this.setState({ editing: true }, () => {
      if (this.input) {
        this.input.focus();
      }
    });
  }

  render() {
    const { type, axisTitle } = this.props;
    const { editing } = this.state;

    return (
      <div className={`c-we-axis-title -${type}`}>
        <div className="content">
          {editing && (
            <AutosizeInput
              inputRef={(node) => { this.input = node; }}
              value={axisTitle || ''}
              placeholder="Axis title"
              onChange={this.onChange}
              onBlur={this.onBlur}
              onKeyPress={this.onKeyPress}
              aria-label={`${type} axis title`}
            />
          )}
          {!editing && (
            <button
              type="button"
              aria-label={`${axisTitle}, change ${type} axis title`}
              onClick={this.onClickAxisTitle}
            >
              {axisTitle || 'Axis title'}
            </button>
          )}
        </div>
      </div>
    );
  }
}

AxisTitle.propTypes = {
  // Type of the axis must be either "x" or "y"
  type: PropTypes.string.isRequired,
  axisTitle: PropTypes.string,
  setAxisTitle: PropTypes.func.isRequired
};

AxisTitle.defaultProps = {
  axisTitle: ''
};

const mapStateToProps = ({ widgetEditor }, { type }) => ({
  axisTitle: widgetEditor[`${type}AxisTitle`]
});

const mapDispatchToProps = (dispatch, { type }) => ({
  setAxisTitle: title => dispatch(type === 'x' ? setXAxisTitle(title) : setYAxisTitle(title))
});

export default connect(mapStateToProps, mapDispatchToProps)(AxisTitle);
