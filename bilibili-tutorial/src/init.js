import { initState } from './initState';
import { compileToFunction } from './compile/index';
export function initMixin(Vue) {
	Vue.prototype._init = function (options) {
		// 初始化
		// console.log(options);
		let vm = this; // vm 是实例
		vm.$options = options;
		// 初始化状态
		initState(vm);
		// 渲染模板
		if (vm.$options.el) {
			vm.$mount(vm.$options.el);
		}
	};

	// 创建$mount
	Vue.prototype.$mount = function (el) {
		let vm = this;
		el = document.querySelector(el);
		let options = vm.$options;
		if (!options.render) {
			// 判断有无template
			let template = options.template;
			if (!template && el) {
				// 获取html
				el = el.outerHTML;

				// 变成ast
				let ast = compileToFunction(el);
				console.log(ast);
				// 变成render
			}
		}
	};
}
