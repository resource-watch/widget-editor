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


  @Autobind
  async onSubmit(event) {
    event.preventDefault();

    this.setState({
      loading: true,
      error: false
    });

    const { description } = this.state;
    const { widgetEditor, datasetId, getWidgetConfig } = this.props;

    try {
      const widgetConfig = await getWidgetConfig();

      const widgetObj = Object.assign(
        {},
        {
          name: widgetEditor.title || null,
          description
        },
        { widgetConfig }
      );

      WidgetService.saveUserWidget(widgetObj, datasetId, getConfig().userToken)
        .then((response) => {
          if (response.errors) throw new Error(response.errors[0].detail);
        })
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
      <div className="c-save-widget-modal">
        {!saved &&
        <h2>Save widget</h2>
        }
        {saved &&
        <h2>Widget saved!</h2>
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
            <fieldset className="c-field-container">
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.title = c; }}
                onChange={value => this.props.setTitle(value)}
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
                  Check my widgets
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
   * Callback executed when the user clicks the
   * button to check their widgets
   */
  onClickCheckWidgets: PropTypes.func,

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
