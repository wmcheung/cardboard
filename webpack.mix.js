const { mix } = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.scripts([
    'assets/js/third-party/threejs/three.js',
    'assets/js/third-party/threejs/StereoEffect.js',
    'assets/js/third-party/threejs/DeviceOrientationControls.js',
    'assets/js/third-party/threejs/OrbitControls.js',
    'assets/js/third-party/threejs/OBJLoader.js',
    'assets/js/third-party/progressbar.js',
    'assets/js/third-party/Tween.js',
], 'public/js/plugins.js');

mix.js('resources/assets/js/app.js', 'public/js')
   .sass('resources/assets/sass/app.scss', 'public/css');