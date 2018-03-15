var gulp = require("gulp");
var rollup = require("rollup");
var uglify = require("rollup-plugin-uglify");
var es = require("uglify-es");
var debug = require("gulp-debug");
var sequence = require("gulp-sequence");
var resolve = require("rollup-plugin-node-resolve");
var commonjs = require('rollup-plugin-commonjs');
var fs = require("fs");
var chalk = require("chalk");
var rename = require("gulp-rename");

var config = require("./build/buildConfig.js");
var package = require("./package.json");
var version = package.version.split(".").map((v) => parseInt(v) || 0);

gulp.task("bump", function (cb) {
    version[2]++;
    package.version = version.join(".");
    fs.writeFileSync("./package.json", JSON.stringify(package, null, 2), { encoding: "utf8" });
    cb();
})
gulp.task("package", ["bump"], function () {
    return gulp.src("./package.json")
        .pipe(gulp.dest("dist/lib"));
})
gulp.task("build-es6", async function () {
    const bundle = await rollup.rollup({
        input: './dist/lib/index.js',
        plugins: [
            resolve({ jsnext: true }),
            commonjs({
                include: [
                    'node_modules/rxjs/*.js',
                    'node_modules/rxjs/util/**',
                    'node_modules/rxjs/symbol/*.js',
                ]
            }),
            uglify({}, es.minify)
        ]
    });

    await bundle.write({
        file: './dist/lib/' + package.name + '.es6.min.js',
        format: 'es',
        name: package.name,
        sourcemap: true
    });
    await bundle.write({
        file: './dist/lib/' + package.name + '.es6.umd.min.js',
        format: 'umd',
        name: package.name,
        sourcemap: true
    });
});

gulp.task("build-es5", async function () {
    const bundle = await rollup.rollup({
        input: './dist/lib/index.js',
        plugins: [
            resolve({ jsnext: true }),
            commonjs({
                include: [
                    'node_modules/rxjs/*.js',                    
                    'node_modules/rxjs/util/**',
                    'node_modules/rxjs/symbol/*.js',
                ]
            }),
            uglify({}, es.minify)
        ]
    });

    await bundle.write({
        file: './dist/lib/' + package.name + '.es5.iife.min.js',
        format: 'iife',
        name: package.name,
        sourcemap: true
    });
    await bundle.write({
        file: './dist/lib/' + package.name + '.es5.es2015.min.js',
        format: 'es',
        name: package.name,
        sourcemap: true
    });
    await bundle.write({
        file: './dist/lib/' + package.name + '.es5.umd.min.js',
        format: 'umd',
        name: package.name,
        sourcemap: true
    });
});

gulp.task("copyDTS", () => {
    return gulp.src("./*.d.ts")
        .pipe(rename((path) => path.basename = path.basename.replace(/library/, package.name)))
        .pipe(gulp.dest("dist/lib"));
});
//This should build both but when I sequence them then they leek code into each other.
gulp.task("default", (cb) => sequence("build-es5", "build-es6")(cb));