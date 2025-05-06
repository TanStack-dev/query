---
source-updated-at: '2025-03-07T10:54:04.000Z'
translation-updated-at: '2025-05-06T05:23:43.299Z'
id: devtools
title: 开发者工具
---
## 安装并导入开发者工具 (Devtools)

开发者工具是一个独立的包，需要单独安装：

```bash
npm i @tanstack/svelte-query-devtools
```

或

```bash
pnpm add @tanstack/svelte-query-devtools
```

或

```bash
yarn add @tanstack/svelte-query-devtools
```

或

```bash
bun add @tanstack/svelte-query-devtools
```

可以通过以下方式导入开发者工具：

```ts
import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
```

## 浮动模式 (Floating Mode)

浮动模式会将开发者工具作为一个固定的浮动元素挂载到你的应用中，并在屏幕角落提供一个切换按钮来显示或隐藏开发者工具。这个切换状态会被存储在 localStorage 中，并在页面刷新后保持记忆。

将以下代码尽可能放在 Svelte 应用的顶层。越靠近页面根节点，效果越好！

```ts
<script>
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
</script>

<QueryClientProvider client={queryClient}>
  {/* 应用的其他部分 */}
  <SvelteQueryDevtools />
</QueryClientProvider>
```

### 配置选项

- `initialIsOpen: Boolean`
  - 设置为 `true` 可以让开发者工具默认处于打开状态
- `buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "relative"`
  - 默认为 `bottom-right`
  - TanStack 徽标按钮的位置，用于打开和关闭开发者工具面板
  - 如果设为 `relative`，按钮将渲染在你放置开发者工具的位置
- `position?: "top" | "bottom" | "left" | "right"`
  - 默认为 `bottom`
  - Svelte Query 开发者工具面板的位置
- `client?: QueryClient`,
  - 用于指定自定义的 QueryClient。如果不设置，将使用最近上下文中的 QueryClient
- `errorTypes?: { name: string; initializer: (query: Query) => TError}`
  - 用于预定义一些可以在查询中触发的错误类型。当从 UI 切换该错误时，初始化器（带有特定查询）将被调用。它必须返回一个 Error 对象
- `styleNonce?: string`
  - 用于向添加到文档头部的 style 标签传递一个 nonce。这在需要使用内容安全策略 (CSP) nonce 来允许内联样式时很有用
- `shadowDOMTarget?: ShadowRoot`
  - 默认行为会将开发者工具的样式应用到 DOM 中的 head 标签
  - 用于向开发者工具传递一个 shadow DOM 目标，这样样式将被应用到 shadow DOM 中，而不是 light DOM 的 head 标签里
