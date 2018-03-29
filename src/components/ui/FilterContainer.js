import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { addFilter, setFilterValue } from 'reducers/widgetEditor';
import ColumnBox from 'components/ui/ColumnBox';

const boxTarget = {
  drop(props, monitor) {
    props.addFilter(monitor.getItem());
  }
};

@DropTarget('columnbox', boxTarget, (connectDrop, monitor) => ({
  connectDropTarget: connectDrop.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
class FilterContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: []
    };
  }

  setFilter({ name, value, notNull }) {
    this.props.setFilterValue(name, value, notNull);
  }


  render() {
    const { canDrop, connectDropTarget, widgetEditor } = this.props;
    const filters = widgetEditor.filters;

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
              alias={val.alias}
              type={val.type}
              datasetID={val.datasetID}
              tableName={val.tableName}
              closable
              configurable
              isA="filter"
              onConfigure={filter => this.setFilter(filter)}
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
  widgetEditor: PropTypes.object.isRequired,
  // Redux
  setFilterValue: PropTypes.func.isRequired
};

FilterContainer.defaultProps = {
  connectDropTarget: () => {},
  canDrop: true
};

const mapStateToProps = state => ({
  widgetEditor: state.widgetEditor
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
