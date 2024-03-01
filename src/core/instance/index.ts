import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
import type { GlobalAPI } from 'types/global-api'

function Vue(options) {
  // 开发环境下进行警告
  // 如果不是通过new关键字调用Vue构造函数，就会警告
  // instanceof 比较左侧的__proto__是否在右侧的prototype上
  // 如果不等 则取左侧的__proto__的__proto__再和右侧的prototype比较
  // 一直到找到null为止
  if (__DEV__ && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 该方法在initMixin()函数中会被挂载到Vue.prototype._init上
  this._init(options)
}

//@ts-expect-error Vue has function type
initMixin(Vue)
//@ts-expect-error Vue has function type
stateMixin(Vue)
//@ts-expect-error Vue has function type
eventsMixin(Vue)
//@ts-expect-error Vue has function type
lifecycleMixin(Vue)
//@ts-expect-error Vue has function type
renderMixin(Vue)



export default Vue as unknown as GlobalAPI
