# API

This package contains API utilities for the repository.

## Usage

```typescript
import { createWretchInstance } from '@repo/api';

const wretchInstance = createWretchInstance({
    url: `https://api.example.com`,
    method: 'GET',
    query: {
        key: 'value',
    },
    controller: new AbortController(),
});
```
