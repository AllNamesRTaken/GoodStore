var packageJson = require("./package.json");

var rollup = require('rollup');
var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var typescript = require('rollup-plugin-typescript');
var babili = require('rollup-plugin-babel-minify');
var babel = require('rollup-plugin-babel');

rollup.rollup({
    input: 'src/lib/index.ts',
    output: {
        name: packageJson.name,
        globals: {
            // 'rxjs/Observable': 'Observable',
            // 'rxjs/Subscription': 'Subscription',
            // 'rxjs/BehaviorSubject': 'BehaviorSubject'
        },
        sourcemap: true,
    },
    // external: ['rxjs/Observable', 'rxjs/Subscription', 'rxjs/BehaviorSubject'],
    treeshake: true,
    plugins: [
        typescript({
            typescript: require('typescript')
        }),
        resolve({ module: true, jsnext: true, main: true, modulesOnly: false }),
        commonjs(),
        babili({
            sourceMap: true
        }),
        babel({})
    ]
}).then(function (bundle) {
    bundle.write({
        format: 'iife',
        output: {
            name: packageJson.name,
        },
        file: 'dist/' + packageJson.name + '.iife.min.js'
    });
    bundle.write({
        format: 'umd',
        output: {
            name: packageJson.name,
        },
        file: 'dist/' + packageJson.name + '.umd.min.js'
    });
    bundle.write({
        format: 'es',
        file: 'dist/' + packageJson.name + '.es.min.js'
    });
});
rollup.rollup({
    input: 'src/lib/index.ts',
    output: {
        name: packageJson.name,
        globals: {
        },
        sourcemap: true,
    },
    treeshake: true,
    plugins: [
        typescript({
            typescript: require('typescript')
        }),
        resolve({ module: true, jsnext: true, main: true, modulesOnly: false }),
        commonjs(),
        babili({
            sourceMap: true
        })
    ]
}).then(function (bundle) {
    bundle.write({
        format: 'es',
        file: 'dist/' + packageJson.name + '.es2015.min.js'
    });
});
