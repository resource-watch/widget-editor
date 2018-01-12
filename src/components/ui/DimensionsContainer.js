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
    const showSize = chartType && (chartType === 'scatter' || chartType === '1d_scatter' || chartType === '1d_tick');

    const oneDimensionalChart = chartType &&
      (chartType === '1d_scatter' || chartType === '1d_tick');

    return (
      <div className="c-we-dimensions-container">
        <CategoryContainer />
        {!oneDimensionalChart && <ValueContainer />}
        {false && <ColorContainer /> /* temporal while we have legends */}
        {showSize &&
        <SizeContainer />
        }
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
