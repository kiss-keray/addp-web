import * as React from 'react';
// 通过 ReactHookRedux 获得 Provider 组件和一个 sotre 对象
import { store } from '../redux/store'
import { Button, List } from 'antd';
import Page from '../Page'
import { connect } from 'dva';
function actionOfAdd() {
  return {
    type: "add the count",
    reducer(state: any) {
      return { ...state, age: state.age + 1, indexNav: '/test' }; // 每次需要返回一个新的 state
    }
  };
}
class Index extends Page<any, any, any> {
  public state = {
    products: []
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
  public render() {
    return (
      <div>
        <h1>ADDP</h1>
        <h2>条件：</h2>
        <h2>1.服务器需要git,maven,docker环境</h2>
        <h2>2.maven项目必须支持maven package打包，且打包的jar能直接运行。jar命名为:{'${项目英文名}-start.jar'}</h2>
        <h3>3.项目根目录需要有<a href="https://addp.oss-cn-hangzhou.aliyuncs.com/ADDP-INF.rar">ADDP-INF</a>文件夹</h3>
        <List
          size="large"
          bordered
          dataSource={[
            "添加服务器",
            '添加项目',
            '项目关联服务器',
            '创建项目变更',
            '变更发布日常环境测试',
            '测试通过发布线上环境'
          ]}
          renderItem={item => <List.Item>{item}</List.Item>}
        />
      </div>
    )
  }
}
export default connect(({ index }) => ({
  redux: index
}))(Index);
