# Maylng

SDKs for agentic email management - create email addresses and send emails programmatically for AI agents.

## Overview

Maylng provides production-ready SDKs for managing email addresses and sending emails specifically designed for AI agents. Create temporary or persistent email addresses, send emails with attachments, track delivery, and manage conversations programmatically.

## Features

- 🚀 **Email Address Management**: Create temporary and persistent email addresses
- 📧 **Email Sending**: Send emails with attachments, scheduling, and threading  
- 🤖 **AI Agent Focused**: Built specifically for AI agent email workflows
- 📊 **Analytics**: Track email delivery, opens, and clicks
- 🔒 **Secure**: API key authentication with rate limiting
- 🌐 **Multi-Language**: TypeScript and Python SDKs available

## SDKs

### TypeScript SDK

Full-featured TypeScript SDK with complete type safety.

```bash
npm install maylng
```

```typescript
import { createMayl } from 'maylng';

const mayl = createMayl({ apiKey: 'your-api-key' });

// Create a temporary email
const email = await mayl.emailAddresses.create({
  type: 'temporary',
  expirationMinutes: 30
});

// Send an email
await mayl.emails.send({
  fromEmailId: email.id,
  to: [{ email: 'user@example.com' }],
  subject: 'Hello from AI Agent',
  text: 'This email was sent by an AI agent!'
});
```

[📖 TypeScript SDK Documentation](./ts/README.md)

### Python SDK (Coming Soon)

Python SDK for server-side applications and data processing.

```python
from maylng import Mayl

mayl = Mayl(api_key="your-api-key")

# Create email address
email = mayl.email_addresses.create(
    type="temporary",
    expiration_minutes=30
)

# Send email
mayl.emails.send(
    from_email_id=email.id,
    to=[{"email": "user@example.com"}],
    subject="Hello from AI Agent",
    text="This email was sent by an AI agent!"
)
```

[📖 Python SDK Documentation](./python/README.md)

## Quick Start

1. **Get API Key**: Sign up at [maylng.com](https://maylng.com) to get your API key
2. **Install SDK**: Choose your preferred language and install the SDK
3. **Initialize**: Create an SDK instance with your API key
4. **Create Email**: Create a temporary or persistent email address
5. **Send Email**: Send your first email programmatically

## Use Cases

- **AI Customer Support**: Create dedicated email addresses for AI support agents
- **Automated Workflows**: Send notification emails from automated systems
- **Testing**: Create temporary emails for testing email functionality
- **Multi-tenant Applications**: Manage separate email addresses for different users
- **Email Campaigns**: Send personalized emails at scale

## Documentation

- [TypeScript SDK](./ts/README.md) - Complete TypeScript SDK documentation
- [Python SDK](./python/README.md) - Python SDK documentation
- [API Reference-coming soon](https://docs.maylng.com/api) - REST API documentation
- [Examples](./examples/) - Code examples and tutorials

## Support

- 📖 [Documentation-coming soon](https://docs.maylng.com)
- 🐛 [Issue Tracker](https://github.com/maylng/mayl-sdk/issues)
- 📧 [Email Support](mailto:support@maylng.com)

## License

MIT License - see [LICENSE](./LICENSE) for details.
