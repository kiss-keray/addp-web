import { ServerReducers } from "./redux/reducers/reducers";
export const server =  {
    namespace: 'server',
    state: {
        pageType: 'table'
    },
    reducers: ServerReducers,
  };