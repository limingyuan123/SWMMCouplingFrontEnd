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

Vue.use(ElementUI)

Vue.prototype.$axios = axios;

Vue.config.productionTip = false

new Vue({
  router,
  store,
  axios,
  jquery,
  render: h => h(App)
}).$mount('#app')
