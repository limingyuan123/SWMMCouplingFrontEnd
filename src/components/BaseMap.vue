<template>
  <div>
    <!-- <div class="tool">
      <div class="leftTool">
          <div style="margin-top:20px"><span>Tool</span></div>
          <el-button size="medium" icon="el-icon-folder-opened" type="primary" class="fileTool" ></el-button>
      </div>
    </div> -->
    <!-- 左侧菜单工具 -->
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
    <div id="leafletMap" v-loading="loading"></div>

    <el-dialog title="Load INP File" :visible.sync="fileDialog" width="30%">
        <el-upload
                class="upload-demo"
                multiple
                drag
                action="https://jsonplaceholder.typicode.com/posts/"
                ref="upload"
                :on-change="uploadChange"
                :auto-upload="false">
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
import * as L from "leaflet";
//Vue.L = Vue.prototype.$L = L

export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      isCollapse: true,
      fileDialog: false,
      loading: false,
      uploadFiles: [],
      geojson:'',
    };
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.initSize);
  },
  methods: {
    initMap() {
      this.tdtVectorMap =
        "http://t0.tianditu.gov.cn/vec_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
        "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
      this.tdtVectorAno =
        "http://t0.tianditu.gov.cn/cva_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
        "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
      this.tdtImgMap =
        "http://t0.tianditu.gov.cn/img_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
        "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
      this.tdtImgAno =
        "http://t0.tianditu.gov.cn/cia_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
        "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
      this.tdtTerrMap =
        "http://t0.tianditu.com/ter_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
        "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
      this.tdtTerrAno =
        "http://t0.tianditu.com/cta_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
        "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";

      this.map = L.map("leafletMap", {
        crs: L.CRS.EPSG3857,
        center: L.latLng(31.011118, 120.813111),
        zoom: 13,
      });
    },
    initLayer() {
      this.drawingLayerGroup = L.layerGroup([]);
      this.drawingLayerGroup.addTo(this.map);
    },
    initControl() {
      // 图层控件
      let vectorMap = L.tileLayer(this.tdtVectorMap, {
        maxZoom: 20,
        attribution:
          '&copy; <a href="http://map.tianditu.gov.cn/">tianditu</a> contributors',
      });
      let vectorAno = L.tileLayer(this.tdtVectorAno, { maxZoom: 18 });
      let vector = L.layerGroup([vectorMap, vectorAno]);

      let satelliteMap = L.tileLayer(this.tdtImgMap, {
        maxZoom: 18,
        attribution:
          '&copy; <a href="http://map.tianditu.gov.cn/">tianditu</a> contributors',
      });
      let satelliteAno = L.tileLayer(this.tdtImgAno, { maxZoom: 18 });
      let satellite = L.layerGroup([satelliteMap, satelliteAno]);

      let terrainMap = L.tileLayer(this.tdtTerrMap, {
        maxZoom: 18,
        attribution:
          '&copy; <a href="http://map.tianditu.gov.cn/">tianditu</a> contributors',
      });
      let terrainAno = L.tileLayer(this.tdtTerrAno, { maxZoom: 18 });
      let terrain = L.layerGroup([terrainMap, terrainAno]);

      this.baseLayers = {
        "Vector map": vector,
        "Satellite map": satellite,
        "Terrain map": terrain,
      };
      let overlayLayers = {};
      L.control.layers(this.baseLayers, overlayLayers).addTo(this.map);
      this.baseLayers["Vector map"].addTo(this.map);

      // 比例尺
      L.control
        .scale({
          position: "bottomleft",
        })
        .addTo(this.map);

      // 鹰眼
      let normal = L.tileLayer(this.tdtVectorMap, { maxZoom: 18 });
      let miniMap = new L.Control.MiniMap(normal, {
        // toggleDisplay: true,
        minimized: false,
        position: "bottomleft",
      }).addTo(this.map);

      // 绘图控件
      let options = {
        position: "topleft", // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
        drawMarker: true, // adds button to draw markers
        drawPolyline: true, // adds button to draw a polyline
        drawRectangle: true, // adds button to draw a rectangle
        drawPolygon: true, // adds button to draw a polygon
        drawCircle: true, // adds button to draw a cricle
        cutPolygon: false, // adds button to cut a hole in a polygon
        editMode: true, // adds button to toggle edit mode forborder-radius all layers
        dragMode: false,
        removalMode: true, // adds a button to remove layers
      };
      this.map.pm.addControls(options);
    },
    initSize() {
      $("#leafletMap").css("min-width", "0");
      $("#leafletMap").css("min-height", "0");
      $("#leafletMap").css("height", window.innerHeight - 61 + "px");
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    openFileDialog() {
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
        let geojsonLayer = L.geoJSON(_this.geojson).addTo(_this.map);
        geojsonLayer.addData(_this.geojson);
        _this.loading = false;
      });
    },
    uploadChange(file, fileList) {
      this.uploadFiles = fileList;
    },
    selectFile(){
        $("#uploadFile").click()
    },
  },
  mounted() {
    this.initSize();
    this.initMap();
    this.initLayer();
    this.initControl();
    window.onresize = () => {
      $("#leafletMap").css("height", window.innerHeight - 61 + "px");
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#leafletMap {
  width: 100%;
  height: calc(100vh);
  float: right;
}
.tool {
  position: absolute;
  top: 25%;
  z-index: 10000;
  right:0%;
}
/* .leftTool {
  width: 90%;
  height: 100%;
  background: rgb(47, 102, 124);
  opacity: 0.7;
} */
.fileTool {
  font-size: 30px;
  margin: 3%;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
