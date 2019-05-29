import { ServerReduxData } from "../../pages/server";
import { APPReduxData } from "../../APP";

export const ServerReducers = {
    list(state: ServerReduxData, { data }) {
        return {
            ...state, ...{
                list: data
            }
        };
    },
    updateState(state: ServerReduxData, { data }) {
        return {
            ...state, ...data
        }
    }
}
export const APPReducers = {
    updateState(state: APPReduxData, { data }) {
        return {
            ...state, ...data
        }
    }
}