import * as React from 'react';
require('../index.css');
import { store } from '../redux/store'
import { Button } from 'antd';
import { connect } from 'dva';
import Page, { IPageProps, ADDPEnv, PageType } from '../Page';
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
import IC from '../IComp';
import IComp from '../IComp';

const { Option } = Select;
const AutoCompleteOption = AutoComplete.Option;
const { Column } = Table;
export interface ServerModel {
    id?: number,
    ip: string,
    port: number,
    username?: string,
    environment: 'test' | 'pre' | 'pro' | 'bak',
    allowRestart?: string
}
const baseUrl = 'server';
interface IFormProps extends FormComponentProps {
    form: any
    formType: 'add' | 'edit',
    formSu?: (model: ServerModel) => {},
    formFai?: (model: ServerModel) => {}
}

interface IParam {
    env: ADDPEnv
}
interface IProps extends IPageProps<IParam> {
    redux?: ServerReduxData
}
export interface ServerReduxData {
    list: Array<ServerModel>,
    pageType: PageType
}
/**
 * 
 * 服务器管理表单
 */
class CServerForm extends IComp<ServerModel, IFormProps> {
    constructor(props: any) {
        super(props, baseUrl);
    }
    handleSubmit = (e: any) => {
        this.props.form.validateFields(err => {
            if (!err) {
                console.info('success');
            }
        });
        if (this.props.formType === "add") {
            this.save(this.props.form.getFieldsValue())
                .then(this.props.formSu)
                .catch(e => {
                    this.props.formFai && this.props.formFai(e);
                })
        } else if (this.props.formType === "edit") {
            this.update(this.props.form.getFieldsValue())
                .then(r => {
                    if (r) {
                        this.props.formSu && this.props.formSu(e);
                    } else {
                        this.props.formFai && this.props.formFai(e);
                    }
                })
                .catch(e => {
                    this.props.formFai && this.props.formFai(e);
                })
        }
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} onSubmit={this.handleSubmit}>
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
                            { required: false, validator: (r, v) => v < 65536 && v > 0 }
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
                            <Option value="pre">正式环境</Option>
                        </Select>,
                    )}
                </Form.Item>
                <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
                    <Button type="primary" htmlType="submit">
                        保存
              </Button>
                </Form.Item>
            </Form>
        );
    }
}
const ServerForm = Form.create<IFormProps>()(
    connect(({ server }) => ({ redux: server }))(CServerForm)
);
interface IState {
    pageType: PageType
}
class Server extends Page<ServerModel, IProps, IState> {
    public constructor(props: IProps) {
        super(props, baseUrl,"server");
        let env = this.props.match.params.env;
        this.basePage({
            pageNumber: 0,
            pageSize: 10
        }, { env })
            .then(list => {
               this.dispatch({
                type: 'list',
                data: list.content
               })
            })
        console.log("server", this.props)
    }
    public state: IState = {
        pageType: 'table'
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
                <Table dataSource={this.props.redux.list} bordered rowSelection={this.rowSelection}>
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
                        render={(text, record: {
                            lastName: String
                        }) => (
                                <span>
                                    <a href="javascript:;">Invite {record.lastName}</a>
                                    <Divider type="vertical" />
                                    <a href="javascript:;">Delete</a>
                                </span>
                            )}
                    />
                </Table>
            </div>
        )
    }
    public loadPage(): React.ReactNode {
        switch (this.props.redux.pageType) {
            case 'table': return this.loadTable();
            case 'add-form': return this.loadServerAddForm();
            case 'edit-form': return this.loadServerAddForm();
        }
    }
    public loadServerEditForm() {
        return (<ServerForm formType='edit' />)
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
    redux:server,
}))(Server)