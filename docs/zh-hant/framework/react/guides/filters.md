---
source-updated-at: '2025-01-26T18:24:42.000Z'
translation-updated-at: '2025-05-08T20:23:59.294Z'
id: filters
title: 篩選器
---

TanStack Query 中的某些方法接受 `QueryFilters` 或 `MutationFilters` 物件。

## `Query Filters`

查詢過濾器 (Query Filters) 是一個包含特定條件的物件，用來匹配查詢：

```tsx
// 取消所有查詢
await queryClient.cancelQueries()

// 移除所有 key 以 `posts` 開頭的非活躍查詢
queryClient.removeQueries({ queryKey: ['posts'], type: 'inactive' })

// 重新取得所有活躍查詢的資料
await queryClient.refetchQueries({ type: 'active' })

// 重新取得所有 key 以 `posts` 開頭的活躍查詢資料
await queryClient.refetchQueries({ queryKey: ['posts'], type: 'active' })
```

查詢過濾器物件支援以下屬性：

- `queryKey?: QueryKey`
  - 設定此屬性以定義要匹配的查詢鍵 (query key)。
- `exact?: boolean`
  - 如果您不希望透過查詢鍵進行包容性搜尋，可以傳遞 `exact: true` 選項，僅返回與您傳遞的查詢鍵完全匹配的查詢。
- `type?: 'active' | 'inactive' | 'all'`
  - 預設為 `all`
  - 設為 `active` 時會匹配活躍查詢 (active queries)。
  - 設為 `inactive` 時會匹配非活躍查詢 (inactive queries)。
- `stale?: boolean`
  - 設為 `true` 時會匹配過時查詢 (stale queries)。
  - 設為 `false` 時會匹配新鮮查詢 (fresh queries)。
- `fetchStatus?: FetchStatus`
  - 設為 `fetching` 時會匹配目前正在取得資料的查詢。
  - 設為 `paused` 時會匹配想要取得資料但已被暫停的查詢。
  - 設為 `idle` 時會匹配未在取得資料的查詢。
- `predicate?: (query: Query) => boolean`
  - 此謂詞函式 (predicate function) 將作為所有匹配查詢的最終過濾條件。如果未指定其他過濾條件，此函式將針對快取中的每個查詢進行評估。

## `Mutation Filters`

突變過濾器 (Mutation Filters) 是一個包含特定條件的物件，用來匹配突變：

```tsx
// 取得所有正在執行的突變數量
await queryClient.isMutating()

// 透過 mutationKey 過濾突變
await queryClient.isMutating({ mutationKey: ['post'] })

// 使用謂詞函式過濾突變
await queryClient.isMutating({
  predicate: (mutation) => mutation.state.variables?.id === 1,
})
```

突變過濾器物件支援以下屬性：

- `mutationKey?: MutationKey`
  - 設定此屬性以定義要匹配的突變鍵 (mutation key)。
- `exact?: boolean`
  - 如果您不希望透過突變鍵進行包容性搜尋，可以傳遞 `exact: true` 選項，僅返回與您傳遞的突變鍵完全匹配的突變。
- `status?: MutationStatus`
  - 允許根據突變狀態進行過濾。
- `predicate?: (mutation: Mutation) => boolean`
  - 此謂詞函式將作為所有匹配突變的最終過濾條件。如果未指定其他過濾條件，此函式將針對快取中的每個突變進行評估。

## 工具函式

### `matchQuery`

```tsx
const isMatching = matchQuery(filters, query)
```

返回一個布林值，表示查詢是否匹配提供的查詢過濾器集合。

### `matchMutation`

```tsx
const isMatching = matchMutation(filters, mutation)
```

返回一個布林值，表示突變是否匹配提供的突變過濾器集合。
