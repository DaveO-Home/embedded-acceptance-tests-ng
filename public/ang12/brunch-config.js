const path = require("path");
const isProduction = process.env.NODE_ENV === "production";
const deployDir = isProduction ? "dist/brunch" : "dist_test/brunch";
// const fontLocation = isProduction ? "../fonts" : process.env.USE_WATCH === "true" || process.env.USE_HMR === "true" ? "fonts" : "../fonts";
const singleRun = process.env.USE_HMR !== "true" && !process.env.USE_TDD;
const htmlFile = isProduction ? "brunch/appl/testapp.html" : "brunch/appl/testapp_dev.html";
const htmlFiles = [htmlFile, "brunch/appl/app_bootstrap.html", "brunch/appl/app_footer.html"];
if(!isProduction) {
    htmlFiles.push("brunch/appl/testapp_dev.htm");
}
// eslint-disable-next-line no-unused-vars
function resolve(dir) {
  return path.join(__dirname, "brunch", dir);
}

exports.paths = {
  public: deployDir,
  watched: ["brunch/appl", "brunch/jasmine"]
};

exports.files = {
  javascripts: {
    joinTo: {
      "vendor.js": /^(?!brunch\/appl)/,
      "acceptance.js": [/^brunch\/appl/, /^brunch\/jasmine/]
    }
  },
  templates: {
    joinTo: "acceptance.js"
  },
  stylesheets: {
    joinTo: "acceptance.css",
    order: {
      after: [
        "brunch/appl/css/site.css"
      ]
    }
  }
};

const pluginsObject = {
  stripcode: {
    start: "develblock:start",
    end: "develblock:end"
  },
  // See README.md for implementation
  // eslint: {
  //   pattern: /^brunch\/appl\/.*\.js?$/,
  //   warnOnly: true
  // },
  brunchTypescript: {
    "baseUrl": "./",
    "outDir": "",
    "typeRoots": [
      "node_modules/@types"
    ],
    ignoreErrors: false,
    allowJs: true
  },
  copycat: {
    "appl/views": ["brunch/appl/views"],
    "appl/templates": ["brunch/appl/templates"],
    "appl/dodex": ["brunch/appl/dodex"],
    "./": ["../README.md"],
    "appl": htmlFiles,
    "images": ["brunch/images"],
    "appl/css": ["brunch/appl/css/table.css", "brunch/appl/css/hello.world.css"],
    "img": ["node_modules/jsoneditor/dist/img/jsoneditor-icons.svg"],
    verbose: false,
    onlyChanged: true
  }
};

exports.plugins = pluginsObject;

exports.npm = {
  enabled: true,
  globals: {
    jQuery: "jquery",
    $: "jquery",
    bootstrap: "bootstrap"
  },
  styles: {
    bootstrap: ["dist/css/bootstrap.css"],
    tablesorter: [
      "dist/css/jquery.tablesorter.pager.min.css",
      "dist/css/theme.blue.min.css"
    ],
    dodex: ["dist/dodex.min.css"],
    jsoneditor: ["dist/jsoneditor.min.css"]
  },
  aliases: {
    handlebars: "handlebars/dist/handlebars.min.js",
    pager: "tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js",
    marked: "marked/marked.min.js"
  }
};

exports.server = {
  port: 3080,
  base: "/",
  stripSlashes: true
};

pluginsObject.karmat = require("./brunch/build/karma.conf");
pluginsObject.karmat.singleRun = singleRun;

exports.overrides = {
  production: {
    paths: {
      watched: ["brunch/appl"]
    },
    conventions: {
      ignored: ["brunch/jasmine"]
    },
    plugins: {
      off: ["karmat"]
    }
  }
};

