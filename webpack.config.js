const path = require("path");

module.exports = {
    entry: {
        "index": "./src/index.js"
    },

    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        libraryTarget: 'umd'
    },

    module: {

        loaders: [
            { test: /\.jsx?$/, exclude: /(node_modules|bower_components)/, loader: 'babel' },
        ]
    }
};