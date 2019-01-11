import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import { connect } from 'react-redux';
import Autobind from 'autobind-decorator';

import { addFilter, setFilterValue } from 'reducers/widgetEditor';
import ColumnBox from 'components/ui/ColumnBox';

const boxTarget = {
  drop(props, monitor) {
    props.addFilter({
      name: monitor.getItem().name,
      type: monitor.getItem().type
    });
  }
};

@DropTarget('columnbox', boxTarget, (connectDrop, monitor) => ({
  connectDropTarget: connectDrop.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
class FilterContainer extends React.Component {
  @Autobind
  setFilter({ name, value, notNull }) {
    this.props.setFilterValue(name, value, notNull);
  }

  render() {
    const { canDrop, connectDropTarget, filters } = this.props;

    const containerDivClass = classNames({
      'filter-box': true,
      '-release': canDrop
    });

    return connectDropTarget(
      <div className="c-we-filter-container">
        <span className="text">
          Filter by value
        </span>
        <div className={containerDivClass}>
          {(!filters || filters.length === 0) &&
          <span className="placeholder">
            Drop here
          </span>
          }
          {filters && filters.length > 0 && filters.map(val => (
            <ColumnBox
              key={val.name}
              name={val.name}
              type={val.type}
              closable
              configurable
              isA="filter"
              onConfigure={this.setFilter}
            />
          ))}
        </div>
      </div>
    );
  }
}

FilterContainer.propTypes = {
  connectDropTarget: PropTypes.func,
  canDrop: PropTypes.bool,
  // Redux
  filters: PropTypes.array,
  setFilterValue: PropTypes.func.isRequired
};

FilterContainer.defaultProps = {
  connectDropTarget: () => {},
  canDrop: true
};

const mapStateToProps = ({ widgetEditor }) => ({
  filters: widgetEditor.filters
});

const mapDispatchToProps = dispatch => ({
  addFilter: (filter) => {
    dispatch(addFilter(filter));
  },
  setFilterValue: (name, value, notNull) => {
    dispatch(setFilterValue(name, value, notNull));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FilterContainer);
