---
source-updated-at: '2024-07-27T03:03:44.000Z'
translation-updated-at: '2025-05-06T05:09:50.452Z'
id: injectMutation
title: 函数 / injectMutation
---
# 函数: injectMutation()

```ts
function injectMutation<TData, TError, TVariables, TContext>(
  optionsFn,
  injector?,
): CreateMutationResult<TData, TError, TVariables, TContext>
```

注入一个变更操作 (mutation)：这是一个可被调用的命令式函数，通常用于执行服务端副作用。

与查询 (queries) 不同，变更操作不会自动执行。

## 类型参数

• **TData** = `unknown`

• **TError** = `Error`

• **TVariables** = `void`

• **TContext** = `unknown`

## 参数

• **optionsFn**

返回变更操作选项的函数。

• **injector?**: `Injector`

要使用的 Angular 注入器 (injector)。

## 返回值

[`CreateMutationResult`](../type-aliases/createmutationresult.md)\<`TData`, `TError`, `TVariables`, `TContext`\>

变更操作实例。

## 定义位置

[inject-mutation.ts:38](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/angular-query-experimental/src/inject-mutation.ts#L38)
