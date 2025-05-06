---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:35:52.836Z'
id: useQuery
title: useQuery
---
```tsx
const {
  data,
  dataUpdatedAt,
  error,
  errorUpdatedAt,
  failureCount,
  failureReason,
  fetchStatus,
  isError,
  isFetched,
  isFetchedAfterMount,
  isFetching,
  isInitialLoading,
  isLoading,
  isLoadingError,
  isPaused,
  isPending,
  isPlaceholderData,
  isRefetchError,
  isRefetching,
  isStale,
  isSuccess,
  promise,
  refetch,
  status,
} = useQuery(
  {
    queryKey,
    queryFn,
    gcTime,
    enabled,
    networkMode,
    initialData,
    initialDataUpdatedAt,
    meta,
    notifyOnChangeProps,
    placeholderData,
    queryKeyHashFn,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnMount,
    refetchOnReconnect,
    refetchOnWindowFocus,
    retry,
    retryOnMount,
    retryDelay,
    select,
    staleTime,
    structuralSharing,
    subscribed,
    throwOnError,
  },
  queryClient,
)
```

**参数1 (配置项)**

- `queryKey: unknown[]`
  - **必填**
  - 用于此查询的查询键 (query key)。
  - 查询键会被哈希成一个稳定的哈希值。详见 [查询键](../guides/query-keys.md)。
  - 当此键发生变化时，查询会自动更新（只要 `enabled` 未设为 `false`）。
- `queryFn: (context: QueryFunctionContext) => Promise<TData>`
  - **必填，但仅在未定义默认查询函数时** 详见 [默认查询函数](../guides/default-query-function.md)。
  - 查询用于请求数据的函数。
  - 接收一个 [QueryFunctionContext](../guides/query-functions.md#queryfunctioncontext)。
  - 必须返回一个会解析数据或抛出错误的 Promise。数据不能为 `undefined`。
- `enabled: boolean | (query: Query) => boolean`
  - 设为 `false` 可禁用此查询自动运行。
  - 可用于 [依赖查询](../guides/dependent-queries.md)。
- `networkMode: 'online' | 'always' | 'offlineFirst`
  - 可选
  - 默认为 `'online'`
  - 详见 [网络模式](../guides/network-mode.md)。
- `retry: boolean | number | (failureCount: number, error: TError) => boolean`
  - 如果为 `false`，默认情况下失败的查询不会重试。
  - 如果为 `true`，失败的查询会无限重试。
  - 如果设为数字（如 `3`），失败的查询会重试直到失败次数达到该数字。
  - 客户端默认为 `3`，服务端默认为 `0`。
- `retryOnMount: boolean`
  - 如果设为 `false`，当查询包含错误时不会在挂载时重试。默认为 `true`。
- `retryDelay: number | (retryAttempt: number, error: TError) => number`
  - 此函数接收 `retryAttempt` 整数和实际的 Error，并返回下一次尝试前的延迟时间（毫秒）。
  - 像 `attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)` 这样的函数会应用指数退避。
  - 像 `attempt => attempt * 1000` 这样的函数会应用线性退避。
- `staleTime: number | ((query: Query) => number)`
  - 可选
  - 默认为 `0`
  - 数据被视为过时的时间（毫秒）。此值仅适用于定义它的钩子。
  - 如果设为 `Infinity`，数据永远不会被视为过时。
  - 如果设为函数，该函数会接收查询并计算 `staleTime`。
- `gcTime: number | Infinity`
  - 默认为 `5 * 60 * 1000`（5 分钟）或在 SSR 期间为 `Infinity`
  - 未使用/非活跃的缓存数据在内存中保留的时间（毫秒）。当查询的缓存变为未使用或非活跃时，该缓存数据会在此时间后被垃圾回收。如果指定了不同的垃圾回收时间，将使用最长的时间。
  - 注意：最大允许时间约为 24 天。详见 [更多](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value)。
  - 如果设为 `Infinity`，会禁用垃圾回收。
- `queryKeyHashFn: (queryKey: QueryKey) => string`
  - 可选
  - 如果指定，此函数用于将 `queryKey` 哈希为字符串。
- `refetchInterval: number | false | ((query: Query) => number | false | undefined)`
  - 可选
  - 如果设为数字，所有查询会按此频率（毫秒）持续重新获取。
  - 如果设为函数，该函数会接收查询并计算频率。
- `refetchIntervalInBackground: boolean`
  - 可选
  - 如果设为 `true`，设置为持续重新获取的查询会在其标签页/窗口处于后台时继续重新获取。
- `refetchOnMount: boolean | "always" | ((query: Query) => boolean | "always")`
  - 可选
  - 默认为 `true`
  - 如果设为 `true`，当数据过时会在挂载时重新获取。
  - 如果设为 `false`，不会在挂载时重新获取。
  - 如果设为 `"always"`，会在挂载时始终重新获取。
  - 如果设为函数，该函数会接收查询并计算值。
- `refetchOnWindowFocus: boolean | "always" | ((query: Query) => boolean | "always")`
  - 可选
  - 默认为 `true`
  - 如果设为 `true`，当数据过时会在窗口获得焦点时重新获取。
  - 如果设为 `false`，不会在窗口获得焦点时重新获取。
  - 如果设为 `"always"`，会在窗口获得焦点时始终重新获取。
  - 如果设为函数，该函数会接收查询并计算值。
- `refetchOnReconnect: boolean | "always" | ((query: Query) => boolean | "always")`
  - 可选
  - 默认为 `true`
  - 如果设为 `true`，当数据过时会在重新连接时重新获取。
  - 如果设为 `false`，不会在重新连接时重新获取。
  - 如果设为 `"always"`，会在重新连接时始终重新获取。
  - 如果设为函数，该函数会接收查询并计算值。
- `notifyOnChangeProps: string[] | "all" | (() => string[] | "all" | undefined)`
  - 可选
  - 如果设置，组件只会在列出的属性变化时重新渲染。
  - 例如设为 `['data', 'error']`，组件只会在 `data` 或 `error` 属性变化时重新渲染。
  - 如果设为 `"all"`，组件会退出智能跟踪，并在查询更新时始终重新渲染。
  - 如果设为函数，该函数会执行以计算属性列表。
  - 默认情况下，会跟踪属性访问，组件只会在跟踪的属性变化时重新渲染。
- `select: (data: TData) => unknown`
  - 可选
  - 此选项可用于转换或选择查询函数返回数据的一部分。它影响返回的 `data` 值，但不影响查询缓存中存储的内容。
  - `select` 函数只会在 `data` 变化或 `select` 函数本身的引用变化时运行。为了优化，可以用 `useCallback` 包裹函数。
- `initialData: TData | () => TData`
  - 可选
  - 如果设置，此值会用作查询缓存的初始数据（只要查询尚未创建或缓存）。
  - 如果设为函数，该函数会在共享/根查询初始化期间调用**一次**，并应同步返回初始数据。
  - 初始数据默认被视为过时，除非设置了 `staleTime`。
  - `initialData` **会持久化**到缓存。
- `initialDataUpdatedAt: number | (() => number | undefined)`
  - 可选
  - 如果设置，此值会用作 `initialData` 本身最后更新的时间（毫秒）。
- `placeholderData: TData | (previousValue: TData | undefined; previousQuery: Query | undefined,) => TData`
  - 可选
  - 如果设置，此值会用作此特定查询观察器的占位数据，当查询仍处于 `pending` 状态时。
  - `placeholderData` **不会持久化**到缓存。
  - 如果为 `placeholderData` 提供函数，第一个参数会接收之前观察的查询数据（如果可用），第二个参数是完整的 previousQuery 实例。
- `structuralSharing: boolean | (oldData: unknown | undefined, newData: unknown) => unknown)`
  - 可选
  - 默认为 `true`
  - 如果设为 `false`，会禁用查询结果之间的结构共享。
  - 如果设为函数，旧数据和新数据会通过此函数传递，该函数应将它们组合为查询的解析数据。这样，即使数据包含不可序列化的值，也可以保留旧数据的引用以提高性能。
- `subscribed: boolean`
  - 可选
  - 默认为 `true`
  - 如果设为 `false`，此 `useQuery` 实例不会订阅缓存。这意味着它不会自行触发 `queryFn`，也不会在数据通过其他方式进入缓存时接收更新。
- `throwOnError: undefined | boolean | (error: TError, query: Query) => boolean`
  - 设为 `true` 时，错误会在渲染阶段抛出并传播到最近的错误边界。
  - 设为 `false` 可禁用 `suspense` 将错误抛出到错误边界的默认行为。
  - 如果设为函数，会传入错误和查询，并应返回布尔值，指示是否在错误边界中显示错误（`true`）或将错误作为状态返回（`false`）。
- `meta: Record<string, unknown>`
  - 可选
  - 如果设置，会在查询缓存条目上存储额外的信息，可根据需要使用。在 `query` 可访问的任何地方都可以访问它，也是提供给 `queryFn` 的 `QueryFunctionContext` 的一部分。

**参数2 (QueryClient)**

- `queryClient?: QueryClient`,
  - 使用此参数可自定义 QueryClient。否则会使用最近上下文中的 QueryClient。

**返回值**

- `status: QueryStatus`
  - 可能为：
    - `pending`：如果无缓存数据且查询尝试尚未完成。
    - `error`：如果查询尝试导致错误。对应的 `error` 属性包含从尝试获取中接收的错误。
    - `success`：如果查询接收到无错误的响应并准备显示其数据。查询的 `data` 属性是从成功获取中接收的数据，或者如果查询的 `enabled` 属性设为 `false` 且尚未获取，`data` 是初始化时提供给查询的第一个 `initialData`。
- `isPending: boolean`
  - 从上述 `status` 变量派生的布尔值，为方便提供。
- `isSuccess: boolean`
  - 从上述 `status` 变量派生的布尔值，为方便提供。
- `isError: boolean`
  - 从上述 `status` 变量派生的布尔值，为方便提供。
- `isLoadingError: boolean`
  - 如果查询在首次获取时失败则为 `true`。
- `isRefetchError: boolean`
  - 如果查询在重新获取时失败则为 `true`。
- `data: TData`
  - 默认为 `undefined`。
  - 查询最后成功解析的数据。
- `dataUpdatedAt: number`
  - 查询最近返回 `status` 为 `"success"` 时的时间戳。
- `error: null | TError`
  - 默认为 `null`
  - 查询的错误对象，如果抛出错误。
- `errorUpdatedAt: number`
  - 查询最近返回 `status` 为 `"error"` 时的时间戳。
- `isStale: boolean`
  - 如果缓存中的数据无效或数据比给定的 `staleTime` 旧则为 `true`。
- `isPlaceholderData: boolean`
  - 如果显示的数据是占位数据则为 `true`。
- `isFetched: boolean`
  - 如果查询已获取则为 `true`。
- `isFetchedAfterMount: boolean`
  - 如果查询在组件挂载后已获取则为 `true`。
  - 此属性可用于不显示任何先前缓存的数据。
- `fetchStatus: FetchStatus`
  - `fetching`：当 `queryFn` 正在执行时为 `true`，包括初始 `pending` 和后台重新获取。
  - `paused`：查询想要获取，但已被 `paused`。
  - `idle`：查询未在获取。
  - 详见 [网络模式](../guides/network-mode)。
- `isFetching: boolean`
  - 从上述 `fetchStatus` 变量派生的布尔值，为方便提供。
- `isPaused: boolean`
  - 从上述 `fetchStatus` 变量派生的布尔值，为方便提供。
- `isRefetching: boolean`
  - 当后台重新获取进行中时为 `true`，**不包括**初始 `pending`。
  - 等同于 `isFetching && !isPending`。
- `isLoading: boolean`
  - 当查询首次获取进行中时为 `true`。
  - 等同于 `isFetching && isPending`。
- `isInitialLoading: boolean`
  - **已弃用**
  - `isLoading` 的别名，将在下一个主版本中移除。
- `failureCount: number`
  - 查询的失败次数。
  - 每次查询失败时递增。
  - 查询成功时重置为 `0`。
- `failureReason: null | TError`
  - 查询重试的失败原因。
  - 查询成功时重置为 `null`。
- `errorUpdateCount: number`
  - 所有错误的总和。
- `refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<UseQueryResult>`
  - 手动重新获取查询的函数。
  - 如果查询出错，错误只会被记录。如果想抛出错误，传递 `throwOnError: true` 选项。
  - `cancelRefetch?: boolean`
    - 默认为 `true`
      - 默认情况下，新请求发出前会取消当前正在运行的请求。
    - 设为 `false` 时，如果已有请求运行则不会重新获取。
- `promise: Promise<TData>`
  - 一个稳定的 Promise，会解析为查询的数据。
  - 需要在 `QueryClient` 上启用 `experimental_prefetchInRender` 特性标志。
