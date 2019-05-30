import * as React from 'react';
import Page, { IPageProps } from '../Page';
import { APPReduxData } from '../APP';
import { connect } from 'dva';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
import cookie from 'react-cookies'
interface IProps extends IPageProps<any> {
    redux?: APPReduxData
}
class Login extends Page<any, APPReduxData,IProps> {
    public constructor(props: IPageProps) {
        super(props, '', 'app');
    }
    handleSubmit = e => {
        this.props.form.validateFields(err => {
            if (!err) {
                this.login();
            }
        });

    };
    login() {
        let md5 = require('md5');
        this.post("/member/login", {
            ...this.props.form.getFieldsValue(),
            password: md5(this.props.form.getFieldValue("password")).toUpperCase()
        }).then(result => {
            cookie.save("TOKEN",result.token,{
                expires: new Date(new Date().getTime() + 1000*60*60*24*7)
            });
            this.setSta({
                user: result.member
            })
            this.directional();
        }).catch(error => {
            message.error('登录失败');
        });

    }
    private loginStatus(): boolean {
        let token = cookie.load('TOKEN');
        return token && token !== {};
    }
    private directional() {
        console.log("login",this.props.history)
        if (this.props.history.action == 'POP') {
            this.props.history.push("/")
        } else {
            this.props.history.goBack(-1);
        }
    }
    render() {
        if (this.loginStatus()) {
            this.directional();
            return <div/>
        }
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <div className="login-box">
                    <Form onSubmit={this.handleSubmit} className="login-form">
                        <Form.Item>
                            {getFieldDecorator('username', {
                                rules: [{ required: true, message: 'Please input your username!' }],
                            })(
                                <Input
                                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="Username"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: 'Please input your Password!' }],
                            })(
                                <Input
                                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    type="password"
                                    placeholder="Password"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true,
                            })(<Checkbox>Remember me</Checkbox>)}
                            <Button type="primary" htmlType="submit" className="login-form-button">
                                登录
                    </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        );
    }
}
export default Form.create()(
    connect(({ app }) => ({
        redux: app
    }))(Login)
);