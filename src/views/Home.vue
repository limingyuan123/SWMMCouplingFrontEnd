<template>
  <div class="home">
    <el-row>
      <div>
        <navbar></navbar>
      </div>
    </el-row>
    <!-- <el-row style="height:  calc(100vh - 95px);width:100%; display:flex">
      <div class="leftMenu">
        <left-menu></left-menu>
      </div>
    </el-row> -->
    <el-row>
      <base-map></base-map>
    </el-row>
  </div>
</template>

<script>
import BaseMap from '../components/BaseMap.vue';
//组件懒加载
const LeftMenu = () => import("@/components/LeftMenu.vue");
const Navbar = () => import("@/components/Navbar.vue");

export default {
  name: "Home",
  components: {
    LeftMenu,
    Navbar,
    BaseMap,
  },
};
</script>
<style>
body {
  margin: 0;
}
.leftMenu{
  float:left;height:100%;minwidth:180px
}
</style>
