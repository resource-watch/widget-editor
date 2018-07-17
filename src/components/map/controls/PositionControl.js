import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';
import TetherComponent from 'react-tether';
import { connect } from 'react-redux';

// Redux
import { setBounds } from 'reducers/widgetEditor';

// Components
import Icon from 'components/ui/Icon';

class PositionControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
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

  /**
   * Event handler executed when the user clicks the button to
   * open the dropdown
   * @param {MouseEvent} e Event
   */
  @Autobind
  onClickButton(e) {
    // Prevent onClickScreen from being automatically executed
    e.stopPropagation();

    this.toggleDropdown(true);
  }

  /**
   * Event handler executed when the user changes the lat
   * @param {number[][]} bounds Bounds
   */
  @Autobind
  onChangeBounds(bounds) {
    this.props.setBounds(bounds);
  }

  /**
   * Toggle the visibility of the dropdown
   * @param {boolean} visible Whether the dropdown should be visible
   */
  toggleDropdown(visible = !this.state.active) {
    this.setState(
      { visible },
      () => {
        if (visible) {
          window.addEventListener('click', this.onClickScreen);
        } else {
          window.removeEventListener('click', this.onClickScreen);
        }
      }
    );
  }

  render() {
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
        <button type="button" className="position-button" onClick={this.onClickButton}>
          <Icon name="icon-position" className="-small" />
        </button>

        {/* Second child: If present, this item will be tethered to the the first child */}
        {this.state.visible && (
          <div className="c-we-position-control">
            <h3>Bounds</h3>
            <label htmlFor="sw-lat-input" title="South West latitude">
              SW lat:
              <input
                type="text"
                id="sw-lat-input"
                value={this.props.bounds && this.props.bounds[0][0]}
                onChange={e => this.onChangeBounds([
                  [
                    Number.isNaN(+e.target.value) ? this.props.bounds[0][0] : +e.target.value,
                    this.props.bounds[0][1]
                  ],
                  [...this.props.bounds[1]]
                ])}
              />
            </label>
            <label htmlFor="sw-lng-input" title="South West longitude">
              SW lng:
              <input
                type="text"
                id="sw-lng-input"
                value={this.props.bounds && this.props.bounds[0][1]}
                onChange={e => this.onChangeBounds([
                  [
                    this.props.bounds[0][0],
                    Number.isNaN(+e.target.value) ? this.props.bounds[0][1] : +e.target.value
                  ],
                  [...this.props.bounds[1]]
                ])}
              />
            </label>
            <label htmlFor="ne-lat-input" title="North East latitude">
              NE lat:
              <input
                type="text"
                id="ne-lat-input"
                value={this.props.bounds && this.props.bounds[1][0]}
                onChange={e => this.onChangeBounds([
                  [...this.props.bounds[0]],
                  [
                    Number.isNaN(+e.target.value) ? this.props.bounds[1][0] : +e.target.value,
                    this.props.bounds[1][1]
                  ]
                ])}
              />
            </label>
            <label htmlFor="ne-lng-input" title="North East longitude">
              NE lng:
              <input
                type="text"
                id="ne-lng-input"
                value={this.props.bounds && this.props.bounds[1][1]}
                onChange={e => this.onChangeBounds([
                  [...this.props.bounds[0]],
                  [
                    this.props.bounds[1][0],
                    Number.isNaN(+e.target.value) ? this.props.bounds[1][1] : +e.target.value
                  ]
                ])}
              />
            </label>
          </div>
        )}
      </TetherComponent>
    );
  }
}

PositionControl.propTypes = {
  bounds: PropTypes.array,
  setBounds: PropTypes.func.isRequired
};

const mapStateToProps = ({ widgetEditor }) => ({
  bounds: widgetEditor.bounds
});

const mapDispatchToProps = dispatch => ({
  setBounds: bounds => dispatch(setBounds(bounds))
});

export default connect(mapStateToProps, mapDispatchToProps)(PositionControl);
