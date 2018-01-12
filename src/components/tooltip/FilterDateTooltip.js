import React from 'react';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';

// Redux
import { connect } from 'react-redux';
import { toggleTooltip } from 'reducers/tooltip';

// Services
import DatasetService from 'services/DatasetService';

// Components
import Button from 'components/ui/Button';

class FilterDateTooltip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      values: []
    };

    // DatasetService
    this.datasetService = new DatasetService(props.datasetID);
  }

  componentDidMount() {
    this.getFilter();
  }

  onValueChange(selected) {
    this.props.onChange(selected);
  }

  /**
   * Fetch the data about the column and update the state
   * consequently
   */
  getFilter() {
    const { selected } = this.props;

    this.props.getFilter()
      .then((result) => {
        const yearRange = [
          new Date(result.min).getFullYear(),
          new Date(result.max).getFullYear()
        ];
        const years = new Array((yearRange[1] - yearRange[0]) + 1)
          .fill(undefined)
          .map((_, index) => yearRange[0] + index);

        this.setState({
          values: years.map(y => ({ value: y, label: y }))
        });


        if (this.props.onChange && !selected.length) {
          this.props.onChange([yearRange[0], yearRange[1]]);
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
          errors.forEach(er =>
            toastr.error('Error', er.detail)
          );
        } catch (e) {
          toastr.error('Error', 'Oops');
        }
      });
  }

  render() {
    const { values } = this.state;
    const { selected, loading } = this.props;

    return (
      <div className="c-we-filter-string-tooltip">
        {!loading && selected.length &&
          <select
            value={selected[0]}
            onChange={(e) => {
              this.props.onChange([
                e.currentTarget.value,
                selected[1]
              ]);
            }}
          >
            {values.map(v => (
              <option
                key={v.label}
                disabled={+v.value > +selected[1]}
                value={v.value}
              >
                {v.label}
              </option>
            ))}
          </select>
        }

        {!loading && selected.length &&
          <select
            value={selected[1]}
            onChange={(e) => {
              this.props.onChange([
                selected[0],
                e.currentTarget.value
              ]);
            }}
          >
            {values.map(v => (
              <option
                key={v.label}
                disabled={+v.value < +selected[0]}
                value={v.value}
              >
                {v.label}
              </option>
            ))}
          </select>
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

FilterDateTooltip.defaultProps = {
  selected: []
};

const mapDispatchToProps = dispatch => ({
  toggleTooltip: (opened, opts) => {
    dispatch(toggleTooltip(opened, opts));
  }
});

const mapStateToProps = state => ({
  widgetEditor: state.widgetEditor
});

export default connect(mapStateToProps, mapDispatchToProps)(FilterDateTooltip);
