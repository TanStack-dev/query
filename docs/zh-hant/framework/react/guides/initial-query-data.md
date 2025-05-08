---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:24:16.634Z'
id: initial-query-data
title: 初始查詢資料
---

在需要之前，有多種方式可以為快取中的查詢提供初始資料：

- 宣告式：
  - 提供 `initialData` 給查詢，以便在快取為空時預先填充
- 命令式：
  - [使用 `queryClient.prefetchQuery` 預先取得資料](./prefetching.md)
  - [使用 `queryClient.setQueryData` 手動將資料放入快取](./prefetching.md)

## 使用 `initialData` 預先填充查詢

有時您可能已經在應用程式中擁有查詢的初始資料，並可以直接提供給查詢。在這種情況下，您可以使用 `config.initialData` 選項來設定查詢的初始資料，並跳過初始載入狀態！

> 重要提示：`initialData` 會被持久化到快取中，因此不建議在此選項中提供佔位、部分或不完整的資料，而應使用 `placeholderData`

[//]: # '範例'

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: initialTodos,
})
```

[//]: # '範例'

### `staleTime` 與 `initialDataUpdatedAt`

預設情況下，`initialData` 會被視為完全新鮮的資料，就像剛剛取得的一樣。這也意味著它會影響 `staleTime` 選項的解讀方式。

- 如果您使用 `initialData` 配置查詢觀察器，並且沒有設定 `staleTime`（預設 `staleTime: 0`），查詢會在掛載時立即重新取得資料：

  [//]: # '範例2'

  ```tsx
  // 會立即顯示 initialTodos，但掛載後也會立即重新取得 todos
  const result = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    initialData: initialTodos,
  })
  ```

  [//]: # '範例2'

- 如果您使用 `initialData` 和 `staleTime` 為 `1000` 毫秒來配置查詢觀察器，資料將在這段時間內被視為新鮮的，就像剛從查詢函式中取得的一樣。

  [//]: # '範例3'

  ```tsx
  // 立即顯示 initialTodos，但在 1000 毫秒後遇到另一個互動事件之前不會重新取得資料
  const result = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    initialData: initialTodos,
    staleTime: 1000,
  })
  ```

  [//]: # '範例3'

- 那麼如果您的 `initialData` 不是完全新鮮的呢？這就引出了最後一種配置，它實際上是最準確的，並使用一個名為 `initialDataUpdatedAt` 的選項。此選項允許您傳遞一個以毫秒為單位的 JS 時間戳，表示 `initialData` 本身最後更新的時間，例如 `Date.now()` 提供的值。請注意，如果您有一個 unix 時間戳，則需要將其乘以 `1000` 轉換為 JS 時間戳。

  [//]: # '範例4'

  ```tsx
  // 立即顯示 initialTodos，但在 1 分鐘後遇到另一個互動事件之前不會重新取得資料
  const result = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    initialData: initialTodos,
    staleTime: 60 * 1000, // 1 分鐘
    // 這可能是 10 秒前或 10 分鐘前
    initialDataUpdatedAt: initialTodosUpdatedTimestamp, // 例如 1608412420052
  })
  ```

  [//]: # '範例4'

  此選項允許 `staleTime` 用於其原始目的，即確定資料需要多新鮮，同時也允許在掛載時重新取得資料，如果 `initialData` 比 `staleTime` 舊的話。在上面的範例中，我們的資料需要在 1 分鐘內保持新鮮，並且我們可以向查詢提示 `initialData` 最後更新的時間，以便查詢自行決定是否需要重新取得資料。

  > 如果您更希望將資料視為**預先取得的資料**，建議您使用 `prefetchQuery` 或 `fetchQuery` API 事先填充快取，從而讓您可以獨立於 `initialData` 配置 `staleTime`

### 初始資料函式

如果取得查詢初始資料的過程很耗資源，或者您不想在每次渲染時執行，可以將一個函式作為 `initialData` 的值傳遞。此函式僅在查詢初始化時執行一次，從而節省寶貴的記憶體和/或 CPU：

[//]: # '範例5'

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: () => getExpensiveTodos(),
})
```

[//]: # '範例5'

### 從快取取得初始資料

在某些情況下，您可以從另一個查詢的快取結果中提供查詢的初始資料。一個很好的例子是從 todos 列表查詢的快取資料中搜尋單個 todo 項目，然後將其用作單個 todo 查詢的初始資料：

[//]: # '範例6'

```tsx
const result = useQuery({
  queryKey: ['todo', todoId],
  queryFn: () => fetch('/todos'),
  initialData: () => {
    // 使用 'todos' 查詢中的一個 todo 作為此 todo 查詢的初始資料
    return queryClient.getQueryData(['todos'])?.find((d) => d.id === todoId)
  },
})
```

[//]: # '範例6'

### 從快取取得初始資料並使用 `initialDataUpdatedAt`

從快取取得初始資料意味著您用來查找初始資料的來源查詢可能已經過時。與其使用人為的 `staleTime` 來防止查詢立即重新取得資料，建議您將來源查詢的 `dataUpdatedAt` 傳遞給 `initialDataUpdatedAt`。這為查詢實例提供了所需的所有資訊，以便判斷是否需要重新取得資料以及何時重新取得，無論是否提供了初始資料。

[//]: # '範例7'

```tsx
const result = useQuery({
  queryKey: ['todos', todoId],
  queryFn: () => fetch(`/todos/${todoId}`),
  initialData: () =>
    queryClient.getQueryData(['todos'])?.find((d) => d.id === todoId),
  initialDataUpdatedAt: () =>
    queryClient.getQueryState(['todos'])?.dataUpdatedAt,
})
```

[//]: # '範例7'

### 從快取條件式取得初始資料

如果您用來查找初始資料的來源查詢已經過時，您可能根本不想使用快取資料，而是直接從伺服器取得。為了更容易做出這個決定，您可以使用 `queryClient.getQueryState` 方法來獲取有關來源查詢的更多資訊，包括一個 `state.dataUpdatedAt` 時間戳，您可以用來判斷查詢是否足夠「新鮮」以滿足您的需求：

[//]: # '範例8'

```tsx
const result = useQuery({
  queryKey: ['todo', todoId],
  queryFn: () => fetch(`/todos/${todoId}`),
  initialData: () => {
    // 取得查詢狀態
    const state = queryClient.getQueryState(['todos'])

    // 如果查詢存在且資料不超過 10 秒...
    if (state && Date.now() - state.dataUpdatedAt <= 10 * 1000) {
      // 回傳單個 todo
      return state.data.find((d) => d.id === todoId)
    }

    // 否則，回傳 undefined 並讓它從硬載入狀態取得資料！
  },
})
```

[//]: # '範例8'
[//]: # '材料'

## 延伸閱讀

如需比較 `Initial Data` 與 `Placeholder Data`，請參閱 [社群資源](../community/tkdodos-blog.md#9-placeholder-and-initial-data-in-react-query)。

[//]: # '材料'
