
import './index.css';
import * as React from 'react';
import { Router, Switch, Route, Link } from 'dva/router';
import { Provider } from './redux/store'
import { Layout, Menu, Breadcrumb, Icon } from 'antd';
import Index from './pages/Index';
import Projects from './pages/Projects';
import Services from './pages/server';
import ChangeBranch from './pages/ChangeBranch';
import ReleaseWork from './pages/ReleaseWork';
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
class App extends React.Component {
    state = {
        env:String
    }
    config = {
        top: [
            {
                name: '首页',
                hidden: false,
                key: 'index',
                defaultUrl: '/'
            },
            {
                name: '应用',
                hidden: false,
                defaultUrl: '/projects/test',
                key: 'projects'
            },
            {
                name: '服务器',
                hidden: false,
                defaultUrl: '/services/test',
                key: 'services'
            },
            {
                name: '变更',
                hidden: false,
                defaultUrl: '/project/change',
                key: 'changeBranch'
            }
        ]
    }
    render() {
        return (
            <Layout>
                <Header className="header">
                    <div className="logo" />
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={[this.config.top[0].key]}
                        style={{ lineHeight: '64px' }}
                    >
                        {
                            this.config.top.filter(el => !el.hidden).map(el => (
                                <Menu.Item key={el.key}>
                                    <Link to={el.defaultUrl}>{el.name}</Link>
                                </Menu.Item>
                            ))
                        }
                    </Menu>
                </Header>
                <Layout>
                    <Sider width={200} style={{ background: '#fff' }}>
                        <Menu
                            mode="inline"
                            defaultSelectedKeys={['1']}
                            defaultOpenKeys={['sub1']}
                            style={{ height: '100%', borderRight: 0 }}
                        >
                            <SubMenu
                                key="sub1"
                                title={
                                    <span><Icon type="user" />
                                        环境</span>
                                }
                            >
                                <Menu.Item key="1">测试环境</Menu.Item>
                                <Menu.Item key="2">预发环境</Menu.Item>
                                <Menu.Item key="3">正式环境</Menu.Item>
                            </SubMenu>
                        </Menu>
                    </Sider>
                    <Layout style={{ padding: '0 24px 24px' }}>
                        <Breadcrumb style={{ margin: '16px 0' }}>
                            <Breadcrumb.Item>服务器</Breadcrumb.Item>
                            <Breadcrumb.Item>列表</Breadcrumb.Item>
                            <Breadcrumb.Item>详情</Breadcrumb.Item>
                        </Breadcrumb>
                        <Content
                            style={{
                                background: '#fff',
                                padding: 24,
                                margin: 0,
                                minHeight: 280,
                            }}
                        >
                            <Switch>
                                <Route path="/" exact component={Index} />
                            </Switch>
                            <Switch>
                                <Route path="/projects/:env" exact component={Projects} />
                            </Switch>
                            <Switch>
                                <Route path="/services/:env" exact component={Services} />
                            </Switch>
                            <Switch>
                                <Route path="/project/change" exact component={ChangeBranch} />
                            </Switch>
                            <Switch>
                                <Route path="/change/work/:changeId" exact component={ReleaseWork} />
                            </Switch>
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        )
    }
}
function RouterConfig({ history }) {
    return (
        <Provider>
            <Router history={history}>
                <Switch>
                    <Route path="*" component={App} />
                </Switch>
            </Router>
        </Provider>
    )
}
export default RouterConfig;