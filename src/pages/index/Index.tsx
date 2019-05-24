import * as React from 'react';
import  './Index.css';
// 通过 ReactHookRedux 获得 Provider 组件和一个 sotre 对象
import { store } from '../../redux/store'
function actionOfAdd() {
  return {
    type: "add the count",
    reducer(state:any) {
      return { ...state, age: state.age + 1 }; // 每次需要返回一个新的 state
    }
  };
}

class Button extends React.Component {
  handleAdd() {
    store.dispatch(actionOfAdd()); //dispatch
  }
  render() {
    return (<button onClick={this.handleAdd}>add</button>)
  }
}
function Page() {
  const state = store.useContext();
  return (
    <div>
      {state.age} <Button />{" "}
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
