---
source-updated-at: '2025-03-26T09:27:36.000Z'
translation-updated-at: '2025-05-06T04:12:25.239Z'
id: optimistic-updates
title: 乐观更新
---

React Query 提供了两种在变更操作完成前乐观更新 UI 的方式。你可以直接使用 `onMutate` 选项更新缓存，或者利用 `useMutation` 返回的 `variables` 来更新 UI。

## 通过 UI 更新

这是更简单的实现方式，因为它不直接与缓存交互。

[//]: # 'ExampleUI1'

```tsx
const addTodoMutation = useMutation({
  mutationFn: (newTodo: string) => axios.post('/api/data', { text: newTodo }),
  // 确保返回查询失效的 Promise
  // 这样变更会保持 `pending` 状态直到重新获取完成
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})

const { isPending, submittedAt, variables, mutate, isError } = addTodoMutation
```

[//]: # 'ExampleUI1'

之后你可以访问 `addTodoMutation.variables` 获取新增的待办事项。在渲染查询结果的 UI 列表中，当变更处于 `isPending` 状态时，可以临时添加一项：

[//]: # 'ExampleUI2'

```tsx
<ul>
  {todoQuery.items.map((todo) => (
    <li key={todo.id}>{todo.text}</li>
  ))}
  {isPending && <li style={{ opacity: 0.5 }}>{variables}</li>}
</ul>
```

[//]: # 'ExampleUI2'

我们通过不同的 `opacity` 样式渲染临时项，直到变更完成。成功后该项会自动消失。如果重新获取成功，列表中会显示为正常项。

若变更失败，该项同样会消失。但如需保留显示，可以通过检查变更的 `isError` 状态实现。出错时 `variables` 不会被清除，因此仍可访问，甚至显示重试按钮：

[//]: # 'ExampleUI3'

```tsx
{
  isError && (
    <li style={{ color: 'red' }}>
      {variables}
      <button onClick={() => mutate(variables)}>重试</button>
    </li>
  )
}
```

[//]: # 'ExampleUI3'

### 当变更与查询不在同一组件时

若变更与查询位于同一组件，此方案效果良好。但通过专用的 `useMutationState` 钩子，你也能在其他组件访问所有变更。最佳实践是配合 `mutationKey` 使用：

[//]: # 'ExampleUI4'

```tsx
// 应用某处
const { mutate } = useMutation({
  mutationFn: (newTodo: string) => axios.post('/api/data', { text: newTodo }),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  mutationKey: ['addTodo'],
})

// 在其他位置访问 variables
const variables = useMutationState<string>({
  filters: { mutationKey: ['addTodo'], status: 'pending' },
  select: (mutation) => mutation.state.variables,
})
```

[//]: # 'ExampleUI4'

`variables` 会是 `Array` 类型，因为可能同时存在多个进行中的变更。如需为项生成唯一键，还可选择 `mutation.state.submittedAt`。这让处理并发的乐观更新变得轻松。

## 通过缓存更新

在变更前乐观更新状态时，存在操作失败的可能。多数情况下只需重新获取乐观查询即可恢复至真实服务端状态。但某些场景下重新获取可能失效，此时需手动回滚更新。

为此，`useMutation` 的 `onMutate` 处理程序允许返回一个值，该值将作为末参数传递给 `onError` 和 `onSettled` 处理程序。通常传递回滚函数最为实用。

### 新增待办事项时更新列表

[//]: # 'Example'

```tsx
const queryClient = useQueryClient()

useMutation({
  mutationFn: updateTodo,
  // 当 mutate 调用时：
  onMutate: async (newTodo) => {
    // 取消所有进行中的重新获取
    // (避免覆盖我们的乐观更新)
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 保存当前值的快照
    const previousTodos = queryClient.getQueryData(['todos'])

    // 乐观更新至新值
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo])

    // 返回包含快照值的上下文对象
    return { previousTodos }
  },
  // 若变更失败
  // 使用 onMutate 返回的上下文回滚
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos)
  },
  // 无论成功失败都重新获取：
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})
```

[//]: # 'Example'

### 更新单个待办事项

[//]: # 'Example2'

```tsx
useMutation({
  mutationFn: updateTodo,
  // 当 mutate 调用时：
  onMutate: async (newTodo) => {
    // 取消相关重新获取
    await queryClient.cancelQueries({ queryKey: ['todos', newTodo.id] })

    // 保存旧值快照
    const previousTodo = queryClient.getQueryData(['todos', newTodo.id])

    // 乐观更新
    queryClient.setQueryData(['todos', newTodo.id], newTodo)

    // 返回包含新旧值的上下文
    return { previousTodo, newTodo }
  },
  // 失败时使用上方返回的上下文
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(
      ['todos', context.newTodo.id],
      context.previousTodo,
    )
  },
  // 总是重新获取：
  onSettled: (newTodo) =>
    queryClient.invalidateQueries({ queryKey: ['todos', newTodo.id] }),
})
```

[//]: # 'Example2'

也可用 `onSettled` 替代单独的 `onError` 和 `onSuccess` 处理程序：

[//]: # 'Example3'

```tsx
useMutation({
  mutationFn: updateTodo,
  // ...
  onSettled: async (newTodo, error, variables, context) => {
    if (error) {
      // 错误处理
    }
  },
})
```

[//]: # 'Example3'

## 方案选择建议

若只需在单一位置显示乐观结果，使用 `variables` 直接更新 UI 的方案代码更少且更易理解。例如完全无需处理回滚。

但若界面有多个位置需要感知更新，直接操作缓存会自动同步所有相关位置。
