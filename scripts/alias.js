const path = require('path')

// 当前文件夹的上层文件夹 在拼接参数
const resolve = p => path.resolve(__dirname, '../', p)

module.exports = {
  vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
  compiler: resolve('src/compiler'),
  core: resolve('src/core'),
  shared: resolve('src/shared'),
  web: resolve('src/platforms/web'),
  server: resolve('packages/server-renderer/src'),
  sfc: resolve('packages/compiler-sfc/src')
}
