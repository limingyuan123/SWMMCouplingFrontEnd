<template>
  <div>
    <div class="tool">
      <el-menu
        default-active="1"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        :collapse="isCollapse"
      >
        <el-menu-item index="1" @click="openFileDialog()">
          <i class="el-icon-folder"></i>
          <span slot="title">File Open</span>
        </el-menu-item>
        <el-menu-item index="2">
          <i class="el-icon-menu"></i>
          <span slot="title">导航二</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div id="cesiumContainer"></div>
    <el-dialog title="Load INP File" :visible.sync="fileDialog" width="30%">
      <el-upload
        class="upload-demo"
        multiple
        drag
        action="https://jsonplaceholder.typicode.com/posts/"
        ref="upload"
        :file-list="fileList"
        :on-change="uploadChange"
        :auto-upload="false"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="fileDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmLoad()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import "cesium/Build/Cesium/Widgets/widgets.css";
import { Viewer } from "cesium";
import * as Cesium from "cesium/Source/Cesium.js";
import loadFile from '../assets/js/loadFile';
import jsonData from '@/assets/nanjing.json';
// import Cesium from 'cesium/Source/Cesium.js'
export default {
  name: "CesiumContainer",
  data() {
    return {
      isCollapse: true,
      fileDialog: false,
      loading: false,
      uploadFiles: [],
      geojson: "",
      viewer:Object,
      fileList:[],
    };
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    openFileDialog() {
      this.uploadFiles = [];
    //   this.$refs['upload'].clearFiles();
    this.fileList = [];
      this.fileDialog = true;
    },
    confirmLoad() {
      let _this = this;
      this.fileDialog = false;
      this.loading = true;
      let form = new FormData();
      for (let i = 0; i < this.uploadFiles.length; i++) {
        form.append("datafile", this.uploadFiles[i].raw);
      }

      this.$axios.post("/api/inp", form).then((res) => {
        console.log(res);
        _this.geojson = res.data.message.geojson;
        _this.addGeoJson(_this.geojson);

        // let geojsonLayer = L.geoJSON(_this.geojson).addTo(_this.map);
        // geojsonLayer.addData(_this.geojson);
        _this.loading = false;
      });
    },
    selectFile() {
      $("#uploadFile").click();
    },
    uploadChange(file, fileList) {
      this.uploadFiles = fileList;
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
    },
    addGeoJson(json){
        let res = Cesium.GeoJsonDataSource.load(json, {
        stroke: Cesium.Color.WHITE,
        fill: Cesium.Color.BLUE.withAlpha(0.3), //注意：颜色必须大写，即不能为blue
        strokeWidth: 5
      })
        this.viewer.dataSources.add(res);

      let entities = res.entities.values;
      let colorHash = {};
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        let name = entity.name;
        let color = colorHash[name];
        if (!color) {
          color = Cesium.Color.fromRandom({
            alpha: 1.0
          });
          colorHash[name] = color;
        }
        entity.polygon.material = color;
        entity.polygon.outline = false;
        entity.polygon.extrudedHeight = entity.properties.childrenNum * 5000; //高度扩大5000倍，便于观察
      }
    },
    initSize() {
      $("#leafletMap").css("min-width", "0");
      $("#leafletMap").css("min-height", "0");
      $("#cesiumContainer").css("height", window.innerHeight-61);
    },
  },
  mounted() {
    /* eslint no-new: */
    this.viewer = new Viewer("cesiumContainer");
    //隐藏cesium版权信息
    this.viewer._cesiumWidget._creditContainer.style.display = "none";

    //设置cesium中心展示位置
    this.setView();
    this.initSize();
    window.onresize = () => {
      $("#cesiumContainer").css("height", window.innerHeight-61);
    };
    // this.addGeoJson();

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
  position: absolute;
  top: 40%;
  z-index: 10000;
  left: 0%;
}
</style>
