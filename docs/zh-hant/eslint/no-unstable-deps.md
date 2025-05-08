---
source-updated-at: '2024-08-20T18:51:35.000Z'
translation-updated-at: '2025-05-08T20:15:00.234Z'
id: no-unstable-deps
title: 無不穩定依賴
---

以下查詢鉤子 (query hooks) 回傳的物件**不具**參考穩定性 (referentially stable)：

- `useQuery`
- `useSuspenseQuery`
- `useQueries`
- `useSuspenseQueries`
- `useInfiniteQuery`
- `useSuspenseInfiniteQuery`
- `useMutation`

這些鉤子回傳的物件**不應**直接被放入 React 鉤子 (如 `useEffect`、`useMemo`、`useCallback`) 的依賴陣列 (dependency array) 中。  
正確做法是解構 (destructure) 查詢鉤子的回傳值，並將解構後的值傳入 React 鉤子的依賴陣列。

## 規則細節

**錯誤**範例程式碼：

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

**正確**範例程式碼：

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

## 屬性

- [x] ✅ 推薦
- [ ] 🔧 可自動修復
