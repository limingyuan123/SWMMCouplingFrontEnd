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
    <div class="container">
      <el-row style="height:  calc(100vh - 61px);width:50%; display:flex;position:absolute;top: 61px;">
        <!-- <div class="leftContainer">
          <left-tools></left-tools>
        </div> -->
      </el-row>
      <el-row>
        <div class="mapContainer">
         <cesium-map></cesium-map>
        </div>
      </el-row>
    </div>    
  </div>
</template>

<script>
import BaseMap from '../components/BaseMap.vue';
import CesiumMap from '../components/cesiumMap.vue';
import LeftTools from '../components/LeftTools.vue';
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
    LeftTools,
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
.leftContainer{
  float: left;
  height: 100%;
  width:50%;
  z-index: 1000;
}
.container{
  position: relative;
  /* top:61px; */
}
/* .leftMenu{
  float:left;height:100%;minwidth:180px
} */
</style>