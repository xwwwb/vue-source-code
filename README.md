基于最后一次提交为 bed04a7 的代码

参考资料：
[准备工作 | Vue.js 技术揭秘 (ustbhuangyi.github.io)](https://ustbhuangyi.github.io/vue-analysis/v2/prepare/)

没有被完全读完的文件：

- [ ] src\core\util\debug.ts

笔记：

src/core/instance/index.ts

```js
initMixin(Vue);     // 定义 _init
stateMixin(Vue);    // 定义 $set $get $delete $watch 等
eventsMixin(Vue);   // 定义事件  $on  $once $off $emit
lifecycleMixin(Vue);// 定义 _update  $forceUpdate  $destroy
renderMixin(Vue);   // 定义 _render 返回虚拟dom
```

