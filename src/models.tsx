import { ServerReducers, APPReducers } from "./redux/reducers/reducers";
export const server = {
    namespace: 'server',
    state: {
        pageType: 'table'
    },
    reducers: ServerReducers
};
export const app = {
    namespace: 'app',
    state: {
        token: ''
    },
    reducers: APPReducers
}
export const project = {
    namespace: 'project',
    state: {
        pageType: 'table'
    },
    reducers: ServerReducers
}