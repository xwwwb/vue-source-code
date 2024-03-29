import { observer } from './observe/index';

export function initState(vm) {
	// ops 是配置项
	let opts = vm.$options;
	// 判断有没有props
	if (opts.props) {
		initProps(vm);
	}
	if (opts.data) {
		initData(vm);
	}
	if (opts.watch) {
		initWatch(vm);
	}
	if (opts.computed) {
		initComputed(vm);
	}
	if (opts.methods) {
		initMethods(vm);
	}
}

// vue2对data进行初始化 1. data是函数 2. data是对象
function initData(vm) {
	let data = vm.$options.data;
	// 这里如果data是函数 修改this指向为vm
	data = vm._data = typeof data === 'function' ? data.call(vm) : data;
	// 将data上的所有属性代理到实例上
	for (let key in data) {
		proxy(vm, '_data', key);
	}

	// 数据劫持
	observer(data);
}

function proxy(vm, source, key) {
	Object.defineProperty(vm, key, {
		get() {
			return vm[source][key];
		},
		set(newValue) {
			vm[source][key] = newValue;
		}
	});
}

function initComputed() {}

function initMethods() {}
function initProps() {}
function initWatch() {}
