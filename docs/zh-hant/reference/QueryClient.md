---
source-updated-at: '2025-03-07T03:31:26.000Z'
translation-updated-at: '2025-05-08T20:17:10.146Z'
id: QueryClient
title: QueryClient
---

## `QueryClient`

`QueryClient` 可用於與快取進行互動：

```tsx
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
})

await queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: fetchPosts })
```

其可用的方法包括：

- [`queryClient.fetchQuery`](#queryclientfetchquery)
- [`queryClient.fetchInfiniteQuery`](#queryclientfetchinfinitequery)
- [`queryClient.prefetchQuery`](#queryclientprefetchquery)
- [`queryClient.prefetchInfiniteQuery`](#queryclientprefetchinfinitequery)
- [`queryClient.getQueryData`](#queryclientgetquerydata)
- [`queryClient.ensureQueryData`](#queryclientensurequerydata)
- [`queryClient.ensureInfiniteQueryData`](#queryclientensureinfinitequerydata)
- [`queryClient.getQueriesData`](#queryclientgetqueriesdata)
- [`queryClient.setQueryData`](#queryclientsetquerydata)
- [`queryClient.getQueryState`](#queryclientgetquerystate)
- [`queryClient.setQueriesData`](#queryclientsetqueriesdata)
- [`queryClient.invalidateQueries`](#queryclientinvalidatequeries)
- [`queryClient.refetchQueries`](#queryclientrefetchqueries)
- [`queryClient.cancelQueries`](#queryclientcancelqueries)
- [`queryClient.removeQueries`](#queryclientremovequeries)
- [`queryClient.resetQueries`](#queryclientresetqueries)
- [`queryClient.isFetching`](#queryclientisfetching)
- [`queryClient.isMutating`](#queryclientismutating)
- [`queryClient.getDefaultOptions`](#queryclientgetdefaultoptions)
- [`queryClient.setDefaultOptions`](#queryclientsetdefaultoptions)
- [`queryClient.getQueryDefaults`](#queryclientgetquerydefaults)
- [`queryClient.setQueryDefaults`](#queryclientsetquerydefaults)
- [`queryClient.getMutationDefaults`](#queryclientgetmutationdefaults)
- [`queryClient.setMutationDefaults`](#queryclientsetmutationdefaults)
- [`queryClient.getQueryCache`](#queryclientgetquerycache)
- [`queryClient.getMutationCache`](#queryclientgetmutationcache)
- [`queryClient.clear`](#queryclientclear)
- [`queryClient.resumePausedMutations`](#queryclientresumepausedmutations)

**選項**

- `queryCache?: QueryCache`
  - 選填
  - 此 client 連接的查詢快取。
- `mutationCache?: MutationCache`
  - 選填
  - 此 client 連接的變異快取。
- `defaultOptions?: DefaultOptions`
  - 選填
  - 定義使用此 queryClient 的所有查詢和變異的預設選項。
  - 你也可以定義用於 [hydration](../framework/react/reference/hydration) 的預設值。

## `queryClient.fetchQuery`

`fetchQuery` 是一個非同步方法，可用於獲取並快取查詢。它會返回解析後的資料或拋出錯誤。如果你只需要獲取查詢而不需要結果，可以使用 `prefetchQuery` 方法。

如果查詢存在且資料未被標記為失效或未超過指定的 `staleTime`，則會返回快取中的資料。否則會嘗試獲取最新的資料。

```tsx
try {
  const data = await queryClient.fetchQuery({ queryKey, queryFn })
} catch (error) {
  console.log(error)
}
```

指定 `staleTime` 以僅在資料超過一定時間後才重新獲取：

```tsx
try {
  const data = await queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: 10000,
  })
} catch (error) {
  console.log(error)
}
```

**選項**

`fetchQuery` 的選項與 [`useQuery`](../framework/react/reference/useQuery) 完全相同，除了以下選項：`enabled, refetchInterval, refetchIntervalInBackground, refetchOnWindowFocus, refetchOnReconnect, refetchOnMount, notifyOnChangeProps, throwOnError, select, suspense, placeholderData`；這些選項僅適用於 useQuery 和 useInfiniteQuery。你可以查看 [原始碼](https://github.com/TanStack/query/blob/7cd2d192e6da3df0b08e334ea1cf04cd70478827/packages/query-core/src/types.ts#L119) 以獲得更清晰的說明。

**返回值**

- `Promise<TData>`

## `queryClient.fetchInfiniteQuery`

`fetchInfiniteQuery` 與 `fetchQuery` 類似，但可用於獲取並快取無限查詢。

```tsx
try {
  const data = await queryClient.fetchInfiniteQuery({ queryKey, queryFn })
  console.log(data.pages)
} catch (error) {
  console.log(error)
}
```

**選項**

`fetchInfiniteQuery` 的選項與 [`fetchQuery`](#queryclientfetchquery) 完全相同。

**返回值**

- `Promise<InfiniteData<TData, TPageParam>>`

## `queryClient.prefetchQuery`

`prefetchQuery` 是一個非同步方法，可用於在需要或使用 `useQuery` 等渲染之前預先獲取查詢。此方法與 `fetchQuery` 的工作方式相同，只是它不會拋出錯誤或返回任何資料。

```tsx
await queryClient.prefetchQuery({ queryKey, queryFn })
```

你甚至可以在配置中使用預設的 queryFn！

```tsx
await queryClient.prefetchQuery({ queryKey })
```

**選項**

`prefetchQuery` 的選項與 [`fetchQuery`](#queryclientfetchquery) 完全相同。

**返回值**

- `Promise<void>`
  - 返回一個 Promise，如果不需要獲取則會立即解析，或在查詢執行後解析。它不會返回任何資料或拋出任何錯誤。

## `queryClient.prefetchInfiniteQuery`

`prefetchInfiniteQuery` 與 `prefetchQuery` 類似，但可用於預先獲取並快取無限查詢。

```tsx
await queryClient.prefetchInfiniteQuery({ queryKey, queryFn })
```

**選項**

`prefetchInfiniteQuery` 的選項與 [`fetchQuery`](#queryclientfetchquery) 完全相同。

**返回值**

- `Promise<void>`
  - 返回一個 Promise，如果不需要獲取則會立即解析，或在查詢執行後解析。它不會返回任何資料或拋出任何錯誤。

## `queryClient.getQueryData`

`getQueryData` 是一個同步函數，可用於獲取現有查詢的快取資料。如果查詢不存在，則返回 `undefined`。

```tsx
const data = queryClient.getQueryData(queryKey)
```

**選項**

- `queryKey: QueryKey`: [查詢鍵 (Query Keys)](../framework/react/guides/query-keys)

**返回值**

- `data: TQueryFnData | undefined`
  - 快取查詢的資料，如果查詢不存在則返回 `undefined`。

## `queryClient.ensureQueryData`

`ensureQueryData` 是一個非同步函數，可用於獲取現有查詢的快取資料。如果查詢不存在，則會調用 `queryClient.fetchQuery` 並返回其結果。

```tsx
const data = await queryClient.ensureQueryData({ queryKey, queryFn })
```

**選項**

- 與 [`fetchQuery`](#queryclientfetchquery) 相同的選項
- `revalidateIfStale: boolean`
  - 選填
  - 預設為 `false`
  - 如果設為 `true`，過時的資料會在背景重新獲取，但會立即返回快取資料。

**返回值**

- `Promise<TData>`

## `queryClient.ensureInfiniteQueryData`

`ensureInfiniteQueryData` 是一個非同步函數，可用於獲取現有無限查詢的快取資料。如果查詢不存在，則會調用 `queryClient.fetchInfiniteQuery` 並返回其結果。

```tsx
const data = await queryClient.ensureInfiniteQueryData({
  queryKey,
  queryFn,
  initialPageParam,
  getNextPageParam,
})
```

**選項**

- 與 [`fetchInfiniteQuery`](#queryclientfetchinfinitequery) 相同的選項
- `revalidateIfStale: boolean`
  - 選填
  - 預設為 `false`
  - 如果設為 `true`，過時的資料會在背景重新獲取，但會立即返回快取資料。

**返回值**

- `Promise<InfiniteData<TData, TPageParam>>`

## `queryClient.getQueriesData`

`getQueriesData` 是一個同步函數，可用於獲取多個查詢的快取資料。僅返回符合傳入 queryKey 或 queryFilter 的查詢。如果沒有匹配的查詢，則返回空陣列。

```tsx
const data = queryClient.getQueriesData(filters)
```

**選項**

- `filters: QueryFilters`: [查詢過濾器 (Query Filters)](../framework/react/guides/filters#query-filters)
  - 如果傳入過濾器，則返回符合過濾條件的 queryKeys 的資料

**返回值**

- `[queryKey: QueryKey, data: TQueryFnData | undefined][]`
  - 匹配查詢鍵的元組陣列，如果沒有匹配則返回 `[]`。元組包含查詢鍵及其關聯資料。

**注意事項**

由於每個元組中的返回資料結構可能不同（例如使用過濾器返回「active」查詢可能會返回不同的資料類型），`TData` 泛型預設為 `unknown`。如果你為 `TData` 提供更具體的類型，則假設你確定每個元組的資料條目都是相同類型。

這種區別主要是為了解決 TypeScript 開發者的便利性，他們知道將返回哪種結構。

## `queryClient.setQueryData`

`setQueryData` 是一個同步函數，可用於立即更新查詢的快取資料。如果查詢不存在，則會創建它。**如果查詢在預設的 `gcTime` 5 分鐘內未被任何查詢鉤子使用，該查詢將被垃圾回收**。要一次更新多個查詢並部分匹配查詢鍵，你需要使用 [`queryClient.setQueriesData`](#queryclientsetqueriesdata)。

> 使用 `setQueryData` 和 `fetchQuery` 的區別在於，`setQueryData` 是同步的，並假設你已經同步擁有可用的資料。如果你需要非同步獲取資料，建議你重新獲取查詢鍵或使用 `fetchQuery` 來處理非同步獲取。

```tsx
queryClient.setQueryData(queryKey, updater)
```

**選項**

- `queryKey: QueryKey`: [查詢鍵 (Query Keys)](../framework/react/guides/query-keys)
- `updater: TQueryFnData | undefined | ((oldData: TQueryFnData | undefined) => TQueryFnData | undefined)`
  - 如果傳入非函數，資料將更新為此值
  - 如果傳入函數，它將接收舊資料值並預期返回一個新值。

**使用更新值**

```tsx
setQueryData(queryKey, newData)
```

如果值為 `undefined`，則查詢資料不會更新。

**使用更新函數**

為了語法方便，你也可以傳入一個更新函數，它接收當前資料值並返回新值：

```tsx
setQueryData(queryKey, (oldData) => newData)
```

如果更新函數返回 `undefined`，則查詢資料不會更新。如果更新函數接收到 `undefined` 作為輸入，你可以返回 `undefined` 以中止更新，從而 _不_ 創建新的快取條目。

**不可變性**

通過 `setQueryData` 進行的更新必須以 _不可變_ 的方式執行。**請勿** 嘗試通過直接修改 `oldData` 或通過 `getQueryData` 檢索到的資料來直接寫入快取。

## `queryClient.getQueryState`

`getQueryState` 是一個同步函數，可用於獲取現有查詢的狀態。如果查詢不存在，則返回 `undefined`。

```tsx
const state = queryClient.getQueryState(queryKey)
console.log(state.dataUpdatedAt)
```

**選項**

- `queryKey: QueryKey`: [查詢鍵 (Query Keys)](../framework/react/guides/query-keys)

## `queryClient.setQueriesData`

`setQueriesData` 是一個同步函數，可用於通過使用過濾函數或部分匹配查詢鍵來立即更新多個查詢的快取資料。僅更新符合傳入 queryKey 或 queryFilter 的查詢 - 不會創建新的快取條目。在底層，會為每個現有查詢調用 [`setQueryData`](#queryclientsetquerydata)。

```tsx
queryClient.setQueriesData(filters, updater)
```

**選項**

- `filters: QueryFilters`: [查詢過濾器 (Query Filters)](../framework/react/guides/filters#query-filters)
  - 如果傳入過濾器，則更新符合過濾條件的 queryKeys
- `updater: TQueryFnData | (oldData: TQueryFnData | undefined) => TQueryFnData`
  - [`setQueryData`](#queryclientsetquerydata) 的更新函數或新資料，將為每個匹配的 queryKey 調用

## `queryClient.invalidateQueries`

`invalidateQueries` 方法可用於根據查詢鍵或查詢的任何其他功能可訪問的屬性/狀態來使快取中的單個或多個查詢失效並重新獲取。預設情況下，所有匹配的查詢會立即標記為失效，並且活躍的查詢會在背景重新獲取。

- 如果你 **不希望活躍的查詢重新獲取**，而僅標記為失效，可以使用 `refetchType: 'none'` 選項。
- 如果你 **希望非活躍的查詢也重新獲取**，可以使用 `refetchType: 'all'` 選項

```tsx
await queryClient.invalidateQueries(
  {
    queryKey: ['posts'],
    exact,
    refetchType: 'active',
  },
  { throwOnError, cancelRefetch },
)
```

**選項**

- `filters?: QueryFilters`: [查詢過濾器 (Query Filters)](../framework/react/guides/filters#query-filters)
  - `queryKey?: QueryKey`: [查詢鍵 (Query Keys)](../framework/react/guides/query-keys)
  - `refetchType?: 'active' | 'inactive' | 'all' | 'none'`
    - 預設為 `'active'`
    - 設為 `active` 時，僅符合重新獲取條件且正通過 `useQuery` 等渲染的查詢會在背景重新獲取。
    - 設為 `inactive` 時，僅符合重新獲取條件且未通過 `useQuery` 等渲染的查詢會在背景重新獲取。
    - 設為 `all` 時，所有符合重新獲取條件的查詢會在背景重新獲取。
    - 設為 `none` 時，不會重新獲取任何查詢，僅將符合重新獲取條件的查詢標記為失效。
- `options?: InvalidateOptions`:
  - `throwOnError?: boolean`
    - 設為 `true` 時，如果任何查詢重新獲取任務失敗，此方法將拋出錯誤。
  - `cancelRefetch?: boolean`
    - 預設為 `true`
      - 預設情況下，在發起新請求之前會取消當前正在運行的請求
    - 設為 `false` 時，如果已有請求正在運行，則不會進行重新獲取。

## `queryClient.refetchQueries`

`refetchQueries` 方法可用於根據特定條件重新獲取查詢。

範例：

```tsx
// 重新獲取所有查詢：
await queryClient.refetchQueries()

// 重新獲取所有過時的查詢：
await queryClient.refetchQueries({ stale: true })

// 重新獲取所有部分匹配查詢鍵的活躍查詢：
await queryClient.refetchQueries({ queryKey: ['posts'], type: 'active' })

// 重新獲取所有完全匹配查詢鍵的活躍查詢：
await queryClient.refetchQueries({
  queryKey: ['posts', 1],
  type: 'active',
  exact: true,
})
```

**選項**

- `filters?: QueryFilters`: [查詢過濾器 (Query Filters)](../framework/react/guides/filters#query-filters)
- `options?: RefetchOptions`:
  - `throwOnError?: boolean`
    - 設為 `true` 時，如果任何查詢重新獲取任務失敗，此方法將拋出錯誤。
  - `cancelRefetch?: boolean`
    - 預設為 `true`
      - 預設情況下，在發起新請求之前會取消當前正在運行的請求
    - 設為 `false` 時，如果已有請求正在運行，則不會進行重新獲取。

**返回值**

此函數返回一個 Promise，當所有查詢完成重新獲取時會解析。預設情況下，它 **不會** 在這些查詢重新獲取失敗時拋出錯誤，但可以通過將 `throwOnError` 選項設為 `true` 來配置此行為。

## `queryClient.cancelQueries`

`cancelQueries` 方法可用於根據查詢鍵或查詢的任何其他功能可訪問的屬性/狀態來取消正在進行的查詢。

這在執行樂觀更新時非常有用，因為你可能需要取消任何正在進行的查詢重新獲取，以免它們在解析時覆蓋你的樂觀更新。

```tsx
await queryClient.cancelQueries({ queryKey: ['posts'], exact: true })
```

**選項**

- `filters?: QueryFilters`: [查詢過濾器 (Query Filters)](../framework/react/guides/filters#query-filters)

**返回值**

此方法不返回任何內容

## `queryClient.remove
