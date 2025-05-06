---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:38:54.202Z'
id: useIsMutating
title: useIsMutating
---

`useIsMutating` 是一个可选钩子，用于返回当前应用中正在获取的变更操作（mutations）数量（适用于全局加载指示器场景）。

```tsx
import { useIsMutating } from '@tanstack/react-query'
// 获取当前正在进行的变更操作数量
const isMutating = useIsMutating()
// 获取匹配 posts 前缀的变更操作数量
const isMutatingPosts = useIsMutating({ mutationKey: ['posts'] })
```

**选项参数**

- `filters?: MutationFilters`: [变更过滤器](../guides/filters.md#mutation-filters)
- `queryClient?: QueryClient`,
  - 用于指定自定义 QueryClient 实例。若未提供，则使用最近上下文中的实例。

**返回值**

- `isMutating: number`
  - 返回当前应用中正在获取的变更操作数量。
