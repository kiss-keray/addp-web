import * as React from 'react';
import './index.css'
import 'antd/dist/antd.css';
import * as H from 'history';
import {  match } from 'react-router';
import BaseApi from './services/BaseApi';
export interface IPageProps<P = {}> {
    location: H.Location,
    match: match<P>
}
class Page<P = {},S = {},SS = any> extends React.Component<IPageProps<P>,S,SS> {
    protected api:BaseApi;
    public constructor(props:IPageProps<P>,baseUrl:string) {
        super(props);
        if (baseUrl) {
            this.api = new BaseApi(baseUrl);
        }
    }
}
export default Page;