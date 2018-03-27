import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import { connect } from 'react-redux';

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
  constructor(props) {
    super(props);

    this.state = {
      value: null
    };
  }

  componentWillReceiveProps(nextProps) {
    const currentValue = this.props.widgetEditor.value
      && this.props.widgetEditor.value.name;
    const nextValue = nextProps.widgetEditor.value
      && nextProps.widgetEditor.value.name;

    // If the column changes, we reset the aggregate function
    if (currentValue !== nextValue) {
      this.props.setAggregateFunction(null);
    }
  }

  setAggregateFunction({ value }) {
    this.props.setAggregateFunction(value);
  }

  render() {
    const { canDrop, connectDropTarget, widgetEditor } = this.props;
    const value = widgetEditor.value;

    const containerDivClass = classNames({
      '-release': canDrop,
      'columnbox-container': true
    });

    return connectDropTarget(
      <div className="c-we-column-container">
        <span className="text">
          Value (y)
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
              alias={value.alias}
              type={value.type}
              closable
              configurable
              onConfigure={aggregateFunction => this.setAggregateFunction(aggregateFunction)}
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
  isOver: PropTypes.bool,
  canDrop: PropTypes.bool,
  widgetEditor: PropTypes.object,
  // Redux
  setAggregateFunction: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  widgetEditor: state.widgetEditor
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
