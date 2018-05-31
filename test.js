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
  userToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4NzhjMTNiNWIyZWE3N2MxMWUxYmMxZCIsInJvbGUiOiJBRE1JTiIsInByb3ZpZGVyIjoibG9jYWwiLCJlbWFpbCI6ImNsZW1lbnQucHJvZGhvbW1lQHZpenp1YWxpdHkuY29tIiwiZXh0cmFVc2VyRGF0YSI6eyJhcHBzIjpbInJ3IiwiZ2Z3IiwiZ2Z3LWNsaW1hdGUiLCJwcmVwIiwiYXF1ZWR1Y3QiLCJmb3Jlc3QtYXRsYXMiLCJkYXRhNHNkZ3MiXX0sImNyZWF0ZWRBdCI6MTUxNzkzODc4MzQ0MCwiaWF0IjoxNTE3OTM4NzgzfQ._lU1C1dwTv6qFFZsuW6C8t-yc9fvdK7uQOt4V88k2HM'
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
      datasetId: 'a86d906d-9862-4783-9e30-cdb68cd808b8',
      // datasetId: '5159fe6f-defd-44d2-9e7d-15665e14deeb',
      widgetId: 'd6e00a49-1e0b-4c7e-8f01-6f7fb65dcacc',
      previewWidgetId: undefined,
      previewConfig: undefined,
      widgetTitle: '',
      widgetCaption: '',
      widgetTheme: JSON.stringify(getVegaTheme(), null, 2),
      _theme: getVegaTheme() // Internal
    };

    this.onSave = this.onSave.bind(this);
    this.onEmbed = this.onEmbed.bind(this);
    this.onChangeWidgetTitle = this.onChangeWidgetTitle.bind(this);
    this.onChangeWidgetCaption = this.onChangeWidgetCaption.bind(this);
    this.onProvideWidgetConfig = this.onProvideWidgetConfig.bind(this);
    this.onProvideLayer = this.onProvideLayer.bind(this);
    this.onChangeTheme = this.onChangeTheme.bind(this);
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
          theme={this.state._theme}
          useLayerEditor
          onSave={this.onSave}
          onEmbed={this.onEmbed}
          onChangeWidgetTitle={this.onChangeWidgetTitle}
          onChangeWidgetCaption={this.onChangeWidgetCaption}
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
          </p>
        </div>
        { this.state.previewWidgetId && this.state.previewConfig && (
          <VegaChart
            width={250}
            height={180}
            data={this.state.previewConfig}
            theme={getVegaTheme(true)}
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
