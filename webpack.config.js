const path = require('path')

module.exports = {
    "entry": "./src/index.js",
    "output": {
        path: path.resolve(__dirname, 'lib'),
        filename: "doccrypt.js"
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
            {
                test: /\css$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: "babel-loader"
                    },
                ]
            }
        ]
    },
    resolve: {
        fallback: {
            stream: false,
            crypto: require.resolve('crypto-browserify'),
        }
    }
}