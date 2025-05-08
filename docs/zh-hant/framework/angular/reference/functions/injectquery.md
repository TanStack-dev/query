---
source-updated-at: '2024-07-27T03:03:44.000Z'
translation-updated-at: '2025-05-08T20:27:11.129Z'
id: injectQuery
title: 函數 / injectQuery
---

# 函式: injectQuery()

注入一個查詢 (query)：宣告式地依賴於與唯一鍵綁定的非同步資料來源。

**基本範例**

```ts
class ServiceOrComponent {
  query = injectQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      this.#http.get<Response>('https://api.github.com/repos/tanstack/query'),
  }))
}
```

類似 Angular 的 `computed`，傳遞給 `injectQuery` 的函式會在反應式上下文 (reactive context) 中執行。
在以下範例中，當 filter signal 變更為真值 (truthy value) 時，查詢會自動啟用並執行。
當 filter signal 變回假值 (falsy value) 時，查詢會被停用。

**反應式範例**

```ts
class ServiceOrComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: () => fetchTodos(this.filter()),
    // Signal 可以與表達式結合使用
    enabled: !!this.filter(),
  }))
}
```

## 參數

一個回傳查詢選項的函式。

## 參數

要使用的 Angular 注入器 (injector)。

## 參見

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

## injectQuery(optionsFn, injector)

```ts
function injectQuery<TQueryFnData, TError, TData, TQueryKey>(
  optionsFn,
  injector?,
): DefinedCreateQueryResult<TData, TError>
```

注入一個查詢：宣告式地依賴於與唯一鍵綁定的非同步資料來源。

**基本範例**

```ts
class ServiceOrComponent {
  query = injectQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      this.#http.get<Response>('https://api.github.com/repos/tanstack/query'),
  }))
}
```

類似 Angular 的 `computed`，傳遞給 `injectQuery` 的函式會在反應式上下文中執行。
在以下範例中，當 filter signal 變更為真值時，查詢會自動啟用並執行。
當 filter signal 變回假值時，查詢會被停用。

**反應式範例**

```ts
class ServiceOrComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: () => fetchTodos(this.filter()),
    // Signal 可以與表達式結合使用
    enabled: !!this.filter(),
  }))
}
```

### 型別參數

• **TQueryFnData** = `unknown`

• **TError** = `Error`

• **TData** = `TQueryFnData`

• **TQueryKey** _繼承自_ `QueryKey` = `QueryKey`

### 參數

• **optionsFn**

一個回傳查詢選項的函式。

• **injector?**: `Injector`

要使用的 Angular 注入器。

### 回傳值

[`DefinedCreateQueryResult`](../type-aliases/definedcreatequeryresult.md)\<`TData`, `TError`\>

查詢結果。

查詢結果。

### 參數

一個回傳查詢選項的函式。

### 參數

要使用的 Angular 注入器。

### 參見

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 參見

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 定義於

[inject-query.ts:53](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/angular-query-experimental/src/inject-query.ts#L53)

## injectQuery(optionsFn, injector)

```ts
function injectQuery<TQueryFnData, TError, TData, TQueryKey>(
  optionsFn,
  injector?,
): CreateQueryResult<TData, TError>
```

注入一個查詢：宣告式地依賴於與唯一鍵綁定的非同步資料來源。

**基本範例**

```ts
class ServiceOrComponent {
  query = injectQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      this.#http.get<Response>('https://api.github.com/repos/tanstack/query'),
  }))
}
```

類似 Angular 的 `computed`，傳遞給 `injectQuery` 的函式會在反應式上下文中執行。
在以下範例中，當 filter signal 變更為真值時，查詢會自動啟用並執行。
當 filter signal 變回假值時，查詢會被停用。

**反應式範例**

```ts
class ServiceOrComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: () => fetchTodos(this.filter()),
    // Signal 可以與表達式結合使用
    enabled: !!this.filter(),
  }))
}
```

### 型別參數

• **TQueryFnData** = `unknown`

• **TError** = `Error`

• **TData** = `TQueryFnData`

• **TQueryKey** _繼承自_ `QueryKey` = `QueryKey`

### 參數

• **optionsFn**

一個回傳查詢選項的函式。

• **injector?**: `Injector`

要使用的 Angular 注入器。

### 回傳值

[`CreateQueryResult`](../type-aliases/createqueryresult.md)\<`TData`, `TError`\>

查詢結果。

查詢結果。

### 參數

一個回傳查詢選項的函式。

### 參數

要使用的 Angular 注入器。

### 參見

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 參見

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 定義於

[inject-query.ts:102](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/angular-query-experimental/src/inject-query.ts#L102)

## injectQuery(optionsFn, injector)

```ts
function injectQuery<TQueryFnData, TError, TData, TQueryKey>(
  optionsFn,
  injector?,
): CreateQueryResult<TData, TError>
```

注入一個查詢：宣告式地依賴於與唯一鍵綁定的非同步資料來源。

**基本範例**

```ts
class ServiceOrComponent {
  query = injectQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      this.#http.get<Response>('https://api.github.com/repos/tanstack/query'),
  }))
}
```

類似 Angular 的 `computed`，傳遞給 `injectQuery` 的函式會在反應式上下文中執行。
在以下範例中，當 filter signal 變更為真值時，查詢會自動啟用並執行。
當 filter signal 變回假值時，查詢會被停用。

**反應式範例**

```ts
class ServiceOrComponent {
  filter = signal('')

  todosQuery = injectQuery(() => ({
    queryKey: ['todos', this.filter()],
    queryFn: () => fetchTodos(this.filter()),
    // Signal 可以與表達式結合使用
    enabled: !!this.filter(),
  }))
}
```

### 型別參數

• **TQueryFnData** = `unknown`

• **TError** = `Error`

• **TData** = `TQueryFnData`

• **TQueryKey** _繼承自_ `QueryKey` = `QueryKey`

### 參數

• **optionsFn**

一個回傳查詢選項的函式。

• **injector?**: `Injector`

要使用的 Angular 注入器。

### 回傳值

[`CreateQueryResult`](../type-aliases/createqueryresult.md)\<`TData`, `TError`\>

查詢結果。

查詢結果。

### 參數

一個回傳查詢選項的函式。

### 參數

要使用的 Angular 注入器。

### 參見

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 參見

https://tanstack.com/query/latest/docs/framework/angular/guides/queries

### 定義於

[inject-query.ts:151](https://github.com/TanStack/query/blob/dac5da5416b82b0be38a8fb34dde1fc6670f0a59/packages/angular-query-experimental/src/inject-query.ts#L151)
