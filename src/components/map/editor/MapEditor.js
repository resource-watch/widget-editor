import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';

// Redux
import { connect } from 'react-redux';

import { showLayer, setBounds } from 'reducers/widgetEditor';

// Components
/* eslint-disable no-unused-vars */
import LayerSelectionScreen from 'components/map/editor/LayerSelectionScreen';
import LayerCreationScreen from 'components/map/editor/LayerCreationScreen';
/* eslint-enable no-unused-vars */

// Helpers
import { canRenderChart } from 'helpers/WidgetHelper';

class MapEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * Screen (component) to render
       * @type {function} ActiveScreen
       */
      ActiveScreen: props.useLayerEditor ? null : LayerSelectionScreen
    };
  }

  /**
   * Event handler executed when changing the active screen
   * @param {function|null} Component React component
   */
  @Autobind
  onChangeScreen(Component) {
    this.setState({ ActiveScreen: Component });

    // We deselect the active layer
    if (Component === null) {
      this.setLayer(null);
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
    const { ActiveScreen } = this.state;
    const { widgetEditor, layers, connectorUrl, tableName, mode, showSaveButton,
      provider, widgetId, useLayerEditor } = this.props;
    const { layer } = widgetEditor;

    const canSave = canRenderChart(widgetEditor, provider);
    const canShowSaveButton = showSaveButton && canSave;

    return (
      <div className="c-we-map-editor">
        { ActiveScreen && (
          <ActiveScreen
            widgetId={widgetId}
            layers={layers}
            connectorUrl={connectorUrl}
            tableName={tableName}
            useLayerEditor={useLayerEditor}
            onChangeLayer={this.onChangeLayer}
            onChangeScreen={this.onChangeScreen}
          />
        ) }
        { !ActiveScreen && (
          <div className="initial-screen">
            <button type="button" className="c-we-button -secondary" onClick={() => this.onChangeScreen(LayerSelectionScreen)}>
              Choose an existing layer
            </button>
            or
            <button type="button" className="c-we-button -secondary" onClick={() => this.onChangeScreen(LayerCreationScreen)}>
              Create a new layer
            </button>
          </div>
        ) }
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
  connectorUrl: PropTypes.string.isRequired,
  useLayerEditor: PropTypes.bool.isRequired,
  tableName: PropTypes.string.isRequired,
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
