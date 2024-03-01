import config from '../config'
import { noop, isArray, isFunction } from 'shared/util'
import type { Component } from 'types/component'
import { currentInstance } from 'v3/currentInstance'
import { getComponentName } from '../vdom/create-component'

// 查看 ESM对象暴漏后再修改是否生效
// 默认状态下 warn是一个空函数
export let warn: (msg: string, vm?: Component | null) => void = noop
export let tip = noop
export let generateComponentTrace: (vm: Component) => string // work around flow check
export let formatComponentName: (vm: Component, includeFile?: false) => string

// 如果是开发环境
if (__DEV__) {
  // 判断有没有console对象
  const hasConsole = typeof console !== 'undefined'
  const classifyRE = /(?:^|[-_])(\w)/g
  const classify = str =>
    str.replace(classifyRE, c => c.toUpperCase()).replace(/[-_]/g, '')

  // 警告函数
  warn = (msg, vm = currentInstance) => {
    // 生成调用栈
    const trace = vm ? generateComponentTrace(vm) : ''

    // 如果config里写了warnHandler方法，就调用warnHandler方法
    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace)
    } else if (hasConsole && !config.silent) {
      // 如果有console对象且config.silent为false 则以console.error的形式打印出来
      console.error(`[Vue warn]: ${msg}${trace}`)
    }
  }

  // 使用console.warn打印调用栈
  tip = (msg, vm) => {
    if (hasConsole && !config.silent) {
      console.warn(`[Vue tip]: ${msg}` + (vm ? generateComponentTrace(vm) : ''))
    }
  }

  formatComponentName = (vm, includeFile) => {
    if (vm.$root === vm) {
      return '<Root>'
    }
    const options =
      isFunction(vm) && (vm as any).cid != null
        ? (vm as any).options
        : vm._isVue
        ? vm.$options || (vm.constructor as any).options
        : vm
    let name = getComponentName(options)
    const file = options.__file
    if (!name && file) {
      const match = file.match(/([^/\\]+)\.vue$/)
      name = match && match[1]
    }

    return (
      (name ? `<${classify(name)}>` : `<Anonymous>`) +
      (file && includeFile !== false ? ` at ${file}` : '')
    )
  }

  const repeat = (str, n) => {
    let res = ''
    while (n) {
      if (n % 2 === 1) res += str
      if (n > 1) str += str
      n >>= 1
    }
    return res
  }

  generateComponentTrace = (vm: Component | undefined) => {
    if ((vm as any)._isVue && vm!.$parent) {
      const tree: any[] = []
      let currentRecursiveSequence = 0
      while (vm) {
        if (tree.length > 0) {
          const last = tree[tree.length - 1]
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++
            vm = vm.$parent!
            continue
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence]
            currentRecursiveSequence = 0
          }
        }
        tree.push(vm)
        vm = vm.$parent!
      }
      return (
        '\n\nfound in\n\n' +
        tree
          .map(
            (vm, i) =>
              `${i === 0 ? '---> ' : repeat(' ', 5 + i * 2)}${
                isArray(vm)
                  ? `${formatComponentName(vm[0])}... (${
                      vm[1]
                    } recursive calls)`
                  : formatComponentName(vm)
              }`
          )
          .join('\n')
      )
    } else {
      return `\n\n(found in ${formatComponentName(vm!)})`
    }
  }
}
