---
source-updated-at: '2025-04-03T21:54:40.000Z'
translation-updated-at: '2025-05-06T05:16:29.033Z'
id: overview
title: 概述
---
Solid Query 是 TanStack Query 的官方 SolidJS 适配器，它能让你在 Web 应用中轻松实现**数据获取、缓存、同步和更新服务端状态**。

## 动机

SolidJS 作为一个快速、响应式且声明式的用户界面构建库，正日益受到欢迎。它开箱即用地提供了许多功能。诸如 `createSignal`、`createStore` 等基础功能非常适合管理客户端状态。与其他 UI 库不同，SolidJS 对异步数据管理有着独到的见解。`createResource` API 是处理 SolidJS 应用中服务端状态的强大基础功能。`resource` 是一种特殊的信号 (signal)，可在数据加载状态时触发 `Suspense` 边界。

```tsx
import { createResource, ErrorBoundary, Suspense } from 'solid-js'
import { render } from 'solid-js/web'

function App() {
  const [repository] = createResource(async () => {
    const result = await fetch('https://api.github.com/repos/TanStack/query')
    if (!result.ok) throw new Error('Failed to fetch data')
    return result.json()
  })

  return (
    <div>
      <div>Static Content</div>
      {/* An error while fetching will be caught by the ErrorBoundary */}
      <ErrorBoundary fallback={<div>Something went wrong!</div>}>
        {/* Suspense will trigger a loading state while the data is being fetched */}
        <Suspense fallback={<div>Loading...</div>}>
          <div>{repository()?.updated_at}</div>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

const root = document.getElementById('root')

render(() => <App />, root!)
```

这非常棒！只需几行代码，你就能从 API 获取数据并处理加载和错误状态。但随着应用复杂度的增长，你将需要更多功能来有效管理服务端状态。这是因为**服务端状态与客户端状态完全不同**。首先，服务端状态：

- 持久化存储在你无法控制或拥有的远程位置
- 需要通过异步 API 进行获取和更新
- 意味着共享所有权，可能被他人更改而无需你知晓
- 如果不加注意，可能会在你的应用中变得“过时”

一旦理解了应用中服务端状态的本质，**更多挑战将接踵而至**，例如：

- 缓存...（可能是编程中最难实现的部分）
- 将针对相同数据的多个请求去重为单个请求
- 在后台更新“过时”数据
- 判断数据何时“过时”
- 尽可能快地反映数据更新
- 分页和懒加载数据等性能优化
- 管理服务端状态的内存和垃圾回收
- 通过结构共享 (structural sharing) 记忆化查询结果

此时 **Solid Query** 应运而生。该库封装了 `createResource`，并提供了一系列钩子和工具来有效管理服务端状态。它**开箱即用、零配置**，并可根据应用增长按需定制。

从技术角度来看，Solid Query 能：

- 帮助你移除应用中**大量**复杂且难以理解的代码，仅用少量 Solid Query 逻辑替代
- 提升应用可维护性，轻松构建新功能而无需担心接入新的服务端状态数据源
- 通过使应用感觉更快、响应更迅速，直接影响终端用户体验
- 可能帮助你节省带宽并提升内存性能

## 说够了，直接看代码吧！

在下面的示例中，你可以看到 Solid Query 最基本、简单的用法，用于获取 TanStack Query GitHub 项目的统计信息：

```tsx
import { ErrorBoundary, Suspense } from 'solid-js'
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/solid-query'

function App() {
  const repositoryQuery = useQuery(() => ({
    queryKey: ['TanStack Query'],
    queryFn: async () => {
      const result = await fetch('https://api.github.com/repos/TanStack/query')
      if (!result.ok) throw new Error('Failed to fetch data')
      return result.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    throwOnError: true, // Throw an error if the query fails
  }))

  return (
    <div>
      <div>Static Content</div>
      {/* An error while fetching will be caught by the ErrorBoundary */}
      <ErrorBoundary fallback={<div>Something went wrong!</div>}>
        {/* Suspense will trigger a loading state while the data is being fetched */}
        <Suspense fallback={<div>Loading...</div>}>
          {/* 
            The `data` property on a query is a SolidJS resource  
            so it will work with Suspense and transitions out of the box! 
          */}
          <div>{repositoryQuery.data?.updated_at}</div>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

const root = document.getElementById('root')
const client = new QueryClient()

render(
  () => (
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  ),
  root!,
)
```

## 看起来代码量反而更多了？

确实如此！但正是这几行代码开启了一个全新的可能性世界。在上面的示例中，你的查询会被缓存 5 分钟，这意味着如果应用中任何地方在 5 分钟内挂载了使用相同查询的新组件，它将不会重新获取数据，而是使用缓存数据。这只是 Solid Query 开箱即用提供的众多功能之一。其他功能包括：

- **自动重新获取**：当查询变得“过时”（根据 `staleTime` 选项判断）时，会自动在后台重新获取
- **自动缓存**：查询默认被缓存并在整个应用中共享
- **请求去重**：多个组件可以共享同一查询并只发起一次请求
- **自动垃圾回收**：不再需要的查询会被自动垃圾回收
- **窗口焦点重新获取**：当应用重新获得焦点时，查询会自动重新获取
- **分页**：内置分页支持
- **请求取消**：自动取消过时或不必要的请求
- **轮询/实时更新**：通过简单的 `refetchInterval` 选项即可轻松实现轮询或实时更新
- **服务端渲染 (SSR) 支持**：Solid Query 与服务端渲染完美配合
- **乐观更新**：轻松通过乐观更新缓存
- **更多功能...**
