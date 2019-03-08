const gulp = require('gulp');
const bootlint = require('gulp-bootlint');
const log = require("fancy-log")

gulp.task('bootlint', () => {
    var fileIssues = [],
            options = {
                stoponerror: true,
                stoponwarning: false,
                loglevel: 'debug',
                disabledIds: ['E001', 'W009', 'E007', 'W005'],
                issues: fileIssues,
                reportFn: function (file, lint, isError, isWarning, errorLocation) {
                    var message = (isError) ? "ERROR! - " : "WARN! - ";
                    if (errorLocation) {
                        message += file.path + ' (line:' + (errorLocation.line + 1) + ', col:' + (errorLocation.column + 1) + ') [' + lint.id + '] ' + lint.message;
                    } else {
                        message += file.path + ': ' + lint.id + ' ' + lint.message;
                    }
                    log(message);
                },
                summaryReportFn: function (file, errorCount, warningCount) {
                    if (errorCount > 0 || warningCount > 0) {
                        log("please fix the " + errorCount + " errors and " + warningCount + " warnings in " + file.path);
                    } else {
                        log("No problems found in " + file.path);
                    }
                }
            };

    var stream = gulp.src(["../appl/app_bootstrap.html"])
            .pipe(bootlint(options));
    
    stream.on('error', function() {
        process.exit(1);
    });
    
    return stream;
    
});

gulp.task('default', ['bootlint']);
