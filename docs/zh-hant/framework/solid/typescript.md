---
source-updated-at: '2025-04-03T21:54:40.000Z'
translation-updated-at: '2025-05-08T20:17:30.955Z'
id: typescript
title: TypeScript
---

Solid Query 使用 **TypeScript** 撰寫，以確保函式庫與您的專案具備型別安全性！

需注意的事項：

- 目前型別需使用 TypeScript **v4.7** 或更高版本
- 此儲存庫中的型別變更視為**非破壞性變更**，通常以 **patch** 版本號變更發布（否則每個型別增強都會成為主要版本！）。
- **強烈建議將您的 solid-query 套件版本鎖定在特定 patch 版本，並在升級時預期型別可能在任一版本間被修正或升級**
- Solid Query 中與型別無關的公開 API 仍嚴格遵循語意化版本控制。

## 型別推論

Solid Query 中的型別通常能良好流動，因此您無需自行提供型別註解

```tsx
import { useQuery } from '@tanstack/solid-query'

const query = useQuery(() => ({
  queryKey: ['number'],
  queryFn: () => Promise.resolve(5),
}))

query.data
//    ^? (property) data: number | undefined
```

[typescript playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUPOQR28SYRIBeFOiy4pRABQGAlHA0A+OAYTy4duGuIBpNEQBccANp0WeEACNCOgBdABo4W3tHIgAxFg8TM0sABWoQYDY0ADp0fgEANzQDAFZjeVJjMoU5aKzhLAx5Hh57OAA9AH55brkgA)

```tsx
import { useQuery } from '@tanstack/solid-query'

const query = useQuery(() => ({
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
  select: (data) => data.toString(),
}))

query.data
//    ^? (property) data: string | undefined
```

[typescript playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUPOQR28SYRIBeFOiy4pRABQGAlHA0A+OAYTy4duGuIBpNEQBccANp1sHOgF0AGjhbe0ciADEWDxMzSwAFahBgNjQAOnR+AQA3NAMAVmNA0LtUgTRkGBjhLAxTCzga5jSYCABlGChgFgBzE2K5UmNjeXlwtKaMeR4eezgAPQB+UYU5IA)

若您的 `queryFn` 有明確定義的回傳型別，此功能效果最佳。請注意，多數資料獲取函式庫預設回傳 `any`，因此請確保將其提取為具有正確型別的函式：

```tsx
const fetchGroups = (): Promise<Group[]> =>
  axios.get('/groups').then((response) => response.data)

const query = useQuery(() => ({
  queryKey: ['groups'],
  queryFn: fetchGroups,
}))

query.data
//    ^? (property) data: Group[] | undefined
```

[typescript playground](https://www.typescriptlang.org/play/?ssl=11&ssc=4&pln=6&pc=1#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUKEiw4GAB7AIbStVp01GtrLnyYRMGjgBxanjBwAvIjgiAXHBZ4QAI0Jl585Ah2eAo0GGQAC2sIWy1HAAoASjcABR1gNjQAHmjbAG0AXQA+BxL9TQA6AHMw+LoeKpswQ0SKmAi0Fnj0Nkh2C3sSnr7MiuEsDET-OUDguElCEkdUTGx8Rfik0rh4hHk4A-mpIgBpNCI3PLpGmOa6AoAaOH3DheIAMRY3UPCoprYHvJSIkpsY5G8iGMJvIeDxDnAAHoAfmm8iAA)

## 型別縮小 (Type Narrowing)

Solid Query 使用[判別聯合型別 (discriminated union type)](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions) 作為查詢結果，以 `status` 欄位和衍生的狀態布林標誌進行判別。這讓您可以檢查例如 `success` 狀態，以確保 `data` 有定義：

```tsx
const query = useQuery(() => ({
  queryKey: ['number'],
  queryFn: () => Promise.resolve(5),
}))

if (query.isSuccess) {
  const data = query.data
  //     ^? const data: number
}
```

[typescript playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUKEixEKdFjQBRChTTJ45KjXr8hYgFZtZc+cgjt4kwiQC8qzNnxOAFF4CUcZwA+OC8EeTg4R2IAaTQiAC44AG06FjwQACNCOgBdABpwyKkiADEWRL8A4IAFahBgNjQAOnQTADc0LwBWXwK5Ul9feXlgChCooiaGgGU8ZGQ0NjZ-MLkIiNt7OGEsDACipyad5kKInh51iIA9AH55UmHrOSA)

## 為錯誤欄位指定型別

錯誤的型別預設為 `Error`，因為這是多數使用者所預期的。

```tsx
const query = useQuery(() => ({
  queryKey: ['groups'],
  queryFn: fetchGroups,
}))

query.error
//    ^? (property) error: Error | null
```

[typescript playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUKEiw4GAB7AIbStVp01GtrLnyYRMGjgBxanjBwAvIjgiAXHBZ4QAI0Jl585Ah2eAo0GGQAC2sIWy1HAAoASjcABR1gNjQAHmjbAG0AXQA+BxL9TQA6AHMw+LoeKpswQ0SKmAi0Fnj0Nkh2C3sSnr7MiuEsDET-OUDguElCEkdUTGx8Rfik0rh4hHk4A-mpIgBpNCI3PLpGmOa6AoAaOH3DheIAMRY3UPCoprYHvJSIkpsY5G8iBVCNQoPIeDxDnAAHoAfmm8iAA)

若您想拋出自訂錯誤，或根本不是 `Error` 的內容，您可以指定錯誤欄位的型別：

```tsx
const query = useQuery<Group[], string>(() => ({
  queryKey: ['groups'],
  queryFn: fetchGroups,
}))

query.error
//    ^? (property) error: string | null
```

然而，這會導致 `useQuery` 的所有其他泛型型別推論失效。通常不建議拋出非 `Error` 的內容，因此若您有像 `AxiosError` 這樣的子類別，可以使用**型別縮小**使錯誤欄位更具體：

```tsx
import axios from 'axios'

const query = useQuery(() => ({
  queryKey: ['groups'],
  queryFn: fetchGroups,
}))

query.error
//    ^? (property) error: Error | null

if (axios.isAxiosError(query.error)) {
  query.error
  //    ^? (property) error: AxiosError
}
```

[typescript playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgYygUwIYzQRQK5pQCecAvnAGZQQhwDkAAjBgHYDOzyA1gPRsQAbYABMAtAEcCxOgFgAUKEiw4GAB7AIbStVp01GtrLnyYRMGjgBxanjBwAvIjgiAXHBZ4QAI0Jl585Ah2eAo0GGQAC2sIWy1HAAoASjcABR1gNjQAHmjbAG0AXQA+BxL9TQA6AHMw+LoeKpswQ0SKmAi0Fnj0Nkh2C3sSnr7MiuEsDET-OUDguElCEkdUTGx8Rfik0rh4hHk4A-mpIgBpNCI3PLpGmOa6AoAaOH3DheIAMRY3UPCoprYHvJSIkpsY5G8iBVCNQoPIeDxDnAAHoAfmmwAoO3KbAqGQAgupNABRKAw+IQqGk6AgxAvA4U6HQOlweGI1FA+RAA)

## 註冊全域 `Error`

TanStack Query v5 允許透過擴充 `Register` 介面來設定全域錯誤型別，而無需在呼叫端指定泛型。這將確保型別推論仍有效，但錯誤欄位會是指定的型別：

```tsx
import '@tanstack/solid-query'

declare module '@tanstack/solid-query' {
  interface Register {
    defaultError: AxiosError
  }
}

const query = useQuery(() => ({
  queryKey: ['groups'],
  queryFn: fetchGroups,
}))

query.error
//    ^? (property) error: AxiosError | null
```

## 註冊全域 `Meta`

類似於註冊[全域錯誤型別](#registering-a-global-error)，您也可以註冊全域 `Meta` 型別。這確保了[查詢](../useQuery)和[變異](../createMutation)上的選用 `meta` 欄位保持一致且具備型別安全性。請注意，註冊的型別必須擴展 `Record<string, unknown>`，以確保 `meta` 仍為物件。

```ts
import '@tanstack/solid-query'

interface MyMeta extends Record<string, unknown> {
  // 您的 meta 型別定義。
}

declare module '@tanstack/solid-query' {
  interface Register {
    queryMeta: MyMeta
    mutationMeta: MyMeta
  }
}
```

## 為查詢選項指定型別

若您將查詢選項內聯至 `useQuery`，您將獲得自動型別推論。然而，您可能希望將查詢選項提取至獨立的函式，以在 `useQuery` 和例如 `prefetchQuery` 之間共享。此時，您將失去型別推論。要重新獲得它，您可以使用 `queryOptions` 輔助函式：

```ts
import { queryOptions } from '@tanstack/solid-query'

function groupOptions() {
  return queryOptions({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    staleTime: 5 * 1000,
  })
}

useQuery(groupOptions)
queryClient.prefetchQuery(groupOptions())
```

此外，`queryOptions` 回傳的 `queryKey` 知道與其關聯的 `queryFn`，我們可以利用此型別資訊讓例如 `queryClient.getQueryData` 等函式也能感知這些型別：

```ts
function groupOptions() {
  return queryOptions({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    staleTime: 5 * 1000,
  })
}

const data = queryClient.getQueryData(groupOptions().queryKey)
//    ^? const data: Group[] | undefined
```

若沒有 `queryOptions`，`data` 的型別會是 `unknown`，除非我們傳遞泛型給它：

```ts
const data = queryClient.getQueryData<Group[]>(['groups'])
```

## 使用 `skipToken` 進行型別安全的查詢停用

若您使用 TypeScript，可以使用 `skipToken` 停用查詢。這在您想根據條件停用查詢，但仍希望保持查詢的型別安全時非常有用。

更多資訊請參閱[停用查詢](../disabling-queries)指南。
