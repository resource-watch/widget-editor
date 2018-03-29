import React from 'react';
import PropTypes from 'prop-types';
import HTML5Backend from 'react-dnd-html5-backend';
import Autobind from 'autobind-decorator';
import { DragDropContext } from 'react-dnd';
import { connect } from 'react-redux';

// Redux
import { toggleModal, setModalOptions } from 'reducers/modal';
import { setChartType } from 'reducers/widgetEditor';

// Components
import Icon from 'components/ui/Icon';
import FilterContainer from 'components/ui/FilterContainer';
import DimensionsContainer from 'components/ui/DimensionsContainer';
import FieldsContainer from 'components/ui/FieldsContainer';
import SortContainer from 'components/ui/SortContainer';
import LimitContainer from 'components/ui/LimitContainer';
import Select from 'components/form/SelectInput';
import HowToWidgetEditorModal from 'components/modal/HowToWidgetEditorModal';
import AreaIntersectionFilter from 'components/ui/AreaIntersectionFilter';

// Helpers
import { canRenderChart } from 'helpers/WidgetHelper';

@DragDropContext(HTML5Backend)
class ChartEditor extends React.Component {
  constructor(props) {
    super(props);

    if (!props.widgetEditor.chartType && props.chartOptions.length) {
      props.setChartType(props.chartOptions[0].value);
    }
  }

  @Autobind
  handleChartTypeChange(val) {
    this.props.setChartType(val);
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

  render() {
    const {
      datasetId,
      datasetProvider,
      tableName,
      chartOptions,
      widgetEditor,
      tableViewMode,
      mode,
      showSaveButton,
      hasGeoInfo,
      showEmbedButton
    } = this.props;
    const { chartType, fields } = widgetEditor;

    const canSave = canRenderChart(widgetEditor, datasetProvider);
    const canShowSaveButton = showSaveButton && canSave && !tableViewMode;
    const canShowEmbedButton = showEmbedButton && canSave && tableViewMode;

    return (
      <div className="c-we-chart-editor">
        <div className="selectors-container">
          {!tableViewMode &&
            <div className="chart-type">
              <div className="c-we-field">
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
          <Icon name="icon-column-arrow" />
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
            className="c-we-button -secondary"
            onClick={this.handleNeedHelp}
          >
            Need help?
          </button>
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
          { canShowEmbedButton &&
            <button
              type="button"
              className="c-we-button -primary"
              onClick={this.props.onEmbed}
            >
              Embed table
            </button>
          }
        </div>
      </div>
    );
  }
}

ChartEditor.propTypes = {
  /**
   * Dataset ID
   */
  datasetId: PropTypes.string.isRequired,
  datasetProvider: PropTypes.string,
  mode: PropTypes.oneOf(['save', 'update']).isRequired,
  tableName: PropTypes.string.isRequired,
  hasGeoInfo: PropTypes.bool.isRequired,
  /**
   * All the available chart options for this dataset
   */
  chartOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string
  })).isRequired,
  tableViewMode: PropTypes.bool.isRequired,
  /**
   * Whether the save/update button should be shown
   * when a widget is rendered
   */
  showSaveButton: PropTypes.bool.isRequired,
  /**
   * Whether the embed button should be shown
   * when a widget is rendered
   */
  showEmbedButton: PropTypes.bool,
  /**
   * Callback executed when the save/update button
   * is clicked
   */
  onSave: PropTypes.func,
  /**
   * Callback executed when the embed button is
   * clicked
   */
  onEmbed: PropTypes.func,
  // Store
  widgetEditor: PropTypes.object.isRequired,
  setChartType: PropTypes.func.isRequired,
  toggleModal: PropTypes.func.isRequired,
  setModalOptions: PropTypes.func.isRequired
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
