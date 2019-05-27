import Page, { IPageProps, ADDPEnv } from "../Page";
import { ProjectModel } from "./Projects";
import { Table, Button } from "antd";
const { Column } = Table;
interface IParam {
    nav: ADDPEnv
}
export interface ChangeBranchModel {
    id?:number,
    name: string,
    branchName: string,
    projectsModel: ProjectModel
}
interface IProps extends IPageProps<IParam>{
    list?:Array<ChangeBranchModel>
}
export default class ChangeBranch extends Page<ChangeBranchModel, IProps, {
    pageNumber?: number,
    pageSize?: number,
    list?: Array<ChangeBranchModel>
}> {
    constructor(props: IPageProps<IParam>) {
        super(props, "change");
        this.basePage({
            pageNumber: this.state.pageNumber,
            pageSize: this.state.pageSize
        }).then(result => {
            this.setState({
                list: result.content
            })
        })
    }
    public state = {
        list: [],
        pageNumber: 0,
        pageSize: 10,
    }
    public release = (record:any) => () => {
        console.log(record)
        this.props.history.push(`/change/work/${ record.id}`,{
            changeBranchId: record.id
        })
    }
    public render() {
        return (

            <Table dataSource={this.state.list} bordered>
                <Column title="创建时间" dataIndex="createTime" key="createTime" />
                <Column title="变更名" dataIndex="name" key="name" />
                <Column title="分支名" dataIndex="branchName" key="branchName" />
                <Column title="项目创建时间" dataIndex="projectsModel.createTime" key="p-createTime" />
                <Column title="项目名" dataIndex="projectsModel.name" key="p-name" />
                <Column
                    align='center'
                    title="操作"
                    key="action"
                    render={(text,record:ChangeBranchModel) => (
                        <Button  onClick={this.release(record)}>发布</Button>
                    )}
                />
            </Table>
        )
    }
}