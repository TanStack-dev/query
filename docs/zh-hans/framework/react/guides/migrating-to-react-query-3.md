---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:15:18.467Z'
id: migrating-to-react-query-3
title: 迁移到 v3
---
以下是翻译内容：

React Query 的早期版本已经非常出色，为库带来了许多令人惊叹的新特性、更多魔法以及整体上更优的体验。它们也推动了该库的大规模采用，同时为库带来了大量优化建议（问题/贡献），并揭示了一些需要进一步打磨以使库更完善的地方。v3 版本正是这些打磨的成果。

## 概述

- 更具扩展性和可测试性的缓存配置
- 更好的服务端渲染 (SSR) 支持
- 随处可用的数据延迟（原 usePaginatedQuery）功能
- 双向无限查询 (Infinite Queries)
- 查询数据选择器 (Query data selectors)！
- 使用前可完全配置查询和/或变更的默认选项
- 更细粒度的可选渲染优化
- 新增 `useQueries` 钩子！（支持可变长度的并行查询执行）
- `useIsFetching()` 钩子支持查询过滤器！
- 变更操作的重试/离线/重放支持
- 在 React 外部观察查询/变更
- 可在任意位置使用 React Query 的核心逻辑！
- 通过 `react-query/devtools` 集成的开发者工具
- 缓存持久化至 web 存储（实验性功能，通过 `react-query/persistQueryClient-experimental` 和 `react-query/createWebStoragePersistor-experimental` 实现）

## 重大变更

### `QueryCache` 已被拆分为 `QueryClient` 和底层的 `QueryCache` 及 `MutationCache` 实例

`QueryCache` 包含所有查询，`MutationCache` 包含所有变更，而 `QueryClient` 可用于设置配置并与它们交互。

这带来了一些优势：

- 允许不同类型的缓存
- 不同配置的多个客户端可以共享同一个缓存
- 客户端可用于跟踪查询，这在 SSR 上实现共享缓存时非常有用
- 客户端 API 更专注于通用场景
- 更容易测试各个组件

创建 `new QueryClient()` 时，如果没有提供，则会自动创建 `QueryCache` 和 `MutationCache`。

```tsx
import { QueryClient } from 'react-query'

const queryClient = new QueryClient()
```

### `ReactQueryConfigProvider` 和 `ReactQueryCacheProvider` 已被 `QueryClientProvider` 取代

现在可以在 `QueryClient` 中指定查询和变更的默认选项：

**注意：现在使用 defaultOptions 而非 defaultConfig**

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 查询选项
    },
    mutations: {
      // 变更选项
    },
  },
})
```

`QueryClientProvider` 组件现在用于将 `QueryClient` 连接到你的应用：

```tsx
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

function App() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

### 默认的 `QueryCache` 已移除。这次是真的！

如之前弃用通知所述，主包中不再创建或导出默认的 `QueryCache`。你必须通过 `new QueryClient()` 或 `new QueryCache()`（然后可以传递给 `new QueryClient({ queryCache })`）自行创建。

### 已移除废弃的 `makeQueryCache` 工具函数

虽然等待已久，但它终于被移除了 :)

### `QueryCache.prefetchQuery()` 已移至 `QueryClient.prefetchQuery()`

新的 `QueryClient.prefetchQuery()` 函数是异步的，但不会返回查询的数据。如果需要数据，请使用新的 `QueryClient.fetchQuery()` 函数。

```tsx
// 预取查询：
await queryClient.prefetchQuery('posts', fetchPosts)

// 获取查询：
try {
  const data = await queryClient.fetchQuery('posts', fetchPosts)
} catch (error) {
  // 错误处理
}
```

### `ReactQueryErrorResetBoundary` 和 `QueryCache.resetErrorBoundaries()` 已被 `QueryErrorResetBoundary` 和 `useQueryErrorResetBoundary()` 取代。

这些新功能提供了与之前相同的体验，但增加了选择要重置的组件树的控制能力。更多信息请参阅：

- [QueryErrorResetBoundary](../reference/QueryErrorResetBoundary.md)
- [useQueryErrorResetBoundary](../reference/useQueryErrorResetBoundary.md)

### `QueryCache.getQuery()` 已被 `QueryCache.find()` 取代

现在应使用 `QueryCache.find()` 从缓存中查找单个查询。

### `QueryCache.getQueries()` 已移至 `QueryCache.findAll()`

现在应使用 `QueryCache.findAll()` 从缓存中查找多个查询。

### `QueryCache.isFetching` 已移至 `QueryClient.isFetching()`

**注意：现在是一个函数而非属性**

### `useQueryCache` 钩子已被 `useQueryClient` 钩子取代

它返回组件树中提供的 `queryClient`，除了重命名外基本无需调整。

### 查询键的部分不再自动展开到查询函数中

现在推荐使用内联函数将参数传递给查询函数：

```tsx
// 旧方式
useQuery(['post', id], (_key, id) => fetchPost(id))

// 新方式
useQuery(['post', id], () => fetchPost(id))
```

如果仍坚持不使用内联函数，可以使用新传递的 `QueryFunctionContext`：

```tsx
useQuery(['post', id], (context) => fetchPost(context.queryKey[1]))
```

### 无限查询的页面参数现在通过 `QueryFunctionContext.pageParam` 传递

之前它们是作为查询函数的最后一个查询键参数添加的，但这在某些模式下被证明存在问题。

```tsx
// 旧方式
useInfiniteQuery(['posts'], (_key, pageParam = 0) => fetchPosts(pageParam))

// 新方式
useInfiniteQuery(['posts'], ({ pageParam = 0 }) => fetchPosts(pageParam))
```

### usePaginatedQuery() 已被移除，改用 `keepPreviousData` 选项

新的 `keepPreviousData` 选项可用于 `useQuery` 和 `useInfiniteQuery`，将对数据产生相同的"滞后"效果：

```tsx
import { useQuery } from 'react-query'

function Page({ page }) {
  const { data } = useQuery(['page', page], fetchPage, {
    keepPreviousData: true,
  })
}
```

### useInfiniteQuery() 现在支持双向操作

`useInfiniteQuery()` 接口已变更，完全支持双向无限列表。

- `options.getFetchMore` 已重命名为 `options.getNextPageParam`
- `queryResult.canFetchMore` 已重命名为 `queryResult.hasNextPage`
- `queryResult.fetchMore` 已重命名为 `queryResult.fetchNextPage`
- `queryResult.isFetchingMore` 已重命名为 `queryResult.isFetchingNextPage`
- 新增 `options.getPreviousPageParam` 选项
- 新增 `queryResult.hasPreviousPage` 属性
- 新增 `queryResult.fetchPreviousPage` 属性
- 新增 `queryResult.isFetchingPreviousPage`
- 无限查询的 `data` 现在是一个包含 `pages` 和用于获取这些页面的 `pageParams` 的对象：`{ pages: [data, data, data], pageParams: [...]}`

单向操作：

```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery(
    'projects',
    ({ pageParam = 0 }) => fetchProjects(pageParam),
    {
      getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    },
  )
```

双向操作：

```tsx
const {
  data,
  fetchNextPage,
  fetchPreviousPage,
  hasNextPage,
  hasPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage,
} = useInfiniteQuery(
  'projects',
  ({ pageParam = 0 }) => fetchProjects(pageParam),
  {
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor,
  },
)
```

反向单向操作：

```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery(
    'projects',
    ({ pageParam = 0 }) => fetchProjects(pageParam),
    {
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
      getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    },
  )
```

### 无限查询数据现在包含用于获取这些页面的页面数组和 pageParams

这使得操作数据和页面参数更加容易，例如，移除第一页数据及其参数：

```tsx
queryClient.setQueryData(['projects'], (data) => ({
  pages: data.pages.slice(1),
  pageParams: data.pageParams.slice(1),
}))
```

### useMutation 现在返回一个对象而非数组

虽然旧方式让我们想起了初次发现 `useState` 时的温暖感觉，但这种感觉并未持续太久。现在变更返回的是一个单独的对象。

```tsx
// 旧方式：
const [mutate, { status, reset }] = useMutation()

// 新方式：
const { mutate, status, reset } = useMutation()
```

### `mutation.mutate` 不再返回 promise

- `[mutate]` 变量已变更为 `mutation.mutate` 函数
- 新增 `mutation.mutateAsync` 函数

我们收到了很多关于此行为的疑问，因为用户期望 promise 能像常规 promise 一样工作。

因此，`mutate` 函数现在被拆分为 `mutate` 和 `mutateAsync` 函数。

`mutate` 函数可在使用回调时使用：

```tsx
const { mutate } = useMutation({ mutationFn: addTodo })

mutate('todo', {
  onSuccess: (data) => {
    console.log(data)
  },
  onError: (error) => {
    console.error(error)
  },
  onSettled: () => {
    console.log('settled')
  },
})
```

`mutateAsync` 函数可在使用 async/await 时使用：

```tsx
const { mutateAsync } = useMutation({ mutationFn: addTodo })

try {
  const data = await mutateAsync('todo')
  console.log(data)
} catch (error) {
  console.error(error)
} finally {
  console.log('settled')
}
```

### useQuery 的对象语法现在使用简化的配置：

```tsx
// 旧方式：
useQuery({
  queryKey: 'posts',
  queryFn: fetchPosts,
  config: { staleTime: Infinity },
})

// 新方式：
useQuery({
  queryKey: 'posts',
  queryFn: fetchPosts,
  staleTime: Infinity,
})
```

### 如果设置，QueryOptions.enabled 选项必须是布尔值（`true`/`false`）

`enabled` 查询选项现在仅在值为 `false` 时禁用查询。
如果需要，可以使用 `!!userId` 或 `Boolean(userId)` 进行转换，如果传递了非布尔值，将抛出错误。

### 已移除 QueryOptions.initialStale 选项

`initialStale` 查询选项已被移除，初始数据现在被视为常规数据。
这意味着如果提供了 `initialData`，查询默认会在挂载时重新获取。
如果不希望立即重新获取，可以定义 `staleTime`。

### `QueryOptions.forceFetchOnMount` 选项已被 `refetchOnMount: 'always'` 取代

老实说，我们积累了太多 `refetchOn____` 选项，这应该能清理一下。

### `QueryOptions.refetchOnMount` 选项现在仅适用于其父组件而非所有查询观察者

当 `refetchOnMount` 设置为 `false` 时，会阻止任何额外组件在挂载时重新获取。
在版本 3 中，仅设置了该选项的组件不会在挂载时重新获取。

### 已移除 `QueryOptions.queryFnParamsFilter`，改用新的 `QueryFunctionContext` 对象

`queryFnParamsFilter` 选项已被移除，因为查询函数现在接收 `QueryFunctionContext` 对象而非查询键。

由于 `QueryFunctionContext` 也包含查询键，参数仍可在查询函数内部进行过滤。

### `QueryOptions.notifyOnStatusChange` 选项已被新的 `notifyOnChangeProps` 和 `notifyOnChangePropsExclusions` 选项取代

通过这些新选项，可以更精细地配置组件应在何时重新渲染。

仅在 `data` 或 `error` 属性变更时重新渲染：

```tsx
import { useQuery } from 'react-query'

function User() {
  const { data } = useQuery(['user'], fetchUser, {
    notifyOnChangeProps: ['data', 'error'],
  })
  return <div>用户名: {data.username}</div>
}
```

防止 `isStale` 属性变更时重新渲染：

```tsx
import { useQuery } from 'react-query'

function User() {
  const { data } = useQuery(['user'], fetchUser, {
    notifyOnChangePropsExclusions: ['isStale'],
  })
  return <div>用户名: {data.username}</div>
}
```

### `QueryResult.clear()` 函数已重命名为 `QueryResult.remove()`

虽然它被称为 `clear`，但实际上只是将查询从缓存中移除。新名称更符合其功能。

### `QueryResult.updatedAt` 属性已拆分为 `QueryResult.dataUpdatedAt` 和 `QueryResult.errorUpdatedAt` 属性

因为数据和错误可以同时存在，`updatedAt` 属性被拆分为 `dataUpdatedAt` 和 `errorUpdatedAt`。

### `setConsole()` 已被新的 `setLogger()` 函数取代

```tsx
import { setLogger } from 'react-query'

// 使用 Sentry 记录
setLogger({
  error: (error) => {
    Sentry.captureException(error)
  },
})

// 使用 Winston 记录
setLogger(winston.createLogger())
```

### React Native 不再需要覆盖记录器

为了防止查询失败时在 React Native 中显示错误屏幕，之前需要手动更改控制台：

```tsx
import { setConsole } from 'react-query'

setConsole({
  log: console.log,
  warn: console.warn,
  error: console.warn,
})
```

在版本 3 中，当在 React Native 中使用 React Query 时会自动完成此操作。

### TypeScript

#### `QueryStatus` 已从 [枚举](https://www.typescriptlang.org/docs/handbook/enums.html#string-enums) 变更为 [联合类型](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)

因此，如果你曾将查询或变更的 status 属性与 QueryStatus 枚举属性进行比较，现在需要将其与枚举先前为每个属性保存的字符串字面量进行比较。

因此，你需要将枚举属性更改为它们等效的字符串字面量，如下所示：

- `QueryStatus.Idle` -> `'idle'`
- `QueryStatus.Loading` -> `'loading'`
- `QueryStatus.Error` -> `'error'`
- `QueryStatus.Success` -> `'success'`

以下是你需要进行的更改示例：

```tsx
- import { useQuery, QueryStatus } from 'react-query'; // [!code --]
+ import { useQuery } from 'react-query'; // [!code ++]

const { data, status } = useQuery(['post', id], () => fetchPost(id))

- if (status === QueryStatus.Loading) { // [!code --]
+ if (status === 'loading') { // [!code ++]
  ...
}

- if (status === QueryStatus.Error) { // [!code --]
+ if (status === 'error') { // [!code ++]
  ...
}
```

## 新功能

#### 查询数据选择器 (Query Data Selectors)

`useQuery` 和 `useInfiniteQuery` 钩子现在具有 `select` 选项，可以选择或转换查询结果的部分内容。

```tsx
import { useQuery } from 'react-query'

function User() {
  const { data } = useQuery(['user'], fetchUser, {
    select: (user) => user.username,
  })
  return <div>用户名: {data}</div>
}
```

将 `notifyOnChangeProps` 选项设置为 `['data', 'error']`，以仅在所选数据变更时重新渲染。

#### useQueries() 钩子，用于可变长度的并行查询执行

希望能在循环中运行 `useQuery`？钩子规则说不可以，但有了新的 `useQueries()` 钩子，你可以！

```tsx
import { useQueries } from 'react-query'

function Overview() {
  const results = useQueries([
    { queryKey: ['post', 1], queryFn: fetchPost },
    { queryKey: ['post', 2], queryFn: fetchPost },
  ])
  return (
    <ul>
      {results.map(({ data }) => data && <li key={data.id}>{data.title})</li>)}
    </ul>
  )
}
```

#### 重试/离线变更

默认情况下，React Query 不会在错误时重试变更，但可以通过 `retry` 选项实现：

```tsx
const mutation = useMutation({
  mutationFn: addTodo,
  retry: 3,
})
```

如果因设备离线导致变更失败，它们将在设备重新连接时按相同顺序重试。

#### 持久化变更

变更现在可以持久化到存储中，并在稍后恢复。更多信息请参阅变更文档。

#### QueryObserver

`QueryObserver` 可用于创建和/或观察查询：

```tsx
const observer = new QueryObserver(queryClient, { queryKey: 'posts' })

const unsubscribe = observer.subscribe((result) => {
  console.log(result)
  unsubscribe()
})
```

#### InfiniteQueryObserver

`InfiniteQueryObserver` 可用于创建和/或观察无限查询：

```tsx
const observer = new InfiniteQueryObserver(queryClient, {
  queryKey: 'posts',
  queryFn: fetchPosts,
  getNextPageParam: (lastPage, allPages) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage, allPages) => firstPage.prevCursor,
})

const unsubscribe = observer.subscribe((result) => {
  console.log(result)
  unsubscribe()
})
```

#### QueriesObserver

`QueriesObserver` 可用于创建和/或观察多个查询：

```tsx
const observer = new QueriesObserver(queryClient, [
  { queryKey: ['post', 1], queryFn: fetch
