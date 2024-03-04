export let a = {
  name: 'xwb'
}
a.name = 'xwwwb'

console.log('this is index.mjs')

setTimeout(() => {
  a = {}
}, 1000)
