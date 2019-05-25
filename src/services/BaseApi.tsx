import * as Fetch from '../utils/request'

class BaseApi {
    private baseUrl: string;
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    public save(model: any): Promise<Fetch.ADDPResult> {
        return Fetch.$post(`${this.baseUrl}/create`, model)
    }
    public update(model: {
        id: number
    }): Promise<Fetch.ADDPResult<boolean>> {
        return Fetch.$put(`${this.baseUrl}/update`, model)
    }
    public deleteOne(id: number): Promise<Fetch.ADDPResult<boolean>> {
        return Fetch.$delete(`${this.baseUrl}/delete`, {
            id
        });
    }
    public deleteAny(ids: Array<number>): Promise<Fetch.ADDPResult<boolean>> {
        return Fetch.$delete(`${this.baseUrl}/deletes`, {
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
    },param?:Object): Promise<Fetch.ADDPResult<Fetch.PageData>> {
        return Fetch.$post(`${this.baseUrl}/list`, {...page,...param});
    }
    public get = Fetch.$get;
    public post = Fetch.$post;
    public delete = Fetch.$delete;
    public put = Fetch.$put;
}
export default BaseApi;