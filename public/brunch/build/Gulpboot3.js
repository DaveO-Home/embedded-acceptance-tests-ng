const gulp = require("gulp");
const bootlint = require("gulp-bootlint");

gulp.task("bootlint", () => {
    var fileIssues = [],
            options = {
                stoponerror: true,
                stoponwarning: false,
                loglevel: "debug",
                disabledIds: ["W009", "E007", "W005", "E001"],
                issues: fileIssues,
                reportFn: function (file, lint, isError, isWarning, errorLocation) {
                    var message = (isError) ? "ERROR! - " : "WARN! - ";
                    if (errorLocation) {
                        message += file.path + " (line:" + (errorLocation.line + 1) + ", col:" + (errorLocation.column + 1) + ") [" + lint.id + "] " + lint.message;
                    } else {
                        message += file.path + ": " + lint.id + " " + lint.message;
                    }
                    console.log(message);
                },
                summaryReportFn: function (file, errorCount, warningCount) {
                    if (errorCount > 0 || warningCount > 0) {
                        console.log("please fix the " + errorCount + " errors and " + warningCount + " warnings in " + file.path);
                    } else {
                        console.log("No problems found in " + file.path);
                    }
                }
            };

    var stream = gulp.src(["../appl/app_bootstrap.html"])
            .pipe(bootlint(options));
    
    stream.on("error", function() {
        process.exit(1);
    });
    
    return stream;
    
});

gulp.task("default", ["bootlint"]);
