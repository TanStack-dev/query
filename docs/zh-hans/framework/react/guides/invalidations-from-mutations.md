---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:12:43.101Z'
id: invalidations-from-mutations
title: 从变更中失效
---

## 变更触发的失效机制

仅使查询失效只是成功的一半，而明确**何时**触发失效才是关键。通常，当应用中的某个变更 (mutation) 成功执行时，极有可能存在与之关联的查询需要被标记为失效状态，甚至重新获取数据以反映变更带来的新变化。

例如，假设我们有一个用于提交新待办事项的变更操作：

[//]: # '示例'

```tsx
const mutation = useMutation({ mutationFn: postTodo })
```

[//]: # '示例'

当 `postTodo` 变更成功执行后，我们通常希望所有 `todos` 查询都失效并重新获取，以展示新增的待办事项。为此，可以利用 `useMutation` 的 `onSuccess` 配置项配合查询客户端 (query client) 的 `invalidateQueries` 方法实现：

[//]: # '示例2'

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// 当此变更成功时，使所有包含 `todos` 或 `reminders` 查询键的查询失效
const mutation = useMutation({
  mutationFn: addTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
    queryClient.invalidateQueries({ queryKey: ['reminders'] })
  },
})
```

[//]: # '示例2'

您可以通过 [`useMutation` 钩子](./mutations.md) 提供的任意回调函数来配置失效触发逻辑。
