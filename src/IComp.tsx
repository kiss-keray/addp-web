import * as React from 'react';
import IApi, { Pageable } from "./IApi";
import AddpApi from "./AddpApi";
export default class IComp<M = {}, P = {}, S ={},SS = any> extends React.Component<P,S, SS> implements IApi<M>{
    protected api: AddpApi<M>;
    public constructor(props: P, baseUrl?: string) {
        super(props);
        if (baseUrl) {
            this.api = new AddpApi(baseUrl);
        } else {
            this.api = new AddpApi()
        }
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
        throw new Error("Method not implemented.");
    }
    getOneById(id: number): Promise<M> {
        throw new Error("Method not implemented.");
    }
}