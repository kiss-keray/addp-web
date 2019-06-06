export default {
    "extraBabelPlugins": [
        ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": "css" }]
    ],
    "disableCSSModules": true,
    "env": {
        "development": {
            "proxy": {
                "/": {
                    "target": "http://localhost:8080/",
                    "changeOrigin": true,
                    "pathRewrite": { "^/": "" }
                }
            },
            "BROWSER": 'none'
        },
        "production": {
            "BROWSER": 'none'
        }
    },
    define: {
        'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            API_ENV: JSON.stringify(process.env.API_ENV)
        }
    },
}
