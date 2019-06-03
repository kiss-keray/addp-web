import * as React from 'react';
require('../index.css');
import { Button, Pagination } from 'antd';
import { connect } from 'dva';
import Page, { IPageProps, ADDPEnv, PageType, TablePageState, TablePageProps, TablePageRedux, TableFormProps } from '../Page';
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

const { Option } = Select;
const { Column } = Table;
export interface ServerModel {
    id?: number,
    ip?: string,
    port?: number,
    username?: string,
    environment?: 'test' | 'pre' | 'pro' | 'bak',
    allowRestart?: string
}
const baseUrl = '/server';
interface IFormProps extends FormComponentProps, TableFormProps<ServerModel, ServerReduxData> {
    form: any
}

interface IParam {
}
interface IProps extends TablePageProps<ServerModel, ServerReduxData, IParam> {
    env: ADDPEnv
}
export interface ServerReduxData extends TablePageRedux<ServerModel> {

}
/**
 * 
 * 服务器管理表单
 */
class CServerForm extends IComp<ServerModel, any, IFormProps> {
    constructor(props: IFormProps) {
        super(props, baseUrl, "server");
    }
    componentDidMount() {
        this.props.form.setFieldsValue({
            ...this.props.model
        })
    }
    handleSubmit = (e: any) => {
        let success = () => {
            if (this.props.formType === "add") {
                this.save(this.props.form.getFieldsValue())
                    .then(r => {
                        this.setSta({
                            pageType: 'table'
                        })
                    })
                    .catch(e => {
                        this.props.formFai && this.props.formFai(e);
                    })
            } else if (this.props.formType === "edit") {
                this.update(this.props.form.getFieldsValue())
                    .then(r => {
                        this.setSta({
                            pageType: 'table'
                        })
                    }).catch(e => {
                        this.props.formFai && this.props.formFai(e);
                    })
            }
        }
        // this.props.form.validateFields((errors, values) => {
        //     if (!errors) {
        //         success();
        //     }
        // });
        success();
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} onSubmit={this.handleSubmit}>
                <Form.Item>
                    {getFieldDecorator('id', {})}
                </Form.Item>
                <Form.Item label="IP">
                    {getFieldDecorator('ip', {
                        rules: [
                            { required: true, message: '错误的IP', pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/ }
                        ],
                    })(<Input />)}
                </Form.Item>
                <Form.Item label="端口">
                    {getFieldDecorator('port', {
                        initialValue: 22,
                        rules: [
                            { required: false }
                        ],
                    })(<Input />)}
                </Form.Item>
                <Form.Item label="用户名">
                    {getFieldDecorator('username', {})(<Input />)}
                </Form.Item>
                <Form.Item label="密码">
                    {getFieldDecorator('password', {})(<Input />)}
                </Form.Item>

                <Form.Item label="sshKey">
                    {getFieldDecorator('sshKey', {})(<Input />)}
                </Form.Item>


                <Form.Item label="环境">
                    {getFieldDecorator('environment', {
                        rules: [{ required: true, message: '选择环境' }],
                        initialValue: 'test'
                    })(
                        <Select>
                            <Option value="test">日常/测试环境</Option>
                            <Option value="pre">预发环境</Option>
                            <Option value="pro">正式环境</Option>
                        </Select>,
                    )}
                </Form.Item>
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
            </Form >
        );
    }
}
const ServerForm = Form.create<IFormProps>()(
    connect(({ server }) => ({ redux: server }))(CServerForm)
);
interface IState extends TablePageState {
    selectModel?: ServerModel,
    selectIds?: Array<number>
}
class Server extends Page<ServerModel, ServerReduxData, IProps, IState> {
    public constructor(props: IProps) {
        super(props, baseUrl, "server");
        this.loadTableData();
        this.setSta({
            pageType: 'table'
        })
    }

    public state: IState = {
        selectModel: {},
        selectIds: [],
        pageNumber: 0,
        pageSize: 10
    }
    
    componentWillMount() {
        this.dispatch({
            type: "app/updateState",
            data: {
                siderShow: true
            },
            owner: false
        })
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
    public loadTableData() {
        this.basePage({
            pageNumber: this.state.pageNumber,
            pageSize: this.state.pageSize
        }, { env: this.props.env })
            .then(page => {
                this.setState({
                    total: page.totalElements
                })
                this.dispatch({
                    type: 'list',
                    data: page.content
                })
            })
    }
    watch = {
        "env": (env:ADDPEnv) => {
            this.loadTableData();
            this.setSta({
                pageType: "table"
            })
        },
        "redux.pageType": (pageType:PageType) => {
            if (pageType === "table") {
                this.loadTableData();
            }
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
                <Table dataSource={this.props.redux.list} bordered rowSelection={this.rowSelection}>
                    <Column title="id" dataIndex="id" key="id" />
                    <Column title="IP" dataIndex="ip" key="ip" />
                    <Column title="端口" dataIndex="port" key="port" />
                    <Column title="用户名" dataIndex="username" key="username" />
                    <Column title="密码" dataIndex="password" key="password" />
                    <Column title="SSHKey" dataIndex="sshKey" key="sshKey" />
                    <Column
                        align='center'
                        title="环境"
                        dataIndex="environment"
                        key="environment"
                        render={environment => {
                            let tag: {
                                color: string,
                                name: string
                            }
                            switch (environment) {
                                case 'test':
                                    tag = {
                                        color: '#87d068',
                                        name: '日常环境'
                                    }; break;
                                case 'pre':
                                    tag = {
                                        color: '#2db7f5',
                                        name: '预发环境'
                                    }; break;
                                case 'pro':
                                    tag = {
                                        color: '#f50',
                                        name: '正式环境'
                                    }; break;
                                case 'bak':
                                    tag = {
                                        color: '#f50',
                                        name: '备份环境'
                                    }; break;
                            }
                            return (
                                <Tag color={tag.color}>{tag.name}</Tag>
                            )
                        }}
                    />
                    <Column
                        align='center'
                        title="发布状态"
                        dataIndex="allowRestart"
                        key="allowRestart"
                        render={allowRestart => (
                            <Tag color={allowRestart ? '#87d068' : '#dcdcdc'}>允许发布</Tag>
                        )}
                    />
                    <Column
                        align='center'
                        title="操作"
                        key="action"
                        render={(text, record: ServerModel) => (
                            <Button onClick={() => {
                                this.setState({
                                    selectModel: record,
                                });
                                this.setSta({
                                    pageType: "edit-form"
                                })
                            }}>编辑</Button>
                        )}
                    />
                </Table>

                <Pagination
                    showSizeChanger
                    pageSize={this.state.pageSize}
                    current={this.state.pageNumber}
                    total={this.state.total}
                    onChange={(pageNumber: number, pageSize: number) => {
                        this.setState({
                            pageSize,
                            pageNumber
                        })
                        this.loadTable();
                    }}
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
    public loadServerEditForm = (model: ServerModel) => {
        return (<ServerForm formType='edit' model={model} />)
    }
    public loadServerAddForm() {
        return (<ServerForm formType='add' />)
    }
    public render() {
        return (
            <div>
                {this.loadPage()}
            </div>
        )
    }
}

export default connect(({ server }) => ({
    redux: server,
}))(Server)