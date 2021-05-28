<template>
    <div class="leftTools">
        <el-tabs v-model="activeName" @tab-click="handleClick"  type="card" style="height:100%" stretch="true">
            <el-tab-pane label="File" name="first">
                <!-- File -->
                <div class="detail">
                    <p>You can perform a series of file operations, including loading project files, importing configuration files, and saving result files

</p>
                </div>
                <el-button class="file" style="background:#d4d7d8;margin:5px">
                    <h2 style="margin:5px;">Load Project File</h2>
                    <p>load your project file, example inp file</p>
                </el-button>
                <el-button class="file" style="background:#d4d7d8;margin:5px">
                    <h2 style="margin:5px;">Import Configure File</h2>
                    <p>importing configuration files</p>
                </el-button>
                <el-button class="file" style="background:#d4d7d8;margin:5px">
                    <h2 style="margin:5px;">Save Result File</h2>
                    <p>saving result files</p>
                </el-button>

            </el-tab-pane>
            <el-tab-pane label="Operation" name="second">Operation</el-tab-pane>
            <el-tab-pane label="Simulation" name="third">Simulation</el-tab-pane>
            <el-tab-pane label="Coupling analysis" name="fourth">Coupling analysis</el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
export default {
    data(){
        return{
            activeName: 'first'    
        }
    },
    methods:{
      handleClick(tab, event) {
        console.log(tab, event);
      }
    },
    mounted(){

    }
}
</script>
<style>
.leftTools{
    background: white;
    height: 100%;
}
.file{
    width: 100%;
    height: 80px;
}
</style>