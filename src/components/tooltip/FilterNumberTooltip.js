import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

import { toastr } from 'react-redux-toastr';

// Redux
import { connect } from 'react-redux';
import { toggleTooltip } from 'reducers/tooltip';

// Services
import DatasetService from 'services/DatasetService';

// Components
import Button from 'components/ui/Button';
import Checkbox from 'components/form/Checkbox';
import { Range } from 'rc-slider';

class FilterNumberTooltip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      min: 0,
      max: 0
    };

    // DatasetService
    this.datasetService = new DatasetService(props.datasetID);

    this.updateRange = debounce(this.updateRange.bind(this), 10);
    this.onChangeRangeMin = this.onChangeRangeMin.bind(this);
    this.onChangeRangeMax = this.onChangeRangeMax.bind(this);
  }

  componentDidMount() {
    this.getFilterInfo();
  }

  /**
   * Event handler executed when the user changes the minimum
   * value of the selected range
   * @param {InputEvent} e Event
   */
  onChangeRangeMin(e) {
    const newValue = +e.target.value;
    this.props.onChange({ value: [newValue, this.props.value[1]] });
  }

  /**
   * Event handler executed when the user changes the maximum
   * value of the selected range
   * @param {InputEvent} e Event
   */
  onChangeRangeMax(e) {
    const newValue = +e.target.value;
    this.props.onChange({ value: [this.props.value[0], newValue] });
  }

  /**
   * Fetch the data about the column and update the state
   * consequently
   */
  getFilterInfo() {
    const { value } = this.props;

    this.props.getFilterInfo()
      .then(({ min, max }) => {
        this.setState({
          // We round the values to have a nicer UI
          min: Math.floor(min),
          max: Math.ceil(max)
        });

        if (this.props.onChange && !value.length) {
          this.props.onChange({
            value: [
              Math.floor(min),
              Math.ceil(max)
            ]
          });
        }

        if (this.props.toggleLoading) {
          this.props.toggleLoading(false);
        }

        // We let the tooltip know that the component has been resized
        if (this.props.onResize) {
          this.props.onResize();
        }
      })
      .catch((errors) => {
        this.props.toggleLoading(false);

        try {
          errors.forEach(er => toastr.error('Error', er.detail));
        } catch (e) {
          toastr.error('Error', 'Oops');
        }
      });
  }

  /**
   * Update the range
   * Note: the function is debounced in the constructor
   * @param {number[]} range Range of values
   */
  updateRange(range) {
    this.props.onChange({ value: range });
  }


  render() {
    const { min, max } = this.state;
    const { value, loading, notNull, onChange } = this.props;

    return (
      <div className="c-we-filter-string-tooltip">
        {!loading &&
          <div className="c-we-checkbox">
            <Checkbox
              properties={{
                title: 'Not null values',
                checked: notNull,
                default: false
              }}
              onChange={e => onChange({ notNull: e.checked })}
            />
          </div>
        }

        {!loading
          && min !== null && typeof min !== 'undefined'
          && max !== null && typeof max !== 'undefined' &&
          <div className="range">
            <Range
              allowCross={false}
              max={max}
              min={min}
              value={value}
              onChange={range => this.updateRange(range)}
            />
          </div>
        }

        {!loading && !!value.length &&
          <div className="text-inputs-container">
            <input className="-first" type="number" min={min} max={value[1]} value={value[0]} onChange={this.onChangeRangeMin} />
            -
            <input className="-last" type="number" min={value[0]} max={max} value={value[1]} onChange={this.onChangeRangeMax} />
          </div>
        }

        {!loading && !!value.length &&
          <div className="c-we-buttons">
            <Button
              properties={{ type: 'button', className: '-primary -compressed' }}
              onClick={() => this.props.onApply()}
            >
              Done
            </Button>
          </div>
        }

      </div>
    );
  }
}

FilterNumberTooltip.propTypes = {
  datasetID: PropTypes.string.isRequired,
  value: PropTypes.array,
  notNull: PropTypes.bool,
  operation: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  /**
   * Get the filter value or min/max values
   */
  getFilterInfo: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired, // Passed from the tooltip component
  onChange: PropTypes.func.isRequired,
  toggleLoading: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired
};

FilterNumberTooltip.defaultProps = { value: [] };

const mapDispatchToProps = dispatch => ({
  toggleTooltip: (opened, opts) => {
    dispatch(toggleTooltip(opened, opts));
  }
});

const mapStateToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FilterNumberTooltip);
