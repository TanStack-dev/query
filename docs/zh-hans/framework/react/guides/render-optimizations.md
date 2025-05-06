---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:04:41.928Z'
id: render-optimizations
title: 渲染优化
---
React Query 自动应用多项优化策略，确保组件仅在真正需要时重新渲染。这主要通过以下方式实现：

## 结构共享 (structural sharing)

React Query 采用称为"结构共享"的技术，尽可能在重新渲染间保持引用不变。当通过网络获取数据时，通常通过 JSON 解析响应会得到全新引用。但若数据内容未变化，React Query 会保留原始引用；若仅部分数据变更，则保留未变更部分，仅替换变更部分。

> 注意：此优化仅在 `queryFn` 返回 JSON 兼容数据时生效。可通过全局或单查询设置 `structuralSharing: false` 关闭该功能，也可通过传入自定义函数实现个性化结构共享。

### 引用一致性 (referential identity)

从 `useQuery`、`useInfiniteQuery`、`useMutation` 返回的顶层对象及 `useQueries` 返回的数组**不具备引用稳定性**——每次渲染都会生成新引用。但这些钩子返回的 `data` 属性会尽可能保持稳定。

## 属性追踪 (tracked properties)

React Query 仅当组件实际"使用"了 `useQuery` 返回的某个属性时才会触发重新渲染，这是通过[自定义 getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#custom_setters_and_getters)实现的。该机制避免了许多不必要的重渲染（例如 `isFetching` 或 `isStale` 等频繁变更但未被使用的属性）。

可通过全局或单查询设置 `notifyOnChangeProps` 自定义此功能。若要完全关闭，可设为 `notifyOnChangeProps: 'all'`。

> 注意：自定义 getter 需通过解构或直接访问属性触发。若使用对象剩余解构会禁用此优化，我们提供了 [lint 规则](../../../eslint/no-rest-destructuring.md)防止此问题。

## 选择器 (select)

通过 `select` 选项可指定组件应订阅的数据子集，适用于高度优化的数据转换或避免不必要重渲染场景：

```js
export const useTodos = (select) => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    select,
  })
}

export const useTodoCount = () => {
  return useTodos((data) => data.length)
}
```

使用 `useTodoCount` 自定义钩子的组件仅当待办事项数量变化时重渲染，而单个待办事项名称变更等操作不会触发重渲染。

> 注意：`select` 操作基于成功缓存的数据，不适合用于抛出错误。错误应源自 `queryFn`，若 `select` 函数返回错误会导致 `data` 为 `undefined` 而 `isSuccess` 为 `true`。建议在 `queryFn` 中处理数据错误，或在查询钩子外部处理与缓存无关的异常情况。

### 记忆化 (memoization)

`select` 函数仅在以下情况重新执行：
- 函数引用发生变化
- `data` 发生变化

因此如上例所示的行内 `select` 函数会在每次渲染时执行。为避免这种情况，可用 `useCallback` 包裹，或在无依赖时提取为稳定函数引用：

```js
// 使用 useCallback 包裹
export const useTodoCount = () => {
  return useTodos(useCallback((data) => data.length, []))
}
```

```js
// 提取为稳定函数引用
const selectTodoCount = (data) => data.length

export const useTodoCount = () => {
  return useTodos(selectTodoCount)
}
```

## 延伸阅读

关于这些主题的深度指南，请参阅社区资源中的 [React Query 渲染优化](../community/tkdodos-blog.md#3-react-query-render-optimizations)。
