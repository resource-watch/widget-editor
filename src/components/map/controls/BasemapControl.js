import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';
import { BASEMAPS } from 'components/map/constants';

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

  @Autobind
  onChangeBasemap(basemap) {
    if (this.props.onChangeBasemap) {
      const { basemaps } = this.props;
      this.props.onChangeBasemap(basemaps[basemap]);
    }
  }

  @Autobind
  onToggleLabels(label) {
    if (this.props.onToggleLabels) {
      this.props.onToggleLabels(label.checked);
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
    const { basemap, basemaps, labels } = this.props;
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
              options={Object.keys(basemaps).map((k) => {
                const bs = basemaps[k];
                return {
                  label: bs.label,
                  value: bs.id
                };
              })}
              name="basemap"
              properties={{
                default: basemap.id
              }}
              onChange={this.onChangeBasemap}
            />
            <div className="divisor" />
            <Checkbox
              properties={{
                name: 'label',
                title: 'Show labels',
                value: 'label',
                checked: labels
              }}
              onChange={this.onToggleLabels}
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
   * @type {{ [name: string]: Basemap} basemaps
   */
  basemaps: PropTypes.object,
  /**
   * Selected basemap
   * @type {Basemap} basemap
   */
  basemap: PropTypes.object,
  /**
   * Whether the labels are show or not
   * @type {boolean} labels
   */
  labels: PropTypes.bool,
  /**
   * Callback executed when the basemap is changed
   * @type {(basemap: Basemap) => void} onChangeBasemap
   */
  onChangeBasemap: PropTypes.func,
  /**
   * Callback executed when the labels are toggled
   * @type {(visibleLabels: boolean) => void} onChangeBasemap
   */
  onToggleLabels: PropTypes.func
};

BasemapControl.defaultProps = {
  basemap: BASEMAPS.dark,
  basemaps: BASEMAPS,
  labels: false
};

export default BasemapControl;
