import Page, { IPageProps, ADDPEnv } from "../Page";
import { Steps, Button, Icon } from "antd";
import ChangeBranchModel from "./ChangeBranch";
const Step = Steps.Step;
interface IParam {
    // 发布单id
    changeId: number,
    env: ADDPEnv
}
export interface releaseBillModel {
    id?: number,
    releaseTime: string,
    member: any,
    changeBranch: ChangeBranchModel,
    releaseType: 'wait' | 'run' | 'releaseFail' | 'releaseSuccess',
    releasePhase: 'stop' | 'init' | 'pullCode' | 'build' | 'start'
}
type StepStatus = 'wait' | 'process' | 'finish' | 'error';
interface IState {
    releaseBill?: releaseBillModel,
    stepCurrent: number,
    stepStatus?: StepStatus,
    stepA: StepStatus,
    stepB: StepStatus,
    stepC: StepStatus,
}
interface IProps extends IPageProps<IParam> {
    list?: Array<releaseBillModel>
}
export default class ReleaseWork extends Page<releaseBillModel,any, IProps, IState> {
    static baseUrl = '/release';
    constructor(props: IPageProps<IParam>) {
        super(props, ReleaseWork.baseUrl);
        this.get(`${ReleaseWork.baseUrl}/selectChangeRB`, {
            changeId: props.location.state.changeId,
            env: props.location.state.env || 'test'
        }).then(releaseBill => {
            let stepStatus: StepStatus = 'wait', stepCurrent = 0;
            if (releaseBill) {
                switch (releaseBill.releaseType) {
                    case 'run': stepStatus = 'process'; break;
                    case 'releaseFail': stepStatus = 'error'; break;
                    case 'releaseSuccess': stepStatus = 'finish'; break;
                }
                switch (releaseBill.releasePhase) {
                    case 'init': stepStatus = 'wait';
                    case 'pullCode': stepCurrent = 0; break;
                    case 'build': stepCurrent = 1; break;
                    case 'stop': ;
                    case 'start': stepCurrent = 2; break;
                }
            }
            switch (stepCurrent) {
                case 0: this.setState({ stepA: stepStatus }); break;
                case 1: this.setState({ stepB: stepStatus }); break;
                case 2: this.setState({ stepC: stepStatus }); break;
            }
            this.setState({
                stepCurrent,
                stepStatus,
                releaseBill
            })
        })
    }
    public state: IState = {
        stepCurrent: 0,
        stepA: 'wait',
        stepB: 'wait',
        stepC: 'wait',
    }
    public pullCode() {
        this.setState({
            stepStatus: 'process',
            stepCurrent: 0,
            stepA: 'process'
        })
        this.get(`${ReleaseWork.baseUrl}/pullCode`, {
            changeId: this.props.location.state.changeId,
            env: this.props.location.state.env || 'test'
        }).then(r => {
            if (r.status) {
                this.setState({
                    stepStatus: 'finish',
                    releaseBill: r.model,
                    stepA: 'finish'
                })
                this.build();
            } else {
                this.setState({
                    stepA: 'error',
                    stepStatus: 'error',
                    releaseBill: r.model
                })
            }
        })
    }
    public build() {
        this.setState({
            stepStatus: 'process',
            stepCurrent: 1,
            stepB: 'process'
        })
        this.get(`${ReleaseWork.baseUrl}/build`, {
            id: this.state.releaseBill.id
        }).then(b => {
            if (b) {
                this.setState({
                    stepStatus: 'finish',
                    stepB: 'finish'
                })
                this.startApp();
            } else {
                this.setState({
                    stepStatus: 'error',
                    stepB: 'error'
                })
            }
        })
    }
    public startApp() {
        this.setState({
            stepStatus: 'process',
            stepCurrent: 2,
            stepC: 'process'
        })
        this.get(`${ReleaseWork.baseUrl}/startApp`, {
            id: this.state.releaseBill.id
        }).then(b => {
            if (b) {
                this.setState({
                    stepStatus: 'finish',
                    stepC: 'finish'
                })
            } else {
                this.setState({
                    stepStatus: 'error',
                    stepC: 'error'
                })
            }
        })
    }
    public stepClick = (status: 'run' | 'stop' | 'restart' | 'error-restart') => () => {
        if (status === 'run' || status === 'restart') {
            if (this.state.stepCurrent === 0) {
                this.pullCode();
            } else if (this.state.stepCurrent === 1) {
                this.build();
            } else if (this.state.stepCurrent === 2) {
                this.startApp()
            }
        } else if (status === 'error-restart'){
            this.pullCode();
        }
    }
    public stepButton = (index: number) => {
        if (index != this.state.stepCurrent) {
            return <span></span>
        }
        if (this.state.stepStatus == 'wait') {
            return <Button type="primary" onClick={this.stepClick('run')}>运行</Button>
        }
        if (this.state.stepStatus == 'process') {
            return <Button type="primary" onClick={this.stepClick('stop')}>停止</Button>
        }
        if (this.state.stepStatus == 'error') {
            return <Button type="primary" onClick={this.stepClick('error-restart')}>重试</Button>
        }
        if (this.state.stepStatus == 'finish') {
            return <Button type="primary" onClick={this.stepClick('restart')}>重启</Button>
        }
    }
    public stepIcon = (status: StepStatus): string => {
        switch (status) {
            case 'wait': return 'clock-circle';
            case 'process': return 'loading';
            case 'finish': return 'smile-o';
            case 'error': return 'frown';
        }
    }
    public render() {
        return (
            <Steps current={this.state.stepCurrent} status={this.state.stepStatus}>
                <Step title="更新" icon={<Icon type={this.stepIcon(this.state.stepA)}
                    theme={this.state.stepStatus === "process" ? "outlined" : "twoTone"} />} description=
                    {
                        (<div>
                            {this.stepButton(0)}
                            {this.state.stepStatus === 'process' ? '' : <Button onClick={this.pullCode.bind(this)}>重新部署</Button>}
                        </div>)
                    } />
                <Step title="构建" icon={<Icon type={this.stepIcon(this.state.stepB)}
                    theme={this.state.stepStatus === "process" ? "outlined" : "twoTone"} />} description=
                    {
                        this.stepButton(1)
                    } />
                <Step title="启动" icon={<Icon type={this.stepIcon(this.state.stepC)}
                    theme={this.state.stepStatus === "process" ? "outlined" : "twoTone"} />} description=
                    {
                        this.stepButton(2)
                    } />
            </Steps>

        );
    }
}