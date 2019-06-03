import { ServerReduxData } from "../../pages/server";
import { APPReduxData } from "../../APP";
import { ChangeReduxData } from "../../pages/ChangeBranch";
import { ProjectReduxData } from "../../pages/Projects";

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
export const ProjectReducers = {
    updateState(state: ProjectReduxData, { data }) {
        return {
            ...state, ...data
        }
    }
}
export const ChangeReducers = {
    updateState(state: ChangeReduxData, { data }) {
        return {
            ...state, ...data
        }
    }
}