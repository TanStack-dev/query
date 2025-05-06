---
source-updated-at: '2024-07-27T03:03:44.000Z'
translation-updated-at: '2025-05-06T05:09:34.795Z'
id: injectQuery
title: 函数 / injectQuery
---

# 函数: injectQuery()

注入一个查询：声明式依赖与异步数据源的绑定关系，该数据源与唯一键相关联。

**基础示例**

```ts
class ServiceOrComponent {
  query = injectQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      this.#http.get<Response>('https://api.github.com/repos/tanstack/query'),
  }))
}
```

类似于 Angular 中的 `computed`，传递给 `injectQuery` 的函数将在响应式上下文中运行。
在下面的示例中，当 filter 信号变为真值时，查询会自动启用并执行。当 filter 信号变回假值时，查询将被禁用。

**响应式示例**

```ts
class ServiceOrComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: () => fetchTodos(this.filter()),
    // 信号可以与表达式结合使用
    enabled: !!this.filter(),
  }))
}
```

## 参数

返回查询选项的函数。

## 参数

要使用的 Angular 注入器。

## 参见

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

## injectQuery(optionsFn, injector)

```ts
function injectQuery<TQueryFnData, TError, TData, TQueryKey>(
  optionsFn,
  injector?,
): DefinedCreateQueryResult<TData, TError>
```

注入一个查询：声明式依赖与异步数据源的绑定关系，该数据源与唯一键相关联。

**基础示例**

```ts
class ServiceOrComponent {
  query = injectQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      this.#http.get<Response>('https://api.github.com/repos/tanstack/query'),
  }))
}
```

类似于 Angular 中的 `computed`，传递给 `injectQuery` 的函数将在响应式上下文中运行。
在下面的示例中，当 filter 信号变为真值时，查询会自动启用并执行。当 filter 信号变回假值时，查询将被禁用。

**响应式示例**

```ts
class ServiceOrComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: () => fetchTodos(this.filter()),
    // 信号可以与表达式结合使用
    enabled: !!this.filter(),
  }))
}
```

### 类型参数

• **TQueryFnData** = `unknown`

• **TError** = `Error`

• **TData** = `TQueryFnData`

• **TQueryKey** _继承_ `QueryKey` = `QueryKey`

### 参数

• **optionsFn**

返回查询选项的函数。

• **injector?**: `Injector`

要使用的 Angular 注入器。

### 返回值

[`DefinedCreateQueryResult`](../type-aliases/definedcreatequeryresult.md)\<`TData`, `TError`\>

查询结果。

查询结果。

### 参数

返回查询选项的函数。

### 参数

要使用的 Angular 注入器。

### 参见

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 参见

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 定义于

[inject-query.ts:53](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/angular-query-experimental/src/inject-query.ts#L53)

## injectQuery(optionsFn, injector)

```ts
function injectQuery<TQueryFnData, TError, TData, TQueryKey>(
  optionsFn,
  injector?,
): CreateQueryResult<TData, TError>
```

注入一个查询：声明式依赖与异步数据源的绑定关系，该数据源与唯一键相关联。

**基础示例**

```ts
class ServiceOrComponent {
  query = injectQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      this.#http.get<Response>('https://api.github.com/repos/tanstack/query'),
  }))
}
```

类似于 Angular 中的 `computed`，传递给 `injectQuery` 的函数将在响应式上下文中运行。
在下面的示例中，当 filter 信号变为真值时，查询会自动启用并执行。当 filter 信号变回假值时，查询将被禁用。

**响应式示例**

```ts
class ServiceOrComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: () => fetchTodos(this.filter()),
    // 信号可以与表达式结合使用
    enabled: !!this.filter(),
  }))
}
```

### 类型参数

• **TQueryFnData** = `unknown`

• **TError** = `Error`

• **TData** = `TQueryFnData`

• **TQueryKey** _继承_ `QueryKey` = `QueryKey`

### 参数

• **optionsFn**

返回查询选项的函数。

• **injector?**: `Injector`

要使用的 Angular 注入器。

### 返回值

[`CreateQueryResult`](../type-aliases/createqueryresult.md)\<`TData`, `TError`\>

查询结果。

查询结果。

### 参数

返回查询选项的函数。

### 参数

要使用的 Angular 注入器。

### 参见

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 参见

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 定义于

[inject-query.ts:102](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/angular-query-experimental/src/inject-query.ts#L102)

## injectQuery(optionsFn, injector)

```ts
function injectQuery<TQueryFnData, TError, TData, TQueryKey>(
  optionsFn,
  injector?,
): CreateQueryResult<TData, TError>
```

注入一个查询：声明式依赖与异步数据源的绑定关系，该数据源与唯一键相关联。

**基础示例**

```ts
class ServiceOrComponent {
  query = injectQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      this.#http.get<Response>('https://api.github.com/repos/tanstack/query'),
  }))
}
```

类似于 Angular 中的 `computed`，传递给 `injectQuery` 的函数将在响应式上下文中运行。
在下面的示例中，当 filter 信号变为真值时，查询会自动启用并执行。当 filter 信号变回假值时，查询将被禁用。

**响应式示例**

```ts
class ServiceOrComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: () => fetchTodos(this.filter()),
    // 信号可以与表达式结合使用
    enabled: !!this.filter(),
  }))
}
```

### 类型参数

• **TQueryFnData** = `unknown`

• **TError** = `Error`

• **TData** = `TQueryFnData`

• **TQueryKey** _继承_ `QueryKey` = `QueryKey`

### 参数

• **optionsFn**

返回查询选项的函数。

• **injector?**: `Injector`

要使用的 Angular 注入器。

### 返回值

[`CreateQueryResult`](../type-aliases/createqueryresult.md)\<`TData`, `TError`\>

查询结果。

查询结果。

### 参数

返回查询选项的函数。

### 参数

要使用的 Angular 注入器。

### 参见

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 参见

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 定义于

[inject-query.ts:151](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/angular-query-experimental/src/inject-query.ts#L151)
