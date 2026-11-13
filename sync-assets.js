// 把 node_modules 里需要的文件同步到 static/，供 Discuz 模板直接引用
// npm install 后自动执行（见 package.json 的 postinstall）
const { cpSync, mkdirSync, readFileSync, writeFileSync } = require('fs');

mkdirSync('static/icons', { recursive: true });

const files = [
  ['node_modules/mdui/mdui.css', 'static/mdui.css'],
  ['node_modules/mdui/mdui.global.js', 'static/mdui.global.js'],
  ['node_modules/material-icons/iconfont/material-icons.css', 'static/icons/material-icons.css'],
  ['node_modules/material-icons/iconfont/material-icons.woff2', 'static/icons/material-icons.woff2'],
  ['node_modules/material-icons/iconfont/material-icons.woff', 'static/icons/material-icons.woff'],
];

for (const [src, dest] of files) {
  cpSync(src, dest);
  console.log(dest);
}

// 兼容 Chrome 85 / Firefox 79 / Safari 14.1：
// inset 简写要到 Chrome 87 / Safari 14.1 才支持，改写成四向属性；
// 无前缀 appearance 在 Safari 14.1 不生效，补 -webkit- 前缀。
const globalJs = 'static/mdui.global.js';
let code = readFileSync(globalJs, 'utf8');
code = code.replace(/(?<![-\w])inset:0(?=[;}])/g, 'top:0;right:0;bottom:0;left:0');
code = code.replace(/(?<![-\w])appearance:([^;}]+)/g, '-webkit-appearance:$1;appearance:$1');
writeFileSync(globalJs, code);
