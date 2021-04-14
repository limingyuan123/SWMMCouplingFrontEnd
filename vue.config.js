const webpack = require("webpack");
module.exports = {
    lintOnSave:false,//关闭ESLint代码检验
    devServer:{
        open:true,//run启动的时候是否弹出页面
        host:'0.0.0.0',//本机地址
        port:'8082',//端口号
        https:false,
        hotOnly:false,
        proxy:{
            //配置跨域
            '/api':{
                target:'http://localhost:8086',
                ws:true,
                timeout:3600000,
                changOrigin:true,
                pathRewrite:{
                    '^/api':'',
                }
            },
        }
    },
    configureWebpack: {
        plugins: [
          new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            Popper: ["popper.js", "default"]
          })
        ]
      }
}