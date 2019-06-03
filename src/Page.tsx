import * as React from 'react';
import 'antd/dist/antd.css';
import './index.css'
import * as H from 'history';
import { match } from 'react-router';
import AddpApi from './AddpApi';
import IApi, { Pageable } from './IApi'
import IComp from './IComp';
export interface IPageProps<P = {}> {
    location?: H.Location<P>,
    match?: match<P>,
    history?: H.History,
    dispatch?: any
}
export type ADDPEnv = 'test' | 'pre' | 'pro' | 'bak'
export type PageType = 'table' | 'add-form' | 'edit-form';
export interface TablePageState {
    pageNumber: number,
    pageSize: number,
    total?: number
}
export interface TablePageProps<M, R extends TablePageRedux<M>, P = any> extends IPageProps<P> {
    redux?: R
}
export interface TableFormState {

}
export interface TableFormProps<M, R> {
    formType: 'add' | 'edit',
    dispatch?: any,
    formSu?(model: M): void,
    formFai?(model: M): void,
    redux?: R,
    model?: M
}
export interface TablePageRedux<M> {
    list?: Array<M>,
    pageType?: PageType
}
class Page<M = {}, R = any, P = {}, S = {}, SS = any> extends IComp<M, R, P, S, SS>{
    public constructor(props: any, baseUrl?: string, namespace?: string) {
        super(props, baseUrl, namespace);
    }
    basePage(page: Pageable, param?: Object): Promise<import("./IApi").PageData<M>> {
        return this.api.basePage(page, param);
    }
    getOneById(id: number): Promise<M> {
        return this.api.getOneById(id);
    }
    push(pathname: string, state?: {}) {
        this.props.history.push({
            pathname,
            state
        });
    }
    go(n: number) {
        this.props.history.go(n);
    }
    goback() {
        this.go(-1);
    }
}
export default Page;