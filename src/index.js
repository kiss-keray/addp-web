import dva from 'dva';
import './index.css';

// 1. Initialize
const app = dva();
// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/addp').default);
app.model(require('./models').server);

// 4. Router
app.router(require('./routers').default);

// 5. Start
app.start('#root');
