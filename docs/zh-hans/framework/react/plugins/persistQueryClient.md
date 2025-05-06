---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:43:46.632Z'
id: persistQueryClient
title: persistQueryClient
---
这是一套用于与“持久化工具 (persisters)”交互的工具集，它们能保存你的 `queryClient` 以供后续使用。不同的 **持久化工具 (persisters)** 可将客户端和缓存存储到多种不同的存储层中。

## 构建持久化工具

- [createSyncStoragePersister](./createSyncStoragePersister.md)
- [createAsyncStoragePersister](./createAsyncStoragePersister.md)
- [创建自定义持久化工具](#persisters)

## 工作原理

**重要提示** - 为确保持久化正常工作，你可能需要在 `QueryClient` 中传递 `gcTime` 值以覆盖默认的水合 (hydration) 设置（如上所示）。

如果在创建 `QueryClient` 实例时未设置此值，水合阶段将默认使用 `300000`（5 分钟），且存储的缓存会在 5 分钟不活动后被丢弃。这是默认的垃圾回收行为。

该值应设置为与 `persistQueryClient` 的 `maxAge` 选项相同或更高。例如，若 `maxAge` 为 24 小时（默认值），则 `gcTime` 应设为 24 小时或更长。若低于 `maxAge`，垃圾回收会提前触发并丢弃存储的缓存。

你也可以传递 `Infinity` 来完全禁用垃圾回收行为。

由于 JavaScript 的限制，最大允许的 `gcTime` 约为 24 天（详见[更多信息](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value)）。

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 小时
    },
  },
})
```

### 缓存清除 (Cache Busting)

有时你可能对应用或数据进行了更改，这些更改会立即使所有缓存数据失效。此时，你可以传递一个 `buster` 字符串选项。如果找到的缓存不包含该字符串，它将被丢弃。以下多个函数接受此选项：

```tsx
persistQueryClient({ queryClient, persister, buster: buildHash })
persistQueryClientSave({ queryClient, persister, buster: buildHash })
persistQueryClientRestore({ queryClient, persister, buster: buildHash })
```

### 移除机制

如果数据满足以下任一条件：

1. 已过期（见 `maxAge`）
2. 已清除（见 `buster`）
3. 出现错误（如 `throws ...`）
4. 为空（如 `undefined`）

持久化工具的 `removeClient()` 将被调用，缓存会立即被丢弃。

## API

### `persistQueryClientSave`

- 你的查询/突变会被 [`脱水 (dehydrated)`](../reference/hydration.md#dehydrate) 并通过你提供的持久化工具存储。
- `createSyncStoragePersister` 和 `createAsyncStoragePersister` 会对此操作进行节流，最多每 1 秒执行一次，以避免潜在的昂贵写入。查阅其文档以了解如何自定义节流时间。

你可以用它在选择的时刻显式持久化缓存。

```tsx
persistQueryClientSave({
  queryClient,
  persister,
  buster = '',
  dehydrateOptions = undefined,
})
```

### `persistQueryClientSubscribe`

每当 `queryClient` 的缓存发生变化时运行 `persistQueryClientSave`。例如：你可以在用户登录并勾选“记住我”时启动 `subscribe`。

- 它返回一个 `unsubscribe` 函数，可用于停止监听，结束对持久化缓存的更新。
- 如果希望在 `unsubscribe` 后清除持久化缓存，可以向 `persistQueryClientRestore` 发送一个新的 `buster`，这将触发持久化工具的 `removeClient` 函数并丢弃持久化缓存。

```tsx
persistQueryClientSubscribe({
  queryClient,
  persister,
  buster = '',
  dehydrateOptions = undefined,
})
```

### `persistQueryClientRestore`

- 尝试从持久化工具中 [`水合 (hydrate)`](../reference/hydration.md#hydrate) 先前脱水的查询/突变缓存，将其恢复到传入的查询客户端中。
- 如果找到的缓存比 `maxAge`（默认为 24 小时）更旧，它将被丢弃。此时间可根据需要自定义。

你可以用它在选择的时刻恢复缓存。

```tsx
persistQueryClientRestore({
  queryClient,
  persister,
  maxAge = 1000 * 60 * 60 * 24, // 24 小时
  buster = '',
  hydrateOptions = undefined,
})
```

### `persistQueryClient`

执行以下操作：

1. 立即恢复所有持久化缓存（见 [`persistQueryClientRestore`](#persistqueryclientrestore)）
2. 订阅查询缓存并返回 `unsubscribe` 函数（见 [`persistQueryClientSubscribe`](#persistqueryclientsubscribe)）。

此功能从 3.x 版本保留至今。

```tsx
persistQueryClient({
  queryClient,
  persister,
  maxAge = 1000 * 60 * 60 * 24, // 24 小时
  buster = '',
  hydrateOptions = undefined,
  dehydrateOptions = undefined,
})
```

### `Options`

所有可用选项如下：

```tsx
interface PersistQueryClientOptions {
  /** 需要持久化的 QueryClient */
  queryClient: QueryClient
  /** 用于存储和恢复缓存的持久化工具接口 */
  persister: Persister
  /** 缓存的最大允许存活时间（毫秒）。
   * 如果找到的持久化缓存比此时间更旧，
   * 它将 **静默** 被丢弃（默认为 24 小时） */
  maxAge?: number
  /** 用于强制使现有缓存失效的唯一字符串，
   * 如果它们不共享相同的 buster 字符串 */
  buster?: string
  /** 传递给 hydrate 函数的选项，
   * 不用于 `persistQueryClientSave` 或 `persistQueryClientSubscribe` */
  hydrateOptions?: HydrateOptions
  /** 传递给 dehydrate 函数的选项，
   * 不用于 `persistQueryClientRestore` */
  dehydrateOptions?: DehydrateOptions
}
```

实际上有三种接口可用：

- `PersistedQueryClientSaveOptions` 用于 `persistQueryClientSave` 和 `persistQueryClientSubscribe`（不使用 `hydrateOptions`）。
- `PersistedQueryClientRestoreOptions` 用于 `persistQueryClientRestore`（不使用 `dehydrateOptions`）。
- `PersistQueryClientOptions` 用于 `persistQueryClient`

## 与 React 一起使用

[persistQueryClient](#persistQueryClient) 会尝试恢复缓存并自动订阅后续更改，从而将你的客户端同步到提供的存储中。

然而，恢复是异步的，因为所有持久化工具本质上都是异步的。这意味着如果在恢复过程中渲染应用，可能会在查询挂载和获取同时发生时遇到竞态条件。

此外，如果在 React 组件生命周期之外订阅更改，你将无法取消订阅：

```tsx
// 🚨 永远不会停止同步订阅
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
})

// 🚨 与恢复同时发生
ReactDOM.createRoot(rootElement).render(<App />)
```

### PersistQueryClientProvider

针对此用例，你可以使用 `PersistQueryClientProvider`。它会根据 React 组件生命周期正确订阅/取消订阅，并确保在恢复过程中查询不会开始获取。查询仍会渲染，但它们会被置为 `fetchingState: 'idle'`，直到数据恢复完成。之后，除非恢复的数据足够新，否则它们会重新获取，同时也会尊重 `initialData`。它可以替代普通的 [QueryClientProvider](../reference/QueryClientProvider.md)：

```tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 小时
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

`PersistQueryClientProvider` 接受与 [QueryClientProvider](../reference/QueryClientProvider.md) 相同的 props，并额外包括：

- `persistOptions: PersistQueryClientOptions`
  - 所有可传递给 [persistQueryClient](#persistqueryclient) 的[选项](#options)，但不包括 `QueryClient` 本身
- `onSuccess?: () => Promise<unknown> | unknown`
  - 可选
  - 初始恢复完成时调用
  - 可用于 [resumePausedMutations](../../../reference/QueryClient.md#queryclientresumepausedmutations)
  - 如果返回 Promise，会等待其完成；恢复过程在此期间被视为进行中

### useIsRestoring

如果使用 `PersistQueryClientProvider`，还可以配合使用 `useIsRestoring` 钩子来检查当前是否正在进行恢复。`useQuery` 等函数内部也会检查此状态，以避免恢复和挂载查询之间的竞态条件。

## 持久化工具

### 持久化工具接口

持久化工具具有以下接口：

```tsx
export interface Persister {
  persistClient(persistClient: PersistedClient): Promisable<void>
  restoreClient(): Promisable<PersistedClient | undefined>
  removeClient(): Promisable<void>
}
```

持久化客户端条目具有以下接口：

```tsx
export interface PersistedClient {
  timestamp: number
  buster: string
  cacheState: any
}
```

你可以导入这些接口（以构建持久化工具）：

```tsx
import {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client'
```

### 构建持久化工具

你可以按需实现持久化。以下是一个构建 [Indexed DB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) 持久化工具的示例。相比 `Web Storage API`，Indexed DB 更快，存储容量超过 5MB，且不需要序列化。这意味着它能直接存储 JavaScript 原生类型，如 `Date` 和 `File`。

```tsx
import { get, set, del } from 'idb-keyval'
import {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client'

/**
 * 创建一个 Indexed DB 持久化工具
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
