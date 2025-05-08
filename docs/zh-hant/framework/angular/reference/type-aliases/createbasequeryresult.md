---
source-updated-at: '2024-07-27T03:03:44.000Z'
translation-updated-at: '2025-05-08T20:25:52.682Z'
id: CreateBaseQueryResult
title: CreateBaseQueryResult
---

# Type Alias: CreateBaseQueryResult\<TData, TError, TState\>

```ts
type CreateBaseQueryResult<TData, TError, TState>: BaseQueryNarrowing<TData, TError> & MapToSignals<OmitKeyof<TState, keyof BaseQueryNarrowing, "safely">>;
```

## Type Parameters

• **TData** = `unknown`

• **TError** = `DefaultError`

• **TState** = `QueryObserverResult`\<`TData`, `TError`\>

## Defined in

[types.ts:116](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/angular-query-experimental/src/types.ts#L116)
