import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { toggleTooltip } from 'reducers/tooltip';

// Services
import DatasetService from 'services/DatasetService';

// Components
import Spinner from 'components/ui/Spinner';
import FilterStringTooltip from 'components/tooltip/FilterStringTooltip';
import FilterNumberTooltip from 'components/tooltip/FilterNumberTooltip';
import FilterDateTooltip from 'components/tooltip/FilterDateTooltip';

class FilterTooltip extends React.Component {
  constructor(props) {
    super(props);

    const filters = props.widgetEditor.filters;
    const filter = filters && filters.find(f => f.name === props.name);

    this.state = {
      value: (filter && filter.value) || [],
      operation: null,
      notNull: !!(filter && filter.notNull),
      loading: true,
      timeoutExpired: false
    };

    // After 10s, if we're still loading the data, we let
    // the user know it's normal
    this.timeout = setTimeout(() => {
      if (this.state.loading) {
        this.setState({ timeoutExpired: true });
        if (this.props.onResize) {
          this.props.onResize();
        }
      }
    }, 10000);

    // DatasetService
    this.datasetService = new DatasetService(props.datasetID);

    this.onScreenClick = this.onScreenClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onApply = this.onApply.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.onScreenClick);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onScreenClick);

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  /**
   * Event handler executed when the filter has changed
   * @param {any} state State of the filter
   */
  onChange(state) {
    this.setState(state);
  }

  /**
   * Event handler executed when the user clicks
   * the apply button of the tooltip
   */
  onApply() {
    const { type } = this.props;
    const { value, notNull } = this.state;

    // We save the date filter values as ISO strings
    const serializedValue = type === 'date'
      ? value.map(d => d.toISOString())
      : value;

    this.props.onApply(serializedValue, notNull);

    // We close the tooltip
    requestAnimationFrame(() => {
      this.props.toggleTooltip(false);
    });
  }

  onScreenClick(e) {
    const el = document.querySelector('.c-we-tooltip');
    const flatpicker = document.querySelector('.flatpickr-calendar.open');

    const clickOutside = el && el.contains && !el.contains(e.target)
      && (!flatpicker || !flatpicker.contains(e.target));

    if (clickOutside) {
      this.props.toggleTooltip(false);
    }
  }

  /**
   * Get the min and max values for numeric and temporal columns or the
   * list of distinct values
   * @returns {Promise<any>}
   */
  getFilterInfo() {
    if (this.props.type === 'number' || this.props.type === 'date') {
      return this.datasetService.getColumnMinAndMax(
        this.props.name,
        this.props.tableName,
        this.props.widgetEditor.areaIntersection
      );
    }

    return this.datasetService.getColumnValues(
      this.props.name,
      this.props.tableName,
      true,
      this.props.widgetEditor.areaIntersection
    );
  }

  toggleLoading(loading) {
    this.setState({
      loading,
      timeoutExpired: false
    });

    // After 10s, if we're still loading the data, we let
    // the user know it's normal
    if (loading && !this.timeout) {
      setTimeout(() => {
        if (this.state.loading) {
          this.setState({ timeoutExpired: true });
          if (this.props.onResize) {
            this.props.onResize();
          }
        }
      }, 10000);
    } else if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  render() {
    const { type } = this.props;
    const { loading, value, operation, timeoutExpired, notNull } = this.state;

    return (
      <div className="c-we-filter-tooltip">
        { !!loading && !timeoutExpired && (
          <Spinner
            className="-light -small"
            isLoading={loading}
          />
        )}

        {!!loading && timeoutExpired && (
          <div className="spinner-container">
            <Spinner
              className="-light -small -inline"
              isLoading={loading}
            />
            <p>Results may take some time to load...</p>
          </div>
        )}

        {type === 'string' &&
          <FilterStringTooltip
            {...this.props}
            getFilterInfo={() => this.getFilterInfo()}
            loading={loading}
            value={value}
            notNull={notNull}
            operation={operation}
            onChange={this.onChange}
            onApply={this.onApply}
            toggleLoading={this.toggleLoading}
          />
        }

        {type === 'number' &&
          <FilterNumberTooltip
            {...this.props}
            getFilterInfo={() => this.getFilterInfo()}
            loading={loading}
            value={value}
            notNull={notNull}
            operation={operation}
            onChange={this.onChange}
            onApply={this.onApply}
            toggleLoading={this.toggleLoading}
          />
        }

        {type === 'date' &&
          <FilterDateTooltip
            {...this.props}
            getFilterInfo={() => this.getFilterInfo()}
            loading={loading}
            value={
              // We parse the timestamps as dates
              value.map(d => new Date(d))
            }
            notNull={notNull}
            operation={operation}
            onChange={this.onChange}
            onApply={this.onApply}
            toggleLoading={this.toggleLoading}
          />
        }
      </div>
    );
  }
}

FilterTooltip.propTypes = {
  tableName: PropTypes.string.isRequired,
  datasetID: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  onResize: PropTypes.func, // Passed from the tooltip component
  onApply: PropTypes.func.isRequired,
  // store
  toggleTooltip: PropTypes.func.isRequired,
  widgetEditor: PropTypes.object.isRequired
};

const mapDispatchToProps = dispatch => ({
  toggleTooltip: (opened, opts) => {
    dispatch(toggleTooltip(opened, opts));
  }
});

const mapStateToProps = state => ({
  widgetEditor: state.widgetEditor
});

export default connect(mapStateToProps, mapDispatchToProps)(FilterTooltip);
