"""
Basic usage examples for the Maylng Python SDK.

This script demonstrates the core functionality of the Maylng SDK including:
1. Creating temporary and persistent email addresses
2. Sending emails with different options
3. Managing email addresses
4. Error handling
"""

import os
import asyncio
import base64
from datetime import datetime, timedelta

from maylng import Mayl, AsyncMayl
from maylng.errors import (
    MaylError,
    AuthenticationError,
    ValidationError,
    RateLimitError,
    EmailSendError
)


def sync_examples():
    """Examples using the synchronous Mayl client."""
    print("🚀 Maylng Python SDK - Synchronous Examples\n")
    
    # Initialize the SDK
    mayl = Mayl(
        api_key=os.getenv("MAYLNG_API_KEY", "demo-api-key"),
        # base_url="https://api.custom-domain.com",  # Uncomment for custom API URL
        timeout=30.0,
        max_retries=3
    )
    
    try:
        # 1. Health Check
        print("1. Performing health check...")
        health = mayl.health_check()
        print(f"   Status: {health.status}")
        print(f"   Message: {health.message}\n")
        
        # 2. Create a temporary email address
        print("2. Creating temporary email address...")
        temp_email = mayl.email_addresses.create(
            type="temporary",
            expiration_minutes=60,
            prefix="agent-demo",
            metadata={
                "purpose": "demo",
                "agent_id": "demo-agent-001",
                "created_by": "example-script"
            }
        )
        print(f"   Created: {temp_email.email}")
        print(f"   Expires: {temp_email.expires_at}\n")
        
        # 3. Create a persistent email address
        print("3. Creating persistent email address...")
        persistent_email = mayl.email_addresses.create(
            type="persistent",
            prefix="support-demo",
            metadata={
                "department": "demo",
                "purpose": "customer-support"
            }
        )
        print(f"   Created: {persistent_email.email}\n")
        
        # 4. Send a simple email
        print("4. Sending simple email...")
        simple_email = mayl.emails.send(
            from_email_id=temp_email.id,
            to=[
                {"email": "demo@example.com", "name": "Demo User"}
            ],
            subject="Welcome from Maylng!",
            text="Hello! This email was sent using the Maylng Python library.",
            html="""
            <h2>Welcome from Maylng!</h2>
            <p>Hello! This email was sent using the <strong>Maylng Python library</strong>.</p>
            <p>Features demonstrated:</p>
            <ul>
                <li>✅ Temporary email creation</li>
                <li>✅ Email sending</li>
                <li>✅ HTML content</li>
            </ul>
            """,
            metadata={
                "campaign": "demo",
                "source": "example-script"
            }
        )
        print(f"   Email sent with ID: {simple_email.id}\n")
        
        # 5. Send email with attachment
        print("5. Sending email with attachment...")
        attachment_content = "This is a demo file content"
        attachment_b64 = base64.b64encode(attachment_content.encode()).decode()
        
        email_with_attachment = mayl.emails.send(
            from_email_id=persistent_email.id,
            to=[{"email": "demo@example.com"}],
            subject="Email with Attachment",
            text="Please find the attached file.",
            attachments=[
                {
                    "filename": "demo.txt",
                    "content_type": "text/plain",
                    "content": attachment_b64
                }
            ]
        )
        print(f"   Email with attachment sent: {email_with_attachment.id}\n")
        
        # 6. Schedule an email for later
        print("6. Scheduling email for later...")
        scheduled_time = datetime.now() + timedelta(minutes=5)
        
        scheduled_email = mayl.emails.send(
            from_email_id=temp_email.id,
            to=[{"email": "demo@example.com"}],
            subject="Scheduled Email",
            text="This email was scheduled to be sent 5 minutes after the example script ran.",
            scheduled_at=scheduled_time
        )
        print(f"   Email scheduled for: {scheduled_time}")
        print(f"   Scheduled email ID: {scheduled_email.id}\n")
        
        # 7. List email addresses
        print("7. Listing email addresses...")
        email_list = mayl.email_addresses.list(
            page=1,
            limit=5
        )
        print(f"   Found {email_list.total} total email addresses:")
        for i, email in enumerate(email_list.items):
            print(f"   {i + 1}. {email.email} ({email.type}) - {email.status}")
        print()
        
        # 8. List sent emails
        print("8. Listing sent emails...")
        sent_emails_list = mayl.emails.list(
            page=1,
            limit=3
        )
        print(f"   Found {sent_emails_list.total} total sent emails:")
        for i, email in enumerate(sent_emails_list.items):
            print(f"   {i + 1}. \"{email.subject}\" - {email.status} at {email.sent_at}")
        print()
        
        # 9. Get account information
        print("9. Getting account information...")
        account_info = mayl.get_account_info()
        print(f"   Account ID: {account_info.account_id}")
        print(f"   Plan: {account_info.plan}")
        print(f"   Email addresses: {account_info.email_address_used}/{account_info.email_address_limit}")
        print(f"   Emails sent this month: {account_info.emails_sent_this_month}/{account_info.email_limit_per_month}\n")
        
        # 10. Extend temporary email
        print("10. Extending temporary email...")
        extended_email = mayl.email_addresses.extend(temp_email.id, 30)
        print(f"    Extended expiration to: {extended_email.expires_at}\n")
        
        print("✅ Synchronous examples completed successfully!")
        
    except AuthenticationError:
        print("❌ Authentication failed. Please check your API key.")
    except ValidationError as e:
        print(f"❌ Validation error: {e.message}")
        if e.field:
            print(f"   Field: {e.field}")
    except RateLimitError as e:
        print(f"❌ Rate limited: {e.message}")
        if e.retry_after:
            print(f"   Retry after: {e.retry_after} seconds")
    except EmailSendError as e:
        print(f"❌ Email send error: {e.message}")
        if e.request_id:
            print(f"   Request ID: {e.request_id}")
    except MaylError as e:
        print(f"❌ Mayl error: {e.message}")
        if e.request_id:
            print(f"   Request ID: {e.request_id}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        mayl.close()


async def async_examples():
    """Examples using the asynchronous AsyncMayl client."""
    print("\n🚀 Maylng Python SDK - Asynchronous Examples\n")
    
    # Initialize the async SDK
    async with AsyncMayl(
        api_key=os.getenv("MAYLNG_API_KEY", "demo-api-key"),
        timeout=30.0,
        max_retries=3
    ) as mayl:
        
        try:
            # 1. Health Check
            print("1. Performing async health check...")
            health = await mayl.health_check()
            print(f"   Status: {health.status}")
            print(f"   Message: {health.message}\n")
            
            # 2. Create a temporary email address
            print("2. Creating temporary email address...")
            temp_email = await mayl.email_addresses.create(
                type="temporary",
                expiration_minutes=60,
                prefix="async-demo",
                metadata={"purpose": "async-demo"}
            )
            print(f"   Created: {temp_email.email}\n")
            
            # 3. Send multiple emails concurrently
            print("3. Sending multiple emails concurrently...")
            
            email_tasks = [
                mayl.emails.send(
                    from_email_id=temp_email.id,
                    to=[{"email": f"demo{i}@example.com"}],
                    subject=f"Async Email {i+1}",
                    text=f"This is async email number {i+1}"
                )
                for i in range(3)
            ]
            
            sent_emails = await asyncio.gather(*email_tasks)
            print(f"   Sent {len(sent_emails)} emails concurrently:")
            for email in sent_emails:
                print(f"   - {email.subject} (ID: {email.id})")
            print()
            
            # 4. Get account info
            print("4. Getting account information...")
            account_info = await mayl.get_account_info()
            print(f"   Account ID: {account_info.account_id}")
            print(f"   Plan: {account_info.plan}\n")
            
            print("✅ Asynchronous examples completed successfully!")
            
        except AuthenticationError:
            print("❌ Authentication failed. Please check your API key.")
        except ValidationError as e:
            print(f"❌ Validation error: {e.message}")
        except MaylError as e:
            print(f"❌ Mayl error: {e.message}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")


def error_handling_examples():
    """Examples demonstrating error handling."""
    print("\n🚀 Error Handling Examples\n")
    
    # Example with invalid API key
    try:
        invalid_mayl = Mayl(api_key="invalid-key")
        invalid_mayl.health_check()
    except AuthenticationError as e:
        print(f"✅ Caught authentication error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    mayl = None
    try:
        mayl = Mayl(api_key=os.getenv("MAYLNG_API_KEY", "demo-api-key"))
        mayl.emails.send(
            from_email_id="invalid-id",
            to=[{"email": "invalid-email"}],
            subject="Test",
            text="Test message"
        )
    except ValidationError as e:
        print(f"✅ Caught validation error: {e}")
    except EmailSendError as e:
        print(f"✅ Caught email send error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        if mayl is not None:  # Only close if successfully initialized
            mayl.close()


if __name__ == "__main__":
    print("Starting Maylng Python SDK Examples...")
    print("=" * 50)
    
    # Run synchronous examples
    sync_examples()
    
    # Run asynchronous examples
    asyncio.run(async_examples())
    
    # Run error handling examples
    error_handling_examples()
    
    print("\n" + "=" * 50)
    print("Examples completed!")
    print("\nNext steps:")
    print("- Set your API key: export MAYLNG_API_KEY='your-actual-api-key'")
    print("- Update recipient email addresses")
    print("- Explore more features in the SDK documentation")
