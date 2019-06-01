import Page, { IPageProps, ADDPEnv, PageType, TablePageState, TableFormProps, TableFormState } from "../Page";
import { ProjectModel } from "./Projects";
import { Table, Button, message, Input, Form, Select, Pagination } from "antd";
import IComp from "../IComp";
import { connect } from "dva";
import { FormComponentProps } from "antd/lib/form";
import { PageData } from "../IApi";
import moment = require("moment");
const { Column } = Table;
const { Option } = Select;
interface IParam {
    nav: ADDPEnv
}
export interface ChangeBranchModel {
    id?: number,
    name?: string,
    branchName?: string,
    projectsModel?: ProjectModel
}
interface IProps extends IPageProps<IParam> {
    redux?: ChangeReduxData
}
interface ChangeReduxData {
    list?: Array<ChangeBranchModel>,
    pageType?: PageType
}
interface IState extends TablePageState {
    selectModel?: ChangeBranchModel,
    selectIds?: Array<number>
}
interface IFormProps extends FormComponentProps, TableFormProps<ChangeBranchModel, ChangeReduxData> {
    form: any
}
interface FState extends TableFormState {
    projects?: Array<ProjectModel>
}
class CChangeFrom extends IComp<ChangeBranchModel, ChangeReduxData, IFormProps, FState> {
    constructor(props: IFormProps) {
        super(props, "/change", "change");
        if (props.formType === 'add') {
            this.init();
        }
    }
    init() {
        this.post('/project/list', {
            pageNumber: 0,
            pageSize: 99999
        }).then((p: PageData<ProjectModel>) => {
            this.setState({
                projects: p.content
            })
        })
    }
    componentDidMount() {
        this.props.form.setFieldsValue({
            ...this.props.model
        })
    }
    state: FState = {
        projects: []
    }
    handleSubmit = (e: any) => {
        let success = () => {
            if (this.props.formType === "add") {
                this.save(this.props.form.getFieldsValue())
                    .then(r => {
                        this.setSta({
                            pageType: 'table',
                            list: [...this.props.redux.list, r]
                        })
                    })
                    .catch(e => {
                        message.error("添加失败")
                    })
            } else if (this.props.formType === "edit") {
                this.update({
                    ...this.props.form.getFieldsValue()
                })
                    .then((r) => {
                        if (r) {
                            this.setSta({
                                pageType: 'table',
                                list: this.props.redux.list.map(c => c.id === this.props.model.id ? this.props.model : c)
                            })
                        } else {
                            message.error("更新失败")
                        }
                    })
                    .catch(e => {
                        message.error("更新失败")
                    })
            }
        }
        this.props.form.validateFields(err => {
            if (!err) {
                success();
            }
        });
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} onSubmit={this.handleSubmit}>
                <Form.Item>
                    {getFieldDecorator('id', {})}
                </Form.Item>
                <Form.Item label="变更名">
                    {getFieldDecorator('name', {
                        rules: [
                            { required: true }
                        ],
                    })(<Input />)}
                </Form.Item>
                <Form.Item label="分支">
                    {getFieldDecorator('branchName', {
                        initialValue: `future-${moment(new Date()).format('YYYY-MM-DD-HH-mm-ss')}`,
                        rules: [
                            { required: true }
                        ],
                    })(<Input />)}
                </Form.Item>
                <Form.Item label="端口">
                    {getFieldDecorator('port', {
                        initialValue: '8080',
                        rules: [
                            { required: true }
                        ],
                    })(<Input />)}
                </Form.Item>
                {
                    this.props.formType == 'edit' ? <div></div> : (
                        <Form.Item label="关联项目">
                            {getFieldDecorator("projectId", {
                                rules: [
                                    { required: true }
                                ]
                            })(
                                <Select
                                    showSearch
                                    style={{ width: 200 }}
                                    placeholder="选着项目"
                                    optionFilterProp="children"
                                    filterOption={
                                        (input, option:any) => {
                                            return new RegExp(input.toLowerCase()).test(option.props.children.toLowerCase());
                                        }
                                    }
                                >
                                    {
                                        this.state.projects.map(p => (<Option key={p.id} value={p.id}>{p.proName}</Option>))

                                    }
                                </Select>
                            )}
                        </Form.Item>
                    )
                }
                <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
                    <Button type="primary" htmlType="submit">
                        保存
              </Button>
                    <Button type="primary" onClick={() => {
                        this.setSta({
                            pageType: "table"
                        })
                    }}>
                        关闭
              </Button>
                </Form.Item>
            </Form>
        )
    }
}

const ChangeFrom = Form.create<IFormProps>()(
    connect(({ change }) => ({ redux: change }))(CChangeFrom)
);
class ChangeBranch extends Page<ChangeBranchModel, ChangeReduxData, IProps, IState> {
    constructor(props: IProps) {
        super(props, "/change", "change");
        this.loadTableData();
        this.setSta({
            pageType: 'table'
        })
    }
    public state: IState = {
        selectModel: {},
        selectIds: [],
        pageNumber: 1,
        pageSize: 10
    }
    public release = (record: any) => () => {
        console.log(record)
        this.props.history.push(`/changeBranch/work/${record.id}`, {
            changeBranchId: record.id
        })
    }
    
    public loadTableData() {
        this.basePage({
            pageNumber: this.state.pageNumber - 1,
            pageSize: this.state.pageSize
        }).then(result => {
            this.setState({
                total: result.totalElements
            })
            this.setSta({
                list: result.content
            })
        })
    }
    watch = {
        pageNumber: ({pageNumber,pageSize}) => {
            this.loadTableData();
        }
    }
    public loadTable(): React.ReactNode {
        return (
            <div>
                <div className="table-top xy">
                    <Button type="primary" onClick={() => {
                        this.setSta({
                            pageType: 'add-form'
                        })
                    }}>添加</Button>
                </div>
                <Table dataSource={this.props.redux.list} bordered>
                    <Column title="创建时间" dataIndex="createTime" key="createTime" />
                    <Column title="变更名" dataIndex="name" key="name" />
                    <Column title="分支名" dataIndex="branchName" key="branchName" />
                    <Column title="项目创建时间" dataIndex="projectsModel.createTime" key="p-createTime" />
                    <Column title="项目名" dataIndex="projectsModel.name" key="p-name" />
                    <Column
                        align='center'
                        title="操作"
                        key="action"
                        render={(text, record: ChangeBranchModel) => (
                            <div>
                                <Button onClick={this.release(record)}>发布</Button>
                                <Button onClick={() => {
                                    this.setState({
                                        selectModel: record,
                                    });
                                    this.setSta({
                                        pageType: "edit-form"
                                    })
                                }}>编辑</Button>
                            </div>
                        )}
                    />
                </Table>
                
                <Pagination
                    showSizeChanger
                    pageSize={this.state.pageSize}
                    current={this.state.pageNumber}
                    total={this.state.total}
                    onChange={(pageNumber,pageSize) => {
                        this.setState({
                            pageNumber,
                            pageSize
                        });

                    }}
                    onShowSizeChange = {
                        (pageNumber,pageSize) => {
                            this.setState({
                                pageSize,
                                pageNumber
                            });
    
                        }
                    }
                />
            </div>
        )
    }
    public loadPage(): React.ReactNode {
        switch (this.props.redux.pageType) {
            case 'table': return this.loadTable();
            case 'add-form': return this.loadServerAddForm();
            case 'edit-form': return this.loadServerEditForm(this.state.selectModel);
        }
    }
    public loadServerEditForm = (model: ChangeBranchModel) => {
        return (<ChangeFrom formType='edit' model={model} />)
    }
    public loadServerAddForm() {
        return (<ChangeFrom formType='add' />)
    }

    public render() {
        return (
            <div>
                {this.loadPage()}
            </div>
        )
    }
}
export default connect(({ change }) => ({
    redux: change
}))(ChangeBranch);