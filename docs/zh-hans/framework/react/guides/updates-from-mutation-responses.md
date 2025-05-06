---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:02:08.804Z'
id: updates-from-mutation-responses
title: 从变更响应中更新
---
处理那些**更新**服务器上对象的变更（mutations）时，变更响应中通常会自动返回新对象。与其重新获取该条目的查询并浪费网络请求去获取已有的数据，不如利用变更函数返回的对象，通过 [Query Client 的 `setQueryData`](../../../reference/QueryClient.md#queryclientsetquerydata) 方法立即用新数据更新现有查询：

[//]: # '示例'

```tsx
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: editTodo,
  onSuccess: (data) => {
    queryClient.setQueryData(['todo', { id: 5 }], data)
  },
})

mutation.mutate({
  id: 5,
  name: 'Do the laundry',
})

// 下面的查询会通过成功变更的响应自动更新
const { status, data, error } = useQuery({
  queryKey: ['todo', { id: 5 }],
  queryFn: fetchTodoById,
})
```

[//]: # '示例'

若想将 `onSuccess` 逻辑封装成可复用的变更，可以创建如下自定义钩子：

[//]: # '示例2'

```tsx
const useMutateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: editTodo,
    // 注意第二个参数是 `mutate` 函数接收的变量对象
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['todo', { id: variables.id }], data)
    },
  })
}
```

[//]: # '示例2'

## 不可变性

通过 `setQueryData` 更新必须遵循**不可变**原则。**禁止**直接修改从缓存中获取的数据并原地写入缓存。虽然初期可能生效，但会导致难以察觉的潜在错误。

[//]: # '示例3'

```tsx
queryClient.setQueryData(['posts', { id }], (oldData) => {
  if (oldData) {
    // ❌ 切勿如此操作
    oldData.title = 'my new post title'
  }
  return oldData
})

queryClient.setQueryData(
  ['posts', { id }],
  // ✅ 这才是正确方式
  (oldData) =>
    oldData
      ? {
          ...oldData,
          title: 'my new post title',
        }
      : oldData,
)
```

[//]: # '示例3'
