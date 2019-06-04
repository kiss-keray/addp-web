import Page, { IPageProps, ADDPEnv, PageType, TablePageState, TableFormProps, TableFormState } from "../Page";
import { ProjectModel } from "./Projects";
import { Table, Button, message, Input, Form, Select, Pagination, Menu, Icon } from "antd";
import IComp from "../IComp";
import { connect } from "dva";
import { FormComponentProps } from "antd/lib/form";
import { PageData } from "../IApi";
import moment = require("moment");
import { CReleaseWork, ReleaseWork, ReleaseBillModel } from "./ReleaseWork";
import * as React from 'react';

const { Column } = Table;
const { Option } = Select;
interface IParam {
    projectId: number,
    env: ADDPEnv
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
export interface ChangeReduxData {
    list?: Array<ChangeBranchModel>,
    pageType?: PageType,
    nowWork?: ReleaseBillModel
}
interface IState extends TablePageState {
    selectModel?: ChangeBranchModel,
    selectIds?: Array<number>,
    currentEnv?: ADDPEnv,
    branchStatus?: boolean
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
                                        (input, option: any) => {
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
const baseUrl = "/change";
class ChangeBranch extends Page<ChangeBranchModel, ChangeReduxData, IProps, IState> {
    constructor(props: IProps) {
        super(props, baseUrl, "change");
        this.loadTableData();
        this.setSta({
            pageType: 'table'
        })
        this.releaseWorkRef = React.createRef();
    }
    public releaseWorkRef: React.RefObject<{
        getWrappedInstance(): ReleaseWork
    }>;
    public state: IState = {
        selectModel: {},
        selectIds: [],
        pageNumber: 1,
        pageSize: 10,
        currentEnv: "test",
        branchStatus: false
    }
    componentWillMount() {
        this.dispatch({
            type: "app/updateState",
            data: {
                siderShow: false
            },
            owner: false
        })
    }
    componentDidMount() {
        // this.branchStatusInterval = setInterval(() => {
        //     this.intervalBranchStatus();
        // }, 5000)
    }
    componentWillUnmount() {
        clearInterval(this.branchStatusInterval);
    }
    public loadTableData() {
        this.get(`/change/projectChanges/${this.props.match.params.projectId}`)
            .then((list: Array<ChangeBranchModel>) => {
                this.setSta({
                    list
                })
            })
    }
    private branchStatusInterval;
    private intervalBranchStatus() {
        if (this.props.redux.nowWork.changeBranchId) {
            this.get(`${baseUrl}/checkBranch`, {
                id: this.props.redux.nowWork.changeBranchId,
                env: this.state.currentEnv
            }).then((branchStatus: boolean) => {
                this.setState({
                    branchStatus
                })
            }).catch(e => e)
        } else {
            this.setState({
                branchStatus: false
            })
        }
    }
    watch = {
        "redux.nowWork": (nowWork: ReleaseBillModel) => {
            // this.intervalBranchStatus();
        }
    }
    public loadTable(): React.ReactNode {
        return (
            <div>
                <Menu
                    onClick={({ key }) => {
                        this.setState({
                            currentEnv: key
                        })
                    }}
                    selectedKeys={[this.state.currentEnv]}
                    mode="horizontal"
                >
                    <Menu.Item key="test">
                        <Icon type="apartment" />
                        测试环境
                    </Menu.Item>
                    <Menu.Item key="pre">
                        <Icon type="cloud-server" />
                        预发环境
                    </Menu.Item>
                    <Menu.Item key="pro">
                        <Icon type="cloud-upload" />
                        正式环境
                    </Menu.Item>
                </Menu>
                <div className="release-step">
                    <CReleaseWork
                        ref={this.releaseWorkRef}
                        env={this.state.currentEnv}
                        projectId={this.props.match.params.projectId}
                        changeId={this.state.selectModel.id}
                        branchStatus={this.state.branchStatus}
                    ></CReleaseWork>
                </div>
                <Table dataSource={this.props.redux.list} bordered>
                    <Column title="创建时间" dataIndex="createTime" key="createTime" />
                    <Column title="变更名" dataIndex="name" key="name" />
                    <Column title="分支名" dataIndex="branchName" key="branchName" />
                    <Column title="项目名" dataIndex="projectsModel.name" key="p-name" />
                    <Column
                        align='center'
                        title="操作"
                        key="action"
                        render={(text, record: ChangeBranchModel) => {
                            if (this.props.redux.nowWork.changeBranchId === record.id) {
                                if (this.props.redux.nowWork.releasePhase !== "init") {
                                    if (this.props.redux.nowWork.releaseType === "run" || this.props.redux.nowWork.releaseType === "wait") {
                                        return (<Button type="primary" loading>自动部署中</Button>)
                                    }
                                    if (!(this.props.redux.nowWork.releasePhase === 'start' && this.props.redux.nowWork.releaseType === "releaseSuccess")) {
                                        return (<Button type="primary" loading>自动部署中</Button>)
                                    }
                                }
                                return (
                                    <div>
                                        <Button type="primary" onClick={() => {
                                            this.releaseWorkRef.current.getWrappedInstance().autoRelease()
                                        }}>重新部署</Button>
                                        <Button type="danger" onClick={() => {
                                            this.releaseWorkRef.current.getWrappedInstance().stop()
                                        }}>下线</Button>
                                    </div>
                                )
                            }
                            return (
                                <div>
                                    <Button
                                        onClick={() => {
                                            this.get(`${baseUrl}/createBill`, {
                                                id: record.id,
                                                env: this.state.currentEnv
                                            }).then((bill: ReleaseBillModel) => {
                                                this.releaseWorkRef.current.getWrappedInstance().autoRelease(bill.id)
                                            }).catch(e => {
                                                console.log(e);
                                            });
                                        }}>发布</Button>
                                    <Button onClick={() => {
                                        this.setState({
                                            selectModel: record,
                                        });
                                        this.setSta({
                                            pageType: "edit-form"
                                        })
                                    }}>编辑</Button>
                                </div>
                            )
                        }}
                    />
                </Table>

                <div className="table-top xy">
                    <Button type="primary" onClick={() => {
                        this.setSta({
                            pageType: 'add-form'
                        })
                    }}>添加</Button>
                </div>

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