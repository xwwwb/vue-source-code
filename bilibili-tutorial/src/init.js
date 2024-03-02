import { initState } from './initState';

export function initMixin(Vue) {
	Vue.prototype._init = function (options) {
		// 初始化
		// console.log(options);
		let vm = this; // vm 是实例
		vm.$options = options;
		// 初始化状态
		initState(vm);
	};
}
