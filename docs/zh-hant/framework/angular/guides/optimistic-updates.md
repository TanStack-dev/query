---
source-updated-at: '2024-11-19T18:32:49.000Z'
translation-updated-at: '2025-05-08T20:26:13.741Z'
id: optimistic-updates
title: 樂觀更新
---

Angular Query 提供了兩種方式，讓你在突變 (mutation) 完成前樂觀地更新 UI。你可以使用 `onMutate` 選項直接更新快取 (cache)，或是利用 `injectMutation` 結果返回的 `variables` 來更新 UI。

## 透過 UI 更新

這是較簡單的方式，因為它不直接與快取互動。

```ts
addTodo = injectMutation(() => ({
  mutationFn: (newTodo: string) => axios.post('/api/data', { text: newTodo }),
  // 確保 _返回_ 查詢失效的 Promise
  // 這樣突變會保持在 `pending` 狀態，直到重新擷取完成
  onSettled: async () => {
    return await queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
}))
```

接著你可以存取 `addTodo.variables`，其中包含新增的待辦事項。在渲染查詢的 UI 清單中，你可以在突變 `isPending` 時將另一個項目附加到清單：

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

我們會在突變處於 pending 狀態時渲染一個帶有不同 `opacity` 的臨時項目。一旦完成，該項目將自動不再渲染。假設重新擷取成功，我們應該會在清單中看到該項目顯示為「正常項目」。

如果突變發生錯誤，該項目也會消失。但如果需要，我們可以透過檢查突變的 `isError` 狀態繼續顯示它。`variables` 在突變錯誤時 _不會_ 被清除，因此我們仍可以存取它們，甚至顯示重試按鈕：

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

### 如果突變與查詢不在同一個元件中

這種方式在突變與查詢位於同一元件時效果很好。不過，你也可以透過專用的 `injectMutationState` 函式在其他元件中存取所有突變。最好與 `mutationKey` 搭配使用：

```ts
// 在應用程式的某處
addTodo = injectMutation(() => ({
  mutationFn: (newTodo: string) => axios.post('/api/data', { text: newTodo }),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  mutationKey: ['addTodo'],
}))

// 在其他地方存取 variables

mutationState = injectMutationState<string>(() => ({
  filters: { mutationKey: ['addTodo'], status: 'pending' },
  select: (mutation) => mutation.state.variables,
}))
```

`variables` 會是一個 `Array`，因為可能同時有多個突變正在執行。如果我們需要項目的唯一鍵，也可以選擇 `mutation.state.submittedAt`。這會讓顯示並發的樂觀更新變得更加容易。

## 透過快取更新

當你在執行突變前樂觀地更新狀態時，突變有可能會失敗。在大多數失敗情況下，你可以直接觸發樂觀查詢的重新擷取，將其恢復為伺服器的真實狀態。但在某些情況下，重新擷取可能無法正確運作，且突變錯誤可能代表某種伺服器問題，導致無法重新擷取。此時，你可以選擇回滾更新。

為此，`injectMutation` 的 `onMutate` 處理器選項允許你返回一個值，該值稍後會作為最後一個參數傳遞給 `onError` 和 `onSettled` 處理器。在多數情況下，傳遞一個回滾函式最為實用。

### 在新增待辦事項時更新待辦事項清單

```ts
queryClient = inject(QueryClient)

updateTodo = injectMutation(() => ({
  mutationFn: updateTodo,
  // 當 mutate 被呼叫時：
  onMutate: async (newTodo) => {
    // 取消任何正在進行的重新擷取
    // (避免覆蓋我們的樂觀更新)
    await this.queryClient.cancelQueries({ queryKey: ['todos'] })

    // 快照先前的值
    const previousTodos = client.getQueryData(['todos'])

    // 樂觀地更新為新值
    this.queryClient.setQueryData(['todos'], (old) => [...old, newTodo])

    // 返回一個包含快照值的上下文物件
    return { previousTodos }
  },
  // 如果突變失敗，
  // 使用 onMutate 返回的上下文進行回滾
  onError: (err, newTodo, context) => {
    client.setQueryData(['todos'], context.previousTodos)
  },
  // 無論錯誤或成功後都重新擷取：
  onSettled: () => {
    this.queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
}))
```

### 更新單個待辦事項

```ts
queryClient = inject(QueryClient)

updateTodo = injectMutation(() => ({
  mutationFn: updateTodo,
  // 當 mutate 被呼叫時：
  onMutate: async (newTodo) => {
    // 取消任何正在進行的重新擷取
    // (避免覆蓋我們的樂觀更新)
    await this.queryClient.cancelQueries({ queryKey: ['todos', newTodo.id] })

    // 快照先前的值
    const previousTodo = this.queryClient.getQueryData(['todos', newTodo.id])

    // 樂觀地更新為新值
    this.queryClient.setQueryData(['todos', newTodo.id], newTodo)

    // 返回包含先前與新待辦事項的上下文
    return { previousTodo, newTodo }
  },
  // 如果突變失敗，使用上面返回的上下文
  onError: (err, newTodo, context) => {
    this.queryClient.setQueryData(
      ['todos', context.newTodo.id],
      context.previousTodo,
    )
  },
  // 無論錯誤或成功後都重新擷取：
  onSettled: (newTodo) => {
    this.queryClient.invalidateQueries({ queryKey: ['todos', newTodo.id] })
  },
}))
```

你也可以使用 `onSettled` 函式來取代獨立的 `onError` 和 `onSuccess` 處理器：

```ts
injectMutation({
  mutationFn: updateTodo,
  // ...
  onSettled: (newTodo, error, variables, context) => {
    if (error) {
      // 執行某些操作
    }
  },
})
```

## 何時使用哪種方式

如果只有一個地方需要顯示樂觀結果，使用 `variables` 並直接更新 UI 是程式碼較少且通常更容易理解的方式。例如，你完全不需要處理回滾。

然而，如果畫面上有多個地方需要知道更新，直接操作快取會自動為你處理這一點。
