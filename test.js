import React from 'react';
import ReactDOM from 'react-dom';
import ReduxThunk from 'redux-thunk';
import { Provider, connect } from 'react-redux'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import WidgetEditor, { reducers, setConfig, Tooltip, Modal, Icons } from 'dist/bundle';
import 'dist/styles.css';

const root = document.createElement('div');
document.body.appendChild(root)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(applyMiddleware(ReduxThunk));
let store = createStore(combineReducers(reducers), enhancer);

// We set the config of the library
setConfig({
  url: 'https://api.resourcewatch.org/v1',
  env: 'production,preproduction',
  applications: 'prep',
  authUrl: 'https://api.resourcewatch.org/auth'
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      datasetId: '0b9f0100-ce5b-430f-ad8f-3363efa05481',
      widgetId: undefined
    };
  }
  componentWillMount() {
    // We inject basic styles so the test page
    // renders correctly
    this.injectStyles()
  }

  injectStyles() {
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
            <br/>
            <label htmlFor="widget">Widget ID (optional):</label>
            <input
              type="text"
              placeholder="Widget to restore"
              id="widget"
              value={this.state.widgetId}
              onChange={({ target }) => this.setState({ widgetId: target.value })}
            />
          </p>
        </div>
        <Icons />
        <Tooltip />
        <Modal />
        <WidgetEditor
          datasetId={this.state.datasetId}
          widgetId={this.state.widgetId}
          showSaveButton={false}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ modal }) => ({});
const mapDispatchToProps = dispatch => ({});

const Container = connect(mapStateToProps, mapDispatchToProps)(App);

ReactDOM.render(
  <Provider store={store}>
    <Container />
  </Provider>,
  root
);
