import React from 'react';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import Flatpickr from 'react-flatpickr';

// Services
import DatasetService from 'services/DatasetService';

// Components
import Button from 'components/ui/Button';

class FilterDateTooltip extends React.Component {
  /**
   * Return the date shifted by the timezone offset
   * @param {Date} date Date to offset
   */
  static applyTimezoneOffset(date) {
    return new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000));
  }

  /**
   * Return the date shifted by the opposite of the timezone offset
   * @param {Date} date Date to offset
   */
  static revertTimezoneOffset(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));
  }

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
    this.getFilter();
  }

  /**
   * Event handler executed when the user changes
   * the start date
   * @param {Date} date New start date
   */
  onChangeStartDate(date) {
    this.props.onChange([
      FilterDateTooltip.revertTimezoneOffset(date[0]),
      this.props.selected[1]
    ]);
  }

  /**
   * Event handler executed when the user changes
   * the end date
   * @param {Date} date New end date
   */
  onChangeEndDate(date) {
    this.props.onChange([
      this.props.selected[0],
      FilterDateTooltip.revertTimezoneOffset(date[0])
    ]);
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
          minDate: new Date(min),
          maxDate: new Date(max)
        });

        if (!selected.length) {
          this.props.onChange([new Date(min), new Date(max)]);
        }

        this.props.onToggleLoading(false);

        // We let the tooltip know that the component has been resized
        this.props.onResize();
      })
      .catch((err) => {
        console.error(err);
        this.props.onToggleLoading(false);
        toastr.error('Unable to load some information for the date filter');
      });
  }

  render() {
    const { minDate, maxDate } = this.state;
    const { selected, loading } = this.props;

    const timestampRange = (+maxDate) - (+minDate);

    // NOTE: we apply and then revert an offset to the dates
    // passed to Flatpickr because the library is unable to
    // display UTC dates
    // What we do is that we add the timezone offset to the
    // timestamp of the dates so they are displayed as the
    // ones in UTC. We then subtract the offset once we deal
    // with the dates everywhere else in the code.

    const flatpickrConfig = {
      minDate: selected.length
        ? FilterDateTooltip.applyTimezoneOffset(selected[0])
        : null,
      maxDate: selected.length
        ? FilterDateTooltip.applyTimezoneOffset(selected[1])
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

    return (
      <div className="date-filter">
        {!loading && selected.length &&
          <label htmlFor="filter-date-from">
            From:
            <Flatpickr
              id="filter-date-from"
              options={Object.assign({}, flatpickrConfig, {
                defaultDate: FilterDateTooltip.applyTimezoneOffset(selected[0]),
                minDate: FilterDateTooltip.applyTimezoneOffset(minDate)
              })}
              onChange={this.onChangeStartDate}
            />
          </label>
        }

        {!loading && selected.length &&
          <label htmlFor="filter-date-to">
            To:
            <Flatpickr
              id="filter-date-to"
              options={Object.assign({}, flatpickrConfig, {
                defaultDate: FilterDateTooltip.applyTimezoneOffset(selected[1]),
                maxDate: FilterDateTooltip.applyTimezoneOffset(maxDate)
              })}
              onChange={this.onChangeEndDate}
            />
          </label>
        }

        {!loading &&
          <div className="buttons">
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

FilterDateTooltip.propTypes = {
  datasetID: PropTypes.string.isRequired,
  // NOTE: the values are expected as Date objects
  selected: PropTypes.array.isRequired,
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

export default FilterDateTooltip;
