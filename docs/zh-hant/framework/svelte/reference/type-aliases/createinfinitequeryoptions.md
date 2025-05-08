---
source-updated-at: '2024-07-27T03:03:44.000Z'
translation-updated-at: '2025-05-08T20:25:52.246Z'
id: CreateInfiniteQueryOptions
title: CreateInfiniteQueryOptions
---

# Type Alias: CreateInfiniteQueryOptions\<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam\>

```ts
type CreateInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>: InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>;
```

Options for createInfiniteQuery

## Type Parameters

• **TQueryFnData** = `unknown`

• **TError** = `DefaultError`

• **TData** = `TQueryFnData`

• **TQueryData** = `TQueryFnData`

• **TQueryKey** _extends_ `QueryKey` = `QueryKey`

• **TPageParam** = `unknown`

## Defined in

[packages/svelte-query/src/types.ts:52](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/svelte-query/src/types.ts#L52)
