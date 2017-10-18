import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as OfflinePluginRuntime from 'offline-plugin/runtime';

import 'normalize.css';
import './main.css';

import {App} from './components/App';

OfflinePluginRuntime.install();

ReactDOM.render(
  <App/>,
  document.getElementById('main')
);