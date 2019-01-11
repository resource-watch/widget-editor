import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import { connect } from 'react-redux';
import Autobind from 'autobind-decorator';

import { setValue, setAggregateFunction } from 'reducers/widgetEditor';
import ColumnBox from 'components/ui/ColumnBox';

const boxTarget = {
  drop(props, monitor) {
    props.setValue(monitor.getItem());
    props.setAggregateFunction(null);
  }
};

@DropTarget('columnbox', boxTarget, (connectDrop, monitor) => ({
  connectDropTarget: connectDrop.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
class DimensionYContainer extends React.Component {
  componentWillReceiveProps(nextProps) {
    const currentValue = this.props.value
      && this.props.value.name;
    const nextValue = nextProps.value
      && nextProps.value.name;

    // If the column changes, we reset the aggregate function
    if (currentValue !== nextValue) {
      this.props.setAggregateFunction(null);
    }
  }

  @Autobind
  setAggregateFunction({ value }) {
    this.props.setAggregateFunction(value);
  }

  render() {
    const { canDrop, connectDropTarget, value, chartType } = this.props;

    const containerDivClass = classNames({
      '-release': canDrop,
      'columnbox-container': true
    });

    // We decide how to name the category container
    // depending on the type of chart
    let valueLabel = 'Values';
    if (chartType === 'line' || chartType === 'scatter') {
      valueLabel = 'Y-axis';
    }

    return connectDropTarget(
      <div className="c-we-column-container">
        <span className="text">
          {valueLabel}
        </span>
        <div className={containerDivClass}>
          {!value &&
          <span className="placeholder">
            Drop here
          </span>
          }
          {value &&
            <ColumnBox
              name={value.name}
              type={value.type}
              closable
              configurable
              onConfigure={this.setAggregateFunction}
              isA="value"
            />
          }
        </div>
      </div>
    );
  }
}

DimensionYContainer.propTypes = {
  connectDropTarget: PropTypes.func,
  canDrop: PropTypes.bool,
  // Redux
  value: PropTypes.object,
  chartType: PropTypes.string,
  setAggregateFunction: PropTypes.func.isRequired
};

const mapStateToProps = ({ widgetEditor }) => ({
  value: widgetEditor.value,
  chartType: widgetEditor.chartType
});

const mapDispatchToProps = dispatch => ({
  setValue: (value) => {
    dispatch(setValue(value));
  },
  setAggregateFunction: (value) => {
    dispatch(setAggregateFunction(value));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(DimensionYContainer);
