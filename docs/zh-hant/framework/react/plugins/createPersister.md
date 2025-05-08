---
source-updated-at: '2025-04-10T12:02:45.000Z'
translation-updated-at: '2025-05-08T20:20:41.005Z'
id: createPersister
title: createPersister (實驗性)
---

## 安裝

此工具以獨立套件形式提供，可透過 `'@tanstack/query-persist-client-core'` 匯入使用。

```bash
npm install @tanstack/query-persist-client-core
```

或

```bash
pnpm add @tanstack/query-persist-client-core
```

或

```bash
yarn add @tanstack/query-persist-client-core
```

或

```bash
bun add @tanstack/query-persist-client-core
```

> 注意：此工具也包含在 `@tanstack/react-query-persist-client` 套件中，若您已使用該套件則無需另行安裝。

## 使用方式

- 匯入 `experimental_createPersister` 函式
- 建立一個新的 `experimental_createPersister`
  - 可傳入任何符合 `AsyncStorage` 或 `Storage` 介面的 `storage` - 以下範例使用 React Native 的 async-storage
- 將該 `persister` 作為選項傳遞給您的 Query。可透過傳遞至 `QueryClient` 的 `defaultOptions` 或任何 `useQuery` hook 實例來實現
  - 若將此 `persister` 設為 `defaultOptions`，所有查詢將被持久化至提供的 `storage` 中。您還可透過傳遞 `filters` 進一步縮小範圍。與 `persistClient` 插件不同，此方式不會將整個 query client 作為單一項目持久化，而是分別持久化每個查詢。查詢雜湊 (query hash) 將被用作鍵名
  - 若將此 `persister` 提供給單一 `useQuery` hook，則僅該查詢會被持久化
- 注意：`queryClient.setQueryData()` 操作不會被持久化，這意味著若您在查詢失效前執行樂觀更新 (optimistic update) 並重新整理頁面，對查詢資料的變更將會遺失。詳見 https://github.com/TanStack/query/issues/6310

透過此方式，您無需儲存整個 `QueryClient`，而是可選擇應用程式中值得持久化的內容。每個查詢會以懶載入方式還原 (當查詢首次使用時) 並持久化 (在每次 `queryFn` 執行後)，因此無需進行節流 (throttle)。還原查詢後仍會遵守 `staleTime`，因此若資料被視為過時 (stale)，將在還原後立即重新取得。若資料為新鮮 (fresh)，則 `queryFn` 不會執行。

從記憶體中垃圾回收 (garbage collect) 查詢**不會**影響持久化的資料。這意味著查詢可在記憶體中保留較短時間以提升**記憶體效率**。當下次使用時，它們會直接從持久化儲存中還原。

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage'
import { QueryClient } from '@tanstack/react-query'
import { experimental_createPersister } from '@tanstack/query-persist-client-core'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 30, // 30 秒
      persister: experimental_createPersister({
        storage: AsyncStorage,
        maxAge: 1000 * 60 * 60 * 12, // 12 小時
      }),
    },
  },
})
```

### 調整後的預設行為

`createPersister` 插件在技術上會包裝 `queryFn`，因此若 `queryFn` 未執行則不會還原。在此機制下，它扮演著查詢與網路之間的快取層。因此，當使用 persister 時，`networkMode` 預設為 `'offlineFirst'`，以便即使無網路連線時也能從持久化儲存中還原。

## API

### `experimental_createPersister`

```tsx
experimental_createPersister(options: StoragePersisterOptions)
```

#### `選項`

```tsx
export interface StoragePersisterOptions {
  /** 用於從快取設定與取得項目的儲存客戶端。
   * 對於 SSR 請傳入 `undefined`。
   */
  storage: AsyncStorage | Storage | undefined | null
  /**
   * 如何將資料序列化至儲存。
   * @預設值 `JSON.stringify`
   */
  serialize?: (persistedQuery: PersistedQuery) => string
  /**
   * 如何從儲存反序列化資料。
   * @預設值 `JSON.parse`
   */
  deserialize?: (cachedString: string) => PersistedQuery
  /**
   * 用於強制使現有快取失效的唯一字串，
   * 若它們未共用相同的 buster 字串
   */
  buster?: string
  /**
   * 快取允許的最大存留時間 (毫秒)。
   * 若發現持久化的快取超過此時間，
   * 將被捨棄
   * @預設值 24 小時
   */
  maxAge?: number
  /**
   * 儲存鍵名前綴。
   * 儲存鍵名由前綴與查詢雜湊組成，格式為 `prefix-queryHash`。
   */
  prefix?: string
  /**
   * 用於篩選應持久化的查詢。
   */
  filters?: QueryFilters
}

interface AsyncStorage {
  getItem: (key: string) => Promise<string | undefined | null>
  setItem: (key: string, value: string) => Promise<unknown>
  removeItem: (key: string) => Promise<void>
}
```

預設選項為：

```tsx
{
  prefix = 'tanstack-query',
  maxAge = 1000 * 60 * 60 * 24,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
}
```
