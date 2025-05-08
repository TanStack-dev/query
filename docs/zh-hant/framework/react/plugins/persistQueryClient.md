---
source-updated-at: '2025-04-10T16:13:17.000Z'
translation-updated-at: '2025-05-08T20:21:30.489Z'
id: persistQueryClient
title: persistQueryClient
---

這是一組用於與「持久化工具 (persisters)」互動的實用工具，這些工具會儲存您的 `queryClient` 以供後續使用。不同的 **持久化工具** 可用於將客戶端和快取儲存到多種不同的儲存層。

## 建立持久化工具

- [createSyncStoragePersister](./createSyncStoragePersister.md)
- [createAsyncStoragePersister](./createAsyncStoragePersister.md)
- [建立自訂持久化工具](#persisters)

## 運作原理

**重要提示** - 為了讓持久化功能正常運作，您可能需要在 hydration 期間傳遞 `QueryClient` 一個 `gcTime` 值來覆寫預設值（如上所示）。

如果在建立 `QueryClient` 實例時未設定，hydration 期間的預設值將為 `300000`（5 分鐘），且儲存的快取將在 5 分鐘不活動後被丟棄。這是預設的垃圾回收行為。

它應設定為與 `persistQueryClient` 的 `maxAge` 選項相同或更高的值。例如，如果 `maxAge` 為 24 小時（預設值），則 `gcTime` 應為 24 小時或更高。如果低於 `maxAge`，垃圾回收將啟動並比預期更早丟棄儲存的快取。

您也可以傳遞 `Infinity` 來完全停用垃圾回收行為。

由於 JavaScript 的限制，允許的最大 `gcTime` 約為 24 天（詳見[更多資訊](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value)）。

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 小時
    },
  },
})
```

### 快取清除 (Cache Busting)

有時您可能會對應用程式或資料進行更改，這些更改會立即使所有快取資料失效。如果發生這種情況，您可以傳遞一個 `buster` 字串選項。如果找到的快取沒有相同的 buster 字串，它將被丟棄。以下幾個函數接受此選項：

```tsx
persistQueryClient({ queryClient, persister, buster: buildHash })
persistQueryClientSave({ queryClient, persister, buster: buildHash })
persistQueryClientRestore({ queryClient, persister, buster: buildHash })
```

### 移除

如果發現資料符合以下任一情況：

1. 已過期（參見 `maxAge`）
2. 已清除（參見 `buster`）
3. 錯誤（例如：`throws ...`）
4. 為空（例如：`undefined`）

持久化工具的 `removeClient()` 將被呼叫，快取會立即被丟棄。

## API

### `persistQueryClientSave`

- 您的查詢/變異將被 [`dehydrated`](../reference/hydration.md#dehydrate) 並由您提供的持久化工具儲存。
- `createSyncStoragePersister` 和 `createAsyncStoragePersister` 會將此操作節流為最多每秒執行一次，以避免潛在的高成本寫入。請參閱它們的文件以了解如何自訂節流時間。

您可以使用此功能在您選擇的時刻明確地持久化快取。

```tsx
persistQueryClientSave({
  queryClient,
  persister,
  buster = '',
  dehydrateOptions = undefined,
})
```

### `persistQueryClientSubscribe`

在 `queryClient` 的快取發生變化時執行 `persistQueryClientSave`。例如：您可以在使用者登入並勾選「記住我」時啟動 `subscribe`。

- 它會返回一個 `unsubscribe` 函數，您可以用來停止監控；結束對持久化快取的更新。
- 如果您想在 `unsubscribe` 後清除持久化快取，可以向 `persistQueryClientRestore` 傳遞一個新的 `buster`，這將觸發持久化工具的 `removeClient` 函數並丟棄持久化快取。

```tsx
persistQueryClientSubscribe({
  queryClient,
  persister,
  buster = '',
  dehydrateOptions = undefined,
})
```

### `persistQueryClientRestore`

- 嘗試從持久化工具中 [`hydrate`](../reference/hydration.md#hydrate) 先前持久化的 dehydrated 查詢/變異快取，將其還原到傳入的 query client 的快取中。
- 如果找到的快取比 `maxAge`（預設為 24 小時）更舊，它將被丟棄。您可以根據需要自訂此時間。

您可以使用此功能在您選擇的時刻還原快取。

```tsx
persistQueryClientRestore({
  queryClient,
  persister,
  maxAge = 1000 * 60 * 60 * 24, // 24 小時
  buster = '',
  hydrateOptions = undefined,
})
```

### `persistQueryClient`

執行以下操作：

1. 立即還原任何持久化的快取（參見 [`persistQueryClientRestore`](#persistqueryclientrestore)）
2. 訂閱查詢快取並返回 `unsubscribe` 函數（參見 [`persistQueryClientSubscribe`](#persistqueryclientsubscribe)）。

此功能從 3.x 版本保留至今。

```tsx
persistQueryClient({
  queryClient,
  persister,
  maxAge = 1000 * 60 * 60 * 24, // 24 小時
  buster = '',
  hydrateOptions = undefined,
  dehydrateOptions = undefined,
})
```

### `Options`

所有可用的選項如下：

```tsx
interface PersistQueryClientOptions {
  /** 要持久化的 QueryClient */
  queryClient: QueryClient
  /** 用於將快取儲存到持久化位置或從中還原的 Persister 介面 */
  persister: Persister
  /** 快取的最大允許存活時間（毫秒）。
   * 如果找到的快取比此時間更舊，
   * 它將被**靜默**丟棄
   * （預設為 24 小時） */
  maxAge?: number
  /** 一個唯一字串，可用於強制
   * 使現有快取失效，如果它們不共用相同的 buster 字串 */
  buster?: string
  /** 傳遞給 hydrate 函數的選項
   * 不在 `persistQueryClientSave` 或 `persistQueryClientSubscribe` 中使用 */
  hydrateOptions?: HydrateOptions
  /** 傳遞給 dehydrate 函數的選項
   * 不在 `persistQueryClientRestore` 中使用 */
  dehydrateOptions?: DehydrateOptions
}
```

實際上提供了三種介面：

- `PersistedQueryClientSaveOptions` 用於 `persistQueryClientSave` 和 `persistQueryClientSubscribe`（不使用 `hydrateOptions`）。
- `PersistedQueryClientRestoreOptions` 用於 `persistQueryClientRestore`（不使用 `dehydrateOptions`）。
- `PersistQueryClientOptions` 用於 `persistQueryClient`

## 與 React 一起使用

[persistQueryClient](#persistQueryClient) 會嘗試還原快取並自動訂閱後續更改，從而將您的客戶端同步到提供的儲存。

然而，還原是異步的，因為所有持久化工具本質上都是異步的，這意味著如果您在還原期間渲染您的 App，可能會在查詢掛載和獲取同時發生時遇到競爭條件。

此外，如果您在 React 元件生命週期之外訂閱更改，您將無法取消訂閱：

```tsx
// 🚨 永遠不會取消訂閱同步
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
})

// 🚨 與還原同時發生
ReactDOM.createRoot(rootElement).render(<App />)
```

### PersistQueryClientProvider

針對此使用情境，您可以使用 `PersistQueryClientProvider`。它將確保根據 React 元件生命週期正確訂閱/取消訂閱，並且還會確保在我們仍在還原時查詢不會開始獲取。查詢仍會渲染，但它們將被設置為 `fetchingState: 'idle'`，直到資料被還原。然後，除非還原的資料足夠新鮮，否則它們將重新獲取，並且 `initialData` 也將被尊重。它可以**代替**普通的 [QueryClientProvider](../reference/QueryClientProvider.md) 使用：

```tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 小時
    },
  },
})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
})

ReactDOM.createRoot(rootElement).render(
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister }}
  >
    <App />
  </PersistQueryClientProvider>,
)
```

#### Props

`PersistQueryClientProvider` 接受與 [QueryClientProvider](../reference/QueryClientProvider.md) 相同的 props，並額外包括：

- `persistOptions: PersistQueryClientOptions`
  - 您可以傳遞給 [persistQueryClient](#persistqueryclient) 的所有[選項](#options)，但不包括 QueryClient 本身
- `onSuccess?: () => Promise<unknown> | unknown`
  - 可選
  - 將在初始還原完成時呼叫
  - 可用於 [resumePausedMutations](../../../reference/QueryClient.md#queryclientresumepausedmutations)
  - 如果返回 Promise，它將被等待；還原將被視為正在進行，直到那時
- `onError?: () => Promise<unknown> | unknown`
  - 可選
  - 將在還原期間拋出錯誤時呼叫
  - 如果返回 Promise，它將被等待

### useIsRestoring

如果您使用 `PersistQueryClientProvider`，您也可以同時使用 `useIsRestoring` 鉤子來檢查還原是否正在進行中。`useQuery` 和其他相關功能也會在內部檢查此狀態，以避免還原和掛載查詢之間的競爭條件。

## 持久化工具

### 持久化工具介面

持久化工具有以下介面：

```tsx
export interface Persister {
  persistClient(persistClient: PersistedClient): Promisable<void>
  restoreClient(): Promisable<PersistedClient | undefined>
  removeClient(): Promisable<void>
}
```

持久化的客戶端條目具有以下介面：

```tsx
export interface PersistedClient {
  timestamp: number
  buster: string
  cacheState: any
}
```

您可以導入這些（以建立持久化工具）：

```tsx
import {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client'
```

### 建立持久化工具

您可以按自己的方式進行持久化。以下是建立 [Indexed DB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) 持久化工具的範例。與 `Web Storage API` 相比，Indexed DB 更快，儲存超過 5MB，且不需要序列化。這意味著它可以直接儲存 JavaScript 原生類型，例如 `Date` 和 `File`。

```tsx
import { get, set, del } from 'idb-keyval'
import {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client'

/**
 * 建立 Indexed DB 持久化工具
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */
export function createIDBPersister(idbValidKey: IDBValidKey = 'reactQuery') {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(idbValidKey, client)
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey)
    },
    removeClient: async () => {
      await del(idbValidKey)
    },
  } satisfies Persister
}
```
