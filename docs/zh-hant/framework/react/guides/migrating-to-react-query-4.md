---
source-updated-at: '2025-03-31T09:06:11.000Z'
translation-updated-at: '2025-05-08T20:25:07.836Z'
id: migrating-to-react-query-4
title: 遷移至 v4
---

## 重大變更

v4 是一個主要版本，因此需要注意以下重大變更：

### react-query 現在改為 @tanstack/react-query

您需要解除安裝舊依賴並安裝新依賴，同時變更導入語句：

```
npm uninstall react-query
npm install @tanstack/react-query
npm install @tanstack/react-query-devtools
```

```tsx
- import { useQuery } from 'react-query' // [!code --]
- import { ReactQueryDevtools } from 'react-query/devtools' // [!code --]

+ import { useQuery } from '@tanstack/react-query' // [!code ++]
+ import { ReactQueryDevtools } from '@tanstack/react-query-devtools' // [!code ++]
```

#### 代碼轉換工具 (Codemod)

為了簡化導入遷移，v4 提供了一個代碼轉換工具。

> 此代碼轉換工具會盡力協助您遷移重大變更。請徹底檢查生成的代碼！此外，有些邊緣案例可能無法被代碼轉換工具發現，因此請注意日誌輸出。

您可以透過以下任一命令輕鬆應用它：

如果要針對 `.js` 或 `.jsx` 檔案執行，請使用以下命令：

```
npx jscodeshift ./path/to/src/ \
  --extensions=js,jsx \
  --transform=./node_modules/@tanstack/react-query/codemods/v4/replace-import-specifier.js
```

如果要針對 `.ts` 或 `.tsx` 檔案執行，請使用以下命令：

```
npx jscodeshift ./path/to/src/ \
  --extensions=ts,tsx \
  --parser=tsx \
  --transform=./node_modules/@tanstack/react-query/codemods/v4/replace-import-specifier.js
```

請注意，在 `TypeScript` 的情況下，您需要使用 `tsx` 作為解析器，否則代碼轉換工具將無法正確應用！

**注意：** 應用代碼轉換工具可能會破壞您的代碼格式，因此在應用後請別忘記執行 `prettier` 和/或 `eslint`！

**注意：** 代碼轉換工具 _僅_ 會變更導入語句 — 您仍需手動安裝獨立的開發工具套件。

### 查詢鍵 (Query Keys) 和變異鍵 (Mutation Keys) 必須為陣列

在 v3 中，查詢鍵和變異鍵可以是字串或陣列。React Query 內部始終僅使用陣列鍵，有時會將其暴露給使用者。例如，在 `queryFn` 中，您始終會獲得陣列鍵，以便更容易使用[預設查詢函式](./default-query-function.md)。

然而，我們並未在所有 API 中貫徹這一概念。例如，當使用[查詢過濾器](./filters.md)中的 `predicate` 函式時，您會獲得原始查詢鍵。如果您混合使用陣列和字串作為查詢鍵，這將使處理此類函式變得困難。使用全域回調時也是如此。

為了簡化所有 API，我們決定讓所有鍵僅為陣列：

```tsx
;-useQuery('todos', fetchTodos) + // [!code --]
  useQuery(['todos'], fetchTodos) // [!code ++]
```

#### 代碼轉換工具

為了簡化遷移，我們決定提供一個代碼轉換工具。

> 此代碼轉換工具會盡力協助您遷移重大變更。請徹底檢查生成的代碼！此外，有些邊緣案例可能無法被代碼轉換工具發現，因此請注意日誌輸出。

您可以透過以下任一命令輕鬆應用它：

如果要針對 `.js` 或 `.jsx` 檔案執行，請使用以下命令：

```
npx jscodeshift ./path/to/src/ \
  --extensions=js,jsx \
  --transform=./node_modules/@tanstack/react-query/codemods/v4/key-transformation.js
```

如果要針對 `.ts` 或 `.tsx` 檔案執行，請使用以下命令：

```
npx jscodeshift ./path/to/src/ \
  --extensions=ts,tsx \
  --parser=tsx \
  --transform=./node_modules/@tanstack/react-query/codemods/v4/key-transformation.js
```

請注意，在 `TypeScript` 的情況下，您需要使用 `tsx` 作為解析器，否則代碼轉換工具將無法正確應用！

**注意：** 應用代碼轉換工具可能會破壞您的代碼格式，因此在應用後請別忘記執行 `prettier` 和/或 `eslint`！

### 已移除 idle 狀態

隨著新的 [fetchStatus](./queries.md#fetchstatus) 引入以提供更好的離線支援，`idle` 狀態變得無關緊要，因為 `fetchStatus: 'idle'` 能更好地捕捉相同狀態。更多資訊請參閱[為什麼有兩種不同狀態](./queries.md#why-two-different-states)。

這主要會影響尚未有任何 `data` 的 `disabled` 查詢，因為這些查詢之前處於 `idle` 狀態：

```tsx
- status: 'idle' // [!code --]
+ status: 'loading'  // [!code ++]
+ fetchStatus: 'idle' // [!code ++]
```

此外，請參閱[依賴查詢指南](./dependent-queries.md)

#### 停用的查詢

由於此變更，停用的查詢（即使是暫時停用的查詢）將以 `loading` 狀態開始。為了簡化遷移，特別是為了有一個良好的標誌來判斷何時顯示載入指示器，您可以檢查 `isInitialLoading` 而非 `isLoading`：

```tsx
;-isLoading + // [!code --]
  isInitialLoading // [!code ++]
```

另請參閱[停用查詢指南](./disabling-queries.md#isInitialLoading)

### `useQueries` 的新 API

`useQueries` 鉤子現在接受一個帶有 `queries` 屬性的物件作為輸入。`queries` 屬性的值是一個查詢陣列（此陣列與 v3 中傳遞給 `useQueries` 的內容相同）。

```tsx
;-useQueries([
  { queryKey1, queryFn1, options1 },
  { queryKey2, queryFn2, options2 },
]) + // [!code --]
  useQueries({
    queries: [
      { queryKey1, queryFn1, options1 },
      { queryKey2, queryFn2, options2 },
    ],
  }) // [!code ++]
```

### undefined 不再是成功查詢的有效快取值

為了能夠透過返回 `undefined` 來中止更新，我們必須將 `undefined` 設為無效的快取值。這與 react-query 的其他概念一致，例如從 [initialData 函式](./initial-query-data.md#initial-data-function) 返回 `undefined` 也 _不會_ 設定資料。

此外，在 `queryFn` 中添加日誌記錄很容易產生 `Promise<void>`：

```tsx
useQuery(['key'], () =>
  axios.get(url).then((result) => console.log(result.data)),
)
```

現在這在類型層面上被禁止；在運行時，`undefined` 將被轉換為 _失敗的 Promise_，這意味著您將獲得一個 `error`，並且在開發模式下也會將此錯誤記錄到控制台。

### 查詢和變異預設需要網路連接才能運行

請閱讀關於線上/離線支援的[新功能公告](#proper-offline-support)，以及專門的[網路模式](./network-mode.md)頁面。

儘管 React Query 是一個可以用於任何產生 Promise 的異步狀態管理器，但它最常與資料獲取庫一起用於資料獲取。這就是為什麼預設情況下，如果沒有網路連接，查詢和變異將被 `paused`。如果您希望保持之前的行為，可以為查詢和變異全域設定 `networkMode: offlineFirst`：

```tsx
new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
})
```

### `notifyOnChangeProps` 屬性不再接受 `"tracked"` 作為值

`notifyOnChangeProps` 選項不再接受 `"tracked"` 值。相反，`useQuery` 預設會追蹤屬性。所有使用 `notifyOnChangeProps: "tracked"` 的查詢應通過移除此選項來更新。

如果您希望在任何查詢中繞過此行為以模擬 v3 的預設行為（即每當查詢變更時重新渲染），`notifyOnChangeProps` 現在接受 `"all"` 值來選擇退出預設的智能追蹤優化。

### `notifyOnChangePropsExclusion` 已被移除

在 v4 中，`notifyOnChangeProps` 預設為 v3 的 `"tracked"` 行為，而非 `undefined`。現在 `"tracked"` 是 v4 的預設行為，因此不再需要包含此配置選項。

### `cancelRefetch` 行為一致化

`cancelRefetch` 選項可以傳遞給所有強制獲取查詢的函式，即：

- `queryClient.refetchQueries`
- `queryClient.invalidateQueries`
- `queryClient.resetQueries`
- `refetch` 從 `useQuery` 返回
- `fetchNextPage` 和 `fetchPreviousPage` 從 `useInfiniteQuery` 返回

除了 `fetchNextPage` 和 `fetchPreviousPage`，此標誌預設為 `false`，這是不一致且可能帶來問題的：如果在一個緩慢的獲取已在進行中時呼叫 `refetchQueries` 或 `invalidateQueries`，可能不會獲得最新結果，因為此重新獲取將被跳過。

我們認為，如果查詢被您編寫的代碼主動重新獲取，它應該預設重新開始獲取。

這就是為什麼此標誌現在對上述所有方法預設為 _true_。這也意味著如果您連續呼叫 `refetchQueries` 兩次而不等待，它現在將取消第一次獲取並用第二次重新開始：

```
queryClient.refetchQueries({ queryKey: ['todos'] })
// 這將中止先前的重新獲取並開始新的獲取
queryClient.refetchQueries({ queryKey: ['todos'] })
```

您可以通過明確傳遞 `cancelRefetch:false` 來選擇退出此行為：

```
queryClient.refetchQueries({ queryKey: ['todos'] })
// 這不會中止先前的重新獲取 — 它將被忽略
queryClient.refetchQueries({ queryKey: ['todos'] }, { cancelRefetch: false })
```

> 注意：對於自動觸發的獲取（例如由於查詢掛載或窗口焦點重新獲取），行為沒有變更。

### 查詢過濾器

[查詢過濾器](./filters.md) 是一個具有特定條件以匹配查詢的物件。歷史上，過濾選項主要是布林標誌的組合。然而，組合這些標誌可能導致不可能的狀態。具體來說：

```
active?: boolean
  - 設為 true 時將匹配活動查詢。
  - 設為 false 時將匹配非活動查詢。
inactive?: boolean
  - 設為 true 時將匹配非活動查詢。
  - 設為 false 時將匹配活動查詢。
```

這些標誌在一起使用時效果不佳，因為它們是互斥的。將兩個標誌都設為 `false` 可以根據描述匹配所有查詢，或者不匹配任何查詢，這沒有多大意義。

在 v4 中，這些過濾器已合併為單一過濾器，以更好地顯示意圖：

```tsx
- active?: boolean // [!code --]
- inactive?: boolean // [!code --]
+ type?: 'active' | 'inactive' | 'all' // [!code ++]
```

過濾器預設為 `all`，您可以選擇僅匹配 `active` 或 `inactive` 查詢。

#### refetchActive / refetchInactive

[queryClient.invalidateQueries](../../../reference/QueryClient.md#queryclientinvalidatequeries) 有兩個額外的類似標誌：

```
refetchActive: Boolean
  - 預設為 true
  - 設為 false 時，匹配重新獲取謂詞且正通過 useQuery 等渲染的查詢將不會在後台重新獲取，僅標記為無效。
refetchInactive: Boolean
  - 預設為 false
  - 設為 true 時，匹配重新獲取謂詞且未通過 useQuery 等渲染的查詢將同時標記為無效並在後台重新獲取。
```

出於相同原因，這些也已合併：

```tsx
- refetchActive?: boolean // [!code --]
- refetchInactive?: boolean // [!code --]
+ refetchType?: 'active' | 'inactive' | 'all' | 'none' // [!code ++]
```

此標誌預設為 `active`，因為 `refetchActive` 預設為 `true`。這意味著我們還需要一種方法來告訴 `invalidateQueries` 完全不重新獲取，這就是為什麼這裡也允許第四個選項（`none`）。

### `onSuccess` 不再從 `setQueryData` 呼叫

這讓許多人感到困惑，並且如果從 `onSuccess` 內部呼叫 `setQueryData`，還會導致無限循環。當與 `staleTime` 結合使用時，這也經常是錯誤的來源，因為如果僅從快取讀取資料，`onSuccess` _不會_ 被呼叫。

與 `onError` 和 `onSettled` 類似，`onSuccess` 回調現在與發出的請求綁定。沒有請求 -> 沒有回調。

如果您想監聽 `data` 欄位的變更，最好使用 `useEffect`，其中 `data` 是依賴陣列的一部分。由於 React Query 通過結構共享確保資料穩定，效果不會在每次後台重新獲取時執行，而僅在資料中的某些內容變更時執行：

```
const { data } = useQuery({ queryKey, queryFn })
React.useEffect(() => mySideEffectHere(data), [data])
```

### `persistQueryClient` 和相應的持久化插件不再處於實驗階段並已更名

插件 `createWebStoragePersistor` 和 `createAsyncStoragePersistor` 已更名為 [`createSyncStoragePersister`](../plugins/createSyncStoragePersister.md) 和 [`createAsyncStoragePersister`](../plugins/createAsyncStoragePersister.md)。`persistQueryClient` 中的介面 `Persistor` 也更名為 `Persister`。查看[此 StackExchange](https://english.stackexchange.com/questions/206893/persister-or-persistor) 了解此變更的動機。

由於這些插件不再處於實驗階段，它們的導入路徑也已更新：

```tsx
- import { persistQueryClient } from 'react-query/persistQueryClient-experimental' // [!code --]
- import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental' // [!code --]
- import { createAsyncStoragePersistor } from 'react-query/createAsyncStoragePersistor-experimental' // [!code --]

+ import { persistQueryClient } from '@tanstack/react-query-persist-client' // [!code ++]
+ import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister' // [!code ++]
+ import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'  // [!code ++]
```

### 不再支援 Promise 上的 `cancel` 方法

[舊的 `cancel` 方法](./query-cancellation.md#old-cancel-function) 允許您在 Promise 上定義一個 `cancel` 函式，然後由函式庫用於支援查詢取消，現已移除。我們建議使用[較新的 API](./query-cancellation.md)（自 v3.30.0 引入）進行查詢取消，該 API 內部使用 [`AbortController` API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) 並為您的查詢函式提供一個 [`AbortSignal` 實例](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) 以支援查詢取消。

### TypeScript

類型現在需要使用 TypeScript v4.1 或更高版本

### 支援的瀏覽器

從 v4 開始，React Query 針對現代瀏覽器進行了優化。我們已更新 browserslist 以產生更現代、性能更好且更小的套件包。您可以在[安裝說明](../../installation#requirements)中閱讀相關要求。

### `setLogger` 已被移除

過去可以通過呼叫 `setLogger` 全域變更記錄器。在 v4 中，該函式被替換為創建 `QueryClient` 時的一個可選欄位。

```tsx
- import { QueryClient, setLogger } from 'react-query'; // [!code --]
+ import { QueryClient } from '@tanstack/react-query'; // [!code ++]

- setLogger(customLogger) // [!code --]
- const queryClient = new QueryClient(); // [!code --]
+ const queryClient = new QueryClient({ logger: customLogger }) // [!code ++]
```

### 伺服器端不再預設手動垃圾回收

在 v3 中，React Query 會預設快取查詢結果 5 分鐘，然後手動垃圾回收這些資料。此預設值也應用於伺服器端的 React Query。

這導致高記憶體消耗和掛起的進程等待此手動垃圾回收完成。在 v4 中，伺服器端的 `cacheTime` 現在預設設為 `Infinity`，有效地禁用手動垃圾回收（NodeJS 進程將在請求完成後清除所有內容）。

此變更僅影響使用伺服器端 React Query 的使用者，例如與 Next.js 一起使用時。如果您手動設定 `cacheTime`，這將不會影響您（儘管您可能希望鏡像
