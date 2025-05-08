---
source-updated-at: '2025-04-29T09:18:25.000Z'
translation-updated-at: '2025-05-08T20:15:12.165Z'
id: QueryCache
title: QueryCache
---

`QueryCache` 是 TanStack Query 的儲存機制，它儲存了所有查詢的資料、元資訊和狀態。

**通常情況下，您不會直接與 QueryCache 互動，而是針對特定快取使用 `QueryClient`。**

```tsx
import { QueryCache } from '@tanstack/react-query'

const queryCache = new QueryCache({
  onError: (error) => {
    console.log(error)
  },
  onSuccess: (data) => {
    console.log(data)
  },
  onSettled: (data, error) => {
    console.log(data, error)
  },
})

const query = queryCache.find(['posts'])
```

它提供的方法包括：

- [`find`](#querycachefind)
- [`findAll`](#querycachefindall)
- [`subscribe`](#querycachesubscribe)
- [`clear`](#querycacheclear)

**選項**

- `onError?: (error: unknown, query: Query) => void`
  - 選填
  - 當某個查詢發生錯誤時，此函式將被呼叫。
- `onSuccess?: (data: unknown, query: Query) => void`
  - 選填
  - 當某個查詢成功時，此函式將被呼叫。
- `onSettled?: (data: unknown | undefined, error: unknown | null, query: Query) => void`
  - 選填
  - 當某個查詢完成（無論成功或失敗）時，此函式將被呼叫。

## `queryCache.find`

`find` 是一個稍微進階的同步方法，可用於從快取中獲取現有的查詢實例。此實例不僅包含查詢的**所有**狀態，還包含所有實例和查詢的底層細節。如果查詢不存在，則會返回 `undefined`。

> 注意：大多數應用程式通常不需要使用此方法，但在罕見情況下需要獲取查詢的更多資訊時會很有用（例如：查看 `query.state.dataUpdatedAt` 時間戳來決定查詢是否足夠新鮮，可作為初始值使用）

```tsx
const query = queryCache.find(queryKey)
```

**選項**

- `filters?: QueryFilters`: [查詢過濾器](../../framework/react/guides/filters#query-filters)

**回傳值**

- `Query`
  - 快取中的查詢實例

## `queryCache.findAll`

`findAll` 是一個更進階的同步方法，可用於從快取中獲取部分匹配查詢鍵的現有查詢實例。如果查詢不存在，則會返回空陣列。

> 注意：大多數應用程式通常不需要使用此方法，但在罕見情況下需要獲取查詢的更多資訊時會很有用

```tsx
const queries = queryCache.findAll(queryKey)
```

**選項**

- `queryKey?: QueryKey`: [查詢鍵](../framework/react/guides/query-keys.md)
- `filters?: QueryFilters`: [查詢過濾器](../framework/react/guides/filters.md#query-filters)

**回傳值**

- `Query[]`
  - 快取中的查詢實例陣列

## `queryCache.subscribe`

`subscribe` 方法可用於訂閱整個查詢快取，並在快取發生安全/已知的更新時收到通知，例如查詢狀態變更或查詢被更新、新增或移除。

```tsx
const callback = (event) => {
  console.log(event.type, event.query)
}

const unsubscribe = queryCache.subscribe(callback)
```

**選項**

- `callback: (event: QueryCacheNotifyEvent) => void`
  - 當快取透過其追蹤的更新機制（例如 `query.setState`、`queryClient.removeQueries` 等）更新時，此函式將被呼叫。不鼓勵對快取進行超出範圍的變更，這類變更不會觸發訂閱回呼。

**回傳值**

- `unsubscribe: Function => void`
  - 此函式將取消回呼對查詢快取的訂閱。

## `queryCache.clear`

`clear` 方法可用於完全清除快取並重新開始。

```tsx
queryCache.clear()
```

[//]: # 'Materials'

## 延伸閱讀

若要更深入理解 QueryCache 的內部運作原理，請參閱社群資源中的 [#18: Inside React Query](../framework/react/community/tkdodos-blog.md#18-inside-react-query)。

[//]: # 'Materials'
