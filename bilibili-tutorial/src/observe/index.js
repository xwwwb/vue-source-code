import { ArrayMethods } from './array';
export function observer(data) {
	// 对data对象进行处理
	// 判断数据是否存在

	if (typeof data != 'object' || data == null) {
		return;
		// 如果不是对象或者是null直接返回
	}
	// 通过一个类来实现对数据的观测
	return new Observer(data);
}

// vue2只能对对象中的一个属性进行劫持，所以需要递归处理
// Observer 是对对象的劫持
class Observer {
	constructor(value) {
		// 给data定义一个属性
		Object.defineProperty(value, '__ob__', {
			enumerable: false,
			value: this // 把observer函数
		});

		// 判断数据是数组还是对象
		if (Array.isArray(value)) {
			// 处理数组
			value.__proto__ = ArrayMethods;
			// 处理数组中的对象
			this.observeArray(value);
		} else {
			this.walk(value); // 遍历
		}
	}
	walk(data) {
		let keys = Object.keys(data);
		for (let i = 0; i < keys.length; i++) {
			// 对每个属性进行劫持
			let key = keys[i];
			let value = data[key];
			defineReactive(data, key, value);
		}
	}
	observeArray(value) {
		for (let i = 0; i < value.length; i++) {
			observer(value[i]);
		}
	}
}

function defineReactive(data, key, value) {
	// 如果该属性的值是对象 则深度监控
	// 如果data下的属性的值不是对象 常规字符串或者数字等 进入observer方法会直接return
	observer(value);
	Object.defineProperty(data, key, {
		get() {
			return value;
		},
		set(newValue) {
			// if (newValue === value) return value;
			// eslint说setter不返回
			if (newValue === value) return;

			// 这里的value就是闭包内的 修改的就是闭包内的
			// get拿到的也是闭包内的 所以没问题 但是如果访问$options上的data 还是原数据
			// console.log('set', key, newValue);
			// 当被赋值为新的 也要重新检测 这里有性能问题
			observer(newValue);
			value = newValue;
		}
	});
}
