import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import ReduxThunk from 'redux-thunk';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import WidgetEditor, { reducers, setConfig, getConfig, Tooltip, Modal, Icons, SaveWidgetModal, modalActions } from 'dist/bundle';
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
      currentWidget: undefined,

      app: getConfig().applications,
      unmigratedWidgets: [],
      manualWidgets: [],
      erroredWidgets: [],
      errors: [],
      migrated: 0,
      started: false,
      finished: false
    };
  }

  componentWillMount() {
    // We inject basic styles so the test page
    // renders correctly
    App.injectStyles();
  }

  componentDidMount() {
    this.getWidgetsList(this.state.app)
      .then(widgets => this.getUnmigratedWidgets(widgets))
      .then(([unmigratedWidgets, manualWidgets]) => new Promise(resolve => this.setState({ unmigratedWidgets, manualWidgets }, resolve)));
  }

  async onSave() {
    if (this.getWidgetConfig) {
      this.props.toggleModal(true, {
        children: SaveWidgetModal,
        childrenProps: {
          datasetId: this.state.datasetId,
          getWidgetConfig: this.getWidgetConfig,
          onClickCheckWidgets: () => alert('Check my widgets'),
          onChangeWidgetTitle: title => this.setState({ widgetTitle: title })
        }
      });
    }
  }

  getWidgetsList(app) { // eslint-disable-line class-methods-use-this
    return fetch(`https://api.resourcewatch.org/v1/widget/?page[size]=9999999&app=${app}&env=preproduction,production`)
      .then(res => res.json())
      .then(({ data: widgets }) => widgets)
      .catch(() => {
        this.setState({ errors: [...this.state.errors, `Unable to get the list of widgets for ${app}`] });
        throw new Error();
      });
  }

  getUnmigratedWidgets(widgetsList) { // eslint-disable-line class-methods-use-this
    const unmigrated = [];
    const manual = [];
    widgetsList.forEach((widget) => {
      const widgetConfig = widget.attributes.widgetConfig;
      if (!widgetConfig) return false;

      const type = widgetConfig.type;
      if (type === 'map' || type === 'embed') {
        return false;
      }

      const name = widget.attributes.name;
      if (name.indexOf('[Vega 3]') !== -1) return false;

      const paramsConfig = widgetConfig.paramsConfig;
      if (!paramsConfig) {
        manual.push(widget);
        return false;
      }

      unmigrated.push(widget);
    });

    return [unmigrated, manual];
  }

  migrateWidgets(i = 0) { // eslint-disable-line class-methods-use-this
    const widget = this.state.unmigratedWidgets[i];

    return new Promise((resolve) => {
      if (i === 0) {
        this.setState({ started: true }, resolve);
      } else {
        resolve();
      }
    })
      .then(() => new Promise((resolve, reject) => {
        this.promise = {
          reject,
          resolve
        };
        this.setState({ currentWidget: widget });
      }))
      .then(widgetConfig => console.log(widgetConfig))
      .then(() => new Promise((resolve) => {
        widget.migrated = true;
        this.setState({ migrated: this.state.migrated + 1 }, resolve);
      }))
      .catch(() => new Promise((resolve) => {
        this.setState({
          errors: [...this.state.errors, `Unable to migrate ${widget.id}`],
          erroredWidgets: [...this.state.erroredWidgets, widget]
        }, resolve);
      }))
      .then(() => (this.state.unmigratedWidgets.length - 1 >= i + 1) && this.migrateWidgets(i + 1))
      .then(() => new Promise((resolve) => {
        if (i === 0) {
          this.setState({ finished: true }, resolve);
        } else {
          resolve();
        }
      }))
      .catch(() => new Promise((_, reject) => {
        if (i === 0) {
          this.setState({ errors: [...this.state.errors, 'Migration aborted'] }, reject);
        } else {
          reject();
        }
      }));
  }

  render() {
    return (
      <div>
        <h1>Migration</h1>
        <Icons />
        <Tooltip />
        <Modal />
        <div style={{ border: '1px solid black', margin: '40px 0', padding: '0 10px' }}>
          <ul>
            <li>Retrieving the list of widgets for {this.state.app}...</li>
            { !!this.state.manualWidgets.length && <li>Widgets to manually migrate: <strong>{this.state.manualWidgets.length}</strong></li> }
            { !!this.state.unmigratedWidgets.length && <li>Widgets to migrate: <strong>{this.state.unmigratedWidgets.length}</strong></li> }
            { !!this.state.manualWidgets.length && !!this.state.unmigratedWidgets.length && this.state.started && <li>Migrating: <strong>{this.state.migrated} / {this.state.unmigratedWidgets.length}</strong></li> }
            { !!this.state.manualWidgets.length && !!this.state.unmigratedWidgets.length && !this.state.started && <li><button type="button" onClick={() => this.migrateWidgets()}>Start migration</button></li>}
            { !!this.state.errors.length && this.state.errors.map(e => <li key={e} style={{ color: 'red' }}>{e}</li>)}
            { this.state.finished && <li>Migration done</li> }
          </ul>
        </div>
        <div style={{ border: '1px solid black', margin: '40px 0', padding: '20px 10px' }}>
          { !!this.state.manualWidgets.length && (
            <div>
              <label htmlFor="manual">Widgets to manually migrate</label>
              <textarea id="manual" style={{ display: 'block', margin: '5px 0 20px', width: '100%', height: '250px' }} value={this.state.manualWidgets.map(w => w.id).join('\n')} readOnly />
            </div>
          )}
          { !!this.state.unmigratedWidgets.length && (
            <div>
              <label htmlFor="unmigrated">Widgets to migrate</label>
              <textarea id="unmigrated" style={{ display: 'block', margin: '5px 0 20px', width: '100%', height: '250px' }} value={this.state.unmigratedWidgets.map(w => `${w.id}${w.migrated ? ' - MIGRATED' : ''}`).join('\n')} readOnly />
            </div>
          )}
          { !!this.state.erroredWidgets.length && (
            <div>
              <label htmlFor="unmigrated" style={{ color: 'red' }}>Widgets with error</label>
              <textarea id="unmigrated" style={{ display: 'block', margin: '5px 0 20px', width: '100%', height: '250px' }} value={this.state.erroredWidgets.map(w => w.id).join('\n')} readOnly />
            </div>
          )}
        </div>
        { this.state.currentWidget && (
          <WidgetEditor
            datasetId={this.state.currentWidget.attributes.dataset}
            widgetId={this.state.currentWidget.id}
            saveButtonMode="always"
            embedButtonMode="never"
            titleMode="always"
            onSave={() => this.onSave()}
            provideWidgetConfig={(func) => { this.getWidgetConfig = func; }}
            onMigrate={widgetConfig => (widgetConfig === null ? this.promise.reject() : this.promise.resolve(widgetConfig))}
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
