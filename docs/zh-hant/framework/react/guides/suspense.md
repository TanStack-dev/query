---
source-updated-at: '2025-04-25T12:36:10.000Z'
translation-updated-at: '2025-05-08T20:21:58.914Z'
id: suspense
title: Suspense
---

React Query 也能與 React 的 Suspense for Data Fetching APIs 搭配使用。為此，我們提供了專用的鉤子 (hooks)：

- [useSuspenseQuery](../reference/useSuspenseQuery.md)
- [useSuspenseInfiniteQuery](../reference/useSuspenseInfiniteQuery.md)
- [useSuspenseQueries](../reference/useSuspenseQueries.md)
- 此外，你還可以使用 `useQuery().promise` 和 `React.use()` (實驗性功能)

當使用 suspense 模式時，不再需要 `status` 狀態和 `error` 物件，它們會被 `React.Suspense` 元件 (包括使用 `fallback` 屬性與 React 錯誤邊界 (error boundaries) 來捕捉錯誤) 所取代。請閱讀 [重置錯誤邊界](#resetting-error-boundaries) 並查看 [Suspense 範例](../examples/suspense) 以獲取更多關於如何設定 suspense 模式的資訊。

如果你想讓 mutations 將錯誤傳遞到最近的錯誤邊界 (類似於 queries)，你也可以將 `throwOnError` 選項設為 `true`。

啟用查詢的 suspense 模式：

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'

const { data } = useSuspenseQuery({ queryKey, queryFn })
```

這在 TypeScript 中運作良好，因為 `data` 保證會被定義 (因為錯誤和載入狀態由 Suspense 和 ErrorBoundaries 處理)。

另一方面，因此你無法有條件地啟用/停用查詢。這對於相依查詢通常不是必要的，因為使用 suspense 時，元件內的所有查詢都會被序列化獲取。

此查詢也不存在 `placeholderData`。為了防止 UI 在更新過程中被 fallback 替換，請將變更 QueryKey 的更新包裝在 [startTransition](https://react.dev/reference/react/Suspense#preventing-unwanted-fallbacks) 中。

### throwOnError 預設值

預設情況下，並非所有錯誤都會被拋到最近的錯誤邊界 — 我們只會在沒有其他資料可顯示時拋出錯誤。這意味著如果查詢曾經成功在快取中取得資料，元件就會渲染，即使資料是 `stale`。因此，`throwOnError` 的預設值為：

```
throwOnError: (error, query) => typeof query.state.data === 'undefined'
```

由於你無法變更 `throwOnError` (因為這會讓 `data` 可能變成 `undefined`)，如果你想讓所有錯誤都由錯誤邊界處理，就必須手動拋出錯誤：

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'

const { data, error, isFetching } = useSuspenseQuery({ queryKey, queryFn })

if (error && !isFetching) {
  throw error
}

// 繼續渲染資料
```

## 重置錯誤邊界

無論你在查詢中使用 **suspense** 還是 **throwOnError**，你都需要一種方式讓查詢知道，在發生某些錯誤後重新渲染時，你想要再次嘗試。

查詢錯誤可以透過 `QueryErrorResetBoundary` 元件或 `useQueryErrorResetBoundary` 鉤子來重置。

使用元件時，它會重置元件邊界內的任何查詢錯誤：

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const App = () => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ resetErrorBoundary }) => (
          <div>
            發生錯誤！
            <Button onClick={() => resetErrorBoundary()}>再試一次</Button>
          </div>
        )}
      >
        <Page />
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
)
```

使用鉤子時，它會重置最近的 `QueryErrorResetBoundary` 內的任何查詢錯誤。如果沒有定義邊界，則會全域重置：

```tsx
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const App = () => {
  const { reset } = useQueryErrorResetBoundary()
  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <div>
          發生錯誤！
          <Button onClick={() => resetErrorBoundary()}>再試一次</Button>
        </div>
      )}
    >
      <Page />
    </ErrorBoundary>
  )
}
```

## 渲染時獲取 vs 獲取時渲染

開箱即用，React Query 在 `suspense` 模式下作為 **渲染時獲取 (Fetch-on-render)** 解決方案運作良好，無需額外配置。這意味著當你的元件嘗試掛載時，它們會觸發查詢獲取並暫停，但只有在你導入並掛載它們之後才會發生。如果你想更進一步，實現 **獲取時渲染 (Render-as-you-fetch)** 模型，我們建議在路由回調和/或用戶互動事件上實作 [預取 (Prefetching)](./prefetching.md)，以便在元件掛載前開始載入查詢，甚至希望在導入或掛載其父元件之前就開始。

## 伺服器上的 Suspense 與串流

如果你使用 `NextJs`，你可以使用我們的 **實驗性** 整合來實現伺服器上的 Suspense：`@tanstack/react-query-next-experimental`。這個套件讓你能夠在伺服器上 (在客戶端元件中) 獲取資料，只需在元件中呼叫 `useSuspenseQuery`。然後，結果會隨著 SuspenseBoundaries 的解析從伺服器串流到客戶端。

為實現這一點，請將你的應用程式包裝在 `ReactQueryStreamedHydration` 元件中：

```tsx
// app/providers.tsx
'use client'

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import * as React from 'react'
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 使用 SSR 時，我們通常會設定預設的 staleTime
        // 大於 0，以避免在客戶端立即重新獲取
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // 伺服器端：總是建立新的查詢客戶端
    return makeQueryClient()
  } else {
    // 瀏覽器端：如果還沒有查詢客戶端，則建立一個新的
    // 這非常重要，這樣在初始渲染期間 React 暫停時
    // 我們不會重新建立新的客戶端。如果我們在查詢客戶端
    // 建立下方有暫停邊界，這可能就不需要了
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function Providers(props: { children: React.ReactNode }) {
  // 注意：初始化查詢客戶端時避免使用 useState，如果你沒有
  //       在可能暫停的程式碼與此之間設定暫停邊界，
  //       因為如果初始渲染時暫停且沒有邊界，React 會丟棄客戶端
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {props.children}
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  )
}
```

更多資訊，請查看 [NextJs Suspense 串流範例](../examples/nextjs-suspense-streaming) 和 [進階渲染與水合 (Advanced Rendering & Hydration)](./advanced-ssr.md) 指南。

## 使用 `useQuery().promise` 和 `React.use()` (實驗性)

> 要啟用此功能，你需要在建立 `QueryClient` 時將 `experimental_prefetchInRender` 選項設為 `true`

**範例程式碼：**

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
})
```

**用法：**

```tsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTodos, type Todo } from './api'

function TodoList({ query }: { query: UseQueryResult<Todo[]> }) {
  const data = React.use(query.promise)

  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

export function App() {
  const query = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

  return (
    <>
      <h1>Todos</h1>
      <React.Suspense fallback={<div>載入中...</div>}>
        <TodoList query={query} />
      </React.Suspense>
    </>
  )
}
```
