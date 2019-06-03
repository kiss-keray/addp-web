import IApi, { PageData, ApiResult } from './IApi'
import { string } from 'prop-types';
import { message } from 'antd';
class AddpApi<M> implements IApi<M> {
    private baseUrl: string;
    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl;
    }
    public request(url: RequestInfo, options: RequestInit): Promise<any> {
        return fetch(`${url}`, options)
            .then((r: Response) => this.json(r))
            .then(result => {
                console.log("fetch-log:", result);
                return result;
            })
            .then(this.check)
            .catch(e => {
                console.log("fetch-error:", e);
                throw e;
            })
    }
    public get(url: string, param?: any): Promise<any> {
        let paramStr: string = param ? url + "?" : url;
        if (param) {
            for (let key in param) {
                paramStr += `${key}=${param[key]}&`
            }
            paramStr = paramStr.substring(0, paramStr.length - 1);
        }
        let promise = this.request(paramStr, {
            method: 'get',
        })
        return promise;
    }
    public post(url: string, param?: any, method?: string): Promise<any> {
        let formData: FormData = new FormData();
        for (let key in param) {
            if (param[key] === undefined || param[key] === null) {
                continue;
            }
            formData.append(key, param[key]);
        }
        return this.request(url, {
            method: method ? method : 'POST',
            body: formData
        });
    }
    
    postJson(url: string, data?: string): Promise<any> {
        return this.request(url, {
            method: 'POST',
            body: data,
            headers:{
                'Content-Type':'application/json'
            }
        });
    }

    public put(url: string, param?: any): Promise<boolean> {
        return this.post(url, param, 'PUT');
    }
    public delete(url: string, param?: any): Promise<boolean> {
        return this.post(url, param, 'DELETE');
    }

    public save(model: M): Promise<M> {
        if (!this.baseUrl) {
            throw new Error("baseurl is null")
        }
        return this.post(`${this.baseUrl}/create`, model)
    }
    public update(model: {
        id: number
    }): Promise<boolean> {
        if (!this.baseUrl) {
            throw new Error("baseurl is null")
        }
        return this.put(`${this.baseUrl}/update`, model)
    }
    public deleteOne(id: number): Promise<boolean> {
        if (!this.baseUrl) {
            throw new Error("baseurl is null")
        }
        return this.delete(`${this.baseUrl}/delete`, {
            id
        });
    }
    public deleteAny(ids: Array<number>): Promise<boolean> {
        if (!this.baseUrl) {
            throw new Error("baseurl is null")
        }
        return this.delete(`${this.baseUrl}/deletes`, {
            ids
        });
    }
    public basePage(page: {
        pageNumber: number,
        pageSize: number,
        order?: {
            filed: string,
            asc?: boolean
        }
    }, param?: Object): Promise<PageData<M>> {
        if (!this.baseUrl) {
            throw new Error("baseurl is null")
        }
        return this.post(`${this.baseUrl}/list`, { ...page, ...param });
    }
    public getOneById(id: number): Promise<M> {
        if (!this.baseUrl) {
            throw new Error("baseurl is null")
        }
        return this.get(`${this.baseUrl}/me`, {
            id
        });
    }

    private check(result: ApiResult): any {
        if (!result.success) {
            // success=false
                message.error(result.errorMsg || "ERROR");
                throw new Error(result.errorMsg || "ERROR");
        }
        return result.data;
    }
    private json(response: Response): Promise<ApiResult> {
        if (response.status >= 200 && response.status < 300) {
            try{
                return response.json();
            }catch(e) {
                throw e;
            }
        }
        const error = new Error(response.statusText);
        error.response = response;
        throw {
            success: false,
            data: null,
            errorCode: "HTTP-ERROR",
            status: response.status,
            response
        };
    }
}
export default AddpApi;