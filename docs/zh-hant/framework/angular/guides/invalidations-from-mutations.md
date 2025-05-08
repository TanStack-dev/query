---
source-updated-at: '2025-04-13T18:21:31.000Z'
translation-updated-at: '2025-05-08T20:25:35.319Z'
id: invalidations-from-mutations
title: 來自變更的失效
---

使查詢失效只是成功的一半，知道**何時**讓它們失效才是另一半。通常當應用程式中的一個變異 (mutation) 成功時，很可能會有相關的查詢需要失效，甚至可能需要重新獲取資料以反映變異帶來的新變更。

舉例來說，假設我們有一個新增待辦事項的變異：

```ts
mutation = injectMutation(() => ({
  mutationFn: postTodo,
}))
```

當 `postTodo` 變異成功時，我們很可能會希望所有 `todos` 查詢都失效，並可能重新獲取資料以顯示新的待辦事項。要做到這一點，你可以使用 `injectMutation` 的 `onSuccess` 選項和 `client` 的 `invalidateQueries` 函式：

```ts
import {
  injectMutation,
  QueryClient,
} from '@tanstack/angular-query-experimental'

export class TodosComponent {
  queryClient = inject(QueryClient)

  // 當此變異成功時，使任何帶有 `todos` 或 `reminders` 查詢鍵 (query key) 的查詢失效
  mutation = injectMutation(() => ({
    mutationFn: addTodo,
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['todos'] })
      this.queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  }))
}
```

你可以利用 [`injectMutation` 函式](./mutations.md) 中提供的任何回調 (callback) 來設定失效的時機。
