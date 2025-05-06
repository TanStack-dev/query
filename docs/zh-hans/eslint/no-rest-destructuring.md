---
source-updated-at: '2024-01-26T20:53:47.000Z'
translation-updated-at: '2025-05-06T03:49:19.238Z'
id: no-rest-destructuring
title: 禁止剩余解构
---

对查询结果使用对象剩余解构会自动订阅查询结果的每个字段，可能导致不必要的重新渲染。  
此规则确保你仅订阅实际需要的字段。

## 规则详情

**错误**代码示例：

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

**正确**代码示例：

```tsx
const todosQuery = useQuery({
  queryKey: ['todos'],
  queryFn: () => api.getTodos(),
})

// 普通对象解构是允许的
const { data: todos } = todosQuery
```

## 何时禁用

如果手动设置了 `notifyOnChangeProps` 选项，可以禁用此规则。  
由于未使用追踪查询，你需要自行指定哪些属性应触发重新渲染。

## 特性

- [x] ✅ 推荐规则
- [ ] 🔧 可自动修复
