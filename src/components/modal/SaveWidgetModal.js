import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';

// Redux
import { connect } from 'react-redux';
import { setTitle } from 'reducers/widgetEditor';
import { toggleModal } from 'reducers/modal';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Button from 'components/ui/Button';
import Spinner from 'components/ui/Spinner';
import Icon from 'components/ui/Icon';

// Services
import WidgetService from 'services/WidgetService';

// Helpers
import { getConfig } from 'helpers/ConfigHelper';

const FORM_ELEMENTS = {
  elements: {
  },
  validate() {
    const elements = this.elements;
    Object.keys(elements).forEach((k) => {
      elements[k].validate();
    });
  },
  isValid() {
    const elements = this.elements;
    const valid = Object.keys(elements)
      .map(k => elements[k].isValid())
      .filter(v => v !== null)
      .every(element => element);

    return valid;
  }
};


class SaveWidgetModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      loading: false,
      saved: false,
      error: false,
      description: null // Description of the widget
    };
  }

  /**
   * Event handler executed when the user changes the
   * title of the widget
   * @param {string} event
   */
  @Autobind
  onChangeTitle(title) {
    this.props.setTitle(title);
    if (this.props.onChangeWidgetTitle) {
      this.props.onChangeWidgetTitle(title);
    }
  }

  @Autobind
  async onSubmit(event) {
    event.preventDefault();

    this.setState({
      loading: true,
      error: false
    });

    const { description } = this.state;
    const { widgetEditor, datasetId, getWidgetConfig, getLayer } = this.props;

    try {
      const widgetConfig = await getWidgetConfig();
      let layer = null;

      if (getLayer) {
        try {
          layer = await getLayer();
        } catch (err) {
          // eslint-disable-line no-empty
          // If the widget isn't a map, getLayer will
          // reject, so we just ignore it
        }
      }

      const widgetObj = Object.assign(
        {},
        {
          name: widgetEditor.title || null,
          description
        },
        { widgetConfig }
      );

      let metadataObj = null;
      if (widgetEditor.caption) {
        metadataObj = {
          info: {
            caption: widgetEditor.caption
          }
        };
      }

      WidgetService.saveUserWidget(datasetId, getConfig().userToken, widgetObj, metadataObj, layer)
        .then(() => this.setState({ saved: true, error: false }))
        .catch((err) => {
          this.setState({
            saved: false,
            error: true,
            errorMessage: err.message
          });
        })
        .then(() => this.setState({ loading: false }));
    } catch (err) {
      console.error(err);

      this.setState({
        error: true,
        errorMessage: 'Unable to generate the configuration of the chart'
      });
    }
  }

  /**
   * Event handler executed when the user clicks the
   * "Check my widgets" button
   */
  @Autobind
  onClickCheckWidgets() {
    this.props.toggleModal(false);
    this.props.onClickCheckWidgets();
  }

  render() {
    const { submitting, loading, saved, error, errorMessage } = this.state;
    const { widgetEditor } = this.props;

    return (
      <div className="c-we-save-widget-modal">
        {!saved &&
        <h2>Save visualization</h2>
        }
        {saved &&
        <h2>Visualization saved!</h2>
        }
        <Spinner
          isLoading={loading}
          className="-light -relative"
        />
        {error &&
        <div className="error-container">
          <div>Error</div>
          {errorMessage}
        </div>
        }
        {!saved && (
          <form className="form-container" onSubmit={this.onSubmit}>
            <fieldset className="c-we-field-container">
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.title = c; }}
                onChange={this.onChangeTitle}
                validations={['required']}
                properties={{
                  title: 'title',
                  label: 'Title',
                  type: 'text',
                  required: true,
                  default: widgetEditor.title,
                  value: widgetEditor.title,
                  placeholder: 'Widget title'
                }}
              >
                {Input}
              </Field>
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.description = c; }}
                onChange={description => this.setState({ description })}
                properties={{
                  title: 'description',
                  label: 'Description',
                  type: 'text',
                  placeholder: 'Widget description'
                }}
              >
                {Input}
              </Field>
            </fieldset>
            <div className="buttons-container">
              <Button
                properties={{
                  type: 'submit',
                  disabled: submitting,
                  className: '-secondary'
                }}
              >
                Save
              </Button>
              <Button
                properties={{
                  type: 'button',
                  disabled: submitting,
                  className: '-primary'
                }}
                onClick={() => this.props.toggleModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
        {saved && (
          <div>
            <Icon name="widget-saved" />
            <div className="buttons-widget-saved">
              <Button
                properties={{ className: '-primary', type: 'button' }}
                onClick={() => this.props.toggleModal(false)}
              >
                OK
              </Button>
              { this.props.onClickCheckWidgets &&
                <Button
                  properties={{ className: '-secondary', type: 'button' }}
                  onClick={this.onClickCheckWidgets}
                >
                  Check my visualizations
                </Button>
              }
            </div>
          </div>
        )}
      </div>
    );
  }
}

SaveWidgetModal.propTypes = {
  /**
   * Dataset ID
   */
  datasetId: PropTypes.string.isRequired,
  /**
   * Async callback to get the widget config
   */
  getWidgetConfig: PropTypes.func.isRequired,
  /**
   * Async callback to get the layer the user created, if any
   */
  getLayer: PropTypes.func,
  /**
   * Callback executed when the user clicks the
   * button to check their widgets
   */
  onClickCheckWidgets: PropTypes.func,
  /**
   * Callback executed when the value of the title is updated
   * The callback gets passed the new value
   */
  onChangeWidgetTitle: PropTypes.func,

  // Store
  widgetEditor: PropTypes.object.isRequired,
  toggleModal: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  widgetEditor: state.widgetEditor
});

const mapDispatchToProps = dispatch => ({
  toggleModal: open => dispatch(toggleModal(open)),
  setTitle: title => dispatch(setTitle(title))
});


export default connect(mapStateToProps, mapDispatchToProps)(SaveWidgetModal);
