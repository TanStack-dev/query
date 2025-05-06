---
source-updated-at: '2025-04-02T06:46:03.000Z'
translation-updated-at: '2025-05-06T04:09:15.592Z'
id: ssr
title: 服务端渲染与注水
---
# 服务端渲染与注水 (Server Rendering & Hydration)

在本指南中，您将学习如何结合服务端渲染使用 React Query。

关于背景知识，请参阅[预取与路由集成](./prefetching.md)指南。在此之前，您可能还需要查看[性能与请求瀑布流指南](./request-waterfalls.md)。

如需了解高级服务端渲染模式（如流式传输、服务器组件和新的 Next.js app router），请参阅[高级服务端渲染指南](./advanced-ssr.md)。

如果您只想查看代码示例，可以直接跳转到下方的[完整 Next.js pages router 示例](#full-nextjs-pages-router-example)或[完整 Remix 示例](#full-remix-example)。

## 服务端渲染与 React Query

那么什么是服务端渲染？本指南的其余部分将假设您已熟悉这个概念，但让我们花些时间看看它与 React Query 的关系。服务端渲染是在服务器上生成初始 HTML 的行为，这样用户在页面加载时就能立即看到一些内容。这可以在页面被请求时按需发生（SSR），也可以因为之前的请求被缓存或在构建时（SSG）提前发生。

如果您阅读过请求瀑布流指南，可能会记得这个流程：

```
1. |-> 标记（无内容）
2.   |-> JavaScript
3.     |-> 查询
```

在客户端渲染的应用程序中，这是用户在屏幕上看到任何内容之前至少需要进行的 3 次服务器往返。服务端渲染的一种理解方式是将其转变为：

```
1. |-> 标记（包含内容 AND 初始数据）
2.   |-> JavaScript
```

一旦 **1.** 完成，用户就可以看到内容，当 **2.** 完成时，页面变得可交互和可点击。因为标记中还包含我们需要的初始数据，所以步骤 **3.** 根本不需要在客户端运行，至少在您因某些原因想要重新验证数据之前不需要。

这都是从客户端的角度来看的。在服务器端，我们需要在生成/渲染标记之前**预取**数据，需要将该数据**脱水**为可序列化的格式以便嵌入到标记中，而在客户端，我们需要将该数据**注水**到 React Query 缓存中，以避免在客户端进行新的获取。

继续阅读以了解如何用 React Query 实现这三个步骤。

## 关于 Suspense 的快速说明

本指南使用常规的 `useQuery` API。虽然我们不一定会推荐，但可以用 `useSuspenseQuery` 替代它，**只要您总是预取所有查询**。这样做的好处是您可以在客户端使用 `<Suspense>` 来处理加载状态。

如果您在使用 `useSuspenseQuery` 时忘记预取查询，后果将取决于您使用的框架。在某些情况下，数据会在服务器端 Suspense 并获取，但永远不会被注水到客户端，客户端会再次获取。在这些情况下，您会遇到标记注水不匹配的问题，因为服务器和客户端尝试渲染不同的内容。

## 初始设置

使用 React Query 的第一步始终是创建一个 `queryClient` 并将应用程序包裹在 `<QueryClientProvider>` 中。在进行服务端渲染时，重要的是在您的应用程序内部、React 状态中创建 `queryClient` 实例（实例引用也可以）。**这确保不同用户和请求之间的数据不会共享**，同时仍然只在组件生命周期中创建一次 `queryClient`。

Next.js pages router 示例：

```tsx
// _app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 永远不要这样做：
// const queryClient = new QueryClient()
//
// 在文件根级别创建 queryClient 会使缓存
// 在所有请求之间共享，意味着 _所有_ 数据都会传递给 _所有_ 用户。
// 除了对性能不利外，这还会泄露任何敏感数据。

export default function MyApp({ Component, pageProps }) {
  // 应该这样做，确保每个请求都有自己的缓存：
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 使用 SSR 时，我们通常希望设置默认的 staleTime
            // 大于 0，以避免在客户端立即重新获取
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
```

Remix 示例：

```tsx
// app/root.tsx
import { Outlet } from '@remix-run/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function MyApp() {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 使用 SSR 时，我们通常希望设置默认的 staleTime
            // 大于 0，以避免在客户端立即重新获取
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )
}
```

## 使用 `initialData` 快速开始

最快的方法是根本不涉及 React Query 的预取功能，也不使用 `dehydrate`/`hydrate` API。相反，您可以将原始数据作为 `initialData` 选项传递给 `useQuery`。让我们看一个使用 Next.js pages router 和 `getServerSideProps` 的示例。

```tsx
export async function getServerSideProps() {
  const posts = await getPosts()
  return { props: { posts } }
}

function Posts(props) {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    initialData: props.posts,
  })

  // ...
}
```

这也适用于 `getStaticProps` 甚至较旧的 `getInitialProps`，相同的模式可以应用于任何具有等效功能的其他框架。这是在 Remix 中的相同示例：

```tsx
export async function loader() {
  const posts = await getPosts()
  return json({ posts })
}

function Posts() {
  const { posts } = useLoaderData<typeof loader>()

  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    initialData: posts,
  })

  // ...
}
```

设置非常简单，这可以快速解决某些情况，但与完整方法相比，有**一些权衡需要考虑**：

- 如果您在树中更深层的组件中调用 `useQuery`，则需要将 `initialData` 传递到该点
- 如果您在多个位置使用相同的查询调用 `useQuery`，只将 `initialData` 传递给其中一个可能会很脆弱，并在应用程序更改时中断。如果您删除或移动了带有 `initialData` 的 `useQuery` 的组件，更深的 `useQuery` 可能不再有任何数据。将 `initialData` 传递给**所有**需要它的查询也可能很繁琐。
- 无法知道查询在服务器上获取的时间，因此 `dataUpdatedAt` 和确定查询是否需要重新获取是基于页面加载时间而不是查询获取时间
- 如果缓存中已有查询的数据，`initialData` 永远不会覆盖这些数据，**即使新数据比旧数据更新**。
  - 要理解为什么这特别糟糕，请考虑上面的 `getServerSideProps` 示例。如果您多次导航到页面并返回，`getServerSideProps` 每次都会被调用并获取新数据，但因为使用了 `initialData` 选项，客户端缓存和数据永远不会更新。

设置完整的注水解决方案很简单，并且没有这些缺点，这将是本文档其余部分的重点。

## 使用注水 API

只需稍多的设置，您就可以在预加载阶段使用 `queryClient` 预取查询，将该 `queryClient` 的序列化版本传递给应用程序的渲染部分并在那里重用。这避免了上述缺点。随意跳转到完整的 Next.js pages router 和 Remix 示例，但在一般情况下，这些是额外的步骤：

- 在框架的 loader 函数中，创建 `const queryClient = new QueryClient(options)`
- 在 loader 函数中，为每个要预取的查询执行 `await queryClient.prefetchQuery(...)`
  - 您希望尽可能使用 `await Promise.all(...)` 并行获取查询
  - 可以有不预取的查询。这些不会在服务器端渲染，而是在应用程序变得可交互后在客户端获取。这对于仅在用户交互后显示的内容或位于页面较下方以避免阻塞更关键内容的内容非常有用。
- 从 loader 返回 `dehydrate(queryClient)`，注意返回此的确切语法因框架而异
- 用 `<HydrationBoundary state={dehydratedState}>` 包裹您的树，其中 `dehydratedState` 来自框架的 loader。如何获取 `dehydratedState` 也因框架而异。
  - 这可以针对每个路由完成，也可以在应用程序顶部完成以避免样板代码，请参阅示例

> 一个有趣的细节是实际上涉及**三个** `queryClient`。框架的 loader 是一种"预加载"阶段，发生在渲染之前，这个阶段有自己的 `queryClient` 进行预取。这个阶段的脱水结果被传递给**服务器渲染过程**和**客户端渲染过程**，它们各自有自己的 `queryClient`。这确保它们从相同的数据开始，因此可以返回相同的标记。

> 服务器组件是另一种"预加载"阶段，也可以"预加载"（预渲染）React 组件树的部分。在[高级服务端渲染指南](./advanced-ssr.md)中了解更多。

### 完整 Next.js pages router 示例

> 有关 app router 的文档，请参阅[高级服务端渲染指南](./advanced-ssr.md)。

初始设置：

```tsx
// _app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function MyApp({ Component, pageProps }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 使用 SSR 时，我们通常希望设置默认的 staleTime
            // 大于 0，以避免在客户端立即重新获取
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
```

在每个路由中：

```tsx
// pages/posts.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useQuery,
} from '@tanstack/react-query'

// 也可以是 getServerSideProps
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
  // 这个 useQuery 也可以发生在 <PostsRoute> 的更深层子组件中，
  // 数据将立即可用
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts })

  // 这个查询没有在服务器上预取，将在客户端才开始
  // 获取，两种模式可以混合使用
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

### 完整 Remix 示例

初始设置：

```tsx
// app/root.tsx
import { Outlet } from '@remix-run/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function MyApp() {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 使用 SSR 时，我们通常希望设置默认的 staleTime
            // 大于 0，以避免在客户端立即重新获取
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )
}
```

在每个路由中，注意也可以在嵌套路由中这样做：

```tsx
// app/routes/posts.tsx
import { json } from '@remix-run/node'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useQuery,
} from '@tanstack/react-query'

export async function loader() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return json({ dehydratedState: dehydrate(queryClient) })
}

function Posts() {
  // 这个 useQuery 也可以发生在 <PostsRoute> 的更深层子组件中，
  // 数据将立即可用
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts })

  // 这个查询没有在服务器上预取，将在客户端才开始
  // 获取，两种模式可以混合使用
  const { data: commentsData } = useQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  })

  // ...
}

export default function PostsRoute() {
  const { dehydratedState } = useLoaderData<typeof loader>()
  return (
    <HydrationBoundary state={dehydratedState}>
      <Posts />
    </HydrationBoundary>
  )
}
```

## 可选 - 移除样板代码

在每个路由中都有这部分可能看起来有很多样板代码：

```tsx
export default function PostsRoute({ dehydratedState }) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Posts />
    </HydrationBoundary>
  )
}
```

虽然这种方法没有问题，但如果您想摆脱这种样板代码，可以这样修改 Next.js 的设置：

```tsx
// _app.tsx
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

export default function MyApp({ Component, pageProps }) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <Component {...pageProps} />
      </HydrationBoundary>
    </QueryClientProvider>
  )
}

// pages/posts.tsx
// 移除带有 HydrationBoundary 的 PostsRoute，直接导出 Posts：
export default function Posts() { ... }
```

对于 Remix，这稍微复杂一些，我们建议查看 [use-dehydrated-state](https://github.com/maplegrove-io/use-dehydrated-state) 包。

## 预取依赖查询

在预取指南中，我们学习了如何[预取依赖查询](./prefetching.md#dependent-queries--code-splitting)，但我们如何在框架的 loader 中做到这一点？考虑以下代码，取自[依赖查询指南](./dependent-queries.md)：

```tsx
// 获取用户
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
})

const userId = user?.id

// 然后获取用户的项目
const {
  status,
  fetchStatus,
  data: projects,
} = useQuery({
  queryKey: ['projects', userId],
  queryFn: getProjectsByUser,
  // 查询直到 userId 存在才会执行
  enabled: !!userId,
})
```

我们如何预取这个以便它可以进行服务端渲染？这里有一个示例：

```tsx
// 对于 Remix，将此重命名为 loader
export async function getServerSideProps() {
  const queryClient = new QueryClient()

  const user = await queryClient.fetchQuery({
    queryKey: ['user', email],
    queryFn: getUserByEmail,
  })

  if (user?.userId) {
    await queryClient.prefetchQuery({
      queryKey: ['projects', userId],
      queryFn: getProjectsByUser,
    })
  }

  // 对于 Remix：
  // return json({ dehydratedState: dehydrate(queryClient) })
  return { props: { dehydratedState: dehydrate(queryClient) } }
}
```

当然，这可能会变得更复杂，但由于这些 loader 函数只是 JavaScript，您可以使用该语言的全部功能来构建您的逻辑。确保预取所有您希望进行服务端渲染的查询。

## 错误处理

React Query 默认为优雅降级策略。这意味着：

- `queryClient.prefetchQuery(...)` 从不抛出错误
- `dehydrate(...)` 只包含成功的查询，不包括失败的查询

这将导致任何失败的查询在客户端重试，并且服务端渲染的输出将包括加载状态而不是完整内容。

虽然这是一个很好的默认设置，但有时这并不是您想要的。当关键内容缺失时，您可能希望根据情况返回 404 或 500 状态码。对于这些情况，请改用 `queryClient.fetchQuery(...)`，它会在失败时抛出错误，让您以适当的方式处理事情。

```tsx
let result

try {
  result = await queryClient.fetchQuery(...)
} catch (error) {
  // 处理错误，参考您的框架文档
}

// 您可能还想检查并处理任何无效的 `result`
```

如果出于某种原因，您希望在脱水状态中包含失败的查询以避免重试，可以使用 `shouldDehydrateQuery` 选项覆盖默认函数并实现自己的逻辑：

```tsx
dehydrate(queryClient, {
  shouldDehydrateQuery: (query) => {
    // 这将包括所有查询，包括失败的查询，
    // 但您也可以通过检查 `query` 实现自己的逻辑
    return true
  },
})
```

## 序列化

当在 Next.js 中执行 `return { props: { dehydratedState: dehydrate(queryClient) } }` 或在 Remix 中执行 `return json({ dehydratedState: dehydrate(queryClient) })` 时，发生的是 `queryClient` 的 `dehydratedState` 表示由框架序列化，以便可以嵌入到标记中并传输到客户端。

默认情况下，这些框架仅支持返回可安全序列化/解析的内容，因此不支持 `undefined`、`Error`、`Date`、`Map`、`Set`、`BigInt`、`Infinity`、`NaN`、`-0`、正则表达式等。这也意味着您不能从查询中返回任何这些内容。如果返回这些值是您想要的，请查看 [superjson](https://github.com/blitz-js/superjson) 或类似的包。

如果您使用自定义 SSR 设置，您需要自己处理这一步。您的第一反应可能是使用 `JSON.stringify(dehydratedState)`，但由于默认情况下这不会转义像 `<script>alert('Oh no..')</script>` 这样的内容，这很容易导致
