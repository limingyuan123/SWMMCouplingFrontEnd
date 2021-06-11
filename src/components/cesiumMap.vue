<template>
  <div>
    <div class="tool">
      <!-- <div class = "leftMenu" style="height:100%;width:30%;float:left"> -->
        
        <el-tabs v-model="activeName" @tab-click="handleClick"  type="card" style="height:100%" stretch=true>
            <el-tab-pane label="现状" name="first">
                <!-- File -->
                <div class="detail">
                    <!-- <p>You can perform a series of file operations, including loading project files, importing configuration files, and saving result files</p> -->
                    <p>选择不同的降水类型，展示不同的模拟结果</p>
                </div>
                <el-button class="file" style="background:#d4d7d8;margin:5px" @click="openFileDialog()">
                    <h2 style="margin:5px;">五年一遇降水</h2>
                    <p>选择该降水数据，展示模拟结果</p>
                </el-button>
                <el-button class="file" style="background:#d4d7d8;margin:5px" @click="loadDispRes(tenNow)">
                    <h2 style="margin:5px;">十年一遇降水</h2>
                    <p>选择该降水数据，展示模拟结果</p>
                </el-button>
                <el-button class="file" style="background:#d4d7d8;margin:5px" @click="loadDispRes(twentyNow)">
                    <h2 style="margin:5px;">二十年一遇降水</h2>
                    <p>选择该降水数据，展示模拟结果</p>
                </el-button>
                <el-button class="file" style="background:#d4d7d8;margin:5px" @click="loadDispRes(thirtyNow)">
                    <h2 style="margin:5px;">三十年一遇降水</h2>
                    <p>选择该降水数据，展示模拟结果</p>
                </el-button>
                <el-button class="file" style="background:#d4d7d8;margin:5px" @click="loadDispRes(fiftyNow)">
                    <h2 style="margin:5px;">五十年一遇降水</h2>
                    <p>选择该降水数据，展示模拟结果</p>
                </el-button>
                <!-- <div class="img" style="width:40px;height:40px">
                  <img src="/img/cesiumIcon/node.png">
                </div> -->
                  <!-- <el-button type="success" style="float:right;margin:5px"  @click="invoke()">Invoke</el-button> -->

            </el-tab-pane>
            <el-tab-pane label="改造后" name="second">Operation</el-tab-pane>
            <!-- <el-tab-pane label="Simulation" name="third">Simulation</el-tab-pane>
            <el-tab-pane label="Coupling analysis" name="fourth">Coupling analysis</el-tab-pane> -->
        </el-tabs>
      <!-- </div> -->
      <!-- <el-menu
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
        </el-menu-item> -->
        <!-- <el-menu-item index="3" @click="clearInp()">
          <i class="el-icon-refresh"></i>
          <span slot="tzitle">Clear</span>
        </el-menu-item>
        <el-menu-item index = "4" @click="invoke()">
          <i class="el-icon-thumb"></i>
          <span slot="title">Invoke</span>
        </el-menu-item> -->
    </div>

    <div id="cesiumContainer" v-loading="loading"></div>
    
    <!-- 文件上传dialog -->
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

    <!-- swmm结果展示dialog -->
    <el-dialog
      title="SWMM Visual"
      :visible.sync="swmmVisualDialog"
      width="90%"
      :before-close="handleClose">
      <span>
        <iframe src="http://221.226.60.2:8082/data/a3f07e87-1569-49b6-9175-0c76bd2bca9a?type=html" scrolling="no" style="width: 100%;height: 500px;" frameborder="0"></iframe>
      </span>     

      <span slot="footer" class="dialog-footer">
        <el-button @click="swmmVisualDialog = false">Cancel</el-button>
        <el-button type="primary" @click="swmmVisualDialog = false">Confirm</el-button>
      </span>
    </el-dialog>

    <!-- cesium 结果展示dialog -->
    <el-dialog
      title="SWMM Visual2"
      :visible.sync="echartsDialog"
      width="50%"
      :before-close="handleClose">
      <div id="echarts" style="width: 500px;height:300px;margin-top: 20px;">

      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="echartsDialog = false">Cancel</el-button>
        <el-button type="primary" @click="echartsDialog = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import "cesium/Build/Cesium/Widgets/widgets.css";
import { Viewer } from "cesium";
import * as Cesium from "cesium/Source/Cesium.js";
import * as echarts from 'echarts'
// import disp5 from '../data/result_5.disp'
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
      geojsonLayer:Object,
      viewer:Object,
      fileList:[],
      swmmVisualDialog:false,
      echartsDialog:false,
      activeName: 'first',
      dispUrlArr:{
      "now5":"http://221.226.60.2:8082/data/57cfa74f-8183-45c5-a3d9-0fadd56bb82d?type=json", 
        // "now5":"http://221.226.60.2:8082/data/cb81cc2e-02bf-48f6-a2e9-1b2ee9018828?type=json", 
      // "now10":"http://221.226.60.2:8082/data/95b4f831-1182-408a-aa4e-cc81f04c4894?type=json",
      // "now20":"http://221.226.60.2:8082/data/5026381f-c7c9-454d-966e-c6104ea60514?type=json",
      // "now30":"http://221.226.60.2:8082/data/60793f1e-e6d3-444d-9997-be6b841d36cb?type=json",
      // "now50":"http://221.226.60.2:8082/data/84a4f3b1-1464-4af3-8449-8476b8e76bc7?type=json"
      },
      dispArr:[],
      dispJSON:{},
      date:[],
    }
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
        _this.loading = false;
        if(res.data.code === 0){          
          console.log(res);
          _this.$message({
            message:'Load INP Success!',
            type:"success"
          })
          _this.geojson = res.data.data;
          _this.addGeoJson(_this.geojson);
        }else{
          _this.$message({
            message: res.data.message,
            type:'error'
          })
        }
        
        
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
        this.viewer.animation.container.style.visibility = 'hidden' // 不显示动画控件
        this.viewer.timeline.container.style.visibility = 'hidden' // 不显示时间线控件
    },
    //将展示的geojson加载入cesium
    addGeoJson(json){
        this.geojsonLayer = Cesium.GeoJsonDataSource.load(json, {
        stroke: Cesium.Color.BLUE,
        fill: Cesium.Color.BLUE.withAlpha(0.3), //注意：颜色必须大写，即不能为blue
        strokeWidth: 5
      })
      this.viewer.zoomTo(this.geojsonLayer);
      this.geojsonLayer.then((dataSources)=>{
        //箭头函数，this指向未变
        this.viewer.dataSources.add(dataSources);
        let entities = dataSources.entities.values;
        let colorHash = {};
        for (let i = 0; i < entities.length; i++) {
          let entity = entities[i];
          //设置entity的billboard属性
          let obj = {
            image: '/img/cesiumIcon/node.png',
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            scale: 1,
            width: 10,
            height: 10, 
            color: Cesium.Color.GREEN,
          }
          entity.billboard = obj;
        }
        const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        handler.setInputAction((click)=>{
          const pick = this.viewer.scene.pick(click.position);
          let factorName = pick.id.name;
          //根据name获取json中的数据，渲染echarts
          let type = undefined;
          if(pick.id.point != undefined){
            type = 'point';
          }else if(pick.id.polyline != undefined){
            type = 'polyline';
          }else if(pick.id.polygon != undefined){
            type = 'polygon';
          }
          // alert("ok")
          //展示echarts图
          let dispResults, dispResult;
          if(type === 'point'){
            dispResults = this.dispJSON.NodeResults;            
          }else if(type === 'polyline'){
            dispResults = this.dispJSON.LinkResults;
          }
          for(let i=0;i<dispResults.length;i++){
            if(dispResults[i].name === factorName){
              dispResult = dispResults[i];
              break;
            }
          }
          this.changeEcharts(dispResult);

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      })
      

    },
    changeEcharts(dispResult){      
      this.echartsDialog = true;
      console.log(dispResult);
      //绘图
      let chartDom = document.getElementById('echarts');
      let myChart = echarts.init(chartDom);
      let dateList = this.date;
      let valueList = dispResult.Flow;
      let option = {
         visualMap: {
                show: false,
                type: 'continuous',
                seriesIndex: 0,
            },
            title: {
                left: 'center',
                text: 'suibian'
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis:{
                data: dateList
            },
            yAxis:{
            },
            series: {
                type: 'line',
                showSymbol: false,
                data: valueList
            }
      };
      myChart.setOption(option);
    },
    initSize() {
      $("#leafletMap").css("min-width", "0");
      $("#leafletMap").css("min-height", "0");
      $("#cesiumContainer").css("height", window.innerHeight-61);
    },
    clearInp(){
      console.log('clearInp')
      console.log(this.viewer.dataSources);
      let flag = this.viewer.dataSources.dataSources = [];
      console.log(flag);
    },
    invoke(){
      let _this = this;
      _this.loading = true;
      setTimeout(()=>{
        this.invokeSuc()
      }, 3000)
      // setTimeout(_this.invokeSuc(), 5000);
    },
    invokeSuc(){
      this.loading = false;
      this.swmmVisualDialog = true;
    },
    //载入模拟结果
    loadDispRes(sign){
      // if(sign === 'tenNow'){
          this.dispJSON = JSON.parse(this.dispArr[0].count);
          this.date = this.dispJSON.Date;
          // let geojson = dispJSON.GeoJson;
          this.geojson = this.dispJSON.GeoJson;
          //判断是否有features
          let obj = {}
          if(this.geojson.features === undefined){
            obj.features = this.geojson;
            obj.type = "FeatureCollection";
          }else{
            obj = this.geojson;
          }
          console.log(obj);
          //
          this.addGeoJson(obj);
      // }
    },
    parseDispData(){
      let form = new FormData();
      form.append("dispUrls",  JSON.stringify(this.dispUrlArr));
      let _this = this;
      this.$axios.post('/api/getDispVal', form)
        .then((res)=>{
          console.log("disp data get suc");
          console.log(res);
          _this.dispArr = res.data.data;
          console.log(_this.dispArr);
        })
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
      $("#cesiumContainer").css("height", window.innerHeight-61);
    };
    this.parseDispData();
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
/* .tool {
  position: absolute;
  top: 40%;
  z-index: 10000;
  left: 0%;
} */
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