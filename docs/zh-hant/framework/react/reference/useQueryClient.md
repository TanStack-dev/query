---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-08T20:19:11.298Z'
id: useQueryClient
title: useQueryClient
---

`useQueryClient` 鉤子 (hook) 會回傳當前的 `QueryClient` 實例。

```tsx
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient(queryClient?: QueryClient)
```

**選項**

- `queryClient?: QueryClient`,
  - 用於指定自訂的 QueryClient。若未提供，則會使用最鄰近上下文 (context) 中的 QueryClient。
