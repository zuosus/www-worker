// eslint.config.mjs
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc'; // 用于兼容旧版 ESLint 配置
import tseslint from 'typescript-eslint'; // TypeScript ESLint 插件和解析器
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'; // Prettier ESLint 推荐配置

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FlatCompat 用于将旧版 ESLint 配置（如 Next.js 的配置）转换为扁平化配置
const compat = new FlatCompat({
  baseDirectory: __dirname, // 指定基础目录，通常是项目根目录
  // 如果插件解析有问题，可以尝试添加此行，指向 node_modules
  // resolvePluginsRelativeTo: __dirname,
});

export default tseslint.config( // tseslint.config 是扁平化配置的主要入口
  {
    // ------------------------------------
    // 1. 忽略文件和目录
    // ------------------------------------
    ignores: ["dist/", "node_modules/", ".next/", "out/", "src/worker.js", "src/components/ui/**"], // 添加 Next.js 特有的忽略目录
  },
  {
    // ------------------------------------
    // 2. 语言选项：解析器、解析器选项、全局变量
    // ------------------------------------
    languageOptions: {
      parser: tseslint.parser, // 使用 TypeScript 解析器
      parserOptions: {
        ecmaVersion: 'latest', // 支持最新的 ECMAScript 语法
        sourceType: 'module', // 使用 ES 模块
        project: './tsconfig.json', // 告诉解析器你的 tsconfig.json 位置
        // 对于 Next.js 和 React 项目，通常需要配置 JSX
        // jsx: true,
      },
      // Cloudflare Workers 和 Next.js 环境的全局变量
      globals: {
        // next/core-web-vitals 会引入一些浏览器和 Node.js 全局变量
        // Cloudflare Workers 运行时环境也会提供一些全局变量（如 fetch, Request, Response）
        // 确保你的 tsconfig.json 的 lib 包含了 "webworker"
      },
    },

    // ------------------------------------
    // 3. 扩展配置：继承规则集
    // ------------------------------------
    extends: [
      // 继承 ESLint 推荐的基础规则
      tseslint.configs.eslintRecommended, // 这是 tseslint 提供的基本 ESLint 推荐规则

      // 继承 TypeScript ESLint 的推荐规则
      // 这是核心，它会注册 `@typescript-eslint` 插件并提供推荐的 TypeScript 规则
      // 因此，我们通常不再需要 Next.js 的 `next/typescript`，因为它也会注册插件
      ...tseslint.configs.recommendedTypeChecked, // 更严格的带类型检查的推荐规则

      // 继承 Next.js 的核心规则
      // `next/core-web-vitals` 应该被保留，因为它提供了 Next.js 相关的 Web Vitals 规则
      ...compat.extends('next/core-web-vitals'),

      // Prettier 集成：最后引入，以覆盖所有格式相关的规则
      eslintPluginPrettierRecommended,
    ],

    // ------------------------------------
    // 4. 插件
    // ------------------------------------
    // tseslint.configs.recommendedTypeChecked 已经包含了 @typescript-eslint 插件
    // eslintPluginPrettierRecommended 已经包含了 prettier 插件
    // next/core-web-vitals 应该包含 Next.js 和 React 相关的插件
    // 所以这里通常不需要再次明确列出插件
    // plugins: {
    //   // 如果你需要其他非自动集成的插件，可以在这里手动添加和导入
    // },

    // ------------------------------------
    // 5. 自定义规则（可选）
    // ------------------------------------
    rules: {
      // Allow console.log statements
      'no-console': 'off',
      // 强制 Prettier 不加分号
      'prettier/prettier': [
        'error',
        {
          semi: false
        }
      ],
      // Next.js 和 React 相关的规则调整（如果需要）
      // 'react/no-unescaped-entities': 'off', // 禁用 JSX 中不转义实体的警告
      // '@next/next/no-img-element': 'off', // 禁用 Next.js 的 img 元素检查
      // ... 你的自定义规则
    },
  },
  {
    // ------------------------------------
    // 6. 针对特定文件的覆盖（可选）
    // ------------------------------------
    // API files - allow console logs and loosen type checking
    files: ['src/api/**/*.ts'],
    rules: {
      // Allow console.log in API files for logging purposes
      'no-console': 'off'
    }
  }
);