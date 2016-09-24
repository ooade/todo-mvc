import React from 'react';
import { IndexRoute, Route, Redirect } from 'react-router';

import ViewerQuery from './ViewerQuery';
import TodoContainer from '../components/TodoContainer';

export default (
  <Route path='/'>
    <IndexRoute component={TodoContainer} queries={ViewerQuery} />
    <Redirect from='*' to='/' />
  </Route>
);
