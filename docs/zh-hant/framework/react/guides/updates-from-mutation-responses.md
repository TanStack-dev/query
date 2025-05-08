---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:20:53.985Z'
id: updates-from-mutation-responses
title: 來自變更回應的更新
---

在處理會**更新**伺服器上物件的變異 (mutation) 時，新的物件通常會自動包含在變異的回應中。與其重新擷取該項目的任何查詢並浪費網路請求來取得我們已經擁有的資料，我們可以利用變異函式回傳的物件，並立即使用 [Query Client 的 `setQueryData`](../../../reference/QueryClient.md#queryclientsetquerydata) 方法來更新現有的查詢資料：

[//]: # 'Example'

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

// 以下的查詢將會隨著成功的變異回應而更新
const { status, data, error } = useQuery({
  queryKey: ['todo', { id: 5 }],
  queryFn: fetchTodoById,
})
```

[//]: # 'Example'

你可能會希望將 `onSuccess` 邏輯封裝成可重複使用的變異，為此你可以建立一個自訂的 Hook 如下：

[//]: # 'Example2'

```tsx
const useMutateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: editTodo,
    // 注意第二個參數是 `mutate` 函式接收的變數物件
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['todo', { id: variables.id }], data)
    },
  })
}
```

[//]: # 'Example2'

## 不可變性 (Immutability)

透過 `setQueryData` 進行的更新必須以**不可變**的方式執行。**請勿**嘗試透過就地變更資料（從快取中取得的資料）來直接寫入快取。這樣做一開始可能有效，但可能會導致難以察覺的錯誤。

[//]: # 'Example3'

```tsx
queryClient.setQueryData(['posts', { id }], (oldData) => {
  if (oldData) {
    // ❌ 不要這樣做
    oldData.title = 'my new post title'
  }
  return oldData
})

queryClient.setQueryData(
  ['posts', { id }],
  // ✅ 這才是正確的方式
  (oldData) =>
    oldData
      ? {
          ...oldData,
          title: 'my new post title',
        }
      : oldData,
)
```

[//]: # 'Example3'
