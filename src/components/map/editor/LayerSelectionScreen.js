import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Components
import Select from 'components/form/SelectInput';
import Icon from 'components/ui/Icon';

function LayerSelectionScreen(props) {
  const { widgetEditor, layers, useLayerEditor, onChangeLayer, onChangeScreen } = props;
  const { layer } = widgetEditor;

  if (!props.widgetId && !(layer && layer.id)) {
    // If a default layer is present, we'll select
    // it by default
    const defaultLayer = props.layers.find(l => l.default);
    if (defaultLayer) {
      onChangeLayer(defaultLayer.id);
    }
  }

  return (
    <div className="layer-selection-screen">
      { useLayerEditor && (
        <div className="breadcrumbs">
          <button
            type="button"
            className="c-we-button -compressed"
            onClick={() => onChangeScreen(null)}
          >
            <Icon name="icon-arrow-left" className="-smaller" /> Back
          </button>
        </div>
      )}
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
          onChange={onChangeLayer}
        />
      </div>
    </div>
  );
}

LayerSelectionScreen.propTypes = {
  /**
   * ID of the widget to restore, if any
   * @type {string} widgetId
   */
  widgetId: PropTypes.string,
  /**
   * List of layers
   * @type {any[]} layers
   */
  layers: PropTypes.array.isRequired,
  /**
   * Whether the layer-editor feature is available
   * @type {boolean} useLayerEditor
   */
  useLayerEditor: PropTypes.bool.isRequired,
  /**
   * Callback to execute to change the active layer
   * @type {(layerId: string) => void}
   */
  onChangeLayer: PropTypes.func.isRequired,
  /**
   * Callback to execute to change the active screen
   * @type {(Component: function|null) => void}
   */
  onChangeScreen: PropTypes.func.isRequired,
  /**
   * REDUX
   */
  widgetEditor: PropTypes.any.isRequired
};

LayerSelectionScreen.defaultProps = {
  widgetId: null
};

const mapStateToProps = ({ widgetEditor }) => ({ widgetEditor });

export default connect(mapStateToProps, null)(LayerSelectionScreen);
