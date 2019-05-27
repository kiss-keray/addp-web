import * as React from 'react';
import 'antd/dist/antd.css';
import './index.css'
import * as H from 'history';
import { match } from 'react-router';
import AddpApi from './AddpApi';
import IApi, { Pageable } from './IApi'
export interface IPageProps<P = {}> {
    location?: H.Location<P>,
    match?: match<P>,
    history:H.History,
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
class Page<M = {}, P = any, S ={},SS = any> extends React.Component<P|any,S, SS> implements IApi<M>{
    protected api: AddpApi<M>;
    protected namespace:string;
    public constructor(props: any, baseUrl?: string,namespace?:string) {
        super(props);
        props.location.state = {...props.location.state,...props.match.params}
        if (baseUrl) {
            this.api = new AddpApi(baseUrl);
        }
        this.namespace = namespace;
    }
    dispatch(action:{
        type:string,
        data:any
    }) {
        this.props.dispatch({
            type: `${this.namespace}/${action.type}`,
            data: action.data
        })
    }
    setSta(d:object) {
        this.dispatch({
            type: 'updateState',
            data: d
        })
    }
    request(url: RequestInfo, options: RequestInit): Promise<any> {
        return this.api.request(url, options);
    }
    get(url: string, param?: any): Promise<any> {
        return this.api.get(url, param);
    }
    post(url: string, param?: any, method?: string): Promise<any> {
        return this.api.post(url, param, method);
    }
    put(url: string, param?: any): Promise<boolean> {
        return this.api.put(url, param);
    }
    delete(url: string, param?: any): Promise<boolean> {
        return this.api.delete(url, param);
    }
    save(model: M): Promise<M> {
        return this.api.save(model);
    }
    update(model: { id: number; }): Promise<boolean> {
        return this.api.update(model);
    }
    deleteOne(id: number): Promise<boolean> {
        return this.api.deleteOne(id);
    }
    deleteAny(ids: number[]): Promise<boolean> {
        return this.api.deleteAny(ids);
    }
    basePage(page: Pageable, param?: Object): Promise<import("./IApi").PageData<M>> {
        return this.api.basePage(page, param);
    }

    getOneById(id:number):Promise<M> {
        return this.api.getOneById(id);
    }
}
export default Page;