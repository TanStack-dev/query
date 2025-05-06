---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:13:31.868Z'
id: initial-query-data
title: 初始查询数据
---

在需要之前，有多种方式可以为查询缓存提供初始数据：

- 声明式：
  - 通过 `initialData` 为查询预填充空缓存
- 命令式：
  - [使用 `queryClient.prefetchQuery` 预取数据](./prefetching.md)
  - [使用 `queryClient.setQueryData` 手动将数据存入缓存](./prefetching.md)

## 使用 `initialData` 预填充查询

有时应用中已存在查询所需的初始数据，可直接提供给查询。此时可通过 `config.initialData` 选项设置查询初始数据，并跳过初始加载状态！

> 重要提示：`initialData` 会持久化到缓存，因此不建议向该选项提供占位、部分或不完整数据，应改用 `placeholderData`

[//]: # '示例'

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: initialTodos,
})
```

[//]: # '示例'

### `staleTime` 与 `initialDataUpdatedAt`

默认情况下，`initialData` 被视为全新数据（如同刚获取的数据）。这会影响 `staleTime` 选项的解读方式：

- 若为查询观察者配置 `initialData` 且未设置 `staleTime`（默认 `staleTime: 0`），挂载时会立即重新获取数据：

  [//]: # '示例2'

  ```tsx
  // 立即显示 initialTodos，但挂载后会立即重新获取 todos
  const result = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    initialData: initialTodos,
  })
  ```

  [//]: # '示例2'

- 若配置 `initialData` 并设置 `staleTime` 为 `1000` 毫秒，数据在该时间段内将被视为新鲜数据（如同刚从查询函数获取）：

  [//]: # '示例3'

  ```tsx
  // 立即显示 initialTodos，但在 1000 毫秒后遇到交互事件前不会重新获取
  const result = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    initialData: initialTodos,
    staleTime: 1000,
  })
  ```

  [//]: # '示例3'

- 如果 `initialData` 并非完全新鲜？此时最准确的配置是使用 `initialDataUpdatedAt` 选项。该选项允许传入 JS 时间戳（毫秒）表示初始数据的最后更新时间（如 `Date.now()` 提供的值）。注意：若使用 Unix 时间戳需乘以 `1000` 转换为 JS 时间戳。

  [//]: # '示例4'

  ```tsx
  // 立即显示 initialTodos，但仅在 initialData 早于 staleTime 时挂载重新获取
  const result = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    initialData: initialTodos,
    staleTime: 60 * 1000, // 1 分钟
    initialDataUpdatedAt: initialTodosUpdatedTimestamp, // 例如 1608412420052
  })
  ```

  [//]: # '示例4'

  该选项使得 `staleTime` 能按其原始目的（确定数据需保持新鲜的时间）运作，同时允许在 `initialData` 早于 `staleTime` 时挂载重新获取。上例中数据需在 1 分钟内保持新鲜，通过提示初始数据的更新时间，查询能自行决定是否需要重新获取。

  > 若希望将数据视为**预取数据**，建议使用 `prefetchQuery` 或 `fetchQuery` API 预先填充缓存，从而独立配置 `staleTime` 与初始数据

### 初始数据函数

若获取查询初始数据的操作开销较大或不想在每次渲染时执行，可传递函数作为 `initialData` 值。该函数仅在查询初始化时执行一次，节省内存和 CPU 资源：

[//]: # '示例5'

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: () => getExpensiveTodos(),
})
```

[//]: # '示例5'

### 从缓存获取初始数据

某些情况下，可以从其他查询的缓存结果中提供初始数据。典型场景是从待办列表查询缓存中搜索单个待办项，并将其作为单个待办查询的初始数据：

[//]: # '示例6'

```tsx
const result = useQuery({
  queryKey: ['todo', todoId],
  queryFn: () => fetch('/todos'),
  initialData: () => {
    // 使用 'todos' 查询中的待办项作为本查询的初始数据
    return queryClient.getQueryData(['todos'])?.find((d) => d.id === todoId)
  },
})
```

[//]: # '示例6'

### 使用 `initialDataUpdatedAt` 从缓存获取初始数据

从缓存获取初始数据意味着源查询的数据可能已过时。建议将源查询的 `dataUpdatedAt` 传递给 `initialDataUpdatedAt`，而非使用人为的 `staleTime` 防止立即重新获取。这为查询实例提供了判断是否需要重新获取的全部信息：

[//]: # '示例7'

```tsx
const result = useQuery({
  queryKey: ['todos', todoId],
  queryFn: () => fetch(`/todos/${todoId}`),
  initialData: () =>
    queryClient.getQueryData(['todos'])?.find((d) => d.id === todoId),
  initialDataUpdatedAt: () =>
    queryClient.getQueryState(['todos'])?.dataUpdatedAt,
})
```

[//]: # '示例7'

### 有条件地从缓存获取初始数据

若用于查找初始数据的源查询已过时，可能希望完全不使用缓存数据而直接从服务器获取。可通过 `queryClient.getQueryState` 获取源查询的详细信息（包括 `state.dataUpdatedAt` 时间戳），据此判断数据是否足够新鲜：

[//]: # '示例8'

```tsx
const result = useQuery({
  queryKey: ['todo', todoId],
  queryFn: () => fetch(`/todos/${todoId}`),
  initialData: () => {
    // 获取查询状态
    const state = queryClient.getQueryState(['todos'])

    // 如果查询存在且数据不早于 10 秒...
    if (state && Date.now() - state.dataUpdatedAt <= 10 * 1000) {
      // 返回单个待办项
      return state.data.find((d) => d.id === todoId)
    }

    // 否则返回 undefined 并从硬加载状态获取！
  },
})
```

[//]: # '示例8'
[//]: # '材料'

## 延伸阅读

关于 `Initial Data` 与 `Placeholder Data` 的对比，请参阅[社区资源](../community/tkdodos-blog.md#9-placeholder-and-initial-data-in-react-query)。

[//]: # '材料'
