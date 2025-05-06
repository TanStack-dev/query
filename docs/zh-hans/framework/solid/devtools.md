---
source-updated-at: '2024-08-21T11:18:15.000Z'
translation-updated-at: '2025-05-06T05:15:27.103Z'
id: devtools
title: 开发者工具
---

欢呼雀跃吧，因为 Solid Query 配备了专属的开发工具 (Devtools)！🥳

当你开始使用 Solid Query 时，这些开发工具将成为得力助手。它们能直观展示 Solid Query 的内部运作机制，在你遇到棘手问题时，很可能为你节省数小时的调试时间！

## 安装并导入开发工具

开发工具是一个独立包，需单独安装：

```bash
npm i @tanstack/solid-query-devtools
```

或

```bash
pnpm add @tanstack/solid-query-devtools
```

或

```bash
yarn add @tanstack/solid-query-devtools
```

或

```bash
bun add @tanstack/solid-query-devtools
```

导入方式如下：

```tsx
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
```

默认情况下，Solid Query 开发工具仅在 `isServer === true` 时包含在构建包中（[`isServer`](https://github.com/solidjs/solid/blob/a72d393a07b22f9b7496e5eb93712188ccce0d28/packages/solid/web/src/index.ts#L37) 来自 `solid-js/web` 包），因此无需担心生产构建时需要手动排除它们。

## 浮动模式

浮动模式会将开发工具作为固定悬浮元素挂载到应用中，并在屏幕角落提供显示/隐藏的切换按钮。该状态会保存在 localStorage 中，即使刷新页面也会被记住。

请将以下代码尽可能放置在 Solid 应用的顶层。越靠近页面根节点，效果越好！

```tsx
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 应用的其他部分 */}
      <SolidQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 配置项

- `initialIsOpen: Boolean`
  - 设为 `true` 可使开发工具默认展开
- `buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"`
  - 默认为 `bottom-right`
  - 控制 Solid Query 徽标按钮的位置，用于展开/收起开发工具面板
- `position?: "top" | "bottom" | "left" | "right"`
  - 默认为 `bottom`
  - 控制开发工具面板的停靠位置
- `client?: QueryClient`
  - 传入自定义 QueryClient。若不设置，则使用最近上下文中的实例
- `errorTypes?: { name: string; initializer: (query: Query) => TError}`
  - 用于预定义可触发的查询错误类型。当从 UI 切换该错误时，初始化函数会接收具体查询并返回一个 Error 对象
- `styleNonce?: string`
  - 传递 nonce 给添加到 document head 的 style 标签，适用于使用内容安全策略 (CSP) nonce 允许内联样式的场景
- `shadowDOMTarget?: ShadowRoot`
  - 默认行为会将开发工具样式应用到 DOM 的 head 标签
  - 传入 shadow DOM 目标节点可使样式作用于 shadow DOM 内部，而非 light DOM 的 head 标签
