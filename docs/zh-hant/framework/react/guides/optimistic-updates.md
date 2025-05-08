---
source-updated-at: '2025-03-26T09:27:36.000Z'
translation-updated-at: '2025-05-08T20:23:22.677Z'
id: optimistic-updates
title: 樂觀更新
---

React Query 提供了兩種在突變 (mutation) 完成前樂觀更新 (optimistically update) UI 的方式。你可以使用 `onMutate` 選項直接更新快取，或是利用 `useMutation` 回傳的 `variables` 來更新 UI。

## 透過 UI 更新

這是較簡單的方式，因為它不直接與快取互動。

[//]: # 'ExampleUI1'

```tsx
const addTodoMutation = useMutation({
  mutationFn: (newTodo: string) => axios.post('/api/data', { text: newTodo }),
  // 確保從查詢失效 (query invalidation) _返回_ Promise
  // 這樣突變會保持在 `pending` 狀態，直到重新擷取完成
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})

const { isPending, submittedAt, variables, mutate, isError } = addTodoMutation
```

[//]: # 'ExampleUI1'

接著你可以存取 `addTodoMutation.variables`，其中包含新增的待辦事項。在渲染查詢的 UI 清單中，可以在突變處於 `isPending` 狀態時，將另一個項目附加到清單中：

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

我們在突變處於 pending 狀態時，渲染了一個帶有不同 `opacity` 的臨時項目。一旦完成，該項目將自動不再渲染。假設重新擷取成功，我們應該會在清單中看到該項目顯示為「正常項目」。

如果突變發生錯誤，該項目也會消失。但如果需要，我們可以透過檢查突變的 `isError` 狀態來繼續顯示它。`variables` 在突變錯誤時*不會*被清除，因此我們仍然可以存取它們，甚至可以顯示重試按鈕：

[//]: # 'ExampleUI3'

```tsx
{
  isError && (
    <li style={{ color: 'red' }}>
      {variables}
      <button onClick={() => mutate(variables)}>重試</button>
    </li>
  )
}
```

[//]: # 'ExampleUI3'

### 如果突變與查詢不在同一個元件中

如果突變與查詢位於同一個元件中，這種方式效果很好。不過，你也可以透過專用的 `useMutationState` Hook 在其他元件中存取所有突變。最好與 `mutationKey` 搭配使用：

[//]: # 'ExampleUI4'

```tsx
// 在應用程式的某處
const { mutate } = useMutation({
  mutationFn: (newTodo: string) => axios.post('/api/data', { text: newTodo }),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  mutationKey: ['addTodo'],
})

// 在其他地方存取 variables
const variables = useMutationState<string>({
  filters: { mutationKey: ['addTodo'], status: 'pending' },
  select: (mutation) => mutation.state.variables,
})
```

[//]: # 'ExampleUI4'

`variables` 會是一個 `Array`，因為可能同時有多個突變正在執行。如果我們需要項目的唯一鍵，也可以選擇 `mutation.state.submittedAt`。這甚至能讓並發的樂觀更新變得輕而易舉。

## 透過快取更新

當你在執行突變前樂觀更新狀態時，突變有可能會失敗。在大多數失敗情況下，你可以直接觸發樂觀查詢的重新擷取，將其還原為真實的伺服器狀態。但在某些情況下，重新擷取可能無法正確運作，且突變錯誤可能代表某種伺服器問題，導致無法重新擷取。此時，你可以選擇回滾更新。

為此，`useMutation` 的 `onMutate` 處理常式選項允許你回傳一個值，該值稍後將作為最後一個參數傳遞給 `onError` 和 `onSettled` 處理常式。在大多數情況下，傳遞回滾函式最為實用。

### 在新增待辦事項時更新待辦事項清單

[//]: # 'Example'

```tsx
const queryClient = useQueryClient()

useMutation({
  mutationFn: updateTodo,
  // 當 mutate 被呼叫時：
  onMutate: async (newTodo) => {
    // 取消任何正在進行的重新擷取
    // (這樣它們就不會覆蓋我們的樂觀更新)
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 快照先前的值
    const previousTodos = queryClient.getQueryData(['todos'])

    // 樂觀更新為新值
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo])

    // 回傳帶有快照值的 context 物件
    return { previousTodos }
  },
  // 如果突變失敗，
  // 使用從 onMutate 回傳的 context 進行回滾
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos)
  },
  // 無論錯誤或成功，都重新擷取：
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})
```

[//]: # 'Example'

### 更新單個待辦事項

[//]: # 'Example2'

```tsx
useMutation({
  mutationFn: updateTodo,
  // 當 mutate 被呼叫時：
  onMutate: async (newTodo) => {
    // 取消任何正在進行的重新擷取
    // (這樣它們就不會覆蓋我們的樂觀更新)
    await queryClient.cancelQueries({ queryKey: ['todos', newTodo.id] })

    // 快照先前的值
    const previousTodo = queryClient.getQueryData(['todos', newTodo.id])

    // 樂觀更新為新值
    queryClient.setQueryData(['todos', newTodo.id], newTodo)

    // 回傳帶有先前和新待辦事項的 context
    return { previousTodo, newTodo }
  },
  // 如果突變失敗，使用上面回傳的 context
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(
      ['todos', context.newTodo.id],
      context.previousTodo,
    )
  },
  // 無論錯誤或成功，都重新擷取：
  onSettled: (newTodo) =>
    queryClient.invalidateQueries({ queryKey: ['todos', newTodo.id] }),
})
```

[//]: # 'Example2'

如果你希望，也可以使用 `onSettled` 函式來取代獨立的 `onError` 和 `onSuccess` 處理常式：

[//]: # 'Example3'

```tsx
useMutation({
  mutationFn: updateTodo,
  // ...
  onSettled: async (newTodo, error, variables, context) => {
    if (error) {
      // 執行某些操作
    }
  },
})
```

[//]: # 'Example3'

## 何時使用哪種方式

如果你只有一個地方需要顯示樂觀結果，使用 `variables` 並直接更新 UI 是程式碼較少且通常更容易理解的方式。例如，你完全不需要處理回滾。

然而，如果畫面上有多個地方需要知道更新，直接操作快取會自動為你處理好這一切。
