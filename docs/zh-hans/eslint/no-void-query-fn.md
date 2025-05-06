---
source-updated-at: '2025-04-07T09:17:45.000Z'
translation-updated-at: '2025-05-06T17:00:01.729Z'
id: no-void-query-fn
title: Disallow returning void from query functions
---

查询函数必须返回一个将被 TanStack Query 缓存的值。不返回值的函数（void 函数）可能导致意外行为，并可能表明实现中存在错误。

## 规则详情

该规则的**错误**代码示例：

```tsx
/* eslint "@tanstack/query/no-void-query-fn": "error" */

useQuery({
  queryKey: ['todos'],
  queryFn: async () => {
    await api.todos.fetch() // 函数未返回获取的数据
  },
})
```

该规则的**正确**代码示例：

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

## 属性

- [x] ✅ 推荐
- [ ] 🔧 可修复
