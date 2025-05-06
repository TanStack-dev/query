---
source-updated-at: '2025-04-02T06:46:03.000Z'
translation-updated-at: '2025-05-06T04:06:04.912Z'
id: suspense
title: Suspense
---

React Query 也可以与 React 的 Suspense for Data Fetching APIs 配合使用。为此，我们提供了专用的钩子：

- [useSuspenseQuery](../reference/useSuspenseQuery.md)
- [useSuspenseInfiniteQuery](../reference/useSuspenseInfiniteQuery.md)
- [useSuspenseQueries](../reference/useSuspenseQueries.md)
- 此外，你还可以使用 `useQuery().promise` 和 `React.use()`（实验性功能）

当启用 suspense 模式时，不再需要 `status` 状态和 `error` 对象，它们会被 `React.Suspense` 组件（包括使用 `fallback` 属性和 React 错误边界来捕获错误）替代。请阅读 [重置错误边界](#resetting-error-boundaries) 并查看 [Suspense 示例](../examples/react/suspense) 了解如何设置 suspense 模式。

如果你希望 mutations 将错误传播到最近的错误边界（类似于 queries），可以将 `throwOnError` 选项设置为 `true`。

为 query 启用 suspense 模式：

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'

const { data } = useSuspenseQuery({ queryKey, queryFn })
```

这在 TypeScript 中运行良好，因为 `data` 保证已定义（错误和加载状态由 Suspense 和 ErrorBoundaries 处理）。

另一方面，因此你不能有条件地启用/禁用 Query。对于依赖的 Queries 来说，这通常不是必需的，因为使用 suspense 时，组件内的所有 Queries 会按顺序获取。

这种 Query 也不存在 `placeholderData`。为了防止 UI 在更新期间被 fallback 替换，请将更改 QueryKey 的更新包装在 [startTransition](https://react.dev/reference/react/Suspense#preventing-unwanted-fallbacks) 中。

### throwOnError 默认值

默认情况下，并非所有错误都会抛出到最近的错误边界——我们只会在没有其他数据可显示时抛出错误。这意味着如果 Query 曾经在缓存中成功获取过数据，即使数据是 `stale` 的，组件也会渲染。因此，`throwOnError` 的默认值为：

```
throwOnError: (error, query) => typeof query.state.data === 'undefined'
```

由于你不能更改 `throwOnError`（因为这可能导致 `data` 变为 `undefined`），如果你希望所有错误都由错误边界处理，必须手动抛出错误：

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'

const { data, error, isFetching } = useSuspenseQuery({ queryKey, queryFn })

if (error && !isFetching) {
  throw error
}

// 继续渲染数据
```

## 重置错误边界

无论你在 queries 中使用的是 **suspense** 还是 **throwOnError**，都需要一种方式让 queries 知道在发生错误后重新渲染时你想重试。

Query 错误可以通过 `QueryErrorResetBoundary` 组件或 `useQueryErrorResetBoundary` 钩子重置。

使用组件时，它会重置组件边界内的所有 query 错误：

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const App = () => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ resetErrorBoundary }) => (
          <div>
            发生错误！
            <Button onClick={() => resetErrorBoundary()}>重试</Button>
          </div>
        )}
      >
        <Page />
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
)
```

使用钩子时，它会重置最近的 `QueryErrorResetBoundary` 内的所有 query 错误。如果没有定义边界，则会全局重置：

```tsx
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const App = () => {
  const { reset } = useQueryErrorResetBoundary()
  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <div>
          发生错误！
          <Button onClick={() => resetErrorBoundary()}>重试</Button>
        </div>
      )}
    >
      <Page />
    </ErrorBoundary>
  )
}
```

## 渲染时获取 vs 边渲染边获取

默认情况下，React Query 在 `suspense` 模式下作为 **渲染时获取 (Fetch-on-render)** 解决方案运行良好，无需额外配置。这意味着当你的组件尝试挂载时，它们会触发 query 获取并暂停，但只有在你导入并挂载它们之后才会发生。如果你想更进一步，实现 **边渲染边获取 (Render-as-you-fetch)** 模型，我们建议在路由回调和/或用户交互事件上实现 [预取 (Prefetching)](./prefetching.md)，以便在挂载之前开始加载 queries，甚至在你开始导入或挂载它们的父组件之前。

## 服务端 Suspense 与流式渲染

如果你使用 `NextJs`，可以使用我们的 **实验性** 集成来实现服务端 Suspense：`@tanstack/react-query-next-experimental`。这个包允许你在服务端（在客户端组件中）获取数据，只需在组件中调用 `useSuspenseQuery`。结果会随着 SuspenseBoundaries 的解析从服务端流式传输到客户端。

要实现这一点，请将你的应用包装在 `ReactQueryStreamedHydration` 组件中：

```tsx
// app/providers.tsx
'use client'

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import * as React from 'react'
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 使用 SSR 时，通常希望将默认的 staleTime 设置为
        // 大于 0 的值，以避免在客户端立即重新获取
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // 服务端：始终创建一个新的 query client
    return makeQueryClient()
  } else {
    // 浏览器：如果没有 query client，则创建一个新的
    // 这非常重要，这样在初始渲染期间 React 暂停时不会重新创建 client
    // 如果我们在创建 query client 下方有 suspense 边界，则可能不需要这样做
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function Providers(props: { children: React.ReactNode }) {
  // 注意：如果在初始化 query client 时没有 suspense 边界，
  //       避免使用 useState，因为 React 会在初始渲染暂停时丢弃 client
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {props.children}
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  )
}
```

更多信息，请查看 [NextJs Suspense 流式渲染示例](../examples/react/nextjs-suspense-streaming) 和 [高级渲染与注水 (Advanced Rendering & Hydration)](./advanced-ssr.md) 指南。

## 使用 `useQuery().promise` 和 `React.use()`（实验性功能）

> 要启用此功能，你需要在创建 `QueryClient` 时将 `experimental_prefetchInRender` 选项设置为 `true`

**示例代码：**

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
})
```

**用法：**

```tsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTodos, type Todo } from './api'

function TodoList({ query }: { query: UseQueryResult<Todo[]> }) {
  const data = React.use(query.promise)

  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

export function App() {
  const query = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

  return (
    <>
      <h1>Todos</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <TodoList query={query} />
      </React.Suspense>
    </>
  )
}
```
