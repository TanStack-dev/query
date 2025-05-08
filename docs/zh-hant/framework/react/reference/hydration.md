---
source-updated-at: '2025-02-17T12:52:17.000Z'
translation-updated-at: '2025-05-08T20:20:28.004Z'
id: hydration
title: hydration
---

## `dehydrate`

`dehydrate` 會建立一個 `cache` 的凍結表示，之後可以用 `HydrationBoundary` 或 `hydrate` 進行水合 (hydration)。這對於將預先取得的查詢從伺服器傳遞到客戶端，或將查詢持久化到 localStorage 或其他持久化儲存位置非常有用。預設情況下，它只包含當前成功的查詢。

```tsx
import { dehydrate } from '@tanstack/react-query'

const dehydratedState = dehydrate(queryClient, {
  shouldDehydrateQuery,
  shouldDehydrateMutation,
})
```

**選項**

- `client: QueryClient`
  - **必填**
  - 需要進行脫水 (dehydrate) 的 `queryClient`
- `options: DehydrateOptions`
  - 選填
  - `shouldDehydrateMutation: (mutation: Mutation) => boolean`
    - 選填
    - 是否對突變 (mutation) 進行脫水
    - 此函數會針對快取中的每個突變被呼叫
      - 回傳 `true` 表示將此突變包含在脫水結果中，`false` 則不包含
    - 預設只包含暫停中的突變
    - 如果你想在保留預設行為的同時擴充此函數，可以在回傳語句中導入並執行 `defaultShouldDehydrateMutation`
  - `shouldDehydrateQuery: (query: Query) => boolean`
    - 選填
    - 是否對查詢進行脫水
    - 此函數會針對快取中的每個查詢被呼叫
      - 回傳 `true` 表示將此查詢包含在脫水結果中，`false` 則不包含
    - 預設只包含成功的查詢
    - 如果你想在保留預設行為的同時擴充此函數，可以在回傳語句中導入並執行 `defaultShouldDehydrateQuery`
  - `serializeData?: (data: any) => any` 一個在脫水過程中轉換（序列化）資料的函數
  - `shouldRedactErrors?: (error: unknown) => boolean`
    - 選填
    - 是否在脫水過程中隱藏來自伺服器的錯誤
    - 此函數會針對快取中的每個錯誤被呼叫
      - 回傳 `true` 表示隱藏此錯誤，`false` 則不隱藏
    - 預設會隱藏所有錯誤

**回傳值**

- `dehydratedState: DehydratedState`
  - 包含後續水合 `queryClient` 所需的所有內容
  - 你**不應該**依賴此回傳值的確切格式，這不是公開 API 的一部分，隨時可能變更
  - 此結果並非序列化格式，如有需要請自行處理

### 限制

某些儲存系統（例如瀏覽器的 [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)）要求值必須是 JSON 可序列化的。如果你需要脫水無法自動序列化為 JSON 的值（如 `Error` 或 `undefined`），則必須自行序列化。由於預設只包含成功的查詢，若要同時包含 `Errors`，你需要提供 `shouldDehydrateQuery`，例如：

```tsx
// 伺服器端
const state = dehydrate(client, { shouldDehydrateQuery: () => true }) // 同時包含 Errors
const serializedState = mySerialize(state) // 將 Error 實例轉換為物件

// 客戶端
const state = myDeserialize(serializedState) // 將物件轉換回 Error 實例
hydrate(client, state)
```

## `hydrate`

`hydrate` 將先前脫水的狀態加入 `cache` 中。

```tsx
import { hydrate } from '@tanstack/react-query'

hydrate(queryClient, dehydratedState, options)
```

**選項**

- `client: QueryClient`
  - **必填**
  - 要進行水合的 `queryClient`
- `dehydratedState: DehydratedState`
  - **必填**
  - 要水合到客戶端的狀態
- `options: HydrateOptions`
  - 選填
  - `defaultOptions: DefaultOptions`
    - 選填
    - `mutations: MutationOptions` 用於水合突變的預設突變選項
    - `queries: QueryOptions` 用於水合查詢的預設查詢選項
    - `deserializeData?: (data: any) => any` 一個在將資料放入快取前進行轉換（反序列化）的函數
  - `queryClient?: QueryClient`
    - 使用此選項可自訂 QueryClient。否則會使用最近上下文中的 QueryClient

### 限制

如果你嘗試水合的查詢已經存在於 queryCache 中，`hydrate` 只會在資料比快取中的資料更新時覆寫它們。否則，水合**不會**生效。

[//]: # 'HydrationBoundary'

## `HydrationBoundary`

`HydrationBoundary` 將先前脫水的狀態加入到由 `useQueryClient()` 回傳的 `queryClient` 中。如果客戶端已包含資料，新查詢會根據更新時間戳記智能合併。

```tsx
import { HydrationBoundary } from '@tanstack/react-query'

function App() {
  return <HydrationBoundary state={dehydratedState}>...</HydrationBoundary>
}
```

> 注意：只有 `queries` 可以用 `HydrationBoundary` 進行脫水

**選項**

- `state: DehydratedState`
  - 要水合的狀態
- `options: HydrateOptions`
  - 選填
  - `defaultOptions: QueryOptions`
    - 用於水合查詢的預設查詢選項
  - `queryClient?: QueryClient`
    - 使用此選項可自訂 QueryClient。否則會使用最近上下文中的 QueryClient

[//]: # 'HydrationBoundary'
