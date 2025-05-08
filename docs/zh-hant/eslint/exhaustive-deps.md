---
source-updated-at: '2024-01-26T20:53:47.000Z'
translation-updated-at: '2025-05-08T20:15:06.785Z'
id: exhaustive-deps
title: 徹底依賴檢查
---

查詢鍵 (query keys) 應視為查詢函式的依賴陣列 (dependency array)：任何在 queryFn 中使用的變數都應加入查詢鍵中。  
這能確保查詢會被獨立快取，且當變數變更時查詢會自動重新取得。

## 規則詳情

**錯誤**程式碼範例：

```tsx
/* eslint "@tanstack/query/exhaustive-deps": "error" */

useQuery({
  queryKey: ['todo'],
  queryFn: () => api.getTodo(todoId),
})

const todoQueries = {
  detail: (id) => ({ queryKey: ['todo'], queryFn: () => api.getTodo(id) }),
}
```

**正確**程式碼範例：

```tsx
useQuery({
  queryKey: ['todo', todoId],
  queryFn: () => api.getTodo(todoId),
})

const todoQueries = {
  detail: (id) => ({ queryKey: ['todo', id], queryFn: () => api.getTodo(id) }),
}
```

## 不適用情境

若您不在意查詢鍵的規則，則不需要此規則。

## 屬性

- [x] ✅ 推薦
- [x] 🔧 可自動修復
