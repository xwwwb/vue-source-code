import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';

// 配置打包文件
export default {
	// 打包的入口文件
	input: './src/index.js',
	output: {
		file: 'dist/vue.js',
		// 会在window上创建一个Vue属性
		format: 'umd',
		// 打包后的变量名
		name: 'Vue',
		// 打开文件映射
		sourcemap: true,
		banner: `/* vue.js v1.0.0 */`
	},
	plugins: [
		babel({
			exclude: 'node_modules/**',
			babelHelpers: 'bundled',
			babelrc: true
		}),
		serve({
			port: 3000,
			contentBase: '',
			openPage: 'index.html'
		})
	]
};
