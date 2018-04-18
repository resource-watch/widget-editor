import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';
import { BASEMAPS, LABELS } from 'components/map/constants';
import { connect } from 'react-redux';

// Redux
import { setBasemap, setLabels, setBoundaries } from 'reducers/widgetEditor';

// Components
import TetherComponent from 'react-tether';
import Icon from 'components/ui/Icon';
import Checkbox from 'components/form/Checkbox';
import RadioGroup from 'components/form/RadioGroup';

// Types
/**
 * Basemap
 * @typedef {{ id: string, label: string, value: string, options: any }} Basemap
 */
/**
 * Label
 * @typedef {{ id: string, label: string, value: string, options: any }} Basemap
 */
/**
 * Boundary
 * @typedef {{ id: string, label: string, value: string, options: any }} Basemap
 */

class BasemapControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false
    };
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onClickScreen);
  }

  @Autobind
  onClickScreen(e) {
    const el = document.querySelector('.c-we-tooltip');
    const clickOutside = el && el.contains && !el.contains(e.target);

    if (clickOutside) {
      this.toggleDropdown(false);
    }
  }

  toggleDropdown(to) {
    const active = (typeof to !== 'undefined' && to !== null) ? to : !this.state.active;

    this.setState({ active });

    requestAnimationFrame(() => {
      if (to) {
        window.addEventListener('click', this.onClickScreen);
      } else {
        window.removeEventListener('click', this.onClickScreen);
      }
    });
    this.setState({ active });
  }

  // RENDER
  render() {
    const { basemaps, labels, selectedBasemap, selectedLabels, boundaries } = this.props;
    const { active } = this.state;

    return (
      <TetherComponent
        attachment="top right"
        constraints={[{
          to: 'window'
        }]}
        targetOffset="8px 100%"
        classes={{
          element: 'c-we-tooltip -arrow-right'
        }}
      >
        {/* First child: This is what the item will be tethered to */}
        <button type="button" className="basemap-button" onClick={() => this.toggleDropdown(true)}>
          <Icon name="icon-layers" className="-small" />
        </button>

        {/* Second child: If present, this item will be tethered to the the first child */}
        {active &&
          <div>
            <RadioGroup
              options={Object.keys(basemaps).map(k => ({
                label: basemaps[k].label,
                value: basemaps[k].id
              }))}
              name="basemap"
              properties={{
                default: selectedBasemap
              }}
              onChange={this.props.setBasemap}
            />

            <div className="divisor" />

            <RadioGroup
              options={Object.keys(labels).map(k => ({
                label: labels[k].label,
                value: labels[k].id
              }))}
              name="labels"
              properties={{
                default: selectedLabels || 'none'
              }}
              onChange={this.props.setLabels}
            />

            <div className="divisor" />

            <Checkbox
              properties={{
                name: 'boundaries',
                title: 'Boundaries',
                value: 'boundaries',
                checked: boundaries
              }}
              onChange={({ checked }) => this.props.setBoundaries(checked)}
            />
          </div>
        }
      </TetherComponent>
    );
  }
}

BasemapControl.propTypes = {
  /**
   * List of available basemaps
   * @type {{ [name: string]: Basemap }} basemaps
   */
  basemaps: PropTypes.object,
  /**
   * Selected basemap
   * @type {string} selectedBasemap
   */
  selectedBasemap: PropTypes.string.isRequired,
  /**
   * List of available labels
   * @type {{ [name: string]: Label }} labels
   */
  labels: PropTypes.object,
  /**
   * Selected label
   * @type {string} selectedLabels
   */
  // NOTE: can't use isRequired here because of this:
  // https://github.com/facebook/react/issues/3163
  selectedLabels: PropTypes.string, // eslint-disable-line react/require-default-props
  /**
   * Whether the boundaries ar visible
   * @type {boolean} boundariesVisible
   */
  boundaries: PropTypes.bool.isRequired,
  /**
   * Set the current basemap
   * @type {(basemap: string) => void} setBasemap
   */
  setBasemap: PropTypes.func.isRequired,
  /**
   * Set the current labels
   * @type {(labels: string) => void} setLabels
   */
  setLabels: PropTypes.func.isRequired,
  /**
   * Set the visibility of the boundaries
   * @type {(boundaries: boolean) => void} setBoundaries
   */
  setBoundaries: PropTypes.func.isRequired
};

BasemapControl.defaultProps = {
  basemaps: BASEMAPS,
  labels: LABELS
};

const mapStateToProps = ({ widgetEditor }) => ({
  selectedBasemap: widgetEditor.basemapLayers.basemap,
  selectedLabels: widgetEditor.basemapLayers.labels,
  boundaries: widgetEditor.basemapLayers.boundaries
});

const mapDispatchToProps = dispatch => ({
  setBasemap: basemap => dispatch(setBasemap(basemap)),
  setLabels: labels => dispatch(setLabels(labels === 'none' ? null : labels)),
  setBoundaries: boundaries => dispatch(setBoundaries(boundaries))
});

export default connect(mapStateToProps, mapDispatchToProps)(BasemapControl);
