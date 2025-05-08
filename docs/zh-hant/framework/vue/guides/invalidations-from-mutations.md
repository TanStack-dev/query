---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:18:33.177Z'
id: invalidations-from-mutations
title: 來自變更的失效
---

## 失效化與變異的關聯

僅讓查詢失效只是成功的一半，知道**何時**讓它們失效才是關鍵。通常當應用程式中的變異 (mutation) 成功時，很可能會有相關的查詢需要被失效化，甚至重新獲取資料以反映變異帶來的新變更。

舉例來說，假設我們有一個新增待辦事項的變異：

```tsx
const mutation = useMutation({ mutationFn: postTodo })
```

當 `postTodo` 變異成功時，我們通常會希望所有 `todos` 查詢都失效化，並可能重新獲取資料以顯示新的待辦事項。要實現這一點，可以使用 `useMutation` 的 `onSuccess` 選項和 `client` 的 `invalidateQueries` 方法：

```tsx
import { useMutation, useQueryClient } from '@tanstack/vue-query'

const queryClient = useQueryClient()

// 當此變異成功時，讓所有帶有 `todos` 或 `reminders` 查詢鍵的查詢失效化
const mutation = useMutation({
  mutationFn: addTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
    queryClient.invalidateQueries({ queryKey: ['reminders'] })
  },
})
```

你可以利用 [`useMutation` 鉤子](./mutations.md) 提供的任何回調函數來觸發失效化操作。
