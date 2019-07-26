const path = require('path');
const glob = require('glob');
// 设置模板
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 每次打包清楚打包的dist文件夹
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const fs = require('fs');

var page = {};

function getDir(src) {
     var file = fs.readdirSync(path.resolve(__dirname,src));
     file.forEach(ele=>{
         let filename = ele.split('.')[0]
         let filepath = path.resolve(__dirname, `./src/${ele}`);
         page[filename] = filepath;
     })
    console.log(page)
    return page;
}

module.exports = {
    entry: getDir('./src'),
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Output Management',
            filename: 'index.html',
            template: './public/index.html',
        })
    ],
};