let baseUrl:string;
if (process.env.NODE_ENV === 'development') {
    baseUrl = 'ws://localhost:8080/';
} else {
    baseUrl = `wss://${window.location.host}/`;
}
export function factory(api:string):WebSocket {
    return new WebSocket(baseUrl + api);
}