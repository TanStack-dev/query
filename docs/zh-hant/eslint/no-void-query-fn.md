---
source-updated-at: '2025-04-07T09:17:45.000Z'
translation-updated-at: '2025-05-08T20:14:52.848Z'
id: no-void-query-fn
title: Disallow returning void from query functions
---

查詢函式必須回傳一個會被 TanStack Query 快取的值。沒有回傳值的函式（void 函式）可能導致非預期的行為，並可能表示實作中存在錯誤。

## 規則詳情

此規則的**錯誤**程式碼範例：

```tsx
/* eslint "@tanstack/query/no-void-query-fn": "error" */

useQuery({
  queryKey: ['todos'],
  queryFn: async () => {
    await api.todos.fetch() // 函式未回傳取得的資料
  },
})
```

此規則的**正確**程式碼範例：

```tsx
/* eslint "@tanstack/query/no-void-query-fn": "error" */
useQuery({
  queryKey: ['todos'],
  queryFn: async () => {
    const todos = await api.todos.fetch()
    return todos
  },
})
```

## 屬性

- [x] ✅ 推薦
- [ ] 🔧 可自動修復
