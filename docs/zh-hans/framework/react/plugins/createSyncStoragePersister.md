---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:44:34.356Z'
id: createSyncStoragePersister
title: createSyncStoragePersister
---

## 安装

该工具作为独立包提供，可通过 `'@tanstack/query-sync-storage-persister'` 导入使用。

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

- 导入 `createSyncStoragePersister` 函数
- 创建新的 syncStoragePersister 实例
- 将其传递给 [`persistQueryClient`](./persistQueryClient.md) 函数

```tsx
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 小时
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

## 重试机制

持久化可能失败（例如当数据大小超出存储空间时）。通过向 persister 提供 `retry` 函数可以优雅处理错误。

重试函数接收尝试保存的 `persistedClient`、发生的 `error` 以及重试次数 `errorCount` 作为输入。它应返回一个*新的* `PersistedClient` 用于再次尝试持久化。若返回 _undefined_ 则表示不再尝试。

```tsx
export type PersistRetryer = (props: {
  persistedClient: PersistedClient
  error: Error
  errorCount: number
}) => PersistedClient | undefined
```

### 预定义策略

默认情况下不会进行重试。您可以使用以下预定义策略处理重试（需从 `'@tanstack/react-query-persist-client'` 导入）：

- `removeOldestQuery`
  - 返回移除最旧查询后的新 `PersistedClient`

```tsx
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  retry: removeOldestQuery,
})
```

## API 接口

### `createSyncStoragePersister`

调用此函数创建 syncStoragePersister 实例，后续可配合 `persistQueryClient` 使用。

```tsx
createSyncStoragePersister(options: CreateSyncStoragePersisterOptions)
```

### 配置选项

```tsx
interface CreateSyncStoragePersisterOptions {
  /** 用于缓存存取的存储客户端 (window.localStorage 或 window.sessionStorage) */
  storage: Storage | undefined | null
  /** 存储缓存时使用的键名 */
  key?: string
  /** 为避免频繁操作，
   * 可设置节流时间（毫秒）来控制存储频率 */
  throttleTime?: number
  /** 数据序列化方法 */
  serialize?: (client: PersistedClient) => string
  /** 数据反序列化方法 */
  deserialize?: (cachedString: string) => PersistedClient
  /** 错误时的重试策略 **/
  retry?: PersistRetryer
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

#### `serialize` 与 `deserialize` 选项

`localStorage` 存在存储容量限制。如需存储更多数据，可覆写这两个函数，使用 [lz-string](https://github.com/pieroxy/lz-string/) 等库进行数据压缩/解压。

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
