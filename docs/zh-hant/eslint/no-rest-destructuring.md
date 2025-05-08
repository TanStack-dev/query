---
source-updated-at: '2024-01-26T20:53:47.000Z'
translation-updated-at: '2025-05-08T20:15:05.763Z'
id: no-rest-destructuring
title: 無其餘解構
---

禁止對查詢結果使用物件剩餘解構 (Disallow object rest destructuring on query results)

## 動機

在查詢結果上使用物件剩餘解構會自動訂閱查詢結果的每個欄位，這可能導致不必要的重新渲染。此規則確保您僅訂閱實際需要的欄位。

## 規則詳情

**錯誤**程式碼範例：

```tsx
/* eslint "@tanstack/query/no-rest-destructuring": "warn" */

const useTodos = () => {
  const { data: todos, ...rest } = useQuery({
    queryKey: ['todos'],
    queryFn: () => api.getTodos(),
  })
  return { todos, ...rest }
}
```

**正確**程式碼範例：

```tsx
const todosQuery = useQuery({
  queryKey: ['todos'],
  queryFn: () => api.getTodos(),
})

// 一般的物件解構是允許的
const { data: todos } = todosQuery
```

## 例外情況

若您手動設定 `notifyOnChangeProps` 選項，可以停用此規則。由於您未使用追蹤查詢，需自行指定哪些屬性應觸發重新渲染。

## 屬性

- [x] ✅ 推薦使用
- [ ] 🔧 可自動修復
