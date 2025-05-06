---
source-updated-at: '2024-09-26T17:04:33.000Z'
translation-updated-at: '2025-05-06T03:48:33.223Z'
id: stable-query-client
title: 稳定的 Query Client
---

QueryClient 包含了 QueryCache，因此你应当只为应用的生命周期创建一个 QueryClient 实例 —— 而非在每次渲染时都创建新实例。

> 例外情况：允许在异步服务端组件 (async Server Component) 内部创建新的 QueryClient，因为该异步函数仅在服务端调用一次。

## 规则详情

以下为该规则的 **错误** 代码示例：

```tsx
/* eslint "@tanstack/query/stable-query-client": "error" */

function App() {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}
```

以下为该规则的 **正确** 代码示例：

```tsx
function App() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}
```

```tsx
const queryClient = new QueryClient()
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}
```

```tsx
async function App() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(options)
}
```

## 特性

- [x] ✅ 推荐配置
- [x] 🔧 可自动修复
