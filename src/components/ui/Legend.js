import React from 'react';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';
import sortBy from 'lodash/sortBy';
// import { Router } from 'routes';
import InputRange from 'react-input-range';

// Redux
import { connect } from 'react-redux';
import { toggleModal } from 'reducers/modal';
import { toggleTooltip, setTooltipPosition } from 'reducers/tooltip';

// Components
import LegendType from 'components/ui/LegendType';
import Icon from 'components/ui/Icon';
import LayerInfoModal from 'components/modal/LayerInfoModal';
import LayersTooltip from 'components/tooltip/LayersTooltip';
import SliderTooltip from 'components/tooltip/SliderTooltip';
import Button from 'components/ui/Button';

const TIMELINE_INTERVAL_TIMER = 3000;

const SortableItem = SortableElement(({ value }) => value);

const DragHandle = SortableHandle(() => (
  <span className="handler">
    <Icon name="icon-drag-dots" className="-small" />
  </span>
));

const SortableList = SortableContainer(({ items }) => (
  <ul className="legend-list">
    {items.map((value, index) =>
      <SortableItem key={value.key} index={index} value={value} />
    )}
  </ul>
));

class Legend extends React.PureComponent {
  /**
   * Return the position of a DOM element
   * @static
   * @param {HTMLElement} node
   * @returns {{ x: number, y: number }}
   */
  static getElementPosition(node) {
    const clientRect = node.getBoundingClientRect();
    return {
      x: window.scrollX + clientRect.left + (clientRect.width / 2),
      y: window.scrollY + clientRect.top + (clientRect.height / 2)
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      open: props.expanded,
      layersTooltipOpen: false,
      layersTourTooltipOpen: false,
      opacityTooltipOpen: false,
      opacityOptions: {},
      // Show a "tour" tooltip if the user adds a multi-layer
      // layer group for the first time
      hasShownLayersTourTooltip: false,
      currentStepTimeline: null,
      isTimelinePlaying: false
    };

    // List of the layers buttons
    this.layersButtons = [];

    // BINDINGS
    this.onSortEnd = this.onSortEnd.bind(this);
    this.onScrollLegend = throttle(this.onScrollLegend.bind(this), 30);
  }

  componentDidMount() {
    // Show the layers tour tooltip
    if (!this.state.hasShownLayersTourTooltip && this.state.open) {
      this.showLayersTourTooltip();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tooltipOpened === undefined && this.state.opacityTooltipOpen
      && this.state.opacityOptions.target) {
      const layerGroup = nextProps.layerGroups
        .find(lg => lg.dataset === this.state.opacityOptions.dataset);

      if (layerGroup) {
        this.onClickOpacity({ target: this.state.opacityOptions.target }, layerGroup);
      }
    }
  }

  componentDidUpdate(previousProps, previousState) {
    const haveLayerGroupsChanged = !isEqual(this.props.layerGroups, previousProps.layerGroups);
    // If the layers tooltip is opened and the layer groups changed in
    // some way, then the height of the legend might change and we need
    // to reposition the tooltip
    if (this.state.layersTooltipOpen
      && this.activeLayersButton
      && haveLayerGroupsChanged) {
      this.props.setTooltipPosition(Legend.getElementPosition(this.activeLayersButton));
    }

    // Show the layers tour tooltip
    if ((haveLayerGroupsChanged || this.state.open !== previousState.open)
      && !this.state.hasShownLayersTourTooltip) {
      if (this.state.open) this.showLayersTourTooltip();
    }
  }

  /**
   * Event handler executed when the user starts dragging
   * a layer group
   */
  onSortStart() {
    // If the layers tour tooltip is opened, then we close it
    if (this.state.layersTourTooltipOpen) {
      this.closeLayersTourTooltip();
    }
  }

  /**
   * Event handler executed when the user drops the layer group
   * they were dragging
   * @param {any} { oldIndex, newIndex }
   */
  onSortEnd({ oldIndex, newIndex }) {
    const layers = [...this.props.layerGroups];
    const datasets = arrayMove(layers, oldIndex, newIndex)
      .map(l => l.dataset);
    this.props.setLayerGroupsOrder(datasets);
  }

  /**
   * Event handler executed when the user clicks the button
   * to toggle the visibility of a layer
   * @param {object} layer
   */
  onToggleLayerGroupVisibility(layerGroup) {
    this.props.toggleLayerGroupVisibility(layerGroup);
  }

  /**
   * Event handler executed when the user clicks the button
   * to remove a layer group from the map
   * @param {LayerGroup} layerGroup
   */
  onRemoveLayerGroup(layerGroup) {
    this.setState({ currentStepTimeline: null, isTimelinePlaying: false });
    this.props.removeLayerGroup(layerGroup);
  }

  /**
   * Event handler executed when the user clicks the info
   * button of a layer group
   * @param {LayerGroup} layerGroup
   */
  onLayerInfoModal(layerGroup) {
    const activeLayer = layerGroup.layers.find(l => l.active);
    this.props.toggleModal(true, {
      children: LayerInfoModal,
      childrenProps: {
        data: activeLayer
      }
    });
  }

  /**
   * Event handler executed when the user moves the opacity slider
   * @param {Value} value
   * @param {LayerGroup} layerGroup
   */
  onChangeOpacity(value, layerGroup) {
    if (this.props.setLayerGroupOpacity) {
      this.props.setLayerGroupOpacity(value, layerGroup);
    }
  }

  /**
   * Event handler executed when the user clicks the button
   * to change the opacity of a layer
   * @param {MouseEvent} e
   * @param {LayerGroup} layerGroup
   */
  onClickOpacity(e, layerGroup) { // eslint-disable-line class-methods-use-this
    const opacity = layerGroup.layers.length && layerGroup.layers[0].opacity !== undefined ?
      layerGroup.layers[0].opacity : 1;

    // If the user is opening the tooltip to select a layer
    // then the tour doesn't make any sense anymore
    this.closeLayersTourTooltip();

    // We save the button that was used to open the tooltip
    // so we can compute its position later
    this.opacityButton = e.target;

    if (!this.state.opacityTooltipOpen) {
      this.setState({
        opacityTooltipOpen: true,
        opacityOptions: { target: this.opacityButton, dataset: layerGroup.dataset },
        layersTooltipOpen: false
      });
    }

    this.props.toggleTooltip(true, {
      follow: false,
      position: Legend.getElementPosition(this.opacityButton),
      children: SliderTooltip,
      childrenProps: {
        className: '',
        options: {
          min: 0, max: 1, step: 0.01, defaultValue: opacity
        },
        onChange: value => this.onChangeOpacity(value, layerGroup),
        onClose: () => {
          this.setState({ opacityTooltipOpen: false, opacityOptions: {} });
          this.props.toggleTooltip(false);
        }
      }
    });
  }

  /**
   * Event handler executed when the user clicks the button
   * to switch the layer for another one of the same dataset
   * @param {MouseEvent} e
   * @param {LayerGroup} layerGroup
   */
  onClickLayers(e, layerGroup) {
    this.setState({ layersTooltipOpen: true });

    // If the user is opening the tooltip to select a layer
    // then the tour doesn't make any sense anymore
    this.closeLayersTourTooltip();

    // We save the button that was used to open the tooltip
    // so we can compute its position later
    this.activeLayersButton = e.target;

    this.props.toggleTooltip(true, {
      follow: false,
      position: Legend.getElementPosition(this.activeLayersButton),
      children: LayersTooltip,
      childrenProps: {
        layerGroup,
        onChangeLayer: this.props.setLayerGroupActiveLayer,
        onClose: () => {
          this.setState({ layersTooltipOpen: false });
          this.props.toggleTooltip(false);
        }
      }
    });
  }

  /**
   * Event handler executed when the user scrolls in the legend
   */
  onScrollLegend() {
    // If the user scrolls in the legend, we close the tooltip
    // to avoid having it pointing to anything that is not the
    // layers button
    if (!this.state.hasShownLayersTourTooltip && this.state.layersTourTooltipOpen) {
      this.closeLayersTourTooltip();
    }

    // The same happens with the layers tooltip
    if (this.state.layersTooltipOpen) {
      this.props.toggleTooltip(false);
      this.setState({ layersTooltipOpen: false });
    }
  }

  onTimelineChange(currentValue = 0, datasetSpec) {
    const currentLayer = datasetSpec.layers.find((l) => {
      return new Date(l.layerConfig.dateTime).getFullYear() === parseInt(currentValue);
    });
    this.setState({ currentStepTimeline: currentValue });
    this.props.setLayerGroupActiveLayer(datasetSpec.dataset, currentLayer.id); // datasetId, layerId
  }

  /**
   * Return the action buttons associated to a
   * layer group
   * @param {LayerGroup} layerGroup
   * @returns {HTMLElement}
   */
  getItemsActions(layerGroup) {
    return (
      <div className="item-actions">
        { layerGroup.dataset !== 'c0c71e67-0088-4d69-b375-85297f79ee75'
          && layerGroup.layers.length > 1 && (
            <button
              type="button"
              className="layers"
              onClick={e => this.onClickLayers(e, layerGroup)}
              aria-label="Select other layer"
              ref={(node) => { if (node) this.layersButtons.push(node); }}
            >
              <Icon name="icon-layers" />
            </button>
          ) }
        { !this.props.interactionDisabled
          &&
          <button
            type="button"
            className={`opacity ${layerGroup.visible ? '' : '-disabled'}`}
            onClick={e => this.onClickOpacity(e, layerGroup)}
            disabled={!layerGroup.visible}
            aria-label="Change opacity"
          >
            <Icon name="icon-opacity" />
          </button>
        }
        { !this.props.interactionDisabled
          && <button
            type="button"
            className="toggle"
            onClick={() => this.onToggleLayerGroupVisibility(layerGroup)}
            aria-label="Toggle the visibility"
          >
            <Icon name={layerGroup.visible ? 'icon-hide' : 'icon-show'} />
          </button>
        }
        { !this.props.interactionDisabled
          && <button type="button" className="info" onClick={() => this.onLayerInfoModal(layerGroup)} aria-label="More information">
            <Icon name="icon-info" />
          </button>
        }
        { !this.props.readonly
          && !this.props.interactionDisabled
          && <button type="button" className="close" onClick={() => this.onRemoveLayerGroup(layerGroup)} aria-label="Remove">
            <Icon name="icon-cross" />
          </button>
        }
      </div>
    );
  }

  setPlayTimeline(isPlaying, datasetSpec, minValue, maxValue) {
    if (this.timer) clearInterval(this.timer);

    if (isPlaying) {
      this.timer = setInterval(() => {
        if (this.state.currentStepTimeline === maxValue) {
          clearInterval(this.timer);
          return this.setState({ currentStepTimeline: null, isTimelinePlaying: false });
        }
        const currentValue = (this.state.currentStepTimeline || minValue);
        const currentLayer = datasetSpec.layers.find((l) => {
          return new Date(l.layerConfig.dateTime).getFullYear() === parseInt(currentValue);
        });
        requestAnimationFrame(() => {
          this.props.setLayerGroupActiveLayer(datasetSpec.dataset, currentLayer.id);
        });
        return this.setState({ currentStepTimeline: currentValue + 1 });
      }, TIMELINE_INTERVAL_TIMER, true);
    }

    this.setState({ isTimelinePlaying: isPlaying });
  }

  /**
   * Return the list of layers
   * @returns {HTMLElement[]}
   */
  getLegendItems() {
    // We reset the buttons each time we render the legend again
    this.layersButtons = [];

    return this.props.layerGroups.map((layerGroup) => {
      const datasetSpec = Object.assign({}, layerGroup);
      const activeLayer = datasetSpec.layers.find(l => l.active);

      datasetSpec.layers = sortBy(datasetSpec.layers, (l) => l.layerConfig.dateTime);

      // Legend with timeline
      if (datasetSpec.dataset === 'c0c71e67-0088-4d69-b375-85297f79ee75' &&
        datasetSpec.layers.length) {
        const firstLayer = datasetSpec.layers[0];
        const lastLayer = datasetSpec.layers[datasetSpec.layers.length - 1];
        const minYear = new Date(firstLayer.layerConfig.dateTime).getFullYear();
        const maxYear = new Date(lastLayer.layerConfig.dateTime).getFullYear();

        const currentLayer = datasetSpec.layers.find((l) => {
          const lYear = new Date(l.layerConfig.dateTime).getFullYear();
          return lYear === (this.state.currentStepTimeline || minYear);
        });

        return (
          <li key={datasetSpec.dataset} className="c-we-legend-unit">
            <div className="legend-info">
              <header className="legend-item-header">
                <h3 className={this.props.className.color}>
                  <span className="name">{currentLayer.name}</span>
                </h3>
                {this.getItemsActions(datasetSpec)}
              </header>
              <LegendType config={currentLayer.legendConfig} className={this.props.className} />

              {/* Timeline */}
              <div className="legend-timeline">
                { this.state.isTimelinePlaying &&
                  <button
                    type="button"
                    onClick={() => { this.setPlayTimeline(false, datasetSpec, minYear, maxYear); }}
                  >
                    <Icon name="icon-stop2" className="-small" />
                  </button> }
                { !this.state.isTimelinePlaying &&
                  <button
                    type="button"
                    onClick={() => { this.setPlayTimeline(true, datasetSpec, minYear, maxYear); }}
                  >
                    <Icon name="icon-play3" className="-small" />
                  </button> }
                { !!(datasetSpec.layers.length) &&
                  <InputRange
                    minValue={minYear}
                    maxValue={maxYear}
                    value={this.state.currentStepTimeline || minYear}
                    onChange={(value) => { this.onTimelineChange(value, datasetSpec); }}
                  /> }
              </div>
            </div>
            <DragHandle />
          </li>
        );
      }

      // Legend without timeline
      return (
        <li key={layerGroup.dataset} className="c-we-legend-unit">
          <div className="legend-info">
            <header className="legend-item-header">
              <h3 className={this.props.className.color}>
                <span className="name">{activeLayer.name}</span>
              </h3>
              {this.getItemsActions(layerGroup)}
            </header>
            <LegendType config={activeLayer.legendConfig} className={this.props.className} />
          </div>
          <DragHandle />
        </li>
      );
    });
  }

  /**
   * Show the layers tour tooltip on the first layer group
   * that has several layers
   */
  showLayersTourTooltip() {
    const multiLayerLayerGroupIndex = this.props.layerGroups.findIndex(l => l.layers.length > 1);

    if (multiLayerLayerGroupIndex === -1) {
      // If there's no multi-layer layer group and the tooltip
      // is shown, we remove it
      if (this.state.layersTourTooltipOpen) this.closeLayersTourTooltip();
      return;
    }

    const button = this.layersButtons[multiLayerLayerGroupIndex];
    if (!button) return;

    this.setState({ layersTourTooltipOpen: true });

    this.props.toggleTooltip(true, {
      follow: false,
      position: Legend.getElementPosition(this.layersButtons[multiLayerLayerGroupIndex]),
      children: props => (
        <div>
          This dataset has {props.layersCount} layers
          <div style={{ textAlign: 'center', marginTop: '5px' }}>
            <Button
              properties={{ className: '-tertiary' }}
              onClick={() => this.closeLayersTourTooltip()}
            >
              Ok
            </Button>
          </div>
        </div>
      ),
      childrenProps: {
        layersCount: this.props.layerGroups.find(l => l.layers.length > 1).layers.length
      }
    });
  }

  /**
   * Hide the layers tour tooltip
   */
  closeLayersTourTooltip() {
    this.setState({
      layersTourTooltipOpen: false,
      hasShownLayersTourTooltip: true
    });
    this.props.toggleTooltip(false);
  }

  render() {
    // We reset the list of button each time we render
    // the component again
    this.layersButtons = [];

    return (
      <div className="c-we-legend-map">
        <div className={`open-legend ${this.state.open ? '-active' : ''}`} onScroll={this.onScrollLegend}>
          <button type="button" className="toggle-legend" onClick={() => this.setState({ open: false })}>
            <Icon name="icon-arrow-down" className="-small" />
          </button>
          <SortableList
            items={this.getLegendItems()}
            helperClass="c-we-legend-unit -sort"
            onSortStart={() => this.onSortStart()}
            onSortEnd={this.onSortEnd}
            axis="y"
            lockAxis="y"
            lockToContainerEdges
            lockOffset="50%"
            useDragHandle
          />
        </div>
        <div className={`close-legend ${!this.state.open ? '-active' : ''}`}>
          <h1 className="legend-title">
            Legend
            <button type="button" className="toggle-legend" onClick={() => this.setState({ open: true })}>
              <Icon name="icon-arrow-up" className="-small" />
            </button>
          </h1>
        </div>
      </div>
    );
  }
}

Legend.propTypes = {
  className: PropTypes.object,
  // List of LayerGroup items
  layerGroups: PropTypes.array,
  // Layers can't be removed or hidden
  readonly: PropTypes.bool,
  // Layers can't be removed, hidden or toggled
  // and the information button is hidden
  interactionDisabled: PropTypes.bool,
  // Whether by default the legend is expanded or not
  expanded: PropTypes.bool,
  // Tooltip open state
  tooltipOpened: PropTypes.bool,

  // Functions

  // Callback to hide/show a layer group
  toggleLayerGroupVisibility: PropTypes.func.isRequired,
  // Callback to re-order the layer groups
  setLayerGroupsOrder: PropTypes.func.isRequired,
  // Callback to remove a layer group
  removeLayerGroup: PropTypes.func,
  // Callback to change which layer of the layer group is active
  setLayerGroupActiveLayer: PropTypes.func.isRequired,
  // Callback to change the opacity of a layer group
  setLayerGroupOpacity: PropTypes.func,

  // Redux

  // Toggle the modal
  toggleModal: PropTypes.func.isRequired,
  // Toggle the tooltip
  toggleTooltip: PropTypes.func.isRequired,
  // Set the position of the tooltip
  setTooltipPosition: PropTypes.func.isRequired
};

Legend.defaultProps = {
  readonly: false,
  interactionDisabled: false,
  expanded: true
};

const mapStateToProps = ({ widgetEditorTooltip }) => ({
  tooltipOpened: widgetEditorTooltip.opened
});

const mapDispatchToProps = dispatch => ({
  toggleModal: (open, options) => dispatch(toggleModal(open, options)),
  toggleTooltip: (open, options) => dispatch(toggleTooltip(open, options)),
  setTooltipPosition: pos => dispatch(setTooltipPosition(pos))
});

export default connect(mapStateToProps, mapDispatchToProps)(Legend);
