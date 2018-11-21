# Embedded Angular Acceptance Testing with Karma and Jasmine

This demo is comprised of four javascript bundlers each configured to run the tests.  The Bootstrap single page application retains functionality among the bundlers with only minor code change.  The javascript framework used is Angular7 and instrumentation is done with Gulp and Karma.  So you can pick your poison, Webpack, Browserify, Fusebox or Parcel. The demo was orginally developed using the Canjs framework which can be found at https://github.com/DaveO-Home/embedded-acceptance-tests, a React version can be found at https://github.com/DaveO-Home/embedded-acceptance-tests-react and a Vue version can be found at https://github.com/DaveO-Home/embedded-acceptance-tests-vue.

__Note__; the demo was not developed to compare software, rather simply to demonstrate how one might embed test code as part of the build process.  And the configuration also shows how to develop using hot module reload and test driven development.

## Installation

**Desktop:**

  clone the repository or download the .zip

**Install Assumptions:**

  1. OS Linux or Windows(Tested on Windows10)
  1. Node and npm
  1. Gulp
  1. Google Chrome
  1. Firefox

**Server:**

  `cd` to top level directory `<install>/acceptance-tests`

```bash
  npm install
```

  This will install a small Node/Express setup to view the results of a production build.

  `cd <install>/acceptance-tests/public`

```bash
  npm install
```

**Client:**

Test builds will generate bundles in 'dist_test' and production in the 'dist' directory at the root level, 'public'.

## Production Build

To generate a build "cd to `public/<bundler>/build` and type `gulp`, e.g.

```bash
  cd public/fusebox/build
  gulp
```

If the tests succeed then the build should complete.

To run the production application:

  1. `cd <install>/acceptance_tests`
  1. `npm start`  -  This should start a Node Server with port 3080.
  1. Start a browser and enter `localhost:3080/dist/<bundler>/appl/testapp.html`

You can repeat the procedure with "webpack", "browserify", or "parcel". Output from the build can be logged by setting the environment variable `USE_LOGFILE=true`.

You can run `gulp rebuild` from the `<bundler>/build` directory as a stand-alone build.

## Test Build

The test build simply runs the tests in headless mode. The default browsers are ChromeHeadless and FirefoxHeadless.  To change the default you can set an environment variable; e.g.

```bash
  export USE_BROWSERS=ChromeHeadless,Opera
```

to remove FirefoxHeadless from the browser list and add Opera.  You can also set this environment variable for a production build.

To run the tests "cd to `public/<bundler>/build` and type `gulp test`, e.g.

```bash
  cd public/webpack/build
  gulp test
```

A test result might look like;

```text
[2018-11-09T08:17:31.753] [INFO] launcher - Starting browser ChromeHeadless
[2018-11-09T08:17:31.811] [INFO] launcher - Starting browser Firefox
[2018-11-09T08:17:31.874] [INFO] launcher - Starting browser Opera
  Unit Tests - Suite 1
    ✔ Verify that browser supports Promises
    ✔ ES6 Support
  Unit Tests - Suite 2
    ✔ Is Karma active
    ✔ Verify NaN
  Popper Defined - required for Bootstrap
    ✔ is JQuery defined
    ✔ is Popper defined
  Application Unit test suite - AppTest
    ✔ Is Default Page Loaded(Start)
    ✔ Is Tools Table Loaded
    ✔ Re-load Start Page
    ✔ Is Pdf Loaded
    ✔ Is Angular Welcome Loaded
    Load new tools page
      ✔ setup and click events executed.
      ✔ did Redux set default value.
      ✔ new page loaded on change.
      ✔ did Redux set new value.
      ✔ verify state management
    Contact Form Validation
      ✔ Contact form - verify required fields
      ✔ Contact form - validate populated fields, email mismatch.
      ✔ Contact form - validate email with valid email address.
      ✔ Contact form - validate form submission.
    Popup Login Form
      ✔ Login form - verify modal with login loaded
      ✔ Login form - verify cancel and removed from DOM

Finished in 30.545 secs / 23.874 secs @ 14:03:22 GMT-0700 (PDT)

SUMMARY:
✔ 66 tests completed
...

[2018-11-09T08:18:05.847] [INFO] launcher - Starting browser ChromeHeadless
[2018-11-09T08:18:05.910] [INFO] launcher - Starting browser Firefox
[2018-11-09T08:18:05.985] [INFO] launcher - Starting browser Opera

  Unit Tests - Suite 1
    ✔ ES6 Support
    ✔ Verify that browser supports Promises
  Unit Tests - Suite 2
    ✔ Verify NaN
    ✔ Is Karma active
  Test Welcome Router
    ✔ should navigate
  Example HelloComponent
    ✔ should display a different test title
    ✔ should display original title

Finished in 2.877 secs / 2.009 secs @ 08:18:16 GMT-0800 (PST)

SUMMARY:
✔ 21 tests completed
```

## Development

__Note__; When modifying project assets(.handlebars, .html, etc.) you can execute `gulp copy` from the `public/<bundler>/build` directory to preview changes.

__A word on developing tests__; You can write and execute tests quicker by using the rebuild process of a given bundler and running the `acceptance` gulp task after the auto-rebuild, e.g. with __Fusebox__ you can;

  * `cd public/fusebox/build`
  * `gulp hmr`
  * Develop or modify a test.
  * In another window execute `gulp acceptance` from the `build` directory to view the modified or new test results.

__Running Tests__-

  1. Run a full set of tests - `gulp test`, this will build the application and run all tests.
  1. Run e2e tests without build - `gulp e2e`.
  1. Run angular2 tests without build - `gulp ngtest`.

### I.  **Browserify**

1\. ***Development Server Window*** -

   * `cd public/browserify/build`
   * `gulp server`

   Browsersync will start a browser tab(default Chrome) with `localhost:3080/dist_test/browserify/appl/testapp_dev.html`.  Any changes to the source code(*.js files) should be reflected in the browser auto reload.

2\. ***Hot Module Reload(HMR) Window*** -

   * `cd public/browserify/build`
   * `gulp hmr`

   The `watchify` plugin will remain active to rebuild the bundle on code change.

3\. ***Test Driven Development(tdd) Window*** -

   * `cd public/browserify/build`
   * `gulp tdd`

   Tests will rerun as source code(*.js) is changed. Note, tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`.  Note, you do not need `hmr` active for `tdd`. Also, `tdd` can be run with a headless browser.

### II.  **Fusebox**

1\. ***Hot Module Reload(HMR) Server Window*** -

   * `cd public/fusebox/build`
   * `gulp hmr` or `fuse hmr`

   At this point you can start a browser and enter `localhost:3080/dist_test/fusebox/appl/testapp_dev.html`.  Any changes to the source code(*.js files) should be reflected in the browser auto reload.

2\. ***Test Driven Development(tdd) Window*** -

   * `cd public/fusebox/build`
   * `gulp tdd`

   The HMR Server must be running if you want tests to rerun as source code(*.js) is changed. Note, tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`.

### III.  **Parcel**

1\. ***Watch, Recompile and Reload Window*** -

  * `cd public/parcel/build`
  * `gulp watch`

At this point you can start a browser and enter `localhost:3080/dist_test/parcel/appl/testapp_dev.html` (configured to auto open browser tab). Any changes to the source code(*.js and *.css files) should be reflected in the browser auto reload.

2\. ***Test Driven Development(tdd) Window*** -

  * `cd public/parcel/build`
  * `gulp tdd`

  While the Parcel watcher is running, tests are re-run when code are changed.
  
  * Using `export USE_BUNDLER=false` - When using `gulp watch & gulp tdd` together, you can set USE_BUNDLER to false to startup TDD without building first, `gulp watch` does the test build.  Also, by settting `USE_BUNDLER=false` before `gulp`(production build), only testing and linting will execute.

  __Note__; tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`.

3\. ***Special Considerations***
  
  * When using the default prod task `gulp` you need the local custom plugin for stripping development code. The application from the production build will work with the development code embedded, however to strip the code, and set angular production do the following;
    * `cd <install>/public/parcel/appl/js/parcel-plugin-strip`
    * `npm link`
    * `cd <install>/public`
    * `npm link parcel-plugin-strip`
    * Edit `package.json` and in devDependencies section add `"parcel-plugin-strip": "^0.1.1"`. Development code will be stripped during the production build.

  * Using the task `gulp prod` will build angular production without the plugin, however uglifying may take longer.

  __Note;__ You should set `export NODE_ENV=production` before running the production task.

### IV. **Webpack**

1\. ***Development HMR Server Window*** -

   * `cd public/webpack/build`
   * `gulp hmr`


2\. ***Hot Module Reload(Watch) Window*** -

   * `cd public/webpack/build`
   * `gulp watch`

   At this point you can start a browser and enter `localhost:3080/dist_test/webpack/appl/testapp_dev.html`.  Any changes to the source code(*.js files) should be reflected in the browser auto reload. Running the application from the source directory should also work, e.g., `localhost:3080/webpack/appl/testapp_dev.html`.

3\. ***Test Driven Development(tdd) Window*** -

   * `cd public/webpack/build`
   * `gulp tdd`

   Tests will rerun as source code(*.js) is changed. Note, tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`.
