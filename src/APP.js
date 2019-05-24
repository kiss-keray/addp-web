import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import Index from './pages/index/Index';

import { Provider } from './redux/store'
function RouterConfig({ history }) {
  return (
    <Provider>
      <div>
        <Router history={history}>
          <Switch>
            <Route path="/" exact component={Index} />
          </Switch>
        </Router>
      </div>
    </Provider>
  );
}

export default RouterConfig;
