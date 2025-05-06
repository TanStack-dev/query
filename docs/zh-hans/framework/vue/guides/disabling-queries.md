---
source-updated-at: '2024-05-11T22:31:28.000Z'
translation-updated-at: '2025-05-06T16:12:44.238Z'
id: disabling-queries
title: 禁用/暂停查询
---
如果你想阻止某个查询自动执行，可以使用 `enabled = false` 选项。`enabled` 选项也接受返回布尔值的回调函数。

当 `enabled` 为 `false` 时：

- 如果查询存在缓存数据，则该查询会以 `status === 'success'` 或 `isSuccess` 状态初始化
- 如果查询没有缓存数据，则该查询会以 `status === 'pending'` 和 `fetchStatus === 'idle'` 状态启动
- 查询不会在挂载时自动获取数据
- 查询不会在后台自动重新获取数据
- 查询会忽略查询客户端 `invalidateQueries` 和 `refetchQueries` 的调用（这些调用通常会导致查询重新获取数据）
- 通过 `useQuery` 返回的 `refetch` 可用于手动触发查询获取数据（但无法与 `skipToken` 配合使用）

> TypeScript 用户可能更倾向于使用 [skipToken](#typesafe-disabling-of-queries-using-skiptoken) 作为 `enabled = false` 的替代方案

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const { isLoading, isError, data, error, refetch, isFetching } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
  enabled: false,
})
</script>

<template>
  <button @click="refetch">Fetch Todos</button>
  <span v-if="isIdle">Not ready...</span>
  <span v-else-if="isError">Error: {{ error.message }}</span>
  <div v-else-if="data">
    <span v-if="isFetching">Fetching...</span>
    <ul>
      <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
    </ul>
  </div>
</template>
```

永久禁用查询会失去 TanStack Query 提供的许多优秀特性（如后台重新获取），这也不是惯用做法。它会让你从声明式模式（定义查询运行的依赖条件）转入命令式模式（点击按钮时才获取数据），而且无法向 `refetch` 传递参数。通常你真正需要的是延迟初始获取的惰性查询：

## 惰性查询

`enabled` 选项不仅能永久禁用查询，还可以在后续启用/禁用。典型场景是筛选表单——只有当用户输入筛选值后才发起首次请求：

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const filter = ref('')
const isEnabled = computed(() => !!filter.value)
const { data } = useQuery({
  queryKey: ['todos', filter],
  queryFn: () => fetchTodos(filter),
  // ⬇️ 当筛选条件为空时禁用查询
  enabled: isEnabled,
})
</script>

<template>
  <span v-if="data">筛选条件已设置且数据已加载！</span>
</template>
```

### isLoading（原名为 `isInitialLoading`）

惰性查询会从一开始就处于 `status: 'pending'` 状态，因为 `pending` 表示尚无数据。虽然这在技术上是正确的，但由于我们并未实际获取数据（查询未被启用），你可能无法用这个标志来显示加载状态。

如果使用禁用或惰性查询，可以改用 `isLoading` 标志。这是一个衍生标志，由以下公式计算得出：

`isPending && isFetching`

因此只有当查询首次获取数据时，该标志才会为 `true`。

## 使用 `skipToken` 实现类型安全的查询禁用

如果使用 TypeScript，可以通过 `skipToken` 禁用查询。这在需要基于条件禁用查询，同时保持类型安全时非常有用。

> 重要提示：`useQuery` 返回的 `refetch` 无法与 `skipToken` 配合使用。除此之外，`skipToken` 的行为与 `enabled: false` 完全一致。

```vue
<script setup>
import { useQuery, skipToken } from '@tanstack/vue-query'

const filter = ref('')
const queryFn = computed(() =>
  !!filter.value ? () => fetchTodos(filter) : skipToken,
)
const { data } = useQuery({
  queryKey: ['todos', filter],
  // ⬇️ 当筛选条件未定义或为空时禁用查询
  queryFn: queryFn,
})
</script>

<template>
  <span v-if="data">筛选条件已设置且数据已加载！</span>
</template>
```
