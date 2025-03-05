# Contributing to VPN Service

This document outlines the guidelines for contributing to the VPN Service project. Following these guidelines helps maintain code quality, consistency, and makes the development process more efficient.

## Table of Contents

- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Git Workflow](#git-workflow)
- [Backend Development](#backend-development)
- [Frontend Development](#frontend-development)
- [Docker Guidelines](#docker-guidelines)
- [Testing](#testing)
- [Security](#security)
- [Documentation](#documentation)
- [CI/CD](#cicd)

## Project Structure

The project consists of several key components:

- **Backend**: Node.js API service
- **Admin Panel**: Next.js web application
- **Database**: Managed by Supabase
- **Infrastructure**: Docker containers for local development and production deployment

## Code Style

We enforce code style with ESLint and EditorConfig:

- **ESLint**: Use the project's `.eslintrc.js` configurations for both backend and frontend
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JavaScript/TypeScript, double quotes for HTML attributes
- **Semicolons**: Required
- **Line length**: 100 characters maximum
- **Trailing commas**: Required for multiline objects and arrays

## Git Workflow

### Branching Strategy

- `main`: Production branch, always stable
- `dev`: Development branch, contains features ready for next release
- `feature/*`: Feature branches for new functionality
- `fix/*`: Bugfix branches
- `refactor/*`: Code refactoring branches
- `docs/*`: Documentation updates

### Commit Messages

All commit messages must follow the Conventional Commits specification:

- `Feat(scope): message` - New features
- `Fix(scope): message` - Bug fixes
- `Docs(scope): message` - Documentation changes
- `Style(scope): message` - Code style changes (formatting, etc.)
- `Refactor(scope): message` - Code refactoring
- `Perf(scope): message` - Performance improvements
- `Test(scope): message` - Tests
- `Chore(scope): message` - Build, dependencies, config changes

Example: `Feat(admin): add subscription management page`

### Pull Requests

- Create PRs for all changes
- Request at least one review
- Ensure all tests and lint checks pass
- Squash commits when merging to main

## Backend Development

### API Design

- Follow RESTful principles
- Use consistent naming conventions
- Include version in API path (e.g., `/api/v1/users`)
- Document all endpoints using OpenAPI/Swagger

### Error Handling

- Use appropriate HTTP status codes
- Return consistent error objects:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human readable message",
      "details": {}
    }
  }
  ```

### Authentication

- Always use HTTPS
- Implement rate limiting for authentication endpoints
- Use JWT tokens with appropriate expiration

## Frontend Development

### Component Structure

- Group components by feature/domain
- Create reusable UI components in `components/ui`
- Follow atomic design principles (atoms, molecules, organisms)

### State Management

- Use React Query for server state
- Use React Context or Zustand for global UI state
- Keep local component state with useState when appropriate

### Styling

- Use Tailwind CSS for styling
- Create reusable utility classes
- Use CSS variables for theming

### Forms

- Use React Hook Form for form handling
- Implement client-side validation
- Show clear error messages

## Docker Guidelines

- Keep images as small as possible
- Use multi-stage builds
- Don't run containers as root
- Use specific version tags for base images
- Include health checks
- Document all environment variables

## Testing

### Backend Testing

- Use Jest for unit and integration tests
- Maintain at least 70% code coverage
- Mock external services
- Use separate test database

### Frontend Testing

- Use Jest and React Testing Library
- Test user flows and interactions
- Write component tests for reusable components
- Use Cypress for end-to-end testing

## Security

- Never commit secrets or credentials
- Use environment variables for configuration
- Validate all user input
- Implement proper authorization checks
- Follow OWASP security guidelines
- Regularly update dependencies
- Use Content Security Policy

## Documentation

- Document all APIs
- Maintain up-to-date README files
- Document environment variables in `.env.example`
- Include setup instructions for new developers
- Comment complex code sections

## CI/CD

Our CI/CD pipeline uses GitHub Actions for:

- Running tests
- Linting code
- Building Docker images
- Deploying to environments

### Environments

- **Development**: Automatic deployment from `dev` branch
- **Staging**: Manual promotion from development
- **Production**: Manual promotion from staging

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and configure variables
3. Run `docker-compose up` to start local development environment
4. Make changes following the guidelines above
5. Submit pull request 