<template>
    <div>
        <el-upload
            class="upload-demo"
            ref="upload"
            action=""
            :show-file-list="false"
            :on-change="fileChange"
            accept=".disp" 
            :file-list="fileList"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">Select file</el-button>
            <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">Upload file</el-button>
        </el-upload>

        <el-tabs type="border-card"  @tab-click="changeTab" style="width: 80%; margin: auto; margin-top: 100px;">
        
            <el-tab-pane label="Map" >
                <el-card class="box-card" v-loading="loading">
                <div id="map" class="map"></div>

                <div id="time-slider">
                    
                    <el-slider
                    v-model="timeSlider"
                    @change="sliderChange"
                    :step="1"
                    :min="1"
                    :max="maxSlider"
                    :marks="marks"
                    :format-tooltip="formatTooltip"
                    style="width: 80%;margin: auto;">
                    </el-slider>
                    
                    <el-button size="small" round @click="propertySelectVisible = true"
                    :disabled="selectBtn">Select</el-button>
                    <el-button size="small" round @click="startAnimation" 
                    :disabled="startBtn" style="margin-bottom:5px;">Start</el-button>
                    <el-button size="small" round @click="pauseAnimation" 
                    :disabled="pauseBtn">Pause</el-button>
                </div>
                </el-card>
            </el-tab-pane>

            <el-tab-pane label="Chart" >
                <el-cascader-panel  @change="changeChooseChart" :options="options" style="height:150px"></el-cascader-panel>
                <div id="main" style="width: 100%;height:300px;margin-top: 20px;"></div>
            </el-tab-pane>

            <el-tab-pane label="Conduit">
                <div id="conduit" style="width: 100%;height: 380px;margin-top: 20px;"></div>

                <div id="time-slider">
                <el-slider
                    v-model="conduitTimeSlider"
                    @change="conduitSliderChange"
                    :step="1"
                    :min="1"
                    :max="maxSlider"
                    :marks="marks"
                    :format-tooltip="formatTooltip"
                    style="width: 80%;margin: auto;">
                </el-slider>
                
                <el-button size="small" round @click="startendSelectVisible = true"
                    :disabled="conduitSelectBtn">Select</el-button>
                <el-button size="small" round @click="startConduitAnimation" 
                    :disabled="conduitStartBtn" style="margin-bottom:5px;">Start</el-button>
                <el-button size="small" round @click="pauseConduitAnimation" 
                    :disabled="conduitPauseBtn">Pause</el-button>
                </div>

            </el-tab-pane>
        </el-tabs>

        <!-- dialog  -->
        <el-dialog
        title="Please Select the Property of Feature"
        :visible.sync="propertySelectVisible"
        width="40%"
        center>
        <div style="text-align: center;">
            <div class="feature-radio">
            <span>Node: </span>
            <el-radio-group v-model="nodeRadio">
                <ul class="feature-ul">
                <li><el-radio :label="0">Inflow</el-radio></li>
                <li><el-radio :label="1">Flooding</el-radio></li>
                <li><el-radio :label="2">Depth</el-radio></li>
                <li><el-radio :label="3">Head</el-radio></li>
                </ul>
            </el-radio-group>
            </div>
            
            <div class="feature-radio">
            <span>Link: </span>
            <el-radio-group v-model="linkRadio">
                <ul class="feature-ul">
                <li><el-radio :label="0">Flow</el-radio></li>
                <li><el-radio :label="1">Velocity</el-radio></li>
                <li><el-radio :label="2">Depth</el-radio></li>
                <li><el-radio :label="3">Capacity</el-radio></li>
                </ul>
            </el-radio-group>
            </div>
        </div>
        
        <span slot="footer" class="dialog-footer">
            <el-button @click="propertySelectVisible = false">Cancel</el-button>
            <el-button type="primary" @click="changeChooseMap">Confirm</el-button>
        </span>
        </el-dialog>

        <el-dialog
        title="Please Select the Starting and Ending Nodes"
        :visible.sync="startendSelectVisible"
        width="40%"
        center>
        <el-select v-model="startNode" @change="changeStartNode" size='small' placeholder="Starting Node">
            <el-option
            v-for="item in startNodes"
            :key="item"
            :label="item"
            :value="item">
            </el-option>
        </el-select>

        <el-select v-model="endNode" @change="changeEndNode" size='small' placeholder="Ending Node">
            <el-option
            v-for="item in endNodes"
            :key="item"
            :label="item"
            :value="item">
            </el-option>
        </el-select>

        <span slot="footer" class="dialog-footer">
            <el-button @click="startendSelectVisible = false">Cancel</el-button>
            <el-button type="primary" @click="confirmStartEndPoints">Confirm</el-button>
        </span>
        </el-dialog>

        <!-- popup -->
        <div id="popup-info">
        <!-- name: {{featureInfo.name}}<br>
        property:{{featureInfo.property}}<br>
        value: {{featureInfo.value}}<br>
        {{featureInfo.date}}<br> -->
        <div id="main-select" style="width: 500px;height:300px;margin-top: 20px;"></div>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return{
          fileList:[],
          visible: false,
          loading: true,
          loadingInterval: null,
          options: [
            {
              value: 'node',
              label: 'Node Results',
              children: []
            }, {
              value: 'link',
              label: 'Link Results',
              children: []
            }
          ],
          rptResult:{},
          geojsonObject:{},
          // map
          vectorLayer: null,
          map:{},
          popup:{},
          featureInfo:{},
          // select
          propertySelectVisible:false,
          nodeRadio:0,
          linkRadio:1,
          // 3 btn
          selectBtn:false,
          startBtn:true,
          pauseBtn:true,
          // slider
          timeSlider:0,
          maxSlider:10,
          marks: {},
          // 暂时存放某一属性的某刻模拟结果数据
          nodeResultArr:[],
          linkResultArr:[],
          // 为色带准备
          nodemin:0,
          nodestep:1,
          linkmin:0,
          linkstep:1,
          // 当前播放次序
          numberAnima:0,
          intevalAnima:null,
          // conduit
          startendSelectVisible: false,
          startNode:"",
          endNode:"",
          startNodes:[],
          endNodes:[],
          linkPath:[],
          linkPathNodes:[],
          linkPathResults:[],
          linkPathResult:[],
          // conduit slider
          conduitTimeSlider:0,
          conduitSelectBtn:false,
          conduitStartBtn:true,
          conduitPauseBtn:true,
          conduitNumberAnima:0,
          conduitIntevalAnima:null,
        }
    },
    methods:{
// 结果文件相关
        fileChange(file, fileList){
          var selectedFile = file.raw;  

          var that = this;
          var reader = new FileReader();//这是核心！！读取操作都是由它完成的
          reader.readAsText(selectedFile);
          reader.onload = function(oFREvent){//读取完毕从中取值
            var pointsTxt = oFREvent.target.result;
            var re = JSON.parse(pointsTxt)
            that.rptResult = re
            that.geojsonObject = {
              'type': 'FeatureCollection',
              'crs': {
                'type': 'name',
                'properties': {
                  'name': 'EPSG:4326',
                  // 'name': 'EPSG:4528',
                },
              },
              'features': re.GeoJson
            }
          }
        },
        submitUpload(){
          // clear
          this.options = [
            {
              value: 'node',
              label: 'Node Results',
              children: []
            }, {
              value: 'link',
              label: 'Link Results',
              children: []
            }
          ]
          // chart Tab
          for (let i = 0; i < this.rptResult.Node.length; i++) {
            var node = this.rptResult.Node[i];
            var nodeResult = this.rptResult.NodeResults[i];
            var child = {
              value: node.toLowerCase(),
              label: node,
              children: [{
                value: 'Inflow',
                label: 'Inflow(LPS)',
                data: nodeResult.Inflow
              }, {
                value: 'Flooding',
                label: 'Flooding(LPS)',
                data: nodeResult.Flooding
              }, {
                value: 'Depth',
                label: 'Depth(meters)',
                data: nodeResult.Depth
              }, {
                value: 'Head',
                label: 'Head(meters)',
                data: nodeResult.Head
              }]
            }
            this.options[0].children.push(child)
          }
          for (let j = 0; j < this.rptResult.Link.length; j++) {
            var link = this.rptResult.Link[j];
            var linkResult = this.rptResult.LinkResults[j];
            var child = {
              value: link.toLowerCase(),
              label: link,
              children: [{
                value: 'Flow',
                label: 'Flow(LPS)',
                data: linkResult.Flow
              }, {
                value: 'Velocity',
                label: 'Velocity(m/sec)',
                data: linkResult.Velocity
              }, {
                value: 'Depth',
                label: 'Depth(meters)',
                data: linkResult.Depth
              }, {
                value: 'Capacity',
                label: 'Capacity',
                data: linkResult.Capacity
              }],
            }
            this.options[1].children.push(child)
          }

          // map Tab
          this.changeChooseMap()
          // slider
          this.maxSlider = this.rptResult.Date.length 
          this.marks={
            1:this.rptResult.Date[0]
          }

          // btn
          this.startBtn = false
          this.conduitStartBtn = false
          //conduit
        },

        formatTooltip(val){
          if (this.rptResult.Date != undefined) {
            
            return this.rptResult.Date[val-1]
          }
        },
        sliderChange(val){
          this.numberAnima = val-1
          for (let i = 0; i < this.rptResult.Node.length; i++) {// 更新geojsonObject
            var feat = this.geojsonObject.features[i];
            feat.properties.value = this.nodeResultArr[i][this.numberAnima]
          }
          for (let k = 0; k < this.rptResult.Link.length; k++) {// 更新geojsonObject
            var feat = this.geojsonObject.features[this.rptResult.Node.length + k];
            feat.properties.value = this.linkResultArr[k][this.numberAnima]
          }
          // 更新openlayer
          this.refreshOpenlayer()
        },

        changeChooseMap(){
          // 还原slider
          this.numberAnima = 0
          this.timeSlider = 1

          this.loading = true
          this.propertySelectVisible = false
          // 获取所有要素的选中属性
          this.nodeResultArr = []
          this.linkResultArr = []
          for (let i = 0; i < this.options[0].children.length; i++) {// node
            var node = this.options[0].children[i];
            var element = node.children[this.nodeRadio]
            this.nodeResultArr.push(element.data) // 汇总该属性的所有模拟值
          }
          for (let k = 0; k < this.rptResult.Node.length; k++) {// 更新geojsonObject
            var feat = this.geojsonObject.features[k];
            feat.properties.value = this.nodeResultArr[k][0]
          }
          for (let i = 0; i < this.options[1].children.length; i++) {// link
            var link = this.options[1].children[i];
            var element = link.children[this.linkRadio];
            this.linkResultArr.push(element.data)
          }
          for (let k = 0; k < this.rptResult.Link.length; k++) {// 更新geojsonObject
            var feat = this.geojsonObject.features[this.rptResult.Node.length + k];
            feat.properties.value = this.linkResultArr[k][0]
          }
          // 获取最大最小值
          if (this.nodeRadio == 0) {// node
            this.nodemin = this.rptResult.MaxMin.node.minInflow;
            var max = this.rptResult.MaxMin.node.maxInflow;
            this.nodestep = (max - this.nodemin)/5
          }else if (this.nodeRadio == 1) {
            this.nodemin = this.rptResult.MaxMin.node.minFlooding;
            var max = this.rptResult.MaxMin.node.maxFlooding;
            this.nodestep = (max - this.nodemin)/5
          }else if (this.nodeRadio == 2) {
            this.nodemin = this.rptResult.MaxMin.node.minDepth;
            var max = this.rptResult.MaxMin.node.maxDepth;
            this.nodestep = (max - this.nodemin)/5
          }else if (this.nodeRadio == 3) {
            this.nodemin = this.rptResult.MaxMin.node.minHead;
            var max = this.rptResult.MaxMin.node.maxHead;
            this.nodestep = (max - this.nodemin)/5
          }
          if (this.linkRadio == 0) {// link
            this.linkmin = this.rptResult.MaxMin.link.minFlow;
            var max = this.rptResult.MaxMin.link.maxFlow;
            this.linkstep = (max - this.linkmin)/5
          }else if (this.linkRadio == 1) {
            this.linkmin = this.rptResult.MaxMin.link.minVelocity;
            var max = this.rptResult.MaxMin.link.maxVelocity;
            this.linkstep = (max - this.linkmin)/5
          }else if (this.linkRadio == 2) {
            this.linkmin = this.rptResult.MaxMin.link.minDepth;
            var max = this.rptResult.MaxMin.link.maxDepth;
            this.linkstep = (max - this.linkmin)/5
          }else if (this.linkRadio == 3) {
            this.linkmin = this.rptResult.MaxMin.link.minCapacity;
            var max = this.rptResult.MaxMin.link.maxCapacity;
            this.linkstep = (max - this.linkmin)/5
          }
          
          this.map.setView(
            new ol.View({
              center: this.geojsonObject.features[0].geometry.coordinates,
              zoom: 16,
            })
          )

          // 更新openlayer
          this.refreshOpenlayer()
        },
        changeChooseChart(e){

          // 获取选中的要素结果
          var selData
          var selTitle
          if(e[0]=="node"){//如果第一层选择node
            for (let i = 0; i < this.options[0].children.length; i++) {
              var node = this.options[0].children[i];
              if(node.value == e[1]){//找到对应的node要素
                selTitle = node.label
                for (let j = 0; j < node.children.length; j++) {
                  var element = node.children[j];
                  if(element.value == e[2]){//找到对应的属性
                    selTitle += "--" + element.label
                    selData = element.data
                    break
                  }
                }
                break
              }
            }
          } else {//如果第一层选择link
            for (let i = 0; i < this.options[1].children.length; i++) {
              var link = this.options[1].children[i];
              if(link.value == e[1]){//找到对应的link要素
                selTitle = link.label
                for (let j = 0; j < link.children.length; j++) {
                  var element = link.children[j];
                  if(element.value == e[2]){//找到对应的属性
                    selTitle += "--" + element.label
                    selData = element.data
                    break
                  }
                }
                break
              }
            }
          }
          
          // 更新折线图
          var chartDom = document.getElementById('main');
          var myChart = echarts.init(chartDom);
          var option;
          
          var data = [];
          
          for (let i = 0; i < this.rptResult.Date.length; i++) {
            var d = this.rptResult.Date[i];
            data.push([d,selData[i]])
          }
          var dateList = data.map(function (item) {
              return item[0];
          });
          var valueList = data.map(function (item) {
              return item[1];
          });
          option = {
            // Make gradient line here
            visualMap: {
                show: false,
                type: 'continuous',
                seriesIndex: 0,
            },
            title: {
                left: 'center',
                text: selTitle
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
        initOpenLayer(){
          this.map = new ol.Map({
            layers: [
              new ol.layer.Tile({
                source: new ol.source.OSM(),
              }),
            ],
            logo:false,
            target: 'map',
            view: new ol.View({
              center: [0, 0],
              zoom: 2,
            }),
          });


          this.loadingInterval = setInterval(() => {
            if (this.map.tileQueue_.getTilesLoading() == 0) {
              clearInterval(this.loadingInterval) 
              this.loading = false
            }
          }, 1000);
          // 添加popup弹出层
          this.popup = new ol.Overlay({
            element:document.getElementById("popup-info"),
            offset:[0,-2],
            autoPan:true,
            positioning:'bottom-left'
          })
          this.map.addOverlay(this.popup)
          this.map.on('singleclick', this.showFeatureInfo);

          // 添加选中弹出层
          var select = new ol.interaction.Select();
          if (select !== null) {
            this.map.removeInteraction(select)
          }
          this.map.addInteraction(select)

        },
        showFeatureInfo(evt) {
          var feature = this.map.forEachFeatureAtPixel(evt.pixel, feature => feature);
          if (feature) {
            if (feature.getGeometry().getType() == 'Polygon') 
              return this.popup.setPosition(undefined);

            this.featureInfo = {}; 

            let properties = feature.getProperties();
            let obj = { date:this.rptResult.Date[this.numberAnima] };
            // 判断要素类型，添加属性
            if (feature.getGeometry().getType() == 'Point'){
              obj.type = "node"
              obj.property = this.options[0].children[0].children[this.nodeRadio].label
            } 
            if (feature.getGeometry().getType() == 'LineString') {
              obj.type = "link"
              obj.property = this.options[1].children[0].children[this.nodeRadio].label
            }
            for(var v in properties) {	
              if (v === 'name') obj[v] = properties[v];
              if (v === 'value') obj[v] = properties[v];
            }
            this.featureInfo = obj;
            this.popup.setPosition(evt.coordinate);
            this.changeSelectElement()
          } else {
            this.popup.setPosition(undefined);	// 没有信息情况pop
            this.featureInfo = {};	
          }
        },
        changeSelectElement(){
          var e = [this.featureInfo.type,this.featureInfo.name,this.featureInfo.property]
          // 获取选中的要素结果
          var selData
          var selTitle
          if(e[0]=="node"){//如果第一层选择node
            for (let i = 0; i < this.options[0].children.length; i++) {
              var node = this.options[0].children[i];
              if(node.label == e[1]){//找到对应的node要素
                selTitle = node.label
                for (let j = 0; j < node.children.length; j++) {
                  var element = node.children[j];
                  if(element.label == e[2]){//找到对应的属性
                    selTitle += "--" + element.label
                    selData = element.data
                    break
                  }
                }
                break
              }
            }
          } else {//如果第一层选择link
            for (let i = 0; i < this.options[1].children.length; i++) {
              var link = this.options[1].children[i];
              if(link.label == e[1]){//找到对应的link要素
                selTitle = link.label
                for (let j = 0; j < link.children.length; j++) {
                  var element = link.children[j];
                  if(element.label == e[2]){//找到对应的属性
                    selTitle += "--" + element.label
                    selData = element.data
                    break
                  }
                }
                break
              }
            }
          }
          
          // 更新折线图
          var chartDom = document.getElementById('main-select');
          var myChart = echarts.init(chartDom);
          var option;
          
          var data = [];
          
          for (let i = 0; i < this.rptResult.Date.length; i++) {
            var d = this.rptResult.Date[i];
            data.push([d,selData[i]])
          }
          var dateList = data.map(function (item) {
              return item[0];
          });
          var valueList = data.map(function (item) {
              return item[1];
          });
          option = {
            // Make gradient line here
            visualMap: {
                show: false,
                type: 'continuous',
                seriesIndex: 0,
            },
            title: {
                left: 'center',
                text: selTitle
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
        // map animation
        refreshOpenlayer(){
          var that = this
          var styleFunction = function (feature) {
            // 获取要素名称和值
            var name = feature.get("name");
            var value = feature.get("value");
            var geometry = feature.getGeometry();
            //获取要素类型，点线面
            var type = feature.getGeometry().getType();
            var styles = [];
            var nodecolor = ""
            var linkcolor = ""

            // 计算色带步长
            var nodecolors = ["#fdd519", "#f8a114", "#f36f0f", "#ee430b", "#e90806"]
            var linkcolors = ["#51e1e6", "#40a9d9", "#3175ce", "#2549c4", "#140fb8"]
            if (type == "Point") {
              if (that.nodestep == 0) {
                nodecolor = nodecolors[0]
              }else{
                var index = Math.floor((value - that.nodemin)/that.nodestep)
                if (index == 5) index = 4
                nodecolor = nodecolors[index]
              }
              styles.push(
                new ol.style.Style({
                  image: new ol.style.Circle({
                    radius: 3,
                    fill: new ol.style.Fill({//填充样式
                        color: nodecolor,
                    }),
                  })
                })
              )
            } 
            else if (type == "LineString" || type == "MultiLineString") {
              if (that.linkstep == 0) {
                linkcolor = linkcolors[0]
              }else{
                var index = Math.floor((value - that.linkmin)/that.linkstep)
                if (index == 5) index = 4
                linkcolor = linkcolors[index]
              }
              styles.push(
                new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: linkcolor,
                    width: 2
                  }),
                })
              )
              if(type == "LineString"){
                // arrows
                geometry.forEachSegment(function (start, end) {
                  var dx = end[0] - start[0];
                  var dy = end[1] - start[1];
                  var arrow = [start[0]+dx/2,start[1]+dy/2]
                  var rotation = Math.atan2(dy, dx);
                  // arrows
                  styles.push(
                    new ol.style.Style({
                      geometry: new ol.geom.Point(arrow),
                      image: new ol.style.Icon({
                        src: 'https://gitee.com/apollozs/typora-images/raw/master/imgs/arrow2.svg',
                        anchor: [0.5, 0.5],
                        rotateWithView: true,
                        rotation: -rotation,
                      }),
                    })
                  );
                });
              }else{
                var linestrings = geometry.getLineStrings()
                for (let i = 0; i < linestrings.length; i++) {
                  var start = linestrings[i].flatCoordinates.slice(0,2)
                  var end = linestrings[i].flatCoordinates.slice(-2)
                  var dx = end[0] - start[0];
                  var dy = end[1] - start[1];
                  var arrow = [start[0]+dx/2,start[1]+dy/2]
                  var rotation = Math.atan2(dy, dx);
                  // arrows
                  styles.push(
                    new ol.style.Style({
                      geometry: new ol.geom.Point(arrow),
                      image: new ol.style.Icon({
                        src: 'https://gitee.com/apollozs/typora-images/raw/master/imgs/arrow2.svg',
                        anchor: [0.5, 0.5],
                        rotateWithView: true,
                        rotation: -rotation,
                      }),
                    })
                  );
                  
                }
              }
              
            } 
            else {
              styles.push(
                new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: '#ccc',
                    width: 1,
                  }),
                  fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)',
                  }),
                  text: new ol.style.Text({
                    font: '10px Garamond',
                    text:  name,
                  })
                })
              )
            }
            
            // 下面两句代码太耗时间 使用全局变量
            // var nodemin = Math.min.apply(null, that.nodeResultArr.join(",").split(","))
            // var nodestep = (Math.max.apply(null, that.nodeResultArr.join(",").split(",")) - nodemin)/5
              
            return styles;
          };

          // 先删除原来的图层
          if (this.vectorLayer != null) {
            this.map.removeLayer(this.vectorLayer)
          }
        
          var vectorSource = new ol.source.Vector({
            features: new ol.format.GeoJSON().readFeatures(this.geojsonObject),
          });
        
          this.vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: styleFunction,
          });
          
          this.map.addLayer(this.vectorLayer);
          
          this.loadingInterval = setInterval(() => {
            if (this.map.tileQueue_.getTilesLoading() == 0) {
              clearInterval(this.loadingInterval) 
              this.loading = false
              
            }
          }, 1000);
        },
        startAnimation(){
          //btn
          this.selectBtn = true
          this.startBtn = true
          this.pauseBtn = false

          this.intevalAnima = setInterval(()=>{
            if (this.numberAnima == this.rptResult.Date.length) {
              this.numberAnima = 0
              this.timeSlider = 1
            }
            for (let i = 0; i < this.rptResult.Node.length; i++) {// 更新geojsonObject
              var feat = this.geojsonObject.features[i];
              feat.properties.value = this.nodeResultArr[i][this.numberAnima]
            }
            for (let k = 0; k < this.rptResult.Link.length; k++) {// 更新geojsonObject
              var feat = this.geojsonObject.features[this.rptResult.Node.length + k];
              feat.properties.value = this.linkResultArr[k][this.numberAnima]
            }
            // 更新openlayer
            this.refreshOpenlayer()
            this.numberAnima++
            this.timeSlider++

          },200)
        },
        pauseAnimation(){
          //btn
          this.selectBtn = false
          this.startBtn = false
          this.pauseBtn = true

          clearInterval(this.intevalAnima)
        },
      
        changeTab(tab){
          if(tab.label == "Conduit"){
            this.initConduit()
          }
        },
        //conduit
        refreshConduit(){
          setTimeout(()=>{
            var dom = document.getElementById("conduit");
            var myChart = echarts.init(dom);
            var app = {};

            var bottomArr = []
            var topArr = []
            var nodeColumn = []
            // var maxDepth = this.rptResult.MaxMin.link.maxDepth
            var step = 1/(this.linkPathNodes.length-1)
            for (let i = 0; i < this.linkPathNodes.length; i++) {
              bottomArr.push(1-step*i);
              nodeColumn.push([
                { coord: [this.linkPathNodes[i], bottomArr[i]+0.75] },
                { coord: [this.linkPathNodes[i], bottomArr[i]+0.25] }
              ])
            }
            for (let i = 0; i < this.linkPathNodes.length; i++) {
              topArr.push(1.5-step*i);
            }

            var option;
            option = {

              color: [ '#666', '#666', '#37A2FF', '#FFBF00'],
              title: {
                  left: 'center',
                  text: this.startNode +"--"+ this.endNode
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: this.linkPathNodes
              },
              yAxis: {
                name:'Elevation(m)',
                nameGap:30,
                nameLocation:'center',
                type: 'value',
                max:2,
                axisLabel: {
                  formatter: function (value) {
                    var texts = [];
                    if(value<1){
                      texts.push('');
                    }
                    else if (value ==1) {
                        texts.push('X');
                    }
                    else if (value == 1.5) {
                        texts.push('X+0.5');
                    }
                    return texts;
                  }

                }
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'line',
                  label: {
                    backgroundColor: '#6a7985'
                  }
                },
                formatter: '{a1}: (X+1)m<br >{a2}: (x+{c2})m<br>{a0}: X m'
              },
              series: [
                {
                  name:'Bottom',
                  data: bottomArr,
                  stack: 'stack',
                  type: 'line',
                },{
                  name:'Top',
                  data: topArr,
                  type: 'line',
                },{
                  name:'Depth',
                  data: this.linkPathResult,
                  type: 'line',
                  stack: 'stack',
                  smooth: true,
                  areaStyle: {}
                },
                {
                  type: 'line',
                  markLine: {
                    name: 'node',
                    // symbol:'none',//去掉箭头
                    data: nodeColumn
                  }
                }
              ]
            };

            myChart.setOption(option);
          }, 0)
        },
        changeStartNode(){
          var linkPath = []
          var nextNode = this.startNode
          var endNodes = []
          var linkPathNodes = [nextNode]
          // find the nodes which are in the downstream path from this start node
          while (nextNode!="") {
            // find the link which is start from nextNode
            var flag = false
            for (let i = 0; i < this.rptResult.LinkFromTo.length; i++) {
              var link = this.rptResult.LinkFromTo[i];
              if(link[0] == nextNode){
                linkPath.push(this.rptResult.Link[i])
                nextNode = link[1]
                endNodes.push(nextNode)
                linkPathNodes.push(nextNode)
                flag = true
                break;
              }
            }
            // have fund the end node and link
            if(!flag){
              nextNode = ""
            }
          }
          this.endNode= endNodes[0]
          this.endNodes = endNodes
          this.linkPath = linkPath
          this.linkPathNodes = linkPathNodes
        },
        changeEndNode(){
          var linkPath = []
          var linkPathNodes = []
          for (let i = 0; i < this.endNodes.length; i++) {
            var end = this.endNodes[i];
            if (end == this.endNode) {
              linkPath = this.linkPath.slice(0,i+1)
              linkPathNodes = this.linkPathNodes.slice(0,i+2)
            }
          }
          this.linkPath = linkPath
          this.linkPathNodes = linkPathNodes
        },
        initConduit(){
          this.startNodes = this.rptResult.Node;
          this.startNode = this.startNodes[0]
          this.changeStartNode()
          this.endNode = this.linkPathNodes[1]
          this.confirmStartEndPoints()
        },
        confirmStartEndPoints(){
          // 还原slider
          this.conduitNumberAnima = 0
          this.conduitTimeSlider = 1

          this.startendSelectVisible = false;
          var linkPathResults = []
          var linkPathResult = []
          // the depth of conduit in linkPath
          for (let j = 0; j < this.linkPath.length; j++) {
            var link = this.linkPath[j];
            for (let i = 0; i < this.rptResult.LinkResults.length; i++) {
              var linkResult = this.rptResult.LinkResults[i];
              if(link == linkResult.name){
                linkPathResults.push(linkResult.Depth);
                break;
              }
            }
          }
          this.linkPathResults = linkPathResults
          linkPathResult.push(linkPathResults[0][0]) //sum(link) = sum(node) +1
          for (let i = 0; i < linkPathResults.length; i++) {
            var res = linkPathResults[i];
            linkPathResult.push(res[0])
          }
          this.linkPathResult = linkPathResult
          this.refreshConduit()
          
        },
        // conduit slider
        conduitSliderChange(val){
          this.conduitNumberAnima = val-1
          var linkPathResult = []
          linkPathResult.push(this.linkPathResults[0][this.conduitNumberAnima]) //sum(link) = sum(node) +1
          for (let i = 0; i < this.linkPathResults.length; i++) {
            var res = this.linkPathResults[i];
            linkPathResult.push(res[this.conduitNumberAnima])
          }
          this.linkPathResult = linkPathResult
          this.refreshConduit()
        },
        startConduitAnimation(){
          //btn
          this.conduitSelectBtn = true
          this.conduitStartBtn = true
          this.conduitPauseBtn = false

          this.conduitIntevalAnima = setInterval(()=>{
            if (this.conduitNumberAnima == this.rptResult.Date.length) {
              this.conduitNumberAnima = 0
              this.conduitTimeSlider = 1
            }

            var linkPathResult = []
            linkPathResult.push(this.linkPathResults[0][this.conduitNumberAnima]) //sum(link) = sum(node) +1
            for (let i = 0; i < this.linkPathResults.length; i++) {
              var res = this.linkPathResults[i];
              linkPathResult.push(res[this.conduitNumberAnima])
            }
            this.linkPathResult = linkPathResult

            this.refreshConduit()
            this.conduitNumberAnima++
            this.conduitTimeSlider++

          },200)
        },
        pauseConduitAnimation(){
          //btn
          this.conduitSelectBtn = false
          this.conduitStartBtn = false
          this.conduitPauseBtn = true

          clearInterval(this.conduitIntevalAnima)
        },
    },
    mounted(){
        setTimeout(()=>{
          this.initOpenLayer()          
        },0)
    }
}
</script>
<style>
    .map {
      width: 100%;
      height:400px;
    }
    .el-tabs--border-card>.el-tabs__content {
      padding: 0px;
    }
    .upload-demo{
      float: right;
      margin-top: -50px;
      margin-right: 10%;
    }
    .el-card__body {
      padding: 0px;
    }
    #time-slider{
      text-align: center;
    }
    .feature-radio{
      display: inline;
      width: 50%;
      margin: 10px;
    }
    .feature-ul{
      padding: 0 0 0 20px;
      text-align: left;
    }
    #popup-info{
      font-family: Helvetica;
      font-size: 0.8em;
      background: #f5f7fa;
      padding: 5px;
    }
</style>