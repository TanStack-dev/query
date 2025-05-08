---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:25:09.511Z'
id: migrating-to-react-query-3
title: 遷移至 v3
---

React Query 的先前版本已經非常出色，為函式庫帶來了一些令人驚豔的新功能、更多魔法般的體驗，以及整體更優質的使用感受。這些版本也帶來了大量的採用，同時也為函式庫帶來了許多精煉的考驗（問題/貢獻），並凸顯了一些需要進一步打磨的地方，以讓函式庫變得更好。v3 版本正是這些打磨的成果。

## 概覽

- 更具擴展性和可測試性的快取配置
- 更好的伺服器渲染 (SSR) 支援
- 資料延遲（先前稱為 `usePaginatedQuery`）功能隨處可用！
- 雙向無限查詢 (Infinite Queries)
- 查詢資料選擇器 (Query data selectors)！
- 可在使用前完全配置查詢和/或變更 (mutations) 的預設值
- 更細緻的選擇性渲染優化
- 新的 `useQueries` 鉤子！（可變長度的平行查詢執行）
- `useIsFetching()` 鉤子支援查詢過濾器！
- 變更 (mutations) 的重試/離線/重播支援
- 在 React 外部觀察查詢/變更
- 在任何地方使用 React Query 的核心邏輯！
- 整合/同位置的開發工具，透過 `react-query/devtools` 使用
- 快取持久化至網頁儲存空間（實驗性功能，透過 `react-query/persistQueryClient-experimental` 和 `react-query/createWebStoragePersistor-experimental` 使用）

## 重大變更

### `QueryCache` 已被拆分為 `QueryClient` 和底層的 `QueryCache` 與 `MutationCache` 實例。

`QueryCache` 包含所有查詢，`MutationCache` 包含所有變更，而 `QueryClient` 可用於設定配置並與它們互動。

這帶來了一些好處：

- 允許不同類型的快取。
- 具有不同配置的多個客戶端可以使用同一個快取。
- 客戶端可用於追蹤查詢，這可用於 SSR 上的共享快取。
- 客戶端 API 更專注於一般使用情境。
- 更容易測試個別元件。

當建立 `new QueryClient()` 時，如果沒有提供，系統會自動為你建立 `QueryCache` 和 `MutationCache`。

```tsx
import { QueryClient } from 'react-query'

const queryClient = new QueryClient()
```

### `ReactQueryConfigProvider` 和 `ReactQueryCacheProvider` 已被 `QueryClientProvider` 取代

現在可以在 `QueryClient` 中指定查詢和變更的預設選項：

**請注意，現在是 `defaultOptions` 而非 `defaultConfig`**

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 查詢選項
    },
    mutations: {
      // 變更選項
    },
  },
})
```

`QueryClientProvider` 元件現在用於將 `QueryClient` 連接到你的應用程式：

```tsx
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

function App() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

### 預設的 `QueryCache` 已消失。**這次是真的！**

如先前所提到的棄用通知，主套件不再建立或匯出預設的 `QueryCache`。**你必須透過 `new QueryClient()` 或 `new QueryCache()` 自行建立（然後可以傳遞給 `new QueryClient({ queryCache })`）**

### 已棄用的 `makeQueryCache` 工具已被移除。

這已經醞釀很久了，但它終於消失了 :)

### `QueryCache.prefetchQuery()` 已移至 `QueryClient.prefetchQuery()`

新的 `QueryClient.prefetchQuery()` 函式是異步的，但**不會回傳查詢的資料**。如果需要資料，請使用新的 `QueryClient.fetchQuery()` 函式

```tsx
// 預先擷取查詢：
await queryClient.prefetchQuery('posts', fetchPosts)

// 擷取查詢：
try {
  const data = await queryClient.fetchQuery('posts', fetchPosts)
} catch (error) {
  // 錯誤處理
}
```

### `ReactQueryErrorResetBoundary` 和 `QueryCache.resetErrorBoundaries()` 已被 `QueryErrorResetBoundary` 和 `useQueryErrorResetBoundary()` 取代。

這些新功能提供了與之前相同的體驗，但增加了選擇要重置哪些元件樹的控制權。更多資訊請參閱：

- [QueryErrorResetBoundary](../reference/QueryErrorResetBoundary.md)
- [useQueryErrorResetBoundary](../reference/useQueryErrorResetBoundary.md)

### `QueryCache.getQuery()` 已被 `QueryCache.find()` 取代。

現在應使用 `QueryCache.find()` 從快取中查找個別查詢

### `QueryCache.getQueries()` 已移至 `QueryCache.findAll()`。

現在應使用 `QueryCache.findAll()` 從快取中查找多個查詢

### `QueryCache.isFetching` 已移至 `QueryClient.isFetching()`。

**請注意，現在是一個函式而非屬性**

### `useQueryCache` 鉤子已被 `useQueryClient` 鉤子取代。

它會回傳其元件樹所提供的 `queryClient`，除了重新命名外，應該不需要太多調整。

### 查詢鍵 (Query key) 的部分不再自動展開傳遞給查詢函式。

現在建議使用內聯函式將參數傳遞給查詢函式：

```tsx
// 舊版
useQuery(['post', id], (_key, id) => fetchPost(id))

// 新版
useQuery(['post', id], () => fetchPost(id))
```

如果仍然堅持不使用內聯函式，可以使用新傳入的 `QueryFunctionContext`：

```tsx
useQuery(['post', id], (context) => fetchPost(context.queryKey[1]))
```

### 無限查詢 (Infinite Query) 的頁面參數現在透過 `QueryFunctionContext.pageParam` 傳遞

先前它們是作為查詢函式中的最後一個查詢鍵參數加入的，但這對某些模式來說證明是困難的

```tsx
// 舊版
useInfiniteQuery(['posts'], (_key, pageParam = 0) => fetchPosts(pageParam))

// 新版
useInfiniteQuery(['posts'], ({ pageParam = 0 }) => fetchPosts(pageParam))
```

### `usePaginatedQuery()` 已被移除，改為使用 `keepPreviousData` 選項

新的 `keepPreviousData` 選項適用於 `useQuery` 和 `useInfiniteQuery`，並將對資料產生相同的「延遲」效果：

```tsx
import { useQuery } from 'react-query'

function Page({ page }) {
  const { data } = useQuery(['page', page], fetchPage, {
    keepPreviousData: true,
  })
}
```

### `useInfiniteQuery()` 現在是雙向的

`useInfiniteQuery()` 的介面已更改，以完全支援雙向無限列表。

- `options.getFetchMore` 已更名為 `options.getNextPageParam`
- `queryResult.canFetchMore` 已更名為 `queryResult.hasNextPage`
- `queryResult.fetchMore` 已更名為 `queryResult.fetchNextPage`
- `queryResult.isFetchingMore` 已更名為 `queryResult.isFetchingNextPage`
- 新增了 `options.getPreviousPageParam` 選項
- 新增了 `queryResult.hasPreviousPage` 屬性
- 新增了 `queryResult.fetchPreviousPage` 屬性
- 新增了 `queryResult.isFetchingPreviousPage`
- 無限查詢的 `data` 現在是一個物件，包含 `pages` 和用於擷取這些頁面的 `pageParams`：`{ pages: [data, data, data], pageParams: [...]}`

單一方向：

```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery(
    'projects',
    ({ pageParam = 0 }) => fetchProjects(pageParam),
    {
      getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    },
  )
```

雙向：

```tsx
const {
  data,
  fetchNextPage,
  fetchPreviousPage,
  hasNextPage,
  hasPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage,
} = useInfiniteQuery(
  'projects',
  ({ pageParam = 0 }) => fetchProjects(pageParam),
  {
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor,
  },
)
```

單一方向反向：

```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery(
    'projects',
    ({ pageParam = 0 }) => fetchProjects(pageParam),
    {
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
      getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    },
  )
```

### 無限查詢的資料現在包含頁面陣列和用於擷取這些頁面的 `pageParams`。

這使得資料和頁面參數的操作更加容易，例如移除第一頁資料及其參數：

```tsx
queryClient.setQueryData(['projects'], (data) => ({
  pages: data.pages.slice(1),
  pageParams: data.pageParams.slice(1),
}))
```

### `useMutation` 現在回傳一個物件而非陣列

雖然舊的方式讓我們回想起第一次發現 `useState` 時的溫暖感覺，但這種感覺並沒有持續太久。現在變更回傳的是一個單一物件。

```tsx
// 舊版：
const [mutate, { status, reset }] = useMutation()

// 新版：
const { mutate, status, reset } = useMutation()
```

### `mutation.mutate` 不再回傳一個 Promise

- `[mutate]` 變數已更改為 `mutation.mutate` 函式
- 新增了 `mutation.mutateAsync` 函式

我們收到了許多關於此行為的問題，因為使用者期望 Promise 的行為像一個普通的 Promise。

因此，`mutate` 函式現在分為 `mutate` 和 `mutateAsync` 兩個函式。

`mutate` 函式可用於使用回呼時：

```tsx
const { mutate } = useMutation({ mutationFn: addTodo })

mutate('todo', {
  onSuccess: (data) => {
    console.log(data)
  },
  onError: (error) => {
    console.error(error)
  },
  onSettled: () => {
    console.log('settled')
  },
})
```

`mutateAsync` 函式可用於使用 async/await 時：

```tsx
const { mutateAsync } = useMutation({ mutationFn: addTodo })

try {
  const data = await mutateAsync('todo')
  console.log(data)
} catch (error) {
  console.error(error)
} finally {
  console.log('settled')
}
```

### `useQuery` 的物件語法現在使用折疊配置：

```tsx
// 舊版：
useQuery({
  queryKey: 'posts',
  queryFn: fetchPosts,
  config: { staleTime: Infinity },
})

// 新版：
useQuery({
  queryKey: 'posts',
  queryFn: fetchPosts,
  staleTime: Infinity,
})
```

### 如果設定了 `QueryOptions.enabled` 選項，它必須是一個布林值 (`true`/`false`)

`enabled` 查詢選項現在僅在值為 `false` 時停用查詢。
如果需要，可以使用 `!!userId` 或 `Boolean(userId)` 進行轉換，如果傳遞了非布林值，將會拋出一個方便的錯誤。

### `QueryOptions.initialStale` 選項已被移除

`initialStale` 查詢選項已被移除，初始資料現在被視為常規資料。
這意味著如果提供了 `initialData`，查詢預設會在掛載時重新擷取。
如果不希望立即重新擷取，可以定義一個 `staleTime`。

### `QueryOptions.forceFetchOnMount` 選項已被 `refetchOnMount: 'always'` 取代

老實說，我們累積了太多 `refetchOn____` 選項，所以這應該能讓事情更清晰。

### `QueryOptions.refetchOnMount` 選項現在僅適用於其父元件，而非所有查詢觀察者

當 `refetchOnMount` 設為 `false` 時，任何其他元件都被阻止在掛載時重新擷取。
在版本 3 中，僅設定了此選項的元件不會在掛載時重新擷取。

### `QueryOptions.queryFnParamsFilter` 已被移除，改為使用新的 `QueryFunctionContext` 物件。

`queryFnParamsFilter` 選項已被移除，因為查詢函式現在接收的是 `QueryFunctionContext` 物件，而非查詢鍵。

由於 `QueryFunctionContext` 也包含查詢鍵，參數仍然可以在查詢函式內部過濾。

### `QueryOptions.notifyOnStatusChange` 選項已被新的 `notifyOnChangeProps` 和 `notifyOnChangePropsExclusions` 選項取代。

透過這些新選項，可以更細緻地配置元件應在何時重新渲染。

僅在 `data` 或 `error` 屬性變更時重新渲染：

```tsx
import { useQuery } from 'react-query'

function User() {
  const { data } = useQuery(['user'], fetchUser, {
    notifyOnChangeProps: ['data', 'error'],
  })
  return <div>Username: {data.username}</div>
}
```

防止在 `isStale` 屬性變更時重新渲染：

```tsx
import { useQuery } from 'react-query'

function User() {
  const { data } = useQuery(['user'], fetchUser, {
    notifyOnChangePropsExclusions: ['isStale'],
  })
  return <div>Username: {data.username}</div>
}
```

### `QueryResult.clear()` 函式已更名為 `QueryResult.remove()`

雖然它被稱為 `clear`，但它實際上只是從快取中移除查詢。現在的名稱更符合其功能。

### `QueryResult.updatedAt` 屬性已被拆分為 `QueryResult.dataUpdatedAt` 和 `QueryResult.errorUpdatedAt` 屬性

由於資料和錯誤可以同時存在，`updatedAt` 屬性已被拆分為 `dataUpdatedAt` 和 `errorUpdatedAt`。

### `setConsole()` 已被新的 `setLogger()` 函式取代

```tsx
import { setLogger } from 'react-query'

// 使用 Sentry 記錄
setLogger({
  error: (error) => {
    Sentry.captureException(error)
  },
})

// 使用 Winston 記錄
setLogger(winston.createLogger())
```

### React Native 不再需要覆寫記錄器

為了防止在查詢失敗時顯示錯誤畫面，在 React Native 中需要手動變更 Console：

```tsx
import { setConsole } from 'react-query'

setConsole({
  log: console.log,
  warn: console.warn,
  error: console.warn,
})
```

在版本 3 中，**當 React Query 在 React Native 中使用時，這會自動完成**。

### TypeScript

#### `QueryStatus` 已從 [enum](https://www.typescriptlang.org/docs/handbook/enums.html#string-enums) 更改為 [union type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)

因此，如果你正在檢查查詢或變更的 `status` 屬性與 `QueryStatus` enum 屬性，現在必須檢查它與 enum 先前為每個屬性持有的字串字面值。

因此，你必須將 enum 屬性更改為其等效的字串字面值，如下所示：

- `QueryStatus.Idle` -> `'idle'`
- `QueryStatus.Loading` -> `'loading'`
- `QueryStatus.Error` -> `'error'`
- `QueryStatus.Success` -> `'success'`

以下是你需要進行的更改範例：

```tsx
- import { useQuery, QueryStatus } from 'react-query'; // [!code --]
+ import { useQuery } from 'react-query'; // [!code ++]

const { data, status } = useQuery(['post', id], () => fetchPost(id))

- if (status === QueryStatus.Loading) { // [!code --]
+ if (status === 'loading') { // [!code ++]
  ...
}

- if (status === QueryStatus.Error) { // [!code --]
+ if (status === 'error') { // [!code ++]
  ...
}
```

## 新功能

#### 查詢資料選擇器 (Query Data Selectors)

`useQuery` 和 `useInfiniteQuery` 鉤子現在有一個 `select` 選項，可以選擇或轉換查詢結果的部分內容。

```tsx
import { useQuery } from 'react-query'

function User() {
  const { data } = useQuery(['user'], fetchUser, {
    select: (user) => user.username,
  })
  return <div>Username: {data}</div>
}
```

將 `notifyOnChangeProps` 選項設為 `['data', 'error']`，以僅在選取的資料變更時重新渲染。

#### `useQueries()` 鉤子，用於可變長度的平行查詢執行

希望在迴圈中執行 `useQuery` 嗎？鉤子的規則說不行，但有了新的 `useQueries()` 鉤子，你可以！

```tsx
import { useQueries } from 'react-query'

function Overview() {
  const results = useQueries([
    { queryKey: ['post', 1], queryFn: fetchPost },
    { queryKey: ['post', 2], queryFn: fetchPost },
  ]
```
