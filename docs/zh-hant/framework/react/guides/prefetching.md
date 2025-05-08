---
source-updated-at: '2025-04-25T12:36:10.000Z'
translation-updated-at: '2025-05-08T20:24:08.302Z'
id: prefetching
title: 預獲取與路由整合
---

當您知道或懷疑某個資料即將被使用時，可以透過預先載入 (prefetching) 提前將該資料存入快取，從而提供更快速的體驗。

預先載入有以下幾種常見模式：

1. 在事件處理函式中
2. 在元件內
3. 透過路由整合
4. 在伺服器渲染期間 (另一種路由整合形式)

本指南將探討前三種模式，第四種模式將在[伺服器渲染與水合指南](./ssr.md)和[進階伺服器渲染指南](./advanced-ssr.md)中深入說明。

預先載入的一個具體用途是避免請求瀑布流 (Request Waterfalls)，相關背景與詳細解釋請參閱[效能與請求瀑布流指南](./request-waterfalls.md)。

## prefetchQuery 與 prefetchInfiniteQuery

在深入探討各種預先載入模式前，先來了解 `prefetchQuery` 和 `prefetchInfiniteQuery` 函式。以下是基本要點：

- 預設情況下，這些函式會使用 `queryClient` 設定的預設 `staleTime` 來判斷快取中的現有資料是否新鮮或需要重新取得
- 您也可以傳入特定的 `staleTime`，例如：`prefetchQuery({ queryKey: ['todos'], queryFn: fn, staleTime: 5000 })`
  - 此 `staleTime` 僅用於預先載入，您仍需為任何 `useQuery` 呼叫設定它
  - 如果想忽略 `staleTime` 並在快取中有資料時直接返回，可以使用 `ensureQueryData` 函式
  - 提示：若在伺服器端預先載入，請為該 `queryClient` 設定高於 `0` 的預設 `staleTime`，避免為每個預先載入呼叫傳入特定 `staleTime`
- 如果沒有 `useQuery` 實例使用預先載入的查詢，該查詢將在 `gcTime` 指定的時間後被刪除並進行垃圾回收
- 這些函式返回 `Promise<void>`，因此不會返回查詢資料。若需要查詢資料，請改用 `fetchQuery`/`fetchInfiniteQuery`
- 預先載入函式不會拋出錯誤，因為它們通常會在 `useQuery` 中再次嘗試取得資料，這是一種優雅的後備機制。若需捕捉錯誤，請改用 `fetchQuery`/`fetchInfiniteQuery`

以下是使用 `prefetchQuery` 的範例：

[//]: # 'ExamplePrefetchQuery'

```tsx
const prefetchTodos = async () => {
  // 此查詢結果會像普通查詢一樣被快取
  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
}
```

[//]: # 'ExamplePrefetchQuery'

無限查詢 (Infinite Queries) 可以像普通查詢一樣預先載入。預設情況下，只會預先載入查詢的第一頁，並儲存在指定的 QueryKey 下。若需預先載入多頁，可使用 `pages` 選項，此時還需提供 `getNextPageParam` 函式：

[//]: # 'ExamplePrefetchInfiniteQuery'

```tsx
const prefetchProjects = async () => {
  // 此查詢結果會像普通查詢一樣被快取
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    pages: 3, // 預先載入前 3 頁
  })
}
```

[//]: # 'ExamplePrefetchInfiniteQuery'

接下來，我們來看看如何在不同情境下使用這些方法進行預先載入。

## 在事件處理函式中預先載入

最直接的預先載入方式是在使用者與某元素互動時執行。以下範例將在 `onMouseEnter` 或 `onFocus` 事件觸發時使用 `queryClient.prefetchQuery` 開始預先載入。

[//]: # 'ExampleEventHandler'

```tsx
function ShowDetailsButton() {
  const queryClient = useQueryClient()

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['details'],
      queryFn: getDetailsData,
      // 僅當資料比 staleTime 舊時才會觸發預先載入，
      // 因此在此情況下務必設定一個值
      staleTime: 60000,
    })
  }

  return (
    <button onMouseEnter={prefetch} onFocus={prefetch} onClick={...}>
      顯示詳細資訊
    </button>
  )
}
```

[//]: # 'ExampleEventHandler'

## 在元件內預先載入

當我們知道某些子元件或後代元件需要特定資料，但在其他查詢完成載入前無法渲染時，在元件生命週期內預先載入就非常有用。我們借用請求瀑布流指南中的範例來說明：

[//]: # 'ExampleComponent'

```tsx
function Article({ id }) {
  const { data: articleData, isPending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  if (isPending) {
    return '載入文章中...'
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

這會產生如下的請求瀑布流：

```
1. |> getArticleById()
2.   |> getArticleCommentsById()
```

如該指南所述，一種改善效能並扁平化瀑布流的方法是將 `getArticleCommentsById` 查詢提升至父元件並將結果作為 prop 傳遞。但如果這不可行或不理想（例如元件之間無關聯且有多層級隔離），該怎麼辦？

在這種情況下，我們可以在父元件中預先載入該查詢。最簡單的方法是使用查詢但忽略結果：

[//]: # 'ExampleParentComponent'

```tsx
function Article({ id }) {
  const { data: articleData, isPending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  // 預先載入
  useQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
    // 避免此查詢變更時重新渲染的優化選項：
    notifyOnChangeProps: [],
  })

  if (isPending) {
    return '載入文章中...'
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

這會立即開始取得 `'article-comments'` 並扁平化瀑布流：

```
1. |> getArticleById()
1. |> getArticleCommentsById()
```

[//]: # 'Suspense'

若想與 Suspense 一起使用預先載入，做法會稍有不同。您不能使用 `useSuspenseQueries` 來預先載入，因為預先載入會阻擋元件渲染。也不能使用 `useQuery` 進行預先載入，因為這會等到 suspenseful 查詢解析後才開始預先載入。對於這種情境，您可以使用函式庫提供的 [`usePrefetchQuery`](../reference/usePrefetchQuery.md) 或 [`usePrefetchInfiniteQuery`](../reference/usePrefetchInfiniteQuery.md) 鉤子。

接著，您可以在實際需要資料的元件中使用 `useSuspenseQuery`。您可能希望將此元件包裹在自己的 `<Suspense>` 邊界中，這樣我們預先載入的「次要」查詢就不會阻擋「主要」資料的渲染。

```tsx
function ArticleLayout({ id }) {
  usePrefetchQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })

  return (
    <Suspense fallback="載入文章中">
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

另一種方法是在查詢函式內部進行預先載入。如果您知道每次取得文章時很可能也需要評論，這種做法就很合理。我們將使用 `queryClient.prefetchQuery`：

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

在 effect 中預先載入也有效，但請注意，若在同一個元件中使用 `useSuspenseQuery`，此 effect 會在查詢完成後才執行，這可能不符合您的預期。

```tsx
const queryClient = useQueryClient()

useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })
}, [queryClient, id])
```

總結來說，若想在元件生命週期內預先載入查詢，有以下幾種方式，請根據情況選擇最適合的：

- 使用 `usePrefetchQuery` 或 `usePrefetchInfiniteQuery` 鉤子在 suspense 邊界前預先載入
- 使用 `useQuery` 或 `useSuspenseQueries` 並忽略結果
- 在查詢函式內部預先載入
- 在 effect 中預先載入

接下來我們來看一個稍微進階的案例。

[//]: # 'Suspense'

### 相依查詢與程式碼分割

有時我們希望根據另一個取得的結果來條件式地預先載入。參考[效能與請求瀑布流指南](./request-waterfalls.md)中的範例：

[//]: # 'ExampleConditionally1'

```tsx
// 這會延遲載入 GraphFeedItem 元件，
// 表示在渲染前不會開始載入
const GraphFeedItem = React.lazy(() => import('./GraphFeedItem'))

function Feed() {
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  if (isPending) {
    return '載入動態消息中...'
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

如該指南所述，此範例會導致以下雙重請求瀑布流：

```
1. |> getFeed()
2.   |> JS for <GraphFeedItem>
3.     |> getGraphDataById()
```

如果無法重構 API 讓 `getFeed()` 在必要時也返回 `getGraphDataById()` 的資料，就無法完全消除 `getFeed->getGraphDataById` 的瀑布流。但透過條件式預先載入，我們至少可以並行載入程式碼和資料。如同上述，有多種方式可以實現，在此範例中，我們將在查詢函式中進行：

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

這樣會並行載入程式碼和資料：

```
1. |> getFeed()
2.   |> JS for <GraphFeedItem>
2.   |> getGraphDataById()
```

但這有一個權衡點，`getGraphDataById` 的程式碼現在被包含在父元件套件中，而非 `JS for <GraphFeedItem>` 中。因此您需要根據具體情況決定最佳效能權衡。如果 `GraphFeedItem` 很常見，可能值得包含在父元件中；如果非常罕見，則可能不值得。

[//]: # 'Router'

## 路由整合

由於在元件樹中直接進行資料取得容易導致請求瀑布流，且相關修復方法在應用程式中累積後可能變得繁瑣，因此在路由層級整合預先載入是一個吸引人的方式。

在此方法中，您為每個路由預先明確宣告該元件樹所需的資料。由於伺服器渲染傳統上需要在渲染開始前載入所有資料，這長期以來一直是 SSR 應用的主流方法。這仍然是常見做法，您可以在[伺服器渲染與水合指南](./ssr.md)中了解更多。

現在，我們專注於客戶端的情況，並以 [Tanstack Router](https://tanstack.com/router) 為例說明如何實現。這些範例省略了大量設定和樣板程式碼以保持簡潔，您可以在 [Tanstack Router 文件](https://tanstack.com/router/latest/docs)中查看[完整的 React Query 範例](https://tanstack.com/router/.latest/docs/framework/react/examples/basic-react-query-file-based)。

在路由層級整合時，您可以選擇在該路由的所有資料載入完成前阻擋渲染，或者開始預先載入但不等待結果。這樣，您可以盡快開始渲染路由。您也可以混合這兩種方法，等待某些關鍵資料，但在所有次要資料載入完成前開始渲染。在此範例中，我們將設定 `/article` 路由在文章資料載入完成前不渲染，同時盡快開始預先載入評論，但不阻擋路由渲染即使評論尚未載入完成。

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
    // 盡快取得評論，但不阻擋
    queryClient.prefetchQuery(commentsQueryOptions)

    // 在文章載入完成前完全不渲染路由
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
  errorComponent: () => '糟糕！',
})
```

也可以與其他路由庫整合，請參閱 [React Router 範例](../examples/react-router)了解另一個示範。

[//]: # 'Router'

## 手動初始化查詢

如果您已經同步擁有查詢的資料，則不需要預先載入。您可以直接使用 [Query Client 的 `setQueryData` 方法](../../../reference/QueryClient.md#queryclientsetquerydata) 透過鍵直接新增或更新查詢的快取結果。

[//]: # 'ExampleManualPriming'

```tsx
queryClient.setQueryData(['todos'], todos)
```

[//]: # 'ExampleManualPriming'
[//]: # 'Materials'

## 延伸閱讀

若想深入了解如何在取得前將資料存入查詢快取，請參閱社群資源中的 [#17: 初始化查詢快取](../community/tkdodos-blog.md#17-seeding-the-query-cache)。

與伺服器端路由和框架的整合與我們剛才看到的非常相似，只是需要將資料從伺服器傳遞到客戶端以進行水合。要了解如何實現，請繼續閱讀[伺服器渲染與水合指南](./ssr.md)。

[//]: # 'Materials'
