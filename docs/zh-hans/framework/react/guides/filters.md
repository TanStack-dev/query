---
source-updated-at: '2025-01-26T18:24:42.000Z'
translation-updated-at: '2025-05-06T04:14:12.171Z'
id: filters
title: 过滤器
---
TanStack Query 中的部分方法接受 `QueryFilters` 或 `MutationFilters` 对象作为参数。

## `查询过滤器 (Query Filters)`

查询过滤器 (Query Filter) 是一个包含特定匹配条件的对象，用于筛选查询：

```tsx
// 取消所有查询
await queryClient.cancelQueries()

// 移除所有键名以 `posts` 开头的非活跃 (inactive) 查询
queryClient.removeQueries({ queryKey: ['posts'], type: 'inactive' })

// 重新获取所有活跃 (active) 查询
await queryClient.refetchQueries({ type: 'active' })

// 重新获取所有键名以 `posts` 开头的活跃 (active) 查询
await queryClient.refetchQueries({ queryKey: ['posts'], type: 'active' })
```

查询过滤器对象支持以下属性：

- `queryKey?: QueryKey`
  - 设置此属性可定义需要匹配的查询键 (query key)。
- `exact?: boolean`
  - 若不需要通过查询键 (query key) 进行包容性搜索，可传递 `exact: true` 选项，仅返回与指定查询键完全匹配的查询。
- `type?: 'active' | 'inactive' | 'all'`
  - 默认值为 `all`
  - 设置为 `active` 时匹配活跃 (active) 查询。
  - 设置为 `inactive` 时匹配非活跃 (inactive) 查询。
- `stale?: boolean`
  - 设置为 `true` 时匹配过时 (stale) 查询。
  - 设置为 `false` 时匹配新鲜 (fresh) 查询。
- `fetchStatus?: FetchStatus`
  - 设置为 `fetching` 时匹配当前正在获取 (fetching) 的查询。
  - 设置为 `paused` 时匹配希望获取但被 `暂停 (paused)` 的查询。
  - 设置为 `idle` 时匹配未在获取数据的查询。
- `predicate?: (query: Query) => boolean`
  - 此谓词函数将作为对所有匹配查询的最终筛选条件。如果未指定其他过滤器，该函数将针对缓存中的每个查询进行评估。

## `变更过滤器 (Mutation Filters)`

变更过滤器 (Mutation Filter) 是一个包含特定匹配条件的对象，用于筛选变更：

```tsx
// 获取所有正在获取的变更数量
await queryClient.isMutating()

// 通过变更键 (mutationKey) 筛选变更
await queryClient.isMutating({ mutationKey: ['post'] })

// 使用谓词函数筛选变更
await queryClient.isMutating({
  predicate: (mutation) => mutation.state.variables?.id === 1,
})
```

变更过滤器对象支持以下属性：

- `mutationKey?: MutationKey`
  - 设置此属性可定义需要匹配的变更键 (mutation key)。
- `exact?: boolean`
  - 若不需要通过变更键 (mutation key) 进行包容性搜索，可传递 `exact: true` 选项，仅返回与指定变更键完全匹配的变更。
- `status?: MutationStatus`
  - 允许根据变更状态进行筛选。
- `predicate?: (mutation: Mutation) => boolean`
  - 此谓词函数将作为对所有匹配变更的最终筛选条件。如果未指定其他过滤器，该函数将针对缓存中的每个变更进行评估。

## 工具函数 (Utils)

### `matchQuery`

```tsx
const isMatching = matchQuery(filters, query)
```

返回一个布尔值，指示查询是否匹配提供的查询过滤器集合。

### `matchMutation`

```tsx
const isMatching = matchMutation(filters, mutation)
```

返回一个布尔值，指示变更是否匹配提供的变更过滤器集合。
