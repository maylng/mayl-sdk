# Maylng TypeScript Examples

## Installation

```bash
npm install maylng
```

## Quick Start

```typescript
import { createMayl } from 'maylng';

// Initialize the SDK
const mayl = createMayl({
  apiKey: 'your-api-key-here',
  // baseUrl: 'https://api.your-domain.com' // Optional, defaults to production
});

// Health check
const health = await mayl.healthCheck();
console.log('API Status:', health.status);
```

## Creating Email Addresses

### Temporary Email Address

```typescript
// Create a temporary email that expires in 30 minutes
const tempEmail = await mayl.emailAddresses.create({
  type: 'temporary',
  expirationMinutes: 30,
  prefix: 'agent-001', // Optional custom prefix
  metadata: {
    purpose: 'user-registration',
    agentId: 'agent-001'
  }
});

console.log('Temporary email:', tempEmail.email);
console.log('Expires at:', tempEmail.expiresAt);
```

### Persistent Email Address

```typescript
// Create a persistent email address
const persistentEmail = await mayl.emailAddresses.create({
  type: 'persistent',
  prefix: 'support',
  domain: 'your-domain.com', // Optional custom domain
  metadata: {
    department: 'customer-support',
    region: 'us-east'
  }
});

console.log('Persistent email:', persistentEmail.email);
```

## Managing Email Addresses

### List Email Addresses

```typescript
// List all email addresses with pagination
const emailList = await mayl.emailAddresses.list({
  type: 'temporary', // Filter by type
  status: 'active',  // Filter by status
  pagination: {
    page: 1,
    limit: 10
  }
});

console.log(`Found ${emailList.total} email addresses`);
emailList.items.forEach(email => {
  console.log(`${email.email} (${email.type}) - ${email.status}`);
});
```

### Get Email Address Details

```typescript
const emailAddress = await mayl.emailAddresses.get('email-address-id');
console.log('Email details:', emailAddress);
```

### Update Email Address

```typescript
// Update metadata or status
const updatedEmail = await mayl.emailAddresses.update('email-address-id', {
  metadata: {
    ...existingMetadata,
    lastUpdated: new Date().toISOString()
  },
  status: 'disabled' // or 'active'
});
```

### Extend Temporary Email

```typescript
// Extend a temporary email by 60 more minutes
const extendedEmail = await mayl.emailAddresses.extend('temp-email-id', 60);
console.log('New expiration:', extendedEmail.expiresAt);
```

## Sending Emails

### Basic Email

```typescript
const sentEmail = await mayl.emails.send({
  fromEmailId: 'your-email-address-id',
  to: [
    { email: 'user@example.com', name: 'John Doe' }
  ],
  subject: 'Welcome to our service!',
  text: 'Thank you for signing up.',
  html: '<h1>Welcome!</h1><p>Thank you for signing up.</p>'
});

console.log('Email sent:', sentEmail.id);
```

### Email with Attachments

```typescript
import fs from 'fs';

const fileContent = fs.readFileSync('./document.pdf');

const sentEmail = await mayl.emails.send({
  fromEmailId: 'your-email-address-id',
  to: [{ email: 'user@example.com' }],
  subject: 'Document Attached',
  text: 'Please find the document attached.',
  attachments: [
    {
      filename: 'document.pdf',
      contentType: 'application/pdf',
      content: fileContent
    }
  ]
});
```

### Scheduled Email

```typescript
// Schedule email to be sent in 1 hour
const scheduledTime = new Date();
scheduledTime.setHours(scheduledTime.getHours() + 1);

const scheduledEmail = await mayl.emails.send({
  fromEmailId: 'your-email-address-id',
  to: [{ email: 'user@example.com' }],
  subject: 'Scheduled Email',
  text: 'This email was scheduled to be sent later.',
  scheduledAt: scheduledTime
});

console.log('Email scheduled for:', scheduledTime);
```

### Reply to Thread

```typescript
const replyEmail = await mayl.emails.send({
  fromEmailId: 'your-email-address-id',
  to: [{ email: 'user@example.com' }],
  subject: 'Re: Original Subject',
  text: 'This is a reply to the previous email.',
  threadId: 'original-thread-id' // From previous email
});
```

## Email Management

### List Sent Emails

```typescript
const sentEmails = await mayl.emails.list({
  fromEmailId: 'your-email-address-id',
  status: 'delivered',
  since: new Date('2024-01-01'),
  pagination: { page: 1, limit: 20 }
});

sentEmails.items.forEach(email => {
  console.log(`${email.subject} - ${email.status} at ${email.sentAt}`);
});
```

### Check Delivery Status

```typescript
const status = await mayl.emails.getDeliveryStatus('email-id');
console.log('Delivery status:', status.status);
console.log('Opens:', status.opens);
console.log('Clicks:', status.clicks);
```

### Cancel Scheduled Email

```typescript
await mayl.emails.cancel('scheduled-email-id');
console.log('Scheduled email cancelled');
```

## Error Handling

```typescript
import { 
  AuthenticationError, 
  ValidationError, 
  RateLimitError,
  EmailSendError 
} from 'maylng';

try {
  const email = await mayl.emails.send({
    fromEmailId: 'invalid-id',
    to: [{ email: 'user@example.com' }],
    subject: 'Test',
    text: 'Test email'
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message, error.field);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited. Retry after:', error.retryAfter);
  } else if (error instanceof EmailSendError) {
    console.error('Failed to send email:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Advanced Usage

### Custom HTTP Client Configuration

```typescript
const mayl = createMayl({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.your-domain.com',
  timeout: 60000 // 60 seconds
});
```

### Account Information

```typescript
const accountInfo = await mayl.getAccountInfo();
console.log('Account plan:', accountInfo.plan);
console.log('Email addresses used:', accountInfo.emailAddressUsed, '/', accountInfo.emailAddressLimit);
console.log('Emails sent this month:', accountInfo.emailsSentThisMonth, '/', accountInfo.emailLimitPerMonth);
```

### Bulk Operations

```typescript
// Create multiple temporary emails for different agents
const agents = ['agent-001', 'agent-002', 'agent-003'];

const emailPromises = agents.map(agentId => 
  mayl.emailAddresses.create({
    type: 'temporary',
    prefix: agentId,
    expirationMinutes: 120,
    metadata: { agentId }
  })
);

const agentEmails = await Promise.all(emailPromises);
console.log('Created emails for agents:', agentEmails.map(e => e.email));
```

## TypeScript Types

The SDK is fully typed. Here are some key types:

```typescript
interface CreateEmailAddressOptions {
  type: 'temporary' | 'persistent';
  prefix?: string;
  domain?: string;
  expirationMinutes?: number;
  metadata?: Record<string, any>;
}

interface SendEmailOptions {
  fromEmailId: string;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  scheduledAt?: Date;
  threadId?: string;
  metadata?: Record<string, any>;
}
```
