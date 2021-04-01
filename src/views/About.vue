<template>
  <div class="about">
    <h1>This is an about page</h1>
    <span>{{test}}</span>
  </div>
</template>

<script>
export default {
  data(){
    return{
      test:''
    }
  },
  methods:{
    testBack(){
      let _this = this;
      this.$axios.get('/api/testBack',{params:{uid:'lll'}})
      .then(res=>{
        console.log(res);
        _this.test = res.data.data;
      })
    }
  },
  mounted(){
    let that = this;
    that.testBack();
  }
}
</script>
