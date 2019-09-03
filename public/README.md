# Embedded Angular2 Acceptance Testing with Karma and Jasmine

The basic idea is to build a production application after ensuring code compliance via javascript, css and bootstrap linting and automated unit and e2e testing.

[Production Build](#production-build)

[Test Build](#test-build)

[Development Overview](#development)

## Bundlers

1. [Browserify](#i-browserify)
1. [Brunch](#ii-brunch)
1. [Fusebox](#iii-fusebox)
1. [Parcel](#iv-parcel)
1. [Rollup](#v-rollup)
1. [Steal](#vi-stealjs)
1. [Webpack](#vii-webpack)

[Installation](#installation)

[Docker](#VIII-Dockerfile)

## Other Framworks

  1. **Canjs** - <https://github.com/DaveO-Home/embedded-acceptance-tests>
  1. **Vue** - <https://github.com/DaveO-Home/embedded-acceptance-tests-vue>
  1. **React** - <https://github.com/DaveO-Home/embedded-acceptance-tests-react>

## Main Tools

  1. Gulp
  1. Karma
  1. Jasmine
  1. Any Browser with a karma launcher
  1. See `public/package.json` for details
  1. Node, npm - node v8 or greater works best

## Installation

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

**Desktop:**

  clone the repository or download the .zip

**Install Assumptions:**

  1. OS Linux or Windows(Tested on Windows10)
  1. Node and npm
  1. Gulp4 is default - If your global Gulp is version 3, you can execute `npx gulp` from the build directories.
  1. Google Chrome
  1. Firefox

**Server:**

  `cd` to top level directory `<install>/embedded-acceptance-tests`

```bash
  npm install
```

  This will install a small Node/Express setup to view the results of a production build.

  To install the demo

  `cd <install>/embedded-acceptance-tests/public`

```bash
  npm install
```

**Client:**

Test builds will generate bundles in 'dist_test' and production in the 'dist' directory at the root level, 'public'.

## Production Build

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

To generate a build "cd to `public/<bundler>/build` and type `gulp`, e.g.

```bash
  cd public/fusebox/build
  gulp
```

or `gulp prod`

If the tests succeed then the build should complete.

To run the production application:

  1. `cd <install>/acceptance_tests`
  1. `npm start`  -  This should start a Node Server with port 3080.
  1. Start a browser and enter `localhost:3080/dist/<bundler>/appl/testapp.html`

You can repeat the procedure with "webpack", "browserify", or "parcel". Output from the build can be logged by setting the environment variable `USE_LOGFILE=true`.

You can run `gulp prd` from the `<bundler>/build` directory as a stand-alone build.

## Test Build

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

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

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

__Note__; When modifying project assets(.handlebars, .html, etc.) you can execute `gulp copy` from the `public/<bundler>/build` directory to preview changes. Some of the bundlers may not have this implemented.

__A word on developing tests__; You can write and execute tests quicker by using the rebuild process of a given bundler and running the `acceptance` gulp task after the auto-rebuild, e.g. with __Fusebox__ you can;

* `cd public/fusebox/build`
* `gulp hmr`
* Develop or modify a test.
* In another window execute `gulp acceptance` from the `build` directory to view the modified or new test results.

__Running Tests__-

  1. Run a full set of tests - `gulp test`, this will build the application and run all tests.
  1. Run e2e tests without build - `gulp e2e`.
  1. Run angular2 tests without build - `gulp ngtest`.

  __Also Note(Experimental)__; All of the development tasks(`hmr, server, watch`) etc, can be run from one window using the `gulp development` task.

  **Both Chrome and Firefox are the default browsers.**  

### I. **Browserify**

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

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

### II. **Brunch**

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

1\. ***Watch, Recompile and Reload Window*** -

* `cd public/brunch/build`
* `gulp watch` or `./cook watch` (output formatted better)

At this point you can start a browser and enter `localhost:3080/testapp_dev.html`. Any changes to the source code(*.js files and other assets such as *.html) should be reflected in the browser auto reload.

__Note__; The test url is `localhost:3080` since Brunch by default uses 'config.paths.public' as the server context. Also, the reload may fail at times, I've noticed that making a second code modification may work.

2\. ***Test Driven Development(tdd) Window*** -

* `cd public/brunch/build`
* `gulp tdd` or `./cook tdd`

  While the Brunch watcher is running, tests are re-run when code are changed. 
  
  __Note__; tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`.

3\. ***Special Considerations***
  
* Brunch plugin eslint-brunch uses eslint 3. The demo/react uses version 4.  The `gulp`(production build) command uses a gulp linter, so javascript linting is executed. However, if you wish to use the Brunch eslint-brunch plugin, do the following;
* `cd <install>/public/node_modules/eslint-brunch`
* `npm install eslint@latest`
* `cd <install>/public` and edit the `brunch-config.js` file and uncomment the eslint section.

### III. **Fusebox**

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

__Node:__ Fusebox has been upgraed to version 4.

1\. ***Hot Module Reload(HMR) Server Window*** -

* `cd public/fusebox/build`
* `gulp hmr`

   At this point you can start a browser and enter `localhost:3080/dist_test/fusebox/appl/testapp_dev.html`.  Any changes to the source code(*.js files) should be reflected in the browser auto reload.

2\. ***Test Driven Development(tdd) Window*** -

* `cd public/fusebox/build`
* `gulp tdd`

   The HMR Server must be running if you want tests to rerun as source code(*.js) is changed.

### IV. **Parcel**

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

1\. ***Watch, Recompile and Reload Window*** -

* `cd public/parcel/build`
* `gulp watch`

At this point you can start a browser and enter `localhost:3080/dist_test/parcel/appl/testapp_dev.html` (configured to auto open browser tab). Any changes to the source code(*.js and *.css files) should be reflected in the browser auto reload.

2\. ***Test Driven Development(tdd) Window*** -

* `cd public/parcel/build`
* `gulp tdd`

  While the Parcel watcher is running, tests are re-run when code are changed.
  
  * Using `export USE_BUNDLER=false` - When using `gulp watch & gulp tdd` together, you can set USE_BUNDLER to false to startup TDD without building first, `gulp watch` does the test build.  Also, by settting `USE_BUNDLER=false` before `gulp`(production build), only testing and linting will execute.

### V. **Rollup**

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

1\. ***Development Server Window*** -

* `cd public/rollup/build`
* `gulp watch`
* After a code change in a typescript source file, run `npx tsc` to generate the new javascript files.

   The Rollup Development Server, Watch(auto-rebuild) and Page Reload functions are started together.  Simply use one of the following URLs in any browser; `localhost:3080/rollup/appl/testapp_dev.html` or `localhost:3080/dist_test/rollup/appl/testapp_dev.html`.

2\. ***Test Driven Development(tdd) Window*** -

* `cd public/rollup/build`
* `gulp tdd`

### VI. **Stealjs**

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

1\. ***Development Server Window*** -

* `gulp test`
* `gulp compile-only` - recompile typescript __Note__ Production build will remove all generated *.js files gernerated by typescript. If you get **entry not found**, run this command.
* `gulp prd` - build production without running tests

2\. ***After a test run*** -

* `gulp e2e` - run application tests
* `gulp ngtest` - run angular unit tests

   At this point you can start a browser and enter `localhost:3080/stealjs/appl/testapp_dev.html`(please note that dist_test is not in the URL).

3\. ***Test Driven Development(tdd) Window*** -

* `cd public/steal/build`
* `gulp tdd`

   __Note;__ After changing Angular code, i.e. *.ts files, execute `gulp compile-only` or `gulp test` to see changes.

### VII. **Webpack**

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

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

### VIII. **Dockerfile**

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

You can build a complete test/develpment environment on a Docker vm with the supplied Dockerfile.

**Linux as Parent Host**(assumes docker is installed and daemon is running)-

In directory containing the Dockerfile execute the following commands;

1\. ```docker build -t embedded .```

2\. ```docker run -ti --privileged  -p 3080:3080 -e DISPLAY=$DISPLAY  -v /tmp/.X11-unix:/tmp/.X11-unix --name test_env embedded bash```

You should be logged into the test container(test_env). There will be 4 embedded-acceptance-tests* directories. Change into to default directory defined in the Dockerfile, for example canjs(embedded-acceptance-tests/public). All of the node dependencies should be installed, so ```cd``` to a desired bundler build directory, i.e. ```stealjs/build``` and follow the above instructions on testing, development and production builds.

3\. When existing the vm after the ```docker run``` command, the container may be stopped. To restart execute ```docker start test_env``` and then ```docker exec -it --privileged --user tester -e DISPLAY=$DISPLAY -w /home/tester test_env bash```.  You can also use ```--user root``` to execute admin work.

**Windows as Parent Host**-

For Pro and Enterpise OS's, follow the Docker instructions on installation.  For the Home OS version you can use the legacy **Docker Desktop** client. It is best to have a Pro or Enterpise Windows OS to use a WSL(Windows bash) install. Use following commands with Windows;

1\. ```docker build -t embedded .```

2\. ```docker run -ti --privileged  -p 3080:3080 --name test_env embedded bash```

3\. ```docker exec -it --privileged --user tester -w /home/tester test_env bash```

The web port 3080 is exposed to the parent host, so once an application is sucessfully bundled and the node server(```npm start``` in directory embedded-acceptance-tests) is started, a host browser can view the application using say ```localhost:3080/dist/fusebox/appl/testapp.html```.

__Note__; Without a complete Pro/Enterprise docker installation, the `test_env` container can only run with Headless browsers. Therfore you should execute `export USE_BROWSERS=ChromeHeadless,FirefoxHeadless` before testing, development and building.
