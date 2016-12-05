import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router'

import 'react-input-range/dist/react-input-range.css';
import 'semantic-ui-css/semantic.min.css';

import App from './components/App.js';
import './index.css';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={App} />
  </Router>,
  document.getElementById('root')
);
