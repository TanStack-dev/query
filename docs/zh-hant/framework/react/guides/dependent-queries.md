---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:24:19.824Z'
id: dependent-queries
title: 依賴查詢
---

## useQuery 相依查詢

相依（或稱序列）查詢需等待前一個查詢完成後才能執行。要實現這一點，只需使用 `enabled` 選項來告訴查詢何時準備好執行：

[//]: # '範例'

```tsx
// 取得使用者資料
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
})

const userId = user?.id

// 接著取得使用者的專案資料
const {
  status,
  fetchStatus,
  data: projects,
} = useQuery({
  queryKey: ['projects', userId],
  queryFn: getProjectsByUser,
  // 此查詢會等到 userId 存在後才會執行
  enabled: !!userId,
})
```

[//]: # '範例'

`projects` 查詢會以以下狀態開始：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'idle'
```

當 `user` 資料可用時，`projects` 查詢會被 `enabled` 並轉換為：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'fetching'
```

取得專案資料後，狀態會變為：

```tsx
status: 'success'
isPending: false
fetchStatus: 'idle'
```

## useQueries 相依查詢

動態平行查詢 - `useQueries` 也可以依賴前一個查詢，以下是實現方式：

[//]: # '範例2'

```tsx
// 取得使用者 ID 列表
const { data: userIds } = useQuery({
  queryKey: ['users'],
  queryFn: getUsersData,
  select: (users) => users.map((user) => user.id),
})

// 接著取得各使用者的訊息
const usersMessages = useQueries({
  queries: userIds
    ? userIds.map((id) => {
        return {
          queryKey: ['messages', id],
          queryFn: () => getMessagesByUsers(id),
        }
      })
    : [], // 如果 users 是 undefined，則回傳空陣列
})
```

[//]: # '範例2'

**請注意** `useQueries` 會回傳一個**查詢結果陣列**

## 關於效能的注意事項

相依查詢本質上會形成一種[請求瀑布流 (request waterfall)](./request-waterfalls.md)，這會影響效能。假設兩個查詢花費相同時間，序列執行總會比平行執行多花一倍時間，這在高延遲的客戶端環境中尤其不利。如果可能，最好重構後端 API 讓兩個查詢能平行取得資料，雖然這在實務上不一定可行。

在上面的範例中，與其先取得 `getUserByEmail` 才能執行 `getProjectsByUser`，引入一個新的 `getProjectsByUserEmail` 查詢可以消除瀑布流問題。
