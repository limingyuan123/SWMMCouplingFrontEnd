import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    Token : localStorage.getItem('Token') ? localStorage.getItem('Token') : '',
    Account : localStorage.getItem('Account') ? localStorage.getItem('Account') : '',
    Password : localStorage.getItem('Password') ? localStorage.getItem('Password') : '',
  },
  mutations: {
    changeLogin(state,user){
      state.Token = user.Token;
      localStorage.setItem('Token', user.Token);      
    }
  },
  //异步的时候用到action
  actions: {
  },
  
  modules: {
  }
})
