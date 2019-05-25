import * as React from 'react';
import { store } from '../redux/store'
import { Button } from 'antd';
import Page,{IPageProps} from '../Page';
class Projects extends Page<any> {
    public constructor(props:IPageProps) {
        super(props,'project');
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