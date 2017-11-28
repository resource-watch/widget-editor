import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';

// Redux
import { connect } from 'react-redux';

import { showLayer } from 'reducers/widgetEditor';
import { toggleModal, setModalOptions } from 'reducers/modal';

// Components
import Select from 'components/form/SelectInput';
// import EmbedLayerModal from 'components/modal/EmbedLayerModal';

// Helpers
import { canRenderChart } from 'helpers/WidgetHelper';

class MapEditor extends React.Component {
  @Autobind
  handleLayerChange(layerID) {
    this.props.showLayer(this.props.layers.find(val => val.id === layerID));
  }

  render() {
    const { widgetEditor, layers, mode, showSaveButton, provider } = this.props;
    const { layer } = widgetEditor;

    const canSave = canRenderChart(widgetEditor, provider);
    const canShowSaveButton = showSaveButton && canSave;

    return (
      <div className="c-map-editor">
        <div className="selector-container">
          <h5>
            Layers
          </h5>
          <Select
            properties={{
              name: 'layer-selector',
              value: layer && layer.id,
              default: layer && layer.id
            }}
            options={layers.map(val => (
              {
                label: val.name,
                value: val.id
              }
            ))}
            onChange={this.handleLayerChange}
          />
        </div>
        <div className="actions-container">
          {
            canShowSaveButton &&
            <button
              className="c-button -primary"
              onClick={this.props.onSave}
            >
              {mode === 'save' ? 'Save widget' : 'Update widget'}
            </button>
          }
        </div>
      </div>
    );
  }
}

MapEditor.propTypes = {
  /**
   * Dataset ID
   */
  datasetId: PropTypes.string.isRequired,
  datasetType: PropTypes.string,
  layers: PropTypes.array.isRequired,
  tableName: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
  mode: PropTypes.oneOf(['save', 'update']),
  /**
   * Whether the save/update button should be shown
   * when a widget is rendered
   */
  showSaveButton: PropTypes.bool.isRequired,
  /**
   * Callback executed when the save/update button
   * is clicked
   */
  onSave: PropTypes.func,

  // Store
  showLayer: PropTypes.func.isRequired,
  widgetEditor: PropTypes.object.isRequired,
  toggleModal: PropTypes.func.isRequired
};

const mapStateToProps = ({ widgetEditor }) => ({ widgetEditor });
const mapDispatchToProps = dispatch => ({
  showLayer: layer => dispatch(showLayer(layer)),
  toggleModal: (...args) => { dispatch(toggleModal(...args)); },
  setModalOptions: (...args) => { dispatch(setModalOptions(...args)); }
});

export default connect(mapStateToProps, mapDispatchToProps)(MapEditor);
