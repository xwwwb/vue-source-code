let obj = {
  silent: true
}

const Vue = {
  config: {}
}
Object.defineProperty(Vue, 'config', {
  get() {
    return obj
  },
  set() {
    console.log(
      'Do not replace the Vue.config object, set individual fields instead.'
    )
  }
})

console.log(Vue.config)
Vue.config = {
  silent: false
} // set
console.log(Vue.config) // 无效
Vue.config.silent = false // 有效
console.log(Vue.config)

// 给Vue上添加一个config属性
// 使用这种形式 整题替换Vue.config对象会提示
// 修改Vue.config的属性则不会提示
// 修改Vue.config.silent时 会先触发get方法拿到config对象 然后修改silent属性
