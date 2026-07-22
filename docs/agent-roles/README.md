# Novi Agent Roles

These files preserve the working roles for the Novi chats.

- `general-business-chat.md`: strategy, product, positioning, customer discovery, pricing, and business decisions
- `dev-cto-advisor.md`: engineering, architecture, privacy, data models, implementation, and technical tradeoffs
- `uxr-slp-test-user.md`: SLP perspective, user research, workflow critique, usability testing, and field realism

Use `docs/novi-primer.md` as the shared source of truth. Update it first when the business changes, then update the role files if the agents' behavior should change.

## Operating Convention

When starting a meaningful Novi task, each chat should read the shared primer and its own role file before giving durable advice or making changes.

Durable business context lives in:

- `docs/novi-primer.md`

Durable agent behavior lives in:

- `docs/agent-roles/general-business-chat.md`
- `docs/agent-roles/dev-cto-advisor.md`
- `docs/agent-roles/uxr-slp-test-user.md`

To change an agent's durable behavior, update its role file first. Then ask the chat to reread its role file before continuing.
