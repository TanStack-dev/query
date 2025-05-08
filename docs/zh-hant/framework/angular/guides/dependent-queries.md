---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:25:56.372Z'
id: dependent-queries
title: 依賴查詢
---

## injectQuery 依賴查詢 (Dependent Query)

依賴查詢 (或稱串行查詢) 需要等待前一個查詢完成才能執行。實現方式很簡單，只需使用 `enabled` 選項來告知查詢何時可以執行：

```ts
// 先獲取使用者資料
userQuery = injectQuery(() => ({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
}))

// 然後獲取該使用者的專案資料
projectsQuery = injectQuery(() => ({
  queryKey: ['projects', this.userQuery.data()?.id],
  queryFn: getProjectsByUser,
  // 此查詢會等到使用者 ID 存在後才執行
  enabled: !!this.userQuery.data()?.id,
}))
```

`projects` 查詢會以以下狀態開始：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'idle'
```

當 `user` 資料可用時，`projects` 查詢會被 `enabled` 並轉變為：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'fetching'
```

當專案資料獲取完成後，狀態會變為：

```tsx
status: 'success'
isPending: false
fetchStatus: 'idle'
```

## injectQueries 依賴查詢 (Dependent Query)

動態平行查詢 - `injectQueries` 也可以依賴前一個查詢，實現方式如下：

```ts
// injectQueries 目前在 Angular Query 中處於開發階段
```

**注意** `injectQueries` 會返回一個**查詢結果陣列**

## 關於效能的說明

依賴查詢本質上會形成一種[請求瀑布 (request waterfall)](./request-waterfalls.md)，這會影響效能。假設兩個查詢花費相同時間，串行執行總會比平行執行多花一倍時間，在客戶端高延遲環境下尤其不利。如果可能，最好重構後端 API 讓兩個查詢能平行獲取，雖然這並非總是可行。

在上例中，與其先執行 `getUserByEmail` 才能執行 `getProjectsByUser`，引入新的 `getProjectsByUserEmail` 查詢可以消除請求瀑布。
