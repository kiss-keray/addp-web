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
    history?:H.History,
    dispatch?:any
}
export type ADDPEnv = 'test' | 'pre' | 'pro' | 'bak'
export type PageType = 'table' | 'add-form' | 'edit-form';
/**
 * M 页面主要实体对象
 * P 页面match.param 定义
 * S => react.S
 * SS => react.SS
 */
class Page<M = {}, R = any,P = {}, S ={},SS = any> extends IComp<M,R,P,S,SS>{
    public constructor(props: any, baseUrl?: string,namespace?:string) {
        super(props,baseUrl,namespace);
        props.location.state = {...props.location.state,...props.match.params}
    }
    basePage(page: Pageable, param?: Object): Promise<import("./IApi").PageData<M>> {
        return this.api.basePage(page, param);
    }
    getOneById(id:number):Promise<M> {
        return this.api.getOneById(id);
    }
    push(url:string,state?:{}) {
        this.props.history.push(url,state);
    }
    go(n:number) {
        this.props.history.go(n);
    }
    goback() {
        this.go(-1);
    }
}
export default Page;