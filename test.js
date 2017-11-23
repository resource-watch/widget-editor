import React from 'react';
import ReactDOM from 'react-dom';
import ReduxThunk from 'redux-thunk';
import { Provider, connect } from 'react-redux'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import WidgetEditor, { reducers, setConfig } from 'dist/bundle';
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
  applications: 'prep'
});

const App = props => (
  <div>
    <h1>Test WidgetEditor</h1>
    <WidgetEditor
      mode="dataset"
      showSaveButton={false}
      showLimitContainer={true}
      showOrderByContainer={true}
      dataset="0b9f0100-ce5b-430f-ad8f-3363efa05481"
    />
  </div>
);

const mapStateToProps = ({ modal }) => ({});
const mapDispatchToProps = dispatch => ({});

const Container = connect(mapStateToProps, mapDispatchToProps)(App);

ReactDOM.render(
  <Provider store={store}>
    <Container />
  </Provider>,
  root
);
