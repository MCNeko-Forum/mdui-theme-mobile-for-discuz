// 把 node_modules 里需要的文件同步到 static/，供 Discuz 模板直接引用
// npm install 后自动执行（见 package.json 的 postinstall）
const { cpSync, mkdirSync } = require('fs');

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
