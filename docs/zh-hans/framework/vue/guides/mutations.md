---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T16:11:21.322Z'
id: mutations
title: 变更
---

与查询不同，变更 (mutations) 通常用于创建/更新/删除数据或执行服务端副作用。为此，TanStack Query 导出了 `useMutation` 钩子。

以下是一个向服务器添加新待办事项的变更示例：

```vue
<script setup>
import { useMutation } from '@tanstack/vue-query'

const { isPending, isError, error, isSuccess, mutate } = useMutation({
  mutationFn: (newTodo) => axios.post('/todos', newTodo),
})

function addTodo() {
  mutate({ id: new Date(), title: 'Do Laundry' })
}
</script>

<template>
  <span v-if="isPending">添加待办事项中...</span>
  <span v-else-if="isError">发生错误: {{ error.message }}</span>
  <span v-else-if="isSuccess">待办事项已添加!</span>
  <button @click="addTodo">创建待办事项</button>
</template>
```

变更在任何时刻只能处于以下状态之一：

- `isIdle` 或 `status === 'idle'` - 变更当前处于空闲或初始/重置状态
- `isPending` 或 `status === 'pending'` - 变更正在执行中
- `isError` 或 `status === 'error'` - 变更遇到错误
- `isSuccess` 或 `status === 'success'` - 变更成功完成且数据可用

除了这些主要状态外，根据变更状态还可获取更多信息：

- `error` - 如果变更处于 `error` 状态，可通过 `error` 属性获取错误信息
- `data` - 如果变更处于 `success` 状态，可通过 `data` 属性获取数据

在上例中，您还看到可以通过调用 `mutate` 函数并传递**单个变量或对象**来向变更函数传递变量。

仅使用变量时，变更并不特别，但当与 `onSuccess` 选项、[Query Client 的 `invalidateQueries` 方法](../../../reference/QueryClient.md#queryclientinvalidatequeries) 和 [Query Client 的 `setQueryData` 方法](../../../reference/QueryClient.md#queryclientsetquerydata) 结合使用时，变更就变成了非常强大的工具。

## 重置变更状态

有时您需要清除变更请求的 `error` 或 `data`。为此，可以使用 `reset` 函数处理：

```vue
<script>
import { useMutation } from '@tanstack/vue-query'

const { error, mutate, reset } = useMutation({
  mutationFn: (newTodo) => axios.post('/todos', newTodo),
})

function addTodo() {
  mutate({ id: new Date(), title: 'Do Laundry' })
}
</script>

<template>
  <span v-else-if="error">
    <span>发生错误: {{ error.message }}</span>
    <button @click="reset">重置错误</button>
  </span>
  <button @click="addTodo">创建待办事项</button>
</template>
```

## 变更副作用

`useMutation` 提供了一些辅助选项，允许在变更生命周期的任何阶段快速简单地执行副作用。这些选项对于[变更后使查询失效并重新获取](./invalidations-from-mutations.md) 甚至[乐观更新](./optimistic-updates.md) 都非常有用。

```tsx
useMutation({
  mutationFn: addTodo,
  onMutate: (variables) => {
    // 变更即将发生！
    // 可选返回包含数据的上下文，例如用于回滚
    return { id: 1 }
  },
  onError: (error, variables, context) => {
    // 发生错误！
    console.log(`回滚乐观更新，ID: ${context.id}`)
  },
  onSuccess: (data, variables, context) => {
    // 成功！
  },
  onSettled: (data, error, variables, context) => {
    // 无论错误还是成功都会执行！
  },
})
```

在任何回调函数中返回 Promise 时，会先等待该 Promise 完成再调用下一个回调：

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: async () => {
    console.log('我先执行！')
  },
  onSettled: async () => {
    console.log('我后执行！')
  },
})
```

您可能希望在调用 `mutate` 时**触发额外的回调**，而不仅限于 `useMutation` 定义的那些。这可用于触发组件特定的副作用。为此，您可以在变更变量之后向 `mutate` 函数提供任何相同的回调选项。支持的选项包括：`onSuccess`、`onError` 和 `onSettled`。请注意，如果组件在变更完成前卸载，这些额外的回调将不会运行。

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: (data, variables, context) => {
    // 我会先触发
  },
  onError: (error, variables, context) => {
    // 我会先触发
  },
  onSettled: (data, error, variables, context) => {
    // 我会先触发
  },
})

mutate(todo, {
  onSuccess: (data, variables, context) => {
    // 我会后触发！
  },
  onError: (error, variables, context) => {
    // 我会后触发！
  },
  onSettled: (data, error, variables, context) => {
    // 我会后触发！
  },
})
```

### 连续变更

在处理连续变更时，`onSuccess`、`onError` 和 `onSettled` 回调的行为略有不同。当传递给 `mutate` 函数时，它们只会触发一次，并且仅在组件仍挂载时触发。这是因为每次调用 `mutate` 函数时，变更观察者都会被移除并重新订阅。相反，`useMutation` 的处理程序会为每个 `mutate` 调用执行。

> 请注意，传递给 `useMutation` 的 `mutationFn` 很可能是异步的。在这种情况下，变更完成的顺序可能与 `mutate` 函数调用的顺序不同。

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: (data, variables, context) => {
    // 会被调用3次
  },
})

const todos = ['待办1', '待办2', '待办3']
todos.forEach((todo) => {
  mutate(todo, {
    onSuccess: (data, variables, context) => {
      // 只会执行一次，针对最后一个变更(待办3)，
      // 无论哪个变更先完成
    },
  })
})
```

## Promise

使用 `mutateAsync` 替代 `mutate` 可以获取一个 Promise，该 Promise 在成功时解析或在错误时抛出。例如，这可用于组合副作用。

```tsx
const mutation = useMutation({ mutationFn: addTodo })

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

默认情况下，TanStack Query 不会在错误时重试变更，但可以通过 `retry` 选项启用：

```tsx
const mutation = useMutation({
  mutationFn: addTodo,
  retry: 3,
})
```

如果因设备离线导致变更失败，它们将在设备重新连接时按相同顺序重试。

## 持久化变更

如果需要，可以将变更持久化到存储中，并在以后恢复。这可以通过水合函数实现：

```tsx
const queryClient = new QueryClient()

// 定义"addTodo"变更
queryClient.setMutationDefaults(['addTodo'], {
  mutationFn: addTodo,
  onMutate: async (variables) => {
    // 取消当前的待办列表查询
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 创建乐观待办事项
    const optimisticTodo = { id: uuid(), title: variables.title }

    // 将乐观待办事项添加到待办列表
    queryClient.setQueryData(['todos'], (old) => [...old, optimisticTodo])

    // 返回包含乐观待办事项的上下文
    return { optimisticTodo }
  },
  onSuccess: (result, variables, context) => {
    // 用结果替换待办列表中的乐观待办事项
    queryClient.setQueryData(['todos'], (old) =>
      old.map((todo) =>
        todo.id === context.optimisticTodo.id ? result : todo,
      ),
    )
  },
  onError: (error, variables, context) => {
    // 从待办列表中移除乐观待办事项
    queryClient.setQueryData(['todos'], (old) =>
      old.filter((todo) => todo.id !== context.optimisticTodo.id),
    )
  },
  retry: 3,
})

// 在某个组件中启动变更：
const mutation = useMutation({ mutationKey: ['addTodo'] })
mutation.mutate({ title: '标题' })

// 如果变更因设备离线等原因被暂停，
// 可以在应用退出时将暂停的变更脱水：
const state = dehydrate(queryClient)

// 然后可以在应用启动时再次水合：
hydrate(queryClient, state)

// 恢复暂停的变更：
queryClient.resumePausedMutations()
```

### 持久化离线变更

如果使用 [persistQueryClient 插件](../plugins/persistQueryClient.md) 持久化离线变更，除非提供默认的变更函数，否则在页面重新加载时无法恢复变更。

这是一个技术限制。当持久化到外部存储时，只有变更的状态会被持久化，因为函数无法被序列化。水合后，触发变更的组件可能未挂载，因此调用 `resumePausedMutations` 可能会产生错误：`未找到 mutationFn`。

```js
const client = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24小时
    },
  },
})

// 需要一个默认的变更函数，以便页面重新加载后可以恢复暂停的变更
queryClient.setMutationDefaults({
  mutationKey: ['todos'],
  mutationFn: ({ id, data }) => {
    return api.updateTodo(id, data)
  },
})

const vueQueryOptions: VueQueryPluginOptions = {
  queryClient: client,
  clientPersister: (queryClient) => {
    return persistQueryClient({
      queryClient,
      persister: createSyncStoragePersister({ storage: localStorage }),
    })
  },
  clientPersisterOnSuccess: (queryClient) => {
    queryClient.resumePausedMutations()
  },
}

createApp(App).use(VueQueryPlugin, vueQueryOptions).mount('#app')
```

我们还提供了一个全面的[离线示例](../examples/react/offline)，涵盖了查询和变更。

## 变更作用域

默认情况下，所有变更并行运行 - 即使您多次调用同一变更的 `.mutate()`。可以通过为变更指定带有 `id` 的 `scope` 来避免这种情况。具有相同 `scope.id` 的所有变更将串行运行，这意味着当它们被触发时，如果该作用域已有变更在进行中，它们将以 `isPaused: true` 状态开始。它们将被放入队列，并在轮到它们时自动恢复。

```tsx
const mutation = useMutation({
  mutationFn: addTodo,
  scope: {
    id: 'todo',
  },
})
```
