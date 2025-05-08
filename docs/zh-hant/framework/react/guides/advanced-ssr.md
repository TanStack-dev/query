---
source-updated-at: '2025-04-25T12:36:10.000Z'
translation-updated-at: '2025-05-08T20:26:59.263Z'
id: advanced-ssr
title: 進階伺服器渲染
---

歡迎來到「進階伺服器渲染 (Advanced Server Rendering)」指南，你將在此學習如何將 React Query 與串流 (streaming)、伺服器元件 (Server Components) 及 Next.js 應用路由 (app router) 結合使用。

建議先閱讀 [伺服器渲染與水合 (Server Rendering & Hydration)](./ssr.md) 指南，該文介紹了 React Query 與 SSR 搭配的基本用法，此外 [效能與請求瀑布流 (Performance & Request Waterfalls)](./request-waterfalls.md) 和 [預取與路由整合 (Prefetching & Router Integration)](./prefetching.md) 也提供了寶貴的背景知識。

開始前請注意，雖然 SSR 指南中提到的 `initialData` 方法也適用於伺服器元件，但本指南將重點放在水合 API (hydration APIs) 的使用。

## 伺服器元件與 Next.js 應用路由

此處不會深入探討伺服器元件，簡而言之，它們是保證**僅在伺服器端執行**的元件，無論是初始頁面載入**或頁面轉換時**皆然。這類似於 Next.js 的 `getServerSideProps`/`getStaticProps` 和 Remix 的 `loader` 運作方式，這些也總是在伺服器端執行，但只能回傳資料，而伺服器元件則能實現更多功能。不過對 React Query 而言，資料處理仍是核心，因此我們將聚焦於此。

如何將伺服器渲染指南中學到的[將框架載入器中預取的資料傳遞至應用程式](./ssr.md#using-the-hydration-apis)應用於伺服器元件和 Next.js 應用路由？最簡單的理解方式是將伺服器元件視為「另一個」框架載入器。

### 術語簡要說明

截至目前，這些指南中我們一直在談論「伺服器」和「客戶端」。需注意的是，這與「伺服器元件」和「客戶端元件」並非完全對應。伺服器元件保證僅在伺服器端執行，但客戶端元件實際上可在兩端執行，原因是它們也能在初始的**伺服器渲染**階段渲染。

一種理解方式是：儘管伺服器元件也會「渲染」，但它們發生在「載入階段」（始終在伺服器端進行），而客戶端元件則在「應用階段」執行。該應用程式既能在 SSR 期間於伺服器端執行，也能在例如瀏覽器中執行。具體執行位置及是否在 SSR 期間執行，可能因框架而異。

### 初始設定

任何 React Query 設定的第一步總是建立 `queryClient` 並用 `QueryClientProvider` 包裹你的應用程式。對於伺服器元件，各框架的設定大致相同，僅檔案命名慣例有所不同：

```tsx
// 在 Next.js 中，此檔案名為：app/providers.tsx
'use client'

// 由於 QueryClientProvider 底層依賴 useContext，我們必須在頂部標記 'use client'
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 使用 SSR 時，通常需設定預設 staleTime
        // 大於 0 以避免在客戶端立即重新獲取資料
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // 伺服器端：總是建立新的 query client
    return makeQueryClient()
  } else {
    // 瀏覽器端：若尚未建立則建立新的 query client
    // 這非常重要，避免在初始渲染時若 React 暫停導致重新建立 client
    // 若在 query client 建立下方有暫停邊界 (suspense boundary)，則可能不需此處理
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // 注意：初始化 query client 時應避免使用 useState
  //       除非在此與可能暫停的程式碼之間有暫停邊界
  //       因為若無邊界且初始渲染暫停，React 會丟棄該 client
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

```tsx
// 在 Next.js 中，此檔案名為：app/layout.tsx
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

這部分與 SSR 指南中的做法非常相似，僅需將內容拆分至兩個不同檔案。

### 預取與脫水/水合資料

接下來看看如何實際預取資料並進行脫水 (dehydrate) 和水合 (hydrate)。以下是使用 **Next.js 頁面路由 (pages router)** 的範例：

```tsx
// pages/posts.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useQuery,
} from '@tanstack/react-query'

// 此處也可使用 getServerSideProps
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
  // 此 useQuery 也可在 <PostsRoute> 的更深層子元件中使用
  // 無論如何，資料都會立即可用
  //
  // 注意此處使用 useQuery 而非 useSuspenseQuery
  // 因為資料已預取，元件本身無需暫停
  // 若忘記或移除預取，則會在客戶端獲取資料
  // 而使用 useSuspenseQuery 會導致更糟的副作用
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts })

  // 此查詢未在伺服器預取，將在客戶端開始獲取
  // 兩種模式可混合使用
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

轉換至應用路由 (app router) 後看起來非常相似，僅需稍作調整。首先，我們建立一個伺服器元件來處理預取部分：

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
    // 很棒！序列化現在就像傳遞 props 一樣簡單
    // HydrationBoundary 是客戶端元件，水合將在此進行
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts />
    </HydrationBoundary>
  )
}
```

接著，客戶端元件部分如下：

```tsx
// app/posts/posts.tsx
'use client'

export default function Posts() {
  // 此 useQuery 也可在 <Posts> 的更深層子元件中使用
  // 無論如何，資料都會立即可用
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts(),
  })

  // 此查詢未在伺服器預取，將在客戶端開始獲取
  // 兩種模式可混合使用
  const { data: commentsData } = useQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  })

  // ...
}
```

上述範例的一個優點是，唯一與 Next.js 相關的只有檔案名稱，其餘內容在任何支援伺服器元件的框架中都會看起來相同。

在 SSR 指南中，我們提到可以避免在每個路由中使用 `<HydrationBoundary>` 的樣板程式碼。但這在伺服器元件中無法實現。

> 注意：若在使用非同步伺服器元件時遇到 TypeScript 版本低於 `5.1.3` 或 `@types/react` 版本低於 `18.2.8` 的類型錯誤，建議更新至兩者的最新版本。或者，可在呼叫此元件時暫時使用 `{/* @ts-expect-error Server Component */}` 作為解決方案。詳見 Next.js 13 文件中的 [非同步伺服器元件 TypeScript 錯誤](https://nextjs.org/docs/app/building-your-application/configuring/typescript#async-server-component-typescript-error)。

> 注意：若遇到錯誤 `Only plain objects, and a few built-ins, can be passed to Server Actions. Classes or null prototypes are not supported.`，請確保**不要**將函數參考傳遞給 queryFn，而是呼叫該函數，因為 queryFn 的參數具有許多屬性，並非所有都可序列化。詳見 [Server Action 僅在 queryFn 非參考時有效](https://github.com/TanStack/query/issues/6264)。

### 嵌套伺服器元件

伺服器元件的一個優點是它們可以嵌套存在於 React 樹的多個層級中，使得資料預取更接近實際使用位置，而不僅限於應用程式頂層（類似 Remix 的載入器）。這可以簡單到一個伺服器元件渲染另一個伺服器元件（為簡潔起見，此範例省略客戶端元件）：

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

如你所見，完全可以多處使用 `<HydrationBoundary>`，並為預取建立和脫水多個 `queryClient`。

需注意的是，因為我們在渲染 `CommentsServerComponent` 前等待 `getPosts`，這會導致伺服器端瀑布流：

```
1. |> getPosts()
2.   |> getComments()
```

若伺服器至資料的延遲較低，這可能不是大問題，但仍值得指出。

在 Next.js 中，除了在 `page.tsx` 預取資料，還可在 `layout.tsx` 和[平行路由](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)中進行。由於這些都屬於路由部分，Next.js 知道如何並行獲取它們。因此，若上述 `CommentsServerComponent` 改為平行路由表達，瀑布流將自動扁平化。

隨著更多框架支援伺服器元件，它們可能有其他路由慣例。詳見各框架文件。

### 替代方案：使用單一 `queryClient` 進行預取

在上述範例中，我們為每個獲取資料的伺服器元件建立新的 `queryClient`。這是推薦做法，但你也可以選擇建立一個跨所有伺服器元件共用的單一實例：

```tsx
// app/getQueryClient.tsx
import { QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

// cache() 是每個請求範圍的，因此不會在請求間洩漏資料
const getQueryClient = cache(() => new QueryClient())
export default getQueryClient
```

這樣做的優點是，你可以在任何從伺服器元件呼叫的地方（包括工具函數）使用 `getQueryClient()` 來獲取該客戶端。缺點是每次呼叫 `dehydrate(getQueryClient())` 時，都會序列化**整個** `queryClient`，包括已序列化且與當前伺服器元件無關的查詢，這是不必要的開銷。

Next.js 已經對使用 `fetch()` 的請求進行去重，但若你在 `queryFn` 中使用其他方法，或使用的框架**不**自動去重這些請求，則上述使用單一 `queryClient` 的方法可能更合理，儘管存在重複序列化。

> 作為未來改進，我們可能研究建立 `dehydrateNew()` 函數（名稱待定），僅脫水自上次 `dehydrateNew()` 呼叫以來**新增**的查詢。若有興趣協助，歡迎聯繫！

### 資料所有權與重新驗證

使用伺服器元件時，需考慮資料所有權與重新驗證。為解釋原因，我們來看一個修改後的範例：

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

  // 注意現在使用 fetchQuery()
  const posts = await queryClient.fetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* 這是新增部分 */}
      <div>文章數量: {posts.length}</div>
      <Posts />
    </HydrationBoundary>
  )
}
```

我們現在在伺服器元件和客戶端元件中都渲染來自 `getPosts` 查詢的資料。初始頁面渲染時這沒問題，但當查詢因某些原因（如 `staleTime` 已過）在客戶端重新驗證時會發生什麼？

React Query 不知道如何**重新驗證伺服器元件**，因此若它在客戶端重新獲取資料導致 React 重新渲染文章列表，`文章數量: {posts.length}` 將與實際資料不同步。

若設定 `staleTime: Infinity` 使 React Query 永不重新驗證則沒問題，但這可能不是你使用 React Query 的初衷。

在以下情況使用 React Query 與伺服器元件最為合理：

- 你有一個使用 React Query 的應用程式，希望遷移至伺服器元件而無需重寫所有資料獲取邏輯
- 你希望使用熟悉的程式設計模式，但仍能在合適的地方加入伺服器元件的好處
- 你有某些 React Query 涵蓋但所選框架未涵蓋的使用案例

很難給出何時適合將 React Query 與伺服器元件搭配使用的通用建議。**若你剛開始建立新的伺服器元件應用程式，建議先使用框架提供的任何資料獲取工具，直到真正需要時才引入 React Query。**可能永遠不需要，這也沒關係，選擇合適的工具即可！

若確實使用，一個好的經驗法則是避免使用 `queryClient.fetchQuery`，除非需要捕捉錯誤。若確實使用，請勿在伺服器端渲染其結果或將結果傳遞給其他元件（即使是客戶端元件）。

從 React Query 的角度，將伺服器元件視為預取資料的地方即可。

當然，讓伺服器元件擁有某些資料，客戶端元件擁有其他資料也沒問題，只需確保這兩種狀態不會不同步。

## 與伺服器元件的串流 (Streaming)

Next.js 應用路由會自動將準備好的應用部分儘快串流至瀏覽器，因此已完成內容可立即顯示，無需等待仍在處理的內容。這是沿著 `<Suspense>` 邊界進行的。注意若建立 `loading.tsx` 檔案，這會自動在背後建立 `<Suspense>` 邊界。

使用上述預取模式時，React Query 完全相容於這種串流形式。當每個 Suspense 邊界的資料解析時，Next.js 可渲染並將完成內容串流至瀏覽器。即使你如上所述使用 `useQuery` 也能運作，因為暫停實際上發生在你 `await` 預取時。

自 React Query v5.40.0 起，你不需 `await` 所有預取也能運作，因為 `pending` 查詢也可脫水並傳送至客戶端。這讓你能儘早開始預取而不讓它們阻擋整個 Suspense 邊界，並在查詢完成時將**資料**串流至客戶端。這在某些情況下很有用，例如你想預取某些僅在使用者互動後才顯示的內容，或你想 `await` 並渲染無限查詢的第一頁，同時開始預取第二頁而不阻擋渲染。

為實現此功能，我們需指示 `queryClient` 也脫水 `pending` 查詢。可全域設定或直接傳遞選項至 `dehydrate`。

我們還需將 `getQueryClient()` 函數移出 `app/providers.tsx` 檔案，以便在伺服器元件和客戶端提供者中使用。

```tsx
// app/get-query-client.ts
import {
  isServer,
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // 在脫水中包含 pending 查詢
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
        shouldRedactErrors: (error) => {
          // 我們不應捕捉 Next.js 伺服器
```
