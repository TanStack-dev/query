---
source-updated-at: '2025-05-06T07:46:04.000Z'
translation-updated-at: '2025-05-08T20:16:21.619Z'
id: reactivity
title: 響應式
---

Vue 採用 [信號模式 (the signals paradigm)](https://vuejs.org/guide/extras/reactivity-in-depth.html#connection-to-signals) 來處理和追蹤響應性。此系統的一個關鍵特性是，響應系統僅在特定監聽的響應屬性上觸發更新。這導致的一個結果是，您還需要確保當查詢所消耗的值更新時，查詢也會隨之更新。

# 保持查詢的響應性

當為查詢創建一個組合式函數時，您的第一個選擇可能是這樣寫：

```ts
export function useUserProjects(userId: string) {
  return useQuery(
    queryKey: ['userProjects', userId],
    queryFn: () => api.fetchUserProjects(userId),
  );
}
```

我們可能會這樣使用這個組合式函數：

```ts
// 響應式的用戶 ID ref。
const userId = ref('1')
// 獲取用戶 1 的專案。
const { data: projects } = useUserProjects(userId.value)

const onChangeUser = (newUserId: string) => {
  // 修改 userId，但查詢不會重新獲取數據。
  userId.value = newUserId
}
```

這段代碼不會按預期工作。這是因為我們直接從 `userId` ref 中提取了值。Vue-query 沒有追蹤 `userId` `ref`，因此它無法知道值何時發生變化。

幸運的是，修復這個問題非常簡單。必須讓查詢鍵中的值可被追蹤。我們可以直接在組合式函數中接受 `ref` 並將其放入查詢鍵中：

```ts
export function useUserProjects(userId: Ref<string>) {
  return useQuery(
    queryKey: ['userProjects', userId],
    queryFn: () => api.fetchUserProjects(userId.value),
  );
}
```

現在，當 `userId` 變化時，查詢會重新獲取數據。

```ts
const onChangeUser = (newUserId: string) => {
  // 查詢會用新的用戶 ID 重新獲取數據！
  userId.value = newUserId
}
```

在 Vue Query 中，查詢鍵中的任何響應屬性都會自動追蹤變化。這使得 Vue Query 能夠在請求參數變化時重新獲取數據。

## 處理非響應式查詢

雖然可能性較小，但有時故意傳遞非響應式變量是有意為之的。例如，某些實體只需獲取一次，不需要追蹤，或者我們在突變後使查詢選項對象失效。如果我們使用上面定義的自定義組合式函數，這種情況下的使用方式會感覺有些不自然：

```ts
const { data: projects } = useUserProjects(ref('1'))
```

我們必須創建一個中間的 `ref` 以讓參數類型兼容。我們可以做得更好。讓我們更新組合式函數，使其同時接受普通值和響應式值：

```ts
export function useUserProjects(userId: MaybeRef<string>) {
  return useQuery(
    queryKey: ['userProjects', userId],
    queryFn: () => api.fetchUserProjects(toValue(userId)),
  );
}
```

現在我們可以同時用普通值和 ref 來使用組合式函數：

```ts
// 獲取用戶 1 的專案，userId 不預期會變化。
const { data: projects } = useUserProjects('1')

// 獲取用戶 1 的專案，查詢會響應 userId 的變化。
const userId = ref('1')

// 對 userId 做一些修改...

// 查詢會根據 userId 的任何變化重新獲取數據。
const { data: projects } = useUserProjects(userId)
```

## 在查詢中使用派生狀態

從另一個響應式狀態源派生新的響應式狀態是很常見的。通常，這個問題會在處理組件 props 時出現。假設我們的 `userId` 是一個傳遞給組件的 prop：

```vue
<script setup lang="ts">
const props = defineProps<{
  userId: string
}>()
</script>
```

您可能會想在查詢中直接使用 prop：

```ts
// 不會響應 props.userId 的變化。
const { data: projects } = useUserProjects(props.userId)
```

然而，與第一個例子類似，這不是響應式的。對 `reactive` 變量的屬性訪問會導致失去響應性。我們可以通過 `computed` 讓派生狀態變為響應式來解決這個問題：

```ts
const userId = computed(() => props.userId)

// 響應 props.userId 的變化。
const { data: projects } = useUserProjects(userId)
```

這可以按預期工作，但這個解決方案並不總是最優的。除了引入中間變量外，我們還創建了一個某種程度上不必要的記憶值。對於簡單屬性訪問的簡單情況，`computed` 是一個沒有實際收益的優化。在這些情況下，更合適的解決方案是使用 [響應式 getter (reactive getters)](https://blog.vuejs.org/posts/vue-3-3#better-getter-support-with-toref-and-tovalue)。響應式 getter 是簡單的函數，根據某些響應式狀態返回一個值，類似於 `computed` 的工作方式。與 `computed` 不同，響應式 getter 不會記憶其值，因此它是簡單屬性訪問的良好候選方案。

讓我們再次重構我們的組合式函數，但這次我們將讓它接受 `ref`、普通值或響應式 getter：

```ts
export function useUserProjects(userId: MaybeRefOrGetter<string>) {
  ...
}
```

讓我們調整使用方式，現在使用響應式 getter：

```ts
// 響應 props.userId 的變化。不需要 `computed`！
const { data: projects } = useUserProjects(() => props.userId)
```

這為我們提供了一個簡潔的語法和所需的響應性，而沒有任何不必要的記憶開銷。

## 其他可追蹤的查詢選項

上面，我們只提到了一個可以追蹤響應依賴的查詢選項。然而，除了 `queryKey` 之外，`enabled` 也允許使用響應式值。這在您希望基於某些派生狀態控制查詢的獲取時非常有用：

```ts
export function useUserProjects(userId: MaybeRef<string>) {
  return useQuery(
    queryKey: ['userProjects', userId],
    queryFn: () => api.fetchUserProjects(toValue(userId)),
    enabled: () => userId.value === activeUserId.value,
  );
}
```

關於此選項的更多詳細信息可以在 [useQuery 參考](./reference/useQuery.md) 頁面找到。

## 不可變性

`useQuery` 的結果始終是不可變的。這對於性能和緩存目的是必要的。如果您需要突變從 `useQuery` 返回的值，必須創建數據的副本。

這種設計的一個影響是，將 `useQuery` 的值傳遞給雙向綁定（如 `v-model`）將不起作用。您必須在嘗試就地更新之前創建數據的可變副本。

# 關鍵要點

- `enabled` 和 `queryKey` 是兩個可以接受響應式值的查詢選項。
- 傳遞查詢選項時，接受 Vue 中的三種類型的值：refs、普通值和響應式 getter。
- 如果您希望查詢根據其消耗的值變化而響應，請確保這些值是響應式的（例如，直接將 refs 傳遞給查詢，或使用響應式 getter）。
- 如果您不需要查詢是響應式的，請傳遞普通值。
- 對於簡單的派生狀態（如屬性訪問），考慮使用響應式 getter 代替 `computed`。
- `useQuery` 的結果始終是不可變的。
