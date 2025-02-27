# favicon-stealer
A react component to get clear and consistent favicon of a website easily.


# installation
## npm
```shell
npm install favicon-stealer
```
## pnpm
```shell
pnpm add favicon-stealer
```

# usage
```typescript
import { Favicon } from 'favicon-stealer';

<Favicon url="https://example.com" />
```

## props
| Name | Type | Description |
| ---- | ---- | ----------- |
| `url` | `string` | The URL of the website to fetch the favicon for. |
| `size` | `number` | The size of the favicon in pixels. Default is 32. |
| `className` | `string` | A class name to apply to the element. |
| `timeout` | `number` | The timeout in milliseconds for fetching the favicon. Default is 3000 (3 seconds). |
| `lazy` | `boolean` | Whether to load the favicon lazily. Default is false. |
| `border` | `boolean` | Whether to show a border around the favicon. Default is false. |
| `padding` | `number` | The padding in pixels.(px) Default is 0. |
| `background` | `string` | The background color of the favicon. Default is transparent.(in hex) |
| `borderRadius` | `number` | The border radius in pixels.(px) Default is 0. |
| `preferGoogle` | `boolean` | Whether to prefer Google's favicon service over the website's own favicon. Default is false. |


# npm package
https://www.npmjs.com/package/favicon-stealer


# license
MIT License


# Changelog
- v1.0.0: Initial release (2025.1.21)
- v1.0.1: Add README.md (2025.1.21)
- v1.0.2: Update license to MIT (2025.1.21)
- v1.1.0: Fix show bug(2025.2.1)
- v1.2.0: Add props(lazy, border, padding, background, borderRadius)(2025.2.1)
- v1.3.0: Improved favicon detection and optimized package size; Added preferGoogle option and improved favicon loading reliability (2025.2.27)