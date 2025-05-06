---
source-updated-at: '2024-11-19T18:32:49.000Z'
translation-updated-at: '2025-05-06T05:00:55.440Z'
id: optimistic-updates
title: 乐观更新
---

Angular Query 提供了两种在变更操作完成前乐观更新 UI 的方式。您既可以使用 `onMutate` 选项直接更新缓存，也可以利用 `injectMutation` 返回的 `variables` 从结果中更新 UI。

## 通过 UI 更新

这是更简单的实现方式，因为它不直接与缓存交互。

```ts
addTodo = injectMutation(() => ({
  mutationFn: (newTodo: string) => axios.post('/api/data', { text: newTodo }),
  // 确保返回查询失效的 Promise
  // 使变更保持 `pending` 状态直到重新获取完成
  onSettled: async () => {
    return await queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
}))
```

之后您可以通过 `addTodo.variables` 访问新增的待办事项。在渲染查询的 UI 列表中，当变更处于 `isPending` 状态时，您可以向列表追加一个临时项：

```angular-ts
@Component({
  template: `
    @for (todo of todos.data(); track todo.id) {
      <li>{{ todo.title }}</li>
    }
    @if (addTodo.isPending()) {
      <li style="opacity: 0.5">{{ addTodo.variables() }}</li>
    }
  `,
})
class TodosComponent {}
```

我们通过不同的 `opacity` 样式渲染临时项，直到变更完成。成功后该项会自动消失。如果重新获取成功，该项会作为"正常条目"出现在列表中。

若变更出错，该项同样会消失。但如果我们希望保留显示，可以通过检查变更的 `isError` 状态实现。出错时 `variables` 不会被清除，因此我们仍可访问它们，甚至可以显示重试按钮：

```angular-ts
@Component({
  template: `
    @if (addTodo.isError()) {
      <li style="color: red">
        {{ addTodo.variables() }}
        <button (click)="addTodo.mutate(addTodo.variables())">Retry</button>
      </li>
    }
  `,
})
class TodosComponent {}
```

### 当变更与查询不在同一组件时

这种方式在变更与查询同处一个组件时效果最佳。但您也可以通过专用的 `injectMutationState` 函数访问其他组件中的所有变更，建议配合 `mutationKey` 使用：

```ts
// 在应用某处
addTodo = injectMutation(() => ({
  mutationFn: (newTodo: string) => axios.post('/api/data', { text: newTodo }),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  mutationKey: ['addTodo'],
}))

// 在其他位置访问变量
mutationState = injectMutationState<string>(() => ({
  filters: { mutationKey: ['addTodo'], status: 'pending' },
  select: (mutation) => mutation.state.variables,
}))
```

由于可能同时存在多个变更，`variables` 会是一个数组。如果需要唯一键，我们还可以选择 `mutation.state.submittedAt`，这将使并发乐观更新变得轻而易举。

## 通过缓存更新

在执行变更前乐观更新状态时，存在操作失败的可能性。多数情况下只需触发乐观查询的重新获取即可恢复至真实服务端状态。但某些情况下重新获取可能失效，此时您可以选择回滚更新。

通过 `injectMutation` 的 `onMutate` 处理程序，您可以返回一个值，该值将作为最后一个参数传递给 `onError` 和 `onSettled` 处理程序。通常传递回滚函数最为实用。

### 添加新待办事项时更新列表

```ts
queryClient = inject(QueryClient)

updateTodo = injectMutation(() => ({
  mutationFn: updateTodo,
  // 当调用 mutate 时：
  onMutate: async (newTodo) => {
    // 取消所有待处理的查询
    // (防止覆盖我们的乐观更新)
    await this.queryClient.cancelQueries({ queryKey: ['todos'] })

    // 保存当前值的快照
    const previousTodos = client.getQueryData(['todos'])

    // 乐观更新为新值
    this.queryClient.setQueryData(['todos'], (old) => [...old, newTodo])

    // 返回包含快照值的上下文对象
    return { previousTodos }
  },
  // 如果变更失败
  // 使用 onMutate 返回的上下文进行回滚
  onError: (err, newTodo, context) => {
    client.setQueryData(['todos'], context.previousTodos)
  },
  // 无论成功失败都重新获取：
  onSettled: () => {
    this.queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
}))
```

### 更新单个待办事项

```ts
queryClient = inject(QueryClient)

updateTodo = injectMutation(() => ({
  mutationFn: updateTodo,
  // 当调用 mutate 时：
  onMutate: async (newTodo) => {
    // 取消相关查询
    await this.queryClient.cancelQueries({ queryKey: ['todos', newTodo.id] })

    // 保存当前值的快照
    const previousTodo = this.queryClient.getQueryData(['todos', newTodo.id])

    // 乐观更新
    this.queryClient.setQueryData(['todos', newTodo.id], newTodo)

    // 返回包含新旧值的上下文
    return { previousTodo, newTodo }
  },
  // 出错时使用上文返回的上下文
  onError: (err, newTodo, context) => {
    this.queryClient.setQueryData(
      ['todos', context.newTodo.id],
      context.previousTodo,
    )
  },
  // 总是重新获取：
  onSettled: (newTodo) => {
    this.queryClient.invalidateQueries({ queryKey: ['todos', newTodo.id] })
  },
}))
```

您也可以用 `onSettled` 替代单独的 `onError` 和 `onSuccess` 处理程序：

```ts
injectMutation({
  mutationFn: updateTodo,
  // ...
  onSettled: (newTodo, error, variables, context) => {
    if (error) {
      // 错误处理
    }
  },
})
```

## 方案选择建议

如果只需在单一位置显示乐观结果，使用 `variables` 直接更新 UI 的方式代码更少且更易维护。例如您完全不需要处理回滚逻辑。

但如果您需要在屏幕上多个位置同步更新状态，直接操作缓存的方式会自动为您处理这些关联更新。
