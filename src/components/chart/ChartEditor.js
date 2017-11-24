import React from 'react';
import PropTypes from 'prop-types';
import HTML5Backend from 'react-dnd-html5-backend';
import Autobind from 'autobind-decorator';
import { DragDropContext } from 'react-dnd';
import { connect } from 'react-redux';

import ArrowImg from 'images/arrow.svg';

// Redux
import { toggleModal, setModalOptions } from 'reducers/modal';
import { setChartType } from 'reducers/widgetEditor';

// Components
import FilterContainer from 'components/ui/FilterContainer';
import DimensionsContainer from 'components/ui/DimensionsContainer';
import FieldsContainer from 'components/ui/FieldsContainer';
import SortContainer from 'components/ui/SortContainer';
import LimitContainer from 'components/ui/LimitContainer';
import Select from 'components/form/SelectInput';
import SaveWidgetModal from 'components/modal/SaveWidgetModal';
import HowToWidgetEditorModal from 'components/modal/HowToWidgetEditorModal';
import AreaIntersectionFilter from 'components/ui/AreaIntersectionFilter';

// Helpers
import { getConfig } from 'helpers/ConfigHelper';
import { canRenderChart } from 'helpers/WidgetHelper';

@DragDropContext(HTML5Backend)
class ChartEditor extends React.Component {
  @Autobind
  handleChartTypeChange(val) {
    this.props.setChartType(val);
  }

  @Autobind
  handleSaveWidget() {
    const { datasetId, datasetType, datasetProvider, tableName } = this.props;
    const options = {
      children: SaveWidgetModal,
      childrenProps: {
        dataset: datasetId,
        datasetType,
        datasetProvider,
        tableName
      }
    };
    this.props.toggleModal(true);
    this.props.setModalOptions(options);
  }

  @Autobind
  handleUpdateWidget() {
    this.props.onUpdateWidget();
  }

  @Autobind
  handleNeedHelp() {
    const options = {
      children: HowToWidgetEditorModal,
      childrenProps: {}
    };
    this.props.toggleModal(true);
    this.props.setModalOptions(options);
  }

  @Autobind
  handleEmbedTable() {
    this.props.onEmbedTable();
  }

  render() {
    const {
      datasetId,
      datasetProvider,
      tableName,
      jiminy,
      widgetEditor,
      tableViewMode,
      mode,
      showSaveButton,
      hasGeoInfo,
      showEmbedTable
    } = this.props;
    const { chartType, fields } = widgetEditor;

    const userLogged = !!getConfig().userToken;
    const canSave = canRenderChart(widgetEditor, datasetProvider);
    const canShowSaveButton = showSaveButton && canSave;

    const chartOptions = (
      jiminy
      && jiminy.general
      && jiminy.general.map(val => ({ label: val, value: val }))
    ) || [];

    return (
      <div className="c-chart-editor">
        <div className="selectors-container">
          {!tableViewMode &&
            <div className="chart-type">
              <div className="c-field">
                <label htmlFor="chart-style-select">
                  Chart style
                </label>
                <Select
                  id="chart-style-select"
                  properties={{
                    name: 'chart-type',
                    value: chartType,
                    default: chartType
                  }}
                  options={chartOptions}
                  onChange={this.handleChartTypeChange}
                />
              </div>
            </div>
          }
          { hasGeoInfo && <AreaIntersectionFilter /> }
        </div>
        <p>Drag and drop elements from the list to the boxes:</p>
        <div className="actions-div">
          {fields &&
            <FieldsContainer
              dataset={datasetId}
              tableName={tableName}
              fields={fields}
            />
          }
          <div className="arrow-container">
            <img alt="" src={ArrowImg} />
          </div>
          <div className="customization-container">
            <DimensionsContainer />
            <FilterContainer />
            <SortContainer />
            <LimitContainer />
          </div>
        </div>
        <div className="save-widget-container">
          <button
            type="button"
            className="c-button -secondary"
            onClick={this.handleNeedHelp}
          >
            Need help?
          </button>
          { canShowSaveButton && userLogged && mode === 'save' &&
            <a
              role="button"
              className="c-button -primary"
              tabIndex={-2}
              onClick={this.handleSaveWidget}
            >
              Save widget
            </a>
          }
          { canShowSaveButton && userLogged && mode === 'update' &&
            <a
              role="button"
              className="c-button -primary"
              tabIndex={0}
              onClick={this.handleUpdateWidget}
            >
              Save widget
            </a>
          }
          { canShowSaveButton && !userLogged &&
            <span className="not-logged-in-text">
              Please log in to save changes
            </span>
          }
          { tableViewMode && showEmbedTable &&
            <a
              role="button"
              className="c-button -primary"
              tabIndex={0}
              onClick={this.handleEmbedTable}
            >
              Embed table
            </a>
          }
        </div>
      </div>
    );
  }
}

ChartEditor.defaultProps = {
  showEmbedTable: true
};

ChartEditor.propTypes = {
  /**
   * Dataset ID
   */
  datasetId: PropTypes.string.isRequired,
  datasetType: PropTypes.string,
  datasetProvider: PropTypes.string,
  mode: PropTypes.oneOf(['save', 'update']).isRequired,
  tableName: PropTypes.string.isRequired,
  hasGeoInfo: PropTypes.bool.isRequired,
  jiminy: PropTypes.object,
  tableViewMode: PropTypes.bool.isRequired,
  showSaveButton: PropTypes.bool.isRequired,
  showEmbedTable: PropTypes.bool,
  // Store
  widgetEditor: PropTypes.object.isRequired,
  setChartType: PropTypes.func.isRequired,
  toggleModal: PropTypes.func.isRequired,
  setModalOptions: PropTypes.func.isRequired,
  // Callback
  onUpdateWidget: PropTypes.func,
  onEmbedTable: PropTypes.func
};

const mapStateToProps = ({ widgetEditor }) => ({ widgetEditor });
const mapDispatchToProps = dispatch => ({
  setChartType: (type) => {
    dispatch(setChartType(type));
  },
  toggleModal: (open, opts) => { dispatch(toggleModal(open, opts)); },
  setModalOptions: (options) => { dispatch(setModalOptions(options)); }
});

export default connect(mapStateToProps, mapDispatchToProps)(ChartEditor);
