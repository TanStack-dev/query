---
source-updated-at: '2025-04-02T06:46:03.000Z'
translation-updated-at: '2025-05-08T20:23:21.855Z'
id: ssr
title: 伺服器渲染與水合
---

在本指南中，您將學習如何在伺服器渲染 (Server Rendering) 中使用 React Query。

建議先閱讀 [預取與路由整合](./prefetching.md) 指南了解背景知識。在此之前，您可能還想查看 [效能與請求瀑布流指南](./request-waterfalls.md)。

如需進階的伺服器渲染模式，例如串流 (Streaming)、伺服器元件 (Server Components) 和 Next.js 的新應用路由 (app router)，請參閱 [進階伺服器渲染指南](./advanced-ssr.md)。

若只想查看程式碼範例，可直接跳至下方的 [完整 Next.js pages router 範例](#full-nextjs-pages-router-example) 或 [完整 Remix 範例](#full-remix-example)。

## 伺服器渲染與 React Query

究竟什麼是伺服器渲染？本指南後續將假設您已熟悉此概念，但讓我們花些時間探討它與 React Query 的關聯。伺服器渲染是指在伺服器端生成初始 HTML，讓使用者在頁面載入時立即看到內容。這可能在頁面請求時即時發生 (SSR)，也可能因先前請求被快取或於建置時預先發生 (SSG)。

若您閱讀過請求瀑布流指南，可能記得這個流程：

```
1. |-> 標記 (無內容)
2.   |-> JavaScript
3.     |-> 查詢
```

在客戶端渲染 (Client Rendered) 的應用中，這是讓使用者看到螢幕內容前至少需要的 3 次伺服器往返。伺服器渲染可將上述流程轉變為：

```
1. |-> 標記 (包含內容與初始資料)
2.   |-> JavaScript
```

當 **1.** 完成時，使用者即可看到內容；而當 **2.** 完成時，頁面便具備互動性且可點擊。由於標記也包含我們需要的初始資料，步驟 **3.** 完全不需要在客戶端執行，至少在您因某些原因需要重新驗證資料前是如此。

這全是從客戶端的角度來看。在伺服器端，我們需要在生成/渲染標記前 **預取** 資料，將這些資料 **脫水 (dehydrate)** 成可序列化的格式並嵌入標記中，然後在客戶端將資料 **水合 (hydrate)** 至 React Query 快取，以避免在客戶端重新獲取資料。

繼續閱讀以了解如何透過 React Query 實作這三個步驟。

## 關於 Suspense 的簡要說明

本指南使用常規的 `useQuery` API。雖然我們不一定推薦，但也可以改用 `useSuspenseQuery`，**前提是您總是預取所有查詢**。這樣做的好處是可以在客戶端使用 `<Suspense>` 處理載入狀態。

若在使用 `useSuspenseQuery` 時忘記預取查詢，後果將取決於您使用的框架。在某些情況下，資料會暫停 (Suspend) 並在伺服器端獲取，但永遠不會水合至客戶端，導致客戶端再次獲取資料。這將導致標記水合不匹配，因為伺服器和客戶端嘗試渲染不同的內容。

## 初始設定

使用 React Query 的第一步總是建立一個 `queryClient` 並將應用程式包裹在 `<QueryClientProvider>` 中。進行伺服器渲染時，關鍵在於 **在應用程式內部** 建立 `queryClient` 實例，並將其置於 React 狀態中（使用實例引用也可）。**這確保不同使用者和請求間的資料不會共享**，同時每個元件生命週期僅建立一次 `queryClient`。

Next.js pages router 範例：

```tsx
// _app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 切勿這樣做：
// const queryClient = new QueryClient()
//
// 在檔案根層級建立 queryClient 會使快取在所有請求間共享，
// 意味著所有資料都會傳遞給所有使用者。
// 除了影響效能外，這還可能洩露敏感資料。

export default function MyApp({ Component, pageProps }) {
  // 正確做法是確保每個請求有自己的快取：
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 使用 SSR 時，通常會設定預設的 staleTime
            // 大於 0，以避免客戶端立即重新獲取
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

Remix 範例：

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
            // 使用 SSR 時，通常會設定預設的 staleTime
            // 大於 0，以避免客戶端立即重新獲取
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

## 快速開始：使用 `initialData`

最快捷的方式是完全不涉及 React Query 的預取功能，也不使用 `dehydrate`/`hydrate` API。相反地，您可以直接將原始資料作為 `initialData` 選項傳遞給 `useQuery`。以下是使用 Next.js pages router 和 `getServerSideProps` 的範例：

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

這同樣適用於 `getStaticProps` 甚至較舊的 `getInitialProps`，相同的模式可應用於任何具有等效功能的其他框架。以下是 Remix 的相同範例：

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

這種設定非常簡潔，對某些情況來說是快速解決方案，但與完整方法相比，有以下 **幾點權衡需考慮**：

- 若在元件樹深處呼叫 `useQuery`，則需要將 `initialData` 傳遞至該處
- 若在多個位置使用相同查詢呼叫 `useQuery`，僅在其中一個傳遞 `initialData` 可能很脆弱，且當應用變更時容易出錯。若移除或移動包含帶有 `initialData` 的 `useQuery` 的元件，更深層嵌套的 `useQuery` 可能不再有任何資料。而將 `initialData` 傳遞給所有需要它的查詢也可能很繁瑣
- 無法知道查詢在伺服器端的獲取時間，因此 `dataUpdatedAt` 和判斷查詢是否需要重新獲取將基於頁面載入時間
- 若快取中已有查詢資料，`initialData` 將不會覆寫這些資料，**即使新資料比舊資料更新**
  - 考慮上述 `getServerSideProps` 範例，若多次來回導航至頁面，每次都會呼叫 `getServerSideProps` 並獲取新資料，但由於使用 `initialData` 選項，客戶端快取和資料永遠不會更新

設定完整的水合解決方案並不複雜且沒有這些缺點，這將是本文檔後續的重點。

## 使用水合 API

只需稍多的設定，您就可以在預載階段使用 `queryClient` 預取查詢，將該 `queryClient` 的序列化版本傳遞給應用的渲染部分並在那裡重用。這避免了上述問題。可跳至完整的 Next.js pages router 和 Remix 範例，但一般來說，這些是額外的步驟：

- 在框架的 loader 函式中，建立 `const queryClient = new QueryClient(options)`
- 在 loader 函式中，對每個要預取的查詢執行 `await queryClient.prefetchQuery(...)`
  - 盡可能使用 `await Promise.all(...)` 平行獲取查詢
  - 不預取某些查詢也沒關係，這些查詢不會被伺服器渲染，而是在應用可互動後於客戶端獲取。這對使用者互動後才顯示的內容或頁面較下方的內容非常適合，以避免阻塞更關鍵的內容
- 從 loader 返回 `dehydrate(queryClient)`，注意返回的具體語法因框架而異
- 使用 `<HydrationBoundary state={dehydratedState}>` 包裹您的元件樹，其中 `dehydratedState` 來自框架的 loader。獲取 `dehydratedState` 的方式也因框架而異
  - 這可以為每個路由執行，或放在應用頂層以避免重複程式碼，參見範例

> 有趣的是，實際上涉及 **三個** `queryClient`。框架的 loader 是一種發生在渲染前的「預載」階段，此階段有自己的 `queryClient` 負責預取。此階段的脫水結果會傳遞給 **伺服器渲染程序** 和 **客戶端渲染程序**，它們各自有自己的 `queryClient`，確保它們從相同的資料開始，因此能返回相同的標記。

> 伺服器元件 (Server Components) 是另一種「預載」階段，也能「預載」（預渲染）部分 React 元件樹。詳見 [進階伺服器渲染指南](./advanced-ssr.md)。

### 完整 Next.js pages router 範例

> 有關 app router 的文檔，請參閱 [進階伺服器渲染指南](./advanced-ssr.md)。

初始設定：

```tsx
// _app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function MyApp({ Component, pageProps }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 使用 SSR 時，通常會設定預設的 staleTime
            // 大於 0，以避免客戶端立即重新獲取
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

在每個路由中：

```tsx
// pages/posts.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useQuery,
} from '@tanstack/react-query'

// 這也可以是 getServerSideProps
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
  // 這個 useQuery 也可以發生在 <PostsRoute> 的更深層子元件中
  // 無論如何，資料都會立即可用
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts })

  // 這個查詢未在伺服器預取，將在客戶端才開始獲取
  // 兩種模式可以混合使用
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

### 完整 Remix 範例

初始設定：

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
            // 使用 SSR 時，通常會設定預設的 staleTime
            // 大於 0，以避免客戶端立即重新獲取
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

在每個路由中（注意這也可以在嵌套路由中使用）：

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
  // 這個 useQuery 也可以發生在 <PostsRoute> 的更深層子元件中
  // 無論如何，資料都會立即可用
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts })

  // 這個查詢未在伺服器預取，將在客戶端才開始獲取
  // 兩種模式可以混合使用
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

## 可選 - 減少樣板程式碼

在每個路由中包含以下部分可能顯得冗長：

```tsx
export default function PostsRoute({ dehydratedState }) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Posts />
    </HydrationBoundary>
  )
}
```

雖然這種方法沒有問題，但若想減少樣板程式碼，可以這樣修改 Next.js 的設定：

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
// 移除帶有 HydrationBoundary 的 PostsRoute，直接導出 Posts：
export default function Posts() { ... }
```

在 Remix 中，這稍微複雜一些，建議查看 [use-dehydrated-state](https://github.com/maplegrove-io/use-dehydrated-state) 套件。

## 預取相依查詢

在預取指南中，我們學習了如何 [預取相依查詢](./prefetching.md#dependent-queries--code-splitting)，但如何在框架的 loader 中實現呢？考慮以下取自 [相依查詢指南](./dependent-queries.md) 的程式碼：

```tsx
// 獲取使用者
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
})

const userId = user?.id

// 然後獲取使用者的專案
const {
  status,
  fetchStatus,
  data: projects,
} = useQuery({
  queryKey: ['projects', userId],
  queryFn: getProjectsByUser,
  // 查詢僅在使用者 ID 存在時執行
  enabled: !!userId,
})
```

如何預取這些資料以實現伺服器渲染？以下是範例：

```tsx
// 在 Remix 中，將此函式更名為 loader
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

  // 在 Remix 中：
  // return json({ dehydratedState: dehydrate(queryClient) })
  return { props: { dehydratedState: dehydrate(queryClient) } }
}
```

當然，這可能會變得更複雜，但由於這些 loader 函式只是 JavaScript，您可以使用語言的全部功能來構建邏輯。確保預取所有需要伺服器渲染的查詢。

## 錯誤處理

React Query 預設採用優雅降級策略。這意味著：

- `queryClient.prefetchQuery(...)` 不會拋出錯誤
- `dehydrate(...)` 僅包含成功的查詢，不包括失敗的查詢

這將導致任何失敗的查詢在客戶端重試，且伺服器渲染的輸出將包含載入狀態而非完整內容。

雖然這是良好的預設行為，但有時這並非您想要的。當關鍵內容缺失時，您可能希望根據情況回應 404 或 500 狀態碼。對於這些情況，請改用 `queryClient.fetchQuery(...)`，它會在失敗時拋出錯誤，讓您以適當的方式處理問題。

```tsx
let result

try {
  result = await queryClient.fetchQuery(...)
} catch (error) {
  // 處理錯誤，請參考框架文檔
}

// 您可能還想檢查並處理任何無效的 `result`
```

若因某些原因希望在脫水狀態中包含失敗的查詢以避免重試，可以使用 `shouldDehydrateQuery` 選項覆寫預設函式並實作自己的邏輯：

```tsx
dehydrate(queryClient, {
  shouldDehydrateQuery: (query) => {
```
