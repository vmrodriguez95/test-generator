import { build, context } from 'esbuild'
import { sassPlugin } from 'esbuild-sass-plugin'
import { minifyTemplates, writeFiles } from 'esbuild-minify-templates'
import fs from 'fs'
import path from 'path'
import postcss from 'postcss'
import postcssMinify from 'postcss-minify'
import svg from 'esbuild-plugin-svg'

const outdir = 'dist'
const entryNames = 'app'

// Bundle generation
const excludes = []
const folds = ['elements', 'views']
export const bundles = []
export const styleBundles = [
  'normalize.css',
  './src/styles/generic/generic.fonts.scss',
  './src/styles/variables/variables.colors.scss',
  './src/styles/variables/variables.fonts.scss',
  './src/styles/variables/variables.transitions.scss',
  './src/styles/variables/variables.grid.scss',
  './src/styles/generic/generic.base.scss',
  './src/styles/generic/generic.grid.scss'
]

const getBundlePath = (fold, item, ext = '') => `./src/${fold}/${item}/${item}${ext}`
const isValidItem = (item) => item !== '.DS_Store' && !excludes.includes(item)

function foldLooper(cb) {
  folds.forEach((fold) => {
    fs.readdirSync(path.join('src', fold)).forEach((item) => {
      if (isValidItem(item)) {
        cb(fold, item)
      }
    })
  })
}

function fillBundles() {
  foldLooper((fold, item) => {
    const mainBundlePath = getBundlePath(fold, item)

    bundles.push(mainBundlePath + '.js')
  })
}

fillBundles()

// Building compilation core
const config = {
  dev: {
    watch: true,
    sourcemap: true,
    minify: false
  },
  pro: {
    watch: false,
    sourcemap: false,
    minify: true
  }
}

function getBuildConfig(type, env, files) {
  return {
    plugins: [
      sassPlugin({
        type: type === 'style' ? 'css' : 'css-text',
        async context(source, filePath) {
          const { css } = await postcss([postcssMinify]).process(source, { from: filePath })

          return css
        }
      }),
      svg({
        minify: true
      }),
      minifyTemplates(),
      writeFiles()
    ],
    outdir,
    entryNames,
    target: 'es2021',
    loader: type === 'style' ? { '.scss': 'css' } : { '.js': 'ts' },
    minify: config[env].minify,
    bundle: true,
    sourcemap: config[env].sourcemap,
    write: false,
    format: 'esm',
    stdin: {
      contents: files.map(file => `import "${ file }"`).join('\n'),
      resolveDir: '.'
    },
    external: ['static']
  }
}

function removePreviousFiles() {
  // eslint-disable-next-line no-useless-escape
  const fileregExp = new RegExp(`${entryNames}(\.[0-9]*)?.js|css$`)

  fs.readdirSync(outdir).forEach((fileOrDir) => {
    if (fileregExp.test(fileOrDir)) {
      fs.rmSync(`${outdir}/${fileOrDir}`)
    }
  })
}

function getJSIndexContentReplaced(outputfileName) {
  return fs.readFileSync(outdir + '/index.html').toString().replace(
    // eslint-disable-next-line no-useless-escape
    /src="\/app(\.[0-9]*)?\.js"/gm,
    `src="/${outputfileName}"`
  )
}

function getCSSIndexContentReplaced(outputfileName) {
  return fs.readFileSync(outdir + '/index.html').toString().replace(
    // eslint-disable-next-line no-useless-escape
    /href="\/app(\.[0-9]*)?\.css"/gm,
    `href="/${outputfileName}"`
  )
}

function replaceBundlePath(buildConfig) {
  fs.writeFileSync(outdir + '/index.html', getJSIndexContentReplaced(buildConfig.entryNames + '.js'))
  fs.writeFileSync(outdir + '/index.html', getCSSIndexContentReplaced(buildConfig.entryNames + '.css'))
}


export const esBuild = async(type, env = 'pro', files, version) => {
  const buildConfig = getBuildConfig(type, env, files)

  if (config[env].watch) {
    const ctx = await context(buildConfig)

    await ctx.watch()
  } else {
    buildConfig.entryNames += `.${version}`

    removePreviousFiles()

    build(buildConfig).then(() => replaceBundlePath(buildConfig))
  }
}
