import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import ReduxThunk from 'redux-thunk';
import 'leaflet';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import WidgetEditor, { reducers, setConfig, Tooltip, Modal, Icons, SaveWidgetModal, EmbedTableModal, modalActions, VegaChart, WidgetService, getVegaTheme } from 'dist/bundle';
import 'leaflet/dist/leaflet.css';
import 'dist/styles.css';

const root = document.createElement('div');
document.body.appendChild(root);

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(applyMiddleware(ReduxThunk));
const store = createStore(combineReducers(reducers), enhancer);

// We set the config of the library
setConfig({
  url: 'https://api.resourcewatch.org/v1',
  env: 'production,preproduction',
  applications: 'rw',
  authUrl: 'https://api.resourcewatch.org/auth',
  assetsPath: '/images/',
  userToken: undefined
});

class App extends React.Component {
  static injectStyles() {
    const styles = `
      *,
      *:before,
      *:after {
        box-sizing: border-box;
      }

      body {
        font-family: sans-serif;
      }
    `;

    const node = document.createElement('style');
    node.innerHTML = styles;
    document.body.appendChild(node);
  }

  constructor(props) {
    super(props);
    this.state = {
      datasetId: '5159fe6f-defd-44d2-9e7d-15665e14deeb',
      widgetId: undefined,
      // Widget with custom theme and new chart:
      // widgetId: '7c60887a-aee9-4925-83fd-5c7673521443',
      previewWidgetId: undefined,
      previewConfig: undefined,
      widgetTitle: '',
      widgetCaption: '',
      defaultWidgetTheme: JSON.stringify(getVegaTheme(), null, 2),
      _defaultTheme: getVegaTheme(), // Internal
      widgetTheme: '',
      _theme: undefined, // Internal
      previewWidgetTheme: JSON.stringify(getVegaTheme(true), null, 2),
      _previewWidgetTheme: getVegaTheme(true) // Internal
    };

    this.onSave = this.onSave.bind(this);
    this.onEmbed = this.onEmbed.bind(this);
    this.onChangeWidgetTitle = this.onChangeWidgetTitle.bind(this);
    this.onChangeWidgetCaption = this.onChangeWidgetCaption.bind(this);
    this.onProvideWidgetConfig = this.onProvideWidgetConfig.bind(this);
    this.onProvideLayer = this.onProvideLayer.bind(this);
    this.onChangeDefaultTheme = this.onChangeDefaultTheme.bind(this);
    this.onChangeTheme = this.onChangeTheme.bind(this);
    this.onChangePreviewWidgetTheme = this.onChangePreviewWidgetTheme.bind(this);
  }

  componentWillMount() {
    // We inject basic styles so the test page
    // renders correctly
    App.injectStyles();
  }

  async onSave() {
    if (this.getWidgetConfig && this.getLayer) {
      this.props.toggleModal(true, {
        children: SaveWidgetModal,
        childrenProps: {
          datasetId: this.state.datasetId,
          getWidgetConfig: this.getWidgetConfig,
          getLayer: this.getLayer,
          onClickCheckWidgets: () => alert('Check my widgets'),
          onChangeWidgetTitle: title => this.setState({ widgetTitle: title })
        }
      });
    }
  }

  async onEmbed() {
    const { protocol, hostname, port } = location;
    const baseUrl = `${protocol}//${hostname}${port !== '' ? `:${port}` : port}`;
    this.props.toggleModal(true, {
      children: EmbedTableModal,
      childrenProps: { baseUrl }
    });
  }

  onChangePreviewWidgetId(previewWidgetId) {
    this.setState({ previewWidgetId });

    new WidgetService(previewWidgetId)
      .fetchData()
      .then(data => this.setState({ previewConfig: data.attributes.widgetConfig }));
  }

  onChangeWidgetTitle(title) {
    this.setState({ widgetTitle: title });
  }

  onChangeWidgetCaption(caption) {
    this.setState({ widgetCaption: caption });
  }

  onProvideWidgetConfig(func) {
    this.getWidgetConfig = func;
  }

  onProvideLayer(func) {
    this.getLayer = func;
  }

  onChangeDefaultTheme({ target }) {
    const theme = target.value;

    let unserializedTheme;
    try {
      unserializedTheme = JSON.parse(theme);
    } catch (err) {
      unserializedTheme = getVegaTheme();
    }

    this.setState({
      defaultWidgetTheme: theme,
      _defaultTheme: unserializedTheme
    });
  }

  onChangeTheme({ target }) {
    const theme = target.value;

    let unserializedTheme;
    try {
      unserializedTheme = JSON.parse(theme);
    } catch (err) {
      unserializedTheme = getVegaTheme();
    }

    this.setState({
      widgetTheme: theme,
      _theme: unserializedTheme
    });
  }

  onChangePreviewWidgetTheme({ target }) {
    const theme = target.value;

    let unserializedTheme;
    try {
      unserializedTheme = JSON.parse(theme);
    } catch (err) {
      unserializedTheme = getVegaTheme(true);
    }

    this.setState({
      previewWidgetTheme: theme,
      _previewWidgetTheme: unserializedTheme
    });
  }

  render() {
    return (
      <div>
        <h1>Test WidgetEditor</h1>
        <div style={{ border: '1px solid black', margin: '20px 0 40px', padding: '0 10px' }}>
          <p>
            Change here the params of the editor:
          </p>
          <p>
            <label htmlFor="dataset">Dataset ID:</label>
            <input
              type="text"
              id="dataset"
              value={this.state.datasetId}
              onChange={({ target }) => this.setState({ datasetId: target.value })}
            />
            <br />
            <label htmlFor="widget">Widget ID (optional):</label>
            <input
              type="text"
              placeholder="Widget to restore"
              id="widget"
              value={this.state.widgetId}
              onChange={({ target }) => this.setState({ widgetId: target.value })}
            />
            <br />
            <label htmlFor="title">Widget title (optional):</label>
            <input
              type="text"
              placeholder="Title of the widget"
              id="title"
              value={this.state.widgetTitle}
              onChange={({ target }) => this.setState({ widgetTitle: target.value })}
            />
            <br />
            <label htmlFor="caption">Widget caption (optional):</label>
            <input
              type="text"
              placeholder="Caption of the widget"
              id="caption"
              value={this.state.widgetCaption}
              onChange={({ target }) => this.setState({ widgetCaption: target.value })}
            />
            <br />
            <label htmlFor="default-theme">Default theme (optional):</label>
            <textarea
              placeholder="Default theme of the widget"
              id="default-theme"
              value={this.state.defaultWidgetTheme}
              onChange={this.onChangeDefaultTheme}
            />
            <br />
            <label htmlFor="theme">Theme (optional):</label>
            <textarea
              placeholder="Theme of the widget"
              id="theme"
              value={this.state.widgetTheme}
              onChange={this.onChangeTheme}
            />
          </p>
        </div>
        <Icons />
        <Tooltip />
        <Modal />
        <WidgetEditor
          datasetId={this.state.datasetId}
          widgetId={this.state.widgetId}
          widgetTitle={this.state.widgetTitle}
          widgetCaption={this.state.widgetCaption}
          saveButtonMode="always"
          embedButtonMode="always"
          titleMode="always"
          // eslint-disable-next-line no-underscore-dangle
          defaultTheme={this.state._defaultTheme}
          theme={this.state._theme}
          useLayerEditor
          allowBoundsCopyPaste
          onSave={this.onSave}
          onEmbed={this.onEmbed}
          onChangeWidgetTitle={this.onChangeWidgetTitle}
          onChangeWidgetCaption={this.onChangeWidgetCaption}
          onChangeTheme={theme => this.setState({ widgetTheme: JSON.stringify(theme, null, 2), _theme: theme })}
          provideWidgetConfig={this.onProvideWidgetConfig}
          provideLayer={this.onProvideLayer}
        />
        <div style={{ border: '1px solid black', margin: '40px 0', padding: '0 10px' }}>
          <p>
            Change here the params of the VegaChart component:
          </p>
          <p>
            <label htmlFor="preview_widget">Widget ID:</label>
            <input
              type="text"
              placeholder="Widget to preview"
              id="preview_widget"
              value={this.state.previewWidgetId}
              onChange={({ target }) => this.onChangePreviewWidgetId(target.value)}
            />
            <br />
            <label htmlFor="preview_widget_theme">Theme (optional):</label>
            <textarea
              placeholder="Theme of the widget"
              id="preview_widget_theme"
              value={this.state.previewWidgetTheme}
              onChange={this.onChangePreviewWidgetTheme}
            />
          </p>
        </div>
        {this.state.previewWidgetId && this.state.previewConfig && (
          <VegaChart
            width={250}
            height={180}
            data={this.state.previewConfig}
            // eslint-disable-next-line no-underscore-dangle
            theme={this.state._previewWidgetTheme}
            reloadOnResize
          />
        )}
      </div>
    );
  }
}

App.propTypes = {
  toggleModal: PropTypes.func
};

const mapStateToProps = () => ({});
const mapDispatchToProps = dispatch => ({
  toggleModal: (...params) => dispatch(modalActions.toggleModal(...params))
});

const Container = connect(mapStateToProps, mapDispatchToProps)(App);

ReactDOM.render(
  <Provider store={store}>
    <Container />
  </Provider>,
  root
);
