import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import Autobind from 'autobind-decorator';

// Redux
import { connect } from 'react-redux';

import { setOrderBy } from 'reducers/widgetEditor';

// Components
import ColumnBox from 'components/ui/ColumnBox';

const boxTarget = {
  drop(props, monitor) {
    props.setOrderBy(Object.assign({}, monitor.getItem(), { orderType: 'asc' }));
  }
};

@DropTarget('columnbox', boxTarget, ({ dropTarget }, monitor) => ({
  connectDropTarget: dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
class SortContainer extends React.Component {
  @Autobind
  handleSetOrderType(orderBy) {
    this.props.setOrderBy(orderBy);
  }

  render() {
    const { canDrop, connectDropTarget, widgetEditor } = this.props;
    const orderBy = widgetEditor.orderBy;

    const containerDivClass = classNames({
      '-release': canDrop,
      'columnbox-container': true
    });

    return connectDropTarget(
      <div className="c-we-column-container c-we-sort-container">
        <span className="text">
          Order
        </span>
        <div className={containerDivClass}>
          {!orderBy &&
          <span className="placeholder">
            Drop here
          </span>
          }
          {orderBy &&
            <ColumnBox
              name={orderBy.name}
              alias={orderBy.alias}
              type={orderBy.type}
              closable
              configurable
              isA="orderBy"
              onSetOrderType={this.handleSetOrderType}
            />
          }
        </div>
      </div>
    );
  }
}

SortContainer.propTypes = {
  connectDropTarget: PropTypes.func,
  canDrop: PropTypes.bool,
  // Store
  setOrderBy: PropTypes.func.isRequired,
  widgetEditor: PropTypes.object.isRequired
};

SortContainer.defaultProps = {
  connectDropTarget: () => {},
  canDrop: true
};

const mapStateToProps = state => ({
  widgetEditor: state.widgetEditor
});

const mapDispatchToProps = dispatch => ({
  setOrderBy: (orderBy) => {
    dispatch(setOrderBy(orderBy));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(SortContainer);
