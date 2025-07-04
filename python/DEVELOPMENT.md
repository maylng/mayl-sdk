# Maylng Python SDK Development Setup

## Installation

### From PyPI (when published)

```bash
pip install maylng
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/maylng/mayl-sdk.git
cd mayl-sdk/python

# Install in development mode
pip install -e .

# Or install with development dependencies
pip install -e ".[dev]"
```

## Development

### Running Examples

```bash
# Set your API key
export MAYLNG_API_KEY="your-api-key"

# Run basic usage examples
python examples/basic_usage.py
```

### Code Quality

```bash
# Format code
black maylng/ examples/

# Sort imports
isort maylng/ examples/

# Type checking
mypy maylng/

# Linting
flake8 maylng/
```

### Testing

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=maylng --cov-report=html
```

## Building and Publishing

### Build Package

```bash
# Build distributions
python -m build

# Check distributions
twine check dist/*
```

### Publishing

```bash
# Test PyPI
twine upload --repository testpypi dist/*

# Production PyPI
twine upload dist/*
```

## Project Structure

```md
python/
├── maylng/              # Main package
│   ├── __init__.py      # Package exports
│   ├── client.py        # Main client classes
│   ├── types.py         # Type definitions
│   ├── errors.py        # Exception classes
│   ├── http_client.py   # HTTP client
│   ├── email_address_service.py  # Email address management
│   └── email_service.py # Email sending
├── examples/            # Usage examples
│   └── basic_usage.py   # Basic usage examples
├── tests/              # Test suite
├── pyproject.toml      # Project configuration
├── README.md           # Documentation
└── DEVELOPMENT.md      # This file
```

## Dependencies

### Core Dependencies

- `httpx` - Async HTTP client
- `pydantic` - Data validation and serialization
- `typing-extensions` - Extended typing support for Python < 3.10

### Development Dependencies

- `pytest` - Testing framework
- `pytest-asyncio` - Async testing support
- `mypy` - Static type checking
- `black` - Code formatting
- `isort` - Import sorting
- `flake8` - Linting

## Python Version Support

The SDK supports Python 3.8+ with type hints and async/await support.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Run code quality checks
7. Submit a pull request

## API Documentation

The Python SDK mirrors the TypeScript SDK API for consistency:

- **Synchronous Client**: `Mayl`
- **Asynchronous Client**: `AsyncMayl`
- **Email Addresses**: `mayl.email_addresses.create()`, `list()`, `update()`, etc.
- **Email Sending**: `mayl.emails.send()`, `list()`, `get_delivery_status()`, etc.
- **Error Handling**: Structured exceptions with request IDs and status codes

## Type Safety

The SDK uses Pydantic models for runtime validation and MyPy for static type checking:

```python
from maylng.types import EmailAddress, SentEmail

# All responses are properly typed
email: EmailAddress = mayl.email_addresses.create(type="temporary")
sent: SentEmail = mayl.emails.send(from_email_id=email.id, ...)
```
