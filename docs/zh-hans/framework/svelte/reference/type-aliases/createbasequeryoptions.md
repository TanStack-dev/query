---
source-updated-at: '2024-07-27T03:03:44.000Z'
translation-updated-at: '2025-05-06T05:20:31.606Z'
id: CreateBaseQueryOptions
title: CreateBaseQueryOptions
---

# Type Alias: CreateBaseQueryOptions\<TQueryFnData, TError, TData, TQueryData, TQueryKey\>

```ts
type CreateBaseQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>: QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>;
```

Options for createBaseQuery

## Type Parameters

• **TQueryFnData** = `unknown`

• **TError** = `DefaultError`

• **TData** = `TQueryFnData`

• **TQueryData** = `TQueryFnData`

• **TQueryKey** _extends_ `QueryKey` = `QueryKey`

## Defined in

[packages/svelte-query/src/types.ts:23](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/svelte-query/src/types.ts#L23)
