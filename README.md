# favicon-stealer
favicon stealer npm package


# installation
```shell
npm install favicon-stealer
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
| `timeout` | `number` | The timeout in milliseconds for fetching the favicon. Default is 1000 (1 second). |


# license
MIT License

# Changelog
- v1.0.0: Initial release (2025.1.21)
- v1.0.1: Add README.md (2025.1.21)