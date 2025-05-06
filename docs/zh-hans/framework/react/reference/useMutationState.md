---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:37:20.212Z'
id: useMutationState
title: useMutationState
---

`useMutationState` 是一个钩子函数，用于访问 `MutationCache` 中的所有变更 (mutation) 状态。你可以通过传递 `filters` 参数来筛选变更，并通过 `select` 参数转换变更状态。

**示例 1：获取所有进行中变更的变量**

```tsx
import { useMutationState } from '@tanstack/react-query'

const variables = useMutationState({
  filters: { status: 'pending' },
  select: (mutation) => mutation.state.variables,
})
```

**示例 2：通过 `mutationKey` 获取特定变更的所有数据**

```tsx
import { useMutation, useMutationState } from '@tanstack/react-query'

const mutationKey = ['posts']

// 我们需要获取状态的某个变更
const mutation = useMutation({
  mutationKey,
  mutationFn: (newPost) => {
    return axios.post('/posts', newPost)
  },
})

const data = useMutationState({
  // 此变更键需与目标变更的键匹配（见上文）
  filters: { mutationKey },
  select: (mutation) => mutation.state.data,
})
```

**示例 3：通过 `mutationKey` 访问最新的变更数据**
每次调用 `mutate` 都会在变更缓存中添加一个新条目，持续 `gcTime` 毫秒。

要访问最新的调用，可以检查 `useMutationState` 返回的最后一个条目。

```tsx
import { useMutation, useMutationState } from '@tanstack/react-query'

const mutationKey = ['posts']

// 我们需要获取状态的某个变更
const mutation = useMutation({
  mutationKey,
  mutationFn: (newPost) => {
    return axios.post('/posts', newPost)
  },
})

const data = useMutationState({
  // 此变更键需与目标变更的键匹配（见上文）
  filters: { mutationKey },
  select: (mutation) => mutation.state.data,
})

// 最新的变更数据
const latest = data[data.length - 1]
```

**配置项**

- `options`
  - `filters?: MutationFilters`: [变更过滤器](../guides/filters.md#mutation-filters)
  - `select?: (mutation: Mutation) => TResult`
    - 用于转换变更状态。
- `queryClient?: QueryClient`,
  - 用于指定自定义的 QueryClient。若不提供，则使用最近上下文中的实例。

**返回值**

- `Array<TResult>`
  - 返回由 `select` 函数处理后的匹配变更结果数组。
