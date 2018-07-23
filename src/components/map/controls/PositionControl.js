import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';
import TetherComponent from 'react-tether';
import { connect } from 'react-redux';

// Redux
import { setBounds } from 'reducers/widgetEditor';

// Components
import Icon from 'components/ui/Icon';

const COPY_MSG = {
  default: 'Copy all',
  success: 'Copied!',
  error: 'Error!'
};

const PASTE_MSG = {
  default: 'Paste',
  success: 'Pasted!',
  error: 'Error!'
};

const CLIPBOARD_KEY = 'widget-editor-clipboard';

class PositionControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      copyStatus: COPY_MSG.default,
      pasteStatus: PASTE_MSG.default,
      canPaste: false
    };
  }

  componentWillMount() {
    this.checkStorage();
  }

  componentDidMount() {
    window.addEventListener('storage', this.checkStorage);
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.checkStorage);
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
   * Event handler executed when the user clicks the copy button
   */
  @Autobind
  onClickCopy() {
    if (this.copyStatusTimeout) {
      clearTimeout(this.copyStatusTimeout);
      this.copyStatusTimeout = null;
    }

    try {
      localStorage.setItem(CLIPBOARD_KEY, JSON.stringify({
        bounds: this.props.bounds
      }));
      this.setState({ copyStatus: COPY_MSG.success, canPaste: true });
    } catch (e) {
      this.setState({ copyStatus: COPY_MSG.error });
    }

    this.copyStatusTimeout = setTimeout(
      () => this.setState({ copyStatus: COPY_MSG.default }),
      3000
    );
  }

  /**
   * Event handler executed when the user clicks the paste button
   */
  @Autobind
  onClickPaste() {
    if (this.pasteStatusTimeout) {
      clearTimeout(this.pasteStatusTimeout);
      this.pasteStatusTimeout = null;
    }

    try {
      const bounds = JSON.parse(localStorage.getItem(CLIPBOARD_KEY)).bounds;
      this.onChangeBounds(bounds);
      this.setState({ pasteStatus: PASTE_MSG.success });
    } catch (e) {
      this.setState({ pasteStatus: PASTE_MSG.error });
    }

    this.pasteStatusTimeout = setTimeout(
      () => this.setState({ pasteStatus: PASTE_MSG.default }),
      3000
    );
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
          this.checkStorage();
        } else {
          window.removeEventListener('click', this.onClickScreen);
        }
      }
    );
  }

  /**
   * Check the state of the clipboard in the localStorage and
   * update the "canPaste" state property accordingly
   */
  @Autobind
  checkStorage() {
    try {
      const clipboard = localStorage.getItem(CLIPBOARD_KEY);

      if (clipboard) {
        const bounds = JSON.parse(clipboard).bounds;
        this.setState({ canPaste: !!bounds });
      } else {
        this.setState({ canPaste: false });
      }
    } catch (e) {
      this.setState({ canPaste: false });
    }
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
            <div className="c-we-buttons">
              <button
                type="button"
                className="c-we-button -tertiary -compressed"
                onClick={this.onClickCopy}
              >
                {this.state.copyStatus}
              </button>
              { this.state.canPaste && (
                <button
                  type="button"
                  className="c-we-button -tertiary -compressed"
                  onClick={this.onClickPaste}
                >
                  {this.state.pasteStatus}
                </button>
              )}
            </div>
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
