---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:20:36.993Z'
id: useMutation
title: useMutation
---

```tsx
const {
  data,
  error,
  isError,
  isIdle,
  isPending,
  isPaused,
  isSuccess,
  failureCount,
  failureReason,
  mutate,
  mutateAsync,
  reset,
  status,
  submittedAt,
  variables,
} = useMutation(
  {
    mutationFn,
    gcTime,
    meta,
    mutationKey,
    networkMode,
    onError,
    onMutate,
    onSettled,
    onSuccess,
    retry,
    retryDelay,
    scope,
    throwOnError,
  },
  queryClient,
)

mutate(variables, {
  onError,
  onSettled,
  onSuccess,
})
```

**參數1 (選項)**

- `mutationFn: (variables: TVariables) => Promise<TData>`
  - **必填，但僅在未定義預設 mutation 函式時需要**
  - 執行非同步任務並返回 promise 的函式
  - `variables` 是 `mutate` 將傳遞給 `mutationFn` 的物件
- `gcTime: number | Infinity`
  - 未使用/非活躍的快取資料在記憶體中保留的時間（毫秒）。當 mutation 的快取變為未使用或非活躍時，該快取資料將在此時間後被垃圾回收。若指定不同的快取時間，將使用最長的那個
  - 設為 `Infinity` 時會停用垃圾回收
  - 注意：最大允許時間約為 24 天。詳見[更多資訊](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value)
- `mutationKey: unknown[]`
  - 選填
  - 可設定 mutation key 來繼承透過 `queryClient.setMutationDefaults` 設定的預設值
- `networkMode: 'online' | 'always' | 'offlineFirst'`
  - 選填
  - 預設為 `'online'`
  - 詳見[網路模式](../guides/network-mode.md)
- `onMutate: (variables: TVariables) => Promise<TContext | void> | TContext | void`
  - 選填
  - 此函式會在 mutation 函式執行前觸發，並接收與 mutation 函式相同的變數
  - 適用於對資源執行樂觀更新 (optimistic update)，期望 mutation 成功
  - 當 mutation 失敗時，此函式返回的值將傳遞給 `onError` 和 `onSettled` 函式，可用於回滾樂觀更新
- `onSuccess: (data: TData, variables: TVariables, context: TContext) => Promise<unknown> | unknown`
  - 選填
  - 當 mutation 成功時觸發此函式，並傳遞 mutation 的結果
  - 若返回 promise，將等待其解析後再繼續
- `onError: (err: TError, variables: TVariables, context?: TContext) => Promise<unknown> | unknown`
  - 選填
  - 當 mutation 發生錯誤時觸發此函式，並傳遞錯誤資訊
  - 若返回 promise，將等待其解析後再繼續
- `onSettled: (data: TData, error: TError, variables: TVariables, context?: TContext) => Promise<unknown> | unknown`
  - 選填
  - 當 mutation 成功完成或發生錯誤時觸發此函式，並傳遞資料或錯誤資訊
  - 若返回 promise，將等待其解析後再繼續
- `retry: boolean | number | (failureCount: number, error: TError) => boolean`
  - 預設為 `0`
  - 若為 `false`，失敗的 mutation 不會重試
  - 若為 `true`，失敗的 mutation 會無限重試
  - 若設為數字（如 `3`），失敗的 mutation 會重試直到達到該次數
- `retryDelay: number | (retryAttempt: number, error: TError) => number`
  - 此函式接收 `retryAttempt` 整數和實際錯誤，返回下次嘗試前的延遲時間（毫秒）
  - 如 `attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)` 這樣的函式會套用指數退避 (exponential backoff)
  - 如 `attempt => attempt * 1000` 這樣的函式會套用線性退避 (linear backoff)
- `scope: { id: string }`
  - 選填
  - 預設為唯一 id（使所有 mutation 並行執行）
  - 具有相同 scope id 的 mutation 會序列化執行
- `throwOnError: undefined | boolean | (error: TError) => boolean`
  - 設為 `true` 時，mutation 錯誤會在渲染階段拋出並傳播到最近的錯誤邊界 (error boundary)
  - 設為 `false` 時會停用將錯誤拋給錯誤邊界的行為
  - 若設為函式，會接收錯誤並返回布林值，指示是否在錯誤邊界顯示錯誤 (`true`) 或將錯誤作為狀態返回 (`false`)
- `meta: Record<string, unknown>`
  - 選填
  - 若設定，會在 mutation 快取條目中儲存額外資訊供需要時使用。該資訊可在 `mutation` 可用的任何地方存取（例如 `MutationCache` 的 `onError`、`onSuccess` 函式）

**參數2 (QueryClient)**

- `queryClient?: QueryClient`
  - 用於使用自訂的 QueryClient。若未提供，則會使用最近上下文中的 QueryClient

**返回值**

- `mutate: (variables: TVariables, { onSuccess, onSettled, onError }) => void`
  - 可呼叫的 mutation 函式，傳入變數來觸發 mutation，並可選掛鉤額外的回調選項
  - `variables: TVariables`
    - 選填
    - 傳遞給 `mutationFn` 的變數物件
  - `onSuccess: (data: TData, variables: TVariables, context: TContext) => void`
    - 選填
    - 當 mutation 成功時觸發此函式，並傳遞 mutation 的結果
    - 無返回值函式，回傳值會被忽略
  - `onError: (err: TError, variables: TVariables, context: TContext | undefined) => void`
    - 選填
    - 當 mutation 發生錯誤時觸發此函式，並傳遞錯誤資訊
    - 無返回值函式，回傳值會被忽略
  - `onSettled: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext | undefined) => void`
    - 選填
    - 當 mutation 成功完成或發生錯誤時觸發此函式，並傳遞資料或錯誤資訊
    - 無返回值函式，回傳值會被忽略
  - 若發送多個請求，`onSuccess` 只會在你發送的最新請求完成後觸發
- `mutateAsync: (variables: TVariables, { onSuccess, onSettled, onError }) => Promise<TData>`
  - 與 `mutate` 類似，但返回可被 await 的 promise
- `status: string`
  - 可能值：
    - `idle` mutation 函式執行前的初始狀態
    - `pending` mutation 正在執行中
    - `error` 上次 mutation 嘗試導致錯誤
    - `success` 上次 mutation 嘗試成功
- `isIdle`, `isPending`, `isSuccess`, `isError`: 從 `status` 衍生的布林變數
- `isPaused: boolean`
  - 若 mutation 被 `暫停 (paused)` 則為 `true`
  - 詳見[網路模式](../guides/network-mode.md)
- `data: undefined | unknown`
  - 預設為 `undefined`
  - mutation 最後成功解析的資料
- `error: null | TError`
  - 查詢的錯誤物件（若發生錯誤）
- `reset: () => void`
  - 清理 mutation 內部狀態的函式（即將 mutation 重置為初始狀態）
- `failureCount: number`
  - mutation 的失敗次數
  - 每次 mutation 失敗時遞增
  - mutation 成功時重置為 `0`
- `failureReason: null | TError`
  - mutation 重試的失敗原因
  - mutation 成功時重置為 `null`
- `submittedAt: number`
  - mutation 被提交的時間戳
  - 預設為 `0`
- `variables: undefined | TVariables`
  - 傳遞給 `mutationFn` 的 `variables` 物件
  - 預設為 `undefined`
