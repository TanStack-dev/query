---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:20:25.767Z'
id: createAsyncStoragePersister
title: createAsyncStoragePersister
---

## 安裝

此工具作為獨立套件提供，可透過 `'@tanstack/query-async-storage-persister'` 導入使用。

```bash
npm install @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```

或

```bash
pnpm add @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```

或

```bash
yarn add @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```

或

```bash
bun add @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```

## 使用方式

- 導入 `createAsyncStoragePersister` 函式
- 建立一個新的 asyncStoragePersister
  - 可傳入任何符合 `AsyncStorage` 介面的 `storage` - 以下範例使用 React Native 的 async-storage
- 使用 [`PersistQueryClientProvider`](./persistQueryClient.md#persistqueryclientprovider) 元件包裹你的應用程式

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 小時
    },
  },
})

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
})

const Root = () => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister: asyncStoragePersister }}
  >
    <App />
  </PersistQueryClientProvider>
)

export default Root
```

## 重試機制

重試機制與 [SyncStoragePersister](./createSyncStoragePersister.md) 相同，差別在於此處的重試可以是非同步的。你也可以使用所有預先定義的重試處理器。

## API

### `createAsyncStoragePersister`

呼叫此函式來建立一個 asyncStoragePersister，後續可與 `persistQueryClient` 搭配使用。

```tsx
createAsyncStoragePersister(options: CreateAsyncStoragePersisterOptions)
```

### `選項`

```tsx
interface CreateAsyncStoragePersisterOptions {
  /** 用於從快取設定與擷取項目的儲存端客戶端 */
  storage: AsyncStorage | undefined | null
  /** 將快取儲存至 localStorage 時使用的鍵名 */
  key?: string
  /** 為避免 localStorage 過度寫入，
   * 可傳入毫秒數來節流將快取儲存至磁碟的頻率 */
  throttleTime?: number
  /** 如何將資料序列化後儲存 */
  serialize?: (client: PersistedClient) => string
  /** 如何從儲存中反序列化資料 */
  deserialize?: (cachedString: string) => PersistedClient
  /** 出錯時如何重試持久化 **/
  retry?: AsyncPersistRetryer
}

interface AsyncStorage {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<unknown>
  removeItem: (key: string) => Promise<void>
}
```

預設選項為：

```tsx
{
  key = `REACT_QUERY_OFFLINE_CACHE`,
  throttleTime = 1000,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
}
```
