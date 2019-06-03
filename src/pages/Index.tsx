import * as React from 'react';
// 通过 ReactHookRedux 获得 Provider 组件和一个 sotre 对象
import { store } from '../redux/store'
import { Button } from 'antd';
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
        1111111111
      </div>
    )
  }
}
export default connect(({ index }) => ({
  redux: index
}))(Index);
