<template>
  <div>
    <div class="tool">
        <el-tabs v-model="activeName" @tab-click="handleClick"  type="card" style="height:100%" stretch>
            <el-tab-pane label="现状" name="first">
                <!-- File -->
                <div class="detail" style="margin-top:30px">
                    <!-- <p>You can perform a series of file operations, including loading project files, importing configuration files, and saving result files</p> -->
                    <p>选择不同的降水类型，展示不同的模拟结果</p>
                </div>
                <el-button class="file" style="background:#d4d7d8;margin:10px" @click="openFileDialog()">
                    <h2 style="margin:5px;">五年一遇降水</h2>
                    <p>选择该降水数据，展示模拟结果</p>
                </el-button>
                <el-button class="file" style="background:#d4d7d8;margin:10px" @click="loadDispRes(tenNow)">
                    <h2 style="margin:5px;">十年一遇降水</h2>
                    <p>选择该降水数据，展示模拟结果</p>
                </el-button>
                <el-button class="file" style="background:#d4d7d8;margin:10px" @click="loadDispRes(twentyNow)">
                    <h2 style="margin:5px;">二十年一遇降水</h2>
                    <p>选择该降水数据，展示模拟结果</p>
                </el-button>
                <el-button class="file" style="background:#d4d7d8;margin:10px" @click="loadDispRes(thirtyNow)">
                    <h2 style="margin:5px;">三十年一遇降水</h2>
                    <p>选择该降水数据，展示模拟结果</p>
                </el-button>
                <el-button class="file" style="background:#d4d7d8;margin:10px" @click="loadDispRes(fiftyNow)">
                    <h2 style="margin:5px;">五十年一遇降水</h2>
                    <p>选择该降水数据，展示模拟结果</p>
                </el-button>
            </el-tab-pane>
            <el-tab-pane label="改造后" name="second">Operation</el-tab-pane>
        </el-tabs>
    </div>

    <div id="cesiumContainer" v-loading="loading"></div>
  </div>
</template>

<script>
import "cesium/Build/Cesium/Widgets/widgets.css";
import { Viewer } from "cesium";
import * as Cesium from "cesium/Source/Cesium.js";
import * as echarts from 'echarts'
export default {
  name: "CesiumContainer",
  data() {
    return {
        activeIndex: '1',
      isCollapse: true,
    //   fileDialog: false,
      loading: false,
      uploadFiles: [],
      geojson: "",
      geojsonLayer:Object,
      viewer:Object,
      fileList:[],
      activeName: 'first',
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClick(){

    },
    openFileDialog() {
      this.uploadFiles = [];
      this.fileList = [];
      this.fileDialog = true;
    },
    setView(){
        this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(120.731026, 31.261, 15000.0), // 设置位置

        orientation: {
            heading: Cesium.Math.toRadians(20.0), // 方向
            pitch: Cesium.Math.toRadians(-90.0), // 倾斜角度
            roll: 0,
        },
        });
        this.viewer.animation.container.style.visibility = 'hidden' // 不显示动画控件
        this.viewer.timeline.container.style.visibility = 'hidden' // 不显示时间线控件
    },
    initSize() {
      $("#leafletMap").css("min-width", "0");
      $("#leafletMap").css("min-height", "0");
      $("#cesiumContainer").css("height", window.innerHeight);
    },
    loadFenhuLayer(){
      let _baselayer = new Cesium.WebMapServiceImageryProvider({
          url: 'http://172.21.213.174:8080/geoserver/fenhuTiff4/wms',
          layers: "fenhuTiff4:fenhu-000611",
          parameters: {
            // service: 'WMS',
            format: 'image/png',
            transparent: true,
          }
        }); 
        this.viewer.imageryLayers.addImageryProvider(_baselayer);
    }
    
  },
  mounted() {
    Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiODcwODhiOC00Y2M3LTQ3ZGYtODUxZC1kOGYzNzcyOWJjZDYiLCJpZCI6NTc4NTAsImlhdCI6MTYyMjY0MzE1MX0.W4miH8AfW1lWpjc75C6NX8mGCk--tV50M-3pWOquha4"
    /* eslint no-new: */
    this.viewer = new Viewer("cesiumContainer");
    //隐藏cesium版权信息
    this.viewer._cesiumWidget._creditContainer.style.display = "none";

    //设置cesium中心展示位置
    this.setView();
    this.initSize();
    window.onresize = () => {
      $("#cesiumContainer").css("height", window.innerHeight);
    };
    // this.parseDispData();
    // this.addGeoJson();
    this.loadFenhuLayer();

  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
.tool {
  background: white;
  height: 100%;
  width:30%;
  position: absolute;
  /* top: 40%; */
  z-index: 1000;
  left: 0%;
}
</style>