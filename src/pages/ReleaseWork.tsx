import Page, { IPageProps, ADDPEnv } from "../Page";
import { Steps, Button, Icon } from "antd";
import { ChangeBranchModel, ChangeReduxData } from "./ChangeBranch";
import IComp from "../IComp";
import { connect } from "dva";
import { ThemeType } from "antd/lib/icon";
const Step = Steps.Step;
export interface ReleaseBillModel {
    id?: number,
    releaseTime?: string,
    member?: any,
    changeBranchModel?: ChangeBranchModel,
    releaseType?: 'wait' | 'run' | 'releaseFail' | 'releaseSuccess',
    releasePhase?: 'stop' | 'init' | 'pullCode' | 'build' | 'start',
    changeBranchId?: number
}
type StepStatus = 'wait' | 'process' | 'finish' | 'error';
interface IState {
    releaseBill?: ReleaseBillModel,
    stepCurrent: number,
    stepStatus?: StepStatus,
    stepA: StepStatus,
    stepB: StepStatus,
    stepC: StepStatus,
    changeId?: number
}
interface IProps {
    env?: ADDPEnv,
    projectId: number,
    redux?: ChangeReduxData
}
const baseUrl = '/release'
export class ReleaseWork extends IComp<ReleaseBillModel, ChangeReduxData, IProps, IState> {
    constructor(props: IProps) {
        super(props, baseUrl, "change");
    }
    getBillStatusInterval;
    componentWillMount() {
        this.init();
    }
    componentWillUnmount() {
        clearInterval(this.getBillStatusInterval)
    }
    public state: IState = {
        stepCurrent: 0,
        stepA: 'wait',
        stepB: 'wait',
        stepC: 'wait',
        releaseBill: {}
    }
    public init() {
        this.get(`${baseUrl}/projectBill/${this.props.env}`, {
            projectId: this.props.projectId
        }).then((releaseBill: ReleaseBillModel) => {
            if (releaseBill) {
                this.setStep(releaseBill)
                this.setSta({
                    nowWork: releaseBill
                })
            }
        })
    }
    public statusInterval(time: number) {
        clearInterval(this.getBillStatusInterval)
        this.getBillStatusInterval = setInterval(() => {
            this.getBillStatus();
        }, time);
    }
    private getBillStatus() {
        if (this.state.releaseBill.id) {
            this.get(`${baseUrl}/status`, {
                id: this.state.releaseBill.id
            }).then((b: ReleaseBillModel) => {
                if (b &&
                    (b.releasePhase != this.state.releaseBill.releasePhase ||
                        b.releaseType != this.state.releaseBill.releaseType)) {
                    this.setSta({
                        nowWork: b
                    })
                    this.setStep(b);
                }
            })
        }
    }
    private setStep(releaseBill: ReleaseBillModel) {
        let stepStatus: StepStatus = 'wait', stepCurrent = 0;
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
    }
    watch = {
        "releaseBill":({releaseBill}) => {
            if (releaseBill.releaseType !== "releaseFail") {
                if (releaseBill.releasePhase !== "start" && releaseBill.releaseType !== "releaseSuccess") {
                    this.statusInterval(500);
                } else {
                    this.statusInterval(5000);
                }
            } else {
                this.statusInterval(5000);
            }
        }
    }
    public autoRelease(billId?: number) {
        this.get(`${baseUrl}/autoRelease`, {
            id: billId || this.state.releaseBill.id
        }).then(r => {
            this.setState({
                stepStatus: 'process',
                stepCurrent: 0,
                stepA: 'process',
                releaseBill: r
            })
        })
    }
    public pullCode(changeId: number) {
        this.setSta({
            nowWork: {
                releasePhase: 'init',
                changeBranchId: changeId
            }
        })
        this.setState({
            stepStatus: 'process',
            stepCurrent: 0,
            stepA: 'process',
            changeId
        })
        this.get(`${baseUrl}/pullCode`, {
            changeId,
            env: this.props.env || 'test'
        }).then((b: {
            status: boolean,
            bill: ReleaseBillModel
        }) => {
            if (b.status) {
                this.setState({
                    stepStatus: 'finish',
                    releaseBill: b.bill,
                    stepA: 'finish'
                })
                this.setSta({
                    nowWork: b.bill
                })
                this.build();
            } else {
                this.setState({
                    stepA: 'error',
                    stepStatus: 'error',
                    releaseBill: b.bill
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
        this.get(`${baseUrl}/build`, {
            id: this.state.releaseBill.id,
            changeId: this.state.changeId,
        }).then(
            (b: {
                status: boolean,
                bill: ReleaseBillModel
            }) => {
                if (b.status) {
                    this.setState({
                        stepStatus: 'finish',
                        stepB: 'finish',
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
        this.get(`${baseUrl}/startApp`, {
            id: this.state.releaseBill.id
        }).then((b: {
            status: boolean,
            bill: ReleaseBillModel
        }) => {
            if (b.status) {
                this.setState({
                    stepStatus: 'finish',
                    stepC: 'finish',
                })
                this.setSta({
                    nowWork: b.bill,
                    list: this.props.redux.list.map(l => l.id === b.bill.changeBranchId ? b.bill : l)
                })
            } else {
                this.setState({
                    stepStatus: 'error',
                    stepC: 'error'
                })
            }
        })
    }
    public stop() {
        this.get(`${baseUrl}/down`, {
            id: this.state.releaseBill.id
        }).then((b: {
            status: boolean,
            bill: ReleaseBillModel
        }) => {
            if (b.status) {
                this.init();
                this.setSta({
                    list: this.props.redux.list.map(l => l.id === b.bill.changeBranchId ? b.bill : l)
                })
            }
        })
    }
    public stepClick = (status: 'run' | 'stop' | 'restart' | 'error-restart') => () => {
        if (status === 'run' || status === 'restart') {
            if (this.state.stepCurrent === 0) {
                this.pullCode(this.state.changeId);
            } else if (this.state.stepCurrent === 1) {
                this.build();
            } else if (this.state.stepCurrent === 2) {
                this.startApp()
            }
        } else if (status === 'error-restart') {
            this.pullCode(this.state.changeId);
        }
    }
    public stepButton = (index: number) => {
        if (index != this.state.stepCurrent || !this.state.changeId) {
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
    public stepIcon = (index: number, status: StepStatus): {
        type: string,
        theme?: ThemeType
    } => {
        if (this.state.stepCurrent > index) {
            return {
                type: "smile-o",
                theme: 'filled'
            };
        }
        switch (status) {
            case 'wait': return {
                type: 'clock-circle',
                theme: 'filled'
            };
            case 'process': return {
                type: 'loading',
                theme: 'outlined'
            };
            case 'finish': return {
                type: 'smile-o',
                theme: 'filled'
            };
            case 'error': return {
                type: 'frown'
            };
        }
    }
    public render() {
        return (
            <div>
                <Steps current={this.state.stepCurrent} status={this.state.stepStatus}>
                    <Step title="更新" icon={<Icon type={this.stepIcon(0, this.state.stepA).type}
                        theme={this.stepIcon(0, this.state.stepA).theme} />} description=
                        {
                            (<div>
                                {this.stepButton(0)}
                            </div>)
                        } />
                    <Step title="构建" icon={<Icon type={this.stepIcon(1, this.state.stepB).type}
                        theme={this.stepIcon(1, this.state.stepB).theme} />} description=
                        {
                            this.stepButton(1)
                        } />
                    <Step title="启动" icon={<Icon type={this.stepIcon(2, this.state.stepC).type}
                        theme={this.stepIcon(2, this.state.stepC).theme} />} description=
                        {
                            this.stepButton(2)
                        } />
                </Steps>
                <div className="xy-center">
                    运行中的变更（{this.state.releaseBill.changeBranchModel ? this.state.releaseBill.changeBranchModel.name : '----无'}）
                </div>
            </div>

        );
    }
}
export const CReleaseWork = connect(({ change }) => ({
    redux: change
}), undefined, undefined, {
        withRef: true
    })(ReleaseWork);