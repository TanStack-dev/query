---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:11:22.321Z'
id: prefetching
title: 预获取与路由集成
---
当您预知或推测某块数据即将被需要时，可以通过预取 (prefetching) 提前将该数据填充到缓存中，从而获得更快的用户体验。

预取存在几种不同的实现模式：

1. 在事件处理器中预取
2. 在组件中预取  
3. 通过路由集成预取  
4. 在服务端渲染时预取（路由集成的另一种形式）

本指南将探讨前三种模式，而第四种模式将在[《服务端渲染与注水指南》](./ssr.md)和[《高级服务端渲染指南》](./advanced-ssr.md)中深入讲解。

预取的一个典型应用场景是避免请求瀑布流 (Request Waterfalls)，相关背景和原理详见[《性能与请求瀑布流指南》](./request-waterfalls.md)。

## prefetchQuery 与 prefetchInfiniteQuery

在深入具体预取模式前，我们先了解 `prefetchQuery` 和 `prefetchInfiniteQuery` 函数的基础特性：

- 默认情况下，这些函数会使用 `queryClient` 配置的默认 `staleTime` 来判断缓存中的现有数据是否新鲜或需要重新获取
- 也可指定自定义的 `staleTime`：`prefetchQuery({ queryKey: ['todos'], queryFn: fn, staleTime: 5000 })`
  - 此 `staleTime` 仅作用于预取操作，仍需为 `useQuery` 调用单独设置
  - 若需忽略 `staleTime` 直接返回缓存中的可用数据，可使用 `ensureQueryData` 函数
  - 提示：在服务端预取时，建议为 `queryClient` 设置高于 `0` 的默认 `staleTime`，避免为每个预取调用单独传参
- 如果预取的查询没有对应的 `useQuery` 实例，将在 `gcTime` 指定时间后被删除并进行垃圾回收
- 这些函数返回 `Promise<void>` 且不返回查询数据。如需获取数据，请改用 `fetchQuery`/`fetchInfiniteQuery`
- 预取函数不会抛出错误，因为它们通常会在 `useQuery` 中重试请求作为优雅降级方案。如需错误捕获，请改用 `fetchQuery`/`fetchInfiniteQuery`

`prefetchQuery` 的使用示例如下：

[//]: # 'ExamplePrefetchQuery'

```tsx
const prefetchTodos = async () => {
  // 该查询结果会像普通查询一样被缓存
  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
}
```

[//]: # 'ExamplePrefetchQuery'

无限查询 (Infinite Queries) 的预取方式与常规查询相同。默认仅预取第一页数据并存储于指定 QueryKey 下。如需预取多页数据，可使用 `pages` 选项并配合 `getNextPageParam` 函数：

[//]: # 'ExamplePrefetchInfiniteQuery'

```tsx
const prefetchProjects = async () => {
  // 该查询结果会像普通查询一样被缓存
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    pages: 3, // 预取前 3 页数据
  })
}
```

[//]: # 'ExamplePrefetchInfiniteQuery'

接下来我们将探讨如何在不同场景下应用这些预取方法。

## 在事件处理器中预取

最直接的预取方式是在用户交互时触发。以下示例通过 `onMouseEnter` 或 `onFocus` 事件调用 `queryClient.prefetchQuery`：

[//]: # 'ExampleEventHandler'

```tsx
function ShowDetailsButton() {
  const queryClient = useQueryClient()

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['details'],
      queryFn: getDetailsData,
      // 预取仅在数据早于 staleTime 时触发
      // 此类场景务必设置该参数
      staleTime: 60000,
    })
  }

  return (
    <button onMouseEnter={prefetch} onFocus={prefetch} onClick={...}>
      查看详情
    </button>
  )
}
```

[//]: # 'ExampleEventHandler'

## 在组件中预取

当预知子组件需要某块数据但需等待其他查询完成时，组件生命周期内的预取非常有用。以下示例来自请求瀑布流指南：

[//]: # 'ExampleComponent'

```tsx
function Article({ id }) {
  const { data: articleData, isPending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  if (isPending) {
    return '文章加载中...'
  }

  return (
    <>
      <ArticleHeader articleData={articleData} />
      <ArticleBody articleData={articleData} />
      <Comments id={id} />
    </>
  )
}

function Comments({ id }) {
  const { data, isPending } = useQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })

  ...
}
```

[//]: # 'ExampleComponent'

此时会产生如下请求瀑布流：

```
1. |> getArticleById()
2.   |> getArticleCommentsById()
```

如指南所述，优化方案之一是将 `getArticleCommentsById` 查询提升到父组件并通过 props 传递。但当组件层级复杂或关联性较弱时，可以采用预取方案：

[//]: # 'ExampleParentComponent'

```tsx
function Article({ id }) {
  const { data: articleData, isPending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  // 预取操作
  useQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
    // 可选优化：避免查询变化导致的重复渲染
    notifyOnChangeProps: [],
  })

  if (isPending) {
    return '文章加载中...'
  }

  return (
    <>
      <ArticleHeader articleData={articleData} />
      <ArticleBody articleData={articleData} />
      <Comments id={id} />
    </>
  )
}

function Comments({ id }) {
  const { data, isPending } = useQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })

  ...
}
```

[//]: # 'ExampleParentComponent'

此时请求变为并行：

```
1. |> getArticleById()
1. |> getArticleCommentsById()
```

[//]: # 'Suspense'

若需结合 Suspense 使用预取，需采用特殊处理。由于 `useSuspenseQueries` 会阻塞渲染，而 `useQuery` 又会在 suspenseful query 解析后才启动预取，此时应使用 [`usePrefetchQuery`](../reference/usePrefetchQuery.md) 或 [`usePrefetchInfiniteQuery`](../reference/usePrefetchInfiniteQuery.md) 钩子。

实际需要数据的组件可使用 `useSuspenseQuery`。建议为次级查询包裹单独的 `<Suspense>` 边界，避免阻塞主要数据渲染：

```tsx
function ArticleLayout({ id }) {
  usePrefetchQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })

  return (
    <Suspense fallback="加载文章中">
      <Article id={id} />
    </Suspense>
  )
}

function Article({ id }) {
  const { data: articleData, isPending } = useSuspenseQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  ...
}
```

另一种方案是在查询函数内预取，适用于文章与评论数据强关联的场景：

```tsx
const queryClient = useQueryClient()
const { data: articleData, isPending } = useQuery({
  queryKey: ['article', id],
  queryFn: (...args) => {
    queryClient.prefetchQuery({
      queryKey: ['article-comments', id],
      queryFn: getArticleCommentsById,
    })

    return getArticleById(...args)
  },
})
```

Effect 中的预取也可行，但注意若同一组件使用 `useSuspenseQuery`，effect 会在查询完成后才执行：

```tsx
const queryClient = useQueryClient()

useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })
}, [queryClient, id])
```

总结组件内预取的四种方案（根据场景选择）：
- 使用 `usePrefetchQuery` 或 `usePrefetchInfiniteQuery` 在 Suspense 边界前预取
- 使用 `useQuery` 或 `useSuspenseQueries` 并忽略结果
- 在查询函数内预取
- 在 effect 中预取

接下来我们看更复杂的案例。

[//]: # 'Suspense'

### 依赖查询与代码分割

有时需要基于其他查询结果条件式预取。以下示例来自[《性能与请求瀑布流指南》](./request-waterfalls.md)：

[//]: # 'ExampleConditionally1'

```tsx
// 动态加载 GraphFeedItem 组件
// 只有在渲染时才会开始加载
const GraphFeedItem = React.lazy(() => import('./GraphFeedItem'))

function Feed() {
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  if (isPending) {
    return '加载动态中...'
  }

  return (
    <>
      {data.map((feedItem) => {
        if (feedItem.type === 'GRAPH') {
          return <GraphFeedItem key={feedItem.id} feedItem={feedItem} />
        }

        return <StandardFeedItem key={feedItem.id} feedItem={feedItem} />
      })}
    </>
  )
}

// GraphFeedItem.tsx
function GraphFeedItem({ feedItem }) {
  const { data, isPending } = useQuery({
    queryKey: ['graph', feedItem.id],
    queryFn: getGraphDataById,
  })

  ...
}
```

[//]: # 'ExampleConditionally1'

此时会产生双重请求瀑布：

```
1. |> getFeed()
2.   |> JS for <GraphFeedItem>
3.     |> getGraphDataById()
```

若无法通过 API 重构让 `getFeed()` 返回 `getGraphDataById()` 数据，虽然无法消除 `getFeed->getGraphDataById` 瀑布流，但通过条件预取可实现代码与数据并行加载（以下示例在查询函数中实现）：

[//]: # 'ExampleConditionally2'

```tsx
function Feed() {
  const queryClient = useQueryClient()
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: async (...args) => {
      const feed = await getFeed(...args)

      for (const feedItem of feed) {
        if (feedItem.type === 'GRAPH') {
          queryClient.prefetchQuery({
            queryKey: ['graph', feedItem.id],
            queryFn: getGraphDataById,
          })
        }
      }

      return feed
    }
  })

  ...
}
```

[//]: # 'ExampleConditionally2'

此时加载流程变为：

```
1. |> getFeed()
2.   |> JS for <GraphFeedItem>
2.   |> getGraphDataById()
```

但需权衡的是：`getGraphDataById` 的代码现在会打包到父组件中。若 `GraphFeedItem` 出现频率高，这种优化值得；若非常罕见，则可能不划算。

[//]: # 'Router'

## 路由集成

由于组件树内的数据获取容易引发请求瀑布流，而各种修复方案又会在应用中不断累积，将预取集成到路由层成为颇具吸引力的解决方案。

这种方式需要为每个路由预先声明其组件树所需的数据。传统服务端渲染 (SSR) 应用由于需要在渲染前加载所有数据，长期采用此方案（详见[《服务端渲染与注水指南》](./ssr.md)）。

以下以 [Tanstack Router](https://tanstack.com/router) 为例展示客户端方案（省略了大量配置代码，完整示例参见 [Tanstack Router 文档](https://tanstack.com/router/latest/docs)）：

路由集成时，可选择阻塞渲染直到数据加载完成，或不等待结果立即开始渲染。也可混合使用——等待关键数据同时预取次要数据。本例中 `/article` 路由会等待文章数据加载，同时预取但不阻塞评论数据：

```tsx
const queryClient = new QueryClient()
const routerContext = new RouterContext()
const rootRoute = routerContext.createRootRoute({
  component: () => { ... }
})

const articleRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'article',
  beforeLoad: () => {
    return {
      articleQueryOptions: { queryKey: ['article'], queryFn: fetchArticle },
      commentsQueryOptions: { queryKey: ['comments'], queryFn: fetchComments },
    }
  },
  loader: async ({
    context: { queryClient },
    routeContext: { articleQueryOptions, commentsQueryOptions },
  }) => {
    // 立即预取评论但不阻塞
    queryClient.prefetchQuery(commentsQueryOptions)

    // 阻塞直到文章数据加载完成
    await queryClient.prefetchQuery(articleQueryOptions)
  },
  component: ({ useRouteContext }) => {
    const { articleQueryOptions, commentsQueryOptions } = useRouteContext()
    const articleQuery = useQuery(articleQueryOptions)
    const commentsQuery = useQuery(commentsQueryOptions)

    return (
      ...
    )
  },
  errorComponent: () => '出错了！',
})
```

其他路由器的集成方案也可行，参见 [React Router 示例](../examples/react/react-router)。

[//]: # 'Router'

## 手动初始化查询

如果已同步获取到查询数据，可直接使用 [Query Client 的 `setQueryData` 方法](../../../reference/QueryClient.md#queryclientsetquerydata) 通过键值对添加或更新缓存结果：

[//]: # 'ExampleManualPriming'

```tsx
queryClient.setQueryData(['todos'], todos)
```

[//]: # 'ExampleManualPriming'
[//]: # 'Materials'

## 扩展阅读

- 深度探讨如何预先填充查询缓存，请参阅社区资源中的 [#17: 初始化查询缓存](../community/tkdodos-blog.md#17-seeding-the-query-cache)
- 服务端路由与框架的集成方案类似客户端方案，但需额外处理服务端到客户端的数据注水，详见[《服务端渲染与注水指南》](./ssr.md)

[//]: # 'Materials'
