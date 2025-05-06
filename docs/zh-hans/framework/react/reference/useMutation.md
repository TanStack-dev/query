---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:38:43.637Z'
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

**参数1 (选项)**

- `mutationFn: (variables: TVariables) => Promise<TData>`
  - **必填（仅在未定义默认 mutation 函数时）**
  - 执行异步任务并返回 Promise 的函数
  - `variables` 是 `mutate` 将传递给 `mutationFn` 的对象
- `gcTime: number | Infinity`
  - 未使用/非活跃的缓存数据在内存中保留的时间（毫秒）。当 mutation 的缓存变为未使用或非活跃状态时，该缓存数据将在此时长后被垃圾回收。若指定了不同的缓存时间，将使用最长的时间。
  - 设置为 `Infinity` 将禁用垃圾回收
  - 注意：最大允许时间约为 24 天。详见[更多](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value)。
- `mutationKey: unknown[]`
  - 可选
  - 可设置 mutation key 以继承通过 `queryClient.setMutationDefaults` 设置的默认值
- `networkMode: 'online' | 'always' | 'offlineFirst'`
  - 可选
  - 默认为 `'online'`
  - 详见[网络模式](../guides/network-mode.md)
- `onMutate: (variables: TVariables) => Promise<TContext | void> | TContext | void`
  - 可选
  - 该函数会在 mutation 函数触发前执行，并接收与 mutation 函数相同的变量
  - 适用于对资源执行乐观更新，期望 mutation 成功
  - 该函数返回的值将在 mutation 失败时传递给 `onError` 和 `onSettled` 函数，可用于回滚乐观更新
- `onSuccess: (data: TData, variables: TVariables, context: TContext) => Promise<unknown> | unknown`
  - 可选
  - 该函数会在 mutation 成功时触发，并接收 mutation 的结果
  - 若返回 Promise，将在继续前等待其解析
- `onError: (err: TError, variables: TVariables, context?: TContext) => Promise<unknown> | unknown`
  - 可选
  - 该函数会在 mutation 遇到错误时触发，并接收错误信息
  - 若返回 Promise，将在继续前等待其解析
- `onSettled: (data: TData, error: TError, variables: TVariables, context?: TContext) => Promise<unknown> | unknown`
  - 可选
  - 该函数会在 mutation 成功获取或遇到错误时触发，并接收数据或错误信息
  - 若返回 Promise，将在继续前等待其解析
- `retry: boolean | number | (failureCount: number, error: TError) => boolean`
  - 默认为 `0`
  - 若为 `false`，失败的 mutation 不会重试
  - 若为 `true`，失败的 mutation 会无限重试
  - 若设为数字（如 `3`），失败的 mutation 会重试直到失败次数达到该数字
- `retryDelay: number | (retryAttempt: number, error: TError) => number`
  - 该函数接收 `retryAttempt` 整数和实际错误，返回下一次尝试前的延迟时间（毫秒）
  - 如 `attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)` 这样的函数会应用指数退避
  - 如 `attempt => attempt * 1000` 这样的函数会应用线性退避
- `scope: { id: string }`
  - 可选
  - 默认为唯一 ID（因此所有 mutation 并行运行）
  - 具有相同 scope ID 的 mutation 会串行执行
- `throwOnError: undefined | boolean | (error: TError) => boolean`
  - 设为 `true` 时，mutation 错误会在渲染阶段抛出并传播到最近的错误边界
  - 设为 `false` 时，禁用向错误边界抛出错误的行为
  - 若设为函数，将接收错误并返回布尔值，指示是否在错误边界显示错误（`true`）或将其作为状态返回（`false`）
- `meta: Record<string, unknown>`
  - 可选
  - 若设置，会在 mutation 缓存条目上存储额外信息，可在需要时使用。该信息在 `mutation` 可用的任何地方都可访问（如 `MutationCache` 的 `onError`、`onSuccess` 函数）

**参数2 (QueryClient)**

- `queryClient?: QueryClient`
  - 用于指定自定义的 QueryClient。若未提供，则使用最近上下文中的 QueryClient

**返回值**

- `mutate: (variables: TVariables, { onSuccess, onSettled, onError }) => void`
  - 可调用的 mutation 函数，传入变量以触发 mutation，并可选择性地挂钩到额外的回调选项
  - `variables: TVariables`
    - 可选
    - 传递给 `mutationFn` 的变量对象
  - `onSuccess: (data: TData, variables: TVariables, context: TContext) => void`
    - 可选
    - 该函数会在 mutation 成功时触发，并接收 mutation 的结果
    - 无返回值，返回的值将被忽略
  - `onError: (err: TError, variables: TVariables, context: TContext | undefined) => void`
    - 可选
    - 该函数会在 mutation 遇到错误时触发，并接收错误信息
    - 无返回值，返回的值将被忽略
  - `onSettled: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext | undefined) => void`
    - 可选
    - 该函数会在 mutation 成功获取或遇到错误时触发，并接收数据或错误信息
    - 无返回值，返回的值将被忽略
  - 若发起多次请求，`onSuccess` 只会在最后一次调用后触发
- `mutateAsync: (variables: TVariables, { onSuccess, onSettled, onError }) => Promise<TData>`
  - 类似于 `mutate`，但返回可被 await 的 Promise
- `status: string`
  - 可能的值：
    - `idle`：mutation 函数执行前的初始状态
    - `pending`：mutation 正在执行
    - `error`：最后一次 mutation 尝试导致错误
    - `success`：最后一次 mutation 尝试成功
- `isIdle`、`isPending`、`isSuccess`、`isError`：从 `status` 派生的布尔变量
- `isPaused: boolean`
  - 若 mutation 被 `paused`，则为 `true`
  - 详见[网络模式](../guides/network-mode.md)
- `data: undefined | unknown`
  - 默认为 `undefined`
  - mutation 最后一次成功解析的数据
- `error: null | TError`
  - 查询的错误对象（若遇到错误）
- `reset: () => void`
  - 清理 mutation 内部状态的函数（即将其重置为初始状态）
- `failureCount: number`
  - mutation 的失败计数
  - 每次 mutation 失败时递增
  - mutation 成功时重置为 `0`
- `failureReason: null | TError`
  - mutation 重试的失败原因
  - mutation 成功时重置为 `null`
- `submittedAt: number`
  - mutation 提交时的时间戳
  - 默认为 `0`
- `variables: undefined | TVariables`
  - 传递给 `mutationFn` 的 `variables` 对象
  - 默认为 `undefined`
