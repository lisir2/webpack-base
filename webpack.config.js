const path = require('path');
const glob = require('glob');
// 设置模板
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 每次打包清楚打包的dist文件夹
const { CleanWebpackPlugin } = require('clean-webpack-plugin');  //每次打包清理掉 之前打包内容
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); //抽离css 样式外部引入
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"); //css压缩
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");//优化js如压缩
const fs = require('fs');  //fs 核心模块，用来读取文件 写入文件等
const webpack = require('webpack');

// 公共配置
var common = {
    // 封装读取文件的方法
    getDir: function (src) {
        var page = {};
        var file = fs.readdirSync(path.resolve(__dirname, src));
        file.forEach(ele => {
            let filename = ele.split('.')[0]
            let filepath = path.resolve(__dirname, `${src}/${ele}`);
            page[filename] = filepath;
        })
        return page;
    },
    // 封装动态创建 HtmlWebpackPlugin 模板方法
    plugins: function () {
        // plugins 默认文件
        var PluginsArr = [
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({ filename: "./css/[name].css" }),  //抽离css样式
            new webpack.HotModuleReplacementPlugin()  //使用webpack自带的，热更新插件。
        ];
        var pageHtml = common.getDir('./public');
        for (var item in pageHtml) {
            var conf = {
                filename: item + '.html',
                template: './public/' + item + '.html',
                chunks: [item]
            }
            PluginsArr.push(new HtmlWebpackPlugin(conf))
        }
        return PluginsArr;
    }
}


module.exports = {
    mode: 'production', //  development
    entry: common.getDir('./src/js'),
    output: {
        filename: './js/[name].js',
        path: path.resolve(__dirname, 'dist')  //__dirname：当前路径全局变量
    },
    optimization: {//优化项
        minimizer: [
            new UglifyJsPlugin({
                cache: true,//缓冲
                parallel: true, //并发打包,一次打包多个
                sourceMap: true,//源码调试
            }),
            new OptimizeCSSAssetsPlugin()//优化css为压缩格式
        ]
    },
    // 插件配置
    plugins: common.plugins(),
    devServer: {
        port: 3000,  //webpack-dev-server webpack服务
        host: 'localhost', //服务器地址
        open: false,  // 自动打开浏览器
        contentBase: './dist',  //本地服务器所加载页面的页面的目录  默认打开index.html页面
        hot: true  //热更新，修改代码后，不刷新整个页面
    },
    module: {
        rules: [
            {
                test: /\.(css||less)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader'
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/, //处理图片打包
                loader: 'url-loader',
                options: {
                    // 把较小的图片转换成base64的字符串内嵌在生成的js文件里
                    limit: 100, //10000
                    // 路径和生产环境下的不同，要与修改后的publickPath相结合
                    // name: 'images/[name].[ext]?[hash:7]',
                    name: '[name].[ext]',
                    // publicPath: '../', //会在打包后图片路径拼上该设置
                    outputPath: './img/'//输出的图片会生成并放在当前设置的文件夹下
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',  //处理html页面img标签引入图片进行处理
                        options: {
                            minimize: true,
                            removeComments: false,
                            collapseWhitespace: false
                        }
                    }
                ]
            }
        ]
    }
};

