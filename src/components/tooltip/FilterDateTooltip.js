import React from 'react';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import Flatpickr from 'react-flatpickr';

// Helpers
import { applyTimezoneOffset, revertTimezoneOffset } from 'helpers/date';

// Services
import DatasetService from 'services/DatasetService';

// Redux
import { connect } from 'react-redux';

// Components
import Button from 'components/ui/Button';
import Select from 'components/form/SelectInput';
import Checkbox from 'components/form/Checkbox';

const FILTER_OPERATION_OPTIONS = [
  { label: 'Between', value: 'between' },
  { label: 'Not between', value: 'not-between' },
  { label: 'Greater than', value: '>' },
  { label: 'Greater than or equal to', value: '>=' },
  { label: 'Less than', value: '<' },
  { label: 'Less than or equal to', value: '<=' },
  { label: 'Is equal to', value: '=' },
  { label: 'Is not equal to', value: '!=' }
];

class FilterDateTooltip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      minDate: null,
      maxDate: null
    };

    // DatasetService
    this.datasetService = new DatasetService(props.datasetID);

    this.onChangeStartDate = this.onChangeStartDate.bind(this);
    this.onChangeEndDate = this.onChangeEndDate.bind(this);
  }

  componentDidMount() {
    this.getFilterInfo();
  }

  /**
   * Event handler executed when the user changes the operation
   * @param {string} operation Operation
   */
  onChangeOperation(operation) {
    const { onChange, onResize } = this.props;
    const { minDate, maxDate } = this.state;

    onChange({
      operation,
      value: operation === 'between' || operation === 'not-between'
        ? [minDate, maxDate]
        : minDate
    });

    if (onResize) {
      setTimeout(() => onResize(), 0);
    }
  }

  /**
   * Event handler executed when the user changes
   * the start date
   * @param {Date} date New start date
   */
  onChangeStartDate(date) {
    this.props.onChange({
      value: [
        revertTimezoneOffset(date[0]),
        this.props.value[1]
      ]
    });
  }

  /**
   * Event handler executed when the user changes
   * the end date
   * @param {Date} date New end date
   */
  onChangeEndDate(date) {
    this.props.onChange({
      value: [
        this.props.value[0],
        revertTimezoneOffset(date[0])
      ]
    });
  }

  /**
   * Fetch the data about the column and update the state
   * consequently
   */
  getFilterInfo() {
    const { operation, value, toggleLoading, onChange, onResize } = this.props;

    this.props.getFilterInfo()
      .then(({ min, max }) => {
        this.setState({
          minDate: new Date(min),
          maxDate: new Date(max)
        });

        if (operation === 'between' || operation === 'not-between') {
          if (!value.length) {
            onChange({
              value: [
                new Date(min),
                new Date(max)
              ]
            });
          }
        } else if (value === null || value === undefined) {
          onChange({ value: new Date(min) });
        }

        toggleLoading(false);

        // We let the tooltip know that the component has been resized
        onResize();
      })
      .catch((err) => {
        console.error(err);
        toggleLoading(false);
        toastr.error('Unable to load some information for the date filter');
      });
  }

  render() {
    const { minDate, maxDate } = this.state;
    const { value, operation, loading, notNull, onChange, onApply } = this.props;

    const timestampRange = (+maxDate) - (+minDate);

    // NOTE: we apply and then revert an offset to the dates
    // passed to Flatpickr because the library is unable to
    // display UTC dates
    // What we do is that we add the timezone offset to the
    // timestamp of the dates so they are displayed as the
    // ones in UTC. We then subtract the offset once we deal
    // with the dates everywhere else in the code.

    const flatpickrConfig = {
      minDate: value.length
        ? applyTimezoneOffset(value[0])
        : null,
      maxDate: value.length
        ? applyTimezoneOffset(value[1])
        : null,
      dateFormat: timestampRange <= 24 * 3600 * 1000 // eslint-disable-line no-nested-ternary
        ? 'H:i'
        : (timestampRange <= 7 * 24 * 3600 * 1000
          ? 'd-m-Y H:i'
          : 'd-m-Y'
        ),
      time_24hr: true,
      noCalendar: timestampRange <= 24 * 3600 * 1000,
      enableTime: timestampRange <= 7 * 24 * 3600 * 1000,
      locale: { firstDayOfWeek: 1 }
    };

    const canApply = !loading && (
      ((operation === 'between' || operation === 'not-between') && !!value.length) ||
      (value !== null && value !== undefined)
    );

    return (
      <div className="date-filter">
        {!loading && (
          <Select
            id="filter-condition-select"
            properties={{
              name: 'filter-condition',
              value: operation,
              default: operation,
              clearable: false
            }}
            options={FILTER_OPERATION_OPTIONS}
            onChange={val => this.onChangeOperation(val)}
          />
        )}

        {!loading && (operation === 'between' || operation === 'not-between') && (
          <div className="text-inputs-container">
            {!loading && value.length &&
              <label htmlFor="filter-date-from" className="-first">
                From:
                <Flatpickr
                  key={operation} // Make sure to reset the datepicker
                  id="filter-date-from"
                  options={Object.assign({}, flatpickrConfig, {
                    defaultDate: applyTimezoneOffset(value[0]),
                    minDate: applyTimezoneOffset(minDate)
                  })}
                  onChange={this.onChangeStartDate}
                />
              </label>
            }

            {!loading && value.length &&
              <label htmlFor="filter-date-to">
                To:
                <Flatpickr
                  key={operation} // Make sure to reset the datepicker
                  id="filter-date-to"
                  options={Object.assign({}, flatpickrConfig, {
                    defaultDate: applyTimezoneOffset(value[1]),
                    maxDate: applyTimezoneOffset(maxDate)
                  })}
                  onChange={this.onChangeEndDate}
                />
              </label>
            }
          </div>
        )}

        {!loading && operation !== 'between' && operation !== 'not-between' && (
          <div className="text-inputs-container">
            <label htmlFor="filter-date-from">
              Date:
              <Flatpickr
                key={operation} // Make sure to reset the datepicker
                id="filter-date-from"
                options={Object.assign({}, flatpickrConfig, {
                  defaultDate: applyTimezoneOffset(value),
                  minDate: applyTimezoneOffset(minDate),
                  maxDate: applyTimezoneOffset(maxDate)
                })}
                onChange={date => onChange({ value: revertTimezoneOffset(date[0]) })}
              />
            </label>
          </div>
        )}

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

        {canApply && (
          <div className="c-we-buttons">
            <Button
              properties={{ type: 'button', className: '-primary -compressed' }}
              onClick={() => onApply()}
            >
              Done
            </Button>
          </div>
        )}
      </div>
    );
  }
}

FilterDateTooltip.propTypes = {
  datasetID: PropTypes.string.isRequired,
  // NOTE: the values are expected as Date objects
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
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

const mapStateToProps = (_, { operation }) => ({
  // We just give operation a default value
  operation: operation || 'between'
});

export default connect(mapStateToProps)(FilterDateTooltip);
