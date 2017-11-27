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
import Button from 'components/ui/Button';

class FilterStringTooltip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      values: [],
      filteredValues: []
    };

    // DatasetService
    this.datasetService = new DatasetService(props.datasetID);

    this.handleSearch = debounce(this.handleSearch.bind(this), 10);
  }

  componentDidMount() {
    this.getFilter();
  }

  onClearAll() {
    this.props.onChange([]);
  }

  onSelectAll() {
    this.props.onChange(this.state.values.map(value => value.value));
  }

  /**
   * Fetch the data about the column and update the state
   * consequently
   */
  getFilter() {
    this.props.getFilter()
      .then((arr) => {
        const values = arr.map(val => ({ name: val, label: val, value: val }));

        this.setState({ values, filteredValues: values });

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
          errors.forEach(er =>
            toastr.error('Error', er.detail)
          );
        } catch (e) {
          toastr.error('Error', 'Oops');
        }
      });
  }

  // We debounce the method to avoid having to update the state
  // too often (around 60 FPS)
  handleSearch(value) {
    const filteredValues = this.state.values.filter(elem =>
      elem.label.toLowerCase().match(value.toLowerCase()));
    this.setState({ filteredValues });
  }


  render() {
    const { filteredValues } = this.state;
    const { selected, loading, type } = this.props;

    return (
      <div className="c-filter-string-tooltip">
        <div className="search-input">
          <input
            placeholder="Search"
            onChange={event => this.handleSearch(event.target.value)}
          />
        </div>
        <div className="filter-tooltip-content">
          <CheckboxGroup
            selected={selected}
            options={filteredValues}
            onChange={vals => this.props.onChange(vals)}
          />
        </div>

        {!loading &&
          <div className="buttons">
            {type === 'string' &&
              <Button
                properties={{ type: 'button', className: ' -compressed' }}
                onClick={() => this.onSelectAll()}
              >
                Select all
              </Button>
            }
            {type === 'string' &&
              <Button
                properties={{ type: 'button', className: ' -compressed' }}
                onClick={() => this.onClearAll()}
              >
                Clear
              </Button>
            }
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

FilterStringTooltip.propTypes = {
  tableName: PropTypes.string.isRequired,
  datasetID: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  selected: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  /**
   * Get the filter value or min/max values
   */
  getFilter: PropTypes.func.isRequired,
  onResize: PropTypes.func, // Passed from the tooltip component
  onChange: PropTypes.func,
  onToggleLoading: PropTypes.func,
  onApply: PropTypes.func,
  // store
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

export default connect(mapStateToProps, mapDispatchToProps)(FilterStringTooltip);
