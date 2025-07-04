# Maylng - TypeScript SDK

[![npm version](https://badge.fury.io/js/maylng.svg)](https://badge.fury.io/js/maylng)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK for agentic email management - create email addresses and send emails programmatically for AI agents.

## Features

- 🚀 **Email Address Management**: Create temporary and persistent email addresses
- 📧 **Email Sending**: Send emails with attachments, scheduling, and threading
- 🤖 **AI Agent Focused**: Built specifically for AI agent email workflows
- 📊 **Analytics**: Track email delivery, opens, and clicks
- 🔒 **Secure**: API key authentication with rate limiting
- 📱 **Full TypeScript**: Complete type safety and IntelliSense support
- ⚡ **Production Ready**: Error handling, retries, and monitoring

## Installation

```bash
npm install maylng
```

## Quick Start

```typescript
import { createMayl } from 'maylng';

// Initialize the SDK
const mayl = createMayl({
  apiKey: 'your-api-key'
});

// Create a temporary email address
const tempEmail = await mayl.emailAddresses.create({
  type: 'temporary',
  expirationMinutes: 30
});

// Send an email
const sentEmail = await mayl.emails.send({
  fromEmailId: tempEmail.id,
  to: [{ email: 'user@example.com', name: 'John Doe' }],
  subject: 'Hello from AI Agent',
  text: 'This email was sent by an AI agent using Maylng!'
});

console.log('Email sent:', sentEmail.id);
```

## Core Concepts

### Email Addresses

- **Temporary**: Short-lived email addresses that expire automatically
- **Persistent**: Long-lived email addresses for ongoing communication

### Email Operations

- **Send**: Send emails immediately or schedule for later
- **Track**: Monitor delivery status, opens, and clicks
- **Thread**: Maintain conversation threads for better organization

## API Reference

### InboxSDK

Main client class for interacting with the API.

#### Constructor

```typescript
const mayl = createMayl(config: MaylConfig)
```

#### Methods

- `healthCheck()`: Verify API connectivity
- `getAccountInfo()`: Get account details and usage statistics
- `updateApiKey(apiKey: string)`: Update the API key
- `updateBaseUrl(baseUrl: string)`: Update the base URL

### Email Address Service

Accessible via `mayl.emailAddresses`

#### Methods_

- `create(options: CreateEmailAddressOptions)`: Create a new email address
- `get(id: string)`: Get email address details
- `list(options?)`: List email addresses with filtering and pagination
- `update(id: string, updates)`: Update email address metadata or status
- `delete(id: string)`: Delete an email address
- `extend(id: string, minutes: number)`: Extend temporary email expiration

### Email Service

Accessible via `mayl.emails`

#### Methods__

- `send(options: SendEmailOptions)`: Send an email
- `get(id: string)`: Get sent email details
- `list(options?)`: List sent emails with filtering and pagination
- `cancel(id: string)`: Cancel a scheduled email
- `resend(id: string)`: Resend a failed email
- `getDeliveryStatus(id: string)`: Get delivery status and analytics

## Configuration

```typescript
interface MaylConfig {
  apiKey: string;           // Required: Your API key
  baseUrl?: string;         // Optional: Custom API base URL
  timeout?: number;         // Optional: Request timeout in ms (default: 30000)
}
```

## Error Handling

The SDK provides specific error types for different scenarios:

```typescript
import { 
  AuthenticationError,
  ValidationError,
  RateLimitError,
  EmailSendError 
} from 'maylng';

try {
  await mayl.emails.send(emailOptions);
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle authentication issues
  } else if (error instanceof RateLimitError) {
    // Handle rate limiting
    console.log('Retry after:', error.retryAfter);
  }
}
```

### Error Types

- `AuthenticationError`: Invalid API key or authentication failure
- `AuthorizationError`: Insufficient permissions
- `ValidationError`: Invalid input parameters
- `RateLimitError`: Rate limit exceeded
- `NetworkError`: Network connectivity issues
- `ServerError`: Server-side errors
- `TimeoutError`: Request timeout
- `EmailAddressError`: Email address operation failures
- `EmailSendError`: Email sending failures

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for comprehensive usage examples including:

- Creating temporary and persistent email addresses
- Sending emails with attachments
- Scheduling emails
- Managing email threads
- Bulk operations
- Error handling patterns

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/KnextKoder/inbox-sdk.git
cd inbox-sdk/ts

# Install dependencies
npm install

# Build the SDK
npm run build

# Run in development mode
npm run dev
```

### Scripts

- `npm run build`: Build the TypeScript code
- `npm run dev`: Build in watch mode
- `npm run clean`: Clean build artifacts

## TypeScript Support

The SDK is built with TypeScript and provides complete type definitions. No additional `@types` packages are needed.

```typescript
// Full IntelliSense support
const email: EmailAddress = await mayl.emailAddresses.create({
  type: 'temporary', // Autocomplete: 'temporary' | 'persistent'
  expirationMinutes: 30
});

// Type-safe error handling
if (error instanceof ValidationError) {
  console.log(error.field); // string | undefined
  console.log(error.code);  // 'VALIDATION_ERROR'
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Email Creation**: 100 requests per minute
- **Email Sending**: 1000 emails per hour
- **API Calls**: 10,000 requests per hour

When rate limited, the SDK will throw a `RateLimitError` with retry information.

## Security

- All API requests use HTTPS encryption
- API keys should be stored securely (environment variables recommended)
- Never expose API keys in client-side code
- Rotate API keys regularly

## Support

- 📖 [Documentation](https://docs.maylng.com)
- 💬 [Discord Community](https://discord.gg/maylng)
- 🐛 [Issue Tracker](https://github.com/KnextKoder/inbox-sdk/issues)
- 📧 [Email Support](mailto:support@maylng.com)

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

---

## Made with ❤️ for AI Agent developers
