
export interface PageData {
  content: Array<any>,
  totalPages: number,
  last: boolean,
  empty: boolean,
  totalElements: number // 列表全部数量
  numberOfElements: number // 当前界面列表数量
}
export interface ADDPResult<T = any> {
  status: number
  success: Boolean,
  data?: T,
  errorCode?: string,
  errorMsg?: string,
  response: Response
}
function check(result: ADDPResult): any {
  if (!result.success) {
    // success=false
    throw result;
  }
  return result.data;
}
function json(response: Response):Promise<ADDPResult> {
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

/**
 * Requests a URL, returning a promise.
 *
 * @param  {RequestInfo}
 * @param  {RequestInit} 
 * @return {ADDPResult}
 */
function request(url: RequestInfo, options: RequestInit): Promise<any> {
  options.mode = "cors";
  return fetch(`http://127.0.0.1:8080/${url}`, options)
    .then((r:Response) => json(r))
    .then(check)
}
export function $get(url: string, param?: any): Promise<ADDPResult> {
  let paramStr: string = param ? url + "?" : url;
  if (!param) {
    for (let key in param) {
      paramStr += `${key}=${param[key]}&`
    }
    paramStr = paramStr.substring(0, paramStr.length - 1);
  }
  let promise = request(paramStr, {
    method: 'get',
  })
  return promise;
}

export function $post(url: string, param = {}, method?: string): Promise<ADDPResult> {
  let formData: FormData = new FormData();
  for (let key in param) {
    formData.append(key, param[key]);
  }
  return request(url, {
    method: method ? method : 'POST',
    body: formData
  });
}
export function $put(url: string, param?: any): Promise<ADDPResult<boolean>> {
  return $post(url, param, 'PUT');
}
export function $delete(url: string, param?: any): Promise<ADDPResult<boolean>> {
  return $post(url, param, 'DELETE');
}