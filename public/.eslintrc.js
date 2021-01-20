module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jasmine": true, "jquery": true, "amd": true, "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        "ecmaFeatures": {
            "globalReturn": true
          }
    },
    "rules": {
        "strict": 1,
        "semi": 1,
        "quotes": 2,
        "no-console": [2, { allow: ["warn", "error"] }],
        "no-case-declarations": 1
    },
    "globals": {
        "System": true,
        "testit": true,
        "testOnly": true,
        "Stache": true,
        "steal": true,
        "rmain_container": true,
        "FuseBox": true,
        "__karma__": true,
        "spyOnEvent": true,
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    }
};