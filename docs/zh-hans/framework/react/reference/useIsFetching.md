---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:39:06.621Z'
id: useIsFetching
title: useIsFetching
---
`useIsFetching` 是一个可选钩子，返回当前应用在后台加载或获取中的查询 `数量`（适用于全局加载指示器）。

```tsx
import { useIsFetching } from '@tanstack/react-query'
// 有多少查询正在获取中？
const isFetching = useIsFetching()
// 匹配 posts 前缀的查询有多少正在获取中？
const isFetchingPosts = useIsFetching({ queryKey: ['posts'] })
```

**选项**

- `filters?: QueryFilters`: [查询过滤器](../guides/filters.md#query-filters)
- `queryClient?: QueryClient`,
  - 使用此选项可指定自定义 QueryClient。否则将使用最近上下文中的 QueryClient。

**返回值**

- `isFetching: number`
  - 表示当前应用在后台加载或获取中的查询数量。
