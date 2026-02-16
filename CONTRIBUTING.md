# Contributing to Universal Data Router

Thank you for your interest in contributing to the Universal Data Router project, part of the GlowStarLabs / Audrey Evans ecosystem.

## Development Process

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes following the code standards below
4. Write tests for new functionality
5. Submit a pull request

## Code Standards

### Backend (Python)

- Follow PEP 8 style guidelines
- Use type hints for all function signatures
- Write docstrings for all public functions
- Use `ruff` for linting

### Frontend (TypeScript/React)

- Use TypeScript strict mode
- Follow the existing component patterns
- Ensure WCAG AAA accessibility compliance
- Add `aria-label` to all interactive elements
- Use the earthy color palette (no blue light)

### Design Requirements

- **No blue light** — use the warm earthy palette defined in `tailwind.config.js`
- **Glassmorphism** — use `glass-panel` and `glass-card` CSS classes
- **Accessibility** — WCAG AAA compliance is mandatory
- **Mobile-first** — all components must be responsive

## Testing

```bash
# Backend tests
cd backend && pytest tests/ -v

# Frontend type check
cd frontend && npx tsc --noEmit
```

## Questions?

Visit [meetaudreyevans.com](https://meetaudreyevans.com) or open an issue.
