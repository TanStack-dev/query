---
source-updated-at: '2024-11-07T15:18:52.000Z'
translation-updated-at: '2025-05-06T04:52:21.298Z'
id: devtools
title: 开发者工具
---

## 启用开发者工具 (devtools)

开发者工具 (devtools) 可帮助您调试和检查查询 (queries) 与变更 (mutations)。您可以通过在 `provideTanStackQuery` 中添加 `withDevtools` 来启用开发者工具。

默认情况下，当 Angular 的 [`isDevMode`](https://angular.dev/api/core/isDevMode) 返回 true 时，开发者工具会自动启用。因此您无需担心在生产构建中排除它们。核心工具会按需懒加载，并且不会包含在打包代码中。大多数情况下，您只需在 `provideTanStackQuery` 中添加 `withDevtools()` 即可，无需额外配置。

```ts
import {
  QueryClient,
  provideTanStackQuery,
  withDevtools,
} from '@tanstack/angular-query-experimental'

export const appConfig: ApplicationConfig = {
  providers: [provideTanStackQuery(new QueryClient(), withDevtools())],
}
```

## 配置开发者工具加载条件

如果需要更精细地控制开发者工具的加载时机，可以使用 `loadDevtools` 选项。这在基于环境配置加载开发者工具时特别有用。例如，您的测试环境可能运行在生产模式下，但仍需要开发者工具可用。

当不设置该选项或设置为 'auto' 时，开发者工具会在 Angular 处于开发模式时加载。

```ts
provideTanStackQuery(new QueryClient(), withDevtools())

// 等价于
provideTanStackQuery(
  new QueryClient(),
  withDevtools(() => ({ loadDevtools: 'auto' })),
)
```

当设置为 true 时，开发者工具会在开发和生产模式下都加载。

```ts
provideTanStackQuery(
  new QueryClient(),
  withDevtools(() => ({ loadDevtools: true })),
)
```

当设置为 false 时，开发者工具将不会加载。

```ts
provideTanStackQuery(
  new QueryClient(),
  withDevtools(() => ({ loadDevtools: false })),
)
```

`withDevtools` 的选项通过回调函数返回，以支持通过信号 (signals) 实现响应式。以下示例中，我们通过监听键盘快捷键的 RxJS 可观察对象创建信号。当事件触发时，开发者工具会按需加载。这种技术允许您支持在生产模式下按需加载开发者工具，而无需将完整工具包含在打包代码中。

```ts
@Injectable({ providedIn: 'root' })
class DevtoolsOptionsManager {
  loadDevtools = toSignal(
    fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      map(
        (event): boolean =>
          event.metaKey && event.ctrlKey && event.shiftKey && event.key === 'D',
      ),
      scan((acc, curr) => acc || curr, false),
    ),
    {
      initialValue: false,
    },
  )
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTanStackQuery(
      new QueryClient(),
      withDevtools(() => ({
        initialIsOpen: true,
        loadDevtools: inject(DevtoolsOptionsManager).loadDevtools(),
      })),
    ),
  ],
}
```

### 配置选项

以下选项 `client`、`position`、`errorTypes`、`buttonPosition` 和 `initialIsOpen` 支持通过信号实现响应式。

- `loadDevtools?: 'auto' | boolean`
  - 默认为 `auto`：在开发模式下按需加载开发者工具，生产模式下跳过加载。
  - 用于控制是否加载开发者工具。
- `initialIsOpen?: Boolean`
  - 设置为 `true` 可使工具面板默认展开
- `buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "relative"`
  - 默认为 `bottom-right`
  - TanStack 徽标按钮的位置，用于展开/关闭开发者工具面板
  - 设为 `relative` 时，按钮将呈现在您渲染开发者工具的位置。
- `position?: "top" | "bottom" | "left" | "right"`
  - 默认为 `bottom`
  - Angular Query 开发者工具面板的位置
- `client?: QueryClient`,
  - 用于指定自定义 QueryClient。未设置时，将注入通过 `provideTanStackQuery` 提供的 QueryClient。
- `errorTypes?: { name: string; initializer: (query: Query) => TError}[]`
  - 用于预定义可在查询中触发的错误类型。当从 UI 切换该错误时，初始化器 (initializer) 会以特定查询为参数被调用，必须返回一个 Error 对象。
- `styleNonce?: string`
  - 用于向添加到文档头部的 style 标签传递 nonce 值。这在您使用内容安全策略 (CSP) nonce 允许内联样式时非常有用。
- `shadowDOMTarget?: ShadowRoot`
  - 默认行为会将开发者工具的样式应用到 DOM 的 head 标签中。
  - 用于指定 shadow DOM 目标，使样式应用到 shadow DOM 内部而非 light DOM 的 head 标签中。
