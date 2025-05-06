---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:46:58.579Z'
id: createAsyncStoragePersister
title: createAsyncStoragePersister
---

## 安装

该工具作为一个独立包提供，可通过 `'@tanstack/query-async-storage-persister'` 导入使用。

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

- 导入 `createAsyncStoragePersister` 函数
- 创建一个新的 asyncStoragePersister
  - 可传入任何符合 `AsyncStorage` 接口的 `storage` 对象 - 以下示例使用 React Native 的 async-storage
- 使用 [`PersistQueryClientProvider`](./persistQueryClient.md#persistqueryclientprovider) 组件包裹你的应用

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 小时
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

## 重试机制

重试逻辑与 [SyncStoragePersister](./createSyncStoragePersister.md) 相同，但支持异步操作。你也可以使用所有预定义的重试处理器。

## API 接口

### `createAsyncStoragePersister`

调用此函数创建 asyncStoragePersister，后续可与 `persistQueryClient` 配合使用。

```tsx
createAsyncStoragePersister(options: CreateAsyncStoragePersisterOptions)
```

### 配置选项

```tsx
interface CreateAsyncStoragePersisterOptions {
  /** 用于缓存存取操作的存储客户端 */
  storage: AsyncStorage | undefined | null
  /** 本地存储缓存时使用的键名 */
  key?: string
  /** 为避免频繁写入本地存储，
   * 可设置节流时间（毫秒）来控制缓存写入频率 */
  throttleTime?: number
  /** 数据序列化方法 */
  serialize?: (client: PersistedClient) => string
  /** 数据反序列化方法 */
  deserialize?: (cachedString: string) => PersistedClient
  /** 错误时的持久化重试策略 **/
  retry?: AsyncPersistRetryer
}

interface AsyncStorage {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<unknown>
  removeItem: (key: string) => Promise<void>
}
```

默认配置为：

```tsx
{
  key = `REACT_QUERY_OFFLINE_CACHE`,
  throttleTime = 1000,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
}
```
