---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:20:29.479Z'
id: createSyncStoragePersister
title: createSyncStoragePersister
---

## 安裝

此工具作為獨立套件提供，可透過 `'@tanstack/query-sync-storage-persister'` 導入使用。

```bash
npm install @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client
```

或

```bash
pnpm add @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client
```

或

```bash
yarn add @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client
```

或

```bash
bun add @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client
```

## 使用方式

- 導入 `createSyncStoragePersister` 函式
- 建立一個新的 syncStoragePersister
- 將其傳遞給 [`persistQueryClient`](./persistQueryClient.md) 函式

```tsx
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 小時
    },
  },
})

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
})
// const sessionStoragePersister = createSyncStoragePersister({ storage: window.sessionStorage })

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
})
```

## 重試機制

持久化可能會失敗，例如當資料大小超過儲存空間時。可以透過提供 `retry` 函式給 persister 來優雅處理錯誤。

重試函式會接收嘗試儲存的 `persistedClient`、`error` 以及 `errorCount` 作為輸入參數。它應返回一個*新的* `PersistedClient`，並用此新資料再次嘗試持久化。若返回 _undefined_，則不會再嘗試持久化。

```tsx
export type PersistRetryer = (props: {
  persistedClient: PersistedClient
  error: Error
  errorCount: number
}) => PersistedClient | undefined
```

### 預定義策略

預設情況下不會進行重試。你可以使用以下預定義策略來處理重試，這些策略可從 `'@tanstack/react-query-persist-client'` 導入：

- `removeOldestQuery`
  - 會返回一個新的 `PersistedClient`，其中已移除最舊的查詢。

```tsx
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  retry: removeOldestQuery,
})
```

## API

### `createSyncStoragePersister`

呼叫此函式以建立一個 syncStoragePersister，後續可與 `persistQueryClient` 搭配使用。

```tsx
createSyncStoragePersister(options: CreateSyncStoragePersisterOptions)
```

### `選項`

```tsx
interface CreateSyncStoragePersisterOptions {
  /** 用於從快取設定和擷取項目的儲存客戶端 (window.localStorage 或 window.sessionStorage) */
  storage: Storage | undefined | null
  /** 儲存快取時使用的鍵名 */
  key?: string
  /** 為避免頻繁寫入，
   * 可傳入毫秒時間來節流儲存快取至磁碟的頻率 */
  throttleTime?: number
  /** 如何將資料序列化後儲存 */
  serialize?: (client: PersistedClient) => string
  /** 如何從儲存中反序列化資料 */
  deserialize?: (cachedString: string) => PersistedClient
  /** 出錯時如何重試持久化 **/
  retry?: PersistRetryer
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

#### `serialize` 與 `deserialize` 選項

`localStorage` 能儲存的資料量有限。若需儲存更多資料，可覆寫 `serialize` 和 `deserialize` 函式，使用如 [lz-string](https://github.com/pieroxy/lz-string/) 這類函式庫來壓縮與解壓縮資料。

```tsx
import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

import { compress, decompress } from 'lz-string'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
})

persistQueryClient({
  queryClient: queryClient,
  persister: createSyncStoragePersister({
    storage: window.localStorage,
    serialize: (data) => compress(JSON.stringify(data)),
    deserialize: (data) => JSON.parse(decompress(data)),
  }),
  maxAge: Infinity,
})
```
