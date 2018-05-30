import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { setCategory } from 'reducers/widgetEditor';
import ColumnBox from 'components/ui/ColumnBox';

const boxTarget = {
  drop(props, monitor) {
    props.setCategory(monitor.getItem());
  }
};

@DropTarget('columnbox', boxTarget, (connectDrop, monitor) => ({
  connectDropTarget: connectDrop.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
class CategoryContainer extends React.Component {
  render() {
    const { canDrop, connectDropTarget, category, chartType } = this.props;

    const containerDivClass = classNames({
      '-release': canDrop,
      'columnbox-container': true
    });

    // We decide how to name the category container
    // depending on the type of chart
    let categoryLabel = 'Labels';
    if (chartType === 'line' || chartType === 'scatter') {
      categoryLabel = 'X-axis';
    }

    return connectDropTarget(
      <div className="c-we-column-container">
        <span className="text">
          {categoryLabel}
        </span>
        <div className={containerDivClass}>
          {!category &&
          <span className="placeholder">
            Drop here
          </span>
          }
          {category &&
            <ColumnBox
              name={category.name}
              alias={category.alias}
              type={category.type}
              closable
              configurable={category.type === 'number'}
              isA="category"
            />
          }
        </div>
      </div>

    );
  }
}

CategoryContainer.propTypes = {
  connectDropTarget: PropTypes.func,
  canDrop: PropTypes.bool,
  category: PropTypes.object,
  chartType: PropTypes.string
};

const mapStateToProps = ({ widgetEditor }) => ({
  category: widgetEditor.category,
  chartType: widgetEditor.chartType
});

const mapDispatchToProps = dispatch => ({
  setCategory: (category) => {
    dispatch(setCategory(category));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(CategoryContainer);
