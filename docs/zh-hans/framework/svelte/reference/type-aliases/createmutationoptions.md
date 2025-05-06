---
source-updated-at: '2024-07-27T03:03:44.000Z'
translation-updated-at: '2025-05-06T05:20:31.331Z'
id: CreateMutationOptions
title: CreateMutationOptions
---

# Type Alias: CreateMutationOptions\<TData, TError, TVariables, TContext\>

```ts
type CreateMutationOptions<TData, TError, TVariables, TContext>: OmitKeyof<MutationObserverOptions<TData, TError, TVariables, TContext>, "_defaulted">;
```

Options for createMutation

## Type Parameters

• **TData** = `unknown`

• **TError** = `DefaultError`

• **TVariables** = `void`

• **TContext** = `unknown`

## Defined in

[packages/svelte-query/src/types.ts:87](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/svelte-query/src/types.ts#L87)
