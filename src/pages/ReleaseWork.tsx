import Page, { IPageProps, ADDPEnv } from "../Page";
import { Steps, Button, Icon, Modal, DatePicker, message, Table, Tag } from "antd";
import { ChangeBranchModel, ChangeReduxData } from "./ChangeBranch";
import IComp from "../IComp";
import { connect } from "dva";
import { ThemeType } from "antd/lib/icon";
import moment = require("moment");
import { ServerModel } from "./Server";
import { ReactNode } from "react";
const Step = Steps.Step;
export interface ReleaseServerStatus {
    releaseBillModel?: ReleaseBillModel,
    serverModel?: ServerModel,
    releasePhase?: 'pullCode' | 'build' | 'start',
    releaseType?: 'wait' | 'run' | 'releaseFail' | 'releaseSuccess' | "stop",
    oneTime?: number,
    twoTime?: number,
    threeTime?: number
}
export interface ReleaseBillModel {
    id?: number,
    releaseTime?: string,
    member?: any,
    changeBranchModel?: ChangeBranchModel,
    releaseType?: 'wait' | 'run' | 'releaseFail' | 'releaseSuccess' | "stop",
    releasePhase?: 'stop' | 'init' | 'pullCode' | 'build' | 'start',
    changeBranchId?: number,
    releaseServerStatusModels?: Array<ReleaseServerStatus>,
    environment?:ADDPEnv
}
type StepStatus = 'wait' | 'process' | 'finish' | 'error';
interface IState {
    releaseBill?: ReleaseBillModel,
    stepCurrent: number,
    stepStatus?: StepStatus,
    changeId?: number,
    workChangeName?: string,
    proSubmitModeVisible?: boolean,
    releseTimeDatePicker?: 'time',
    releaseTimeStr?: string,
}
interface IProps {
    env?: ADDPEnv,
    projectId: number,
    redux?: ChangeReduxData,
    branchStatus?: boolean
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
        releaseBill: {}
    }
    public init() {
        this.get(`${baseUrl}/projectBill/${this.props.env}`, {
            projectId: this.props.projectId
        }).then((releaseBill: ReleaseBillModel) => {
            if (releaseBill) {
                this.setSta({
                    nowWork: releaseBill
                })
                this.setState({
                    workChangeName: releaseBill.changeBranchModel.name
                })
            } else {
                this.setState({
                    workChangeName: "---无"
                })
                this.setSta({
                    nowWork: {}
                })
            }
            this.setStep(releaseBill || {})
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
                if (!this.state.releaseBill.id || this.props.env !== b.environment) {
                    return;
                }
                if (b && b.releasePhase === 'init') {
                    this.setState({
                        releaseBill: {},
                        workChangeName: "---无"
                    })
                    this.setSta({
                        nowWork: {}
                    })
                    return;
                }
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
            case 'stop': stepStatus = 'wait'; break;
        }
        switch (releaseBill.releasePhase) {
            case 'pullCode': stepCurrent = 0; break;
            case 'build': stepCurrent = 1; break;
            case 'start': stepCurrent = 2; break;
        }
        this.setState({
            stepCurrent,
            stepStatus,
            releaseBill
        })
    }
    watch = {
        "releaseBill": (releaseBill) => {
            console.log("watch releaseBill--------", releaseBill)
            if (!releaseBill.releasePhase || releaseBill.releasePhase === "init") {
                return;
            }
            if (releaseBill.releaseType !== "releaseFail") {
                if (!(releaseBill.releasePhase === "start" && releaseBill.releaseType === "releaseSuccess")) {
                    this.statusInterval(1000);
                } else {
                    this.statusInterval(5000);
                }
            } else {
                this.statusInterval(5000);
            }
        },
        "env": (env) => {
            console.log("watch env------", env);
            this.init();
        }
    }
    public autoRelease(billId?: number) {
        this.get(`${baseUrl}/autoRelease`, {
            id: billId || this.state.releaseBill.id
        }).then((r: ReleaseBillModel) => {
            this.setSta({
                nowWork: r
            })
            this.setState({
                stepStatus: 'process',
                stepCurrent: 0,
                releaseBill: r,
                workChangeName: r.changeBranchModel.name
            })
        })
    }
    public submitProStart() {
        this.get(`${baseUrl}/proStart`, {
            id: this.state.releaseBill.id,
            [this.state.releaseTimeStr ? 'startTime' : 'null']: this.state.releaseTimeStr
        }).then(r => {
            message.success("提交发布成功")
        }).catch(e => {
            message.error("提交发布失败")
        })
        this.setState({
            proSubmitModeVisible: false
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
                this.setSta({
                    list: this.props.redux.list.map(l => l.id === b.bill.changeBranchId ? b.bill : l)
                })
            }
        })
    }
    public stepClick = (status: 'stop' | 'restart' | 'error-restart' | 'continue', serverId?: number) => () => {
        if (status === 'restart') {
            if (this.state.stepCurrent === 0) {
                this.autoRelease();
            } else if (this.state.stepCurrent === 1) {
                this.autoRelease();
            } else if (this.state.stepCurrent === 2) {
                this.autoRelease();
            }
        } else if (status === 'error-restart') {
            this.autoRelease();
        } else if (status === "continue") {
            this.submitProStart();
        }
    }
    public stepButton = (index: number, stepCurrent?: number, releaseType?: string, serverId?: number) => {
        stepCurrent = stepCurrent ? stepCurrent : this.state.stepCurrent;
        if (index != stepCurrent || !this.state.releaseBill.id) {
            return <span></span>
        }
        releaseType = releaseType ? releaseType : this.state.releaseBill.releaseType
        // 线上发布构建完成，显示提交发布单
        if (releaseType === "releaseSuccess" && this.state.releaseBill.releasePhase === "build" && this.props.env === "pro" && !serverId
        && !this.state.releaseBill.releaseTime
        ) {
            return <Button type="danger" onClick={() => {
                this.setState({
                    proSubmitModeVisible: true
                })
            }}>提交发布</Button>
        }
        
        if (releaseType === "releaseSuccess" && stepCurrent === 1 && this.props.env === "pro") {
            return <Tag color="#f50">等待定时任务</Tag>
        }
        if (releaseType === "wait" && stepCurrent === 2 && this.props.env === "pro") {
            return <Tag color="#f50">等待定时任务</Tag>
        }
        if (releaseType === 'run' && !serverId) {
            return <Button type="primary" onClick={this.stepClick('stop', serverId)}>停止</Button>
        }
        if (releaseType === "releaseFail") {
            return <Button type="primary" onClick={this.stepClick('error-restart', serverId)}>重试</Button>
        }
        if (releaseType === "releaseSuccess") {
            return <Button type="primary" onClick={this.stepClick('restart', serverId)}>重启</Button>
        }
        if (releaseType === "stop" && !serverId) {
            return <Button type="primary" onClick={this.stepClick('continue')}>继续</Button>
        }
    }
    public stepIcon = (index: number, stepCurrent?: number, type?: string): ReactNode => {
        stepCurrent = stepCurrent ? stepCurrent : this.state.stepCurrent;
        type = type ? type : this.state.releaseBill.releaseType;
        let icon = (): {
            type: string,
            theme?: ThemeType,
            twoToneColor?: string
        } => {
            if (stepCurrent > index) {
                return {
                    type: "smile-o",
                    theme: 'filled'
                };
            }
            else if (stepCurrent < index) {
                return {
                    type: "clock-circle",
                    theme: 'filled'
                };
            }
            else {
                switch (type) {
                    case 'wait': return {
                        type: 'clock-circle',
                        theme: 'filled'
                    };
                    case 'run': return {
                        type: 'loading',
                        theme: 'outlined'
                    };
                    case 'releaseSuccess': return {
                        type: 'smile-o',
                        theme: 'filled',
                        twoToneColor: '#52c41a'
                    };
                    case 'releaseFail': return {
                        type: 'frown'
                    };
                    case 'stop': return {
                        type: 'sync',
                        twoToneColor: '#52c41a'
                    }
                    default: return {
                        type: 'clock-circle',
                        theme: 'filled'
                    }
                }
            }
        }
        let data = icon();
        return (
            <Icon
                type={data.type}
                theme={data.theme}
                twoToneColor={data.twoToneColor}
            />
        )
    }
    public render() {
        return (
            <div>
                {
                    this.props.branchStatus ? (<div style={{ color: 'red', marginBottom: "1rem" }} className="xy-center">代码有变更，请重新部署</div>) : <div></div>
                }
                <Steps current={this.state.stepCurrent} status={this.state.stepStatus}>
                    <Step title="更新" icon={this.stepIcon(0)} description=
                        {
                            this.stepButton(0)
                        } />
                    <Step title="构建" icon={this.stepIcon(1)} description=
                        {
                            this.stepButton(1)
                        } />
                    <Step title="启动" icon={this.stepIcon(2)} description=
                        {
                            this.stepButton(2)
                        } />
                </Steps>
                <div className="xy-center">
                    运行中的变更（<span style={{ color: 'red' }}>{this.state.workChangeName}</span>）
                    |
                    启动时间:{this.state.releaseBill.releaseTime}
                </div>
                <div className="server-status">
                    <Table dataSource={this.state.releaseBill.releaseServerStatusModels} bordered pagination={false}>
                        <Table.Column title="IP" dataIndex="serverModel.ip" key="ip" />
                        <Table.Column title="阶段" render={(text, record: ReleaseServerStatus, index) => {
                            switch (record.releasePhase) {
                                case "pullCode": return (<div>更新代码</div>)
                                case "build": return (<div>构建jar</div>)
                                case "start": return (<div>docker启动</div>)
                            }
                        }}
                            key="releasePhase" />
                        <Table.Column title="状态"
                            render={(text, record: ReleaseServerStatus, index) => {
                                switch (record.releaseType) {
                                    case "wait": return (<div>等待</div>)
                                    case "run": return (<div>运行中</div>)
                                    case "releaseSuccess": return (<div>执行成功</div>)
                                    case "releaseFail": return (<div>执行失败</div>)
                                }
                            }}
                            key="releaseType" />
                        <Table.Column title="进度" key="step" render={(text, record: ReleaseServerStatus, index) => {
                            return (
                                <Steps current={
                                    record.releasePhase === "pullCode" ? 0 : record.releasePhase === "build" ? 1 : 2
                                } status={
                                    record.releaseType === "wait" || record.releaseType === "stop" ?
                                        "wait" : record.releaseType === "run" ?
                                            "process" : record.releaseType === "releaseSuccess" ?
                                                "finish" : "error"
                                }>
                                    <Step title="更新"
                                        icon={
                                            this.stepIcon(0, record.releasePhase === "pullCode" ? 0 : record.releasePhase === "build" ? 1 : 2, record.releaseType)
                                        }
                                        description=
                                        {
                                            (<div>拉取代码耗时:{record.oneTime}
                                                <br></br>
                                                {
                                                    this.stepButton(0, record.releasePhase === "pullCode" ?
                                                        0 : record.releasePhase === "build" ?
                                                            1 : 2,
                                                        record.releaseType, record.serverModel.id)
                                                }
                                            </div>)
                                        } />
                                    <Step title="构建"
                                        icon={
                                            this.stepIcon(1, record.releasePhase === "pullCode" ? 0 : record.releasePhase === "build" ? 1 : 2, record.releaseType)
                                        }
                                        description=
                                        {
                                            (<div>构建耗时:{record.twoTime}
                                                <br></br>
                                                {
                                                    this.stepButton(1, record.releasePhase === "pullCode" ?
                                                        0 : record.releasePhase === "build" ?
                                                            1 : 2,
                                                        record.releaseType, record.serverModel.id)
                                                }
                                            </div>)
                                        } />
                                    <Step title="启动"
                                        icon={
                                            this.stepIcon(2, record.releasePhase === "pullCode" ? 0 : record.releasePhase === "build" ? 1 : 2, record.releaseType)
                                        }
                                        description=
                                        {
                                            (<div>启动耗时:{record.threeTime}
                                                <br></br>
                                                {
                                                    this.stepButton(2, record.releasePhase === "pullCode" ?
                                                        0 : record.releasePhase === "build" ?
                                                            1 : 2,
                                                        record.releaseType, record.serverModel.id)
                                                }
                                            </div>)
                                        } />
                                </Steps>
                            )
                        }} />
                    </Table>
                </div>
                <Modal
                    title="Basic Modal"
                    visible={this.state.proSubmitModeVisible}
                    onOk={this.submitProStart.bind(this)}
                    onCancel={() => {
                        this.setState({
                            proSubmitModeVisible: false
                        })
                    }}
                >
                    <DatePicker
                        mode={this.state.releseTimeDatePicker}
                        showTime={{ defaultValue: moment(new Date(), "HH:mm:ss") }}
                        onOpenChange={(open) => {
                            if (open) {
                                this.setState({
                                    releseTimeDatePicker: 'time'
                                });
                            }
                        }}
                        onPanelChange={(value, mode) => {
                            this.setState({
                                releseTimeDatePicker: mode
                            })
                        }}
                        onChange={(v1, dataStr) => {
                            this.setState({
                                releaseTimeStr: dataStr
                            })
                        }}
                    />
                </Modal>
            </div>

        );
    }
}
export const CReleaseWork = connect(({ change }) => ({
    redux: change
}), undefined, undefined, {
        withRef: true
    })(ReleaseWork);