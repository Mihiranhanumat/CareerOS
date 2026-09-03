# CareerOS Architecture Rules

1. **Single Source of Truth**: The Career Knowledge Base database is the canonical source of truth for all career data.
2. **Derived Views**: Resumes, portfolio pages, and application answers are generated views of verified facts.
3. **Immutability**: Once an application is submitted, its specific resume snapshot and answer version must remain immutable.
4. **Least Privilege Agent Contracts**: Agents only have access to their required tools and database tables.
