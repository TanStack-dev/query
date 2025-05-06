---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-06T04:33:32.399Z'
id: useQueryClient
title: useQueryClient
---
`useQueryClient` 钩子返回当前的 `QueryClient` 实例。

```tsx
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient(queryClient?: QueryClient)
```

**选项**

- `queryClient?: QueryClient`,
  - 用于指定自定义的 QueryClient。若未提供，则使用最近上下文中的 QueryClient。
