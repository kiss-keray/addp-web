import * as React from 'react';
// 通过 ReactHookRedux 获得 Provider 组件和一个 sotre 对象
import { store } from '../redux/store'
import { Button } from 'antd';
function actionOfAdd() {
  return {
    type: "add the count",
    reducer(state:any) {
      return { ...state, age: state.age + 1,indexNav:'/test' }; // 每次需要返回一个新的 state
    }
  };
}

function Page() {
  console.log("xxxx1",store.useContext());
  const state = store.useContext();
  return (
    <div>
      {state.age} <Button onClick={() => store.dispatch(actionOfAdd())} >吸纳</Button>{" "}
    </div>
  );
}
class Index extends React.Component<any,any> {
  public state = {
    products:[]
  }
  public render () {
    return (
      <div>
        <Page/>
      </div>
    )
  }
}

export default Index
