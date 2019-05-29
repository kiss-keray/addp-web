import * as React from 'react';
import { store } from '../redux/store'
import { Button } from 'antd';
import Page,{IPageProps} from '../Page';
interface IParam {
    env: 'test'
}
export interface ProjectModel {
    id?:number,
    proName: string,
    name: string,
    gitUrl: string,
    testDomain: string,
    preDomain: string,
    proDomain: string
}
class Projects extends Page<ProjectModel,IParam> {
    public constructor(props:IPageProps<IParam>) {
        super(props,'/project');
    }
    public render() {
        return (
            <div>
                <Button>应用</Button>
            </div>
        )
    }
}
export default Projects;