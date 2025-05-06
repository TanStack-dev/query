---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T05:04:23.076Z'
id: initial-query-data
title: 初始查询数据
---
在需要之前，有多种方式可以为查询提供初始数据到缓存中：

- 声明式：
  - 为查询提供 `initialData`，以便在缓存为空时预填充
- 命令式：
  - [使用 `queryClient.prefetchQuery` 预取数据](./prefetching.md)
  - [使用 `queryClient.setQueryData` 手动将数据放入缓存](./prefetching.md)

## 使用 `initialData` 预填充查询

有时你可能已经在应用中拥有查询的初始数据，并可以直接提供给查询。这种情况下，你可以使用 `config.initialData` 选项来设置查询的初始数据，并跳过初始加载状态！

> 重要提示：`initialData` 会被持久化到缓存中，因此不建议为此选项提供占位符、部分或不完整的数据，而应使用 `placeholderData`。

```ts
result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: initialTodos,
}))
```

### `staleTime` 和 `initialDataUpdatedAt`

默认情况下，`initialData` 被视为完全新鲜的数据，就像刚刚获取的一样。这也意味着它会影响到 `staleTime` 选项的解释方式。

- 如果为查询观察者配置了 `initialData` 且没有 `staleTime`（默认 `staleTime: 0`），查询会立即重新获取：

```ts
// 会立即显示 initialTodos，但在创建组件或服务的实例时也会立即重新获取 todos
result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: initialTodos,
}))
```

- 如果为查询观察者配置了 `initialData` 且 `staleTime` 为 `1000` 毫秒，数据将在相同时间内被视为新鲜数据，就像刚刚从查询函数中获取的一样。

```ts
// 立即显示 initialTodos，但在 1000 毫秒后遇到另一个交互事件之前不会重新获取
result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: initialTodos,
  staleTime: 1000,
}))
```

- 那么如果 `initialData` 不是完全新鲜的怎么办？这引出了最后一种配置，它实际上是最准确的，并使用了一个名为 `initialDataUpdatedAt` 的选项。该选项允许你传递一个以毫秒为单位的 JS 时间戳，表示 `initialData` 上次更新的时间，例如 `Date.now()` 提供的时间戳。请注意，如果你有一个 Unix 时间戳，需要通过乘以 `1000` 将其转换为 JS 时间戳。

```ts
// 立即显示 initialTodos，但在 1 分钟后遇到另一个交互事件之前不会重新获取
result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: initialTodos,
  staleTime: 60 * 1000, // 1 分钟
  // 可能是 10 秒前或 10 分钟前
  initialDataUpdatedAt: initialTodosUpdatedTimestamp, // 例如 1608412420052
}))
```

该选项允许 `staleTime` 用于其原始目的，即确定数据需要多新鲜，同时也允许在初始化时重新获取数据（如果 `initialData` 比 `staleTime` 更旧）。在上面的示例中，我们的数据需要在 1 分钟内保持新鲜，并且我们可以提示查询 `initialData` 上次更新的时间，以便查询自行决定是否需要重新获取数据。

> 如果你更愿意将数据视为 **预取数据**，建议使用 `prefetchQuery` 或 `fetchQuery` API 预先填充缓存，从而可以独立于 `initialData` 配置 `staleTime`。

### 初始数据函数

如果访问查询初始数据的过程很耗时，或者你不希望在每次服务或组件实例上执行该过程，可以将一个函数作为 `initialData` 的值传递。该函数仅在查询初始化时执行一次，从而节省宝贵的内存和/或 CPU：

```ts
result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: () => getExpensiveTodos(),
}))
```

### 从缓存中获取初始数据

在某些情况下，你可以从另一个查询的缓存结果中为查询提供初始数据。一个很好的例子是从 todos 列表查询中搜索缓存的单个 todo 项数据，然后将其用作单个 todo 查询的初始数据：

```ts
result = injectQuery(() => ({
  queryKey: ['todo', this.todoId()],
  queryFn: () => fetch('/todos'),
  initialData: () => {
    // 使用 'todos' 查询中的一个 todo 作为此 todo 查询的初始数据
    return this.queryClient
      .getQueryData(['todos'])
      ?.find((d) => d.id === this.todoId())
  },
}))
```

### 从缓存中获取初始数据并设置 `initialDataUpdatedAt`

从缓存中获取初始数据意味着你用于查找初始数据的源查询可能已经过时。与其使用人为的 `staleTime` 来防止查询立即重新获取，建议将源查询的 `dataUpdatedAt` 传递给 `initialDataUpdatedAt`。这为查询实例提供了所需的所有信息，以确定是否以及何时需要重新获取查询，而不管是否提供了初始数据。

```ts
result = injectQuery(() => ({
  queryKey: ['todos', this.todoId()],
  queryFn: () => fetch(`/todos/${this.todoId()}`),
  initialData: () =>
    queryClient.getQueryData(['todos'])?.find((d) => d.id === this.todoId()),
  initialDataUpdatedAt: () =>
    queryClient.getQueryState(['todos'])?.dataUpdatedAt,
}))
```

### 从缓存中条件性获取初始数据

如果用于查找初始数据的源查询已经过时，你可能根本不想使用缓存的数据，而是直接从服务器获取。为了更容易做出这个决定，可以使用 `queryClient.getQueryState` 方法来获取有关源查询的更多信息，包括 `state.dataUpdatedAt` 时间戳，你可以用它来决定查询是否足够“新鲜”以满足你的需求：

```ts
result = injectQuery(() => ({
  queryKey: ['todo', this.todoId()],
  queryFn: () => fetch(`/todos/${this.todoId()}`),
  initialData: () => {
    // 获取查询状态
    const state = queryClient.getQueryState(['todos'])

    // 如果查询存在且数据不超过 10 秒...
    if (state && Date.now() - state.dataUpdatedAt <= 10 * 1000) {
      // 返回单个 todo
      return state.data.find((d) => d.id === this.todoId())
    }

    // 否则返回 undefined，让它从硬加载状态获取！
  },
}))
```
