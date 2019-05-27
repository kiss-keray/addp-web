import { ServerReduxData } from "../../pages/server";

export const ServerReducers = {
    list(state: ServerReduxData, { data }) {
        return {
            ...state, ...{
                list: data
            }
        };
    },
    updateState(state: ServerReduxData, { data }) {
        console.log("xxx:",state)
        console.log("yyy:",data)
        return {
            ...state, ...data
        }
    }
}