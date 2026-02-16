# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Universal Data Router, please report it responsibly.

**Do not open a public issue.** Instead, email security concerns to the maintainers via the [GlowStarLabs hub](https://meetaudreyevans.com).

## Security Measures

- JWT-based authentication with short-lived access tokens
- Bcrypt password hashing with configurable rounds
- CORS restrictions with configurable allowed origins
- Rate limiting on authentication and API endpoints
- SQL injection prevention via SQLAlchemy ORM
- XSS prevention via React's built-in escaping
- CSRF protection via SameSite cookies
- Stripe webhook signature verification
- Environment variable-based secret management
- Security headers via Nginx (X-Frame-Options, CSP, etc.)
