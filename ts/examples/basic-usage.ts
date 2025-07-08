import { createMayl } from '../src/index';

/**
` * Example usage of the Maylng TypeScript library
 * 
 * This example demonstrates:
 * 1. Creating temporary and persistent email addresses
 * 2. Sending emails with different options
 * 3. Managing email addresses
 * 4. Error handling
 */

async function main() {
  // Initialize the SDK
  const mayl = createMayl({
    apiKey: process.env.MAYL_API_KEY || 'demo-api-key',
    // baseUrl: 'http://api.mayl.ng:8080',
    timeout: 30000
  });

  try {
    console.log('🚀 Maylng Example Usage\n');

    // 1. Health Check
    console.log('1. Performing health check...');
    const health = await mayl.healthCheck();
    console.log(`   Status: ${health.status}`);
    console.log(`   Message: ${health.message}\n`);

    // 2. Create a temporary email address
    console.log('2. Creating temporary email address...');
    const tempEmail = await mayl.emailAddresses.create({
      type: 'temporary',
      expirationMinutes: 60,
      prefix: 'agent-demo',
      metadata: {
        purpose: 'demo',
        agentId: 'demo-agent-001',
        createdBy: 'example-script'
      }
    });
    console.log(`Created: ${tempEmail.email}`);
    console.log(`Expires: ${tempEmail.expiresAt}\n`);

    // 3. Create a persistent email address
    console.log('3. Creating persistent email address...');
    const persistentEmail = await mayl.emailAddresses.create({
      type: 'persistent',
      prefix: 'support-demo',
      metadata: {
        department: 'demo',
        purpose: 'customer-support'
      }
    });
    console.log(`   Created: ${persistentEmail.email}\n`);

    // 4. Send a simple email
    console.log('4. Sending simple email...');
    const simpleEmail = await mayl.emails.send({
      fromEmailId: tempEmail.id,
      to: [
        { email: 'demo@example.com', name: 'Demo User' }
      ],
      subject: 'Welcome from Maylng!',
      text: 'Hello! This email was sent using the Maylng TypeScript library.',
      html: `
        <h2>Welcome from Maylng!</h2>
        <p>Hello! This email was sent using the <strong>Maylng TypeScript library</strong>.</p>
        <p>Features demonstrated:</p>
        <ul>
          <li>✅ Temporary email creation</li>
          <li>✅ Email sending</li>
          <li>✅ HTML content</li>
        </ul>
      `,
      metadata: {
        campaign: 'demo',
        source: 'example-script'
      }
    });
    console.log(`   Email sent with ID: ${simpleEmail.id}\n`);

    // 5. Send email with attachments (simulated)
    console.log('5. Sending email with attachment...');
    const attachmentContent = Buffer.from('This is a demo file content', 'utf-8');
    const emailWithAttachment = await mayl.emails.send({
      fromEmailId: persistentEmail.id,
      to: [{ email: 'demo@example.com' }],
      subject: 'Email with Attachment',
      text: 'Please find the attached file.',
      attachments: [
        {
          filename: 'demo.txt',
          contentType: 'text/plain',
          content: attachmentContent.toString('base64')
        }
      ]
    });
    console.log(`   Email with attachment sent: ${emailWithAttachment.id}\n`);

    // 6. Schedule an email for later
    console.log('6. Scheduling email for later...');
    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + 5); // 5 minutes from now

    const scheduledEmail = await mayl.emails.send({
      fromEmailId: tempEmail.id,
      to: [{ email: 'demo@example.com' }],
      subject: 'Scheduled Email',
      text: 'This email was scheduled to be sent 5 minutes after the example script ran.',
      scheduledAt: scheduledTime
    });
    console.log(`   Email scheduled for: ${scheduledTime}`);
    console.log(`   Scheduled email ID: ${scheduledEmail.id}\n`);

    // 7. List email addresses
    console.log('7. Listing email addresses...');
    const emailList = await mayl.emailAddresses.list({
      pagination: { page: 1, limit: 5 }
    });
    console.log(`   Found ${emailList.total} total email addresses:`);
    emailList.items.forEach((email, index) => {
      console.log(`   ${index + 1}. ${email.email} (${email.type}) - ${email.status}`);
    });
    console.log('');

    // 8. List sent emails
    console.log('8. Listing sent emails...');
    const sentEmailsList = await mayl.emails.list({
      pagination: { page: 1, limit: 3 }
    });
    console.log(`   Found ${sentEmailsList.total} total sent emails:`);
    sentEmailsList.items.forEach((email, index) => {
      console.log(`   ${index + 1}. "${email.subject}" - ${email.status} at ${email.sentAt}`);
    });
    console.log('');

    // 9. Get account information
    console.log('9. Getting account information...');
    const accountInfo = await mayl.getAccountInfo();
    console.log(`   Account ID: ${accountInfo.accountId}`);
    console.log(`   Plan: ${accountInfo.plan}`);
    console.log(`   Email addresses: ${accountInfo.emailAddressUsed}/${accountInfo.emailAddressLimit}`);
    console.log(`   Emails sent this month: ${accountInfo.emailsSentThisMonth}/${accountInfo.emailLimitPerMonth}\n`);

    // 10. Extend temporary email (demonstration)
    console.log('10. Extending temporary email...');
    const extendedEmail = await mayl.emailAddresses.extend(tempEmail.id, 30);
    console.log(`    Extended expiration to: ${extendedEmail.expiresAt}\n`);

    console.log('✅ Example completed successfully!');
    console.log('\nNext steps:');
    console.log('- Replace demo-api-key with your actual API key');
    console.log('- Update recipient email addresses');
    console.log('- Explore more features in the SDK documentation');

  } catch (error: any) {
    console.error('❌ Error occurred:', error.message);
    
    // Handle specific error types
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    
    if (error.requestId) {
      console.error(`   Request ID: ${error.requestId}`);
    }

    // Exit with error code
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
