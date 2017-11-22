import React from 'react';
import ReactDOM from 'react-dom';
import ReduxThunk from 'redux-thunk';
import { Provider, connect } from 'react-redux'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { reducers } from 'dist/bundle';

const root = document.createElement('div');
document.body.appendChild(root)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(applyMiddleware(ReduxThunk));
let store = createStore(combineReducers(reducers), enhancer);

const App = props => (
  <div>
    <h1>Test WidgetEditor</h1>
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
