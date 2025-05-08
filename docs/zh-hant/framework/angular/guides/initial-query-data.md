---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:26:27.212Z'
id: initial-query-data
title: 初始查詢資料
---

在需要之前，有許多方式可以為快取中的查詢提供初始資料：

- 宣告式：
  - 提供 `initialData` 給查詢，以便在快取為空時預先填入資料
- 命令式：
  - [使用 `queryClient.prefetchQuery` 預先取得資料](./prefetching.md)
  - [使用 `queryClient.setQueryData` 手動將資料放入快取](./prefetching.md)

## 使用 `initialData` 預先填入查詢

有時您可能已經在應用程式中擁有查詢的初始資料，可以直接提供給查詢。在這種情況下，您可以使用 `config.initialData` 選項來設定查詢的初始資料，並跳過初始載入狀態！

> 重要提示：`initialData` 會被持久化到快取中，因此不建議在此選項中提供佔位、部分或不完整的資料，而應使用 `placeholderData`

```ts
result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: initialTodos,
}))
```

### `staleTime` 與 `initialDataUpdatedAt`

預設情況下，`initialData` 會被視為完全新鮮的資料，就像剛取得一樣。這也會影響 `staleTime` 選項的解讀方式。

- 如果您使用 `initialData` 設定查詢觀察者，且沒有設定 `staleTime`（預設 `staleTime: 0`），查詢會立即重新取得資料：

```ts
// 會立即顯示 initialTodos，但也會在元件或服務實例建立時立即重新取得 todos
result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: initialTodos,
}))
```

- 如果您使用 `initialData` 和 `staleTime` 設為 `1000` 毫秒來設定查詢觀察者，資料將在相同時間內被視為新鮮的，就像剛從查詢函數取得一樣。

```ts
// 立即顯示 initialTodos，但在 1000 毫秒後遇到另一個互動事件之前不會重新取得
result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: initialTodos,
  staleTime: 1000,
}))
```

- 如果您的 `initialData` 不是完全新鮮的怎麼辦？這就引出了最後一種也是最準確的配置，使用名為 `initialDataUpdatedAt` 的選項。此選項允許您傳遞一個以毫秒為單位的 JS 時間戳記，表示 `initialData` 本身最後更新的時間，例如 `Date.now()` 提供的值。請注意，如果您有 unix 時間戳記，則需要將其乘以 `1000` 轉換為 JS 時間戳記。

```ts
// 立即顯示 initialTodos，但在 1 分鐘後遇到另一個互動事件之前不會重新取得
result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: initialTodos,
  staleTime: 60 * 1000, // 1 分鐘
  // 這可能是 10 秒前或 10 分鐘前
  initialDataUpdatedAt: initialTodosUpdatedTimestamp, // 例如 1608412420052
}))
```

此選項允許 `staleTime` 用於其原始目的，確定資料需要多新鮮，同時也允許在初始化時重新取得資料，如果 `initialData` 比 `staleTime` 舊的話。在上面的例子中，我們的資料需要在 1 分鐘內保持新鮮，並且我們可以提示查詢 `initialData` 最後更新的時間，以便查詢自行決定是否需要重新取得資料。

> 如果您更希望將資料視為**預先取得的資料**，建議您使用 `prefetchQuery` 或 `fetchQuery` API 預先填入快取，從而讓您可以獨立於 `initialData` 配置 `staleTime`

### 初始資料函數

如果取得查詢初始資料的過程很耗資源，或者您不想在每個服務或元件實例上執行，您可以將一個函數作為 `initialData` 的值傳遞。此函數只會在查詢初始化時執行一次，節省寶貴的記憶體和/或 CPU：

```ts
result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: () => getExpensiveTodos(),
}))
```

### 從快取取得初始資料

在某些情況下，您可以從另一個查詢的快取結果中提供查詢的初始資料。一個很好的例子是從 todos 列表查詢的快取資料中搜尋單個 todo 項目，然後將其用作單個 todo 查詢的初始資料：

```ts
result = injectQuery(() => ({
  queryKey: ['todo', this.todoId()],
  queryFn: () => fetch('/todos'),
  initialData: () => {
    // 使用 'todos' 查詢中的一個 todo 作為此 todo 查詢的初始資料
    return this.queryClient
      .getQueryData(['todos'])
      ?.find((d) => d.id === this.todoId())
  },
}))
```

### 從快取取得初始資料並使用 `initialDataUpdatedAt`

從快取取得初始資料意味著您用來查找初始資料的來源查詢可能已經過時。與其使用人工的 `staleTime` 來防止查詢立即重新取得資料，建議您將來源查詢的 `dataUpdatedAt` 傳遞給 `initialDataUpdatedAt`。這為查詢實例提供了所有需要的資訊，以確定是否需要以及何時需要重新取得資料，無論是否提供了初始資料。

```ts
result = injectQuery(() => ({
  queryKey: ['todos', this.todoId()],
  queryFn: () => fetch(`/todos/${this.todoId()}`),
  initialData: () =>
    queryClient.getQueryData(['todos'])?.find((d) => d.id === this.todoId()),
  initialDataUpdatedAt: () =>
    queryClient.getQueryState(['todos'])?.dataUpdatedAt,
}))
```

### 從快取條件式取得初始資料

如果您用來查找初始資料的來源查詢已經過時，您可能根本不想使用快取資料，而是直接從伺服器取得。為了更容易做出這個決定，您可以使用 `queryClient.getQueryState` 方法來獲取有關來源查詢的更多資訊，包括 `state.dataUpdatedAt` 時間戳記，您可以用來判斷查詢是否足夠「新鮮」以滿足您的需求：

```ts
result = injectQuery(() => ({
  queryKey: ['todo', this.todoId()],
  queryFn: () => fetch(`/todos/${this.todoId()}`),
  initialData: () => {
    // 取得查詢狀態
    const state = queryClient.getQueryState(['todos'])

    // 如果查詢存在且資料不超過 10 秒...
    if (state && Date.now() - state.dataUpdatedAt <= 10 * 1000) {
      // 回傳單個 todo
      return state.data.find((d) => d.id === this.todoId())
    }

    // 否則，回傳 undefined 並讓它從硬載入狀態取得資料！
  },
}))
```
