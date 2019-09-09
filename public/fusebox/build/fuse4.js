/*eslint quotes: [2, "double", {"avoidEscape": true, "allowTemplateLiterals": true}]*/
/*eslint no-unused-vars: 0 no-console: 0*/
/*eslint-env es6*/
const path = require("path");
const { fusebox, sparky } = require("fuse-box");
const { pluginStripCode } = require("../appl/js/plugin/StripCode");
let isProduction = process.env.NODE_ENV === "production";
let distDir;
let copyDir;
let devServe = {
    httpServer: {
        root: distDir,
        port: 3080,
        open: false
    },
};
let config = {};

class Context {
    getConfig() {
        return fusebox(config);
    }
}

const run = function (mode, configure, debug, cb) {
    if ("-d" === process.argv[3] || debug) {
        console.log(configure);
    }
    distDir = mode !== "test" ? path.join(__dirname, "../../dist/fusebox") : 
        path.join(__dirname, "../../dist_test/fusebox");
    copyDir = mode !== "test" ? path.join(__dirname, "../../dist/fusebox/appl") : 
        path.join(__dirname, "../../dist_test/fusebox/appl");
    isProduction = mode !== "test";
    config = configure;

    if (mode !== "test") {
        addStripCodePlugin(config);
    }

    const { task, src, exec, rm } = sparky(Context);

    task("clean", context => {
        rm(distDir);
    });

    task("cache", context => {
        rm(`${__dirname}/.cache`);
    });

    task("copy", async context => {
        try {
            await src(path.join(__dirname, "../appl/views/**/**.*"))
                .dest(`${copyDir}`, "appl")
                .exec();
            await src(path.join(__dirname, `../appl/templates/**/**.*`))
                .dest(`${copyDir}`, "appl")
                .exec();
            await src(path.join(__dirname, `../appl/assets/**/**.*`))
                .dest(`${copyDir}`, "appl")
                .exec();
            await src(path.join(__dirname, `../images/*.*`))
                .dest(`${copyDir}/..`, "fusebox")
                .exec();
            await src(path.join(__dirname, `../appl/app_bootstrap.html`))
                .dest(`${copyDir}`, "appl")
                .exec();
            await src(path.join(__dirname, `../../README.md`))
                .dest(`${copyDir}/..`, "public")
                .exec();
            await src(path.join(__dirname, `../../README.md`))
                .dest(`${copyDir}/../..`, "public")
                .exec();
            if (isProduction) {
                await src(path.join(__dirname, `../index.html`))
                    .dest(`${copyDir}/..`, "fusebox")
                    .exec();
            } else {
                await src(path.join(__dirname, `../static/index.html`))
                    .dest(`${copyDir}/..`, "static")
                    .exec();
            }
            await src(path.join(__dirname, `../appl/dodex/data/**/**.*`))
                .dest(`${copyDir}`, "appl")
                .exec();
        } catch (e) { console.error(e); }
    });

    task("copytable", async context => {
        await src(path.join(__dirname, "../appl/css/table.css"))
            .dest(`${copyDir}`, "appl")
            .exec();
    });

    task("copyhello", async context => {
        await src(path.join(__dirname, "../appl/css/hello*.css"))
            .dest(`${copyDir}`, "appl")
            .exec();
    });

    task("test", async context => {
        devServe.httpServer.root = distDir;
        await exec("clean");
        await exec("cache");
        await exec("copy");
        await exec("copytable");
        await exec("copyhello");
        const fuse = context.getConfig();
        fuse.runDev(handler => {
            handler.onComplete(output => {
                if (typeof cb === "function") {
                    cb(); // restart gulp task, tests will start
                }
            });
        });
    });

    task("preview", async context => {
        devServe.httpServer.root = distDir;
        await exec("clean");
        await exec("copy");
        await exec("copytable");
        await exec("copyhello");
        const fuse = context.getConfig();
        await fuse.runProd({ uglify: false });
        if (typeof cb === "function") {
            cb();
        }
    });

    task("prod", async context => {
        await exec("clean");
        await exec("copy");
        await exec("copytable");
        await exec("copyhello");
        const fuse = context.getConfig();
        await fuse.runProd({ uglify: true });
        if (typeof cb === "function") {
            cb();
        }
    });

    task("default", context => {
        switch (mode) {
            case "preview":
                    exec("preview");
                break;
            case "prod":
                    exec("prod");
                break;
            case "copy":
                copyDir = path.join(__dirname, "../../dist_test/fusebox/appl");
                exec("copy");
                exec("copytable");
                exec("copyhello");
                break;
            case "test":
            default:
                exec("test");
                break;
        }
    });
}

function addStripCodePlugin(config) {
    const whichFiles = /(\/js\/.*\.js|index(\.js|\.ts))/;
    const startComment = "develblock:start";
    const endComment = "develblock:end";
    try {
        config.plugins = [pluginStripCode(whichFiles, { "start": startComment, "end": endComment })]
    } catch (e) {
        console.error(e);
        process.exit(-1);
    }
}

module.exports = run;
