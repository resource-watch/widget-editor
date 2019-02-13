import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Components
import CategoryContainer from 'components/ui/CategoryContainer';
import ColorContainer from 'components/ui/ColorContainer';
import ValueContainer from 'components/ui/ValueContainer';
import SizeContainer from 'components/ui/SizeContainer';

class DimensionsContainer extends React.Component {

  render() {
    const { chartType } = this.props.widgetEditor;

    const oneDimensionalChart = chartType && (chartType === '1d_scatter' || chartType === '1d_tick');

    const showSize = chartType && (chartType === 'scatter' || chartType === '1d_scatter' || chartType === '1d_tick');

    const showColor = chartType
      && [
        'bar',
        'stacked-bar',
        'bar-horizontal',
        'stacked-bar-horizontal',
        'line'
      ].indexOf(chartType) !== -1;

    return (
      <div className="c-we-dimensions-container">
        <CategoryContainer />
        {!oneDimensionalChart && <ValueContainer />}
        {showColor && <ColorContainer />}
        {showSize && <SizeContainer />}
      </div>
    );
  }
}

DimensionsContainer.propTypes = {
  // Store
  widgetEditor: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  widgetEditor: state.widgetEditor
});

export default connect(mapStateToProps, null)(DimensionsContainer);
