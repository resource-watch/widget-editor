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
  constructor(props) {
    super(props);

    this.state = {
      category: null
    };
  }


  render() {
    const { canDrop, connectDropTarget, widgetEditor } = this.props;
    const { category } = widgetEditor;

    const containerDivClass = classNames({
      '-release': canDrop,
      'columnbox-container': true
    });

    return connectDropTarget(
      <div className="c-we-column-container">
        <span className="text">
          Category
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
  isOver: PropTypes.bool,
  canDrop: PropTypes.bool,
  widgetEditor: PropTypes.object
};

const mapStateToProps = state => ({
  widgetEditor: state.widgetEditor
});

const mapDispatchToProps = dispatch => ({
  setCategory: (category) => {
    dispatch(setCategory(category));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(CategoryContainer);
