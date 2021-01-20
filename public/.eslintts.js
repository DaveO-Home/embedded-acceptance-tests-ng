module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jasmine": true, "jquery": true, "amd": true, "node": true
    },
    "extends": [
        "eslint:recommended",
        'plugin:@typescript-eslint/recommended'
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    parser: '@typescript-eslint/parser',
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    plugins: ['@typescript-eslint'],
    "rules": {
        "strict": 1,
        "semi": 2,
        "quotes": 2,
        "no-case-declarations": 1,
        "no-console": [2, { allow: ["warn", "error"] }],
        "@typescript-eslint/no-var-requires": 1,
        "@typescript-eslint/no-use-before-define": 1
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
