import * as React from 'react';
import '../index.css'
import { store } from '../redux/store'
import { Button } from 'antd';
import Page, { IPageProps } from '../Page';
import { Table, Divider, Tag } from 'antd';
const { Column } = Table;
interface IParam {
    env:'test'
}
class Services extends Page<IParam> {
    public constructor(props: IPageProps<IParam>) {
        super(props,'server');
        let env = this.props.match.params.env;
        this.api.basePage({
            pageNumber: 0,
            pageSize: 10
        },{
            env
        }).then(list => {
            console.log(list); 
            // this.setState({
            //     list
            // })
        })
    }
    public state = {
        list: [
            {
                key: '1',
                firstName: 'John',
                lastName: 'Brown',
                age: 32,
                address: 'New York No. 1 Lake Park',
                tags: ['nice', 'developer'],
            },
            {
                key: '2',
                firstName: 'Jim',
                lastName: 'Green',
                age: 42,
                address: 'London No. 1 Lake Park',
                tags: ['loser'],
            },
            {
                key: '3',
                firstName: 'Joe',
                lastName: 'Black',
                age: 32,
                address: 'Sidney No. 1 Lake Park',
                tags: ['cool', 'teacher'],
            }
        ]
    }
    public render() {
        return (
            <Table dataSource={this.state.list}>
                <Column title="First Name" dataIndex="firstName" key="firstName" />
                <Column title="Last Name" dataIndex="lastName" key="lastName" />
                <Column title="Age" dataIndex="age" key="age" />
                <Column title="Address" dataIndex="address" key="address" />
                <Column
                    title="Tags"
                    dataIndex="tags"
                    key="tags"
                    render={tags => (
                        <span>
                            {tags.map(tag => (
                                <Tag color="blue" key={tag}>
                                    {tag}
                                </Tag>
                            ))}
                        </span>
                    )}
                />
                <Column
                    title="Action"
                    key="action"
                    render={(text, record:{
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