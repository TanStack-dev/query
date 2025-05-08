---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:18:01.672Z'
id: typescript
title: TypeScript
---

React Query 現已使用 **TypeScript** 撰寫，以確保函式庫與您的專案具備型別安全！

注意事項：

- 目前型別需使用 TypeScript **v4.7** 或更高版本
- 此儲存庫中的型別變更視為**非破壞性**，通常以 **patch** 版號發佈（否則每個型別增強都會成為主要版本！）。
- **強烈建議將 react-query 套件版本鎖定至特定 patch 版本，並在升級時預期型別可能在任一版本間被修正或更新**
- React Query 的非型別相關公開 API 仍嚴格遵循語意化版本控制。

## 型別推論

React Query 中的型別通常能良好流動，因此您無需自行提供型別註解

[//]: # 'TypeInference1'

```tsx
const { data } = useQuery({
  //    ^? const data: number | undefined
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
})
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAORToCGAxjALQCOO+VAsAFC8MQAdqnhIAJnRh0icALwoM2XHgAUAbSqDkIAEa4qAXQA0cFQEo5APjgAFciGAYAdLVQQANgDd0KgKxmzXgB6ILgw8IA9AH5eIA)

[//]: # 'TypeInference1'
[//]: # 'TypeInference2'

```tsx
const { data } = useQuery({
  //      ^? const data: string | undefined
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
  select: (data) => data.toString(),
})
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAORToCGAxjALQCOO+VAsAFC8MQAdqnhIAJnRh0icALwoM2XHgAUAbSox0IqgF0ANHBUBKOQD44ABXIhgGAHS1UEADYA3dCoCsxw0gwu6EwAXHASUuZhknT2MBAAyjBQwIIA5iaExrwA9Nlw+QUAegD8vEA)

[//]: # 'TypeInference2'

當您的 `queryFn` 具有明確定義的回傳型別時，此功能效果最佳。請注意，大多數資料獲取函式庫預設回傳 `any`，因此請確保將其提取為具有適當型別的函式：

[//]: # 'TypeInference3'

```tsx
const fetchGroups = (): Promise<Group[]> =>
  axios.get('/groups').then((response) => response.data)

const { data } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const data: Group[] | undefined
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAORToCGAxjALQCOO+VAsAFCiSw4dAB7AIqUuUpURY1Nx68YeMOjgBxcsjBwAvIjjAAJgC44AO2QgARriK9eDCOdTwS6GAwAWmiNon6ABQAlGYAClLAGAA8vtoA2gC6AHx6qbLiAHQA5h6BVAD02Vpg8sGZMF7o5oG0qJAuarqpdQ0YmUZ0MHTBDjxOLvBInd1EeigY2Lh4gfFUxX6lVIkANKQe3nGlvTwFBXAHhwB6APxwA65wI3RmW0lwAD4o5kboJMDm6Ea8QA)

[//]: # 'TypeInference3'

## 型別縮窄

React Query 使用[判別聯合型別 (discriminated union type)](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions) 作為查詢結果，以 `status` 欄位和衍生的狀態布林標誌進行判別。這讓您可以檢查例如 `success` 狀態來確保 `data` 已定義：

[//]: # 'TypeNarrowing'

```tsx
const { data, isSuccess } = useQuery({
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
})

if (isSuccess) {
  data
  //  ^? const data: number
}
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAORToCGAxjALQCOO+VAsAFC8MQAdqnhIAJnRh0ANHGCoAysgYN0qVETgBeFBmy48ACgDaVGGphUAurMMBKbQD44ABXIh56AHS1UEADYAbuiGAKx2dry8wCRwhvJKKmqoDgi8cBlwElK8APS5GQB6APy8hLxAA)

[//]: # 'TypeNarrowing'

## 錯誤欄位的型別定義

錯誤的型別預設為 `Error`，因為這是大多數使用者所預期的。

[//]: # 'TypingError'

```tsx
const { error } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const error: Error
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPRTr2swBaAI458VALAAoUJFhx6AD2ARUpcpSqLlqCZKkw8YdHADi5ZGDgBeRHGAATAFxxGyEACNcRKVNYRm8CToMKwAFmYQFqo2ABQAlM4ACurAGAA8ERYA2gC6AHzWBVoqAHQA5sExVJxl5mA6cSUwoeiMMTyokMzGVgUdXRgl9vQMcT6SfgG2uORQRNYoGNi4eDFZVLWR9VQ5ADSkwWGZ9WOSnJxwl1cAegD8QA)

[//]: # 'TypingError'

如果您想拋出自訂錯誤，或根本不是 `Error` 的內容，您可以指定錯誤欄位的型別：

[//]: # 'TypingError2'

```tsx
const { error } = useQuery<Group[], string>(['groups'], fetchGroups)
//      ^? const error: string | null
```

[//]: # 'TypingError2'

然而，這會導致 `useQuery` 的其他泛型型別推論失效。通常不建議拋出非 `Error` 的內容，因此如果您有像 `AxiosError` 這樣的子類別，可以使用*型別縮窄*來使錯誤欄位更具體：

[//]: # 'TypingError3'

```tsx
import axios from 'axios'

const { error } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const error: Error | null

if (axios.isAxiosError(error)) {
  error
  // ^? const error: AxiosError
}
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPRTr2swBaAI458VALAAoUJFhx6AD2ARUpcpSqLlqCZKkw8YdHADi5ZGDgBeRHGAATAFxxGyEACNcRKVNYRm8CToMKwAFmYQFqo2ABQAlM4ACurAGAA8ERYA2gC6AHzWBVoqAHQA5sExVJxl5mA6cSUwoeiMMTyokMzGVgUdXRgl9vQMcT6SfgG2uORQRNYoGNi4eDFIIisA0uh4zllUtZH1VDkANHAb+ABijM5BIeF1qoRjkpyccJ9fAHoA-OPAEhwGLFVAlVIAQSUKgAolBZjEZtA4nFEFJPkioOi4O84H8pIQgA)

[//]: # 'TypingError3'

### 註冊全域錯誤型別

TanStack Query v5 允許透過擴充 `Register` 介面來設定全域錯誤型別，而無需在呼叫端指定泛型。這將確保型別推論仍有效，但錯誤欄位將是指定的型別：

[//]: # 'RegisterErrorType'

```tsx
import '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError
  }
}

const { error } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const error: AxiosError | null
```

[//]: # 'RegisterErrorType'
[//]: # 'TypingMeta'

## 型別化 Meta

### 註冊全域 Meta

類似於註冊[全域錯誤型別](#registering-a-global-error)，您也可以註冊全域 `Meta` 型別。這確保了[查詢](./reference/useQuery.md)和[變異](./reference/useMutation.md)上的選用 `meta` 欄位保持一致且具備型別安全。請注意，註冊的型別必須擴展 `Record<string, unknown>`，以確保 `meta` 仍為物件。

```ts
import '@tanstack/react-query'

interface MyMeta extends Record<string, unknown> {
  // 您的 meta 型別定義。
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: MyMeta
    mutationMeta: MyMeta
  }
}
```

[//]: # 'TypingMeta'
[//]: # 'TypingQueryAndMutationKeys'

## 型別化查詢與變異鍵

### 註冊查詢與變異鍵型別

同樣類似於註冊[全域錯誤型別](#registering-a-global-error)，您也可以註冊全域 `QueryKey` 和 `MutationKey` 型別。這讓您可以為鍵提供更多結構，符合您應用程式的層次結構，並讓它們在函式庫的所有介面上保持型別化。請注意，註冊的型別必須擴展 `Array` 型別，以確保您的鍵仍為陣列。

```ts
import '@tanstack/react-query'

type QueryKey = ['dashboard' | 'marketing', ...ReadonlyArray<unknown>]

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: QueryKey
    mutationKey: QueryKey
  }
}
```

[//]: # 'TypingQueryAndMutationKeys'
[//]: # 'TypingQueryOptions'

## 型別化查詢選項

如果您將查詢選項內聯至 `useQuery`，您將獲得自動型別推論。然而，您可能希望將查詢選項提取到單獨的函式中，以便在 `useQuery` 和例如 `prefetchQuery` 之間共享。在這種情況下，您將失去型別推論。要重新獲得它，您可以使用 `queryOptions` 輔助函式：

```ts
import { queryOptions } from '@tanstack/react-query'

function groupOptions() {
  return queryOptions({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    staleTime: 5 * 1000,
  })
}

useQuery(groupOptions())
queryClient.prefetchQuery(groupOptions())
```

此外，`queryOptions` 回傳的 `queryKey` 知道與其關聯的 `queryFn`，我們可以利用該型別資訊來讓像 `queryClient.getQueryData` 這樣的函式也能感知這些型別：

```ts
function groupOptions() {
  return queryOptions({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    staleTime: 5 * 1000,
  })
}

const data = queryClient.getQueryData(groupOptions().queryKey)
//     ^? const data: Group[] | undefined
```

若沒有 `queryOptions`，`data` 的型別將為 `unknown`，除非我們傳遞泛型給它：

```ts
const data = queryClient.getQueryData<Group[]>(['groups'])
```

[//]: # 'TypingQueryOptions'
[//]: # 'Materials'

## 延伸閱讀

有關型別推論的技巧與訣竅，請參閱社群資源中的 [React Query 與 TypeScript](./community/tkdodos-blog.md#6-react-query-and-typescript)。要了解如何獲得最佳型別安全性，您可以閱讀 [型別安全的 React Query](./community/tkdodos-blog.md#19-type-safe-react-query)。

[//]: # 'Materials'

## 使用 `skipToken` 安全地停用查詢

如果您使用 TypeScript，可以使用 `skipToken` 來停用查詢。這在您想根據條件停用查詢但仍希望保持查詢型別安全時非常有用。更多資訊請參閱[停用查詢](./guides/disabling-queries.md)指南。
