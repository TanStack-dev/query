---
source-updated-at: '2024-02-25T09:15:32.000Z'
translation-updated-at: '2025-05-06T04:45:26.192Z'
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

> 注意：此工具也包含在 `@tanstack/react-query-persist-client` 包中，因此如果已使用该包则无需单独安装。

## 使用方式

- 导入 `experimental_createPersister` 函数
- 创建一个新的 `experimental_createPersister`
  - 可传入任何符合 `AsyncStorage` 或 `Storage` 接口的 `storage` —— 以下示例使用 React Native 的 async-storage
- 将该 `persister` 作为选项传递给 Query。可通过两种方式实现：传递给 `QueryClient` 的 `defaultOptions`，或传递给任意 `useQuery` 钩子实例
  - 若将 `persister` 作为 `defaultOptions` 传递，所有查询将被持久化到提供的 `storage` 中。还可通过传递 `filters` 进一步缩小范围。与 `persistClient` 插件不同，此方式不会将整个 query client 作为单个项目持久化，而是分别持久化每个查询。查询哈希值将作为键名使用
  - 若将 `persister` 提供给单个 `useQuery` 钩子，则仅该查询会被持久化

这种方式无需存储整个 `QueryClient`，而是可选择应用中值得持久化的内容。每个查询都是延迟恢复（当查询首次使用时）和持久化（在每次 `queryFn` 运行后）的，因此无需节流处理。恢复查询后也会遵循 `staleTime` 设置，因此若数据被视为 `stale`，将在恢复后立即重新获取；若数据为 `fresh` 状态，则不会运行 `queryFn`。

从内存中垃圾回收查询**不会**影响持久化数据。这意味着可以缩短查询在内存中的保留时间以提高**内存效率**。当下次使用时，它们会直接从持久化存储中恢复。

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
        maxAge: 1000 * 60 * 60 * 12, // 12 小时
      }),
    },
  },
})
```

### 适配的默认值

`createPersister` 插件在技术上封装了 `queryFn`，因此若 `queryFn` 未运行则不会恢复。在此意义上，它充当了查询与网络之间的缓存层。因此，当使用 persister 时，`networkMode` 默认设为 `'offlineFirst'`，以便即使没有网络连接也能从持久化存储中恢复。

## API

### `experimental_createPersister`

```tsx
experimental_createPersister(options: StoragePersisterOptions)
```

#### `选项`

```tsx
export interface StoragePersisterOptions {
  /** 用于设置和检索缓存项的存储客户端
   * 对于 SSR 请传入 `undefined`
   */
  storage: AsyncStorage | Storage | undefined | null
  /**
   * 如何将数据序列化存储
   * @默认值 `JSON.stringify`
   */
  serialize?: (persistedQuery: PersistedQuery) => string
  /**
   * 如何从存储中反序列化数据
   * @默认值 `JSON.parse`
   */
  deserialize?: (cachedString: string) => PersistedQuery
  /**
   * 用于强制使现有缓存失效的唯一字符串
   * 若缓存不共享相同的破坏字符串则会被视为无效
   */
  buster?: string
  /**
   * 缓存允许的最大存活时间（毫秒）
   * 若发现持久化缓存超过此时长
   * 将被丢弃
   * @默认值 24 小时
   */
  maxAge?: number
  /**
   * 存储键的前缀
   * 存储键由前缀和查询哈希组成，格式为 `prefix-queryHash`
   */
  prefix?: string
  /**
   * 用于筛选哪些查询应被持久化的过滤器
   */
  filters?: QueryFilters
}

interface AsyncStorage {
  getItem: (key: string) => Promise<string | undefined | null>
  setItem: (key: string, value: string) => Promise<unknown>
  removeItem: (key: string) => Promise<void>
}
```

默认选项为：

```tsx
{
  prefix = 'tanstack-query',
  maxAge = 1000 * 60 * 60 * 24,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
}
```
