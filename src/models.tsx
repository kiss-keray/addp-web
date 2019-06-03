import { ServerReducers, APPReducers, ChangeReducers } from "./redux/reducers/reducers";
import { ServerReduxData } from "./pages/Server";
import { APPReduxData } from "./APP";
import { ProjectReduxData } from "./pages/Projects";
import { ChangeReduxData } from "./pages/ChangeBranch";
interface Model<R> {
    namespace:string,
    state:R,
    reducers:any
}
export const server:Model<ServerReduxData> = {
    namespace: 'server',
    state: {
        pageType: 'table'
    },
    reducers: ServerReducers
};
export const app:Model<APPReduxData> = {
    namespace: 'app',
    state: {
        token: '',
        siderShow: true
    },
    reducers: APPReducers
}
export const project:Model<ProjectReduxData> = {
    namespace: 'project',
    state: {
        pageType: 'table'
    },
    reducers: ServerReducers
}

export const change:Model<ChangeReduxData> = {
    namespace: 'change',
    state: {
        pageType: 'table',
        nowWork:{}
    },
    reducers: ChangeReducers
}