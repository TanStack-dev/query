---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:09:40.213Z'
id: query-keys
title: 查询键
---
TanStack Query 的核心是基于查询键 (query keys) 为你管理查询缓存。查询键在顶层必须是一个数组，可以简单到只包含单个字符串的数组，也可以复杂到包含多个字符串和嵌套对象的数组。只要查询键是可序列化的，并且**能唯一标识查询的数据**，你就可以使用它！

## 简单查询键

最简单的键形式是由常量值组成的数组。这种格式适用于：

- 通用列表/索引资源
- 非层级化资源

[//]: # '示例'

```tsx
// 待办事项列表
useQuery({ queryKey: ['todos'], ... })

// 其他任意内容！
useQuery({ queryKey: ['something', 'special'], ... })
```

[//]: # '示例'

## 带变量的数组键

当查询需要更多信息来唯一描述其数据时，你可以使用包含字符串和任意数量可序列化对象的数组。这适用于：

- 层级化或嵌套资源
  - 通常会传递 ID、索引或其他原始值来唯一标识项目
- 带附加参数的查询
  - 通常会传递包含附加选项的对象

[//]: # '示例2'

```tsx
// 单个待办事项
useQuery({ queryKey: ['todo', 5], ... })

// "预览"格式的单个待办事项
useQuery({ queryKey: ['todo', 5, { preview: true }], ...})

// 已完成的待办事项列表
useQuery({ queryKey: ['todos', { type: 'done' }], ... })
```

[//]: # '示例2'

## 查询键会被确定性地哈希处理！

这意味着无论对象中键的顺序如何，以下所有查询都被视为相等：

[//]: # '示例3'

```tsx
useQuery({ queryKey: ['todos', { status, page }], ... })
useQuery({ queryKey: ['todos', { page, status }], ...})
useQuery({ queryKey: ['todos', { page, status, other: undefined }], ... })
```

[//]: # '示例3'

然而以下查询键并不相等。数组项的顺序很重要！

[//]: # '示例4'

```tsx
useQuery({ queryKey: ['todos', status, page], ... })
useQuery({ queryKey: ['todos', page, status], ...})
useQuery({ queryKey: ['todos', undefined, page, status], ...})
```

[//]: # '示例4'

## 如果查询函数依赖变量，请将其包含在查询键中

由于查询键唯一描述了它们获取的数据，因此应该包含查询函数中使用的任何**会变化**的变量。例如：

[//]: # '示例5'

```tsx
function Todos({ todoId }) {
  const result = useQuery({
    queryKey: ['todos', todoId],
    queryFn: () => fetchTodoById(todoId),
  })
}
```

[//]: # '示例5'

请注意，查询键充当查询函数的依赖项。将依赖变量添加到查询键中可确保查询被独立缓存，并且每当变量变化时，_查询会自动重新获取_（取决于你的 `staleTime` 设置）。更多信息和示例请参阅[全面依赖项](../../../eslint/exhaustive-deps.md)部分。

[//]: # '材料'

## 延伸阅读

关于在大型应用中组织查询键的技巧，请参阅[高效 React Query 键](../community/tkdodos-blog.md#8-effective-react-query-keys)，并查看社区资源中的[查询键工厂包](../community/community-projects.md#query-key-factory)。

[//]: # '材料'
