import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';

// Redux
import { connect } from 'react-redux';

import { showLayer, setBounds } from 'reducers/widgetEditor';

// Components
import Select from 'components/form/SelectInput';

// Helpers
import { canRenderChart } from 'helpers/WidgetHelper';

class MapEditor extends React.Component {
  constructor(props) {
    super(props);

    // If a widget has been restored, we don't set
    // the default layer
    if (!props.widgetId) {
      // If a default layer is present, we'll select
      // it by default
      const defaultLayer = props.layers.find(l => l.default);
      if (defaultLayer) {
        this.setLayer(defaultLayer);
      }
    }
  }

  /**
   * Event handler executed when the user
   * changes the active layer
   * @param {string} layerID Layer ID
   */
  @Autobind
  onChangeLayer(layerID) {
    const layer = this.props.layers.find(val => val.id === layerID);
    this.setLayer(layer);
  }

  /**
   * Set the active layer
   * @param {object} layer
   */
  setLayer(layer) {
    this.props.showLayer(layer);

    // If the layer has a bounding box defined,
    // we fit the center the map there
    const bbox = layer && layer.layerConfig && layer.layerConfig.bbox;
    if (!bbox) {
      this.props.setBounds(null);
    } else if (bbox.length === 4) {
      // We convert the lng/lat to lat/lng
      // The first two numbers of bbox corresponds to
      // the south west point, and the two others to
      // the north east one
      this.props.setBounds([
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]]
      ]);
    }
  }

  render() {
    const { widgetEditor, layers, mode, showSaveButton, provider } = this.props;
    const { layer } = widgetEditor;

    const canSave = canRenderChart(widgetEditor, provider);
    const canShowSaveButton = showSaveButton && canSave;

    return (
      <div className="c-we-map-editor">
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
            onChange={this.onChangeLayer}
          />
        </div>
        <div className="actions-container">
          {
            canShowSaveButton &&
            <button
              type="button"
              className="c-we-button -primary"
              onClick={this.props.onSave}
            >
              {mode === 'save' ? 'Save visualization' : 'Update visualization'}
            </button>
          }
        </div>
      </div>
    );
  }
}

MapEditor.propTypes = {
  /**
   * ID of the widget, if any
   */
  widgetId: PropTypes.string,
  layers: PropTypes.array.isRequired,
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
  setBounds: PropTypes.func.isRequired,
  widgetEditor: PropTypes.object.isRequired
};

const mapStateToProps = ({ widgetEditor }) => ({ widgetEditor });
const mapDispatchToProps = dispatch => ({
  showLayer: layer => dispatch(showLayer(layer)),
  setBounds: (...params) => dispatch(setBounds(...params))
});

export default connect(mapStateToProps, mapDispatchToProps)(MapEditor);
