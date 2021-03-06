import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'
import jquery from 'jquery'
import MiniMap from 'leaflet-minimap'
import 'leaflet.pm'
import 'leaflet.pm/dist/leaflet.pm.css'
import $ from 'jquery';
import echarts from 'echarts'
// const echarts = require('echarts')
window.jQuery = $;
window.$ = $;

Vue.use(ElementUI)

Vue.prototype.$axios = axios;
Vue.prototype.$echarts = echarts;

Vue.config.productionTip = false



new Vue({
  router,
  store,
  axios,
  echarts,
  jquery,
  render: h => h(App)
}).$mount('#app')
