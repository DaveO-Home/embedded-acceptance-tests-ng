const runFusebox = require("./fuse4.js");
const path = require("path");
let mode = "test";
if(process.argv[2]) {
    mode = process.argv[2];
}

const appSrc = "../appl";
let toDist = "";
let isProduction = mode !== "test";
let distDir = isProduction ? "../../dist/fusebox" : "../../dist_test/fusebox";
let defaultServer = mode !== "prod";
let devServe = {
    httpServer: {
        root: "../../",
        port: 3080,
        open: false
    },
};
const configure = {
    target: "browser",
    env: { NODE_ENV: isProduction ? "production" : "development" },
    homeDir: appSrc,
    entry: "main.ts",
    output: `${distDir}${toDist}`,
    cache: {
        root: ".cache",
        enabled: !isProduction
    },
    sourceMap: !isProduction,
    webIndex: {
        distFileName: isProduction ? "appl/testapp.html" : "testapp_dev.html",
        publicPath: "../",
        template: isProduction ? path.join(__dirname, "../appl/index.html") : "index_dev.html"
    },
    tsConfig: "tsconfig.json",
    watch: !isProduction,
    hmr: !isProduction,
    devServer: defaultServer ? devServe : false,
    logging: { level: "succinct" },
    turboMode: true,
    exclude: isProduction ? "**/*test.js" : "",
    resources: {
        resourceFolder: "./appl/resources",
        resourcePublicRoot: isProduction ? "appl/resources" : "./resources",
      }
};

try {
runFusebox(mode, configure);
} catch(e) {console.log(e)}
