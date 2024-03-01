// 构建脚本 读取config.js 生成的配置文件 递归构建

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const rollup = require('rollup')
const terser = require('terser')

// 创建dist文件夹
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

// 拿到所有的构建配置
// runtime only cjs
// runtime + compiler cjs
// runtime only esm
// runtime + compiler esm
// ......
// 打开config文件查看详情
let builds = require('./config').getAllBuilds()

// 如果只执行build 则没有argv[2] 不执行
// 如果执行的是 npm run build -- runtime-cjs,server-renderer
// filters = ['runtime-cjs', 'server-renderer']
// builds 等于builds中所有含有runtime-cjs和server-renderer字符串的配置
if (process.argv[2]) {
  const filters = process.argv[2].split(',')
  builds = builds.filter(b => {
    return filters.some(
      f => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1
    )
  })
}

build(builds)

// 递归构建
function build(builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    // builds是array built是number
    buildEntry(builds[built])
      .then(() => {
        // built++
        built++
        if (built < total) {
          next()
        }
      })
      .catch(logError)
  }
  // 启动递归构建
  next()
}

function buildEntry(config) {
  const output = config.output
  const { file, banner } = output
  // 输出文件带有min或者prod的是生产环境
  const isProd = /(min|prod)\.js$/.test(file)
  return (
    rollup
      // 编译
      .rollup(config)
      // 生成
      .then(bundle => bundle.generate(output))
      .then(async ({ output: [{ code }] }) => {
        if (isProd) {
          // 使用terser压缩代码
          const { code: minifiedCode } = await terser.minify(code, {
            toplevel: true,
            compress: {
              pure_funcs: ['makeMap']
            },
            format: {
              ascii_only: true
            }
          })
          // 加上banner
          // 生成的生产环境代码有两个banner 是因为这里又加了一个banner
          const minified = (banner ? banner + '\n' : '') + minifiedCode
          return write(file, minified, true)
        } else {
          return write(file, code)
        }
      })
  )
}

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    // 按照格式输出
    // 蓝色字体 + 相对路径 + 文件大小 + 其他信息
    // 执行完结束promise
    function report(extra) {
      console.log(
        blue(path.relative(process.cwd(), dest)) +
          ' ' +
          getSize(code) +
          (extra || '')
      )
      resolve()
    }

    // 文件夹不存在则创建文件夹
    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
    }
    // 写入文件
    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      // 如果isProd为true则测试压缩后的文件大小
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

// 这里的code是字符串 按一个字符一个字节计算
function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}
// 打印错误
function logError(e) {
  console.log(e)
}
// 打印蓝色字体
function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
