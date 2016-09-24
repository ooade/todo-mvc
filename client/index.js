import React from 'react';
import Relay from 'react-relay';
import ReactDOM from 'react-dom';
import { browserHistory, applyRouterMiddleware, Router } from 'react-router';
import useRelay from 'react-router-relay';
import 'todomvc-app-css/index.css';

import Route from './routes/Route';

const rootNode = document.createElement('div');
document.body.appendChild(rootNode);

ReactDOM.render(
  <Router
    history={browserHistory}
    routes={Route}
    render={applyRouterMiddleware(useRelay)}
    environment={Relay.Store}
    forceFetch
  />,
  rootNode
);
