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
		// 这里传入的参数是用...接受的 所以 args是一个列表
		// console.log('数组的劫持', args);
		let result = oldArrayProtoMethods[item].apply(this, args);

		let inserted;
		switch (item) {
			case 'push':
			case 'unshift':
				inserted = args;
				break;
			case 'splice':
				inserted = args.splice(2);
			// inserted = args.slice(2);
			// splice传入一个参数 就是删除这个位置 然后返回这个值
			// slice传入一个参数 就返回从这个位置开始到结束 针对splice函数的参数来说 这俩其实都一样
		}
		// 从数组身上拿到__ob__ 就是Observer本身
		let ob = this.__ob__;
		// console.log(inserted);
		if (inserted) {
			// 这里就可以对参数中的（新增加的）进行劫持
			ob.observeArray(inserted); // 对添加的对象进行了劫持
		}

		return result;
	};
});
