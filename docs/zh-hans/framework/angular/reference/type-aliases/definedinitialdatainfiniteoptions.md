---
source-updated-at: '2024-07-27T03:03:44.000Z'
translation-updated-at: '2025-05-06T05:03:18.128Z'
id: DefinedInitialDataInfiniteOptions
title: DefinedInitialDataInfiniteOptions
---

# Type Alias: DefinedInitialDataInfiniteOptions\<TQueryFnData, TError, TData, TQueryKey, TPageParam\>

```ts
type DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>: CreateInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey, TPageParam> & object;
```

## Type declaration

### initialData

```ts
initialData: NonUndefinedGuard<InfiniteData<TQueryFnData, TPageParam>> | () => NonUndefinedGuard<InfiniteData<TQueryFnData, TPageParam>>;
```

## Type Parameters

• **TQueryFnData**

• **TError** = `DefaultError`

• **TData** = `InfiniteData`\<`TQueryFnData`\>

• **TQueryKey** _extends_ `QueryKey` = `QueryKey`

• **TPageParam** = `unknown`

## Defined in

[infinite-query-options.ts:32](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/angular-query-experimental/src/infinite-query-options.ts#L32)
