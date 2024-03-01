// 生成rollup 配置文件
// 可以被rollup直接调用 可以被build.js调用

const path = require('path')
const alias = require('@rollup/plugin-alias')
const cjs = require('@rollup/plugin-commonjs')
const replace = require('@rollup/plugin-replace')
const node = require('@rollup/plugin-node-resolve').nodeResolve
const ts = require('rollup-plugin-typescript2')

// 从环境变量或者package.json中获取版本号
const version = process.env.VERSION || require('../package.json').version
// 特征flag 暂时不知道干嘛的
const featureFlags = require('./feature-flags')

// vuejs的banner version 从package.json或者process.env.VERSION中获取
const banner =
  '/*!\n' +
  ` * Vue.js v${version}\n` +
  ` * (c) 2014-${new Date().getFullYear()} Evan You\n` +
  ' * Released under the MIT License.\n' +
  ' */'

// 路径处理相关
// 一些名称和对应的目录 已经经过了node的path模块，拿到的就是绝对路径
const aliases = require('./alias')
// 当前js文件的resolve函数
const resolve = p => {
  // 使用/分割路径 拿到第一项 举例 web/entry-runtime.ts base就是web
  const base = p.split('/')[0]
  // 如果aliases包含了web
  if (aliases[base]) {
    // 这里使用的是path的resolve 返回 aliases[web]和entry-runtime.ts拼接的路径
    // 也就是 src/platforms/web/entry-runtime.ts 也就是实际上的入口
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
    // 如果不在别名中 例如处理dist dist/vue.runtime.common.dev.js
    // 就直接是当前文件夹的上层文件夹的dist/vue.runtime.common.dev.js 作为实际输出目录
    return path.resolve(__dirname, '../', p)
  }
}

// we are bundling forked consolidate.js in compiler-sfc which dynamically
// requires a ton of template engines which should be ignored.
const consolidatePath = require.resolve('@vue/consolidate/package.json', {
  paths: [path.resolve(__dirname, '../packages/compiler-sfc')]
})

// 以下编译选项可以在官网查找到：
// https://v2.cn.vuejs.org/v2/guide/installation.html#对不同构建版本的解释
// 值得注意的是 官网的CommonJS只写了开发环境的 没写生产环境
// 但是这里构建选项CommonJS有四个 包含了生产环境的
// 实际上查看vue.common.js和vue.runtime.common.js就明白了
// 以下是vue.common.js的代码 因为CJS是给打包器使用的 所以这样写没问题
// if (process.env.NODE_ENV === 'production') {
//   module.exports = require('./vue.common.prod.js')
// } else {
//   module.exports = require('./vue.common.dev.js')
// }

const builds = {
  // Runtime only (CommonJS). Used by bundlers e.g. Webpack & Browserify
  // 支持commonjs的运行时 不包含模板编译
  'runtime-cjs-dev': {
    entry: resolve('web/entry-runtime.ts'),
    dest: resolve('dist/vue.runtime.common.dev.js'),
    format: 'cjs',
    env: 'development',
    banner
  },
  'runtime-cjs-prod': {
    entry: resolve('web/entry-runtime.ts'),
    dest: resolve('dist/vue.runtime.common.prod.js'),
    format: 'cjs',
    env: 'production',
    banner
  },
  // Runtime+compiler CommonJS build (CommonJS)
  // 运行时和模板编译器 commonjs
  'full-cjs-dev': {
    entry: resolve('web/entry-runtime-with-compiler.ts'),
    dest: resolve('dist/vue.common.dev.js'),
    format: 'cjs',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  'full-cjs-prod': {
    entry: resolve('web/entry-runtime-with-compiler.ts'),
    dest: resolve('dist/vue.common.prod.js'),
    format: 'cjs',
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime only ES modules build (for bundlers)
  // 运行时 esm 给打包工具用的 所以无所谓dev或者prod
  'runtime-esm': {
    entry: resolve('web/entry-runtime-esm.ts'),
    dest: resolve('dist/vue.runtime.esm.js'),
    format: 'es',
    banner
  },
  // Runtime+compiler ES modules build (for bundlers)
  // 运行时和模板编译 esm 给打包工具用的 所以无所谓dev或者prod
  'full-esm': {
    entry: resolve('web/entry-runtime-with-compiler-esm.ts'),
    dest: resolve('dist/vue.esm.js'),
    format: 'es',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime+compiler ES modules build (for direct import in browser)
  // 运行时和编译器 直接给浏览器用 dev版本
  'full-esm-browser-dev': {
    entry: resolve('web/entry-runtime-with-compiler-esm.ts'),
    dest: resolve('dist/vue.esm.browser.js'),
    format: 'es',
    transpile: false,
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime+compiler ES modules build (for direct import in browser)
  // 运行时和编译器 直接给浏览器用 prod版本
  'full-esm-browser-prod': {
    entry: resolve('web/entry-runtime-with-compiler-esm.ts'),
    dest: resolve('dist/vue.esm.browser.min.js'),
    format: 'es',
    transpile: false,
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  },
  // runtime-only build (Browser)
  // 只有运行时 umd 可以通过标签引用的
  'runtime-dev': {
    entry: resolve('web/entry-runtime.ts'),
    dest: resolve('dist/vue.runtime.js'),
    format: 'umd',
    env: 'development',
    banner
  },
  // runtime-only production build (Browser)
  // 只有运行时的生产版本 umd 可以通过标签引用
  'runtime-prod': {
    entry: resolve('web/entry-runtime.ts'),
    dest: resolve('dist/vue.runtime.min.js'),
    format: 'umd',
    env: 'production',
    banner
  },
  // Runtime+compiler development build (Browser)
  // 运行时和模板编译器 umd 可以通过标签引用
  'full-dev': {
    entry: resolve('web/entry-runtime-with-compiler.ts'),
    dest: resolve('dist/vue.js'),
    format: 'umd',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime+compiler production build  (Browser)
  // 运行时和模板编译器 umd 开发版本 可以通过标签引用
  'full-prod': {
    entry: resolve('web/entry-runtime-with-compiler.ts'),
    dest: resolve('dist/vue.min.js'),
    format: 'umd',
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  },
  // Web compiler (CommonJS).
  compiler: {
    entry: resolve('web/entry-compiler.ts'),
    dest: resolve('packages/template-compiler/build.js'),
    format: 'cjs',
    external: Object.keys(
      require('../packages/template-compiler/package.json').dependencies
    )
  },
  // Web compiler (UMD for in-browser use).
  'compiler-browser': {
    entry: resolve('web/entry-compiler.ts'),
    dest: resolve('packages/template-compiler/browser.js'),
    format: 'umd',
    env: 'development',
    moduleName: 'VueTemplateCompiler',
    plugins: [node(), cjs()]
  },
  // Web server renderer (CommonJS).
  'server-renderer-dev': {
    entry: resolve('packages/server-renderer/src/index.ts'),
    dest: resolve('packages/server-renderer/build.dev.js'),
    format: 'cjs',
    env: 'development',
    external: [
      'stream',
      ...Object.keys(
        require('../packages/server-renderer/package.json').dependencies
      )
    ]
  },
  'server-renderer-prod': {
    entry: resolve('server/index.ts'),
    dest: resolve('packages/server-renderer/build.prod.js'),
    format: 'cjs',
    env: 'production',
    external: [
      'stream',
      ...Object.keys(
        require('../packages/server-renderer/package.json').dependencies
      )
    ]
  },
  'server-renderer-basic': {
    entry: resolve('server/index-basic.ts'),
    dest: resolve('packages/server-renderer/basic.js'),
    format: 'umd',
    env: 'development',
    moduleName: 'renderVueComponentToString',
    plugins: [node(), cjs()]
  },
  'server-renderer-webpack-server-plugin': {
    entry: resolve('server/webpack-plugin/server.ts'),
    dest: resolve('packages/server-renderer/server-plugin.js'),
    format: 'cjs',
    external: Object.keys(
      require('../packages/server-renderer/package.json').dependencies
    )
  },
  'server-renderer-webpack-client-plugin': {
    entry: resolve('server/webpack-plugin/client.ts'),
    dest: resolve('packages/server-renderer/client-plugin.js'),
    format: 'cjs',
    external: Object.keys(
      require('../packages/server-renderer/package.json').dependencies
    )
  },
  'compiler-sfc': {
    entry: resolve('packages/compiler-sfc/src/index.ts'),
    dest: resolve('packages/compiler-sfc/dist/compiler-sfc.js'),
    format: 'cjs',
    external: Object.keys(
      require('../packages/compiler-sfc/package.json').dependencies
    ),
    plugins: [
      node({ preferBuiltins: true }),
      cjs({
        ignore: [
          ...Object.keys(require(consolidatePath).devDependencies),
          'vm',
          'crypto',
          'react-dom/server',
          'teacup/lib/express',
          'arc-templates/dist/es5',
          'then-pug',
          'then-jade'
        ]
      })
    ]
  }
}

// 生成rollup配置文件
function genConfig(name) {
  // 根据name拿到对应的配置
  const opts = builds[name]
  // 如果是直接给浏览器用的esm 这里的返回值是false
  // 如果是cjs 这里返回值是false
  const isTargetingBrowser = !(
    opts.transpile === false || opts.format === 'cjs'
  )

  // console.log('__dir', __dirname)
  const config = {
    // 入口文件
    input: opts.entry,
    // 外部依赖
    external: opts.external,
    plugins: [
      // 别名
      alias({
        // 没看懂opts.alias的
        entries: Object.assign({}, aliases, opts.alias)
      }),
      ts({
        tsconfig: path.resolve(__dirname, '../', 'tsconfig.json'),
        cacheRoot: path.resolve(__dirname, '../', 'node_modules/.rts2_cache'),
        tsconfigOverride: {
          compilerOptions: {
            // if targeting browser, target es5
            // if targeting node, es2017 means Node 8
            // 如果是直接给浏览器的esm 这里是false 也就是es2017 es5不支持esm
            // 如果是cjs 这里是false 也是es2017 也就是node 8
            // isTargetingBrowser就是低版本的浏览器
            target: isTargetingBrowser ? 'es5' : 'es2017'
          },
          // 如果生成的文件只运行在低版本浏览器 就只参考src 如果可能是给浏览器用的esm(es2017)或者cjs(es2017)
          // 就参考src和packages/*/src 也要生成package的文件
          include: isTargetingBrowser ? ['src'] : ['src', 'packages/*/src'],
          // 排除目录
          exclude: ['test', 'test-dts']
        }
      })
      // 拼接该配置文件中写的插件
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      // 生成的包名
      name: opts.moduleName || 'Vue',
      exports: 'auto'
    },
    onwarn: (msg, warn) => {
      // 这里是忽略掉循环引用的警告
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }

  // console.log('pluging', config.plugins)

  // built-in vars
  // 一些内建的变量 放入生成的config中
  const vars = {
    // 版本号
    __VERSION__: version,
    // 是否是开发环境 下面还会修改
    __DEV__: `process.env.NODE_ENV !== 'production'`,
    __TEST__: false,
    // 如果是umd或者包含browser的名字 就是全局变量
    __GLOBAL__: opts.format === 'umd' || name.includes('browser')
  }
  // feature flags
  // 特征flag也放入vars中 feature可能是某个功能
  Object.keys(featureFlags).forEach(key => {
    vars[`process.env.${key}`] = featureFlags[key]
  })
  // build-specific env
  // 配置文件中的env
  if (opts.env) {
    // 配置文件中有env 就把vars['process.env.NODE_ENV']设置为当前环境
    vars['process.env.NODE_ENV'] = JSON.stringify(opts.env)
    // 如果是开发环境 就把__DEV__设置为true
    vars.__DEV__ = opts.env !== 'production'
  }
  // 看起来__DEV__这个字符串的结果可能是true或者false 也可能是process.env.NODE_ENV !== 'production'
  // __DEV__会被调用可能
  // __DEV__会被整个替换掉 所以会被执行

  // 查阅资料后发现这个replace插件是用来替换文件中的变量的
  // 代码中出现的__VERSION__ __DEV__ __TEST__ __GLOBAL__ process.env.NODE_ENV都会被替换
  // 这里的vars就是替换的变量
  // 等代码中遇见了 再回来看这个

  vars.preventAssignment = true
  // config中的插件中添加replace插件 文本替换
  config.plugins.push(replace(vars))

  // 添加不可枚举的_name属性
  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config
}

// package.json中有的命令指定了TARGET 直接根据TARGET导出配置文件
// package.json中有的命令直接用rollup指向了config.js文件
if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else {
  // 导出生成配置文件的函数
  exports.getBuild = genConfig
  // 导出包含全部配置文件的数组
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}
