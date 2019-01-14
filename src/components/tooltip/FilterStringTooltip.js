import React from 'react';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import debounce from 'lodash/debounce';

// Redux
import { connect } from 'react-redux';
import { toggleTooltip } from 'reducers/tooltip';

// Services
import DatasetService from 'services/DatasetService';

// Components
import CheckboxGroup from 'components/form/CheckboxGroup';
import Checkbox from 'components/form/Checkbox';
import Select from 'components/form/SelectInput';
import Button from 'components/ui/Button';

const FILTER_OPERATION_OPTIONS = [
  { label: 'Filter by values', value: 'by-values' },
  { label: 'Text contains', value: 'contains' },
  { label: 'Text does not contain', value: 'not-contain' },
  { label: 'Text starts with', value: 'starts-with' },
  { label: 'Text ends with', value: 'ends-with' },
  { label: 'Text is exactly', value: '=' },
  { label: 'Text is not', value: '!=' }
];

class FilterStringTooltip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      values: [],
      filteredValues: []
    };

    // DatasetService
    this.datasetService = new DatasetService(props.datasetID);

    this.onSearch = debounce(this.onSearch.bind(this), 10);
  }

  componentDidMount() {
    this.getFilterInfo();
  }

  /**
   * Event handler executed when the user changes the operation
   * @param {string} operation Operation
   */
  onChangeOperation(operation) {
    const { values } = this.state;
    const { onChange, onResize } = this.props;

    onChange({
      operation,
      value: operation === 'by-values'
        ? []
        : null,
      filteredValues: values
    });

    if (onResize) {
      setTimeout(() => onResize(), 0);
    }
  }

  onClearAll() {
    this.props.onChange({ value: [] });
  }

  onSelectAll() {
    this.props.onChange({ value: this.state.values.map(value => value.value) });
  }

  // We debounce the method to avoid having to update the state
  // too often (around 60 FPS)
  onSearch(value) {
    const { values } = this.state;

    const filteredValues = values.filter(
      elem => elem.label.toLowerCase().match(value.toLowerCase())
    );

    this.setState({ filteredValues });
  }

  /**
   * Fetch the data about the column and update the state
   * consequently
   */
  getFilterInfo() {
    this.props.getFilterInfo()
      .then((arr) => {
        const values = arr.map(val => ({ name: val, label: val, value: val }));

        this.setState({ values, filteredValues: values });

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


  render() {
    const { filteredValues } = this.state;
    const { value, operation, loading, notNull, onChange } = this.props;

    return (
      <div className="c-we-filter-string-tooltip">
        {!loading && (
          <Select
            id="filter-condition-select"
            properties={{
              name: 'filter-condition',
              value: operation,
              default: operation
            }}
            options={FILTER_OPERATION_OPTIONS}
            onChange={val => this.onChangeOperation(val)}
          />
        )}

        { !loading && operation === 'by-values' && (
          <div className="text-inputs-container">
            <input
              aria-label="Search a value"
              placeholder="Search a value"
              onChange={event => this.onSearch(event.target.value)}
            />
          </div>
        )}
        { !loading && operation === 'by-values' && (
          <div className="filter-tooltip-content">
            <CheckboxGroup
              selected={value}
              options={filteredValues}
              onChange={vals => this.props.onChange({ value: vals })}
            />
          </div>
        )}

        { !loading && operation !== 'by-values' && (
          <div className="text-inputs-container">
            <input type="text" aria-label="Value" placeholder="Type here" value={value || ''} onChange={({ target }) => onChange({ value: target.value })} />
          </div>
        )}

        {!loading && (
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
        )}

        {!loading && operation === 'by-values' && (
          <div className="c-we-buttons">
            <Button
              properties={{ type: 'button', className: ' -compressed' }}
              onClick={() => this.onSelectAll()}
            >
              Select all
            </Button>
            <Button
              properties={{ type: 'button', className: ' -compressed' }}
              onClick={() => this.onClearAll()}
            >
              Clear
            </Button>
            <Button
              properties={{ type: 'button', className: '-primary -compressed' }}
              onClick={() => this.props.onApply()}
            >
              Done
            </Button>
          </div>
        )}

        {!loading && operation !== 'by-values' && (
          <div className="c-we-buttons">
            <Button
              properties={{ type: 'button', className: '-primary -compressed' }}
              onClick={() => this.props.onApply()}
            >
              Done
            </Button>
          </div>
        )}
      </div>
    );
  }
}

FilterStringTooltip.propTypes = {
  datasetID: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  notNull: PropTypes.bool,
  operation: PropTypes.string,
  loading: PropTypes.bool,
  /**
   * Get the filter value or min/max values
   */
  getFilterInfo: PropTypes.func.isRequired,
  onResize: PropTypes.func, // Passed from the tooltip component
  onChange: PropTypes.func,
  toggleLoading: PropTypes.func,
  onApply: PropTypes.func,
  // store
  widgetEditor: PropTypes.object.isRequired
};

const mapDispatchToProps = dispatch => ({
  toggleTooltip: (opened, opts) => {
    dispatch(toggleTooltip(opened, opts));
  }
});

const mapStateToProps = (state, { operation }) => ({
  widgetEditor: state.widgetEditor,
  operation: operation || 'by-values'
});

export default connect(mapStateToProps, mapDispatchToProps)(FilterStringTooltip);
