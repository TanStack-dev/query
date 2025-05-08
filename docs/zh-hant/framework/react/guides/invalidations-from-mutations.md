---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:22:57.592Z'
id: invalidations-from-mutations
title: 來自變更的失效
---

使查詢失效只是成功的一半，知道**何時**使其失效才是另一半。通常當應用程式中的一個異動 (mutation) 成功時，很可能會有相關的查詢需要失效，甚至可能需要重新獲取資料以反映異動帶來的新變更。

舉例來說，假設我們有一個新增待辦事項的異動：

[//]: # 'Example'

```tsx
const mutation = useMutation({ mutationFn: postTodo })
```

[//]: # 'Example'

當 `postTodo` 異動成功時，我們很可能會希望所有 `todos` 查詢都失效，並可能重新獲取資料以顯示新的待辦事項。要做到這一點，你可以使用 `useMutation` 的 `onSuccess` 選項和 `client` 的 `invalidateQueries` 函式：

[//]: # 'Example2'

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// 當此異動成功時，使所有帶有 `todos` 或 `reminders` 查詢鍵 (query key) 的查詢失效
const mutation = useMutation({
  mutationFn: addTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
    queryClient.invalidateQueries({ queryKey: ['reminders'] })
  },
})
```

[//]: # 'Example2'

你可以使用 [`useMutation` 鉤子 (hook)](./mutations.md) 中提供的任何回調函式來設定失效的時機。
