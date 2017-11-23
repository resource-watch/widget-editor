import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';

// Redux
import { connect } from 'react-redux';

import { setSize } from 'reducers/widgetEditor';

// Components
import ColumnBox from 'components/ui/ColumnBox';

const boxTarget = {
  drop(props, monitor) {
    const newSize = Object.assign(
      {},
      monitor.getItem(),
      { aggregateFunction: 'none' }
    );
    props.setSize(newSize);
  }
};

@DropTarget('columnbox', boxTarget, (connectDrop, monitor) => ({
  connectDropTarget: connectDrop.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
class SizeContainer extends React.Component {
  setAggregateFunction(value) {
    const newSize = Object.assign(
      {},
      this.props.widgetEditor.size,
      { aggregateFunction: value }
    );
    this.props.setSize(newSize);
  }

  render() {
    const { canDrop, connectDropTarget, widgetEditor } = this.props;
    const size = widgetEditor.size;

    const containerDivClass = classNames({
      '-release': canDrop,
      'columnbox-container': true
    });

    return connectDropTarget(
      <div className="c-column-container">
        <span className="text">
          Size
        </span>
        <div className={containerDivClass}>
          {!size &&
          <span className="placeholder">
            Drop here
          </span>
          }
          {size &&
            <ColumnBox
              name={size.name}
              alias={size.alias}
              type={size.type}
              closable
              configurable
              onConfigure={aggregateFunction => this.setAggregateFunction(aggregateFunction)}
              isA="size"
            />
          }
        </div>
      </div>
    );
  }
}

SizeContainer.propTypes = {
  connectDropTarget: PropTypes.func,
  isOver: PropTypes.bool,
  canDrop: PropTypes.bool,
  // Store
  widgetEditor: PropTypes.object.isRequired,
  setSize: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  widgetEditor: state.widgetEditor
});

const mapDispatchToProps = dispatch => ({
  setSize: (size) => {
    dispatch(setSize(size));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(SizeContainer);
