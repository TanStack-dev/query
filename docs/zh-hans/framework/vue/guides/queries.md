---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T16:04:51.198Z'
id: queries
title: 查询
---
## 查询基础

查询是与**唯一键**绑定的、对异步数据源的声明式依赖。查询可用于任何基于 Promise 的方法（包括 GET 和 POST 方法）从服务器获取数据。如果你的方法会修改服务器数据，我们建议改用[变更](./mutations.md)。

要在组件或自定义钩子中订阅查询，至少需要调用 `useQuery` 钩子并传入：
- 该查询的**唯一键**
- 一个返回 Promise 的函数，该 Promise 会：
  - 解析出数据，或
  - 抛出错误

```ts
import { useQuery } from '@tanstack/vue-query'

const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
```

你提供的**唯一键**将在内部用于重新获取、缓存及在整个应用中共享查询。

`useQuery` 返回的查询结果包含所有与查询相关的信息，这些信息可用于模板渲染或其他数据处理场景：

```tsx
const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
```

`result` 对象包含若干关键状态，理解这些状态对高效使用至关重要。查询在任意时刻只能处于以下一种状态：
- `isPending` 或 `status === 'pending'` - 查询尚无数据
- `isError` 或 `status === 'error'` - 查询遇到错误
- `isSuccess` 或 `status === 'success'` - 查询成功且数据可用

除了这些主要状态，根据查询状态还可获取更多信息：
- `error` - 若查询处于 `isError` 状态，可通过 `error` 属性获取错误对象
- `data` - 若查询处于 `isSuccess` 状态，可通过 `data` 属性获取数据
- `isFetching` - 在任何状态下，只要查询正在获取数据（包括后台重新获取），`isFetching` 都会为 `true`

对于**大多数**查询，通常只需先检查 `isPending` 状态，再检查 `isError` 状态，最后即可认为数据已可用并渲染成功状态：

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const { isPending, isError, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})
</script>

<template>
  <span v-if="isPending">加载中...</span>
  <span v-else-if="isError">错误: {{ error.message }}</span>
  <!-- 此时可以认为 `isSuccess === true` -->
  <ul v-else-if="data">
    <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
  </ul>
</template>
```

如果不习惯使用布尔值，也可以始终使用 `status` 状态：

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const { status, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})
</script>

<template>
  <span v-if="status === 'pending'">加载中...</span>
  <span v-else-if="status === 'error'">错误: {{ error.message }}</span>
  <!-- 同样可用 status === 'success'，但 else 逻辑也适用 -->
  <ul v-else-if="data">
    <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
  </ul>
</template>
```

如果你在访问 `data` 前已检查过 `pending` 和 `error` 状态，TypeScript 也会正确收窄 `data` 的类型。

### 获取状态 (FetchStatus)

除了 `status` 字段外，你还会获得一个额外的 `fetchStatus` 属性，其可选值为：
- `fetchStatus === 'fetching'` - 查询正在获取数据
- `fetchStatus === 'paused'` - 查询尝试获取数据但被暂停，详见[网络模式](./network-mode.md)指南
- `fetchStatus === 'idle'` - 查询当前未进行任何操作

### 为何需要两种状态？

后台重新获取和"过时但可用"逻辑使得 `status` 和 `fetchStatus` 的所有组合都可能出现。例如：
- 处于 `success` 状态的查询通常对应 `idle` 获取状态，但如果正在进行后台重新获取，则可能为 `fetching`
- 刚挂载且无数据的查询通常处于 `pending` 状态和 `fetching` 获取状态，但若无网络连接则可能为 `paused`

因此要记住：查询可能处于 `pending` 状态但并未实际获取数据。简单来说：
- `status` 提供关于 `data` 的信息：我们是否有数据？
- `fetchStatus` 提供关于 `queryFn` 的信息：它是否正在执行？
