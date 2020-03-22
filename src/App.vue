<template>
  <div id="app">
    <el-container>
      <!-- <el-header>
        <el-menu class="el-menu-demo" mode="horizontal">
          <el-menu-item :index="item.id" v-for="item in routes" :key="item.name">
            <router-link class="link" :to="item.path">{{item.name}}</router-link>
          </el-menu-item>
        </el-menu>
      </el-header> -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template> 

<script>
import Vue from "vue";
import About from "./About/About";
import Map from "./Map/Map";
const routes = [
  { id: '2', path: "/about", component: About, name: "关于" },
  { id: '3', path: "/", component: Map, name: "地图" },
   { path: "*", component: Vue.component("page-not-found", {
    template: "",
    created: function() {
        // Redirect outside the app using plain old javascript
        window.location.href = "/notFound.html";
    }
}) }
];
import VueRouter from "vue-router";
const router = new VueRouter({
  //mode:'history',
  routes // (缩写) 相当于 routes: routes
});

export default {
  name: "App",
  router,
  components: {},
  data: () => {
    return {
      routes
    };
  },
  methods: {},
  computed: {}
};
</script>
<style scoped>
.link {
  text-decoration: none;
}
.el-container {
  height: 100%;
  padding: 0;
}
.el-header{
  padding: 0;
}
.el-main{
  padding: 0;
}
</style>