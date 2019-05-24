import fetch from 'dva/fetch';

function parseJSON(response:Response) {
  return response.json();
}

function checkStatus(response:Response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {RequestInfo}
 * @param  {RequestInit} 
 * @return {Response}
 */
export default function request(url:RequestInfo, options:RequestInit) {
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => ({ data }))
    .catch(err => ({ err }));
}
