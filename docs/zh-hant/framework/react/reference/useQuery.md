---
source-updated-at: '2025-04-07T12:21:06.000Z'
translation-updated-at: '2025-05-08T20:21:30.979Z'
id: useQuery
title: useQuery
---

```tsx
const {
  data,
  dataUpdatedAt,
  error,
  errorUpdatedAt,
  failureCount,
  failureReason,
  fetchStatus,
  isError,
  isFetched,
  isFetchedAfterMount,
  isFetching,
  isInitialLoading,
  isLoading,
  isLoadingError,
  isPaused,
  isPending,
  isPlaceholderData,
  isRefetchError,
  isRefetching,
  isStale,
  isSuccess,
  promise,
  refetch,
  status,
} = useQuery(
  {
    queryKey,
    queryFn,
    gcTime,
    enabled,
    networkMode,
    initialData,
    initialDataUpdatedAt,
    meta,
    notifyOnChangeProps,
    placeholderData,
    queryKeyHashFn,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnMount,
    refetchOnReconnect,
    refetchOnWindowFocus,
    retry,
    retryOnMount,
    retryDelay,
    select,
    staleTime,
    structuralSharing,
    subscribed,
    throwOnError,
  },
  queryClient,
)
```

**參數1 (選項)**

- `queryKey: unknown[]`
  - **必填**
  - 此查詢使用的查詢鍵 (query key)。
  - 查詢鍵會被雜湊成一個穩定的雜湊值。詳見[查詢鍵](../guides/query-keys.md)說明。
  - 當此鍵值變更時，查詢會自動更新（除非 `enabled` 設為 `false`）。
- `queryFn: (context: QueryFunctionContext) => Promise<TData>`
  - **若未定義預設查詢函式則為必填**，詳見[預設查詢函式](../guides/default-query-function.md)說明。
  - 查詢用於請求資料的函式。
  - 接收一個[查詢函式上下文 (QueryFunctionContext)](../guides/query-functions.md#queryfunctioncontext)。
  - 必須回傳一個會解析資料或拋出錯誤的 Promise。資料不可為 `undefined`。
- `enabled: boolean | (query: Query) => boolean`
  - 設為 `false` 可禁止此查詢自動執行。
  - 可用於[依賴查詢 (Dependent Queries)](../guides/dependent-queries.md)。
- `networkMode: 'online' | 'always' | 'offlineFirst'`
  - 選填
  - 預設為 `'online'`
  - 詳見[網路模式 (Network Mode)](../guides/network-mode.md)說明。
- `retry: boolean | number | (failureCount: number, error: TError) => boolean`
  - 若為 `false`，失敗的查詢預設不會重試。
  - 若為 `true`，失敗的查詢會無限重試。
  - 若設為數字（如 `3`），失敗的查詢會重試直到失敗次數達到該數字。
  - 用戶端預設為 `3`，伺服器端預設為 `0`。
- `retryOnMount: boolean`
  - 若設為 `false`，當查詢包含錯誤時不會在掛載時重試。預設為 `true`。
- `retryDelay: number | (retryAttempt: number, error: TError) => number`
  - 此函式接收 `retryAttempt` 整數與實際錯誤，並回傳下次重試前的延遲時間（毫秒）。
  - 如 `attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)` 的函式會套用指數退避。
  - 如 `attempt => attempt * 1000` 的函式會套用線性退避。
- `staleTime: number | ((query: Query) => number)`
  - 選填
  - 預設為 `0`
  - 資料被視為過期 (stale) 的時間（毫秒）。此值僅適用於定義它的鉤子 (hook)。
  - 設為 `Infinity` 時，資料永遠不會被視為過期。
  - 設為函式時，會傳入查詢以計算 `staleTime`。
- `gcTime: number | Infinity`
  - 預設為 `5 * 60 * 1000`（5 分鐘）或 SSR 期間為 `Infinity`
  - 未使用/非活躍的快取資料保留在記憶體中的時間（毫秒）。當查詢快取變為未使用或非活躍時，此時間後會進行垃圾回收。若指定不同回收時間，會採用最長者。
  - 注意：最大允許時間約為 24 天。詳見[說明](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value)。
  - 設為 `Infinity` 會停用垃圾回收。
- `queryKeyHashFn: (queryKey: QueryKey) => string`
  - 選填
  - 若指定，此函式用於將 `queryKey` 雜湊成字串。
- `refetchInterval: number | false | ((query: Query) => number | false | undefined)`
  - 選填
  - 設為數字時，所有查詢會以此頻率（毫秒）持續重新取得。
  - 設為函式時，會傳入查詢以計算頻率。
- `refetchIntervalInBackground: boolean`
  - 選填
  - 設為 `true` 時，設定為持續重新取得的查詢在分頁/視窗處於背景時仍會繼續重新取得。
- `refetchOnMount: boolean | "always" | ((query: Query) => boolean | "always")`
  - 選填
  - 預設為 `true`
  - 設為 `true` 時，若資料過期會在掛載時重新取得。
  - 設為 `false` 時，掛載時不會重新取得。
  - 設為 `"always"` 時，掛載時總是重新取得。
  - 設為函式時，會傳入查詢以計算值。
- `refetchOnWindowFocus: boolean | "always" | ((query: Query) => boolean | "always")`
  - 選填
  - 預設為 `true`
  - 設為 `true` 時，若資料過期會在視窗取得焦點時重新取得。
  - 設為 `false` 時，視窗取得焦點時不會重新取得。
  - 設為 `"always"` 時，視窗取得焦點時總是重新取得。
  - 設為函式時，會傳入查詢以計算值。
- `refetchOnReconnect: boolean | "always" | ((query: Query) => boolean | "always")`
  - 選填
  - 預設為 `true`
  - 設為 `true` 時，若資料過期會在重新連線時重新取得。
  - 設為 `false` 時，重新連線時不會重新取得。
  - 設為 `"always"` 時，重新連線時總是重新取得。
  - 設為函式時，會傳入查詢以計算值。
- `notifyOnChangeProps: string[] | "all" | (() => string[] | "all" | undefined)`
  - 選填
  - 設定後，元件僅在列出的屬性變更時重新渲染。
  - 例如設為 `['data', 'error']` 時，僅在 `data` 或 `error` 屬性變更時重新渲染。
  - 設為 `"all"` 時，元件會退出智慧追蹤，並在查詢更新時總是重新渲染。
  - 設為函式時，會執行函式以計算屬性清單。
  - 預設會追蹤屬性存取，並僅在追蹤的屬性變更時重新渲染。
- `select: (data: TData) => unknown`
  - 選填
  - 此選項可用於轉換或選取查詢函式回傳資料的一部分。會影響回傳的 `data` 值，但不影響存入查詢快取的內容。
  - `select` 函式僅在 `data` 變更或 `select` 函式本身的參照變更時執行。建議用 `useCallback` 包裹函式以優化。
- `initialData: TData | () => TData`
  - 選填
  - 設定後，此值會用作查詢快取的初始資料（僅在查詢尚未建立或快取時）。
  - 設為函式時，會在共享/根查詢初始化期間呼叫**一次**，並預期同步回傳初始資料。
  - 初始資料預設視為過期，除非設定了 `staleTime`。
  - `initialData` **會持久化**到快取中。
- `initialDataUpdatedAt: number | (() => number | undefined)`
  - 選填
  - 設定後，此值會用作 `initialData` 本身最後更新的時間（毫秒）。
- `placeholderData: TData | (previousValue: TData | undefined; previousQuery: Query | undefined,) => TData`
  - 選填
  - 設定後，此值會用作此特定查詢觀察者 (query observer) 在查詢仍處於 `pending` 狀態時的佔位資料。
  - `placeholderData` **不會持久化**到快取中。
  - 若為 `placeholderData` 提供函式，第一個參數會接收先前觀測的查詢資料（如有），第二個參數會是完整的 previousQuery 實例。
- `structuralSharing: boolean | (oldData: unknown | undefined, newData: unknown) => unknown)`
  - 選填
  - 預設為 `true`
  - 設為 `false` 時，會停用查詢結果間的結構共享 (structural sharing)。
  - 設為函式時，舊資料與新資料會傳入此函式，應將其合併為查詢的解析資料。如此可保留舊資料的參照以提升效能，即使資料包含不可序列化的值。
- `subscribed: boolean`
  - 選填
  - 預設為 `true`
  - 設為 `false` 時，此 `useQuery` 實例不會訂閱快取。意味著它不會自行觸發 `queryFn`，也不會在資料透過其他方式進入快取時接收更新。
- `throwOnError: undefined | boolean | (error: TError, query: Query) => boolean`
  - 設為 `true` 時，錯誤會在渲染階段拋出並傳遞至最近的錯誤邊界 (error boundary)。
  - 設為 `false` 時，會停用 `suspense` 將錯誤拋至錯誤邊界的預設行為。
  - 設為函式時，會傳入錯誤與查詢，應回傳布林值指示是否在錯誤邊界顯示錯誤（`true`）或將錯誤作為狀態回傳（`false`）。
- `meta: Record<string, unknown>`
  - 選填
  - 設定後，會在查詢快取條目中儲存額外資訊供需要時使用。可在 `query` 可用的任何地方存取，也是提供給 `queryFn` 的 `QueryFunctionContext` 的一部分。

**參數2 (QueryClient)**

- `queryClient?: QueryClient`,
  - 用於自訂 QueryClient。若未提供，會使用最接近上下文中的 QueryClient。

**回傳值**

- `status: QueryStatus`
  - 可能值：
    - `pending`：若無快取資料且查詢嘗試尚未完成。
    - `error`：若查詢嘗試導致錯誤。對應的 `error` 屬性包含從嘗試取得收到的錯誤。
    - `success`：若查詢收到無錯誤的回應且準備顯示資料。查詢的 `data` 屬性為成功取得收到的資料，或若查詢的 `enabled` 屬性設為 `false` 且尚未取得時，`data` 為初始化時提供給查詢的第一個 `initialData`。
- `isPending: boolean`
  - 從上述 `status` 變數衍生的布林值，方便使用。
- `isSuccess: boolean`
  - 從上述 `status` 變數衍生的布林值，方便使用。
- `isError: boolean`
  - 從上述 `status` 變數衍生的布林值，方便使用。
- `isLoadingError: boolean`
  - 若首次取得時查詢失敗則為 `true`。
- `isRefetchError: boolean`
  - 若重新取得時查詢失敗則為 `true`。
- `data: TData`
  - 預設為 `undefined`。
  - 查詢最後成功解析的資料。
- `dataUpdatedAt: number`
  - 查詢最近一次回傳 `status` 為 `"success"` 的時間戳記。
- `error: null | TError`
  - 預設為 `null`
  - 查詢的錯誤物件（若拋出錯誤）。
- `errorUpdatedAt: number`
  - 查詢最近一次回傳 `status` 為 `"error"` 的時間戳記。
- `isStale: boolean`
  - 若快取中的資料失效或資料比給定的 `staleTime` 舊則為 `true`。
- `isPlaceholderData: boolean`
  - 若顯示的資料為佔位資料則為 `true`。
- `isFetched: boolean`
  - 若查詢已取得過則為 `true`。
- `isFetchedAfterMount: boolean`
  - 若元件掛載後查詢已取得過則為 `true`。
  - 此屬性可用於不顯示任何先前快取的資料。
- `fetchStatus: FetchStatus`
  - `fetching`：當 `queryFn` 執行時為 `true`，包含初始 `pending` 與背景重新取得。
  - `paused`：查詢想取得但被 `paused`。
  - `idle`：查詢未在取得中。
  - 詳見[網路模式 (Network Mode)](../guides/network-mode)說明。
- `isFetching: boolean`
  - 從上述 `fetchStatus` 變數衍生的布林值，方便使用。
- `isPaused: boolean`
  - 從上述 `fetchStatus` 變數衍生的布林值，方便使用。
- `isRefetching: boolean`
  - 當背景重新取得進行中時為 `true`，**不包含**初始 `pending`。
  - 等同於 `isFetching && !isPending`。
- `isLoading: boolean`
  - 當查詢首次取得進行中時為 `true`。
  - 等同於 `isFetching && isPending`。
- `isInitialLoading: boolean`
  - **已棄用**
  - `isLoading` 的別名，將在下一主要版本移除。
- `failureCount: number`
  - 查詢的失敗計數。
  - 每次查詢失敗時遞增。
  - 查詢成功時重置為 `0`。
- `failureReason: null | TError`
  - 查詢重試的失敗原因。
  - 查詢成功時重置為 `null`。
- `errorUpdateCount: number`
  - 所有錯誤的總和。
- `refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<UseQueryResult>`
  - 手動重新取得查詢的函式。
  - 若查詢錯誤，錯誤僅會記錄。若想拋出錯誤，傳入 `throwOnError: true` 選項。
  - `cancelRefetch?: boolean`
    - 預設為 `true`
      - 預設情況下，發出新請求前會取消當前執行中的請求。
    - 設為 `false` 時，若已有請求執行中則不會重新取得。
- `promise: Promise<TData>`
  - 一個穩定的 Promise，會以查詢的資料解析。
  - 需在 `QueryClient` 上啟用 `experimental_prefetchInRender` 功能標誌。
