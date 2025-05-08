---
source-updated-at: '2025-04-03T21:54:40.000Z'
translation-updated-at: '2025-05-08T20:16:43.252Z'
id: overview
title: 概述
---

Solid Query 是 TanStack Query 的官方 SolidJS 轉接器，能讓你在網頁應用程式中輕鬆實現 **資料獲取、快取、同步與更新伺服器狀態 (server state)**。

## 動機

SolidJS 作為一個快速、反應式且宣告式的使用者介面建構函式庫，近年來越來越受歡迎。它內建了許多開箱即用的功能，像是 `createSignal` 和 `createStore` 等基本功能非常適合管理客戶端狀態 (client state)。與其他 UI 函式庫不同，SolidJS 對於非同步資料管理有明確的設計理念。`createResource` API 就是一個在 SolidJS 應用中處理伺服器狀態 (server state) 的絕佳基本功能。`resource` 是一種特殊的 signal，可以在資料載入狀態時觸發 `Suspense` 邊界。

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

這非常棒！只需幾行程式碼，你就能從 API 獲取資料並處理載入和錯誤狀態。但是，隨著應用程式複雜度增加，你會需要更多功能來有效管理伺服器狀態 (server state)。這是因為 **伺服器狀態與客戶端狀態完全不同**。首先，伺服器狀態：

- 儲存在遠端，你無法控制或擁有該位置
- 需要非同步 API 來獲取和更新
- 意味著共享所有權，其他人可能在你不察覺時更改資料
- 如果不小心處理，應用中的資料可能會「過時」

一旦你理解了應用中伺服器狀態的本質，**更多挑戰將接踵而至**，例如：

- 快取...（可能是程式設計中最難的事情）
- 將多個相同資料的請求合併為單一請求
- 在背景更新「過時」資料
- 知道資料何時「過時」
- 盡快反映資料更新
- 效能優化，如分頁 (pagination) 和懶載入 (lazy loading) 資料
- 管理伺服器狀態的記憶體與垃圾回收
- 透過結構共享 (structural sharing) 記憶化查詢結果

這就是 **Solid Query** 的用武之地。這個函式庫封裝了 `createResource`，並提供一組鉤子 (hooks) 和工具來有效管理伺服器狀態。它開箱即用，**零配置即可運作良好，並能隨著應用成長自訂**。

從技術角度來看，Solid Query 可能會：

- 幫助你移除應用中**大量**複雜且難以理解的程式碼，僅用幾行 Solid Query 邏輯取代
- 使應用更易維護，輕鬆新增功能，無需擔心連接新的伺服器狀態資料來源
- 直接影響終端使用者，讓應用感覺比以往更快、反應更靈敏
- 可能幫助你節省頻寬並提升記憶體效能

## 說夠了，直接看程式碼吧！

在下面的範例中，你可以看到 Solid Query 最基本且簡單的形式，用於獲取 TanStack Query GitHub 專案的統計資料：

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

## 嗯，這樣看起來程式碼更多了，但做的事情一樣？

是的！但這幾行程式碼開啟了全新的可能性。在上面的範例中，你的查詢會被快取 5 分鐘，這意味著如果應用中任何地方有新的元件在 5 分鐘內使用相同的查詢，它不會重新獲取資料，而是使用快取的資料。這只是 Solid Query 開箱即用的眾多功能之一。其他功能包括：

- **自動重新獲取 (Automatic Refetching)**：當查詢「過時」（根據 `staleTime` 選項）時，會在背景自動重新獲取
- **自動快取 (Automatic Caching)**：查詢預設會被快取並在應用中共享
- **請求去重 (Request Deduplication)**：多個元件可以共享相同的查詢並發送單一請求
- **自動垃圾回收 (Automatic Garbage Collection)**：不再需要的查詢會被自動垃圾回收
- **視窗焦點重新獲取 (Window Focus Refetching)**：當應用重新獲得焦點時，查詢會自動重新獲取
- **分頁 (Pagination)**：內建分頁支援
- **請求取消 (Request Cancellation)**：自動取消過時或不必要的請求
- **輪詢/即時更新 (Polling/Realtime)**：透過簡單的 `refetchInterval` 選項即可輕鬆為查詢添加輪詢或即時更新
- **伺服器渲染支援 (SSR Support)**：Solid Query 與伺服器端渲染 (SSR) 完美配合
- **樂觀更新 (Optimistic Updates)**：輕鬆透過樂觀更新快取
- **還有更多...**
