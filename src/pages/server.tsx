import * as React from 'react';
import '../index.css'
import { store } from '../redux/store'
import { Button } from 'antd';
import Page, { IPageProps, ADDPEnv } from '../Page';
import { Table, Divider, Tag } from 'antd';
const { Column } = Table;
interface IParam {
    env: ADDPEnv
}
export interface ServerModel {
    id?:number,
    ip: string,
    port: number,
    username?: string,
    environment: 'test' | 'pre' | 'pro' | 'bak',
    allowRestart?: string
}
class Services extends Page<ServerModel,IParam> {
    public constructor(props: IPageProps<IParam>) {
        super(props, 'server');
        let env = this.props.match.params.env;
        this.basePage({
            pageNumber: 0,
            pageSize: 10
        }, {
                env
            }).then(list => {
                console.log(list);
                this.setState({
                    list: list.content
                })
            })
    }
    public state = {
        list: []
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
    public render() {
        return (
            <Table dataSource={this.state.list} bordered rowSelection={this.rowSelection}>
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
        )
    }
}
export default Services;