---
source-updated-at: '2024-05-11T22:31:28.000Z'
translation-updated-at: '2025-05-06T05:31:54.871Z'
id: createPersister
title: createPersister (实验性)
---

## 安装

该工具作为一个独立包提供，可通过 `'@tanstack/query-persist-client-core'` 导入使用。

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

## 使用方式

- 导入 `experimental_createPersister` 函数
- 创建一个新的 `experimental_createPersister`
  - 可传入任何符合 `AsyncStorage` 或 `Storage` 接口的 `storage` 对象
- 将该 `persister` 作为选项传递给 Query。可通过两种方式实现：
  - 传递给 `QueryClient` 的 `defaultOptions`
  - 或传递给任意 `useQuery` 钩子实例
  - 若作为 `defaultOptions` 传递，所有查询将被持久化到指定的 `storage`。还可通过 `filters` 进一步筛选。与 `persistClient` 插件不同，此方式不会将整个 QueryClient 作为单个条目持久化，而是分别持久化每个查询，并使用查询哈希 (query hash) 作为键名
  - 若提供给单个 `useQuery` 钩子，则仅该查询会被持久化

这种方式无需存储整个 `QueryClient`，而是由您决定应用中哪些数据值得持久化。每个查询会按需恢复（首次使用时）和持久化（每次 `queryFn` 执行后），因此无需节流处理。恢复查询后仍会遵循 `staleTime` 设置——若数据被视为过期 (stale)，恢复后将立即重新获取；若数据仍新鲜 (fresh)，则不会执行 `queryFn`。

从内存中垃圾回收查询**不会**影响持久化数据。这意味着可以缩短查询在内存中的保留时间以提升**内存效率**，当下次使用时直接从持久化存储中恢复即可。

```tsx
import { QueryClient } from '@tanstack/vue-query'
import { experimental_createPersister } from '@tanstack/query-persist-client-core'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 30, // 30 秒
      persister: experimental_createPersister({
        storage: localStorage,
        maxAge: 1000 * 60 * 60 * 12, // 12 小时
      }),
    },
  },
})
```

### 适配的默认行为

`createPersister` 插件在技术上封装了 `queryFn`，因此若 `queryFn` 未执行则不会恢复数据。这种方式使其成为 Query 与网络之间的缓存层。因此，当使用持久化器时，`networkMode` 默认设为 `'offlineFirst'`，以确保即使无网络连接也能从持久化存储恢复数据。

## API

### `experimental_createPersister`

```tsx
experimental_createPersister(options: StoragePersisterOptions)
```

#### `配置项`

```tsx
export interface StoragePersisterOptions {
  /** 用于缓存数据存取操作的存储客户端。
   * SSR 场景请传入 `undefined`。
   */
  storage: AsyncStorage | Storage | undefined | null
  /**
   * 数据序列化方法。
   * @默认值 `JSON.stringify`
   */
  serialize?: (persistedQuery: PersistedQuery) => string
  /**
   * 数据反序列化方法。
   * @默认值 `JSON.parse`
   */
  deserialize?: (cachedString: string) => PersistedQuery
  /**
   * 用于强制使旧缓存失效的唯一字符串，
   * 当与当前字符串不匹配时缓存将被丢弃
   */
  buster?: string
  /**
   * 缓存的最大允许存活时间（毫秒）。
   * 若发现持久化缓存超过此时限，
   * 将被自动丢弃
   * @默认值 24 小时
   */
  maxAge?: number
  /**
   * 存储键名的前缀。
   * 存储键名由前缀和查询哈希组成，格式为 `prefix-queryHash`。
   */
  prefix?: string
  /**
   * 用于筛选需要持久化的查询。
   */
  filters?: QueryFilters
}

interface AsyncStorage {
  getItem: (key: string) => Promise<string | undefined | null>
  setItem: (key: string, value: string) => Promise<unknown>
  removeItem: (key: string) => Promise<void>
}
```

默认配置为：

```tsx
{
  prefix = 'tanstack-query',
  maxAge = 1000 * 60 * 60 * 24,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
}
```
