---
source-updated-at: '2025-03-07T03:31:26.000Z'
translation-updated-at: '2025-05-06T03:55:21.509Z'
id: QueryClient
title: QueryClient
---
## `QueryClient`

`QueryClient` 可用于与缓存进行交互：

```tsx
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
})

await queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: fetchPosts })
```

其提供的方法包括：

- [`queryClient.fetchQuery`](#queryclientfetchquery)
- [`queryClient.fetchInfiniteQuery`](#queryclientfetchinfinitequery)
- [`queryClient.prefetchQuery`](#queryclientprefetchquery)
- [`queryClient.prefetchInfiniteQuery`](#queryclientprefetchinfinitequery)
- [`queryClient.getQueryData`](#queryclientgetquerydata)
- [`queryClient.ensureQueryData`](#queryclientensurequerydata)
- [`queryClient.ensureInfiniteQueryData`](#queryclientensureinfinitequerydata)
- [`queryClient.getQueriesData`](#queryclientgetqueriesdata)
- [`queryClient.setQueryData`](#queryclientsetquerydata)
- [`queryClient.getQueryState`](#queryclientgetquerystate)
- [`queryClient.setQueriesData`](#queryclientsetqueriesdata)
- [`queryClient.invalidateQueries`](#queryclientinvalidatequeries)
- [`queryClient.refetchQueries`](#queryclientrefetchqueries)
- [`queryClient.cancelQueries`](#queryclientcancelqueries)
- [`queryClient.removeQueries`](#queryclientremovequeries)
- [`queryClient.resetQueries`](#queryclientresetqueries)
- [`queryClient.isFetching`](#queryclientisfetching)
- [`queryClient.isMutating`](#queryclientismutating)
- [`queryClient.getDefaultOptions`](#queryclientgetdefaultoptions)
- [`queryClient.setDefaultOptions`](#queryclientsetdefaultoptions)
- [`queryClient.getQueryDefaults`](#queryclientgetquerydefaults)
- [`queryClient.setQueryDefaults`](#queryclientsetquerydefaults)
- [`queryClient.getMutationDefaults`](#queryclientgetmutationdefaults)
- [`queryClient.setMutationDefaults`](#queryclientsetmutationdefaults)
- [`queryClient.getQueryCache`](#queryclientgetquerycache)
- [`queryClient.getMutationCache`](#queryclientgetmutationcache)
- [`queryClient.clear`](#queryclientclear)
- [`queryClient.resumePausedMutations`](#queryclientresumepausedmutations)

**选项**

- `queryCache?: QueryCache`
  - 可选
  - 该客户端关联的查询缓存。
- `mutationCache?: MutationCache`
  - 可选
  - 该客户端关联的变更缓存。
- `defaultOptions?: DefaultOptions`
  - 可选
  - 定义使用此 queryClient 的所有查询和变更的默认选项。
  - 也可用于定义 [hydration](../framework/react/reference/hydration) 的默认值。

## `queryClient.fetchQuery`

`fetchQuery` 是一个异步方法，用于获取并缓存查询。它将返回数据或抛出错误。如果只需要获取查询而不需要结果，请使用 `prefetchQuery` 方法。

如果查询存在且数据未失效或未超过给定的 `staleTime`，则返回缓存中的数据。否则会尝试获取最新数据。

```tsx
try {
  const data = await queryClient.fetchQuery({ queryKey, queryFn })
} catch (error) {
  console.log(error)
}
```

指定 `staleTime` 以仅在数据超过一定时间后才重新获取：

```tsx
try {
  const data = await queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: 10000,
  })
} catch (error) {
  console.log(error)
}
```

**选项**

`fetchQuery` 的选项与 [`useQuery`](../framework/react/reference/useQuery) 完全相同，除了以下专用于 useQuery 和 useInfiniteQuery 的选项：`enabled, refetchInterval, refetchIntervalInBackground, refetchOnWindowFocus, refetchOnReconnect, refetchOnMount, notifyOnChangeProps, throwOnError, select, suspense, placeholderData`。更多细节可查看 [源代码](https://github.com/TanStack/query/blob/7cd2d192e6da3df0b08e334ea1cf04cd70478827/packages/query-core/src/types.ts#L119)。

**返回值**

- `Promise<TData>`

## `queryClient.fetchInfiniteQuery`

`fetchInfiniteQuery` 类似于 `fetchQuery`，但可用于获取并缓存无限查询。

```tsx
try {
  const data = await queryClient.fetchInfiniteQuery({ queryKey, queryFn })
  console.log(data.pages)
} catch (error) {
  console.log(error)
}
```

**选项**

`fetchInfiniteQuery` 的选项与 [`fetchQuery`](#queryclientfetchquery) 完全相同。

**返回值**

- `Promise<InfiniteData<TData, TPageParam>>`

## `queryClient.prefetchQuery`

`prefetchQuery` 是一个异步方法，用于在需要或通过 `useQuery` 等渲染之前预取查询。该方法与 `fetchQuery` 的工作方式相同，只是不会抛出错误或返回任何数据。

```tsx
await queryClient.prefetchQuery({ queryKey, queryFn })
```

甚至可以在配置中使用默认的 queryFn！

```tsx
await queryClient.prefetchQuery({ queryKey })
```

**选项**

`prefetchQuery` 的选项与 [`fetchQuery`](#queryclientfetchquery) 完全相同。

**返回值**

- `Promise<void>`
  - 返回一个 Promise，如果无需获取则立即解析，或在查询执行后解析。不会返回任何数据或抛出错误。

## `queryClient.prefetchInfiniteQuery`

`prefetchInfiniteQuery` 类似于 `prefetchQuery`，但可用于预取并缓存无限查询。

```tsx
await queryClient.prefetchInfiniteQuery({ queryKey, queryFn })
```

**选项**

`prefetchInfiniteQuery` 的选项与 [`fetchQuery`](#queryclientfetchquery) 完全相同。

**返回值**

- `Promise<void>`
  - 返回一个 Promise，如果无需获取则立即解析，或在查询执行后解析。不会返回任何数据或抛出错误。

## `queryClient.getQueryData`

`getQueryData` 是一个同步函数，用于获取现有查询的缓存数据。如果查询不存在，则返回 `undefined`。

```tsx
const data = queryClient.getQueryData(queryKey)
```

**选项**

- `queryKey: QueryKey`: [查询键 (Query Keys)](../framework/react/guides/query-keys)

**返回值**

- `data: TQueryFnData | undefined`
  - 缓存查询的数据，如果查询不存在则返回 `undefined`。

## `queryClient.ensureQueryData`

`ensureQueryData` 是一个异步函数，用于获取现有查询的缓存数据。如果查询不存在，则会调用 `queryClient.fetchQuery` 并返回其结果。

```tsx
const data = await queryClient.ensureQueryData({ queryKey, queryFn })
```

**选项**

- 与 [`fetchQuery`](#queryclientfetchquery) 相同的选项
- `revalidateIfStale: boolean`
  - 可选
  - 默认为 `false`
  - 如果设置为 `true`，过时的数据会在后台重新获取，但会立即返回缓存数据。

**返回值**

- `Promise<TData>`

## `queryClient.ensureInfiniteQueryData`

`ensureInfiniteQueryData` 是一个异步函数，用于获取现有无限查询的缓存数据。如果查询不存在，则会调用 `queryClient.fetchInfiniteQuery` 并返回其结果。

```tsx
const data = await queryClient.ensureInfiniteQueryData({
  queryKey,
  queryFn,
  initialPageParam,
  getNextPageParam,
})
```

**选项**

- 与 [`fetchInfiniteQuery`](#queryclientfetchinfinitequery) 相同的选项
- `revalidateIfStale: boolean`
  - 可选
  - 默认为 `false`
  - 如果设置为 `true`，过时的数据会在后台重新获取，但会立即返回缓存数据。

**返回值**

- `Promise<InfiniteData<TData, TPageParam>>`

## `queryClient.getQueriesData`

`getQueriesData` 是一个同步函数，用于获取多个查询的缓存数据。仅返回匹配传入的 queryKey 或 queryFilter 的查询。如果没有匹配的查询，则返回空数组。

```tsx
const data = queryClient.getQueriesData(filters)
```

**选项**

- `filters: QueryFilters`: [查询过滤器 (Query Filters)](../framework/react/guides/filters#query-filters)
  - 如果传入过滤器，则返回匹配过滤器的 queryKeys 的数据

**返回值**

- `[queryKey: QueryKey, data: TQueryFnData | undefined][]`
  - 匹配的查询键及其关联数据的元组数组，如果没有匹配项则返回 `[]`。

**注意事项**

由于每个元组中的返回数据结构可能不同（例如，使用过滤器返回“活跃”查询可能返回不同的数据类型），`TData` 泛型默认为 `unknown`。如果为 `TData` 提供更具体的类型，则假定您确定每个元组的数据条目均为相同类型。

这一区别主要是为知道将返回哪种结构的 TypeScript 开发者提供的“便利”。

## `queryClient.setQueryData`

`setQueryData` 是一个同步函数，用于立即更新查询的缓存数据。如果查询不存在，则会创建它。**如果查询在默认的 `gcTime`（5 分钟）内未被查询钩子使用，该查询将被垃圾回收**。要同时更新多个查询并部分匹配查询键，需使用 [`queryClient.setQueriesData`](#queryclientsetqueriesdata)。

> 使用 `setQueryData` 和 `fetchQuery` 的区别在于，`setQueryData` 是同步的，并假定您已经同步获取了数据。如果需要异步获取数据，建议重新获取查询键或使用 `fetchQuery` 处理异步获取。

```tsx
queryClient.setQueryData(queryKey, updater)
```

**选项**

- `queryKey: QueryKey`: [查询键 (Query Keys)](../framework/react/guides/query-keys)
- `updater: TQueryFnData | undefined | ((oldData: TQueryFnData | undefined) => TQueryFnData | undefined)`
  - 如果传入非函数值，数据将更新为该值
  - 如果传入函数，它将接收旧数据值并应返回新数据。

**使用更新值**

```tsx
setQueryData(queryKey, newData)
```

如果值为 `undefined`，则不会更新查询数据。

**使用更新函数**

为了方便语法，也可以传入一个接收当前数据值并返回新数据的更新函数：

```tsx
setQueryData(queryKey, (oldData) => newData)
```

如果更新函数返回 `undefined`，则不会更新查询数据。如果更新函数接收到 `undefined` 作为输入，可以返回 `undefined` 以取消更新，从而_不_创建新的缓存条目。

**不可变性**

通过 `setQueryData` 进行的更新必须以_不可变_方式执行。**不要**尝试通过直接修改 `oldData` 或通过 `getQueryData` 检索的数据来写入缓存。

## `queryClient.getQueryState`

`getQueryState` 是一个同步函数，用于获取现有查询的状态。如果查询不存在，则返回 `undefined`。

```tsx
const state = queryClient.getQueryState(queryKey)
console.log(state.dataUpdatedAt)
```

**选项**

- `queryKey: QueryKey`: [查询键 (Query Keys)](../framework/react/guides/query-keys)

## `queryClient.setQueriesData`

`setQueriesData` 是一个同步函数，通过使用过滤器函数或部分匹配查询键，可以立即更新多个查询的缓存数据。仅更新匹配传入的 queryKey 或 queryFilter 的查询——不会创建新的缓存条目。底层会为每个现有查询调用 [`setQueryData`](#queryclientsetquerydata)。

```tsx
queryClient.setQueriesData(filters, updater)
```

**选项**

- `filters: QueryFilters`: [查询过滤器 (Query Filters)](../framework/react/guides/filters#query-filters)
  - 如果传入过滤器，则更新匹配过滤器的 queryKeys
- `updater: TQueryFnData | (oldData: TQueryFnData | undefined) => TQueryFnData`
  - [`setQueryData`](#queryclientsetquerydata) 的更新函数或新数据，将为每个匹配的 queryKey 调用

## `queryClient.invalidateQueries`

`invalidateQueries` 方法可用于根据查询键或查询的其他功能可访问属性/状态，使缓存中的单个或多个查询失效并重新获取。默认情况下，所有匹配的查询会立即标记为失效，并在后台重新获取活跃查询。

- 如果**不希望活跃查询重新获取**，而仅标记为失效，可以使用 `refetchType: 'none'` 选项。
- 如果**希望非活跃查询也重新获取**，使用 `refetchType: 'all'` 选项

```tsx
await queryClient.invalidateQueries(
  {
    queryKey: ['posts'],
    exact,
    refetchType: 'active',
  },
  { throwOnError, cancelRefetch },
)
```

**选项**

- `filters?: QueryFilters`: [查询过滤器 (Query Filters)](../framework/react/guides/filters#query-filters)
  - `queryKey?: QueryKey`: [查询键 (Query Keys)](../framework/react/guides/query-keys)
  - `refetchType?: 'active' | 'inactive' | 'all' | 'none'`
    - 默认为 `'active'`
    - 设置为 `active` 时，仅重新获取匹配重新获取条件且通过 `useQuery` 等正在活跃渲染的查询。
    - 设置为 `inactive` 时，仅重新获取匹配重新获取条件且未通过 `useQuery` 等活跃渲染的查询。
    - 设置为 `all` 时，重新获取所有匹配重新获取条件的查询。
    - 设置为 `none` 时，不重新获取任何查询，仅将匹配重新获取条件的查询标记为失效。
- `options?: InvalidateOptions`:
  - `throwOnError?: boolean`
    - 设置为 `true` 时，如果任何查询重新获取任务失败，此方法将抛出错误。
  - `cancelRefetch?: boolean`
    - 默认为 `true`
      - 默认情况下，在发起新请求前会取消当前正在运行的请求
    - 设置为 `false` 时，如果已有请求正在运行，则不会进行重新获取。

## `queryClient.refetchQueries`

`refetchQueries` 方法可用于根据特定条件重新获取查询。

示例：

```tsx
// 重新获取所有查询：
await queryClient.refetchQueries()

// 重新获取所有过时的查询：
await queryClient.refetchQueries({ stale: true })

// 重新获取所有部分匹配查询键的活跃查询：
await queryClient.refetchQueries({ queryKey: ['posts'], type: 'active' })

// 重新获取所有精确匹配查询键的活跃查询：
await queryClient.refetchQueries({
  queryKey: ['posts', 1],
  type: 'active',
  exact: true,
})
```

**选项**

- `filters?: QueryFilters`: [查询过滤器 (Query Filters)](../framework/react/guides/filters#query-filters)
- `options?: RefetchOptions`:
  - `throwOnError?: boolean`
    - 设置为 `true` 时，如果任何查询重新获取任务失败，此方法将抛出错误。
  - `cancelRefetch?: boolean`
    - 默认为 `true`
      - 默认情况下，在发起新请求前会取消当前正在运行的请求
    - 设置为 `false` 时，如果已有请求正在运行，则不会进行重新获取。

**返回值**

此方法返回一个 Promise，在所有查询完成重新获取后解析。默认情况下，如果任何查询重新获取失败，它**不会**抛出错误，但可以通过将 `throwOnError` 选项设置为 `true` 来配置。

## `queryClient.cancelQueries`

`cancelQueries` 方法可用于根据查询键或查询的其他功能可访问属性/状态，取消正在进行的查询。

这在执行乐观更新时非常有用，因为您可能需要取消任何正在进行的查询重新获取，以免它们在解析时覆盖您的乐观更新。

```tsx
await queryClient.cancelQueries({ queryKey: ['posts'], exact: true })
```

**选项**

- `filters?: QueryFilters`: [查询过滤器 (Query Filters)](../framework/react/guides/filters#query-filters)

**返回值**

此方法不返回任何内容

## `queryClient.removeQueries`

`removeQueries` 方法可用于根据查询键或查询的其他功能可访问属性/状态，从缓存中移除查询。

```tsx
queryClient.removeQueries({ queryKey, exact: true })
```

**选项**

- `filters?: QueryFilters`: [查询过滤器 (Query Filters)](../framework/react/guides/filters#query-filters)

**返回值**

此方法不返回任何内容

## `queryClient.resetQueries`

`resetQueries` 方法可用于根据查询键或查询的其他功能可访问属性/状态，将缓存中的查询重置为其初始状态。

这将通知订阅者——与 `clear` 不同，后者会移除所有订阅者——并将查询重置为预加载状态——与 `invalidateQueries` 不同。如果查询有 `initialData`，查询的数据将重置为该值。如果查询是活跃的，则会重新获取。

```tsx
queryClient.resetQueries({ queryKey, exact: true })
```

**选项**

- `filters?: QueryFilters`: [查询过滤器 (Query Filters)](../framework/react/guides/filters#query-filters)
- `options?: ResetOptions`:
  - `throwOnError?: boolean`
    - 设置为 `true` 时，如果任何查询重新获取任务失败，此方法将抛出错误。
  - `cancelRefetch?: boolean`
    - 默认为 `true`
      - 默认情况下，在发起新请求前会取消当前正在运行的请求
    - 设置为 `false` 时，如果已有请求正在运行，则不会进行重新获取。

**返回值**

此方法返回一个 Promise，在所有活跃查询完成重新获取后解析。

## `queryClient.isFetching`

`isFetching` 方法返回一个 `integer`，表示缓存中当前正在获取（包括后台获取、加载新页面或加载更多无限查询结果）的查询数量（如果有）。

```tsx
if (queryClient.isFetching()) {
  console.log('至少有一个查询
