import widgetEditorModal, * as modalActions from 'reducers/modal';
import widgetEditorTooltip, * as tooltipActions from 'reducers/tooltip';
import widgetEditor, * as widgetEditorActions from 'reducers/widgetEditor';
import * as widgetHelper from 'helpers/WidgetHelper';

// Components
export { default } from 'components/WidgetEditor';
export { default as Modal } from 'components/ui/Modal';
export { default as Tooltip } from 'components/ui/Tooltip';
export { default as Icons } from 'components/ui/Icons';

export { default as ChartEditor } from 'components/chart/ChartEditor';
export { default as VegaChart } from 'components/chart/VegaChart';
export { default as VegaChartLegend } from 'components/chart/legend/VegaChartLegend';

export { default as Checkbox } from 'components/form/Checkbox';
export { default as CheckboxGroup } from 'components/form/CheckboxGroup';
export { default as Field } from 'components/form/Field';
export { default as FormElement } from 'components/form/FormElement';
export { default as Input } from 'components/form/Input';
export { default as RadioGroup } from 'components/form/RadioGroup';
export { default as SelectInput } from 'components/form/SelectInput';
export { default as Validator } from 'components/form/Validator';

export { default as BasemapControl } from 'components/map/controls/BasemapControl';
export { default as Map } from 'components/map/Map';
export { default as MapControls } from 'components/map/MapControls';
export { default as MapEditor } from 'components/map/editor/MapEditor';

export { default as EmbedTableModal } from 'components/modal/EmbedTableModal';
export { default as HowToWidgetEditorModal } from 'components/modal/HowToWidgetEditorModal';
export { default as LayerInfoModal } from 'components/modal/LayerInfoModal';
export { default as SaveWidgetModal } from 'components/modal/SaveWidgetModal';
export { default as UploadAreaIntersectionModal } from 'components/modal/UploadAreaIntersectionModal';

export { default as NEXGDDPEditor } from 'components/nexgddp/NEXGDDPEditor';
export { default as RasterChartEditor } from 'components/raster/RasterChartEditor';
export { default as TableView } from 'components/table/TableView';

export { default as AggregateFunctionTooltip } from 'components/tooltip/AggregateFunctionTooltip';
export { default as ColumnDetails } from 'components/tooltip/ColumnDetails';
export { default as FilterDateTooltip } from 'components/tooltip/FilterDateTooltip';
export { default as FilterNumberTooltip } from 'components/tooltip/FilterNumberTooltip';
export { default as FilterStringTooltip } from 'components/tooltip/FilterStringTooltip';
export { default as FilterTooltip } from 'components/tooltip/FilterTooltip';
export { default as LayersTooltip } from 'components/tooltip/LayersTooltip';
export { default as OrderByTooltip } from 'components/tooltip/OrderByTooltip';
export { default as SliderTooltip } from 'components/tooltip/SliderTooltip';

export { default as LayerManager } from 'helpers/LayerManager';
export { default as getVegaTheme } from 'helpers/theme';
export { widgetHelper };

export { default as AreasService } from 'services/AreasService';
export { default as DatasetService } from 'services/DatasetService';
export { default as RasterService } from 'services/RasterService';
export { default as UserService } from 'services/UserService';
export { default as WidgetService } from 'services/WidgetService';

export { getConfig, setConfig } from 'helpers/ConfigHelper';

// Redux
export const reducers = {
  widgetEditorModal,
  widgetEditorTooltip,
  widgetEditor
};
export { modalActions, tooltipActions, widgetEditorActions };
