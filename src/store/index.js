import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  //定义了应用状态的数据结构，可以在这里设置默认的初始化状态。
  state: {
    Token : localStorage.getItem('Token') ? localStorage.getItem('Token') : '',
    Account : localStorage.getItem('Account') ? localStorage.getItem('Account') : '',
    Password : localStorage.getItem('Password') ? localStorage.getItem('Password') : '',
  },
  //是唯一更改 store 中状态的方法，且必须是同步函数
  mutations: {
    changeLogin(state,user){
      state.Token = user.Token;
      localStorage.setItem('Token', user.Token);      
    }
  },
  //用于提交 mutation，而不是直接变更状态,异步的时候用到action
  actions: {
  },
  //允许将单一的 Store 拆分更多个 store 且同时保存在单一的状态树中。
  modules: {
  },
  //允许组件从Store中获取数据，mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性。
  getters:{

  }
})
