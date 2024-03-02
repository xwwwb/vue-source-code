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
class Observer {
	constructor(value) {
		this.walk(value); // 遍历
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
}

function defineReactive(data, key, value) {
	observer(value);
	Object.defineProperty(data, key, {
		get() {
			return value;
		},
		set(newValue) {
			if (newValue === value) return value;
			// 这里的value就是闭包内的 修改的就是闭包内的
			// get拿到的也是闭包内的 所以没问题 但是如果访问$options上的data 还是原数据

			// 当被赋值为新的 也要重新检测 这里有性能问题
			observer(newValue);
			value = newValue;
		}
	});
}
