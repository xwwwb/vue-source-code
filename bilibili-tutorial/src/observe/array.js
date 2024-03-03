// 处理数组响应式 一般是劫持函数
// vue官网也说了 通过索引修改数组是不支持响应式的
// https://v2.cn.vuejs.org/v2/guide/reactivity.html
// 重写数组函数

// 拿到原数组方法
let oldArrayProtoMethods = Array.prototype;

// 继承
export let ArrayMethods = Object.create(oldArrayProtoMethods);

let methods = ['push', 'pop', 'unshift', 'splice', 'shift'];

methods.forEach(item => {
	ArrayMethods[item] = function (...args) {
		// 劫持数组
		console.log('数组的劫持');
		let result = oldArrayProtoMethods[item].apply(this, args);
		return result;
	};
});
