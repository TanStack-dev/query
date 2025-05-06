---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:16:25.641Z'
id: advanced-ssr
title: 高级服务端渲染
---

欢迎阅读高级服务端渲染 (Advanced Server Rendering) 指南，这里您将全面了解如何在流式渲染、服务器组件 (Server Components) 和 Next.js 应用路由 (app router) 中使用 React Query。

建议先阅读[服务端渲染与注水 (Server Rendering & Hydration)](./ssr.md) 指南了解 SSR 基础，以及[性能与请求瀑布流 (Performance & Request Waterfalls)](./request-waterfalls.md) 和[预取与路由集成 (Prefetching & Router Integration)](./prefetching.md) 获取背景知识。

首先请注意，虽然 SSR 指南中提到的 `initialData` 方式也适用于服务器组件，但本指南将重点介绍注水 (hydration) API。

## 服务器组件与 Next.js 应用路由

我们不会深入探讨服务器组件，简而言之它们是**保证仅在服务端运行**的组件，既在初始页面加载时，也**在页面切换时**运行。这与 Next.js 的 `getServerSideProps`/`getStaticProps` 和 Remix 的 `loader` 类似，但服务器组件不仅能返回数据，还能执行更多操作。不过数据部分仍是 React Query 的核心关注点。

如何将服务端渲染指南中[通过框架加载器预取数据](./ssr.md#using-the-hydration-apis)的知识应用到服务器组件和 Next.js 应用路由？最佳思路是将服务器组件视为"另一种"框架加载器。

### 术语说明

目前我们一直使用*服务端*和*客户端*这两个术语。需要注意的是，这与*服务器组件*和*客户端组件*并非一一对应。服务器组件保证只在服务端运行，但客户端组件实际上可以在两端运行，因为它们也会在初始*服务端渲染*阶段执行。

可以理解为：服务器组件的渲染发生在"加载阶段"（始终在服务端），而客户端组件运行在"应用阶段"。这个应用阶段既可能在 SSR 时运行于服务端，也可能在浏览器中运行。具体运行位置和是否参与 SSR 取决于不同框架的实现。

### 初始设置

React Query 的第一步总是创建 `queryClient` 并用 `QueryClientProvider` 包裹应用。在服务器组件中的设置各框架大体相似，主要区别在于文件命名约定：

```tsx
// Next.js 中该文件名为: app/providers.tsx
'use client'

// 由于 QueryClientProvider 底层依赖 useContext，必须在顶部声明 'use client'
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR 时通常需要设置默认 staleTime
        // 大于 0 以避免客户端立即重新获取
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // 服务端：总是创建新 query client
    return makeQueryClient()
  } else {
    // 浏览器：如果没有则创建新 query client
    // 这非常重要，避免在初始渲染时 React 挂起导致重复创建
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // 注意：如果没有 suspense 边界，应避免使用 useState 初始化 query client
  // 因为 React 会在初始挂起渲染时丢弃该 client
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

```tsx
// Next.js 中该文件名为: app/layout.tsx
import Providers from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

这与 SSR 指南中的做法非常相似，只是需要将代码拆分到两个文件中。

### 数据预取与脱水/注水

接下来看看如何在**Next.js 页面路由**中预取数据并进行脱水/注水：

```tsx
// pages/posts.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useQuery,
} from '@tanstack/react-query'

// 这里也可以是 getServerSideProps
export async function getStaticProps() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

function Posts() {
  // 这个 useQuery 也可以放在 <PostsRoute> 的深层子组件中
  // 注意这里使用 useQuery 而非 useSuspenseQuery
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts })

  // 这个查询未在服务端预取，会在客户端才开始获取
  const { data: commentsData } = useQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  })

  // ...
}

export default function PostsRoute({ dehydratedState }) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Posts />
    </HydrationBoundary>
  )
}
```

转换为应用路由后代码非常相似，只需稍作调整。首先创建服务器组件处理预取：

```tsx
// app/posts/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import Posts from './posts'

export default async function PostsPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return (
    // 注：HydrationBoundary 是客户端组件，注水将在那里发生
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts />
    </HydrationBoundary>
  )
}
```

客户端组件部分如下：

```tsx
// app/posts/posts.tsx
'use client'

export default function Posts() {
  // 这个 useQuery 也可以放在深层子组件中
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts(),
  })

  // 这个查询未在服务端预取，会在客户端才开始获取
  const { data: commentsData } = useQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  })

  // ...
}
```

这些示例的巧妙之处在于，除了文件名外其他代码在任何支持服务器组件的框架中都通用。

在 SSR 指南中我们提到可以省略每个路由中的 `<HydrationBoundary>` 样板代码，但这在服务器组件中不可行。

> 注意：如果在 TypeScript 低于 `5.1.3` 或 `@types/react` 低于 `18.2.8` 版本中使用异步服务器组件遇到类型错误，建议升级到最新版本。临时解决方案是在调用组件时添加 `{/* @ts-expect-error Server Component */}`。详见 Next.js 13 文档中的[异步服务器组件类型错误](https://nextjs.org/docs/app/building-your-application/configuring/typescript#async-server-component-typescript-error)。

> 注意：如果遇到错误 `Only plain objects, and a few built-ins, can be passed to Server Actions. Classes or null prototypes are not supported.`，请确保没有向 queryFn 传递函数引用，而应调用函数，因为 queryFn 参数包含许多不可序列化的属性。参见[服务器操作仅在 queryFn 非引用时有效](https://github.com/TanStack/query/issues/6264)。

### 嵌套服务器组件

服务器组件的优势在于可以嵌套在 React 树的多个层级，使得数据预取更接近实际使用位置。简单示例如下（省略客户端组件）：

```tsx
// app/posts/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import Posts from './posts'
import CommentsServerComponent from './comments-server'

export default async function PostsPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts />
      <CommentsServerComponent />
    </HydrationBoundary>
  )
}

// app/posts/comments-server.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import Comments from './comments'

export default async function CommentsServerComponent() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Comments />
    </HydrationBoundary>
  )
}
```

可以多次使用 `<HydrationBoundary>` 并创建多个 `queryClient` 进行预取。注意由于在渲染 `CommentsServerComponent` 前等待 `getPosts`，会导致服务端瀑布流：

```
1. |> getPosts()
2.   |> getComments()
```

在 Next.js 中，除了在 `page.tsx` 预取数据，还可以在 `layout.tsx` 和[并行路由](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)中进行，Next.js 会自动并行获取这些路由数据。

### 替代方案：使用单一 queryClient

虽然推荐为每个服务器组件创建新的 `queryClient`，但也可以选择复用单个实例：

```tsx
// app/getQueryClient.tsx
import { QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

// cache() 按请求作用域，避免请求间数据泄漏
const getQueryClient = cache(() => new QueryClient())
export default getQueryClient
```

这样可以在任何服务器组件调用的地方获取该客户端，但每次 `dehydrate()` 都会序列化整个 `queryClient`，包括已序列化的无关查询。如果框架不会自动去重请求，这种方式可能更合适。

未来可能引入 `dehydrateNew()` 函数仅序列化新增查询，欢迎参与贡献。

### 数据所有权与重新验证

在服务器组件中使用时需注意数据所有权问题。例如：

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  const queryClient = new QueryClient()
  const posts = await queryClient.fetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>文章数: {posts.length}</div>
      <Posts />
    </HydrationBoundary>
  )
}
```

当客户端重新验证数据时，服务组件中的 `文章数` 不会更新。如果设置 `staleTime: Infinity` 可以避免此问题，但这样就失去了使用 React Query 的意义。

适合使用 React Query 与服务器组件的场景：

- 已有 React Query 应用需要迁移到服务器组件
- 需要结合服务器组件优势的特定用例
- 框架提供的数据获取工具无法满足需求

**新建服务器组件应用时，建议先使用框架提供的数据获取工具，确有需要再引入 React Query。**

## 服务器组件的流式渲染

Next.js 应用路由会自动流式传输已准备好的内容。使用上述预取模式时，React Query 完全兼容这种流式渲染。从 v5.40.0 开始，甚至可以脱水待处理查询，实现数据流式传输。

需要调整 `queryClient` 配置以包含待处理查询：

```tsx
// app/get-query-client.ts
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })
}
```

然后在页面组件中无需等待预取：

```tsx
// app/posts/page.tsx
export default function PostsPage() {
  const queryClient = getQueryClient()
  queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts />
    </HydrationBoundary>
  )
}
```

客户端组件可以使用 `useSuspenseQuery` 获取这些数据：

```tsx
// app/posts/posts.tsx
'use client'

export default function Posts() {
  const { data } = useSuspenseQuery({ queryKey: ['posts'], queryFn: getPosts })
  // ...
}
```

如需处理非 JSON 数据类型，可以配置序列化/反序列化选项：

```tsx
// 配置序列化选项
dehydrate: {
  serializeData: serialize,
},
hydrate: {
  deserializeData: deserialize,
}
```

## Next.js 实验性无预取流式渲染

虽然推荐上述预取方案，但也可以通过实验性包 `@tanstack/react-query-next-experimental` 实现无预取的流式 SSR。使用 `ReactQueryStreamedHydration` 包裹应用：

```tsx
// app/providers.tsx
'use client'

import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

export function Providers({ children }) {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
    </QueryClientProvider>
  )
}
```

这种方式简化了代码但会导致页面导航时的请求瀑布流。适合更注重开发体验而非性能的场景。

## 结语

服务器组件和流式渲染仍是较新的概念，我们仍在探索如何优化 React Query 的集成。欢迎提供建议和反馈！同样，这份指南也在不断完善中，如果您发现遗漏或有改进建议，欢迎通过 GitHub 提交修改。
