const path = require('path');
const glob = require('glob');
// 设置模板
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 每次打包清楚打包的dist文件夹
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const optimizeCss = require('optimize-css-assets-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");//优化js如压缩


const fs = require('fs');

// 公共配置
var common = {
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
    plugins:function () {
        // plugins 默认文件
        var PluginsArr = [new CleanWebpackPlugin(), new MiniCssExtractPlugin({ filename: "./css/[name].css" })];
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
        path: path.resolve(__dirname, 'dist')
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
    plugins: common.plugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ]
            },
            {
                test: /\.less$/,  //打包less 需要 安装 less 和 less-loader两个依赖
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader'
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,    //处理图片打包
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
                        loader: 'html-loader',
                        options: {
                            minimize: true,
                            removeComments: false,
                            collapseWhitespace: false
                        }
                    }
                ]
            },
        ]
    }
};

