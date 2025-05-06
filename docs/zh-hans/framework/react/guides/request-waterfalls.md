---
source-updated-at: '2025-04-02T06:46:03.000Z'
translation-updated-at: '2025-05-06T04:11:08.176Z'
id: request-waterfalls
title: 性能与请求瀑布流
---
应用性能是一个广泛而复杂的领域，虽然 React Query 无法让你的 API 变得更快，但在使用 React Query 时仍需注意一些事项以确保最佳性能。

使用 React Query 或任何允许在组件内部获取数据的库时，最大的性能隐患是**请求瀑布流**。本页剩余部分将解释什么是请求瀑布流、如何发现它们，以及如何重构应用或 API 来避免它们。

[预取与路由集成指南](./prefetching.md)在此基础上进一步讲解，教你如何在无法或不适合重构应用或 API 时提前预取数据。

[服务端渲染与注水指南](./ssr.md)教你如何在服务端预取数据并将其传递到客户端，从而避免重复获取。

[高级服务端渲染指南](./advanced-ssr.md)进一步讲解如何将这些模式应用到服务端组件 (Server Components) 和流式服务端渲染 (Streaming Server Rendering) 中。

## 什么是请求瀑布流？

请求瀑布流指的是当某个资源（代码、CSS、图片、数据）的请求必须等待另一个资源的请求完成后才能开始。

以网页为例。在加载 CSS、JS 等内容之前，浏览器需要先加载标记 (markup)。这就是一个请求瀑布流：

```
1. |-> Markup
2.   |-> CSS
2.   |-> JS
2.   |-> Image
```

如果在 JS 文件中获取 CSS，就会形成双重瀑布流：

```
1. |-> Markup
2.   |-> JS
3.     |-> CSS
```

如果该 CSS 使用了背景图片，则形成三重瀑布流：

```
1. |-> Markup
2.   |-> JS
3.     |-> CSS
4.       |-> Image
```

发现和分析请求瀑布流的最佳方式通常是打开浏览器开发者工具的“网络 (Network)”选项卡。

每个瀑布流至少代表一次与服务器的往返通信（除非资源被本地缓存）。因此，请求瀑布流的负面影响高度依赖用户的网络延迟。以前面的三重瀑布流为例，它实际上代表 4 次服务器往返。在 250ms 延迟（3G 网络或恶劣网络条件下很常见）的情况下，仅计算延迟时间就达到 4*250=1000ms。如果能将其优化为第一个示例中的仅 2 次往返，延迟时间将降至 500ms，背景图片的加载时间可能缩短一半！

## 请求瀑布流与 React Query

现在来看 React Query 的情况。我们首先关注不使用服务端渲染的场景。在发起查询之前需要先加载 JS，因此在屏幕上显示数据之前会形成双重瀑布流：

```
1. |-> Markup
2.   |-> JS
3.     |-> Query
```

以此为基准，下面分析几种可能导致 React Query 请求瀑布流的模式及规避方法：

- 单组件瀑布流 / 串行查询
- 嵌套组件瀑布流
- 代码分割

### 单组件瀑布流 / 串行查询

当一个组件先获取一个查询，再获取另一个查询时，就会形成请求瀑布流。这种情况常出现在第二个查询是[依赖查询 (Dependent Query)](./dependent-queries.md)时——即它依赖第一个查询的数据来发起请求：

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
  // 该查询在 userId 存在前不会执行
  enabled: !!userId,
})
```

虽然并非总能实现，但为了最佳性能，最好重构 API 以便通过单个查询获取这两项数据。在上例中，与其先获取 `getUserByEmail` 才能调用 `getProjectsByUser`，不如新增一个 `getProjectsByUserEmail` 查询来消除瀑布流。

> 另一种在不重构 API 的情况下缓解依赖查询的方法是：将瀑布流转移到延迟更低的服务端。这是[高级服务端渲染指南](./advanced-ssr.md)中介绍的服务端组件 (Server Components) 的设计理念。

使用 React Query 的 Suspense 时也会出现串行查询：

```tsx
function App () {
  // 以下查询会串行执行，导致多次服务器往返：
  const usersQuery = useSuspenseQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const teamsQuery = useSuspenseQuery({ queryKey: ['teams'], queryFn: fetchTeams })
  const projectsQuery = useSuspenseQuery({ queryKey: ['projects'], queryFn: fetchProjects })

  // 注意：由于上述查询会暂停渲染，所有查询完成前不会渲染任何数据
  ...
}
```

注意：使用常规 `useQuery` 时这些查询会并行执行。

幸运的是，这个问题很容易修复——当组件中有多个 Suspense 查询时，始终使用 `useSuspenseQueries` 钩子：

```tsx
const [usersQuery, teamsQuery, projectsQuery] = useSuspenseQueries({
  queries: [
    { queryKey: ['users'], queryFn: fetchUsers },
    { queryKey: ['teams'], queryFn: fetchTeams },
    { queryKey: ['projects'], queryFn: fetchProjects },
  ],
})
```

### 嵌套组件瀑布流

当父组件和子组件都包含查询，且父组件在查询完成前不会渲染子组件时，就会出现嵌套组件瀑布流。这种情况可能发生在 `useQuery` 和 `useSuspenseQuery` 中。

如果子组件的渲染依赖于父组件的数据，或者子组件需要父组件传递部分结果作为 prop 才能发起查询，就形成了**依赖型**嵌套组件瀑布流。

首先看一个子组件**不依赖**父组件的例子：

```tsx
function Article({ id }) {
  const { data: articleData, isPending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  if (isPending) {
    return 'Loading article...'
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

注意：虽然 `<Comments>` 接收父组件传递的 `id` prop，但这个 id 在 `<Article>` 渲染时已经可用，因此没有理由不能同时获取评论和文章数据。在实际应用中，子组件可能嵌套在父组件多层级之下，这类瀑布流更难发现和修复。但在本例中，一种消除瀑布流的方法是将评论查询提升到父组件：

```tsx
function Article({ id }) {
  const { data: articleData, isPending: articlePending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  const { data: commentsData, isPending: commentsPending } = useQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })

  if (articlePending) {
    return 'Loading article...'
  }

  return (
    <>
      <ArticleHeader articleData={articleData} />
      <ArticleBody articleData={articleData} />
      {commentsPending ? (
        'Loading comments...'
      ) : (
        <Comments commentsData={commentsData} />
      )}
    </>
  )
}
```

现在两个查询会并行执行。注意：如果使用 Suspense，应该改用 `useSuspenseQueries` 合并这两个查询。

另一种消除瀑布流的方法是在 `<Article>` 组件中预取评论，或者在路由级别预取这两个查询（页面加载或导航时）。更多细节请参阅[预取与路由集成指南](./prefetching.md)。

接下来看一个**依赖型**嵌套组件瀑布流的例子：

```tsx
function Feed() {
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  if (isPending) {
    return 'Loading feed...'
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

function GraphFeedItem({ feedItem }) {
  const { data, isPending } = useQuery({
    queryKey: ['graph', feedItem.id],
    queryFn: getGraphDataById,
  })

  ...
}
```

第二个查询 `getGraphDataById` 在两方面依赖父组件：首先，只有当 `feedItem` 是图表类型时才会执行；其次，它需要父组件传递的 `id`。

```
1. |> getFeed()
2.   |> getGraphDataById()
```

在这个例子中，我们无法简单地通过将查询提升到父组件或添加预取来消除瀑布流。就像本指南开头的依赖查询示例一样，一种选择是重构 API 让 `getFeed` 查询包含图表数据。另一种更高级的解决方案是利用服务端组件 (Server Components) 将瀑布流转移到延迟更低的服务端（详见[高级服务端渲染指南](./advanced-ssr.md)），但要注意这可能涉及重大的架构变更。

即使存在少量查询瀑布流，应用仍能保持良好的性能。关键是要意识到这是常见的性能问题并保持警惕。当涉及代码分割时，情况会变得更加棘手，下面就来分析这种情况。

### 代码分割

将应用的 JS 代码拆分为更小的块并仅加载必要部分，通常是实现良好性能的关键步骤。但这也有缺点——常常会引入请求瀑布流。当被分割的代码中还包含查询时，问题会进一步加剧。

来看一个稍作修改的 Feed 示例：

```tsx
// 延迟加载 GraphFeedItem 组件，意味着在渲染前不会开始加载
const GraphFeedItem = React.lazy(() => import('./GraphFeedItem'))

function Feed() {
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  if (isPending) {
    return 'Loading feed...'
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

这个例子形成了双重瀑布流：

```
1. |> getFeed()
2.   |> JS for <GraphFeedItem>
3.     |> getGraphDataById()
```

但仅从代码角度看是这样。如果考虑该页面的首次加载过程，实际上需要完成 5 次服务器往返才能渲染图表：

```
1. |> Markup
2.   |> JS for <Feed>
3.     |> getFeed()
4.       |> JS for <GraphFeedItem>
5.         |> getGraphDataById()
```

注意：服务端渲染时情况会有所不同，我们将在[服务端渲染与注水指南](./ssr.md)中详细探讨。另外要注意的是，包含 `<Feed>` 的路由通常也会被代码分割，这可能又增加一次跳转。

对于代码分割的情况，将 `getGraphDataById` 查询提升到 `<Feed>` 组件并设为条件查询，或添加条件预取可能有所帮助。这样该查询可以与代码并行获取，将示例部分转变为：

```
1. |> getFeed()
2.   |> getGraphDataById()
2.   |> JS for <GraphFeedItem>
```

但这是一种权衡——现在 `getGraphDataById` 的数据获取代码被打包进了 `<Feed>` 的主包中。请根据具体情况评估最佳方案。更多实现方法请参阅[预取与路由集成指南](./prefetching.md)。

> 以下两种方案的权衡：
>
> - 将所有数据获取代码包含在主包中，即使很少使用
> - 将数据获取代码放在分割包中，但会产生请求瀑布流
>
> 并不理想，这也是服务端组件 (Server Components) 的设计动机之一。通过服务端组件可以同时避免这两个问题，更多与 React Query 的结合应用请参阅[高级服务端渲染指南](./advanced-ssr.md)。

## 总结与要点

请求瀑布流是一个非常常见且复杂的性能问题，涉及多种权衡。应用中可能意外引入瀑布流的方式包括：

- 在子组件中添加查询，未意识到父组件已有查询
- 在父组件中添加查询，未意识到子组件已有查询
- 将带有查询的组件及其后代移动到已有查询的新父组件中
- 等等...

由于这种意外复杂性，保持对瀑布流的警惕并定期检查应用（一个好方法是时不时检查网络选项卡！）是非常值得的。不一定要消除所有瀑布流才能获得良好性能，但要特别关注那些影响重大的情况。

在下一指南中，我们将通过[预取与路由集成](./prefetching.md)探索更多消除瀑布流的方法。
