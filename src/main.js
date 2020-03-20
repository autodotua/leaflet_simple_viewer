import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import 'element-ui/lib/theme-chalk/index.css';

import ElementUI from 'element-ui';

Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.use(VueRouter)
new Vue({
  el:'#app',
  render: h => h(App),
})//.$mount('#app')
