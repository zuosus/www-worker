// .prettierrc.mjs
export default {
  printWidth: 100, // 每行字符数限制
  singleQuote: true, // 使用单引号而不是双引号
  trailingComma: 'es5', // 对象属性和数组元素末尾添加逗号 (es5 或 all)
  tabWidth: 2, // tab 键的宽度
  useTabs: false, // 不使用 tab 键，使用空格
  arrowParens: 'always', // 箭头函数参数始终带括号
  bracketSpacing: true, // 在对象字面量中，属性名和冒号之间加空格
  htmlWhitespaceSensitivity: 'css', // HTML, Vue, JSX 语法中，最后一个 ">" 不换行
  insertPragma: false, // 不需要写文件开头的 @prettier
  proseWrap: 'preserve', // 根据文件内容决定是否插入换行符
  semi: false, // 不需要分号
  endOfLine: 'lf', // 自动识别文件结束行
};