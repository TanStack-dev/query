---
source-updated-at: '2024-05-11T22:31:28.000Z'
translation-updated-at: '2025-05-08T20:16:30.716Z'
id: typescript
title: TypeScript
---

Vue Query 現已採用 **TypeScript** 編寫，確保函式庫與您的專案具備型別安全！

注意事項：

- 目前型別系統需使用 TypeScript **v4.7** 或更高版本
- 此儲存庫中的型別變更視為**非破壞性變更**，通常以 **patch** 版號發布（否則每個型別增強都會變成主版本號！）
- **強烈建議將 vue-query 套件版本鎖定至特定 patch 版本**，並在升級時預期型別可能在任何版本間被修正或升級
- Vue Query 的非型別相關公開 API 仍嚴格遵循語意化版本規範

## 型別推論

Vue Query 的型別通常能流暢推導，因此您無需自行添加型別註解

```tsx
const { data } = useQuery({
  //    ^? const data: Ref<number> | Ref<undefined>
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
})
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPQBuOAtAEcc+KgFgAUBNYRm8JABN6DInAC8KDNlx4AFAglw4nTocMA9APwG4Q7QGl0eAFxwA2lRjoWVALoAaa1t8ADFGFx0ASjUAPjgABXIQYAwAOigvCAAbbnQdAFYIgPFCCKA)

```tsx
const { data } = useQuery({
  //      ^? const data: Ref<string> | Ref<undefined>
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
  select: (data) => data.toString(),
})
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPQBuOAtAEcc+KgFgAUBNYRm8JABN6DInAC8KDNlx4AFAglw4nTodNwAegH4DcIdoDS6PAC44AbSox0LKgF0ANDZ2+ABijK46AJRqAHxwAArkIMAYAHRQ3hAANtzoOgCskYHihhhZ6KwwEYoM0apxNfSpMBAAyjBQwIwA5lHFhJFAA)

當您的 `queryFn` 有明確定義的返回型別時效果最佳。請注意，多數資料獲取函式庫預設返回 `any`，因此請確保將其提取到正確定型的函式：

```tsx
const fetchGroups = (): Promise<Group[]> =>
  axios.get('/groups').then((response) => response.data)

const { data } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const data: Ref<Group[]> | Ref<undefined>
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPQBuOAtAEcc+KgFgAUKEiw49AB7AIqUuUpV5i1GPESYeMOjgBxcsjBwAvIjjAAJgC44jZCABGuIhImsIzeCXQYVgALEwgzZSsACgBKRwAFVWAMAB4wswBtAF0APksciThZBSUAOgBzQKiqTnLTMC0Y0phg9EYoqKh0VEhmdBj8uC6e3wxS23oGGK9xHz9rCYYiSxQMbFw8KKQhDYBpdDxHDKo68IaqLIAaOB38ADFGRwCg0PrlQmnxTk4i37gAPQA-EA)

## 型別縮窄

Vue Query 使用[可區分聯合型別 (discriminated union type)](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions) 作為查詢結果，透過 `status` 欄位與衍生的狀態布林標記進行區分。這讓您可以檢查例如 `success` 狀態來確保 `data` 已定義：

```tsx
const { data, isSuccess } = reactive(
  useQuery({
    queryKey: ['test'],
    queryFn: () => Promise.resolve(5),
  }),
)

if (isSuccess) {
  data
  // ^? const data: number
}
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPQBuOAtAEcc+KgFgAUKEixEcKOnqsYwbuiKlylKr3RUA3BImsIzeEgAm9BgBo4wVAGVkrVulSp1AXjkKlK9AAUaFjCeAEA2lQwbjBUALq2AQCUcJ4AfHAACpr26AB08qgQADaqAQCsSVWGkiRwAfZOLm6oKQgScJ1wlgwSnJydAHoA-BKEEkA)

## 錯誤欄位型別

錯誤型別預設為 `Error`，因這符合大多數使用者的預期。

```tsx
const { error } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
//      ^? const error: Ref<unknown>

if (error.value instanceof Error) {
  error.value
  //     ^? const error: Error
}
```

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAOQACMAhgHaoMDGA1gPRTr2swBaAI458VALAAoUJFhx6AD2ARUpcpSqLlqCZKkw8YdHADi5ZGDgBeRHGAATAFxxGyEACNcRKVNYRm8CToMKwAFmYQFqo2ABQAlM4ACurAGAA8ERYA2gC6AHzWBVoqAHQA5sExVJxl5mA6cSUwoeiMMTyokMzGVgUdXRgl9vQMcT6SfgG2uORQRNYoGNi4eDFIIisA0uh4zllUtZH1VDkANHAb+ABijM5BIeF1qoRjkpyccJ9fAHoA-OPAEhwGLFVAlVIAQSUKgAolBZjEZtA4nFEFJPkioOi4O84H8pIQgA)

若您想拋出自訂錯誤，或非 `Error` 型別的內容，可指定錯誤欄位的型別：

然而這會導致 `useQuery` 其他泛型參數的型別推論失效。通常不建議拋出非 `Error` 型別的內容，若您有像 `AxiosError` 這樣的子類別，可使用**型別縮窄**讓錯誤欄位更明確：

### 註冊全域錯誤型別

TanStack Query v5 允許透過擴充 `Register` 介面來設定全域錯誤型別，無需在呼叫處指定泛型參數。這能確保型別推論仍正常運作，同時錯誤欄位會是指定的型別：

## 查詢與異動鍵的型別定義

### 註冊查詢與異動鍵型別

類似於註冊[全域錯誤型別](#registering-a-global-error)，您也可註冊全域的 `QueryKey` 與 `MutationKey` 型別。這讓您能為鍵值提供更符合應用程式層級的結構化型別，並在函式庫所有介面中保持型別化。請注意註冊的型別必須繼承 `Array` 型別，以確保鍵值維持陣列形式。

```ts
import '@tanstack/vue-query'

type QueryKey = ['dashboard' | 'marketing', ...ReadonlyArray<unknown>]

declare module '@tanstack/vue-query' {
  interface Register {
    queryKey: QueryKey
    mutationKey: QueryKey
  }
}
```

## 使用 `skipToken` 實現型別安全的查詢停用

若使用 TypeScript，可透過 `skipToken` 停用查詢。這在需要根據條件停用查詢，同時保持查詢型別安全時特別有用。詳情請參閱[停用查詢](./guides/disabling-queries.md)指南。
