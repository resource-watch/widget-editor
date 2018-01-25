import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';

// Redux
import { connect } from 'react-redux';

import { showLayer } from 'reducers/widgetEditor';

// Components
import Select from 'components/form/SelectInput';

// Helpers
import { canRenderChart } from 'helpers/WidgetHelper';

class MapEditor extends React.Component {
  constructor(props) {
    super(props);

    // If a default layer is present, we'll select
    // it by default
    const defaultLayer = props.layers.find(l => l.default);
    if (defaultLayer) {
      props.showLayer(defaultLayer);
    }
  }

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
            onChange={this.handleLayerChange}
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
  widgetEditor: PropTypes.object.isRequired
};

const mapStateToProps = ({ widgetEditor }) => ({ widgetEditor });
const mapDispatchToProps = dispatch => ({
  showLayer: layer => dispatch(showLayer(layer))
});

export default connect(mapStateToProps, mapDispatchToProps)(MapEditor);
