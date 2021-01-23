const path = require("path");
const isProduction = process.env.NODE_ENV === "production";
const deployDir = isProduction ? "dist/brunch" : "dist_test/brunch";
const fontLocation = isProduction ? "../fonts" : process.env.USE_WATCH === "true" || process.env.USE_HMR === "true" ? "fonts" : "../fonts";
const singleRun = process.env.USE_HMR !== "true" && !process.env.USE_TDD;
const htmlFile = isProduction ? "brunch/appl/testapp.html" : "brunch/appl/testapp_dev.html";

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
    "./": ["README.md"],
    "appl": [htmlFile, "brunch/appl/app_bootstrap.html"],
    "appl/images": ["brunch/images"],
    "appl/css": ["brunch/appl/css/table.css", "brunch/appl/css/hello.world.css"],
    verbose: false,
    onlyChanged: true
  }
};

pluginsObject.copycat[fontLocation] = ["node_modules/font-awesome/fonts"];

exports.plugins = pluginsObject;

exports.npm = {
  enabled: true,
  globals: {
    jQuery: "jquery",
    $: "jquery",
    bootstrap: "bootstrap",
    Popper: "popper.js"
  },
  styles: {
    bootstrap: ["dist/css/bootstrap.css"],
    "font-awesome": ["css/font-awesome.css"],
    tablesorter: [
      "dist/css/jquery.tablesorter.pager.min.css",
      "dist/css/theme.blue.min.css"
    ],
    dodex: ["dist/dodex.min.css"],
    jsoneditor: ["dist/jsoneditor.min.css"]
  },
  aliases: {
    handlebars: "handlebars/dist/handlebars.min.js",
    pager: "tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js"
  }
};

exports.server = {
  port: 3080,
  base: "/",
  stripSlashes: true
};

pluginsObject.karma = require("./brunch/build/karma.conf");
pluginsObject.karma.singleRun = singleRun;

exports.overrides = {
  production: {
    paths: {
      watched: ["brunch/appl"]
    },
    conventions: {
      ignored: ["brunch/jasmine"]
    },
    plugins: {
      off: ["karma"]
    }
  }
};

