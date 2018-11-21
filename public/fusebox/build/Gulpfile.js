/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'accept' -> ('eslint', 'csslint') -> 'bootlint' -> 'build'
 */
const copy = require('gulp-copy');
const csslint = require('gulp-csslint');
const env = require("gulp-env");
const eslint = require('gulp-eslint');
const exec = require('child_process').exec;
const gulp = require('gulp');
const log = require("fancy-log");
const Server = require('karma').Server;
const chalk = require('chalk');
const rmf = require('rimraf');

let lintCount = 0
let dist = "dist_test/fusebox"
let distProd = "dist/fusebox"
let isProduction = false
let browsers = process.env.USE_BROWSERS
let useNg = '';
let runSingle = true;

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}
var isWindows = /^win/.test(process.platform);
var initialTask;
/**
 * Default: Production Acceptance Tests 
 */
gulp.task('pate2e', ['accept'], function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ''
    runSingle = true
    runKarma(done);
});

/**
 * Add in Angular unit tests 
 */
gulp.task('pat', ['pate2e'], function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = '.ng'
    runSingle = true
    runKarma(done);
});

/*
 * javascript linter
 */
gulp.task('eslint', ['pat'], () => {
    var stream = gulp.src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: 'eslintConf.json',
            quiet: 1,
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(result => {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on('end', function () {
        log("# javascript files linted: " + lintCount);
    });

    stream.on('error', function () {
        process.exit(1);
    });

    return stream;
});
/*
 * css linter
 */
gulp.task('csslint', ['pat'], function () {
    var stream = gulp.src(['../appl/css/site.css'
    ])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('error', function () {
        process.exit(1);
    });
});

/*
 * Build the application to run karma acceptance tests
 */
gulp.task('accept', ['clean-test'], function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=development; export USE_KARMA=true; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=development & set USE_KARMA=true & set USE_HMR=false & ';
    }

    exec(osCommands + 'node fuse.js', function (err, stdout, stderr) {
        log(chalk.cyan('Building Test - please wait......'))
        let cmd = exec(osCommands + 'node fuse.js');
        cmd.stdout.on('data', (data) => {
            if (data && data.length > 0) {
                console.log(data.trim());
            }
        });
        cmd.stderr.on('data', (data) => {
            if (data && data.length > 0)
                console.log(data.trim())
        });
        return cmd.on('exit', (code) => {
            log(chalk.green(`Build successful - ${code}`));
            cb()
        });
    });
});

/*
 * Build the application to the production distribution 
 */
gulp.task('build', ['bootlint', 'clean'], function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=production; export USE_KARMA=false; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=production & set USE_KARMA=false & set USE_HMR=false & ';
    }

    log(chalk.cyan('Production Build - please wait......'))
    let cmd = exec(osCommands + 'node fuse.js');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        if (data && data.length > 0)
            console.log(data.trim())
    });
    return cmd.on('exit', (code) => {
        log(chalk.green(`Build successful - ${code}`));
        cb()
    });

});

/*
 * Build the application to the production distribution 
 */
gulp.task('build-prod', ['clean-only'], function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=production; export USE_KARMA=false; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=production & set USE_KARMA=false & set USE_HMR=false & ';
    }

    log(chalk.cyan('Production Build - please wait......'))
    let cmd = exec(osCommands + 'node fuse.js');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        if (data && data.length > 0)
            console.log(data.trim())
    });
    return cmd.on('exit', (code) => {
        log(chalk.green(`Build successful - ${code}`));
        cb()
    });

});

/*
 * Bootstrap html linter 
 */
gulp.task('bootlint', ['eslint', 'csslint'], function (cb) {
    exec('gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {
        log(stdout);
        log(stderr);

        cb(err);
    });
});

/**
 * Remove previous build
 */
gulp.task('clean', ['bootlint'], function (done) {    
    return rmf('../../' + distProd, [], (err) => {
        if (err) {
            log(err)
        }
        done()
        });
    });

    gulp.task('clean-only', [], function (done) {    
        return rmf('../../' + distProd, [], (err) => {
            if (err) {
                log(err)
            }
            done()
            });
        });

    gulp.task('clean-test', [], function (done) {    
        return rmf('../../' + dist, [], (err) => {
            if (err) {
                log(err)
            }
            done()
            });
        });
/*
 * Build the application to run karma acceptance tests with hmr
 */
gulp.task('fusebox-hmr', function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=development; export USE_KARMA=false; export USE_HMR=true; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=development & set USE_KARMA=false & set USE_HMR=true & ';
    }

    log(chalk.cyan('Configuring HMR - please wait......'))
    let cmd = exec(osCommands + 'node fuse.js');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        if (data && data.length > 0)
            console.log(data.trim())
    });
    return cmd.on('exit', (code) => {
        log(chalk.green(`Build successful - ${code}`));
        cb()
    });
});
/*
 * Build the application to run node express so font-awesome is resolved
 */
gulp.task('fusebox-rebuild', function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=development; export USE_KARMA=false; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=development & set USE_KARMA=false & set USE_HMR=false & ';
    }

    exec(osCommands + 'node fuse.js', function (err, stdout, stderr) {
        log(chalk.cyan('Rebuilding - please wait......'))
        let cmd = exec(osCommands + 'node fuse.js');
        cmd.stdout.on('data', (data) => {
            if (data && data.length > 0) {
                console.log(data.trim());
            }
        });
        cmd.stderr.on('data', (data) => {
            if (data && data.length > 0)
                console.log(data.trim())
        });
        return cmd.on('exit', (code) => {
            log(chalk.green(`Build successful - ${code}`));
            cb()
        });
    });
});
/**
 * Run karma/jasmine tests once and exit
 */
gulp.task('fb-test', function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true;
    return runKarma(done);
});

/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
gulp.task('e2e-test', function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true;
    return runKarma(done);  
});

/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
gulp.task('ng-test', function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true
    useNg = ".ng"
    return runKarma(done);  
});

/**
 * Continuous testing - test driven development.  
 */
gulp.task('fusebox-tdd', function (done) { //,['accept']
    initialTask = this.seq.slice(-1)[0];

    if (!browsers) {
        global.whichBrowsers = ['Chrome', 'Firefox'];
    }

    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
});

/**
 * Karma testing under Opera. -- needs configuation  
 */
gulp.task('tddo', function (done) {
    if (!browsers) {
        global.whichBrowsers = ['Opera'];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
});

/**
 * Resources and content copied to dist_test directory - for development
 */
gulp.task('copy', ['copy_images'], function () {
    return copySrc();
});
gulp.task('copy_images', function () {
    return copyImages();
});

gulp.task('default', ['pat', 'eslint', 'csslint', 'bootlint', 'build']);
gulp.task('prod', ['pat', 'eslint', 'csslint', 'bootlint', 'build']);
gulp.task('prd', ['build-prod']);
gulp.task('test', ['pat']);
gulp.task('tdd', ['fusebox-tdd']);
gulp.task('hmr', ['fusebox-hmr']);
gulp.task('rebuild', ['fusebox-rebuild']);
gulp.task('acceptance', ['e2e-test']);
gulp.task('ngtest', ['ng-test']);
gulp.task('e2e', ['e2e-test']);

function copySrc() {
    return gulp
        .src(['../appl/views/**/*', '../appl/templates/**/*', '../appl/index.html', isProduction ? '../appl/testapp.html' : '../appl/testapp_dev.html'])
        .pipe(copy('../../' + dist + '/appl'));
}

function copyImages() {
    return gulp
        .src(['../images/*', '../../README.md', 'css/table.css', 'css/hello.world.css', 'app_bootstrap.html'])
        .pipe(copy('../../' + dist + '/appl'));
}

function runKarma(done) {   
    new Server({
        configFile: __dirname + '/karma' + useNg + '.conf.js',
        singleRun: runSingle
    }, function (result) {
        var exitCode = !result ? 0 : result;
        if(typeof done === "function") {
            done();
        }
        if (exitCode > 0) {
            process.exit(exitCode);
        }
    }).start();    
}

//From Stack Overflow - Node (Gulp) process.stdout.write to file
if (process.env.USE_LOGFILE == 'true') {
    var fs = require('fs');
    var proc = require('process');
    var origstdout = process.stdout.write,
        origstderr = process.stderr.write,
        outfile = 'node_output.log',
        errfile = 'node_error.log';

    if (fs.exists(outfile)) {
        fs.unlink(outfile);
    }
    if (fs.exists(errfile)) {
        fs.unlink(errfile);
    }

    process.stdout.write = function (chunk) {
        fs.appendFile(outfile, chunk.replace(/\x1b\[[0-9;]*m/g, ''));
        origstdout.apply(this, arguments);
    };

    process.stderr.write = function (chunk) {
        fs.appendFile(errfile, chunk.replace(/\x1b\[[0-9;]*m/g, ''));
        origstderr.apply(this, arguments);
    };
}
