---
source-updated-at: '2024-07-27T03:03:44.000Z'
translation-updated-at: '2025-05-08T20:26:12.515Z'
id: injectMutation
title: 函數 / injectMutation
---

# 函式: injectMutation()

```ts
function injectMutation<TData, TError, TVariables, TContext>(
  optionsFn,
  injector?,
): CreateMutationResult<TData, TError, TVariables, TContext>
```

注入一個 mutation (變更操作)：這是一個可主動調用的命令式函式，通常用於執行伺服器端的副作用。

與查詢 (queries) 不同，mutation 不會自動執行。

## 型別參數

• **TData** = `unknown`

• **TError** = `Error`

• **TVariables** = `void`

• **TContext** = `unknown`

## 參數

• **optionsFn**

一個回傳 mutation 選項的函式。

• **injector?**: `Injector`

要使用的 Angular 注入器 (injector)。

## 回傳值

[`CreateMutationResult`](../type-aliases/createmutationresult.md)\<`TData`, `TError`, `TVariables`, `TContext`\>

該 mutation 操作。

## 定義於

[inject-mutation.ts:38](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/angular-query-experimental/src/inject-mutation.ts#L38)
