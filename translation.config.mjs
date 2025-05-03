export default {
  langs: {
    'zh-Hans': {
      code: 'zh-Hans',
      name: 'Simplified Chinese',
      // 翻译规则和指南
      guide: `
    - For technical terms that should not be fully translated, use the format: "中文翻译 (English term)"
      Example: "服务端渲染 (SSR)" instead of just "SSR" or just "服务端渲染"
    - Add a space between Chinese characters and English words/symbols to improve readability
    - Maintain consistent translations for common terms across the entire document
`,
      // 常见技术术语翻译词典
      // 格式: 'English term': '中文翻译'
      terms: {},
    },
//     'zh-Hant': {
//       code: 'zh-Hant',
//       name: 'Traditional Chinese',
//       // 翻譯規則和指南
//       guide: `
//     - For technical terms that should not be fully translated, use the format: "繁體中文翻譯 (English term)"
//       Example: "伺服器渲染 (SSR)" instead of just "SSR" or just "伺服器渲染"
//     - Add a space between Chinese characters and English words/symbols to improve readability
//     - Maintain consistent translations for common terms across the entire document
// `,
//       // 常見技術術語翻譯詞典
//       // 格式: 'English term': '繁體中文翻譯'
//       terms: {},
//     },
//     ja: {
//       code: 'ja',
//       name: 'Japanese',
//       guide: `
//     - For technical terms that should not be fully translated, use the format: "日本語訳 (English term)"
//       Example: "サーバーサイドレンダリング (SSR)" instead of just "SSR" or just "サーバーサイドレンダリング"
//     - Maintain consistent translations for common terms across the entire document
//     - Use katakana for foreign technical terms where appropriate
// `,
//       terms: {},
//     },
//     es: {
//       code: 'es',
//       name: 'Spanish',
//       guide: `
//     - For technical terms that should not be fully translated, use the format: "Traducción en español (English term)"
//       Example: "Renderizado del lado del servidor (SSR)" instead of just "SSR" or just "Renderizado del lado del servidor"
//     - Maintain consistent translations for common terms across the entire document
//     - Use formal "usted" form instead of informal "tú" for instructions
// `,
//       terms: {},
//     },
//     de: {
//       code: 'de',
//       name: 'German',
//       guide: `
//     - For technical terms that should not be fully translated, use the format: "Deutsche Übersetzung (English term)"
//       Example: "Server-seitiges Rendering (SSR)" instead of just "SSR" or just "Server-seitiges Rendering"
//     - Maintain consistent translations for common terms across the entire document
//     - Follow German capitalization rules for nouns
// `,
//       terms: {},
//     },
//     fr: {
//       code: 'fr',
//       name: 'French',
//       guide: `
//     - For technical terms that should not be fully translated, use the format: "Traduction française (English term)"
//       Example: "Rendu côté serveur (SSR)" instead of just "SSR" or just "Rendu côté serveur"
//     - Maintain consistent translations for common terms across the entire document
//     - Use proper French punctuation with spaces before certain punctuation marks
// `,
//       terms: {},
//     },
//     ru: {
//       code: 'ru',
//       name: 'Russian',
//       guide: `
//     - For technical terms that should not be fully translated, use the format: "Русский перевод (English term)"
//       Example: "Рендеринг на стороне сервера (SSR)" instead of just "SSR" or just "Рендеринг на стороне сервера"
//     - Maintain consistent translations for common terms across the entire document
//     - Use proper Russian cases for technical terms where appropriate
// `,
//       terms: {},
//     },
//     ar: {
//       code: 'ar',
//       name: 'Arabic',
//       guide: `
//     - For technical terms that should not be fully translated, use the format: "الترجمة العربية (English term)"
//       Example: "العرض من جانب الخادم (SSR)" instead of just "SSR" or just "العرض من جانب الخادم"
//     - Maintain consistent translations for common terms across the entire document
//     - Arabic text should flow right-to-left, but keep code examples and technical terms left-to-right
// `,
//       terms: {},
//     },
  },
  docsRoot: 'docs',
  docsContext: `TanStack Query (formerly known as React Query) is often described as the missing data-fetching library for web applications, but in more technical terms, it makes **fetching, caching, synchronizing and updating server state** in your web applications a breeze.

## Motivation

Most core web frameworks **do not** come with an opinionated way of fetching or updating data in a holistic way. Because of this developers end up building either meta-frameworks which encapsulate strict opinions about data-fetching, or they invent their own ways of fetching data. This usually means cobbling together component-based state and side-effects, or using more general purpose state management libraries to store and provide asynchronous data throughout their apps.

While most traditional state management libraries are great for working with client state, they are **not so great at working with async or server state**. This is because **server state is totally different**. For starters, server state:

- Is persisted remotely in a location you may not control or own
- Requires asynchronous APIs for fetching and updating
- Implies shared ownership and can be changed by other people without your knowledge
- Can potentially become "out of date" in your applications if you're not careful

Once you grasp the nature of server state in your application, **even more challenges will arise** as you go, for example:

- Caching... (possibly the hardest thing to do in programming)
- Deduping multiple requests for the same data into a single request
- Updating "out of date" data in the background
- Knowing when data is "out of date"
- Reflecting updates to data as quickly as possible
- Performance optimizations like pagination and lazy loading data
- Managing memory and garbage collection of server state
- Memoizing query results with structural sharing

If you're not overwhelmed by that list, then that must mean that you've probably solved all of your server state problems already and deserve an award. However, if you are like a vast majority of people, you either have yet to tackle all or most of these challenges and we're only scratching the surface!

TanStack Query is hands down one of the _best_ libraries for managing server state. It works amazingly well **out-of-the-box, with zero-config, and can be customized** to your liking as your application grows.

TanStack Query allows you to defeat and overcome the tricky challenges and hurdles of _server state_ and control your app data before it starts to control you.

On a more technical note, TanStack Query will likely:

- Help you remove **many** lines of complicated and misunderstood code from your application and replace with just a handful of lines of TanStack Query logic.
- Make your application more maintainable and easier to build new features without worrying about wiring up new server state data sources
- Have a direct impact on your end-users by making your application feel faster and more responsive than ever before.
- Potentially help you save on bandwidth and increase memory performance`,
  copyPath: [
    // === Angular ===
    // For angular guides
    'framework/angular/guides/does-this-replace-client-state',
    'framework/angular/guides/filters',
    'framework/angular/guides/important-defaults',
    'framework/angular/guides/network-mode',
    'framework/angular/guides/scroll-restoration',
    'framework/angular/guides/window-focus-refetching',
    // For angular reference
    'framework/angular/reference/**',
    '!framework/angular/reference/functions/injectquery',
    '!framework/angular/reference/functions/injectmutation',

    // === Svelte ===
    'framework/svelte/reference/**',

    // === Solid ===
    // For solid community
    'framework/solid/community/**',
    // For solid guides
    'framework/solid/guides/**',
    '!framework/solid/guides/advanced-ssr',
    '!framework/solid/guides/ssr',
    '!framework/solid/guides/suspense',
    // For solid plugins
    'framework/solid/plugins/**',
    // For solid reference, only useQuery needs translated
    'framework/solid/reference/**',
    '!framework/vue/reference/useQuery',
    // === Vue ===
    // For vue community
    'framework/vue/community/tkdodos-blog',
    // guides
    'framework/vue/guides/caching',
    'framework/vue/guides/filters',
    'framework/vue/guides/important-defaults',
    'framework/vue/guides/infinite-queries',
    'framework/vue/guides/initial-query-data',
    'framework/vue/guides/network-mode',
    'framework/vue/guides/optimistic-updates',
    'framework/vue/guides/query-cancellation',
    'framework/vue/guides/query-functions',
    'framework/vue/guides/query-invalidation',
    'framework/vue/guides/query-keys',
    'framework/vue/guides/query-options',
    'framework/vue/guides/scroll-restoration',
    'framework/vue/guides/updates-from-mutation-responses',
    'framework/vue/guides/window-focus-refetching',
    // Plugins
    'framework/vue/plugins/broadcastQueryClient',
    // Reference
    'framework/vue/reference/**',
  ],
}
