---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:19:37.664Z'
id: useMutationState
title: useMutationState
---

`useMutationState` 是一個鉤子 (hook)，可讓你存取 `MutationCache` 中的所有變異 (mutations)。你可以傳入 `filters` 來篩選變異，並使用 `select` 來轉換變異狀態。

**範例 1：取得所有執行中變異的變數**

```tsx
import { useMutationState } from '@tanstack/react-query'

const variables = useMutationState({
  filters: { status: 'pending' },
  select: (mutation) => mutation.state.variables,
})
```

**範例 2：透過 `mutationKey` 取得特定變異的所有資料**

```tsx
import { useMutation, useMutationState } from '@tanstack/react-query'

const mutationKey = ['posts']

// 我們想取得狀態的某個變異
const mutation = useMutation({
  mutationKey,
  mutationFn: (newPost) => {
    return axios.post('/posts', newPost)
  },
})

const data = useMutationState({
  // 此變異鍵需與指定變異的變異鍵相符 (參見上方)
  filters: { mutationKey },
  select: (mutation) => mutation.state.data,
})
```

**範例 3：透過 `mutationKey` 存取最新的變異資料**
每次呼叫 `mutate` 都會在 `gcTime` 毫秒內新增一個項目至變異快取 (mutation cache)。

若要存取最新的呼叫，你可以檢查 `useMutationState` 回傳的最後一個項目。

```tsx
import { useMutation, useMutationState } from '@tanstack/react-query'

const mutationKey = ['posts']

// 我們想取得狀態的某個變異
const mutation = useMutation({
  mutationKey,
  mutationFn: (newPost) => {
    return axios.post('/posts', newPost)
  },
})

const data = useMutationState({
  // 此變異鍵需與指定變異的變異鍵相符 (參見上方)
  filters: { mutationKey },
  select: (mutation) => mutation.state.data,
})

// 最新的變異資料
const latest = data[data.length - 1]
```

**選項**

- `options`
  - `filters?: MutationFilters`: [變異篩選器](../guides/filters.md#mutation-filters)
  - `select?: (mutation: Mutation) => TResult`
    - 用於轉換變異狀態。
- `queryClient?: QueryClient`,
  - 用於指定自訂的 QueryClient。若未提供，則會使用最近上下文中的 QueryClient。

**回傳值**

- `Array<TResult>`
  - 會是一個陣列，包含 `select` 為每個符合條件的變異所回傳的值。
