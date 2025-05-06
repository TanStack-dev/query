---
source-updated-at: '2025-03-31T09:06:11.000Z'
translation-updated-at: '2025-05-06T04:15:18.700Z'
id: migrating-to-react-query-4
title: 迁移到 v4
---

## 重大变更

v4 是一个主要版本，需要注意以下破坏性变更：

### react-query 现已更名为 @tanstack/react-query

需要卸载/安装依赖并更改导入路径：

```
npm uninstall react-query
npm install @tanstack/react-query
npm install @tanstack/react-query-devtools
```

```tsx
- import { useQuery } from 'react-query' // [!code --]
- import { ReactQueryDevtools } from 'react-query/devtools' // [!code --]

+ import { useQuery } from '@tanstack/react-query' // [!code ++]
+ import { ReactQueryDevtools } from '@tanstack/react-query-devtools' // [!code ++]
```

#### 代码迁移工具 (Codemod)

为简化导入迁移，v4 提供了代码迁移工具。

> 该工具会尽力协助迁移破坏性变更，但请仔细检查生成代码！某些边缘情况可能无法被工具识别，请留意日志输出。

可通过以下命令之一运行迁移：

针对 `.js` 或 `.jsx` 文件：

```
npx jscodeshift ./path/to/src/ \
  --extensions=js,jsx \
  --transform=./node_modules/@tanstack/react-query/codemods/v4/replace-import-specifier.js
```

针对 `.ts` 或 `.tsx` 文件：

```
npx jscodeshift ./path/to/src/ \
  --extensions=ts,tsx \
  --parser=tsx \
  --transform=./node_modules/@tanstack/react-query/codemods/v4/replace-import-specifier.js
```

注意：对于 `TypeScript` 必须使用 `tsx` 作为解析器，否则迁移可能无法正确应用！

**注意：** 迁移后可能会破坏代码格式，请记得运行 `prettier` 和/或 `eslint` 进行格式化。

**注意：** 该工具仅修改导入语句——仍需手动安装独立的开发工具包。

### 查询键 (Query Keys) 和变更键 (Mutation Keys) 必须为数组

v3 中查询键和变更键可以是字符串或数组。React Query 内部始终使用数组键，有时会暴露给使用者。例如在 `queryFn` 中，为便于使用[默认查询函数](./default-query-function.md)，获取的键始终是数组。

但此设计未在所有 API 中贯彻。例如使用[查询过滤器](./filters.md)的 `predicate` 函数时，获取的是原始查询键。若混合使用数组和字符串键，此类函数将难以工作。全局回调也存在同样问题。

为统一所有 API，现强制要求所有键必须为数组：

```tsx
;-useQuery('todos', fetchTodos) + // [!code --]
  useQuery(['todos'], fetchTodos) // [!code ++]
```

#### 代码迁移工具

为简化迁移，提供了专用迁移工具。

> 该工具会尽力协助迁移，但请仔细检查生成代码！某些边缘情况可能无法被工具识别，请留意日志输出。

可通过以下命令之一运行迁移：

针对 `.js` 或 `.jsx` 文件：

```
npx jscodeshift ./path/to/src/ \
  --extensions=js,jsx \
  --transform=./node_modules/@tanstack/react-query/codemods/v4/key-transformation.js
```

针对 `.ts` 或 `.tsx` 文件：

```
npx jscodeshift ./path/to/src/ \
  --extensions=ts,tsx \
  --parser=tsx \
  --transform=./node_modules/@tanstack/react-query/codemods/v4/key-transformation.js
```

注意：对于 `TypeScript` 必须使用 `tsx` 作为解析器。

**注意：** 迁移后可能会破坏代码格式，请记得运行 `prettier` 和/或 `eslint` 进行格式化。

### 移除 idle 状态

为支持更好的离线功能引入新的[获取状态 (fetchStatus)](./queries.md#fetchstatus)后，`idle` 状态变得冗余，因为 `fetchStatus: 'idle'` 能更准确地描述相同状态。详见[为何需要两种状态](./queries.md#why-two-different-states)。

主要影响尚未获取任何 `data` 的 `disabled` 查询，这些查询之前处于 `idle` 状态：

```tsx
- status: 'idle' // [!code --]
+ status: 'loading'  // [!code ++]
+ fetchStatus: 'idle' // [!code ++]
```

另请参阅[依赖查询指南](./dependent-queries.md)

#### 禁用查询 (disabled queries)

因此变更，禁用查询（包括临时禁用）将初始处于 `loading` 状态。为简化迁移，特别是需要显示加载指示器时，可检查 `isInitialLoading` 而非 `isLoading`：

```tsx
;-isLoading + // [!code --]
  isInitialLoading // [!code ++]
```

参见[禁用查询指南](./disabling-queries.md#isInitialLoading)

### `useQueries` 新 API

`useQueries` 钩子现在接受包含 `queries` 属性的对象作为输入。`queries` 属性值是一个查询数组（该数组与 v3 中直接传入 `useQueries` 的数组相同）。

```tsx
;-useQueries([
  { queryKey1, queryFn1, options1 },
  { queryKey2, queryFn2, options2 },
]) + // [!code --]
  useQueries({
    queries: [
      { queryKey1, queryFn1, options1 },
      { queryKey2, queryFn2, options2 },
    ],
  }) // [!code ++]
```

### 成功查询中 undefined 不再作为合法缓存值

为实现通过返回 `undefined` 中止更新，现规定 `undefined` 不是合法缓存值。这与 React Query 其他设计一致，例如从[初始数据函数](./initial-query-data.md#initial-data-function)返回 `undefined` 也不会设置数据。

此外，在 `queryFn` 中添加日志容易产生 `Promise<void>`：

```tsx
useQuery(['key'], () =>
  axios.get(url).then((result) => console.log(result.data)),
)
```

现在类型层面已禁止此操作；运行时 `undefined` 会转换为 _失败的 Promise_，意味着会收到 `error`，开发模式下还会在控制台记录此错误。

### 默认情况下查询和变更需要网络连接

请阅读关于在线/离线支持的[新功能公告](#proper-offline-support)及专用[网络模式](./network-mode.md)页面。

虽然 React Query 是可用于任何 Promise 的异步状态管理器，但最常用于数据获取场景。因此默认情况下，若无网络连接，查询和变更将处于 `paused` 状态。如需恢复之前行为，可全局设置 `networkMode: offlineFirst`：

```tsx
new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
})
```

### `notifyOnChangeProps` 不再接受 `"tracked"` 值

`notifyOnChangeProps` 选项不再接受 `"tracked"` 值，改为默认启用属性跟踪。所有使用 `notifyOnChangeProps: "tracked"` 的查询应移除此选项。

如需模拟 v3 默认行为（查询变化时重新渲染），现可通过设置 `notifyOnChangeProps: "all"` 来禁用智能跟踪优化。

### 移除 `notifyOnChangePropsExclusion`

v4 中 `notifyOnChangeProps` 默认采用 v3 的 `"tracked"` 行为而非 `undefined`。由于 `"tracked"` 现为默认行为，此配置选项已无存在必要。

### `cancelRefetch` 行为统一

`cancelRefetch` 选项现在可传递给所有主动获取查询的方法：

- `queryClient.refetchQueries`
- `queryClient.invalidateQueries`
- `queryClient.resetQueries`
- `useQuery` 返回的 `refetch`
- `useInfiniteQuery` 返回的 `fetchNextPage` 和 `fetchPreviousPage`

除 `fetchNextPage` 和 `fetchPreviousPage` 外，此标志原默认值为 `false`，这会导致不一致问题：若已有缓慢请求在进行中，调用 `refetchQueries` 或 `invalidateQueries` 可能无法获取最新结果，因为此次重获取会被跳过。

我们认为代码主动触发的查询重获取应默认重启请求。

因此现在所有相关方法的此标志默认值改为 _true_。这也意味着连续两次调用 `refetchQueries` 而不等待时，会取消第一次请求并重启第二次请求：

```
queryClient.refetchQueries({ queryKey: ['todos'] })
// 这将中止前次重获取并启动新请求
queryClient.refetchQueries({ queryKey: ['todos'] })
```

可通过显式传递 `cancelRefetch:false` 禁用此行为：

```
queryClient.refetchQueries({ queryKey: ['todos'] })
// 前次重获取不会被中止——此次调用会被忽略
queryClient.refetchQueries({ queryKey: ['todos'] }, { cancelRefetch: false })
```

> 注意：自动触发的获取（如查询挂载或窗口聚焦重获取）行为不变。

### 查询过滤器 (Query Filters)

[查询过滤器](./filters.md)是匹配查询的条件对象。历史上过滤器选项多为布尔标志组合，但这可能导致矛盾状态。例如：

```
active?: boolean
  - true 时匹配活跃查询
  - false 时匹配非活跃查询
inactive?: boolean
  - true 时匹配非活跃查询
  - false 时匹配活跃查询
```

这些标志组合使用时效果不佳，因为它们互斥。双 `false` 配置理论上应匹配所有查询或没有查询，语义不明确。

v4 中将这些过滤器合并为单一选项以明确意图：

```tsx
- active?: boolean // [!code --]
- inactive?: boolean // [!code --]
+ type?: 'active' | 'inactive' | 'all' // [!code ++]
```

默认值为 `all`，可选择仅匹配 `active` 或 `inactive` 查询。

#### refetchActive / refetchInactive

[queryClient.invalidateQueries](../../../reference/QueryClient.md#queryclientinvalidatequeries) 原有两个类似标志：

```
refetchActive: Boolean
  - 默认 true
  - false 时，匹配重获取条件且正通过 useQuery 等渲染的活跃查询不会在后台重获取，仅标记为失效
refetchInactive: Boolean
  - 默认 false
  - true 时，匹配重获取条件且未渲染的非活跃查询会标记为失效并在后台重获取
```

出于相同原因，这些标志也被合并：

```tsx
- refetchActive?: boolean // [!code --]
- refetchInactive?: boolean // [!code --]
+ refetchType?: 'active' | 'inactive' | 'all' | 'none' // [!code ++]
```

此标志默认 `active`（因 `refetchActive` 原默认 `true`）。为支持完全不重获取的场景，新增 `none` 选项。

### `setQueryData` 不再触发 `onSuccess`

此前设计令许多人困惑：若在 `onSuccess` 内调用 `setQueryData` 会导致无限循环。与 `staleTime` 结合使用时也常引发问题——若数据仅从缓存读取，`onSuccess` 不会被调用。

与 `onError` 和 `onSettled` 类似，`onSuccess` 回调现与请求绑定。无请求 -> 无回调。

如需监听 `data` 字段变化，建议使用 `useEffect` 并将 `data` 加入依赖数组。React Query 通过结构共享确保数据稳定，效果函数不会在每次后台重获取时执行，仅在数据实际变化时触发：

```
const { data } = useQuery({ queryKey, queryFn })
React.useEffect(() => mySideEffectHere(data), [data])
```

### `persistQueryClient` 及相关持久化插件结束实验状态并更名

插件 `createWebStoragePersistor` 和 `createAsyncStoragePersistor` 分别更名为 [`createSyncStoragePersister`](../plugins/createSyncStoragePersister.md) 和 [`createAsyncStoragePersister`](../plugins/createAsyncStoragePersister.md)。`persistQueryClient` 中的 `Persistor` 接口也更名为 `Persister`。更名动机参见[此讨论](https://english.stackexchange.com/questions/206893/persister-or-persistor)。

由于这些插件已结束实验状态，导入路径也已更新：

```tsx
- import { persistQueryClient } from 'react-query/persistQueryClient-experimental' // [!code --]
- import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental' // [!code --]
- import { createAsyncStoragePersistor } from 'react-query/createAsyncStoragePersistor-experimental' // [!code --]

+ import { persistQueryClient } from '@tanstack/react-query-persist-client' // [!code ++]
+ import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister' // [!code ++]
+ import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'  // [!code ++]
```

### 不再支持 Promise 的 `cancel` 方法

[旧版 `cancel` 方法](./query-cancellation.md#old-cancel-function)允许在 Promise 上定义 `cancel` 函数以实现查询取消，现已被移除。建议使用[新版 API](./query-cancellation.md)（v3.30.0 引入），其内部使用 [`AbortController` API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) 并提供 [`AbortSignal` 实例](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)支持查询取消。

### TypeScript

现在需要 TypeScript v4.1 或更高版本

### 支持的浏览器

v4 起 React Query 针对现代浏览器优化。我们已更新 browserslist 配置以生成更现代、高效且更小的包。具体要求参见[安装说明](../../installation#requirements)。

### 移除 `setLogger`

原先可通过 `setLogger` 全局修改日志记录器。v4 中此功能改为在创建 `QueryClient` 时通过可选字段配置。

```tsx
- import { QueryClient, setLogger } from 'react-query'; // [!code --]
+ import { QueryClient } from '@tanstack/react-query'; // [!code ++]

- setLogger(customLogger) // [!code --]
- const queryClient = new QueryClient(); // [!code --]
+ const queryClient = new QueryClient({ logger: customLogger }) // [!code ++]
```

### 服务端默认禁用手动垃圾回收

v3 中 React Query 默认缓存查询结果 5 分钟，然后手动垃圾回收。此默认行为也应用于服务端 React Query。

这导致高内存消耗和进程挂起等待垃圾回收完成。v4 中服务端 `cacheTime` 默认改为 `Infinity`，相当于禁用手动垃圾回收（NodeJS 进程会在请求完成后自动清理）。

此变更仅影响服务端 React Query 用户（如 Next.js）。若手动设置 `cacheTime` 则不受影响（但建议保持行为一致）。

### 生产环境日志记录

v4 起，生产环境下 react-query 不再将错误（如获取失败）记录到控制台，因之前常引起困惑。开发模式下错误仍会显示。

### ESM 支持

React Query 现在支持 [package.json `"exports"`](https://nodejs.org/api/packages.html#exports)，完全兼容 Node 的原生 CommonJS 和 ESM 解析。预计对多数用户无破坏性影响，但此变更限制只能导入官方支持的入口文件。

### 统一通知事件 (NotifyEvents)

手动订阅 `QueryCache` 始终会收到 `QueryCacheNotifyEvent`，但 `MutationCache` 之前无此设计。现统一行为并调整事件名称：

#### QueryCacheNotifyEvent

```tsx
- type: 'queryAdded' // [!code --]
+ type: 'added' // [!code ++]
- type: 'queryRemoved' // [!code --]
+ type: 'removed' // [!code ++]
- type: 'queryUpdated' // [!code --]
+ type: 'updated' // [!code ++]
```

#### MutationCacheNotifyEvent

`MutationCacheNotifyEvent` 使用与 `QueryCacheNotifyEvent` 相同的类型。

> 注意：仅当通过 `queryCache.subscribe` 或 `mutationCache.subscribe` 手动订阅缓存时相关

### 移除独立的水合 (hydration) 导出

自 [3.22.0](https://github.com/tannerlinsley/react-query/releases/tag/v3.22.0) 版本起，水合工具已移至 React Query 核心。v3 中仍可从 `react-query/hydration` 导入旧导出，但 v4 中已移除。

```tsx
- import { dehydrate, hydrate, useHydrate, Hydrate } from 'react-query/hydration' // [!code --]
+ import { dehydrate, hydrate, useHydrate, Hydrate } from '@tanstack/react-query' // [!code ++]
```

### 移除 `queryClient`、`query` 和 `mutation` 的未公开方法

`QueryClient` 上的 `cancelMutations` 和 `executeMutation` 方法未在文档中说明且内部未使用，故已移除。由于这只是对 `mutationCache` 方法的封装，仍可通过 `executeMutation` 的功能：

```tsx
- executeMutation< // [!code --]
-   TData = unknown, // [!code --]
-   TError = unknown, // [!code --]
-   TVariables = void, // [!code --]
-   TContext = unknown // [!code --]
- >( // [!code --]
-   options: MutationOptions<TData, TError, TVariables, TContext> // [!code --]
- ): Promise<TData> { // [!code --]
-   return this.mutationCache.build(this, options).execute() // [!code --]
- } // [!code --]
```

此外，移除未使用的 `query.setDefaultOptions`。移除 `mutation.cancel` 因其实际未取消请求。

### `src/react` 目录更名为 `src/reactjs`

原先包含从 `react` 模块导入的 `react` 目录在某些 Jest 配置下会导致测试报
