---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T04:54:01.961Z'
id: query-keys
title: 查询键
---
TanStack Query 的核心是基于查询键 (query keys) 为您管理查询缓存。查询键在顶层必须是一个数组，可以简单到仅包含单个字符串的数组，也可以复杂到包含多个字符串和嵌套对象的数组。只要查询键是可序列化的，并且**能唯一标识查询的数据**，您就可以使用它！

## 简单查询键

最简单的键形式是由常量值组成的数组。这种格式适用于：

- 通用列表/索引资源
- 非层级化资源

```ts
// 待办事项列表
injectQuery(() => ({ queryKey: ['todos'], ... }))

// 其他任意内容！
injectQuery(() => ({ queryKey: ['something', 'special'], ... }))
```

## 带变量的数组键

当查询需要更多信息来唯一描述其数据时，您可以使用包含字符串和任意数量可序列化对象的数组。这种形式适用于：

- 层级化或嵌套资源
  - 通常会传递 ID、索引或其他原始值来唯一标识项
- 带附加参数的查询
  - 通常会传递包含附加选项的对象

```ts
// 单个待办事项
injectQuery(() => ({queryKey: ['todo', 5], ...}))

// "预览"格式的单个待办事项
injectQuery(() => ({queryKey: ['todo', 5, {preview: true}], ...}))

// 已完成待办事项列表
injectQuery(() => ({queryKey: ['todos', {type: 'done'}], ...}))
```

## 查询键会被确定性哈希！

这意味着无论对象中键的顺序如何，以下所有查询都被视为等同：

```ts
injectQuery(() => ({ queryKey: ['todos', { status, page }], ... }))
injectQuery(() => ({ queryKey: ['todos', { page, status }], ...}))
injectQuery(() => ({ queryKey: ['todos', { page, status, other: undefined }], ... }))
```

但以下查询键并不等同。数组项的顺序很重要！

```ts
injectQuery(() => ({ queryKey: ['todos', status, page], ... }))
injectQuery(() => ({ queryKey: ['todos', page, status], ...}))
injectQuery(() => ({ queryKey: ['todos', undefined, page, status], ...}))
```

## 如果查询函数依赖变量，请将其包含在查询键中

由于查询键唯一描述了它们获取的数据，因此应包含查询函数中使用的任何**会变化**的变量。例如：

```ts
todoId = signal(-1)

injectQuery(() => ({
  enabled: todoId() > 0,
  queryKey: ['todos', todoId()],
  queryFn: () => fetchTodoById(todoId()),
}))
```

请注意，查询键充当查询函数的依赖项。将依赖变量添加到查询键可确保查询被独立缓存，并且每当变量变化时，_查询会自动重新获取_（取决于您的 `staleTime` 设置）。更多信息和示例请参阅 [exhaustive-deps](../../../eslint/exhaustive-deps.md) 部分。
