<template>
  <div class="home">
    <el-row>
      <div class="header">
        <navbar></navbar>
      </div>
    </el-row>
    <!-- <el-row style="height:  calc(100vh - 95px);width:100%; display:flex">
      <div class="leftMenu">
        <left-menu></left-menu>
      </div>
    </el-row> -->
    <!-- <el-row>
      <base-map></base-map>
    </el-row> -->

    <el-row>
       <div class="mapContainer">
      <cesium-map></cesium-map>
       </div>
    </el-row>
  </div>
</template>

<script>
import BaseMap from '../components/BaseMap.vue';
import CesiumMap from '../components/cesiumMap.vue';
//组件懒加载
// const LeftMenu = () => import("@/components/LeftMenu.vue");
const Navbar = () => import("@/components/Navbar.vue");

export default {
  name: "Home",
  components: {
    // LeftMenu,
    Navbar,
    BaseMap,
    CesiumMap,
  },
};
</script>
<style>
body {
  margin: 0;
}
.header{
  position: absolute;
  top: 0px;
  z-index: 1000;
  width: 100%;
}
.mapContainer{
  position: relative;
  top:61px;
}
/* .leftMenu{
  float:left;height:100%;minwidth:180px
} */
</style>
