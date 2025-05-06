---
source-updated-at: '2024-11-04T06:38:47.000Z'
translation-updated-at: '2025-05-06T04:27:37.043Z'
id: devtools
title: 开发者工具
---
# Devtools

欢呼雀跃吧，因为 React Query 配备了专属开发者工具！🥳

当你开始 React Query 之旅时，这些开发者工具将成为得力助手。它们能可视化 React Query 的内部运作机制，在你遇到棘手问题时，很可能为你节省数小时的调试时间！

> 请注意：目前开发者工具 **暂不支持 React Native**。若您有意协助我们实现跨平台支持，请随时告知！

> 激动消息：我们现已推出独立的 React Native React Query DevTools 包！这一新增功能提供原生支持，让你可以直接在 React Native 项目中集成开发者工具。立即查看并参与贡献：[react-native-react-query-devtools](https://github.com/LovesWorking/react-native-react-query-devtools)

> 另有一款外部工具可通过仪表盘使用 React Query 开发者工具。了解更多并参与贡献：[react-query-external-sync](https://github.com/LovesWorking/react-query-external-sync)

> 注意：自第 5 版起，开发者工具已支持观察变更 (mutations)。

## 安装与导入开发者工具

开发者工具是独立包，需单独安装：

```bash
npm i @tanstack/react-query-devtools
```

或

```bash
pnpm add @tanstack/react-query-devtools
```

或

```bash
yarn add @tanstack/react-query-devtools
```

或

```bash
bun add @tanstack/react-query-devtools
```

对于 Next 13+ App 目录，必须将其作为开发依赖安装才能正常工作。

导入方式如下：

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
```

默认情况下，React Query 开发者工具仅在 `process.env.NODE_ENV === 'development'` 时包含在构建包中，因此无需担心生产环境构建时的排除问题。

## 浮动模式

浮动模式会将开发者工具作为固定浮动元素挂载在应用中，并在屏幕角落提供显示/隐藏开关。该开关状态会通过 localStorage 保存，并在页面刷新后保持记忆。

请将以下代码尽可能放置在 React 应用的顶层。越接近页面根节点，效果越好！

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 应用其他内容 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 配置项

- `initialIsOpen: Boolean`
  - 设为 `true` 可使开发者工具默认展开
- `buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "relative"`
  - 默认为 `bottom-right`
  - 控制 React Query 徽标按钮的位置，用于展开/收起面板
  - 设为 `relative` 时，按钮将出现在开发者工具的渲染位置
- `position?: "top" | "bottom" | "left" | "right"`
  - 默认为 `bottom`
  - 开发者工具面板的展开位置
- `client?: QueryClient`,
  - 使用自定义 QueryClient。未指定时使用最近上下文中的实例
- `errorTypes?: { name: string; initializer: (query: Query) => TError}[]`
  - 预定义可触发的错误类型。当从 UI 切换错误时，初始化器（传入特定查询）将被调用，必须返回一个 Error 对象
- `styleNonce?: string`
  - 向文档头部的 style 标签传递 nonce 值，适用于需要内容安全策略 (CSP) nonce 的场景
- `shadowDOMTarget?: ShadowRoot`
  - 默认行为是将样式应用到 DOM 的 head 标签
  - 传入 shadow DOM 目标可使样式在 shadow DOM 内生效而非 light DOM 的 head 标签

## 嵌入式模式

嵌入式模式将开发者工具作为固定元素显示在应用中，便于你在自有开发工具中使用我们的面板。

请将以下代码尽可能放置在 React 应用的顶层：

```tsx
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

function App() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      {/* 应用其他内容 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
      >{`${isOpen ? '关闭' : '打开'}开发者工具面板`}</button>
      {isOpen && <ReactQueryDevtoolsPanel onClose={() => setIsOpen(false)} />}
    </QueryClientProvider>
  )
}
```

### 配置项

- `style?: React.CSSProperties`
  - 面板自定义样式
  - 默认值：`{ height: '500px' }`
  - 示例：`{ height: '100%' }`
  - 示例：`{ height: '100%', width: '100%' }`
- `onClose?: () => unknown`
  - 面板关闭时的回调函数
- `client?: QueryClient`,
  - 使用自定义 QueryClient。未指定时使用最近上下文中的实例
- `errorTypes?: { name: string; initializer: (query: Query) => TError}[]`
  - 预定义可触发的错误类型
- `styleNonce?: string`
  - 向文档头部 style 标签传递 nonce 值
- `shadowDOMTarget?: ShadowRoot`
  - 控制样式作用域为 shadow DOM 而非 light DOM

## 生产环境使用开发者工具

开发者工具默认排除在生产构建外。但可通过懒加载方式在生产环境使用：

```tsx
import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Example } from './Example'

const queryClient = new QueryClient()

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
)

function App() {
  const [showDevtools, setShowDevtools] = React.useState(false)

  React.useEffect(() => {
    // @ts-expect-error
    window.toggleDevtools = () => setShowDevtools((old) => !old)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Example />
      <ReactQueryDevtools initialIsOpen />
      {showDevtools && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </React.Suspense>
      )}
    </QueryClientProvider>
  )
}

export default App
```

调用 `window.toggleDevtools()` 将下载开发者工具包并显示。

### 现代打包工具

若打包工具支持包导出，可使用以下导入路径：

```tsx
const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/production').then((d) => ({
    default: d.ReactQueryDevtools,
  })),
)
```

TypeScript 用户需在 tsconfig 中设置 `moduleResolution: 'nodenext'`，这要求 TypeScript 版本至少为 v4.7。
