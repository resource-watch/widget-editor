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
    this.getFilter();
  }

  /**
   * Event handler executed when the user changes the minimum
   * value of the selected range
   * @param {InputEvent} e Event
   */
  onChangeRangeMin(e) {
    const newValue = +e.target.value;
    this.props.onChange([newValue, this.props.selected[1]]);
  }

  /**
   * Event handler executed when the user changes the maximum
   * value of the selected range
   * @param {InputEvent} e Event
   */
  onChangeRangeMax(e) {
    const newValue = +e.target.value;
    this.props.onChange([this.props.selected[0], newValue]);
  }

  /**
   * Fetch the data about the column and update the state
   * consequently
   */
  getFilter() {
    const { selected } = this.props;

    this.props.getFilter()
      .then(({ min, max }) => {
        this.setState({
          // We round the values to have a nicer UI
          min: Math.floor(min),
          max: Math.ceil(max)
        });

        if (this.props.onChange && !selected.length) {
          this.props.onChange([
            Math.floor(min),
            Math.ceil(max)
          ]);
        }

        if (this.props.onToggleLoading) {
          this.props.onToggleLoading(false);
        }

        // We let the tooltip know that the component has been resized
        if (this.props.onResize) {
          this.props.onResize();
        }
      })
      .catch((errors) => {
        this.props.onToggleLoading(false);

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
    this.props.onChange(range);
  }


  render() {
    const { min, max } = this.state;
    const { selected, loading } = this.props;

    return (
      <div className="c-we-filter-string-tooltip">

        {!loading
          && min !== null && typeof min !== 'undefined'
          && max !== null && typeof max !== 'undefined' &&
          <div className="range">
            <Range
              allowCross={false}
              max={max}
              min={min}
              value={selected}
              onChange={range => this.updateRange(range)}
            />
          </div>
        }

        {!loading && !!selected.length &&
          <div className="text-inputs-container">
            <input className="-first" type="number" min={min} max={selected[1]} value={selected[0]} onChange={this.onChangeRangeMin} />
            -
            <input className="-last" type="number" min={selected[0]} max={max} value={selected[1]} onChange={this.onChangeRangeMax} />
          </div>
        }

        {!loading && !!selected.length &&
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
  selected: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  /**
   * Get the filter value or min/max values
   */
  getFilter: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired, // Passed from the tooltip component
  onChange: PropTypes.func.isRequired,
  onToggleLoading: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired
};

FilterNumberTooltip.defaultProps = { selected: [] };

const mapDispatchToProps = dispatch => ({
  toggleTooltip: (opened, opts) => {
    dispatch(toggleTooltip(opened, opts));
  }
});

const mapStateToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FilterNumberTooltip);
