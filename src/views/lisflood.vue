<template>
    <div>
        <div id="info"></div>
    </div>
</template>
<script>
import * as THREE from 'three'
// import image from '@/assets/image/earth.jpg'
import regGrid from '../json/data_reg.json'
import vertexJson from '../json/vertex_3857.json'
export default {
    data() {
        return {
            scene:'',
            flowData:[],
        }
    },
    methods: {
        // 规则格网箭头
        drawArrowsNew(flowData){
            let arrowsLayer = this.scene.getObjectByName('arrows');
            let arrowGroup = new THREE.Group();
            let isNew = arrowsLayer ? false : true;
            if (isNew) {
                arrowsLayer = new THREE.Group();
                arrowsLayer.name = 'arrows';
                this.scene.add(arrowsLayer);
            }

            const maxXY = [-Infinity, -Infinity];
            const minXY = [Infinity, Infinity];
            vertexJson.forEach(item => {
            const x = item[0]
            const y = item[1]
            maxXY[0] = maxXY[0] > x ? maxXY[0] : x;
            minXY[0] = minXY[0] < x ? minXY[0] : x;
            maxXY[1] = maxXY[1] > y ? maxXY[1] : y;
            minXY[1] = minXY[1] < y ? minXY[1] : y;
            })

            const center = [(maxXY[0] + minXY[0]) / 2, (maxXY[1] + minXY[1]) / 2];
            // console.log(center)
            this.center = center;

            console.log(flowData.length)
            for (let i = 0, l = flowData.length; i < l; i++) {
                const startPoint = [(flowData[i][0] - center[0]) * 0.82, (flowData[i][1] - center[1]) * 0.82, 0];
                const endPoint = [(flowData[i][2] - center[0]) * 0.82, (flowData[i][3] - center[1]) * 0.82, 0];

                // 计算流场的大小
                const flowPower = flowData[i][4] * 150;

                const origin = new THREE.Vector3(startPoint[0], startPoint[1], startPoint[2]);
                const direction = new THREE.Vector3(endPoint[0] - startPoint[0], endPoint[1] - startPoint[1], 0).normalize();
                const headLength = flowPower * 0.4;
                const headWidth = flowPower * 0.4 * 0.4;

                if (!isNew) {
                    arrowsLayer.children[0].children[i].setLength(flowPower, headLength, headWidth);
                    arrowsLayer.children[0].children[i].setDirection(direction);
                } else {
                    const arrows = new THREE.ArrowHelper(direction, origin, flowPower, 0x404040, headLength, headWidth);
                    // 再包一层旋转，因为最外层会受cesium的控制，再进行一次定位
                    arrowGroup.add(arrows);
                    arrowGroup.rotation.z = Math.PI;
                    this.scene.add(arrows)

                    arrowsLayer.add(arrowGroup);
                }
            }
            let that = this;
            var render = function() {
                requestAnimationFrame(render);
                //更新场景代码放在这里
                that.renderer.render(that.scene, that.camera);
            };
            render();
        },
        init() {
            // 获取容器的宽高
            // const { clientWidth, clientHeight } = this.container;
            this.scene = new THREE.Scene();

            //创建相机  这些参数在官网中都有指出  第一个参数 45 -> 视野角度（单位：度）  第二个参数是长宽比 第三个是近截面 第四个是远截面
            // 只有离相机的距离大于near值，小于far值，且在相机的可视角度之内，才能被相机投影到。
            // this.camera = new THREE.PerspectiveCamera(45, clientWidth / clientHeight, 1, 1000 * 1000 * 10);
            this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
            this.renderer = new THREE.WebGLRenderer({ alpha: true });
            //将整个场景推入我们要显示的元素中
            document.body.appendChild( this.renderer.domElement );
            this.camera.position.y = 1;
            this.camera.position.z = 5;
        }
    },
    mounted(){
        this.init();
        this.flowData = regGrid[0];
        // this.drawArrowsNew(this.flowData);
    },
    created(){    
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        camera.position.y = 1;
        camera.position.z = 5;

        //构建场景代码放在这里
        var dir = new THREE.Vector3(1, 2, 0);

        //normalize the direction vector (convert to vector of length 1)
        dir.normalize();

        var origin = new THREE.Vector3(0, 0, 0);
        var length = 1;
        var hex = 0xffff00;

        var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        scene.add(arrowHelper);

        var render = function() {
            requestAnimationFrame(render);
            //更新场景代码放在这里
            renderer.render(scene, camera);
        };

        render();
        
    }
}
</script>
<style>
body { margin: 0; }
canvas { width: 100%; height: 100% }
</style>