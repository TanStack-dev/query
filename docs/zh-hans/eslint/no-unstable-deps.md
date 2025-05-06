---
source-updated-at: '2024-08-20T18:51:35.000Z'
translation-updated-at: '2025-05-06T03:49:37.842Z'
id: no-unstable-deps
title: 禁止不稳定依赖
---

以下查询钩子返回的对象**不具备**引用稳定性：

- `useQuery`
- `useSuspenseQuery`
- `useQueries`
- `useSuspenseQueries`
- `useInfiniteQuery`
- `useSuspenseInfiniteQuery`
- `useMutation`

这些钩子返回的对象**不应**直接放入 React 钩子（如 `useEffect`、`useMemo`、`useCallback`）的依赖数组中。  
正确的做法是：解构查询钩子的返回值，并将解构后的值传入 React 钩子的依赖数组。

## 规则详情

**错误**代码示例：

```tsx
/* eslint "@tanstack/query/no-unstable-deps": "warn" */
import { useCallback } from 'React'
import { useMutation } from '@tanstack/react-query'

function Component() {
  const mutation = useMutation({ mutationFn: (value: string) => value })
  const callback = useCallback(() => {
    mutation.mutate('hello')
  }, [mutation])
  return null
}
```

**正确**代码示例：

```tsx
/* eslint "@tanstack/query/no-unstable-deps": "warn" */
import { useCallback } from 'React'
import { useMutation } from '@tanstack/react-query'

function Component() {
  const { mutate } = useMutation({ mutationFn: (value: string) => value })
  const callback = useCallback(() => {
    mutate('hello')
  }, [mutate])
  return null
}
```

## 特性

- [x] ✅ 推荐规则
- [ ] 🔧 可自动修复
