
import './index.css';
import * as React from 'react';
import { Router, Switch, Route, } from 'dva/router';
import { Provider } from './redux/store'
import APP from './APP'

function RouterConfig({ history }) {
    return (
        <Provider>
            <Router history={history}>
                <Switch>
                    <Route path="*"  component={APP} />
                </Switch>
            </Router>
        </Provider>
    )
}
export default RouterConfig;