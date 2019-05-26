export interface PageData<T> {
    content: Array<T>,
    totalPages: number,
    last: boolean,
    empty: boolean,
    totalElements: number // 列表全部数量
    numberOfElements: number // 当前界面列表数量
}

export interface ApiResult<T = any> {
    status: number
    success: Boolean,
    data?: T,
    errorCode?: string,
    errorMsg?: string,
    response: Response
}
export interface Pageable {
    pageNumber: number,
    pageSize: number,
    order?: {
        filed: string,
        asc?: boolean
    }
}
export default interface IApi<T> {

    request(url: RequestInfo, options: RequestInit): Promise<any>;
    get(url: string, param?: any): Promise<any>;
    post(url: string, param?: any, method?: string): Promise<any>;
    put(url: string, param?: any): Promise<boolean>;
    delete(url: string, param?: any): Promise<boolean>;

    save(model: any): Promise<T>;
    update(model: {
        id: number
    }): Promise<boolean>;
    deleteOne(id: number): Promise<boolean>;
    deleteAny(ids: Array<number>): Promise<boolean>;
    basePage(page: Pageable, param?: Object): Promise<PageData<T>>;
    getOneById(id:number):Promise<T>;
}