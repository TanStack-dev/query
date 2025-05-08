---
source-updated-at: '2024-07-19T09:36:35.000Z'
translation-updated-at: '2025-05-08T20:26:56.640Z'
id: mutations
title: 變更
---

與查詢 (queries) 不同，突變 (mutations) 通常用於建立/更新/刪除資料或執行伺服器副作用 (side-effects)。為此，TanStack Query 導出了 `injectMutation` 函式。

以下是一個將新待辦事項 (todo) 新增至伺服器的突變範例：

```angular-ts
@Component({
  template: `
    <div>
      @if (mutation.isPending()) {
        <span>新增待辦事項中...</span>
      } @else if (mutation.isError()) {
        <div>發生錯誤：{{ mutation.error()?.message }}</div>
      } @else if (mutation.isSuccess()) {
        <div>待辦事項已新增！</div>
      }
      <button (click)="mutation.mutate(1)">建立待辦事項</button>
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

在任何時刻，突變只能處於以下其中一種狀態：

- `isIdle` 或 `status === 'idle'` - 突變目前處於閒置或全新/重置狀態
- `isPending` 或 `status === 'pending'` - 突變正在執行中
- `isError` 或 `status === 'error'` - 突變發生錯誤
- `isSuccess` 或 `status === 'success'` - 突變成功且突變資料可用

除了這些主要狀態外，根據突變的狀態還可取得更多資訊：

- `error` - 若突變處於 `error` 狀態，可透過 `error` 屬性取得錯誤資訊。
- `data` - 若突變處於 `success` 狀態，可透過 `data` 屬性取得資料。

在上面的範例中，您也看到可以透過呼叫 `mutate` 函式並傳入**單一變數或物件**來將變數傳遞給突變函式。

即使只有變數，突變並不特別，但當與 `onSuccess` 選項、[Query Client 的 `invalidateQueries` 方法](../../../reference/QueryClient.md#queryclientinvalidatequeries) 和 [Query Client 的 `setQueryData` 方法](../../../reference/QueryClient.md#queryclientsetquerydata) 一起使用時，突變就成為非常強大的工具。

## 重置突變狀態

有時您需要清除突變請求的 `error` 或 `data`。為此，您可以使用 `reset` 函式來處理：

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
      <button type="submit">建立待辦事項</button>
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

## 突變副作用

`injectMutation` 提供了一些輔助選項，允許在突變生命週期的任何階段快速簡便地執行副作用。這些選項對於[突變後使查詢失效並重新獲取](./invalidations-from-mutations.md)甚至[樂觀更新 (optimistic updates)](./optimistic-updates.md)非常有用。

```ts
mutation = injectMutation(() => ({
  mutationFn: addTodo,
  onMutate: (variables) => {
    // 突變即將發生！

    // 可選擇返回包含資料的上下文，用於例如回滾
    return { id: 1 }
  },
  onError: (error, variables, context) => {
    // 發生錯誤！
    console.log(`回滾樂觀更新，id ${context.id}`)
  },
  onSuccess: (data, variables, context) => {
    // 成功！
  },
  onSettled: (data, error, variables, context) => {
    // 無論錯誤或成功！
  },
}))
```

當在任何回調函式中返回 Promise 時，它將首先被等待，然後才會呼叫下一個回調：

```ts
mutation = injectMutation(() => ({
  mutationFn: addTodo,
  onSuccess: async () => {
    console.log('我先執行！')
  },
  onSettled: async () => {
    console.log('我第二個執行！')
  },
}))
```

您可能會發現，在呼叫 `mutate` 時，除了在 `injectMutation` 上定義的回調外，還想**觸發其他回調**。這可以用來觸發特定於元件的副作用。為此，您可以在突變變數之後向 `mutate` 函式提供任何相同的回調選項。支援的選項包括：`onSuccess`、`onError` 和 `onSettled`。請注意，如果您的元件在突變完成*之前*被銷毀，這些額外的回調將不會執行。

```ts
mutation = injectMutation(() => ({
  mutationFn: addTodo,
  onSuccess: (data, variables, context) => {
    // 我會先執行
  },
  onError: (error, variables, context) => {
    // 我會先執行
  },
  onSettled: (data, error, variables, context) => {
    // 我會先執行
  },
}))

mutation.mutate(todo, {
  onSuccess: (data, variables, context) => {
    // 我會第二個執行！
  },
  onError: (error, variables, context) => {
    // 我會第二個執行！
  },
  onSettled: (data, error, variables, context) => {
    // 我會第二個執行！
  },
})
```

### 連續突變

在處理連續突變時，`onSuccess`、`onError` 和 `onSettled` 回調的處理方式略有不同。當傳遞給 `mutate` 函式時，它們只會觸發*一次*，並且只有在元件仍處於活動狀態時才會觸發。這是因為每次呼叫 `mutate` 函式時，突變觀察器 (observer) 都會被移除並重新訂閱。相反，`injectMutation` 處理程序會針對每個 `mutate` 呼叫執行。

> 請注意，傳遞給 `injectMutation` 的 `mutationFn` 很可能是非同步的。在這種情況下，突變完成的順序可能與 `mutate` 函式呼叫的順序不同。

```ts
export class Example {
  mutation = injectMutation(() => ({
    mutationFn: addTodo,
    onSuccess: (data, variables, context) => {
      // 會被呼叫 3 次
    },
  }))

  doMutations() {
    ;['Todo 1', 'Todo 2', 'Todo 3'].forEach((todo) => {
      this.mutation.mutate(todo, {
        onSuccess: (data, variables, context) => {
          // 只會執行一次，針對最後一個突變 (Todo 3)，
          // 無論哪個突變先完成
        },
      })
    })
  }
}
```

## Promise

使用 `mutateAsync` 而不是 `mutate` 來獲取一個 Promise，該 Promise 將在成功時解析或在錯誤時拋出。例如，這可以用於組合副作用。

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

## 重試

預設情況下，TanStack Query 不會在錯誤時重試突變，但可以透過 `retry` 選項實現：

```ts
mutation = injectMutation(() => ({
  mutationFn: addTodo,
  retry: 3,
}))
```

如果突變因設備離線而失敗，它們將在設備重新連接時以相同的順序重試。

## 持久化突變

如果需要，可以將突變持久化到儲存中，並在稍後恢復。這可以透過水合 (hydration) 函式來完成：

```ts
const queryClient = new QueryClient()

// 定義 "addTodo" 突變
queryClient.setMutationDefaults(['addTodo'], {
  mutationFn: addTodo,
  onMutate: async (variables) => {
    // 取消目前的待辦事項列表查詢
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 建立樂觀待辦事項
    const optimisticTodo = { id: uuid(), title: variables.title }

    // 將樂觀待辦事項新增到待辦事項列表
    queryClient.setQueryData(['todos'], (old) => [...old, optimisticTodo])

    // 返回包含樂觀待辦事項的上下文
    return { optimisticTodo }
  },
  onSuccess: (result, variables, context) => {
    // 用結果替換待辦事項列表中的樂觀待辦事項
    queryClient.setQueryData(['todos'], (old) =>
      old.map((todo) =>
        todo.id === context.optimisticTodo.id ? result : todo,
      ),
    )
  },
  onError: (error, variables, context) => {
    // 從待辦事項列表中移除樂觀待辦事項
    queryClient.setQueryData(['todos'], (old) =>
      old.filter((todo) => todo.id !== context.optimisticTodo.id),
    )
  },
  retry: 3,
})

class someComponent {
  // 在某個元件中啟動突變：
  mutation = injectMutation(() => ({ mutationKey: ['addTodo'] }))

  someMethod() {
    mutation.mutate({ title: 'title' })
  }
}

// 如果突變因設備離線等原因被暫停，
// 則可以在應用程式退出時將暫停的突變脫水 (dehydrate)：
const state = dehydrate(queryClient)

// 然後可以在應用程式啟動時再次水合 (hydrate) 突變：
hydrate(queryClient, state)

// 恢復暫停的突變：
queryClient.resumePausedMutations()
```

### 持久化離線突變

如果您使用 [persistQueryClient 插件](../plugins/persistQueryClient.md) 持久化離線突變，除非您提供預設的突變函式，否則在重新載入頁面時無法恢復突變。

這是一個技術限制。當持久化到外部儲存時，只有突變的狀態會被持久化，因為函式無法被序列化。水合後，觸發突變的元件可能尚未初始化，因此呼叫 `resumePausedMutations` 可能會產生錯誤：`找不到 mutationFn`。

我們還有一個全面的[離線範例](../examples/offline)，涵蓋了查詢和突變。

## 突變範圍

預設情況下，所有突變都是並行運行的 - 即使您多次呼叫同一突變的 `.mutate()`。可以透過為突變指定帶有 `id` 的 `scope` 來避免這種情況。所有具有相同 `scope.id` 的突變將按順序運行，這意味著當它們被觸發時，如果該範圍已經有一個突變正在進行中，它們將以 `isPaused: true` 狀態開始。它們將被放入佇列中，並在輪到它們時自動恢復。

```tsx
const mutation = injectMutation({
  mutationFn: addTodo,
  scope: {
    id: 'todo',
  },
})
```
