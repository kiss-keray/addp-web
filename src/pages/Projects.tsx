import * as React from 'react';
import { store } from '../redux/store'
import { Button, message, Transfer, Pagination } from 'antd';
import Page, { IPageProps, PageType, TablePageState, TableFormProps, TablePageRedux, TablePageProps } from '../Page';
import { connect } from 'dva';
import { Table, Divider, Tag } from 'antd';
import {
    Form,
    Input,
    Tooltip,
    Icon,
    Select,
    AutoComplete,
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import IComp from '../IComp';
import { ServerModel } from './Server';
import { PageData } from '../IApi';
const { Column } = Table;

interface IParam {
    env: 'test'
}
export interface ProjectModel {
    id?: number,
    proName?: string,
    name?: string,
    gitUrl?: string,
    testDomain?: string,
    preDomain?: string,
    proDomain?: string
}

interface IProps extends TablePageProps<ProjectModel, ProjectReduxData, IParam> {
}
export interface ProjectReduxData extends TablePageRedux<ProjectModel> {
}
interface IState extends TablePageState {
    selectModel?: ProjectModel,
    selectIds?: Array<number>
}
const baseUrl = "/project"

interface IFormProps extends FormComponentProps, TableFormProps<ProjectModel, ProjectReduxData> {
    form: any
}
export interface TransferData {
    key: string,
    title: string
}
interface FState {
    myTestServers?: Array<TransferData>,
    myPreServers?: Array<TransferData>,
    myProServers?: Array<TransferData>,
    selectTestServers?: Array<string>,
    selectPreServers?: Array<string>,
    selectProServers?: Array<string>,
}
class CProjectForm extends IComp<ProjectModel, ProjectReduxData, IFormProps, FState> {
    constructor(props: IFormProps) {
        super(props, baseUrl);
        this.initServer();

    }
    initServer() {
        this.post('/server/list', {
            pageNumber: 0,
            pageSize: 10,
            env: 'test'
        }).then((p: PageData<ServerModel>) => {
            this.setState({
                myTestServers: p.content.map(s => {
                    return {
                        key: s.id + '',
                        title: s.ip,
                    }
                })
            })
        })
        this.post('/server/list', {
            pageNumber: 0,
            pageSize: 10,
            env: 'pre'
        }).then((p: PageData<ServerModel>) => {
            this.setState({
                myPreServers: p.content.map(s => {
                    return {
                        key: s.id + '',
                        title: s.ip,
                    }
                })
            })
        })
        this.post('/server/list', {
            pageNumber: 0,
            pageSize: 10,
            env: 'pro'
        }).then((p: PageData<ServerModel>) => {
            this.setState({
                myProServers: p.content.map(s => {
                    return {
                        key: s.id + '',
                        title: s.ip,
                    }
                })
            })
        })
        // 拉取项目现有的服务器
        if (this.props.formType === 'edit') {
            this.get(`/server/psList/${this.props.model.id}`).then((p: Array<ServerModel>) => {
                let selectTestServers = [];
                let selectPreServers = [];
                let selectProServers = [];
                p.forEach(s => {
                    if (s.environment === 'test') {
                        selectTestServers.push(s.id + '')
                    } else if (s.environment === 'pre') {
                        selectPreServers.push(s.id + '')

                    } else if (s.environment === 'pro') {
                        selectProServers.push(s.id + '')
                    }
                })
                this.setState({
                    selectPreServers,
                    selectTestServers,
                    selectProServers
                })
            })
        }
    }
    state: FState = {
        myTestServers: [],
        myPreServers: [],
        myProServers: [],
        selectTestServers: [],
        selectPreServers: [],
        selectProServers: [],
    }
    componentDidMount() {
        this.props.form.setFieldsValue({
            ...this.props.model
        })
    }
    handleSubmit = (e: any) => {
        let success = () => {
            if (this.props.formType === "add") {
                this.postJson('/project/create', JSON.stringify(
                    {
                        ...this.props.form.getFieldsValue(),
                        ...{
                            projectsServiceRes: [
                                ...this.state.selectTestServers,
                                ...this.state.selectPreServers,
                                ...this.state.selectProServers].map(id => {
                                    return {
                                        serverId: id
                                    }
                                })
                        }
                    })).then(r => {
                        this.props.formSu && this.props.formSu(r);
                    }).catch(e => {
                        this.props.formFai && this.props.formFai(e);
                    })
                this.props.formSu && this.props.formSu({
                    id: 11
                });
            } else if (this.props.formType === "edit") {
                this.postJson('/project/update', JSON.stringify(
                    {
                        ...this.props.form.getFieldsValue(),
                        ...{
                            projectsServiceRes: [
                                ...this.state.selectTestServers,
                                ...this.state.selectPreServers,
                                ...this.state.selectProServers].map(id => {
                                    return {
                                        serverId: id,
                                        projectsId: this.props.model.id
                                    }
                                })
                        }
                    })).then(r => {
                        if (r) {
                            this.props.formSu && this.props.formSu(r);
                        } else {
                            this.props.formFai && this.props.formFai(e);
                        }
                    }).catch(e => {
                        this.props.formFai && this.props.formFai(e);
                    })
            }
        }
        this.props.form.validateFields(err => {
            if (!err) {
                success();
            }
        });
    };
    handleTransferChange = (key) => (keys) => {
        this.setState({
            [key]: keys
        });
        // console.log("key",key,"  keys:",keys
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} onSubmit={this.handleSubmit}>
                <Form.Item>
                    {getFieldDecorator('id', {})}
                </Form.Item>
                <Form.Item label="项目名（中文）">
                    {getFieldDecorator('proName', {
                        rules: [
                            { required: true }
                        ],
                    })(<Input />)}
                </Form.Item>
                <Form.Item label="项目名（英文）">
                    {getFieldDecorator('name', {
                        rules: [
                            { required: true, pattern: /\w+/g }
                        ],
                    })(<Input disabled />)}
                </Form.Item>
                <Form.Item label="git仓库">
                    {getFieldDecorator('gitUrl', {})(<Input />)}
                </Form.Item>
                <Form.Item label="git用户名">
                    {getFieldDecorator('gitUsername', {})(<Input />)}
                </Form.Item>

                <Form.Item label="git密码">
                    {getFieldDecorator('gitPassword', {})(<Input />)}
                </Form.Item>

                <Form.Item label="主分支">
                    {getFieldDecorator('master', {})(<Input />)}
                </Form.Item>

                <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
                    <Button type="primary" htmlType="submit">
                        保存
              </Button>
                    <Button type="primary" onClick={() => {
                        this.props.dispatch({
                            type: 'project/updateState',
                            data: {
                                pageType: "table"
                            }
                        })
                    }}>
                        关闭
              </Button>
                </Form.Item>
                <Form.Item>
                    <Transfer
                        dataSource={this.state.myTestServers}
                        showSearch
                        listStyle={{
                            width: 200,
                            height: 300,
                        }}
                        onChange={this.handleTransferChange('selectTestServers')}
                        operations={['to right', 'to left']}
                        targetKeys={this.state.selectTestServers}
                        render={item => `${item.title}`}
                        titles={["测试环境", "测试环境"]}
                        locale={{ itemUnit: '台', itemsUnit: '台', notFoundContent: '没有服务器', searchPlaceholder: '请输ip搜索服务器' }}
                    />
                </Form.Item>
                <Form.Item>
                    <Transfer
                        dataSource={this.state.myPreServers}
                        showSearch
                        listStyle={{
                            width: 200,
                            height: 300,
                        }}
                        onChange={this.handleTransferChange('selectPreServers')}
                        operations={['to right', 'to left']}
                        targetKeys={this.state.selectPreServers}
                        render={item => `${item.title}`}
                        titles={["预发环境", "预发环境"]}
                        locale={{ itemUnit: '台', itemsUnit: '台', notFoundContent: '没有服务器', searchPlaceholder: '请输ip搜索服务器' }}
                    />
                </Form.Item>
                <Form.Item>
                    <Transfer
                        dataSource={this.state.myProServers}
                        showSearch
                        listStyle={{
                            width: 200,
                            height: 300,
                        }}
                        onChange={this.handleTransferChange('selectProServers')}
                        operations={['to right', 'to left']}
                        targetKeys={this.state.selectProServers}
                        render={item => `${item.title}`}
                        titles={["正式环境", "正式环境"]}
                        locale={{ itemUnit: '台', itemsUnit: '台', notFoundContent: '没有服务器', searchPlaceholder: '请输ip搜索服务器' }}
                    />
                </Form.Item>
            </Form>
        );
    }
}

const ProjectForm = Form.create<IFormProps>()(
    connect(({ project }) => ({ redux: project }))(CProjectForm)
);
class Projects extends Page<ProjectModel, ProjectReduxData, IProps, IState> {
    public constructor(props: IProps) {
        super(props, baseUrl, 'project');
        this.setSta({
            pageType: 'table'
        })
        let env = this.props.match.params.env;
        this.basePage({
            pageNumber: this.state.pageNumber,
            pageSize: this.state.pageSize
        }, { env })
            .then(page => {
                this.setSta({
                    list: page.content,
                })
                this.setState({
                    total: page.totalElements
                })
            })
    }

    public state: IState = {
        selectModel: {},
        selectIds: [],
        pageNumber: 0,
        pageSize: 10
    }

    public rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User',
            name: record.name,
        }),
    };

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
                <Table
                    dataSource={this.props.redux.list} bordered rowSelection={this.rowSelection}>
                    <Column title="id" dataIndex="id" key="id" />
                    <Column title="项目名" dataIndex="proName" key="proName" />
                    <Column title="projectName" dataIndex="name" key="name" />
                    <Column title="git仓库" dataIndex="gitUrl" key="gitUrl" />
                    <Column title="git用户" dataIndex="gitUsername" key="gitUsername" />
                    <Column title="git密码" dataIndex="gitPassword" key="gitPassword" />
                    <Column title="主分支" dataIndex="master" key="master" />
                    <Column
                        align='center'
                        title="操作"
                        key="action"
                        render={(text, record: ProjectModel) => (
                            <div>
                                <Button onClick={() => {
                                    this.setState({
                                        selectModel: record,
                                    });
                                    this.setSta({
                                        pageType: "edit-form"
                                    })
                                }}>编辑</Button>
                                <Button onClick={() => {
                                    this.push(`/changeBranch/${record.id}`)
                                }}>变更</Button>
                            </div>

                        )}
                    />
                </Table>

                <Pagination
                    showSizeChanger
                    pageSize={this.state.pageSize}
                    current={this.state.pageNumber}
                    total={this.state.total}
                    onChange={(pageNumber, pageSize) => {
                        this.setState({
                            pageNumber,
                            pageSize
                        });

                    }}
                    onShowSizeChange={
                        (pageNumber, pageSize) => {
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
    public loadServerEditForm = (model: ProjectModel) => {
        return (<ProjectForm formType='edit' model={model} formSu={(m: ProjectModel) => {
            this.setSta({
                pageType: 'table',
                list: this.props.redux.list.map((l: ProjectModel) => l.id === m.id ? m : l)
            })
        }} formFai={() => {
            message.error("更新失败");
        }} />)
    }
    public loadServerAddForm() {
        return (<ProjectForm formType='add' formSu={(m: ProjectModel) => {
            this.setSta({
                list: [...this.props.redux.list, m],
                pageType: 'table'
            })
        }} formFai={() => {
            message.error("新增失败");
        }} />)
    }
    public render() {
        return (
            <div>
                {this.loadPage()}
            </div>
        )
    }
}
export default connect(({ project }) => ({
    redux: project
}))(Projects);