import IApi, { PageData, ApiResult } from './IApi'
class AddpApi<M> implements IApi<M> {
    private baseUrl: string;
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    public request(url: RequestInfo, options: RequestInit): Promise<any> {
        options.mode = "cors";
        return fetch(`http://127.0.0.1:8080/${url}`, options)
            .then((r: Response) => this.json(r))
            .then(result => {
                console.log("fetch-log:", result);
                return result;
            })
            .then(this.check)
            .catch(e => {
                console.log("fetch-error:", e);
                return e;
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
            formData.append(key, param[key]);
        }
        return this.request(url, {
            method: method ? method : 'POST',
            body: formData
        });
    }
    public put(url: string, param?: any): Promise<boolean> {
        return this.post(url, param, 'PUT');
    }
    public delete(url: string, param?: any): Promise<boolean> {
        return this.post(url, param, 'DELETE');
    }

    public save(model: M): Promise<M> {
        return this.post(`${this.baseUrl}/create`, model)
    }
    public update(model: {
        id: number
    }): Promise<boolean> {
        return this.put(`${this.baseUrl}/update`, model)
    }
    public deleteOne(id: number): Promise<boolean> {
        return this.delete(`${this.baseUrl}/delete`, {
            id
        });
    }
    public deleteAny(ids: Array<number>): Promise<boolean> {
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
        return this.post(`${this.baseUrl}/list`, { ...page, ...param });
    }
    public getOneById(id: number): Promise<M> {
        return this.get(`${this.baseUrl}/me`, {
            id
        });
    }

    private check(result: ApiResult): any {
        if (!result.success) {
            // success=false
            throw result;
        }
        return result.data;
    }
    private json(response: Response): Promise<ApiResult> {
        if (response.status >= 200 && response.status < 300) {
            return response.json();
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