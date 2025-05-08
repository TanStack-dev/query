---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:20:54.366Z'
id: migrating-to-tanstack-query-5
title: 遷移至 v5
---

## 重大變更

v5 是一個主要版本，因此需要注意以下重大變更：

### 僅支援單一簽名格式（單一物件）

`useQuery` 及其相關方法過去在 TypeScript 中有多種重載形式：即函數可以有多種調用方式。這不僅在類型維護上相當困難，還需要運行時檢查來判斷第一和第二參數的類型，以正確創建選項。

現在我們僅支援物件格式。

```tsx
useQuery(key, fn, options) // [!code --]
useQuery({ queryKey, queryFn, ...options }) // [!code ++]
useInfiniteQuery(key, fn, options) // [!code --]
useInfiniteQuery({ queryKey, queryFn, ...options }) // [!code ++]
useMutation(fn, options) // [!code --]
useMutation({ mutationFn, ...options }) // [!code ++]
useIsFetching(key, filters) // [!code --]
useIsFetching({ queryKey, ...filters }) // [!code ++]
useIsMutating(key, filters) // [!code --]
useIsMutating({ mutationKey, ...filters }) // [!code ++]
```

```tsx
queryClient.isFetching(key, filters) // [!code --]
queryClient.isFetching({ queryKey, ...filters }) // [!code ++]
queryClient.ensureQueryData(key, filters) // [!code --]
queryClient.ensureQueryData({ queryKey, ...filters }) // [!code ++]
queryClient.getQueriesData(key, filters) // [!code --]
queryClient.getQueriesData({ queryKey, ...filters }) // [!code ++]
queryClient.setQueriesData(key, updater, filters, options) // [!code --]
queryClient.setQueriesData({ queryKey, ...filters }, updater, options) // [!code ++]
queryClient.removeQueries(key, filters) // [!code --]
queryClient.removeQueries({ queryKey, ...filters }) // [!code ++]
queryClient.resetQueries(key, filters, options) // [!code --]
queryClient.resetQueries({ queryKey, ...filters }, options) // [!code ++]
queryClient.cancelQueries(key, filters, options) // [!code --]
queryClient.cancelQueries({ queryKey, ...filters }, options) // [!code ++]
queryClient.invalidateQueries(key, filters, options) // [!code --]
queryClient.invalidateQueries({ queryKey, ...filters }, options) // [!code ++]
queryClient.refetchQueries(key, filters, options) // [!code --]
queryClient.refetchQueries({ queryKey, ...filters }, options) // [!code ++]
queryClient.fetchQuery(key, fn, options) // [!code --]
queryClient.fetchQuery({ queryKey, queryFn, ...options }) // [!code ++]
queryClient.prefetchQuery(key, fn, options) // [!code --]
queryClient.prefetchQuery({ queryKey, queryFn, ...options }) // [!code ++]
queryClient.fetchInfiniteQuery(key, fn, options) // [!code --]
queryClient.fetchInfiniteQuery({ queryKey, queryFn, ...options }) // [!code ++]
queryClient.prefetchInfiniteQuery(key, fn, options) // [!code --]
queryClient.prefetchInfiniteQuery({ queryKey, queryFn, ...options }) // [!code ++]
```

```tsx
queryCache.find(key, filters) // [!code --]
queryCache.find({ queryKey, ...filters }) // [!code ++]
queryCache.findAll(key, filters) // [!code --]
queryCache.findAll({ queryKey, ...filters }) // [!code ++]
```

### `queryClient.getQueryData` 現在僅接受 `queryKey` 作為參數

`queryClient.getQueryData` 的參數變更為僅接受 `queryKey`

```tsx
queryClient.getQueryData(queryKey, filters) // [!code --]
queryClient.getQueryData(queryKey) // [!code ++]
```

### `queryClient.getQueryState` 現在僅接受 `queryKey` 作為參數

`queryClient.getQueryState` 的參數變更為僅接受 `queryKey`

```tsx
queryClient.getQueryState(queryKey, filters) // [!code --]
queryClient.getQueryState(queryKey) // [!code ++]
```

#### 代碼修改工具 (Codemod)

為了簡化移除重載的遷移過程，v5 提供了一個代碼修改工具。

> 此代碼修改工具會盡最大努力協助您遷移重大變更。請徹底檢查生成的代碼！此外，有些邊緣情況無法通過代碼修改工具檢測到，因此請注意日誌輸出。

如果您想針對 `.js` 或 `.jsx` 文件運行此工具，請使用以下命令：

```
npx jscodeshift@latest ./path/to/src/ \
  --extensions=js,jsx \
  --transform=./node_modules/@tanstack/react-query/build/codemods/src/v5/remove-overloads/remove-overloads.cjs
```

如果您想針對 `.ts` 或 `.tsx` 文件運行此工具，請使用以下命令：

```
npx jscodeshift@latest ./path/to/src/ \
  --extensions=ts,tsx \
  --parser=tsx \
  --transform=./node_modules/@tanstack/react-query/build/codemods/src/v5/remove-overloads/remove-overloads.cjs
```

請注意，在 `TypeScript` 的情況下，您需要使用 `tsx` 作為解析器；否則代碼修改工具將無法正確應用！

**注意：** 應用代碼修改工具可能會破壞您的代碼格式，因此在應用代碼修改工具後，請別忘記運行 `prettier` 和/或 `eslint`！

關於代碼修改工具如何運作的幾點說明：

- 一般情況下，我們會尋找幸運的情況，即第一個參數是一個物件表達式並包含 "queryKey" 或 "mutationKey" 屬性（取決於正在轉換的鉤子/方法調用）。如果是這種情況，您的代碼已經符合新的簽名，因此代碼修改工具不會觸碰它。🎉
- 如果上述條件不滿足，則代碼修改工具將檢查第一個參數是否為數組表達式或引用數組表達式的標識符。如果是這種情況，代碼修改工具會將其放入物件表達式中，然後它將成為第一個參數。
- 如果可以推斷出物件參數，代碼修改工具將嘗試將已存在的屬性複製到新創建的物件中。
- 如果代碼修改工具無法推斷使用情況，則會在控制台上留下一條消息。該消息包含使用情況的文件名和行號。在這種情況下，您需要手動進行遷移。
- 如果轉換導致錯誤，您也會在控制台上看到一條消息。此消息將通知您發生了意外情況，請手動進行遷移。

### `useQuery`（和 `QueryObserver`）上的回調函數已被移除

`onSuccess`、`onError` 和 `onSettled` 已從查詢中移除。它們在突變中未被觸碰。請參閱 [此 RFC](https://github.com/TanStack/query/discussions/5279) 了解此變更的動機以及替代方案。

### `refetchInterval` 回調函數現在僅傳遞 `query`

這簡化了回調的調用方式（`refetchOnWindowFocus`、`refetchOnMount` 和 `refetchOnReconnect` 回調也僅傳遞查詢），並修復了當回調獲取由 `select` 轉換的數據時的一些類型問題。

```tsx
- refetchInterval: number | false | ((data: TData | undefined, query: Query) => number | false | undefined) // [!code --]
+ refetchInterval: number | false | ((query: Query) => number | false | undefined) // [!code ++]
```

您仍然可以通過 `query.state.data` 訪問數據，但它不會是被 `select` 轉換後的數據。如果您需要訪問轉換後的數據，可以對 `query.state.data` 再次調用轉換函數。

### `useQuery` 中的 `remove` 方法已被移除

以前，`remove` 方法用於從 `queryCache` 中移除查詢而不通知觀察者。它最適合用於強制移除不再需要的數據，例如在用戶註銷時。

但在查詢仍然活躍時這樣做並無太大意義，因為它只會在下一次重新渲染時觸發硬加載狀態。

如果您仍然需要移除查詢，可以使用 `queryClient.removeQueries({queryKey: key})`

```tsx
const queryClient = useQueryClient()
const query = useQuery({ queryKey, queryFn })

query.remove() // [!code --]
queryClient.removeQueries({ queryKey }) // [!code ++]
```

### 最低要求的 TypeScript 版本現在是 4.7

主要是因為修復了一個關於類型推斷的重要問題。請參閱此 [TypeScript 問題](https://github.com/microsoft/TypeScript/issues/43371) 了解更多信息。

### `useQuery` 中的 `isDataEqual` 選項已被移除

以前，此函數用於指示是否使用先前的 `data`（`true`）或新數據（`false`）作為查詢的解析數據。

您可以通過向 `structuralSharing` 傳遞一個函數來實現相同的功能：

```tsx
 import { replaceEqualDeep } from '@tanstack/react-query'

- isDataEqual: (oldData, newData) => customCheck(oldData, newData) // [!code --]
+ structuralSharing: (oldData, newData) => customCheck(oldData, newData) ? oldData : replaceEqualDeep(oldData, newData) // [!code ++]
```

### 已棄用的自定義記錄器已被移除

自定義記錄器在 v4 中已被棄用，並在此版本中被移除。記錄僅在開發模式下有效，而在開發模式下傳遞自定義記錄器是不必要的。

### 支持的瀏覽器

我們已更新我們的 `browserslist` 以生成更現代、性能更好且更小的捆綁包。您可以在 [這裡](../../installation#requirements) 閱讀相關要求。

### 私有類字段和方法

TanStack Query 一直都有類的私有字段和方法，但它們並不是真正的私有——它們只是在 `TypeScript` 中是私有的。我們現在使用 [ECMAScript 私有類特性](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)，這意味著這些字段現在在運行時是真正私有的，無法從外部訪問。

### 將 `cacheTime` 重命名為 `gcTime`

幾乎每個人都誤解了 `cacheTime`。它聽起來像是「數據被緩存的時間」，但這並不正確。

`cacheTime` 在查詢仍在使用時不會執行任何操作。它僅在查詢變為未使用後才開始生效。時間過後，數據將被「垃圾回收」以避免緩存增長。

`gc` 指的是「垃圾回收」時間。這有點技術性，但也是計算機科學中 [廣為人知的縮寫](<https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)>)。

```tsx
const MINUTE = 1000 * 60;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
-      cacheTime: 10 * MINUTE, // [!code --]
+      gcTime: 10 * MINUTE, // [!code ++]
    },
  },
})
```

### `useErrorBoundary` 選項已更名為 `throwOnError`

為了使 `useErrorBoundary` 選項更框架無關並避免與已建立的 React 函數前綴 "`use`"（用於鉤子）和 "ErrorBoundary" 組件名稱混淆，它已更名為 `throwOnError` 以更準確地反映其功能。

### TypeScript: `Error` 現在是錯誤的默認類型，而不是 `unknown`

儘管在 JavaScript 中，您可以 `throw` 任何東西（這使得 `unknown` 是最正確的類型），但幾乎總是會拋出 `Error`（或 `Error` 的子類）。此變更使在 TypeScript 中處理 `error` 字段更容易。

如果您想拋出不是 `Error` 的東西，現在必須自己設置泛型：

```ts
useQuery<number, string>({
  queryKey: ['some-query'],
  queryFn: async () => {
    if (Math.random() > 0.5) {
      throw 'some error'
    }
    return 42
  },
})
```

有關全局設置不同類型錯誤的方法，請參閱 [TypeScript 指南](../typescript.md#registering-a-global-error)。

### eslint `prefer-query-object-syntax` 規則已被移除

由於現在唯一支持的語法是物件語法，因此不再需要此規則。

### 移除 `keepPreviousData` 以支持 `placeholderData` 恆等函數

我們已移除 `keepPreviousData` 選項和 `isPreviousData` 標誌，因為它們的功能與 `placeholderData` 和 `isPlaceholderData` 標誌幾乎相同。

為了實現與 `keepPreviousData` 相同的功能，我們將先前查詢的 `data` 作為參數添加到 `placeholderData` 中，該參數接受一個恆等函數。因此，您只需向 `placeholderData` 提供一個恆等函數或使用 Tanstack Query 中包含的 `keepPreviousData` 函數。

> 需要注意的是，`useQueries` 不會在 `placeholderData` 函數中接收 `previousData` 作為參數。這是由於傳遞到數組中的查詢具有動態性質，這可能導致佔位符和 `queryFn` 的結果形狀不同。

```tsx
import {
   useQuery,
+  keepPreviousData // [!code ++]
} from "@tanstack/react-query";

const {
   data,
-  isPreviousData, // [!code --]
+  isPlaceholderData, // [!code ++]
} = useQuery({
  queryKey,
  queryFn,
- keepPreviousData: true, // [!code --]
+ placeholderData: keepPreviousData // [!code ++]
});
```

在 Tanstack Query 的上下文中，恆等函數指的是始終返回其提供的參數（即數據）而不進行更改的函數。

```ts
useQuery({
  queryKey,
  queryFn,
  placeholderData: (previousData, previousQuery) => previousData, // 恆等函數，行為與 `keepPreviousData` 相同
})
```

然而，此變更有一些需要注意的地方：

- `placeholderData` 始終會將您置於 `success` 狀態，而 `keepPreviousData` 會給您先前查詢的狀態。如果我們成功獲取數據後在後台重新獲取時出現錯誤，該狀態可能是 `error`。然而，錯誤本身並未共享，因此我們決定堅持 `placeholderData` 的行為。
- `keepPreviousData` 會給您先前數據的 `dataUpdatedAt` 時間戳，而使用 `placeholderData` 時，`dataUpdatedAt` 將保持為 `0`。如果您想在屏幕上連續顯示該時間戳，這可能會很煩人。但您可以通過 `useEffect` 繞過這個問題。

  ```ts
  const [updatedAt, setUpdatedAt] = useState(0)

  const { data, dataUpdatedAt } = useQuery({
    queryKey: ['projects', page],
    queryFn: () => fetchProjects(page),
  })

  useEffect(() => {
    if (dataUpdatedAt > updatedAt) {
      setUpdatedAt(dataUpdatedAt)
    }
  }, [dataUpdatedAt])
  ```

### 窗口焦點重新獲取不再監聽 `focus` 事件

現在僅使用 `visibilitychange` 事件。這是可行的，因為我們僅支持支持 `visibilitychange` 事件的瀏覽器。這修復了 [此處列出](https://github.com/TanStack/query/pull/4805) 的一系列問題。

### 網絡狀態不再依賴 `navigator.onLine` 屬性

`navigator.onLine` 在基於 Chromium 的瀏覽器中效果不佳。有 [許多問題](https://bugs.chromium.org/p/chromium/issues/list?q=navigator.online) 關於假陰性，這導致查詢被錯誤地標記為 `offline`。

為了解決這個問題，我們現在始終以 `online: true` 開始，並且僅監聽 `online` 和 `offline` 事件來更新狀態。

這應該會減少假陰性的可能性，然而，對於通過 `serviceWorkers` 加載的離線應用程序，這可能意味著假陽性，這些應用程序即使沒有互聯網連接也可以工作。

### 移除自定義 `context` 屬性以支持自定義 `queryClient` 實例

在 v4 中，我們引入了向所有 react-query 鉤子傳遞自定義 `context` 的可能性。這在使用微前端時實現了適當的隔離。

然而，`context` 是一個僅限於 react 的特性。`context` 所做的只是讓我們訪問 `queryClient`。我們可以通過允許直接傳入自定義 `queryClient` 來實現相同的隔離。
這反過來將使其他框架能夠以框架無關的方式擁有相同的功能。

```tsx
import { queryClient } from './my-client'

const { data } = useQuery(
  {
    queryKey: ['users', id],
    queryFn: () => fetch(...),
-   context: customContext // [!code --]
  },
+  queryClient, // [!code ++]
)
```

### 移除 `refetchPage` 以支持 `maxPages`

在 v4 中，我們引入了通過 `refetchPage` 函數定義無限查詢要重新獲取的頁面的可能性。

然而，重新獲取所有頁面可能會導致 UI 不一致。此外，此選項在例如 `queryClient.refetchQueries` 上可用，但它僅對無限查詢有效，而不是「普通」查詢。

v5 包括無限查詢的新 `maxPages` 選項，以限制存儲在查詢數據中並隨後重新獲取的頁面數量。您可以根據您想要提供的 UX 和重新獲取性能調整 `maxPages` 值。

請注意，無限列表必須是雙向的，這需要同時定義
