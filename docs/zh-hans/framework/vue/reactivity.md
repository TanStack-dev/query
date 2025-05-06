---
source-updated-at: '2025-02-23T08:40:17.000Z'
translation-updated-at: '2025-05-06T16:03:25.519Z'
id: reactivity
title: 响应式
---

Vue 采用 [信号范式 (the signals paradigm)](https://vuejs.org/guide/extras/reactivity-in-depth.html#connection-to-signals) 来处理和追踪响应式数据。该系统的核心特性是响应式系统仅会在特定监听的响应式属性上触发更新。因此需要确保当查询所依赖的值更新时，查询也能同步更新。

# 保持查询的响应性

当为查询创建组合式函数时，最初可能会这样编写：

```ts
export function useUserProjects(userId: string) {
  return useQuery(
    queryKey: ['userProjects', userId],
    queryFn: () => api.fetchUserProjects(userId),
  );
}
```

使用时可能如下：

```ts
// 响应式的用户 ID ref
const userId = ref('1')
// 获取用户 1 的项目数据
const { data: projects } = useUserProjects(userId.value)

const onChangeUser = (newUserId: string) => {
  // 修改 userId 但查询不会重新触发
  userId.value = newUserId
}
```

这段代码无法按预期工作，因为直接从 `userId` ref 中提取了值。Vue-query 并未追踪 `userId` `ref`，因此无法感知值的变化。

解决方法很简单：必须在查询键 (query key) 中使值可追踪。直接在组合式函数中接收 `ref` 并将其放入查询键即可：

```ts
export function useUserProjects(userId: Ref<string>) {
  return useQuery(
    queryKey: ['userProjects', userId],
    queryFn: () => api.fetchUserProjects(userId.value),
  );
}
```

现在当 `userId` 变化时查询会自动重新获取数据：

```ts
const onChangeUser = (newUserId: string) => {
  // 查询会使用新用户 ID 重新获取数据！
  userId.value = newUserId
}
```

在 Vue Query 中，查询键内的任何响应式属性都会被自动追踪变化。这使得当请求参数变化时，Vue-Query 能自动重新获取数据。

## 处理非响应式查询

虽然较为少见，但有时故意传递非响应式变量是合理的。例如某些实体只需获取一次无需追踪，或在变更后手动使查询失效。若使用上述自定义组合式函数，这种场景下的用法会显得不够直观：

```ts
const { data: projects } = useUserProjects(ref('1'))
```

必须创建临时 `ref` 仅为了类型兼容。我们可以优化这一点，让组合式函数同时接受普通值和响应式值：

```ts
export function useUserProjects(userId: MaybeRef<string>) {
  return useQuery(
    queryKey: ['userProjects', userId],
    queryFn: () => api.fetchUserProjects(toValue(userId)),
  );
}
```

现在可以同时使用普通值和 ref：

```ts
// 获取用户 1 的项目数据，userId 预期不会变化
const { data: projects } = useUserProjects('1')

// 获取用户 1 的项目数据，查询会响应 userId 变化
const userId = ref('1')

// 修改 userId...

// 查询会根据 userId 变化重新获取数据
const { data: projects } = useUserProjects(userId)
```

## 在查询中使用派生状态

从其他响应式状态派生新状态是很常见的需求。典型场景是处理组件 props。假设 `userId` 是传递给组件的 prop：

```vue
<script setup lang="ts">
const props = defineProps<{
  userId: string
}>()
</script>
```

可能会直接在查询中使用 prop：

```ts
// 不会响应 props.userId 的变化
const { data: projects } = useUserProjects(props.userId)
```

但和第一个例子类似，这不具备响应性。访问 `reactive` 变量的属性会导致响应性丢失。可以通过 `computed` 使派生状态具备响应性：

```ts
const userId = computed(() => props.userId)

// 能响应 props.userId 的变化
const { data: projects } = useUserProjects(userId)
```

虽然可行，但此方案并非最优解。除了引入中间变量外，还创建了实际不必要的记忆值。对于简单的属性访问场景，`computed` 的优化并无实质收益。更合适的方案是使用 [响应式 getter (reactive getters)](https://blog.vuejs.org/posts/vue-3-3#better-getter-support-with-toref-and-tovalue)。响应式 getter 是返回基于响应式状态值的函数，工作原理类似 `computed` 但不会记忆值，因此非常适合简单属性访问场景。

再次重构组合式函数，使其接受 `ref`、普通值或响应式 getter：

```ts
export function useUserProjects(userId: MaybeRefOrGetter<string>) {
  ...
}
```

现在使用响应式 getter：

```ts
// 响应 props.userId 变化，无需使用 `computed`!
const { data: projects } = useUserProjects(() => props.userId)
```

这种写法简洁且具备响应性，同时避免了不必要的记忆化开销。

## 其他可追踪的查询选项

上文仅涉及了一个追踪响应式依赖的查询选项。实际上除了 `queryKey` 外，`enabled` 也支持响应式值。这在需要基于派生状态控制查询获取时非常有用：

```ts
export function useUserProjects(userId: MaybeRef<string>) {
  return useQuery(
    queryKey: ['userProjects', userId],
    queryFn: () => api.fetchUserProjects(toValue(userId)),
    enabled: () => userId.value === activeUserId.value,
  );
}
```

更多细节请参考 [useQuery 文档](./reference/useQuery.md)。

# 核心要点

- `enabled` 和 `queryKey` 是支持响应式值的两个查询选项
- 传递查询选项时，应支持 Vue 的三种值类型：ref、普通值和响应式 getter
- 若需要查询响应所消费值的变化，确保这些值是响应式的（直接传入 ref 或使用响应式 getter）
- 若不需要查询具备响应性，直接传入普通值
- 对于简单派生状态（如属性访问），考虑用响应式 getter 替代 `computed`
