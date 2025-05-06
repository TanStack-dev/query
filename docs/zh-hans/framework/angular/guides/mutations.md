---
source-updated-at: '2024-07-19T09:36:35.000Z'
translation-updated-at: '2025-05-06T05:02:49.197Z'
id: mutations
title: 变更
---

与查询 (query) 不同，变更 (mutation) 通常用于创建/更新/删除数据或执行服务端副作用。为此，TanStack Query 导出了 `injectMutation` 函数。

以下是一个向服务器添加新待办事项的变更示例：

```angular-ts
@Component({
  template: `
    <div>
      @if (mutation.isPending()) {
        <span>添加待办事项中...</span>
      } @else if (mutation.isError()) {
        <div>发生错误：{{ mutation.error()?.message }}</div>
      } @else if (mutation.isSuccess()) {
        <div>待办事项已添加！</div>
      }
      <button (click)="mutation.mutate(1)">创建待办事项</button>
    </div>
  `,
})
export class TodosComponent {
  todoService = inject(TodoService)
  mutation = injectMutation(() => ({
    mutationFn: (todoId: number) =>
      lastValueFrom(this.todoService.create(todoId)),
  }))
}
```

变更在任何时刻只能处于以下状态之一：

- `isIdle` 或 `status === 'idle'` - 变更当前处于空闲或重置状态
- `isPending` 或 `status === 'pending'` - 变更正在执行中
- `isError` 或 `status === 'error'` - 变更遇到错误
- `isSuccess` 或 `status === 'success'` - 变更成功完成且数据可用

除这些主要状态外，根据变更状态还可获取更多信息：

- `error` - 如果变更处于 `error` 状态，可通过 `error` 属性获取错误信息
- `data` - 如果变更处于 `success` 状态，可通过 `data` 属性获取返回数据

在上例中，您还可以看到通过调用 `mutate` 函数并传入**单个变量或对象**来向变更函数传递参数。

仅使用变量时，变更并不特殊，但当与 `onSuccess` 选项、[Query Client 的 `invalidateQueries` 方法](../../../reference/QueryClient.md#queryclientinvalidatequeries) 以及 [Query Client 的 `setQueryData` 方法](../../../reference/QueryClient.md#queryclientsetquerydata) 结合使用时，变更将成为非常强大的工具。

## 重置变更状态

有时您需要清除变更请求的 `error` 或 `data`。为此，可以使用 `reset` 函数处理：

```angular-ts
@Component({
  standalone: true,
  selector: 'todo-item',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="todoForm" (ngSubmit)="onCreateTodo()">
      @if (mutation.error()) {
        <h5 (click)="mutation.reset()">{{ mutation.error() }}</h5>
      }
      <input type="text" formControlName="title" />
      <br />
      <button type="submit">创建待办事项</button>
    </form>
  `,
})
export class TodosComponent {
  mutation = injectMutation(() => ({
    mutationFn: createTodo,
  }))

  fb = inject(NonNullableFormBuilder)

  todoForm = this.fb.group({
    title: this.fb.control('', {
      validators: [Validators.required],
    }),
  })

  title = toSignal(this.todoForm.controls.title.valueChanges, {
    initialValue: '',
  })

  onCreateTodo = () => {
    this.mutation.mutate(this.title())
  }
}
```

## 变更副作用

`injectMutation` 提供了一些辅助选项，允许在变更生命周期的任何阶段快速实现副作用。这些选项对于[变更后使查询失效并重新获取](./invalidations-from-mutations.md)甚至[乐观更新](./optimistic-updates.md)非常有用。

```ts
mutation = injectMutation(() => ({
  mutationFn: addTodo,
  onMutate: (variables) => {
    // 变更即将执行！
    // 可选返回包含数据的上下文，用于回滚等场景
    return { id: 1 }
  },
  onError: (error, variables, context) => {
    // 发生错误！
    console.log(`正在回滚 ID 为 ${context.id} 的乐观更新`)
  },
  onSuccess: (data, variables, context) => {
    // 成功！
  },
  onSettled: (data, error, variables, context) => {
    // 无论成功或失败都会执行！
  },
}))
```

在任何回调函数中返回 Promise 时，会先等待该 Promise 完成再执行下一个回调：

```ts
mutation = injectMutation(() => ({
  mutationFn: addTodo,
  onSuccess: async () => {
    console.log('我先执行！')
  },
  onSettled: async () => {
    console.log('我第二个执行！')
  },
}))
```

您可能希望在调用 `mutate` 时**触发额外的回调**，而不仅限于 `injectMutation` 定义的回调。这可用于触发组件特定的副作用。为此，您可以在变更变量后向 `mutate` 函数提供相同的回调选项。支持的选项包括：`onSuccess`、`onError` 和 `onSettled`。请注意，如果组件在变更完成前被销毁，这些额外回调将不会执行。

```ts
mutation = injectMutation(() => ({
  mutationFn: addTodo,
  onSuccess: (data, variables, context) => {
    // 我会第一个触发
  },
  onError: (error, variables, context) => {
    // 我会第一个触发
  },
  onSettled: (data, error, variables, context) => {
    // 我会第一个触发
  },
}))

mutation.mutate(todo, {
  onSuccess: (data, variables, context) => {
    // 我会第二个触发！
  },
  onError: (error, variables, context) => {
    // 我会第二个触发！
  },
  onSettled: (data, error, variables, context) => {
    // 我会第二个触发！
  },
})
```

### 连续变更

处理连续变更时，`onSuccess`、`onError` 和 `onSettled` 回调的行为略有不同。当传递给 `mutate` 函数时，它们只会在组件仍处于活动状态时触发一次。这是因为每次调用 `mutate` 函数时，变更观察器都会被移除并重新订阅。相反，`injectMutation` 的处理程序会为每个 `mutate` 调用执行。

> 请注意，传递给 `injectMutation` 的 `mutationFn` 很可能是异步的。在这种情况下，变更完成的顺序可能与 `mutate` 函数调用的顺序不同。

```ts
export class Example {
  mutation = injectMutation(() => ({
    mutationFn: addTodo,
    onSuccess: (data, variables, context) => {
      // 会被调用 3 次
    },
  }))

  doMutations() {
    ;['Todo 1', 'Todo 2', 'Todo 3'].forEach((todo) => {
      this.mutation.mutate(todo, {
        onSuccess: (data, variables, context) => {
          // 只会执行一次，针对最后一个变更 (Todo 3)，
          // 无论哪个变更先完成
        },
      })
    })
  }
}
```

## Promise

使用 `mutateAsync` 替代 `mutate` 可以获取一个 Promise，该 Promise 在成功时解析或在出错时抛出异常。例如，这可用于组合副作用。

```ts
mutation = injectMutation(() => ({ mutationFn: addTodo }))

try {
  const todo = await mutation.mutateAsync(todo)
  console.log(todo)
} catch (error) {
  console.error(error)
} finally {
  console.log('完成')
}
```

## 重试

默认情况下，TanStack Query 不会在出错时重试变更，但可以通过 `retry` 选项启用：

```ts
mutation = injectMutation(() => ({
  mutationFn: addTodo,
  retry: 3,
}))
```

如果因设备离线导致变更失败，它们会在设备重新连接时按相同顺序重试。

## 持久化变更

如果需要，可以将变更持久化到存储中，并在以后恢复。这可以通过水合 (hydration) 函数实现：

```ts
const queryClient = new QueryClient()

// 定义 "addTodo" 变更
queryClient.setMutationDefaults(['addTodo'], {
  mutationFn: addTodo,
  onMutate: async (variables) => {
    // 取消当前待办事项列表的查询
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 创建乐观待办事项
    const optimisticTodo = { id: uuid(), title: variables.title }

    // 将乐观待办事项添加到列表
    queryClient.setQueryData(['todos'], (old) => [...old, optimisticTodo])

    // 返回包含乐观待办事项的上下文
    return { optimisticTodo }
  },
  onSuccess: (result, variables, context) => {
    // 用结果替换列表中的乐观待办事项
    queryClient.setQueryData(['todos'], (old) =>
      old.map((todo) =>
        todo.id === context.optimisticTodo.id ? result : todo,
      ),
    )
  },
  onError: (error, variables, context) => {
    // 从列表中移除乐观待办事项
    queryClient.setQueryData(['todos'], (old) =>
      old.filter((todo) => todo.id !== context.optimisticTodo.id),
    )
  },
  retry: 3,
})

class someComponent {
  // 在组件中启动变更：
  mutation = injectMutation(() => ({ mutationKey: ['addTodo'] }))

  someMethod() {
    mutation.mutate({ title: '标题' })
  }
}

// 如果变更因设备离线等原因被暂停，
// 可以在应用退出时将暂停的变更脱水：
const state = dehydrate(queryClient)

// 然后在应用启动时重新水合：
hydrate(queryClient, state)

// 恢复暂停的变更：
queryClient.resumePausedMutations()
```

### 持久化离线变更

如果使用 [persistQueryClient 插件](../plugins/persistQueryClient.md) 持久化离线变更，除非提供默认的变更函数，否则在页面重新加载时无法恢复变更。

这是一个技术限制。当持久化到外部存储时，只能持久化变更的状态，因为函数无法被序列化。水合后，触发变更的组件可能尚未初始化，因此调用 `resumePausedMutations` 可能会导致错误：`未找到 mutationFn`。

我们还提供了一个全面的[离线示例](../examples/react/offline)，涵盖查询和变更。

## 变更作用域

默认情况下，所有变更并行运行——即使多次调用同一变更的 `.mutate()`。可以通过带有 `id` 的 `scope` 来避免这种情况。具有相同 `scope.id` 的所有变更将串行运行，这意味着当它们被触发时，如果该作用域已有变更在进行中，它们将以 `isPaused: true` 状态启动。它们会被放入队列，并在轮到它们时自动恢复。

```tsx
const mutation = injectMutation({
  mutationFn: addTodo,
  scope: {
    id: 'todo',
  },
})
```
