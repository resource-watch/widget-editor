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
import SaveWidgetModal from 'components/modal/SaveWidgetModal';

// Helpers
import { getConfig } from 'helpers/ConfigHelper';
import { canRenderChart } from 'helpers/WidgetHelper';

class MapEditor extends React.Component {
  /**
   * Event handler executed when the user clicks the
   * Save button
   */
  @Autobind
  onClickSaveWidget() {
    const options = {
      children: SaveWidgetModal,
      childrenProps: {
        dataset: this.props.datasetId,
        datasetType: this.props.datasetType,
        datasetProvider: this.props.provider,
        tableName: this.props.tableName
      }
    };

    this.props.toggleModal(true, options);
  }

  /**
   * Event handler executed when the user clicks the
   * Save button while editing an existing widget
   */
  @Autobind
  onClickUpdateWidget() {
    this.props.onUpdateWidget();
  }

  @Autobind
  handleLayerChange(layerID) {
    this.props.showLayer(this.props.layers.find(val => val.id === layerID));
  }

  render() {
    const { widgetEditor, layers, mode, showSaveButton } = this.props;
    const { layer } = widgetEditor;

    const userLogged = !!getConfig().userToken;
    const canSave = canRenderChart(widgetEditor, datasetProvider);
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
          { canShowSaveButton && userLogged && mode === 'save' &&
            <button
              className="c-button -primary"
              onClick={this.onClickSaveWidget}
            >
              Save widget
            </button>
          }
          { canShowSaveButton && userLogged && mode === 'update' &&
            <button
              className="c-button -primary"
              onClick={this.onClickUpdateWidget}
            >
              Save widget
            </button>
          }
          { canShowSaveButton && !userLogged &&
            <span className="not-logged-in-text">
              Please log in to save changes
            </span>
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
  showSaveButton: PropTypes.bool,
  onUpdateWidget: PropTypes.func,

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
