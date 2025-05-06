---
source-updated-at: '2024-01-26T20:53:47.000Z'
translation-updated-at: '2025-05-06T03:49:05.078Z'
id: exhaustive-deps
title: 彻底依赖检查
---
应将查询键 (query keys) 视为查询函数 (query function) 的依赖数组：所有在 queryFn 内部使用的变量都应添加到查询键中。这确保了查询能够独立缓存，并在变量变化时自动重新获取数据。

## 规则详情

**错误**代码示例：

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

**正确**代码示例：

```tsx
useQuery({
  queryKey: ['todo', todoId],
  queryFn: () => api.getTodo(todoId),
})

const todoQueries = {
  detail: (id) => ({ queryKey: ['todo', id], queryFn: () => api.getTodo(id) }),
}
```

## 何时不使用

如果您不关心查询键 (query keys) 的规则，则无需启用此规则。

## 属性

- [x] ✅ 推荐启用  
- [x] 🔧 可自动修复
