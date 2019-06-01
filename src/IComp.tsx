import * as React from 'react';
import IApi, { Pageable } from "./IApi";
import AddpApi from "./AddpApi";
export default class IComp<M = {}, R = {},P = object, S ={},SS = any> extends React.Component<P,S, SS> implements IApi<M>{
    protected api: AddpApi<M>;
    protected watch:any = {};
    protected namespace:string;
    public constructor(props: any, baseUrl?: string,namespace?:string) {
        super(props);
        this.api = new AddpApi(baseUrl)
        this.namespace = namespace;
        console.log("commoent", props);
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
    setSta(d:R) {
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
    postJson(url: string, data?: string): Promise<any> {
        return this.api.postJson(url,data);
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
    setState<K extends keyof S>(
        state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null) |any,
        callback?: () => void
    ): void {
        console.log("state",...state);
        console.log("watch",...this.watch);
        let call = () => {
            try{
                let stateKeys = new Array();
                for(let key in state) {
                    stateKeys.push(key);
                }
                for (let key in this.watch) {
                    let keys = key.split(",");
                    if (keys.length <= stateKeys.length) {
                        let count = 0;
                        for(let k of keys) {
                            if(stateKeys.includes(k)) {
                                count ++;
                            }
                        }
                        if (count == keys.length) {
                            if(typeof this.watch[key] === typeof function(){}) {
                                this.watch[key](state)
                            }
                        }
                    }
                }
            }catch(e){
                console.log(e);
            }
            if (typeof callback === typeof function(){}) {
                callback();
            }
        }
        super.setState(state,call);
    }
}