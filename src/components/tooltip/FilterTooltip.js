import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { toggleTooltip } from 'reducers/tooltip';

// Services
import DatasetService from 'services/DatasetService';

// Components
import Spinner from 'components/ui/Spinner';
import Checkbox from 'components/form/Checkbox';
import FilterStringTooltip from 'components/tooltip/FilterStringTooltip';
import FilterNumberTooltip from 'components/tooltip/FilterNumberTooltip';
import FilterDateTooltip from 'components/tooltip/FilterDateTooltip';

class FilterTooltip extends React.Component {
  constructor(props) {
    super(props);

    const filters = props.widgetEditor.filters;
    const filter = filters && filters.find(f => f.name === props.name);

    this.state = {
      selected: (filter && filter.value) || [],
      notNullSelected: filter && filter.notNull,
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
    this.onToggleLoading = this.onToggleLoading.bind(this);
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

  onChange(selected) {
    this.setState({ selected });
  }

  onApply() {
    const { type } = this.props;
    const { selected, notNullSelected } = this.state;

    // We save the date filter values as ISO strings
    let value = selected;
    if (type === 'date') {
      value = selected.map(d => d.toISOString());
    }

    this.props.onApply(value, notNullSelected);

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

  onToggleLoading(loading) {
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

  handleNotNullSelection(value) {
    this.setState({
      notNullSelected: value
    });
  }

  /**
   * Get the min and max values for numeric and temporal columns or the
   * list of distinct values
   * @returns {Promise<any>}
   */
  getFilter() {
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

  render() {
    const { type } = this.props;
    const { loading, timeoutExpired, notNullSelected } = this.state;

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

        {!loading &&
          <div className="c-we-checkbox">
            <Checkbox
              properties={{
                title: 'Not null values',
                checked: notNullSelected,
                default: false
              }}
              onChange={elem => this.handleNotNullSelection(elem.checked)}
            />
          </div>
        }

        {type === 'string' &&
          <FilterStringTooltip
            {...this.props}
            getFilter={() => this.getFilter()}
            loading={this.state.loading}
            selected={this.state.selected}
            onChange={this.onChange}
            onToggleLoading={this.onToggleLoading}
            onApply={this.onApply}
          />
        }

        {type === 'number' &&
          <FilterNumberTooltip
            {...this.props}
            getFilter={() => this.getFilter()}
            loading={this.state.loading}
            selected={this.state.selected}
            onChange={this.onChange}
            onToggleLoading={this.onToggleLoading}
            onApply={this.onApply}
          />
        }

        {type === 'date' &&
          <FilterDateTooltip
            {...this.props}
            getFilter={() => this.getFilter()}
            loading={this.state.loading}
            selected={
              // We parse the timestamps as dates
              this.state.selected.map(d => new Date(d))
            }
            onChange={this.onChange}
            onToggleLoading={this.onToggleLoading}
            onApply={this.onApply}
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
