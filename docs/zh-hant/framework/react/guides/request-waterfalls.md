---
source-updated-at: '2025-04-02T06:46:03.000Z'
translation-updated-at: '2025-05-08T20:23:07.162Z'
id: request-waterfalls
title: 效能與請求瀑布
---

應用程式效能是一個廣泛且複雜的領域，雖然 React Query 無法讓你的 API 變得更快，但在使用 React Query 時仍有許多需要注意的事項，以確保最佳效能。

使用 React Query 或任何允許你在元件內部獲取資料的資料獲取函式庫時，最大的效能陷阱就是請求瀑布 (request waterfalls)。本頁的其餘部分將解釋什麼是請求瀑布、如何發現它們，以及如何重構你的應用程式或 API 來避免它們。

[預取與路由整合指南](./prefetching.md) 在此基礎上進一步說明，教你如何在無法或不適合重構應用程式或 API 時提前預取資料。

[伺服器渲染與水合指南](./ssr.md) 教你如何在伺服器上預取資料並將這些資料傳遞給客戶端，這樣你就不需要再次獲取。

[進階伺服器渲染指南](./advanced-ssr.md) 進一步教你如何將這些模式應用於伺服器元件 (Server Components) 和串流伺服器渲染 (Streaming Server Rendering)。

## 什麼是請求瀑布？

請求瀑布是指對資源（程式碼、CSS、圖片、資料）的請求在另一個資源請求完成後才開始的情況。

以一個網頁為例。在載入 CSS、JS 等內容之前，瀏覽器首先需要載入標記 (markup)。這就是一個請求瀑布。

```
1. |-> 標記 (Markup)
2.   |-> CSS
2.   |-> JS
2.   |-> 圖片 (Image)
```

如果你在 JS 檔案中獲取 CSS，現在就會有一個雙重瀑布：

```
1. |-> 標記 (Markup)
2.   |-> JS
3.     |-> CSS
```

如果該 CSS 使用了背景圖片，就會形成三重瀑布：

```
1. |-> 標記 (Markup)
2.   |-> JS
3.     |-> CSS
4.       |-> 圖片 (Image)
```

發現和分析請求瀑布的最佳方法通常是打開瀏覽器的開發者工具中的「網路」(Network) 標籤頁。

每個瀑布至少代表一次與伺服器的往返，除非資源是本地快取的（實際上，其中一些瀑布可能代表多次往返，因為瀏覽器需要建立連接，這需要一些來回通信，但我們在這裡忽略這一點）。因此，請求瀑布的負面影響高度依賴於用戶的延遲。以三重瀑布為例，它實際上代表了 4 次伺服器往返。在 250ms 的延遲下（這在 3G 網路或不良網路條件下並不罕見），我們最終的總時間為 4\*250=1000ms，這還僅僅是延遲時間。如果我們能將其扁平化為第一個只有 2 次往返的例子，我們就能將時間縮短到 500ms，可能將背景圖片的載入時間縮短一半！

## 請求瀑布與 React Query

現在讓我們來看看 React Query。我們首先關注不使用伺服器渲染 (Server Rendering) 的情況。在我們甚至開始進行查詢 (query) 之前，我們需要載入 JS，因此在我們能在螢幕上顯示該資料之前，我們已經有一個雙重瀑布：

```
1. |-> 標記 (Markup)
2.   |-> JS
3.     |-> 查詢 (Query)
```

以此為基礎，讓我們看看幾種可能導致 React Query 中出現請求瀑布的模式，以及如何避免它們。

- 單一元件瀑布 / 串行查詢 (Serial Queries)
- 嵌套元件瀑布
- 程式碼分割 (Code Splitting)

### 單一元件瀑布 / 串行查詢

當一個元件首先獲取一個查詢，然後再獲取另一個查詢時，就會形成請求瀑布。這種情況可能發生在第二個查詢是一個[依賴查詢 (Dependent Query)](./dependent-queries.md) 時，即它在獲取時依賴於第一個查詢的資料：

```tsx
// 獲取用戶
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
})

const userId = user?.id

// 然後獲取用戶的專案
const {
  status,
  fetchStatus,
  data: projects,
} = useQuery({
  queryKey: ['projects', userId],
  queryFn: getProjectsByUser,
  // 查詢不會執行，直到 userId 存在
  enabled: !!userId,
})
```

雖然並非總是可行，但為了最佳效能，最好重構你的 API，以便你可以在單一查詢中獲取這兩者。在上面的例子中，與其先獲取 `getUserByEmail` 以便能夠 `getProjectsByUser`，引入一個新的 `getProjectsByUserEmail` 查詢可以扁平化瀑布。

> 另一種在不重構 API 的情況下緩解依賴查詢的方法是將瀑布移到延遲較低的伺服器上。這就是伺服器元件 (Server Components) 背後的想法，詳見[進階伺服器渲染指南](./advanced-ssr.md)。

串行查詢的另一個例子是當你將 React Query 與 Suspense 一起使用時：

```tsx
function App () {
  // 以下查詢將串行執行，導致與伺服器的多次往返：
  const usersQuery = useSuspenseQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const teamsQuery = useSuspenseQuery({ queryKey: ['teams'], queryFn: fetchTeams })
  const projectsQuery = useSuspenseQuery({ queryKey: ['projects'], queryFn: fetchProjects })

  // 注意，由於上面的查詢會暫停渲染，因此所有查詢完成前不會渲染任何資料
  ...
}
```

請注意，使用常規的 `useQuery` 時，這些查詢會並行執行。

幸運的是，這很容易修復，只需在元件中包含多個 suspenseful 查詢時始終使用 `useSuspenseQueries` 鉤子即可。

```tsx
const [usersQuery, teamsQuery, projectsQuery] = useSuspenseQueries({
  queries: [
    { queryKey: ['users'], queryFn: fetchUsers },
    { queryKey: ['teams'], queryFn: fetchTeams },
    { queryKey: ['projects'], queryFn: fetchProjects },
  ],
})
```

### 嵌套元件瀑布

嵌套元件瀑布是指父元件和子元件都包含查詢，且父元件在其查詢完成前不會渲染子元件。這種情況可能發生在使用 `useQuery` 或 `useSuspenseQuery` 時。

如果子元件的渲染條件基於父元件中的資料，或者子元件依賴於父元件傳遞的某些結果作為 prop 來進行查詢，我們就有一個依賴性嵌套元件瀑布。

讓我們先看一個子元件不依賴於父元件的例子。

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

請注意，雖然 `<Comments>` 從父元件接收了一個 prop `id`，但該 id 在 `<Article>` 渲染時已經可用，因此我們沒有理由不能同時獲取評論和文章。在實際應用中，子元件可能嵌套在父元件下方很深的層級，這類瀑布通常更難發現和修復。但在我們的例子中，扁平化瀑布的一種方法是將評論查詢提升到父元件：

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
    return '載入文章中...'
  }

  return (
    <>
      <ArticleHeader articleData={articleData} />
      <ArticleBody articleData={articleData} />
      {commentsPending ? (
        '載入評論中...'
      ) : (
        <Comments commentsData={commentsData} />
      )}
    </>
  )
}
```

現在兩個查詢將並行獲取。請注意，如果你使用 Suspense，你會希望將這兩個查詢合併為一個 `useSuspenseQueries`。

另一種扁平化瀑布的方法是在 `<Article>` 元件中預取評論，或者在頁面載入或導航時在路由層級預取這兩個查詢。更多關於這部分的內容，請參閱[預取與路由整合指南](./prefetching.md)。

接下來，讓我們看一個依賴性嵌套元件瀑布的例子。

```tsx
function Feed() {
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  if (isPending) {
    return '載入動態中...'
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

第二個查詢 `getGraphDataById` 在兩個方面依賴於其父元件。首先，除非 `feedItem` 是一個圖表，否則它不會發生；其次，它需要父元件提供一個 `id`。

```
1. |> getFeed()
2.   |> getGraphDataById()
```

在這個例子中，我們無法簡單地通過將查詢提升到父元件或甚至添加預取來扁平化瀑布。就像本指南開頭的依賴查詢例子一樣，一個選擇是重構我們的 API，將圖表資料包含在 `getFeed` 查詢中。另一個更進階的解決方案是利用伺服器元件 (Server Components) 將瀑布移到延遲較低的伺服器上（更多關於這部分的內容，請參閱[進階伺服器渲染指南](./advanced-ssr.md)），但請注意，這可能是一個非常大的架構變更。

即使有一些查詢瀑布，你仍然可以擁有良好的效能，只需知道它們是一個常見的效能問題並注意它們即可。一個特別隱蔽的情況是涉及程式碼分割 (Code Splitting) 時，讓我們接下來看看這個。

### 程式碼分割

將應用程式的 JS 程式碼分割成較小的塊並僅載入必要的部分通常是實現良好效能的關鍵步驟。然而，它有一個缺點，就是經常會引入請求瀑布。當這些分割後的程式碼中也包含查詢時，這個問題會進一步惡化。

考慮這個稍微修改過的 Feed 例子。

```tsx
// 這會懶載入 GraphFeedItem 元件，意味著
// 它不會開始載入，直到有東西渲染它
const GraphFeedItem = React.lazy(() => import('./GraphFeedItem'))

function Feed() {
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  if (isPending) {
    return '載入動態中...'
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

這個例子有一個雙重瀑布，看起來像這樣：

```
1. |> getFeed()
2.   |> <GraphFeedItem> 的 JS
3.     |> getGraphDataById()
```

但這只是從例子中的程式碼來看，如果我們考慮這個頁面的首次載入情況，實際上我們需要完成 5 次伺服器往返才能渲染圖表！

```
1. |> 標記 (Markup)
2.   |> <Feed> 的 JS
3.     |> getFeed()
4.       |> <GraphFeedItem> 的 JS
5.         |> getGraphDataById()
```

請注意，這在伺服器渲染時看起來會有些不同，我們將在[伺服器渲染與水合指南](./ssr.md)中進一步探討。還請注意，包含 `<Feed>` 的路由也經常會被程式碼分割，這可能會增加另一個跳躍 (hop)。

在程式碼分割的情況下，將 `getGraphDataById` 查詢提升到 `<Feed>` 元件並使其成為條件式，或添加條件式預取可能會有幫助。這樣該查詢就可以與程式碼並行獲取，將例子部分變成這樣：

```
1. |> getFeed()
2.   |> getGraphDataById()
2.   |> <GraphFeedItem> 的 JS
```

然而，這是一個非常明顯的權衡。你現在將 `getGraphDataById` 的資料獲取程式碼包含在與 `<Feed>` 相同的套件 (bundle) 中，因此請評估哪種方式最適合你的情況。更多關於如何實現這部分的內容，請參閱[預取與路由整合指南](./prefetching.md)。

> 以下兩者之間的權衡：
>
> - 將所有資料獲取程式碼包含在主套件中，即使我們很少使用它
> - 將資料獲取程式碼放在程式碼分割後的套件中，但會有請求瀑布
>
> 並不理想，這也是伺服器元件 (Server Components) 的動機之一。使用伺服器元件，可以同時避免這兩者，更多關於這如何應用於 React Query 的內容，請參閱[進階伺服器渲染指南](./advanced-ssr.md)。

## 總結與要點

請求瀑布是一個非常常見且複雜的效能問題，涉及許多權衡。有許多方式可能意外地將其引入你的應用程式：

- 在子元件中添加查詢，沒有意識到父元件已經有一個查詢
- 在父元件中添加查詢，沒有意識到子元件已經有一個查詢
- 將一個包含有查詢的子元件的元件移動到一個新的、有查詢的父元件下
- 等等...

由於這種意外複雜性，注意瀑布並定期檢查你的應用程式以尋找它們（一個好的方法是時不時檢查「網路」標籤頁！）是非常值得的。你不一定需要扁平化所有瀑布才能擁有良好的效能，但要留意那些影響較大的瀑布。

在下一指南中，我們將探討更多扁平化瀑布的方法，通過利用[預取與路由整合](./prefetching.md)。
