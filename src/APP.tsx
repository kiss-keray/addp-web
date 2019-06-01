
import './index.css';
import * as React from 'react';
import { Switch, Route, Link, withRouter } from 'dva/router';
import { Layout, Menu, Breadcrumb, Icon, Row } from 'antd';
import { connect } from "dva";
import Index from './pages/Index';
import Projects from './pages/Projects';
import ChangeBranch from './pages/ChangeBranch';
import Page, { IPageProps } from './Page';
import Login from './pages/Login'
import cookie from 'react-cookies';
import Server from './pages/Server';
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

export interface APPReduxData {
    token?: string,
    user?: any
}
interface IProps extends IPageProps<any> {
    redux?: APPReduxData
}
const routerMap = [
    {
        path: '/',
        com: Index
    },
    {
        path: '/projects',
        com: Projects
    },
    {
        path: '/server',
        com: Server
    },
    {
        path: '/changeBranch/:projectId',
        com: ChangeBranch,
        aCom: null
    }
]
const navMap = [
    {
        name: '首页',
        hidden: false,
        key: 'index',
        defaultUrl: '/',
        start: ["/other"],
    },
    {
        name: '应用',
        hidden: false,
        defaultUrl: '/projects',
        key: 'projects',
        start: ["/projects","/changeBranch"],
    },
    {
        name: '服务器',
        hidden: false,
        defaultUrl: '/server',
        key: 'server',
        start: ['/server'],
    }
]
class App extends Page<any, IProps, APPReduxData, {
    collapsed: boolean,
    env: string
}> {
    public constructor(props: IPageProps) {
        super(props, '', 'app');
    }
    public state = {
        collapsed: true,
        env: 'test'
    }
    public getNavKey() {
        return (navMap.filter(nav => {
            let path:string = this.props.location.pathname;
            if (path === "/") {
                return 'index';
            }
            return nav.start.filter(n => path.startsWith(n)).length > 0;
        })[0] || { key: '' }).key;
    }

    private loginStatus(): boolean {
        let token = cookie.load('TOKEN');
        return token && token !== {};
    }
    public test = null
    public render() {
        console.log("app", this.props)
        if (this.props.location.pathname === '/login' || !this.loginStatus()) {
            return (
                <Switch>
                    <Route exact component={Login} />
                </Switch>
            )
        } else {
            console.log("active nav = ", this.getNavKey())
            return (
                <Layout>
                    <Header className="header">
                        <div className="logo" />
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            selectedKeys={[this.getNavKey()]}
                            style={{ lineHeight: '64px' }}
                        >
                            {
                                navMap.filter(el => !el.hidden).map(el => (
                                    <Menu.Item key={el.key}>
                                        <Link to={el.defaultUrl}>{el.name}</Link>
                                    </Menu.Item>
                                ))
                            }
                        </Menu>
                    </Header>
                    <Layout>
                        <Sider theme="dark" collapsible collapsed={this.state.collapsed} onCollapse={(collapsed) => {
                            this.setState({ collapsed })
                        }}>
                            <Menu
                                mode="inline"
                                defaultSelectedKeys={['1']}
                                defaultOpenKeys={['sub1']}
                                onClick={({ key }) => {
                                    this.setState({ env: key })
                                }}
                                style={{ height: '100%', borderRight: 0 }}
                            >
                                <SubMenu
                                    key="env"
                                    title={
                                        <span><Icon type="user" />
                                            环境</span>
                                    }
                                >
                                    <Menu.Item key="test">测试环境</Menu.Item>
                                    <Menu.Item key="pre">预发环境</Menu.Item>
                                    <Menu.Item key="pro">正式环境</Menu.Item>
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
                                {
                                    routerMap.map(rou => {
                                        return (
                                            <Route path={rou.path} exact
                                                render={(props) => {
                                                    props.location.state = {
                                                        ...props.location.state,
                                                        ...{
                                                            env: this.state.env
                                                        }
                                                    }
                                                    return <rou.com {...props} />
                                                }
                                                }
                                            />
                                        )
                                    })
                                }
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            )
        }

    }
}
export default withRouter(connect(({ app }) => ({
    redux: app
}))(App));