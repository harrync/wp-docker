/* global require __dirname */

/**
 * -----------------------
 * Un.titled - Laravel Mix
 * -----------------------
 */

const hostname = 'localhost:8000'

/**
 * Dependencies
 */
const mix = require('laravel-mix')
const copyWebpackPlugin = require('copy-webpack-plugin')
const imageminPlugin = require('imagemin-webpack-plugin').default
const path = require('path')
const mixGlob = require('laravel-mix-glob')
const themeDirectory = './wp-content/themes/pippip'

/**
 * Variables
 */
const themeAssets = `${themeDirectory}/assets`
const glob = new mixGlob({ mix })

/**
 * Config
 */
mix.setPublicPath(`${themeDirectory}/dist`)
mix.disableSuccessNotifications()

mix.options({
  processCssUrls: false,
  autoprefixer: { remove: false },
})

mix.browserSync({
  proxy: `https://${hostname}`,
  ghostMode: false,
  files: [
    `${themeDirectory}/templates/**/*.twig`,
    `${themeDirectory}/assets/sass/**/*.scss`,
    `${themeDirectory}/assets/js/**/*.js`,
    `${themeDirectory}/assets/js/**/*.ts`,
    `${themeDirectory}/assets/js/**/*.tsx`,
  ],
})

if (mix.inProduction()) {
  mix.version()
  mix.disableNotifications()
} else {
  mix.sourceMaps()
  mix.webpackConfig({ devtool: 'inline-source-map' })
}

mix.webpackConfig({
  stats: 'errors-warnings',
})

/**
 * Assets
 */
glob.sass(`${themeAssets}/sass/*.scss`, 'css')
glob.js(`${themeAssets}/js/*.js`, 'js')
glob.js(`${themeAssets}/js/*.ts`, 'js')
glob.js(`${themeAssets}/js/*.tsx`, 'js')
mix.copyDirectory(`${themeAssets}/font`, `${themeDirectory}/dist/font`)

/**
 * Custom Webpack Configuration
 * 1. Add Typescript support
 * 2. Copy icon/img assets after being optimised
 * 3. Optimise SVGs
 */
mix.webpackConfig({
  module: {
    rules: [
      {
        test: /\.ts|\.tsx$/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
})

/**
 * Custom Webpack Configuration
 * Optimise pngs/jpgs/svgs (production only)
 */
if (mix.inProduction()) {
  mix.webpackConfig({
    plugins: [
      new copyWebpackPlugin({
        patterns: [{ from: `${themeAssets}/img`, to: 'img' }],
      }),
      new imageminPlugin({
        test: /\.(jpe?g|png|svg)$/i,
        svgo: {
          plugins: [
            {
              removeViewBox: false,
            },
          ],
        },
        pngquant: {
          quality: '70-90',
          dithering: 0,
          speed: 1,
        },
        jpegtran: {
          progressive: true,
          quality: 60,
        },
      }),
    ],
  })
}
