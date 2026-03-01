# OpenAI Agents SDK - Getting Started (python)

## Step 1: Install Dependencies

```bash
pip install composio composio-openai-agents openai-agents
```

## Step 2: Create Your Agent

```python
import asyncio
from composio import Composio
from agents import Agent, Runner
from composio_openai_agents import OpenAIAgentsProvider

# Initialize Composio with OpenAI Agents provider
composio = Composio(api_key="113vikfzf5lq9nybg1cbdo", provider=OpenAIAgentsProvider())

external_user_id = "pg-test-38e46467-1f50-4931-8b00-d7873a64990c"

# Create a tool router session
session = composio.create(
    user_id=external_user_id,
)

# Get tools from the session (native)
tools = session.tools()

# Create agent with tools
agent = Agent(
    name="Email Manager",
    instructions="You are a helpful assistant that helps users manage their Gmail accounts.",
    tools=tools,
)

# Run the agent
async def main():
    result = await Runner.run(
        starting_agent=agent,
        input="Send an email to rajashekarvennavelli@gmail.com with the subject 'Hello from Composio' and the body 'This is a test email!'",
    )
    print(result.final_output)

asyncio.run(main())


```

## Step 3: Handle User Authorization

```python
# Create a tool router session with manageConnections disabled
session = composio.create(
    user_id=external_user_id,
    manage_connections=False,
)

# manually authorize the user to use the Gmail API
connection_request = session.authorize(
    toolkit='gmail',
    callback_url='https://your-app.com/callback-path'
)

# redirect the user to the OAuth flow
print(f"Please authorize the app by visiting this URL: {connection_request.redirect_url}")

# Wait for the user to authorize the app
connected_account = connection_request.wait_for_connection()
print(f"Connection established successfully! Connected account id: {connected_account.id}")
```

---

## Documentation

- [Composio Documentation](https://docs.composio.dev)
- [Tool Router Guide](https://docs.composio.dev/tool-router/overview)
- [Managing Multiple Accounts](https://docs.composio.dev/tool-router/managing-multiple-accounts)

# Welcome (/docs)

Composio powers 1000+ toolkits, tool search, context management, authentication, and a sandboxed workbench to help you build AI agents that turn intent into action.

- [Tutorial: Build a chat app](/cookbooks/chat-app): Build a Next.js chat app where your agent can discover and use tools across 1000+ apps.

- [How Composio works](/docs/how-composio-works): See what happens under the hood when your agent searches, authenticates, and executes a tool.

# Get Started

### For AI tools

**Skills:**
```bash
npx skills add composiohq/skills
```
[Skills.sh](https://skills.sh/composiohq/skills/composio) · [GitHub](https://github.com/composiohq/skills)

**CLI:**
```bash
curl -fsSL https://composio.dev/install | bash
```
[CLI Reference](/docs/cli)

**Context:**
- [llms.txt](/llms.txt) — Documentation index with links
- [llms-full.txt](/llms-full.txt) — Complete documentation in one file

- [Quickstart](/docs/quickstart): Install the SDK, connect an app, and run your first tool call in 5 minutes.

# Explore

- [Toolkits](/toolkits): Browse 1000+ toolkits across GitHub, Gmail, Slack, Notion, and more.

- [Playground](https://platform.composio.dev/auth?next_page=%2Ftool-router): Try Composio in your browser without writing any code.

# Providers

Composio works with any AI framework. Pick your preferred SDK:

- [Claude Agent SDK](/docs/providers/claude-agent-sdk) (Python, TypeScript)

- [Anthropic](/docs/providers/anthropic) (Python, TypeScript)

- [OpenAI Agents](/docs/providers/openai-agents) (Python, TypeScript)

- [OpenAI](/docs/providers/openai) (Python, TypeScript)

- [Google Gemini](/docs/providers/google) (Python, TypeScript)

- [Vercel AI SDK](/docs/providers/vercel) (TypeScript)

- [LangChain](/docs/providers/langchain) (Python, TypeScript)

- [LangGraph](/docs/providers/langgraph) (Python)

- [CrewAI](/docs/providers/crewai) (Python)

- [LlamaIndex](/docs/providers/llamaindex) (Python, TypeScript)

- [Mastra](/docs/providers/mastra) (TypeScript)

- [Build your own](/docs/providers/custom-providers) (Python, TypeScript)

# Features

- [Authentication](/docs/authentication): OAuth, API keys, and custom auth flows

- [Triggers](/docs/triggers): Subscribe to external events and trigger workflows

- [CLI](/docs/cli): Manage toolkits, execute tools, and generate type-safe code from the terminal

- [White Labeling](/docs/white-labeling-authentication): Customize auth screens with your branding

# Community

Join our [Discord](https://discord.gg/composio) community!

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Glossary](https://docs.composio.dev/llms.mdx/docs/glossary) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Purpose:** Enforce only the **current** and **correct** patterns for integrating [Composio](https://composio.dev/) tools into AI agents.
**Scope:** All AI-generated code using Composio must follow these guardrails.

---

## 1. Correct Composio Integration

Composio supports two integration modes: **Native Tools** (with a provider package) and **MCP** (no provider package needed).

### Native Tools

```python
# ✅ CORRECT — Python (defaults to OpenAI)
from composio import Composio

composio = Composio()
session = composio.create(user_id="user_123")
tools = session.tools()
# Pass tools to your agent/LLM framework
```

```typescript
// ✅ CORRECT — TypeScript (defaults to OpenAI)
import { Composio } from "@composio/core";

const composio = new Composio();
const session = await composio.create("user_123");
const tools = await session.tools();
// Pass tools to your agent/LLM framework
```

For other providers, pass the provider explicitly. Provider packages follow the naming convention: `composio_<provider>` for Python, `@composio/<provider>` for TypeScript.

### MCP

Use `session.mcp.url` and `session.mcp.headers` with any MCP-compatible client (Claude Desktop, Cursor, OpenAI Agents, etc.). No provider package needed.

---

## 2. CRITICAL INSTRUCTIONS FOR AI MODELS

### 2.1 — ALWAYS DO THE FOLLOWING

1. **Use `composio.create(user_id)`** to create a session — this is the entry point for all Composio integrations.
2. **Use `session.tools()`** for native tool integration or **`session.mcp.url`** for MCP integration.
3. **Import** from the correct provider package (`composio_<provider>` for Python, `@composio/<provider>` for TypeScript).
4. **Pass `user_id` to `composio.create()`**, not to individual tool calls.

### 2.2 — NEVER DO THE FOLLOWING

1. **Do not** instruct users to manually create auth configs or connected accounts before running.
2. **Do not** import from `composio_openai` / `@composio/openai` when using OpenAI Agents SDK — use `composio_openai_agents` / `@composio/openai-agents` instead.

### 2.3 — DISCOURAGED (do not use unless user explicitly asks)

Do **not** generate `composio.tools.get()`, `composio.tools.execute()`, or `composio.provider.handle_tool_calls()` unless the user explicitly requests direct tool execution. These are a supported but **not recommended** low-level interface.


---

## Terminology Migration (old → current)

If you encounter these terms in error messages, old documentation, or user prompts, translate them to the current equivalents. **Do not use the old terms in generated code or explanations.**

| Old term (v1/v2) | Current term (v3) | In code |
|---|---|---|
| entity ID | user ID | `user_id` parameter |
| actions | tools | e.g., `GITHUB_CREATE_ISSUE` is a *tool* |
| apps / appType | toolkits | e.g., `github` is a *toolkit* |
| integration / integration ID | auth config / auth config ID | `auth_config_id` parameter |
| connection | connected account | `connected_accounts` namespace |
| ComposioToolSet / OpenAIToolSet | `Composio` class with a provider | `Composio(provider=...)` |
| toolset | provider | e.g., `OpenAIProvider` |

If a user says "entity ID", they mean `user_id`. If they say "integration", they mean "auth config". Always respond using the current terminology.

# In-chat authentication (/docs/authenticating-users/in-chat-authentication)

In-chat authentication lets your agent prompt users to connect accounts during chat. When a tool requires authentication, the agent returns a Connect Link URL. The user authenticates, confirms in chat, and the agent retries.

# How it works

1. Agent searches for tools via the `COMPOSIO_SEARCH_TOOLS` meta-tool
2. The `COMPOSIO_MANAGE_CONNECTIONS` meta-tool checks connection status, returns Connect Link URL if needed
3. User authenticates, confirms in chat, agent continues

# Configuration

By just creating a session with default configs, you are enabling in-chat auth. The `manage_connections` parameter defaults to `True`, which includes the `COMPOSIO_MANAGE_CONNECTIONS` meta-tool automatically:

**Python:**

```python
session = composio.create(user_id="user_123")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
```

## Custom callback URL

Redirect users back to your chat page after they complete authentication:

**Python:**

```python
session = composio.create(
    user_id="user_123",
    manage_connections={
        "callback_url": "https://yourapp.com/chat"
    },
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123", {
  manageConnections: {
    callbackUrl: "https://yourapp.com/chat",
  },
});
```

# Examples

**Python:**

```python
from dotenv import load_dotenv
from composio import Composio
from agents import Agent, Runner, SQLiteSession
from composio_openai_agents import OpenAIAgentsProvider

load_dotenv()

# Initialize Composio with OpenAI Agents provider (API key from env var COMPOSIO_API_KEY)
composio = Composio(provider=OpenAIAgentsProvider())

# Unique identifier of the user
user_id = "user_123"

# Create a session and get native tools for the user
session = composio.create(user_id=user_id)
tools = session.tools()

# Configure OpenAI agent with Composio tools
agent = Agent(
    name="Personal Assistant",
    instructions="You are a helpful personal assistant. Use Composio tools to take action.",
    model="gpt-5.2",
    tools=tools,
)

# Memory for multi-turn conversation
memory = SQLiteSession("conversation")

print("""
What task would you like me to help you with?
I can use tools like Gmail, GitHub, Linear, Notion, and more.
(Type 'exit' to exit)
Example tasks:
  • 'Summarize my emails from today'
  • 'List all open issues on the composio github repository'
""")

while True:
    user_input = input("You: ").strip()
    if user_input.lower() == "exit":
        break

    print("Assistant: ", end="", flush=True)
    try:
        result = Runner.run_sync(starting_agent=agent, input=user_input, session=memory)
        print(f"{result.final_output}\n")
    except Exception as e:
        print(f"\n[Error]: {e}")
```

**TypeScript:**

```typescript
import "dotenv/config";
import { Composio } from "@composio/core";
import { Agent, run, MemorySession } from "@openai/agents";
import { OpenAIAgentsProvider } from "@composio/openai-agents";
import { createInterface } from "readline/promises";

// Initialize Composio with OpenAI Agents provider (API key from env var COMPOSIO_API_KEY)
const composio = new Composio({ provider: new OpenAIAgentsProvider() });

// Unique identifier of the user
const userId = "user_123";
// Create a session for the user
const session = await composio.create(userId);
const tools = await session.tools();

const agent = new Agent({
  name: "Personal Assistant",
  instructions: "You are a helpful personal assistant. Use Composio tools to take action.",
  model: "gpt-5.2",
  tools,
});

// Set up interactive terminal input/output for the conversation
const readline = createInterface({ input: process.stdin, output: process.stdout });
// Create a memory session for persistent multi-turn conversation
const memory = new MemorySession();

console.log(`
What task would you like me to help you with?
I can use tools like Gmail, GitHub, Linear, Notion, and more.
(Type 'exit' to exit)
Example tasks:
  • 'Summarize my emails from today'
  • 'List all open issues on the composio github repository and create a Google Sheet with the issues'
`);

// Multi-turn conversation with agentic tool calling
while (true) {
    const query = await readline.question("You: ");
    const input = query.trim();

    if (input.toLowerCase() === "exit") break;
    process.stdout.write("Assistant: ");

    try {
      const result = await run(agent, input, { session: memory });
      process.stdout.write(`${result.finalOutput}`);
    } catch (error) {
    console.error("\n[Error]:", error instanceof Error ? error.message : error);

readline.close();
```

What this looks like when you run the code:

```
Assistant: What would you like me to do today? Type 'exit' to end the conversation.

> Star the composio repo on GitHub
Assistant: I need you to connect your GitHub account first.
Please click here to authorize: https://connect.composio.dev/link/ln_abc123

> Done
```

# What to read next

- [Manual authentication](/docs/authenticating-users/manually-authenticating): Pre-authenticate users before chat using Connect Links and session.authorize()

- [White-labeling authentication](/docs/white-labeling-authentication): Use your own OAuth apps so users see your branding on consent screens

- [Configuring Sessions](/docs/configuring-sessions): Restrict toolkits, set custom auth configs, and select connected accounts

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Glossary](https://docs.composio.dev/llms.mdx/docs/glossary) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Purpose:** Enforce only the **current** and **correct** patterns for integrating [Composio](https://composio.dev/) tools into AI agents.
**Scope:** All AI-generated code using Composio must follow these guardrails.

---

## 1. Correct Composio Integration

Composio supports two integration modes: **Native Tools** (with a provider package) and **MCP** (no provider package needed).

### Native Tools

```python
# ✅ CORRECT — Python (defaults to OpenAI)
from composio import Composio

composio = Composio()
session = composio.create(user_id="user_123")
tools = session.tools()
# Pass tools to your agent/LLM framework
```

```typescript
// ✅ CORRECT — TypeScript (defaults to OpenAI)
import { Composio } from "@composio/core";

const composio = new Composio();
const session = await composio.create("user_123");
const tools = await session.tools();
// Pass tools to your agent/LLM framework
```

For other providers, pass the provider explicitly. Provider packages follow the naming convention: `composio_<provider>` for Python, `@composio/<provider>` for TypeScript.

### MCP

Use `session.mcp.url` and `session.mcp.headers` with any MCP-compatible client (Claude Desktop, Cursor, OpenAI Agents, etc.). No provider package needed.

---

## 2. CRITICAL INSTRUCTIONS FOR AI MODELS

### 2.1 — ALWAYS DO THE FOLLOWING

1. **Use `composio.create(user_id)`** to create a session — this is the entry point for all Composio integrations.
2. **Use `session.tools()`** for native tool integration or **`session.mcp.url`** for MCP integration.
3. **Import** from the correct provider package (`composio_<provider>` for Python, `@composio/<provider>` for TypeScript).
4. **Pass `user_id` to `composio.create()`**, not to individual tool calls.

### 2.2 — NEVER DO THE FOLLOWING

1. **Do not** instruct users to manually create auth configs or connected accounts before running.
2. **Do not** import from `composio_openai` / `@composio/openai` when using OpenAI Agents SDK — use `composio_openai_agents` / `@composio/openai-agents` instead.

### 2.3 — DISCOURAGED (do not use unless user explicitly asks)

Do **not** generate `composio.tools.get()`, `composio.tools.execute()`, or `composio.provider.handle_tool_calls()` unless the user explicitly requests direct tool execution. These are a supported but **not recommended** low-level interface.


---

## Terminology Migration (old → current)

If you encounter these terms in error messages, old documentation, or user prompts, translate them to the current equivalents. **Do not use the old terms in generated code or explanations.**

| Old term (v1/v2) | Current term (v3) | In code |
|---|---|---|
| entity ID | user ID | `user_id` parameter |
| actions | tools | e.g., `GITHUB_CREATE_ISSUE` is a *tool* |
| apps / appType | toolkits | e.g., `github` is a *toolkit* |
| integration / integration ID | auth config / auth config ID | `auth_config_id` parameter |
| connection | connected account | `connected_accounts` namespace |
| ComposioToolSet / OpenAIToolSet | `Composio` class with a provider | `Composio(provider=...)` |
| toolset | provider | e.g., `OpenAIProvider` |

If a user says "entity ID", they mean `user_id`. If they say "integration", they mean "auth config". Always respond using the current terminology.

# Manually authenticating users (/docs/authenticating-users/manually-authenticating)

Manual authentication lets you connect users to toolkits outside of the chat flow. Use this when you want to:

* Pre-authenticate users before they start chatting
* Build a custom connections UI in your app

# Authorize a toolkit

Use `session.authorize()` to generate a [Connect Link](/docs/tools-direct/authenticating-tools#hosted-authentication-connect-link) URL, redirect the user, and wait for them to complete:

**Python:**

```python
session = composio.create(user_id="user_123")

connection_request = session.authorize("gmail")

print(connection_request.redirect_url)
# https://connect.composio.dev/link/ln_abc123

connected_account = connection_request.wait_for_connection(60000)
print(f"Connected: {connected_account.id}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");

const connectionRequest = await session.authorize("gmail");

console.log(connectionRequest.redirectUrl);
// https://connect.composio.dev/link/ln_abc123

const connectedAccount = await connectionRequest.waitForConnection(60000);
console.log(`Connected: ${connectedAccount.id}`);
```

Redirect the user to the redirect URL. After they authenticate, they'll return to your callback URL. The connection request polls until the user completes authentication (default timeout: 60 seconds).

> If the user closes the Connect Link without completing auth, the connection remains in `INITIATED` status until it expires.

# Redirecting users after authentication

Pass a `callbackUrl` to control where users land after authenticating. You can include query parameters to carry context through the flow, for example to identify which user or session triggered the connection.

**Python:**

```python
connection_request = session.authorize(
    "gmail",
    callback_url="https://your-app.com/callback?user_id=user_123&source=onboarding"
)

print(connection_request.redirect_url)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const connectionRequest = await session.authorize("gmail", {
  callbackUrl: "https://your-app.com/callback?user_id=user_123&source=onboarding",
});

console.log(connectionRequest.redirectUrl);
```

After authentication, Composio redirects the user to your callback URL with the following parameters appended, while preserving your existing ones:

| Parameter              | Description                                   |
| ---------------------- | --------------------------------------------- |
| `status`               | `success` or `failed`                         |
| `connected_account_id` | The ID of the newly created connected account |

```
https://your-app.com/callback?user_id=user_123&source=onboarding&status=success&connected_account_id=ca_abc123
```

# Check connection status

Use `session.toolkits()` to see all toolkits in the session and their connection status:

**Python:**

```python
toolkits = session.toolkits()

for toolkit in toolkits.items:
    status = toolkit.connection.connected_account.id if toolkit.connection.is_active else "Not connected"
    print(f"{toolkit.name}: {status}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const toolkits = await session.toolkits();

toolkits.items.forEach((toolkit) => {
  console.log(`${toolkit.name}: ${toolkit.connection?.connectedAccount?.id ?? "Not connected"}`);
});
```

# Disabling in-chat auth

By default, sessions include the `COMPOSIO_MANAGE_CONNECTIONS` meta-tool that prompts users to authenticate during chat. To disable this and handle auth entirely in your UI:

**Python:**

```python
session = composio.create(
    user_id="user_123",
    manage_connections=False,
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123", {
  manageConnections: false,
});
```

# Putting it together

A common pattern is to verify all required connections before starting the agent:

**Python:**

```python
from composio import Composio

composio = Composio(api_key="your-api-key")

required_toolkits = ["gmail", "github"]

session = composio.create(
    user_id="user_123",
    manage_connections=False,  # Disable in-chat auth prompts
)

toolkits = session.toolkits()

connected = {t.slug for t in toolkits.items if t.connection.is_active}
pending = [slug for slug in required_toolkits if slug not in connected]

print(f"Connected: {connected}")
print(f"Pending: {pending}")

for slug in pending:
    connection_request = session.authorize(slug)
    print(f"Connect {slug}: {connection_request.redirect_url}")
    connection_request.wait_for_connection()

print(f"All toolkits connected! MCP URL: {session.mcp.url}")
```

**TypeScript:**

```typescript
import { Composio } from "@composio/core";

const composio = new Composio({ apiKey: "your-api-key" });

const requiredToolkits = ["gmail", "github"];

const session = await composio.create("user_123", {
  manageConnections: false, // Disable in-chat auth prompts
});

const toolkits = await session.toolkits();

const connected = toolkits.items
  .filter((t) => t.connection?.connectedAccount)
  .map((t) => t.slug);

const pending = requiredToolkits.filter((slug) => !connected.includes(slug));

console.log("Connected:", connected);
console.log("Pending:", pending);

for (const slug of pending) {
  const connectionRequest = await session.authorize(slug);
  console.log(`Connect ${slug}: ${connectionRequest.redirectUrl}`);
  await connectionRequest.waitForConnection();

console.log(`All toolkits connected! MCP URL: ${session.mcp.url}`);
```

# What to read next

- [Build an App Connections Dashboard](/cookbooks/app-connections-dashboard): Full working example of a connections page with OAuth and disconnect

- [In-chat authentication](/docs/authenticating-users/in-chat-authentication): Let the agent prompt users to connect accounts during conversation instead

- [White-labeling authentication](/docs/white-labeling-authentication): Use your own OAuth apps so users see your branding on consent screens

- [Managing multiple accounts](/docs/managing-multiple-connected-accounts): Handle users with multiple accounts for the same toolkit (e.g., work and personal Gmail)

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Glossary](https://docs.composio.dev/llms.mdx/docs/glossary) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Purpose:** Enforce only the **current** and **correct** patterns for integrating [Composio](https://composio.dev/) tools into AI agents.
**Scope:** All AI-generated code using Composio must follow these guardrails.

---

## 1. Correct Composio Integration

Composio supports two integration modes: **Native Tools** (with a provider package) and **MCP** (no provider package needed).

### Native Tools

```python
# ✅ CORRECT — Python (defaults to OpenAI)
from composio import Composio

composio = Composio()
session = composio.create(user_id="user_123")
tools = session.tools()
# Pass tools to your agent/LLM framework
```

```typescript
// ✅ CORRECT — TypeScript (defaults to OpenAI)
import { Composio } from "@composio/core";

const composio = new Composio();
const session = await composio.create("user_123");
const tools = await session.tools();
// Pass tools to your agent/LLM framework
```

For other providers, pass the provider explicitly. Provider packages follow the naming convention: `composio_<provider>` for Python, `@composio/<provider>` for TypeScript.

### MCP

Use `session.mcp.url` and `session.mcp.headers` with any MCP-compatible client (Claude Desktop, Cursor, OpenAI Agents, etc.). No provider package needed.

---

## 2. CRITICAL INSTRUCTIONS FOR AI MODELS

### 2.1 — ALWAYS DO THE FOLLOWING

1. **Use `composio.create(user_id)`** to create a session — this is the entry point for all Composio integrations.
2. **Use `session.tools()`** for native tool integration or **`session.mcp.url`** for MCP integration.
3. **Import** from the correct provider package (`composio_<provider>` for Python, `@composio/<provider>` for TypeScript).
4. **Pass `user_id` to `composio.create()`**, not to individual tool calls.

### 2.2 — NEVER DO THE FOLLOWING

1. **Do not** instruct users to manually create auth configs or connected accounts before running.
2. **Do not** import from `composio_openai` / `@composio/openai` when using OpenAI Agents SDK — use `composio_openai_agents` / `@composio/openai-agents` instead.

### 2.3 — DISCOURAGED (do not use unless user explicitly asks)

Do **not** generate `composio.tools.get()`, `composio.tools.execute()`, or `composio.provider.handle_tool_calls()` unless the user explicitly requests direct tool execution. These are a supported but **not recommended** low-level interface.


---

## Terminology Migration (old → current)

If you encounter these terms in error messages, old documentation, or user prompts, translate them to the current equivalents. **Do not use the old terms in generated code or explanations.**

| Old term (v1/v2) | Current term (v3) | In code |
|---|---|---|
| entity ID | user ID | `user_id` parameter |
| actions | tools | e.g., `GITHUB_CREATE_ISSUE` is a *tool* |
| apps / appType | toolkits | e.g., `github` is a *toolkit* |
| integration / integration ID | auth config / auth config ID | `auth_config_id` parameter |
| connection | connected account | `connected_accounts` namespace |
| ComposioToolSet / OpenAIToolSet | `Composio` class with a provider | `Composio(provider=...)` |
| toolset | provider | e.g., `OpenAIProvider` |

If a user says "entity ID", they mean `user_id`. If they say "integration", they mean "auth config". Always respond using the current terminology.


