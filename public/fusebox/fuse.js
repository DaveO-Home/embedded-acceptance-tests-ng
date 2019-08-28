/* eslint quotes: ["error", "double"] semi: ["error"] */
/* eslint-env es6 */
const exec = require("child_process").exec;
const fs = require("fs");
const {
    FuseBox,
    QuantumPlugin,
    WebIndexPlugin,
    HTMLPlugin,
    CSSPlugin,
    CSSResourcePlugin
    // UglifyJSPlugin,
    // HMRPlugin,
    // EnvPlugin,
    // BabelPlugin
} = require("fuse-box");
const BlockStripPlugin = require("./appl/js/plugin/BlockStrip").BlockStrip;
const CopyFsPlugin = require("./appl/js/plugin/CopyFs").CopyFs;
const aliases = {
    "apptest": "../jasmine/apptest.js",
    "contacttest": "./contacttest.js",
    "domtest": "./domtest.js",
    "logintest": "./logintest.js",
    "routertest": "./routertest.js",
    "toolstest": "./toolstest.js",
    "app": "~/js/app",
    "config": "~/js/config",
    "default": "~/js/utils/default",
    "helpers": "~/js/utils/helpers",
    "pager": "tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js",
    "pdf": "~/js/controller/pdf",
    "menu": "~/js/utils/menu",
    "basecontrol": "~/js/utils/base.control",
    "setup": "~/js/utils/setup",
    "setglobals": "~/js/utils/set.globals",
    "setimports": "~/js/utils/set.imports",
    "start": "~/js/controller/start",
    "table": "~/js/controller/table",
    "handlebars": "handlebars/dist/handlebars.min.js"
};
let isKarma = process.env.USE_KARMA === "true";
let isProduction = process.env.NODE_ENV === "production";
let distDir = isProduction ? "../dist/fusebox" : "../dist_test/fusebox";
let useQuantum = true;
let useHMR = process.env.USE_HMR === "true";
let resources = (f) => (!isProduction && isKarma ? `/base/dist_test/fusebox/resources/${f}` : isProduction ? `../resources/${f}` : `/dist_test/fusebox/resources/${f}`);
let src = "appl";

if (!isProduction && fs.existsSync("../.fusebox")) {
    exec("rm -r ../.fusebox");
}

const fuse = FuseBox.init({
    //    experimentalFeatures: false,
    homeDir: src,
    output: `${distDir}/$name-$hash.js`,
    target: "browser@es5",
    hash: isProduction,
    log: true,
    debug: true,
    cache: !isProduction,
    sourceMaps: isProduction && !isKarma,
    alias: aliases,
    allowJs: true,
    tsConfig: "tsconfig.json",
    shim: {
        jquery: {
            source: "../node_modules/jquery/dist/jquery.js",
            exports: "$"
        }
    },
    useTypescriptCompiler: true,
    allowSyntheticDefaultImports: true,
    plugins: [
        isProduction && BlockStripPlugin({
            options: {
                start: "develblock:start",
                end: "develblock:end"
            }
        }),
        WebIndexPlugin({
            template: isProduction ? "./appl/testapp.html" : "./appl/testapp_dev.html",
            target: isProduction ? "appl/testapp.html" : "appl/testapp_dev.html",
            path: "../"
        }),
        HTMLPlugin({
            useDefault: false
        }),
        isProduction && useQuantum && QuantumPlugin({
            target: "browser",
            api: (core) => {
                core.solveComputed("moment/moment.js");
            },
            bakeApiIntoBundle: "vendor",
            uglify: true,
            treeshake: true,
            manifest: false
        }),
        // isProduction && BabelPlugin({
        //     presets: ["es2015", "angular2"]
        // }),
        ["node_modules/font-awesome/**.css",
            CSSResourcePlugin({
                dist: distDir + "/resources",
                resolve: resources
            }), CSSPlugin()
        ],
        CSSPlugin(),
        CopyFsPlugin({
            copy: [{ from: "appl/views/**/*", to: distDir + "/appl/views" },
            { from: "appl/templates/**/*", to: distDir + "/appl/templates" },
            { from: "appl/index.html", to: distDir + "/" },
            { from: "index.html", to: distDir + "/" },
            { from: "images/*", to: distDir + "/images" },
            { from: "appl/assets/*", to: distDir + "/appl/assets" },
            { from: "../README.md", to: distDir },
            { from: "appl/css/table.css", to: distDir + "/" },
            { from: "appl/css/hello.world.css", to: distDir + "/" },
            { from: "appl/app_bootstrap.html", to: distDir + "/" }
            ]
        })
    ]

});

if (!isProduction) {
    if (useHMR === true) {
        fuse.dev({
            root: "../",
            port: 3080,
            open: false
        });
    }

    fuse.bundle("vendor")
        .target("browser")
        .instructions("~ main.ts");

    var acceptance = fuse.bundle("index")
        .target("browser")
        .instructions("> [main.ts]");

    if (useHMR === true) {
        acceptance.hmr({ reload: true })
            .watch();
    }
} else {
    fuse.bundle("vendor")
        .target("browser@es5")
        .sourceMaps(true)
        .instructions("~ main.ts");

    fuse.bundle("index")
        .target("browser@es5")
        .sourceMaps(false)
        .instructions("!> [main.ts]");
}

fuse.run();
