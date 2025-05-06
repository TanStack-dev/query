---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T16:03:43.156Z'
id: invalidations-from-mutations
title: 从变更中失效
---
## 变更触发的失效机制

使查询失效只是成功的一半，而了解**何时**使其失效则是另一半。通常，当应用中的某个变更 (mutation) 成功执行时，应用中极有可能存在与之相关的查询需要失效，甚至可能需要重新获取数据以反映该变更带来的新变化。

例如，假设我们有一个用于提交新待办事项的变更：

```tsx
const mutation = useMutation({ mutationFn: postTodo })
```

当 `postTodo` 变更成功执行后，我们通常希望所有 `todos` 查询都失效，并可能重新获取以显示新增的待办事项。为此，可以利用 `useMutation` 的 `onSuccess` 配置项和 `client` 的 `invalidateQueries` 方法：

```tsx
import { useMutation, useQueryClient } from '@tanstack/vue-query'

const queryClient = useQueryClient()

// 当此变更成功时，使所有带有 `todos` 或 `reminders` 查询键的查询失效
const mutation = useMutation({
  mutationFn: addTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
    queryClient.invalidateQueries({ queryKey: ['reminders'] })
  },
})
```

你可以通过 [`useMutation` 钩子](./mutations.md) 提供的任意回调函数来配置失效逻辑。
