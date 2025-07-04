"""
Advanced usage examples for the Maylng Python SDK.

This example demonstrates advanced features including:
- Async/await patterns
- Error handling strategies
- Batch operations
- Email templates
- File attachments
"""

import os
import asyncio
import base64
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, cast

from maylng import Mayl, AsyncMayl
from maylng.types import EmailAddress, SentEmail
from maylng.errors import MaylError, RateLimitError


class EmailTemplate:
    """Simple email template class."""
    
    def __init__(self, subject_template: str, text_template: str, html_template: Optional[str] = None):
        self.subject_template = subject_template
        self.text_template = text_template
        self.html_template = html_template
    
    def render(self, **kwargs) -> Dict[str, str]:
        """Render template with provided variables."""
        result = {
            "subject": self.subject_template.format(**kwargs),
            "text": self.text_template.format(**kwargs)
        }
        
        if self.html_template:
            result["html"] = self.html_template.format(**kwargs)
        
        return result


async def create_demo_email_addresses(mayl: AsyncMayl) -> List[EmailAddress]:
    """Create multiple email addresses for demo purposes."""
    print("Creating demo email addresses...")
    
    # Create different types of email addresses
    addresses = await asyncio.gather(
        mayl.email_addresses.create(
            type="temporary",
            prefix="newsletter",
            expiration_minutes=120,
            metadata={"purpose": "newsletter", "department": "marketing"}
        ),
        mayl.email_addresses.create(
            type="persistent",
            prefix="support",
            metadata={"purpose": "customer-support", "department": "support"}
        ),
        mayl.email_addresses.create(
            type="temporary",
            prefix="notifications",
            expiration_minutes=60,
            metadata={"purpose": "notifications", "department": "engineering"}
        )
    )
    
    for addr in addresses:
        print(f"  ✅ Created {addr.type} email: {addr.email}")
    
    return list(addresses)


async def send_batch_emails(mayl: AsyncMayl, from_email: EmailAddress, recipients: List[str]) -> List[SentEmail]:
    """Send emails to multiple recipients with rate limiting."""
    print(f"\nSending batch emails from {from_email.email}...")
    
    # Email template
    template = EmailTemplate(
        subject_template="Welcome {name}!",
        text_template="Hello {name},\n\nWelcome to our service!\n\nBest regards,\nThe Team",
        html_template="""
        <h2>Welcome {name}!</h2>
        <p>Hello <strong>{name}</strong>,</p>
        <p>Welcome to our service! We're excited to have you on board.</p>
        <p>Best regards,<br>The Team</p>
        """
    )
    
    # Prepare email tasks
    email_tasks = []
    for i, recipient in enumerate(recipients):
        name = f"User {i+1}"
        content = template.render(name=name)
        
        task = mayl.emails.send(
            from_email_id=from_email.id,
            to=[{"email": recipient, "name": name}],
            **content,
            metadata={
                "batch_id": "demo-batch-001",
                "recipient_index": i,
                "sent_at": datetime.now().isoformat()
            }
        )
        email_tasks.append(task)
    
    # Send emails with rate limiting
    sent_emails = []
    batch_size = 3  # Send 3 emails at a time
    
    for i in range(0, len(email_tasks), batch_size):
        batch = email_tasks[i:i + batch_size]
        
        try:
            batch_results = await asyncio.gather(*batch, return_exceptions=True)
            
            for result in batch_results:
                if isinstance(result, Exception):
                    if isinstance(result, RateLimitError):
                        retry_after = result.retry_after or 30  # Default to 30 seconds
                        print(f"  ⏳ Rate limited, waiting {retry_after} seconds...")
                        await asyncio.sleep(retry_after)
                        # Retry logic could be implemented here
                    else:
                        print(f"  ❌ Error sending email: {result}")
                else:
                    # result is a SentEmail object when successful
                    sent_email = cast(SentEmail, result)
                    sent_emails.append(sent_email)
                    print(f"  ✅ Sent email: {sent_email.subject} (ID: {sent_email.id})")
            
            # Small delay between batches
            if i + batch_size < len(email_tasks):
                await asyncio.sleep(1)
                
        except Exception as e:
            print(f"  ❌ Batch error: {e}")
    
    return sent_emails


async def send_email_with_attachments(mayl: AsyncMayl, from_email: EmailAddress) -> SentEmail:
    """Send an email with multiple attachments."""
    print(f"\nSending email with attachments from {from_email.email}...")
    
    # Create demo attachments
    attachments = [
        {
            "filename": "report.txt",
            "content_type": "text/plain",
            "content": base64.b64encode("Monthly Report\n==============\n\nSales: $10,000\nExpenses: $5,000\nProfit: $5,000".encode()).decode()
        },
        {
            "filename": "data.csv",
            "content_type": "text/csv",
            "content": base64.b64encode("Date,Sales,Expenses\n2024-01-01,1000,500\n2024-01-02,1200,600".encode()).decode()
        }
    ]
    
    sent_email = await mayl.emails.send(
        from_email_id=from_email.id,
        to=[{"email": "manager@example.com", "name": "Manager"}],
        cc=[{"email": "accounting@example.com", "name": "Accounting"}],
        subject="Monthly Report - January 2024",
        text="Please find the monthly report attached.",
        html="""
        <h2>Monthly Report - January 2024</h2>
        <p>Dear Manager,</p>
        <p>Please find the monthly report attached for your review.</p>
        <ul>
            <li>📊 <strong>report.txt</strong> - Summary report</li>
            <li>📈 <strong>data.csv</strong> - Raw data</li>
        </ul>
        <p>Best regards,<br>Finance Team</p>
        """,
        attachments=attachments,
        metadata={
            "report_type": "monthly",
            "period": "2024-01",
            "department": "finance"
        }
    )
    
    print(f"  ✅ Email sent with {len(attachments)} attachments (ID: {sent_email.id})")
    return sent_email


async def schedule_email_campaign(mayl: AsyncMayl, from_email: EmailAddress) -> List[SentEmail]:
    """Schedule multiple emails for different times."""
    print(f"\nScheduling email campaign from {from_email.email}...")
    
    # Schedule emails at different intervals
    base_time = datetime.now()
    schedule_times = [
        base_time + timedelta(minutes=5),   # Welcome email
        base_time + timedelta(hours=1),     # Follow-up email
        base_time + timedelta(days=1),      # Newsletter
    ]
    
    email_data = [
        {
            "subject": "Welcome to our service!",
            "text": "Thank you for signing up. We're excited to have you!",
            "type": "welcome"
        },
        {
            "subject": "Getting started guide",
            "text": "Here's how to get the most out of our service...",
            "type": "onboarding"
        },
        {
            "subject": "Weekly Newsletter",
            "text": "Here's what's new this week...",
            "type": "newsletter"
        }
    ]
    
    scheduled_emails = []
    for i, (schedule_time, email_info) in enumerate(zip(schedule_times, email_data)):
        sent_email = await mayl.emails.send(
            from_email_id=from_email.id,
            to=[{"email": f"subscriber{i+1}@example.com"}],
            subject=email_info["subject"],
            text=email_info["text"],
            scheduled_at=schedule_time,
            metadata={
                "campaign": "welcome-series",
                "email_type": email_info["type"],
                "sequence": i + 1
            }
        )
        
        scheduled_emails.append(sent_email)
        print(f"  📅 Scheduled {email_info['type']} email for {schedule_time} (ID: {sent_email.id})")
    
    return scheduled_emails


async def monitor_email_status(mayl: AsyncMayl, email_ids: List[str]):
    """Monitor the delivery status of sent emails."""
    print("\nMonitoring email delivery status...")
    
    for email_id in email_ids:
        try:
            status = await mayl.emails.get_delivery_status(email_id)
            print(f"  📧 Email {email_id}: {status.status}")
            
            if status.delivered_at:
                print(f"    📅 Delivered at: {status.delivered_at}")
            
            if status.opens:
                print(f"    👁️  Opens: {status.opens}")
            
            if status.clicks:
                print(f"    🔗 Clicks: {status.clicks}")
            
            if status.failure_reason:
                print(f"    ❌ Failure: {status.failure_reason}")
                
        except Exception as e:
            print(f"  ❌ Error checking status for {email_id}: {e}")


def sync_email_management_example():
    """Example of synchronous email management operations."""
    print("\n" + "="*50)
    print("Synchronous Email Management Example")
    print("="*50)
    
    with Mayl(api_key=os.getenv("MAYLNG_API_KEY", "demo-api-key")) as mayl:
        try:
            # List existing email addresses
            print("Listing existing email addresses...")
            addresses = mayl.email_addresses.list(limit=5)
            print(f"Found {addresses.total} email addresses:")
            
            for addr in addresses.items:
                print(f"  - {addr.email} ({addr.type}) - {addr.status}")
                
                # Demonstrate updating metadata
                if addr.type == "persistent":
                    updated_metadata = {**(addr.metadata or {}), "last_checked": datetime.now().isoformat()}
                    updated = mayl.email_addresses.update(
                        addr.id,
                        metadata=updated_metadata
                    )
                    print(f"    ✅ Updated metadata for {updated.email}")
            
            # List recent emails
            print("\nListing recent emails...")
            recent_emails = mayl.emails.list(
                since=datetime.now() - timedelta(days=7),
                limit=3
            )
            
            print(f"Found {recent_emails.total} recent emails:")
            for email in recent_emails.items:
                print(f"  - \"{email.subject}\" to {len(email.to)} recipients - {email.status}")
                
        except Exception as e:
            print(f"❌ Error in sync example: {e}")


async def main():
    """Main async function demonstrating advanced features."""
    print("🚀 Maylng Advanced Examples")
    print("="*50)
    
    async with AsyncMayl(
        api_key=os.getenv("MAYLNG_API_KEY", "demo-api-key"),
        timeout=60.0,  # Longer timeout for batch operations
        max_retries=3
    ) as mayl:
        
        try:
            # Health check
            health = await mayl.health_check()
            if health.status != "healthy":
                print(f"❌ API not healthy: {health.message}")
                return
            
            print(f"✅ API is healthy: {health.message}\n")
            
            # Create demo email addresses
            email_addresses = await create_demo_email_addresses(mayl)
            
            # Send batch emails
            recipients = [
                "user1@example.com",
                "user2@example.com", 
                "user3@example.com",
                "user4@example.com",
                "user5@example.com"
            ]
            
            sent_emails = await send_batch_emails(mayl, email_addresses[0], recipients)
            
            # Send email with attachments
            attachment_email = await send_email_with_attachments(mayl, email_addresses[1])
            
            # Schedule email campaign
            scheduled_emails = await schedule_email_campaign(mayl, email_addresses[2])
            
            # Monitor email status
            all_email_ids = [email.id for email in sent_emails + [attachment_email] + scheduled_emails]
            await monitor_email_status(mayl, all_email_ids[:3])  # Monitor first 3 emails
            
            # Get account statistics
            print("\nAccount Statistics:")
            account = await mayl.get_account_info()
            print(f"  📧 Emails sent this month: {account.emails_sent_this_month}/{account.email_limit_per_month}")
            print(f"  📬 Email addresses: {account.email_address_used}/{account.email_address_limit}")
            print(f"  💳 Plan: {account.plan}")
            
            print("\n✅ Advanced examples completed successfully!")
            
        except Exception as e:
            print(f"❌ Error in async examples: {e}")


if __name__ == "__main__":
    # Run async examples
    asyncio.run(main())
    
    # Run sync examples
    sync_email_management_example()
    
    print("\n" + "="*50)
    print("All examples completed!")
    print("\nTips:")
    print("- Use async client for high-throughput applications")
    print("- Implement retry logic for rate-limited operations")
    print("- Monitor email delivery status for important emails")
    print("- Use metadata to track email campaigns and purposes")
