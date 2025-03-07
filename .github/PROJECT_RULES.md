# VPN Service Project Rules

## Core Principles

1. **Streamlined Automation**
   - Do not create additional scripts if functionality can be incorporated into existing workflows
   - If automation is needed, add it directly to CI/CD pipeline rather than creating standalone scripts
   - Prefer modifying existing files over creating new ones

2. **Clean Repository**
   - Delete backup files immediately after they are no longer needed
   - Remove redundant files after completing tasks
   - Do not commit temporary files, debug code, or commented-out sections

3. **Workflow Optimization**
   - Integrate fixes directly into the main workflow where possible
   - Create reusable workflow components rather than duplicate scripts
   - Document workflow changes clearly in commit messages

## Code Quality

1. **Commit Conventions**
   - Prefix: Feat, Fix, Docs, Style, Refactor, Test, Chore
   - Scope: Component in parentheses - e.g., (admin), (backend), (workflow)
   - Message: Clear description of changes
   - Example: Fix(workflow): integrate SSL fix into CI/CD workflow

## Maintenance

1. **Cleanup Procedures**
   - Remove backup files after successful implementation
   - Delete any temporary branches after merging
   - Clean up logs and diagnostic output
   - Delete redundant or unnecessary scripts
   - Do not keep multiple versions of the same file

## Deployment

1. **CI/CD Integration**
   - Prefer integrating functionality directly into CI/CD workflow
   - Avoid creating separate scripts that duplicate workflow functionality
   - When creating workflow steps, ensure they are reusable and well-documented
   - Add proper error handling and logging to workflow steps

## Environment Variables

1. **Configuration Management**
   - Use .env.example as the source of truth for all required variables
   - Ensure all environment variables have sensible defaults where possible
   - Document the purpose of each environment variable
   - Test services with both present and missing environment variables

## Housekeeping

1. **Workflow Files**
   - Regularly clean up workflow artifacts that are no longer needed
   - Do not commit temporary or debug workflow files
   - Maintain a single source of truth for deployment procedures
   - Remove duplicate functionality across workflows
