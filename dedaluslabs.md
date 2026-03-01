> ## Documentation Index
> Fetch the complete documentation index at: https://docs.dedaluslabs.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Quickstart

> Learn how to build, run, and deploy agents with the Dedalus SDK in minutes

Dedalus helps you ship agent workflows that are:

* **Provider-agnostic**: Use OpenAI, Anthropic, Google, xAI, DeepSeek, and more with one API.
* **Tool- and MCP-native**: Let models call local functions and hosted MCP servers.
* **Production-ready**: Streaming, structured outputs, routing/handoffs, and runtime policies.

## What are you trying to build?

<CardGroup cols={2}>
  <Card title="Chat with a model" icon="message" href="/sdk/chat">
    Send a prompt and get a response from any provider/model.
  </Card>

  <Card title="Equip a model with tools" icon="wrench" href="/sdk/tools">
    Let the model call typed Python/TS functions that you implement.
  </Card>

  <Card title="Stream agent output" icon="bolt" href="/sdk/streaming">
    Print responses as they're generated (great for UIs/CLIs).
  </Card>

  <Card title="Add MCP servers" icon="server" href="/dmcp/quickstart">
    Connect to hosted MCP servers with one line.
  </Card>

  <Card title="Get reliable JSON" icon="brackets-curly" href="/sdk/structured-outputs">
    Validate model output against schemas (Pydantic/Zod).
  </Card>

  <Card title="Route across models" icon="shuffle" href="/sdk/handoffs">
    Provide multiple models; the agent can route/handoff by phase.
  </Card>
</CardGroup>

## Installation

<CodeGroup>
  ```bash Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  uv pip install dedalus_labs
  ```

  ```bash npm theme={"theme":{"light":"github-light","dark":"github-dark"}}
  npm install dedalus-labs
  ```

  ```bash yarn theme={"theme":{"light":"github-light","dark":"github-dark"}}
  yarn add dedalus-labs
  ```

  ```bash pnpm theme={"theme":{"light":"github-light","dark":"github-dark"}}
  pnpm add dedalus-labs
  ```

  ```bash bun theme={"theme":{"light":"github-light","dark":"github-dark"}}
  bun add dedalus-labs
  ```
</CodeGroup>

## Set Your API Key

Get your API key from the [dashboard](https://www.dedaluslabs.ai/dashboard/api-keys) and set it as an environment variable:

```bash  theme={"theme":{"light":"github-light","dark":"github-dark"}}
export DEDALUS_API_KEY="your-api-key"
```

Or use a `.env` file:

```bash  theme={"theme":{"light":"github-light","dark":"github-dark"}}
DEDALUS_API_KEY=your-api-key
```

## Your First Request

Let's build this incrementally.

### 1) Chat with a model

```python  theme={"theme":{"light":"github-light","dark":"github-dark"}}
import asyncio
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv

load_dotenv()

async def main():
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    response = await runner.run(
        input="What are the key factors that influence weather patterns?",
        model="anthropic/claude-opus-4-6",
    )

    print(response.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

### 2) Add an MCP server

Here we connect a well-known MCP server and let the model use it.

```python  theme={"theme":{"light":"github-light","dark":"github-dark"}}
import asyncio
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv

load_dotenv()

async def main():
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    response = await runner.run(
        input="What's the weather forecast for San Francisco this week?",
        model="anthropic/claude-opus-4-6",
        mcp_servers=["windsornguyen/open-meteo-mcp"],  # Weather forecasts via Open-Meteo
    )

    print(response.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

### 3) Add a local tool

Define a function with type hints and a docstring. Pass it to `runner.run()`. The SDK extracts the schema automatically and handles execution when the model decides to use it.

```python  theme={"theme":{"light":"github-light","dark":"github-dark"}}
import asyncio
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv

load_dotenv()

def as_bullets(items: list[str]) -> str:
    """Format items as a bulleted list."""
    return "\n".join(f"• {item}" for item in items)

async def main():
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    response = await runner.run(
        input=(
            "Get the 7-day weather forecast for San Francisco "
            "and format the daily conditions as bullets using as_bullets."
        ),
        model="anthropic/claude-opus-4-6",
        mcp_servers=["windsornguyen/open-meteo-mcp"],
        tools=[as_bullets],
    )

    print(response.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

### 4) Stream output

```python  theme={"theme":{"light":"github-light","dark":"github-dark"}}
import asyncio
from dedalus_labs import AsyncDedalus, DedalusRunner
from dedalus_labs.utils.stream import stream_async
from dotenv import load_dotenv

load_dotenv()

async def main():
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    stream = runner.run(
        input="Explain how weather forecasting works in one paragraph, streaming as you write.",
        model="anthropic/claude-opus-4-6",
        stream=True,
    )

    await stream_async(stream)

if __name__ == "__main__":
    asyncio.run(main())
```

## Next steps

<CardGroup cols={2}>
  <Card title="Use Cases" icon="lightbulb" href="/sdk/use-cases/web-search-agent">
    Start from common agent patterns and templates.
  </Card>

  <Card title="Cookbook" icon="book" href="/sdk/cookbook/multi-turn-chat">
    End-to-end implementations and working recipes.
  </Card>
</CardGroup>

**Go deeper**: [Tools](/sdk/tools) · [MCP Servers](/sdk/mcp) · [Structured Outputs](/sdk/structured-outputs) · [Streaming](/sdk/streaming)

## Get the latest SDKs

<CardGroup cols={2}>
  <Card title="Python SDK" icon="github" href="https://github.com/dedalus-labs/dedalus-sdk-python">
    dedalus-labs/dedalus-sdk-python
  </Card>

  <Card title="TypeScript SDK" icon="github" href="https://github.com/dedalus-labs/dedalus-sdk-typescript">
    dedalus-labs/dedalus-sdk-typescript
  </Card>
</CardGroup>

<Tip>
  [Connect these docs programmatically](/contextual/use-these-docs) to Claude, VSCode, and more via
  MCP for real-time answers.
</Tip>

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.dedaluslabs.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Chat

> Send messages and get responses from any model

The core of the Dedalus SDK: send a message, get a response. Works with any model from any provider.

## Start with chat

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus, DedalusRunner
  from dotenv import load_dotenv

  load_dotenv()

  async def main():
      client = AsyncDedalus()
      runner = DedalusRunner(client)

      response = await runner.run(
          input=(
              "I want to find the nearest basketball games in January in San Francisco.\n\n"
              "For now, do NOT make up events. Instead:\n"
              "1) Ask any clarifying questions you need.\n"
              "2) Propose a short plan for how you would find events.\n"
              "3) List the fields you'd extract for each event (for a table later)."
          ),
          model="anthropic/claude-opus-4-5",
      )

      print(response.final_output)

  if __name__ == "__main__":
      asyncio.run(main())
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import { DedalusRunner } from "dedalus-labs";

  const client = new Dedalus();
  const runner = new DedalusRunner(client);

  async function main() {
  	const response = await runner.run({
  		input:
  			"I want to find the nearest basketball games in January in San Francisco.\n\n" +
  			"For now, do NOT make up events. Instead:\n" +
  			"1) Ask any clarifying questions you need.\n" +
  			"2) Propose a short plan for how you would find events.\n" +
  			"3) List the fields you'd extract for each event (for a table later).",
  		model: "anthropic/claude-opus-4-5",
  	});

  	console.log(response.finalOutput);
  }

  main();
  ```
</CodeGroup>

## Next steps

* **Add actions**: [Tools](/sdk/tools) — Let the model call your functions
* **Connect external tools**: [MCP Servers](/sdk/mcp) — Use hosted MCP servers
* **Stream the workflow**: [Streaming](/sdk/streaming) — Show progress in real time

<Tip>
  [Connect these docs programmatically](/contextual/use-these-docs) to Claude, VSCode, and more via
  MCP for real-time answers.
</Tip>
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.dedaluslabs.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Tools

> Give agents the ability to take actions

Agents become useful when they can do things beyond generating text. Tools let them call functions, query databases, make API requests—anything you can express in code.

## How It Works

Define a function with type hints and a docstring. Pass it to `runner.run()`. The Dedalus SDK extracts the schema automatically and handles execution when the model decides to use it.

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus, DedalusRunner
  from dotenv import load_dotenv

  load_dotenv()

  def as_bullets(items: list[str]) -> str:
  """Format items as a bulleted list."""
  return "\n".join(f"• {item}" for item in items)

  async def main():
  client = AsyncDedalus()
  runner = DedalusRunner(client)

      result = await runner.run(
          input=(
              "Take the following events and call as_bullets with a list of items (one per event).\n\n"
              "Events:\n"
              "- Warriors vs Lakers — San Francisco — 2026-01-18\n"
              "- Warriors vs Suns — San Francisco — 2026-01-22\n"
              "- Warriors vs Celtics — San Francisco — 2026-01-29\n\n"
              "Return only the list."
          ),
          model="openai/gpt-5.2",
          tools=[as_bullets],
      )

      print(result.final_output)

  if **name** == "**main**":
  asyncio.run(main())

  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from 'dedalus-labs';
  import { DedalusRunner } from 'dedalus-labs';

  const client = new Dedalus();
  const runner = new DedalusRunner(client, true);

  function formatTable(rows: Record<string, any>[]): string {
    if (!rows.length) return 'No results.';
    const cols = Object.keys(rows[0]);
    const header = `| ${cols.join(' | ')} |`;
    const sep = `| ${cols.map(() => '---').join(' | ')} |`;
    const body = rows.map((r) => `| ${cols.map((c) => String(r?.[c] ?? '')).join(' | ')} |`);
    return [header, sep, ...body].join('\n');
  }

  async function main() {
    const result = await runner.run({
      input:
        'Take the following events and call formatTable with a list of rows (one row per event).\n\n' +
        'Events:\n' +
        '- {"name":"Warriors vs Lakers","city":"San Francisco","date":"2026-01-18"}\n' +
        '- {"name":"Warriors vs Suns","city":"San Francisco","date":"2026-01-22"}\n' +
        '- {"name":"Warriors vs Celtics","city":"San Francisco","date":"2026-01-29"}\n\n' +
        'Return only the table.',
      model: 'openai/gpt-5.2',
      tools: [formatTable],
    });

    console.log((result as any).finalOutput);
  }

  main();
  ```
</CodeGroup>

The model sees the tool schemas, decides which to call, and the Runner executes them. Multi-step reasoning happens automatically—the Runner keeps calling the model until it can complete the task.

## Tool best practices

Good tools typically have:

* **Type hints** on all parameters and return values
* **Docstrings** that explain what the tool does (the model reads these)
* **Clear names** that indicate purpose

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  # Good: typed, documented, clear name
  def get_weather(city: str, units: str = "celsius") -> dict:
      """Get current weather for a city. Returns temperature and conditions."""
      return {"temp": 22, "conditions": "sunny"}

  # Bad: no types, no docs, unclear name

  def do_thing(x):
  return some_api_call(x)

  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  // Good: typed, documented, clear name
  function getWeather(city: string, units: string = 'celsius'): object {
    // Get current weather for a city
    return { temp: 22, conditions: 'sunny' };
  }

  // Bad: no types, unclear name
  function doThing(x: any) {
    return someApiCall(x);
  }
  ```
</CodeGroup>

## Async Tools

Tools can be async. The Runner awaits them automatically:

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  async def fetch_user(user_id: int) -> dict:
      """Fetch user profile from database."""
      async with db.connection() as conn:
          return await conn.fetchone("SELECT * FROM users WHERE id = $1", user_id)
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  async function fetchUser(userId: number): Promise<object> {
  	// Fetch user profile from database
  	const result = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
  	return result.rows[0];
  }
  ```
</CodeGroup>

## Agent as Tool

Wrap a specialized agent as a tool. The coordinator delegates specific tasks to specialists without giving up conversation control.

This differs from [handoffs](/sdk/handoffs):

* **Handoffs**: New agent takes over the conversation with full history
* **Agent as tool**: Specialist receives specific input, returns output, coordinator continues

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus, DedalusRunner

  async def main():
  client = AsyncDedalus()
  runner = DedalusRunner(client)

      # Specialist: wrap another runner call as a tool
      async def research_specialist(query: str) -> str:
          """Deep research on a topic. Use for questions requiring thorough analysis."""
          result = await runner.run(
              input=query,
              model="openai/gpt-5.2",  # Stronger model for research
              instructions="You are a research analyst. Be thorough and cite sources.",
              mcp_servers=["windsor/brave-search-mcp"]  # Web search via Brave Search MCP
          )
          return result.final_output

      async def code_specialist(spec: str) -> str:
          """Generate production code from specifications."""
          result = await runner.run(
              input=spec,
              model="anthropic/claude-opus-4-5",  # Strong at code
              instructions="Write clean, tested, production-ready code."
          )
          return result.final_output

      # Coordinator: cheap model that delegates to specialists
      result = await runner.run(
          input="Research quantum computing breakthroughs in 2025, then write a Python simulator for a basic quantum gate",
          model="openai/gpt-4o-mini",
          tools=[research_specialist, code_specialist]
      )

      print(result.final_output)

  if **name** == "**main**":
  asyncio.run(main())

  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from 'dedalus-labs';
  import { DedalusRunner } from 'dedalus-labs';

  const client = new Dedalus();
  const runner = new DedalusRunner(client);

  // Specialist functions
  async function researchSpecialist(query: string): Promise<string> {
    const result = await runner.run({
      input: query,
      model: 'openai/gpt-4o',
      instructions: 'You are a research analyst. Be thorough.',
      mcpServers: ['windsor/brave-search-mcp'], // Web search via Brave Search MCP
    });
    return result.finalOutput;
  }

  async function codeSpecialist(spec: string): Promise<string> {
    const result = await runner.run({
      input: spec,
      model: 'anthropic/claude-opus-4-5',
      instructions: 'Write clean, production-ready code.',
    });
    return result.finalOutput;
  }

  // Coordinator delegates to specialists
  const result = await runner.run({
    input: 'Research AI trends, then write a TypeScript example',
    model: 'openai/gpt-5.2',
    tools: [researchSpecialist, codeSpecialist],
  });
  ```
</CodeGroup>

**When to use this pattern:**

| Scenario           | Why Agent-as-Tool                                         |
| ------------------ | --------------------------------------------------------- |
| Vision/OCR tasks   | Text-only coordinator delegates images to vision model    |
| Code generation    | Fast model triages, strong model writes code              |
| Domain specialists | Generic router → specialized instructions/model           |
| Cost optimization  | Cheap coordinator, expensive specialists only when needed |

## Model Selection

Tool calling quality varies by model. For reliable multi-step tool use:

<Tip>
  `openai/gpt-5.2` and `openai/gpt-4.1` handle complex tool chains well. Older or smaller models may
  struggle with multi-step reasoning.
</Tip>

## Next steps

* **Combine with MCP servers**: [MCP Servers](/sdk/mcp) — Use local tools for custom logic + hosted tools for external capabilities
* **Return typed data**: [Structured Outputs](/sdk/structured-outputs) — Validate and parse JSON into schemas
* **Control execution**: [Policies](/sdk/policies) — Dynamically modify behavior at runtime
* **See full examples**: [Use Cases](/sdk/use-cases/web-search-agent) — End-to-end agent patterns

<Tip icon="terminal" iconType="regular">
  [Connect these docs programmatically](/contextual/use-these-docs) to Claude, VSCode, and more via
  MCP for real-time answers.
</Tip>

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.dedaluslabs.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Structured Outputs

> Type-safe JSON responses with Pydantic, Zod, or Effect schemas

LLMs generate text. Applications need data structures. Structured outputs bridge this gap—define a schema (Pydantic in Python, Zod or Effect Schema in TypeScript), and the Dedalus SDK ensures responses conform with full type safety.

This is essential for building reliable applications. Instead of parsing free-form text and hoping for the best, you get validated objects that your code can trust.

## Extract typed data

Define a schema. Call `.parse()`. Get validated objects.

<CodeGroup>
  ```python Python (Pydantic) theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv
  from pydantic import BaseModel

  load_dotenv()

  class Event(BaseModel):
      name: str
      city: str
      date: str

  class EventsResponse(BaseModel):
      query: str
      events: list[Event]

  async def main():
      client = AsyncDedalus()

      completion = await client.chat.completions.parse(
          model="openai/gpt-5.2",
          messages=[{
              "role": "user",
              "content": "Return 3 upcoming basketball events near San Francisco as JSON.",
          }],
          response_format=EventsResponse,
      )

      parsed: EventsResponse = completion.choices[0].message.parsed
      print(parsed)

  if __name__ == "__main__":
      asyncio.run(main())
  ```

  ```typescript TypeScript (Zod) theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import { zodResponseFormat } from "dedalus-labs/helpers/zod";
  import { z } from "zod";

  const client = new Dedalus();

  const Event = z.object({
  	name: z.string(),
  	city: z.string(),
  	date: z.string(),
  });

  const EventsResponse = z.object({
  	query: z.string(),
  	events: z.array(Event),
  });

  async function main() {
  	const completion = await client.chat.completions.parse({
  		model: "openai/gpt-5.2",
  		messages: [
  			{
  				role: "user",
  				content: "Return 3 upcoming basketball events near San Francisco as JSON.",
  			},
  		],
  		response_format: zodResponseFormat(EventsResponse, "events_response"),
  	});

  	console.log(completion.choices[0]?.message.parsed);
  }

  main();
  ```
</CodeGroup>

## Advanced

This section is a reference you can skim and come back to. It’s organized as a progression:

1. **Client `.parse()`** (non-streaming, typed output)
2. **Client `.stream()`** (streaming, typed output)
3. **Runner `response_format`** (typed output inside an agent/tool loop)
4. **Schemas & patterns** (optional fields, nested models, enums/unions)
5. **Structured tool calls** (when you need deterministic tool calling)

## Client API (reference)

The client provides three methods for structured outputs:

* **`.parse()`** - Non-streaming with type-safe schemas
* **`.stream()`** - Streaming with type-safe schemas (context manager)
* **`.create()`** - Dict-based schemas only

### TypeScript setup

TypeScript schema helpers are optional peer dependencies. Install the validator you want to use:

```bash  theme={"theme":{"light":"github-light","dark":"github-dark"}}
bun install zod
# or
bun install effect
```

### `.parse()` (non-streaming)

This is the same pattern as the progressive example above, shown again in a more “API-reference” style.

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv
  from pydantic import BaseModel

  load_dotenv()

  class Event(BaseModel):
  name: str
  city: str
  date: str

  class EventsResponse(BaseModel):
  query: str
  events: list[Event]

  async def main():
  client = AsyncDedalus()

      completion = await client.chat.completions.parse(
          model="openai/gpt-5.2",
          messages=[
              {
                  "role": "user",
                  "content": (
                      "Return 3 upcoming basketball events near San Francisco as JSON. "
                      "Use ISO dates (YYYY-MM-DD)."
                  ),
              }
          ],
          response_format=EventsResponse,
          mcp_servers=["windsor/ticketmaster-mcp"],  # Discover events via Ticketmaster
      )

      parsed = completion.choices[0].message.parsed
      print(parsed)

  if **name** == "**main**":
  asyncio.run(main())

  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from 'dedalus-labs';
  import { zodResponseFormat } from 'dedalus-labs/helpers/zod';
  import { z } from 'zod';

  const client = new Dedalus();

  const Event = z.object({
    name: z.string(),
    city: z.string(),
    date: z.string(),
  });

  const EventsResponse = z.object({
    query: z.string(),
    events: z.array(Event),
  });

  async function main() {
    const completion = await client.chat.completions.parse({
      model: 'openai/gpt-5.2',
      messages: [
        {
          role: 'user',
          content:
            'Return 3 upcoming basketball events near San Francisco as JSON. Use ISO dates (YYYY-MM-DD).',
        },
      ],
      response_format: zodResponseFormat(EventsResponse, 'events_response'),
      mcpServers: ['windsor/ticketmaster-mcp'], // Discover events via Ticketmaster
    });

    console.log(completion.choices[0]?.message.parsed);
  }

  main();
  ```
</CodeGroup>

<Accordion title="TypeScript: same example using Effect Schema">
  ```typescript  theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from 'dedalus-labs';
  import { effectResponseFormat } from 'dedalus-labs/helpers/effect';
  import * as Schema from 'effect/Schema';

  const client = new Dedalus();

  const Event = Schema.Struct({
  name: Schema.String,
  city: Schema.String,
  date: Schema.String,
  });

  async function main() {
  const completion = await client.chat.completions.parse({
  model: 'openai/gpt-5.2',
  messages: [
  {
  role: 'user',
  content:
  'Return 3 upcoming basketball events near San Francisco as JSON. Use ISO dates (YYYY-MM-DD).',
  },
  ],
  response_format: effectResponseFormat(
  Schema.Struct({ query: Schema.String, events: Schema.Array(Event) }),
  'events_response',
  ),
  mcpServers: ['windsor/ticketmaster-mcp'],
  });

  console.log(completion.choices[0]?.message.parsed);
  }

  main();

  ```
</Accordion>

### `.stream()` (streaming)

Use this when you want **streaming UX** and a **typed final result**.

<Note>
  Streaming helpers differ by language:

  * **Python**: use `.stream(...)` as a context manager and read typed stream events.
  * **TypeScript**: stream tokens with `create({ stream: true, ... })`, then validate the final JSON with Zod/Effect.
</Note>

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv
  from pydantic import BaseModel

  load_dotenv()

  class Event(BaseModel):
      name: str
      city: str
      date: str

  class EventsResponse(BaseModel):
      query: str
      events: list[Event]

  async def main():
      client = AsyncDedalus()

      # Use context manager for streaming
      async with client.chat.completions.stream(
          model="openai/gpt-5.2",
          messages=[{
              "role": "user",
              "content": (
                  "Return 3 upcoming basketball events near San Francisco as JSON. "
                  "Use ISO dates (YYYY-MM-DD)."
              ),
          }],
          response_format=EventsResponse,
          mcp_servers=["windsor/ticketmaster-mcp"],
      ) as stream:
          # Process events as they arrive
          async for event in stream:
              if event.type == "content.delta":
                  print(event.delta, end="", flush=True)
              elif event.type == "content.done":
                  # Snapshot available at content.done (typed)
                  print(f"\nParsed events: {len(event.parsed.events)}")

          # Get final parsed result
          final = await stream.get_final_completion()
          parsed = final.choices[0].message.parsed
          print(f"\nFinal events: {len(parsed.events)}")

  if __name__ == "__main__":
      asyncio.run(main())
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import { zodResponseFormat } from "dedalus-labs/helpers/zod";
  import { z } from "zod";

  const client = new Dedalus();

  const Event = z.object({
  	name: z.string(),
  	city: z.string(),
  	date: z.string(),
  });

  const EventsResponse = z.object({
  	query: z.string(),
  	events: z.array(Event),
  });

  async function main() {
  	const stream = await client.chat.completions.create({
  		model: "openai/gpt-5.2",
  		messages: [
  			{
  				role: "user",
  				content:
  					"Return 3 upcoming basketball events near San Francisco as JSON. Use ISO dates (YYYY-MM-DD).",
  			},
  		],
  		response_format: zodResponseFormat(EventsResponse, "events_response"),
  		mcpServers: ["windsor/ticketmaster-mcp"], // Discover events via Ticketmaster
  		stream: true,
  	});

  	// Stream output to the user while collecting it for parsing.
  	let text = "";
  	for await (const chunk of stream) {
  		const delta = chunk.choices?.[0]?.delta?.content;
  		if (delta) {
  			process.stdout.write(delta);
  			text += delta;
  		}
  	}

  	// If you need a typed object, parse the final JSON text.
  	// (In production, use robust JSON extraction if your model outputs any extra text.)
  	const parsed = EventsResponse.parse(JSON.parse(text));
  	console.log(`\nParsed events: ${parsed.events.length}`);
  }

  main();
  ```
</CodeGroup>

### Optional Fields

Use `Optional[T]` in Python, `.nullable()` in Zod, or `Schema.NullOr(...)` in Effect for nullable fields:

<Note>
  With OpenAI strict mode, every field must be required. Model “optional” values as nullable.
</Note>

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv
  from pydantic import BaseModel

  load_dotenv()

  class Event(BaseModel):
  name: str
  city: str
  date: str
  price_usd: int | None = None # model unknown as null

  class EventsResponse(BaseModel):
  query: str
  events: list[Event]

  async def main():
  client = AsyncDedalus()

      completion = await client.chat.completions.parse(
          model="openai/gpt-5.2",
          messages=[{
              "role": "user",
              "content": (
                  "Return 3 upcoming basketball events near San Francisco as JSON. "
                  "Include price_usd if known; otherwise null. Use ISO dates (YYYY-MM-DD)."
              ),
          }],
          response_format=EventsResponse,
          mcp_servers=["windsor/ticketmaster-mcp"],
      )

      parsed = completion.choices[0].message.parsed
      for e in parsed.events:
          print(e.name, e.price_usd)

  if **name** == "**main**":
  asyncio.run(main())

  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from 'dedalus-labs';
  import { zodResponseFormat } from 'dedalus-labs/helpers/zod';
  import { z } from 'zod';

  const client = new Dedalus();

  const Event = z.object({
    name: z.string(),
    city: z.string(),
    date: z.string(),
    price_usd: z.number().nullable(),
  });

  const EventsResponse = z.object({
    query: z.string(),
    events: z.array(Event),
  });

  async function main() {
    const completion = await client.chat.completions.parse({
      model: 'openai/gpt-5.2',
      messages: [
        {
          role: 'user',
          content:
            'Return 3 upcoming basketball events near San Francisco as JSON. Include price_usd if known; otherwise null. Use ISO dates (YYYY-MM-DD).',
        },
      ],
      response_format: zodResponseFormat(EventsResponse, 'events_response'),
      mcpServers: ['windsor/ticketmaster-mcp'],
    });

    const parsed = completion.choices[0]?.message.parsed;
    console.log(parsed?.events.map((e) => [e.name, e.price_usd]));
  }

  main();
  ```
</CodeGroup>

<Accordion title="TypeScript (Effect): nullable fields">
  ```typescript  theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import * as Schema from 'effect/Schema';

  const Event = Schema.Struct({
  name: Schema.String,
  city: Schema.String,
  date: Schema.String,
  price_usd: Schema.NullOr(Schema.Number),
  });

  const EventsResponse = Schema.Struct({
  query: Schema.String,
  events: Schema.Array(Event),
  });

  ```

  Avoid `Schema.optional(...)` for structured outputs—use `Schema.NullOr(...)` instead.
</Accordion>

## Schemas & patterns

## Nested Models

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv
  from pydantic import BaseModel

  load_dotenv()

  class Venue(BaseModel):
      name: str
      address: str | None = None
      city: str

  class Event(BaseModel):
      name: str
      date: str
      venue: Venue

  class EventsResponse(BaseModel):
      query: str
      events: list[Event]

  async def main():
      client = AsyncDedalus()

      completion = await client.chat.completions.parse(
          model="openai/gpt-5.2",
          messages=[{
              "role": "user",
              "content": (
                  "Return 3 upcoming basketball events near San Francisco as JSON. "
                  "Each event must include a nested venue object with name, city, and address (null if unknown). "
                  "Use ISO dates (YYYY-MM-DD)."
              )
          }],
          response_format=EventsResponse,
          mcp_servers=["windsor/ticketmaster-mcp"],
      )

      parsed = completion.choices[0].message.parsed
      for e in parsed.events:
          print(e.name, "→", e.venue.name)
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import { zodResponseFormat } from "dedalus-labs/helpers/zod";
  import { z } from "zod";

  const client = new Dedalus();

  const Venue = z.object({
  	name: z.string(),
  	city: z.string(),
  	address: z.string().nullable(),
  });

  const Event = z.object({
  	name: z.string(),
  	date: z.string(),
  	venue: Venue,
  });

  const EventsResponse = z.object({
  	query: z.string(),
  	events: z.array(Event),
  });

  async function main() {
  	const completion = await client.chat.completions.parse({
  		model: "openai/gpt-5.2",
  		messages: [
  			{
  				role: "user",
  				content:
  					"Return 3 upcoming basketball events near San Francisco as JSON. Each event must include a nested venue object with name, city, and address (null if unknown). Use ISO dates (YYYY-MM-DD).",
  			},
  		],
  		response_format: zodResponseFormat(EventsResponse, "events_response"),
  		mcpServers: ["windsor/ticketmaster-mcp"],
  	});

  	const parsed = completion.choices[0]?.message.parsed;
  	console.log(parsed?.events.map((e) => [e.name, e.venue.name]));
  }

  main();
  ```
</CodeGroup>

## Structured Tool Calls (advanced)

Define type-safe tools with automatic argument parsing:

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv
  from pydantic import BaseModel

  load_dotenv()

  class SearchEventsArgs(BaseModel):
  city: str
  month: str
  max_results: int = 5

  async def main():
  client = AsyncDedalus()

      tools = [
          {
              "type": "function",
              "function": {
                  "name": "search_events",
                  "description": "Search for events in a city during a month.",
                  "parameters": {
                      "type": "object",
                      "properties": {
                          "city": {"type": "string"},
                          "month": {"type": "string", "description": "YYYY-MM"},
                          "max_results": {"type": "integer", "default": 5},
                      },
                      "required": ["city", "month"],
                      "additionalProperties": False,
                  },
                  "strict": True,
              }
          }
      ]

      completion = await client.chat.completions.parse(
          model="openai/gpt-5.2",
          messages=[{
              "role": "user",
              "content": "Call search_events for San Francisco in 2026-01.",
          }],
          tools=tools,
          tool_choice={"type": "tool", "name": "search_events"},
      )

      message = completion.choices[0].message
      if message.tool_calls:
          tool_call = message.tool_calls[0]
          print(f"Tool called: {tool_call.function.name}")
          print(f"Parsed args: {tool_call.function.parsed_arguments}")

  if **name** == "**main**":
  asyncio.run(main())

  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from 'dedalus-labs';
  import { zodFunction } from 'dedalus-labs/helpers/zod';
  import { z } from 'zod';

  const client = new Dedalus();

  const SearchEventsTool = zodFunction({
    name: 'search_events',
    parameters: z.object({
      city: z.string(),
      month: z.string(), // YYYY-MM
      max_results: z.number().optional(),
    }),
    description: 'Search for events in a city during a month.',
    function: (args) => {
      // Your tool implementation would go here.
      // For docs, we return a placeholder JSON string.
      return JSON.stringify({
        events: [],
        query: `${args.city} ${args.month}`,
      });
    },
  });

  async function main() {
    const completion = await client.chat.completions.parse({
      model: 'openai/gpt-5.2',
      messages: [{ role: 'user', content: 'Call search_events for San Francisco in 2026-01.' }],
      tools: [SearchEventsTool],
      // Force a deterministic tool call (useful for examples/tests).
      tool_choice: { type: 'tool', name: 'search_events' },
    });

    const toolCall = completion.choices[0]?.message.tool_calls?.[0];
    if (toolCall) {
      console.log(`Tool called: ${toolCall.function.name}`);
      console.log(`Arguments: ${JSON.stringify(toolCall.function.parsed_arguments)}`);
    }
  }

  main();
  ```
</CodeGroup>

<Tip>
  If you need deterministic tool calling, set `tool_choice` to one of the object variants:
  `{ type: 'auto' }` (model decides), `{ type: 'any' }` (require a tool call), `{ type: 'tool', name: 'search_events' }` (require a specific tool), `{ type: 'none' }` (disable tools). Passing the OpenAI string form (e.g. `tool_choice: 'required'`) will fail schema validation with a 422.
</Tip>

<Accordion title="TypeScript: tool parameters with Effect Schema">
  ```typescript  theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import { effectFunction } from 'dedalus-labs/helpers/effect';
  import * as Schema from 'effect/Schema';

  const SearchEventsTool = effectFunction({
  name: 'search_events',
  parameters: Schema.Struct({
  city: Schema.String,
  month: Schema.String, // YYYY-MM
  max_results: Schema.NullOr(Schema.Number),
  }),
  description: 'Search for events in a city during a month.',
  });

  ```

  Tool parameters must be an object schema (use `Schema.Struct({ ... })`).
</Accordion>

## Enums and Unions

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from typing import Literal
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv
  from pydantic import BaseModel

  load_dotenv()

  class Event(BaseModel):
      name: str
      city: str
      date: str
      category: Literal["sports", "music", "theater", "other"]
      ticket_status: Literal["available", "sold_out", "unknown"]

  class EventsResponse(BaseModel):
      query: str
      events: list[Event]

  async def main():
      client = AsyncDedalus()

      completion = await client.chat.completions.parse(
          model="openai/gpt-5.2",
          messages=[{
              "role": "user",
              "content": (
                  "Return 3 upcoming events near San Francisco as JSON. "
                  "Each event must include category (sports/music/theater/other) and ticket_status (available/sold_out/unknown). "
                  "Use ISO dates (YYYY-MM-DD)."
              )
          }],
          response_format=EventsResponse,
          mcp_servers=["windsor/ticketmaster-mcp"],
      )

      parsed = completion.choices[0].message.parsed
      for e in parsed.events:
          print(e.name, e.category, e.ticket_status)

  if __name__ == "__main__":
      asyncio.run(main())
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import { zodResponseFormat } from "dedalus-labs/helpers/zod";
  import { z } from "zod";

  const client = new Dedalus();

  const Event = z.object({
  	name: z.string(),
  	city: z.string(),
  	date: z.string(),
  	category: z.enum(["sports", "music", "theater", "other"]),
  	ticket_status: z.union([z.literal("available"), z.literal("sold_out"), z.literal("unknown")]),
  });

  const EventsResponse = z.object({
  	query: z.string(),
  	events: z.array(Event),
  });

  async function main() {
  	const completion = await client.chat.completions.parse({
  		model: "openai/gpt-5.2",
  		messages: [
  			{
  				role: "user",
  				content:
  					"Return 3 upcoming events near San Francisco as JSON. Each event must include category (sports/music/theater/other) and ticket_status (available/sold_out/unknown). Use ISO dates (YYYY-MM-DD).",
  			},
  		],
  		response_format: zodResponseFormat(EventsResponse, "events_response"),
  		mcpServers: ["windsor/ticketmaster-mcp"],
  	});

  	const parsed = completion.choices[0]?.message.parsed;
  	console.log(parsed?.events.map((e) => [e.name, e.category, e.ticket_status]));
  }

  main();
  ```
</CodeGroup>

## DedalusRunner API

The Runner supports `response_format` with automatic schema conversion:

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio

  from dedalus_labs import AsyncDedalus, DedalusRunner
  from dotenv import load_dotenv
  from pydantic import BaseModel

  load_dotenv()

  class Event(BaseModel):
  name: str
  city: str
  date: str

  class EventsResponse(BaseModel):
  query: str
  events: list[Event]

  def as_bullets(items: list[str]) -> str:
  """Format items as a bulleted list."""
  return "\n".join(f"• {item}" for item in items)

  async def main():
  client = AsyncDedalus()
  runner = DedalusRunner(client)

      result = await runner.run(
          input=(
              "Find me the nearest basketball games in January in San Francisco using Ticketmaster. "
              "Then call as_bullets with a list of items (one per event: name, city, date)."
          ),
          model="anthropic/claude-opus-4-5",
          mcp_servers=["windsor/ticketmaster-mcp"],  # Discover events via Ticketmaster
          tools=[as_bullets],
          response_format=EventsResponse,
          max_steps=5,
      )

      print(result.final_output)

  if **name** == "**main**":
  asyncio.run(main())

  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from 'dedalus-labs';
  import { DedalusRunner } from 'dedalus-labs';

  const client = new Dedalus();

  function asBullets(items: string[]): string {
    return items.map((item) => `• ${item}`).join('\n');
  }

  async function main() {
    const runner = new DedalusRunner(client, true);

    const result = await runner.run({
      model: 'anthropic/claude-opus-4-5',
      input:
        'Find me the nearest basketball games in January in San Francisco using Ticketmaster. Then call asBullets with a list of items (one per event: name, city, date).',
      mcpServers: ['windsor/ticketmaster-mcp'], // Discover events via Ticketmaster
      tools: [asBullets],
      maxSteps: 5,
    });

    console.log((result as any).finalOutput);
  }

  main();
  ```
</CodeGroup>

## .create() vs .parse() vs .stream()

| Method      | Schema Support      | Streaming | Use Case                |
| ----------- | ------------------- | --------- | ----------------------- |
| `.create()` | Dict only           | ✓         | Manual JSON schemas     |
| `.parse()`  | Pydantic/Zod/Effect | ❌         | Type-safe non-streaming |
| `.stream()` | Pydantic/Zod/Effect | ✓         | Type-safe streaming     |

<Note>
  `.create()` expects a plain JSON Schema object. Don’t pass a Pydantic model, Zod schema, or Effect
  schema directly.
</Note>

<Note>
  “Streaming + typed output” is language-dependent: - **Python**: `.stream(...)` yields typed events
  and a typed final snapshot. - **TypeScript**: stream tokens and validate the final JSON with
  Zod/Effect.
</Note>

## Error Handling

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from typing import Any
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv
  from pydantic import BaseModel

  load_dotenv()

  class Event(BaseModel):
  name: str
  city: str
  date: str

  class EventsResponse(BaseModel):
  query: str
  events: list[Event]

  async def main():
  client = AsyncDedalus()

      try:
          completion = await client.chat.completions.parse(
              model="openai/gpt-5.2",
              messages=[{
                  "role": "user",
                  "content": (
                      "Return 3 upcoming basketball events near San Francisco as JSON. "
                      "Use ISO dates (YYYY-MM-DD)."
                  ),
              }],
              response_format=EventsResponse,
          )
          parsed = completion.choices[0].message.parsed
          print(f"Parsed events: {len(parsed.events)}")
      except Exception as e:
          print("Parse failed:", e)

  if **name** == "**main**":
  asyncio.run(main())

  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from 'dedalus-labs';
  import { zodResponseFormat } from 'dedalus-labs/helpers/zod';
  import { z } from 'zod';

  const client = new Dedalus();

  const Event = z.object({
    name: z.string(),
    city: z.string(),
    date: z.string(),
  });

  const EventsResponse = z.object({
    query: z.string(),
    events: z.array(Event),
  });

  async function main() {
    try {
      const completion = await client.chat.completions.parse({
        model: 'openai/gpt-5.2',
        messages: [
          {
            role: 'user',
            content:
              'Return 3 upcoming basketball events near San Francisco as JSON. Use ISO dates (YYYY-MM-DD).',
          },
        ],
        response_format: zodResponseFormat(EventsResponse, 'events_response'),
      });

      const parsed = completion.choices[0]?.message.parsed;
      console.log(`Parsed events: ${parsed?.events.length ?? 0}`);
    } catch (error) {
      console.error('Request failed:', error);
    }
  }

  main();
  ```
</CodeGroup>

## Supported Models

The Dedalus SDK's `.parse()` and `.stream()` methods work across all providers. Schema enforcement varies:

**Strict Enforcement** (CFG-based, schema guarantees):

* ✓ `openai/*` - Context-free grammar compilation
* ✓ `xai/*` - Native schema validation
* ✓ `fireworks_ai/*` - Native schema validation (select models)
* ✓ `deepseek/*` - Native schema validation (select models)

**Best-Effort** (schema sent for guidance, no guarantees):

* 🟡 `google/*` - Schema forwarded to `generationConfig.responseSchema`
* 🟡 `anthropic/*` - Prompt-based JSON generation (\~85-90% success rate)

<Warning>
  For `google/*` and `anthropic/*` models, always validate parsed output and implement retry logic.
</Warning>

## Provider Examples

You can use `.parse()` and `.stream()` with models from any provider. In practice, you only change `model`—everything else stays the same.

For a full list of model IDs, see the [providers guide](/sdk/guides/providers).

## Quick Reference

### Python (Pydantic)

```python  theme={"theme":{"light":"github-light","dark":"github-dark"}}
from dedalus_labs import AsyncDedalus
from pydantic import BaseModel

class MyModel(BaseModel):
    field: str

client = AsyncDedalus()
result = await client.chat.completions.parse(
    model="openai/gpt-5.2",
    messages=[...],
    response_format=MyModel,
)
parsed = result.choices[0].message.parsed
```

### TypeScript (Zod)

```typescript  theme={"theme":{"light":"github-light","dark":"github-dark"}}
import Dedalus from 'dedalus-labs';
import { zodResponseFormat } from 'dedalus-labs/helpers/zod';
import { z } from 'zod';

const MySchema = z.object({ field: z.string() });

const client = new Dedalus();
const result = await client.chat.completions.parse({
  model: 'openai/gpt-5.2',
  messages: [...],
  response_format: zodResponseFormat(MySchema, 'my_schema'),
});
const parsed = result.choices[0]?.message.parsed;
```

### TypeScript (Effect Schema)

```typescript  theme={"theme":{"light":"github-light","dark":"github-dark"}}
import Dedalus from 'dedalus-labs';
import { effectResponseFormat } from 'dedalus-labs/helpers/effect';
import * as Schema from 'effect/Schema';

const MySchema = Schema.Struct({ field: Schema.String });

const client = new Dedalus();
const result = await client.chat.completions.parse({
  model: 'openai/gpt-5.2',
  messages: [...],
  response_format: effectResponseFormat(MySchema, 'my_schema'),
});
const parsed = result.choices[0]?.message.parsed;
```

### Zod Helpers

```typescript  theme={"theme":{"light":"github-light","dark":"github-dark"}}
import { zodResponseFormat, zodFunction } from 'dedalus-labs/helpers/zod';

// For response schemas
zodResponseFormat(MyZodSchema, 'schema_name')

// For tool definitions
zodFunction({
  name: 'tool_name',
  description: 'What the tool does',
  parameters: z.object({ ... }),
  function: (args) => { ... },
})
```

### Effect Helpers

```typescript  theme={"theme":{"light":"github-light","dark":"github-dark"}}
import { effectResponseFormat, effectFunction } from 'dedalus-labs/helpers/effect';

// For response schemas
effectResponseFormat(MyEffectSchema, 'schema_name')

// For tool definitions
effectFunction({
  name: 'tool_name',
  description: 'What the tool does',
  parameters: MyEffectParametersSchema,
  function: (args) => { ... },
})
```

<Accordion title="Using @effect/schema (deprecated upstream)">
  If you still use `@effect/schema`, schemas from `@effect/schema/Schema` also work with `helpers/effect`.

  You still need to install `effect` (the Dedalus SDK uses `effect/JSONSchema` and `effect/Schema` for conversion + validation).

  Prefer `effect/Schema` for new code.
</Accordion>

## Next steps

* **Stream output**: [Streaming](/sdk/streaming) — Improve UX for long tool/MCP runs
* **Route across models**: [Handoffs](/sdk/handoffs) — Use fast/strong models by phase
* **See patterns**: [Use Cases](/sdk/use-cases/data-analyst) — Structured extraction workflows

<Tip icon="terminal" iconType="regular">
  [Connect these docs programmatically](/contextual/use-these-docs) to Claude, VSCode, and more via
  MCP for real-time answers.
</Tip>
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.dedaluslabs.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Streaming

> Display responses as they're generated

Streaming shows output token-by-token instead of waiting for the complete response. Users see progress immediately, which matters for longer outputs or interactive applications.

## Stream in one line

Set `stream=True` so users see progress as the agent works.

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus, DedalusRunner
  from dedalus_labs.utils.stream import stream_async
  from dotenv import load_dotenv

  load_dotenv()

  async def main():
      client = AsyncDedalus()
      runner = DedalusRunner(client)

      stream = runner.run(
          input="Find me the nearest basketball games in January in San Francisco (stream your work).",
          model="anthropic/claude-opus-4-5",
          mcp_servers=["windsor/ticketmaster-mcp"],  # Discover events via Ticketmaster
          stream=True,
      )

      await stream_async(stream)

  if __name__ == "__main__":
      asyncio.run(main())
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import { DedalusRunner } from "dedalus-labs";

  const client = new Dedalus();
  const runner = new DedalusRunner(client, true);

  async function main() {
  	const result = await runner.run({
  		input: "Find me the nearest basketball games in January in San Francisco (stream your work).",
  		model: "anthropic/claude-opus-4-5",
  		mcpServers: ["windsor/ticketmaster-mcp"], // Discover events via Ticketmaster
  		stream: true,
  	});

  	if (Symbol.asyncIterator in result) {
  		for await (const chunk of result) {
  			if (chunk.choices?.[0]?.delta?.content) {
  				process.stdout.write(chunk.choices[0].delta.content);
  			}
  		}
  	}
  }

  main();
  ```
</CodeGroup>

## Streaming with Tools

Streaming works with tool-calling workflows. You can stream while the agent calls **local tools**, **MCPs**, or both.

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio

  from dedalus_labs import AsyncDedalus, DedalusRunner
  from dedalus_labs.utils.stream import stream_async
  from dotenv import load_dotenv

  load_dotenv()

  def summarize_headlines(headlines: list[str]) -> str:
      """Format headlines as a short bullet list."""
      return "\n".join(f"• {h}" for h in headlines[:3])

  async def main():
      client = AsyncDedalus()
      runner = DedalusRunner(client)

      stream = runner.run(
          input=(
              "Search for AI news. Extract 3 headlines. "
              "Then call summarize_headlines(headlines) and stream your final answer."
          ),
          model="openai/gpt-5.2",
          mcp_servers=["windsor/brave-search-mcp"],  # Web search via Brave Search MCP
          tools=[summarize_headlines],
          stream=True,
      )

      await stream_async(stream)

  if __name__ == "__main__":
      asyncio.run(main())
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import { DedalusRunner } from "dedalus-labs";

  function summarizeHeadlines(headlines: string[]): string {
  	return headlines
  		.slice(0, 3)
  		.map((h) => `• ${h}`)
  		.join("\n");
  }

  const client = new Dedalus();
  const runner = new DedalusRunner(client, true);

  async function main() {
  	const result = await runner.run({
  		input:
  			"Search for AI news. Extract 3 headlines. Then call summarizeHeadlines(headlines) and stream your final answer.",
  		model: "openai/gpt-5.2",
  		mcpServers: ["windsor/brave-search-mcp"], // Web search via Brave Search MCP
  		tools: [summarizeHeadlines],
  		stream: true,
  	});

  	if (Symbol.asyncIterator in result) {
  		for await (const chunk of result) {
  			if (chunk.choices?.[0]?.delta?.content) {
  				process.stdout.write(chunk.choices[0].delta.content);
  			}
  		}
  	}
  }

  main();
  ```
</CodeGroup>

## Compare: non-streaming vs streaming (same scenario)

The scenario below is the same in both snippets. The only difference is whether you set `stream=True` **and iterate over the stream**.

<Note>
  In Python, **non-streaming** refers to `stream=False`, not “sync”. If you use `AsyncDedalus`,
  you’ll still write async code and use `asyncio.run(...)`. If you prefer fully synchronous code,
  use the `Dedalus` client (example below).
</Note>

### Python

<CodeGroup>
  ```python Non-streaming (AsyncDedalus) theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus, DedalusRunner
  from dotenv import load_dotenv

  load_dotenv()

  async def main():
      client = AsyncDedalus()
      runner = DedalusRunner(client)

      result = await runner.run(
          input="Find me the nearest basketball games in January in San Francisco.",
          model="anthropic/claude-opus-4-5",
          mcp_servers=["windsor/ticketmaster-mcp"],  # Discover events via Ticketmaster
      )

      # You only see output after the full run completes.
      print(result.final_output)

  if __name__ == "__main__":
      asyncio.run(main())
  ```

  ```python Streaming (AsyncDedalus) theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus, DedalusRunner
  from dedalus_labs.utils.stream import stream_async
  from dotenv import load_dotenv

  load_dotenv()

  async def main():
      client = AsyncDedalus()
      runner = DedalusRunner(client)

      stream = runner.run(
          input="Find me the nearest basketball games in January in San Francisco.",
          model="anthropic/claude-opus-4-5",
          mcp_servers=["windsor/ticketmaster-mcp"],  # Discover events via Ticketmaster
          stream=True,
      )

      # You see output as the model generates it.
      await stream_async(stream)

  if __name__ == "__main__":
      asyncio.run(main())
  ```
</CodeGroup>

### Python (sync client)

<CodeGroup>
  ```python Non-streaming (Dedalus) theme={"theme":{"light":"github-light","dark":"github-dark"}}
  from dedalus_labs import Dedalus, DedalusRunner
  from dotenv import load_dotenv

  load_dotenv()

  def main():
      client = Dedalus()
      runner = DedalusRunner(client)

      result = runner.run(
          input="Find me the nearest basketball games in January in San Francisco.",
          model="anthropic/claude-opus-4-5",
          mcp_servers=["windsor/ticketmaster-mcp"],  # Discover events via Ticketmaster
      )

      print(result.final_output)

  if __name__ == "__main__":
      main()
  ```

  ```python Streaming (Dedalus) theme={"theme":{"light":"github-light","dark":"github-dark"}}
  from dedalus_labs import Dedalus, DedalusRunner
  from dedalus_labs.utils.stream import stream_sync
  from dotenv import load_dotenv

  load_dotenv()

  def main():
      client = Dedalus()
      runner = DedalusRunner(client)

      stream = runner.run(
          input="Find me the nearest basketball games in January in San Francisco.",
          model="anthropic/claude-opus-4-5",
          mcp_servers=["windsor/ticketmaster-mcp"],  # Discover events via Ticketmaster
          stream=True,
      )

      stream_sync(stream)

  if __name__ == "__main__":
      main()
  ```
</CodeGroup>

### TypeScript

<CodeGroup>
  ```typescript Non-streaming theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import { DedalusRunner } from "dedalus-labs";

  const client = new Dedalus();
  const runner = new DedalusRunner(client, true);

  async function main() {
  	const result = await runner.run({
  		input: "Find me the nearest basketball games in January in San Francisco.",
  		model: "anthropic/claude-opus-4-5",
  		mcpServers: ["windsor/ticketmaster-mcp"], // Discover events via Ticketmaster
  	});

  	console.log((result as any).finalOutput);
  }

  main();
  ```

  ```typescript Streaming theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import { DedalusRunner } from "dedalus-labs";

  const client = new Dedalus();
  const runner = new DedalusRunner(client, true);

  async function main() {
  	const result = await runner.run({
  		input: "Find me the nearest basketball games in January in San Francisco.",
  		model: "anthropic/claude-opus-4-5",
  		mcpServers: ["windsor/ticketmaster-mcp"], // Discover events via Ticketmaster
  		stream: true,
  	});

  	if (Symbol.asyncIterator in result) {
  		for await (const chunk of result) {
  			if (chunk.choices?.[0]?.delta?.content) {
  				process.stdout.write(chunk.choices[0].delta.content);
  			}
  		}
  	}
  }

  main();
  ```
</CodeGroup>

## How the user experience differs

* **Progressive rendering**: you can display text as it arrives (“typing”), instead of waiting for a complete response.
* **Visible work**: in tool/MCP workflows, you can show status updates (e.g., “Searching Ticketmaster…”) while the agent is calling tools.
* **Interruptibility**: you can stop early (client-side) if the user already has what they need, instead of paying for a full completion.

## When to Stream

Stream when:

* Building chat interfaces where perceived latency matters
* Generating long-form content (articles, code, analysis)
* Running in terminals or logs where progress feedback helps

Don’t stream when:

* You need to parse the complete response before displaying
* Using structured outputs with `.parse()`
* Response time is already fast enough

## Next steps

* **Route across models**: [Handoffs](/sdk/handoffs) — Use fast/strong models by phase
* **Add images last**: [Images & Vision](/sdk/images) — Add multimodality when your text workflow is solid
* **See patterns**: [Use Cases](/sdk/use-cases/web-search-agent) — More streaming agent examples

<Tip>
  [Connect these docs programmatically](/contextual/use-these-docs) to Claude, VSCode, and more via
  MCP for real-time answers.
</Tip>
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.dedaluslabs.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Handoffs

> Route tasks to different models based on their strengths

Different models excel at different tasks. GPT handles reasoning and tool use well. Claude writes better prose. Specialized models exist for code, math, and domain-specific work. Handoffs let agents route subtasks to the right model.

If you’ve already built an MCP + tools workflow, handoffs let you keep a fast “coordinator” model most of the time and route to stronger models only when needed.

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus, DedalusRunner
  from dotenv import load_dotenv

  load_dotenv()

  async def main():
  client = AsyncDedalus()
  runner = DedalusRunner(client)

      result = await runner.run(
          input=(
              "Find me the nearest basketball games in January in San Francisco, then write a concise plan for attending."
          ),
          model=["openai/gpt-5.2", "anthropic/claude-opus-4-5"],
          mcp_servers=["windsor/ticketmaster-mcp"],  # Discover events via Ticketmaster
      )

      print(result.final_output)

  if **name** == "**main**":
  asyncio.run(main())

  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from 'dedalus-labs';
  import { DedalusRunner } from 'dedalus-labs';

  const client = new Dedalus();
  const runner = new DedalusRunner(client);

  async function main() {
    const result = await runner.run({
      input:
        'Find me the nearest basketball games in January in San Francisco, then write a concise plan for attending.',
      model: ['openai/gpt-5.2', 'anthropic/claude-opus-4-5'],
      mcpServers: ['windsor/ticketmaster-mcp'], // Discover events via Ticketmaster
    });

    console.log((result as any).finalOutput);
  }

  main();
  ```
</CodeGroup>

## When to Use Handoffs

Handoffs shine when a task has distinct phases requiring different capabilities:

* **Research → Writing**: GPT gathers information, Claude writes the final piece
* **Analysis → Code**: A reasoning model plans the approach, a code model implements it
* **Triage → Specialist**: A general model routes to domain-specific models

For simple tasks where one model handles everything, stick to a single model.

## Model Strengths

A rough guide to model selection:

| Task                    | Good Models                                       |
| ----------------------- | ------------------------------------------------- |
| Tool calling, reasoning | `openai/gpt-5.2`, `xai/grok-4-1-fast-reasoning`   |
| Writing, creative work  | `anthropic/claude-opus-4-5`                       |
| Code generation         | `anthropic/claude-opus-4-5`, `openai/gpt-5-codex` |
| Fast, cheap responses   | `gpt-5-mini`                                      |

## Next steps

* **Add multimodality**: [Images & Vision](/sdk/images) — Add image generation/vision to your workflow
* **See workflows**: [Use Cases](/sdk/use-cases/data-analyst) — Multi-capability patterns

<Tip icon="terminal" iconType="regular">
  [Connect these docs programmatically](/contextual/use-these-docs) to Claude, VSCode, and more via
  MCP for real-time answers.
</Tip>
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.dedaluslabs.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Images & Vision

> Generate, edit, and analyze images

Generate images with DALL-E, create variations, apply edits, and analyze images with vision models. All through the same unified client.

<Tip>
  For image generation, use `openai/dall-e-3` for best quality. For vision tasks, `openai/gpt-5.2`
  provides excellent performance.
</Tip>

## Progressive example: add images to your workflow

If you’ve already built a text-based agent (Chat → Tools → MCP → Streaming), images are usually the next capability you add:

1. **Generate** an image from a prompt
2. **Edit / vary** an existing image
3. **Analyze** an image with a vision model

The sections below start with the simplest call (generation), then layer on editing and vision.

## Image Generation

Generate images from text prompts using DALL-E models.

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv

  load_dotenv()

  async def generate_image():
      """Generate image from text."""
      client = AsyncDedalus()
      response = await client.images.generate(
          prompt="Dedalus flying through clouds",
          model="openai/dall-e-3",
      )
      print(response.data[0].url)

  if __name__ == "__main__":
      asyncio.run(generate_image())
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import * as dotenv from "dotenv";

  dotenv.config();

  async function generateImage() {
  	const client = new Dedalus();
  	const response = await client.images.generate({
  		prompt: "Dedalus flying through clouds",
  		model: "openai/dall-e-3",
  	});
  	console.log(response.data[0].url);
  }

  generateImage();
  ```
</CodeGroup>

## Image Editing

Edit existing images by providing a source image, mask, and prompt describing desired changes.

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  import httpx
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv

  load_dotenv()

  async def edit_image():
      """Edit image (using generated image as both source and mask)."""

      client = AsyncDedalus()

      # Generate a test image (DALL·E output is valid RGBA PNG)
      gen_response = await client.images.generate(
          prompt="A white cat on a cushion",
          model="openai/dall-e-2",
          size="512x512",
      )

      # Download generated image
      async with httpx.AsyncClient() as http:
          img_data = await http.get(gen_response.data[0].url)
          img_bytes = img_data.content

      # Use same image as both source and mask (just testing endpoint works)
      response = await client.images.edit(
          image=img_bytes,
          mask=img_bytes,
          prompt="A white cat with sunglasses",
          model="openai/dall-e-2",
      )
      print(response.data[0].url)

  if __name__ == "__main__":
      asyncio.run(edit_image())
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus, { toFile } from "dedalus-labs";
  import * as dotenv from "dotenv";

  dotenv.config();

  async function editImage() {
  	const client = new Dedalus();

  	// Generate a test image (DALL·E output is valid RGBA PNG)
  	const genResponse = await client.images.generate({
  		prompt: "A white cat on a cushion",
  		model: "openai/dall-e-2",
  		size: "512x512",
  	});

  	// Download generated image
  	const imageUrl = genResponse.data[0].url;
  	if (!imageUrl) throw new Error("No image URL returned");
  	const imageResponse = await fetch(imageUrl);
  	const imgBytes = Buffer.from(await imageResponse.arrayBuffer());

  	// Use same image as both source and mask (just testing endpoint works)
  	const response = await client.images.edit({
  		image: await toFile(imgBytes, "source.png"),
  		mask: await toFile(imgBytes, "mask.png"),
  		prompt: "A white cat with sunglasses",
  		model: "openai/dall-e-2",
  	});
  	console.log(response.data[0].url);
  }

  editImage();
  ```
</CodeGroup>

## Image Variations

Create variations of an existing image.

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from pathlib import Path
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv

  load_dotenv()

  async def create_variations():
      """Create image variations."""
      client = AsyncDedalus()

      image_path = Path("image.png")
      if not image_path.exists():
          print("Skipped: image.png not found")
          return

      response = await client.images.create_variation(
          image=image_path.read_bytes(),
          model="openai/dall-e-2",
          n=2,
      )
      for img in response.data:
          print(img.url)

  if __name__ == "__main__":
      asyncio.run(create_variations())
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus, { toFile } from "dedalus-labs";
  import * as fs from "fs";
  import * as path from "path";
  import * as dotenv from "dotenv";

  dotenv.config();

  async function createVariations() {
  	const client = new Dedalus();

  	const imagePath = path.join(process.cwd(), "image.png");
  	if (!fs.existsSync(imagePath)) {
  		console.log("Skipped: image.png not found");
  		return;
  	}

  	const response = await client.images.createVariation({
  		image: await toFile(fs.readFileSync(imagePath), "image.png"),
  		model: "openai/dall-e-2",
  		n: 2,
  	});
  	for (const img of response.data) {
  		console.log(img.url);
  	}
  }

  createVariations();
  ```
</CodeGroup>

## Vision: Analyze Images from URL

Use vision models to analyze and describe images from URLs.

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv

  load_dotenv()

  async def vision_url():
      """Analyze image from URL."""
      client = AsyncDedalus()
      completion = await client.chat.completions.create(
          model="openai/gpt-5.2",
          messages=[
              {
                  "role": "user",
                  "content": [
                      {"type": "text", "text": "What's in this image?"},
                      {
                          "type": "image_url",
                          "image_url": {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"},
                      },
                  ],
              }
          ],
      )
      print(completion.choices[0].message.content)

  if __name__ == "__main__":
      asyncio.run(vision_url())
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import * as dotenv from "dotenv";

  dotenv.config();

  async function visionUrl() {
  	const client = new Dedalus();
  	const completion = await client.chat.completions.create({
  		model: "openai/gpt-5.2",
  		messages: [
  			{
  				role: "user",
  				content: [
  					{ type: "text", text: "What's in this image?" },
  					{
  						type: "image_url",
  						image_url: {
  							url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
  						},
  					},
  				],
  			},
  		],
  	});
  	console.log(completion.choices[0].message.content);
  }

  visionUrl();
  ```
</CodeGroup>

## Vision: Analyze Local Images with Base64

Analyze local images by encoding them as base64.

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  import base64
  from pathlib import Path
  from dedalus_labs import AsyncDedalus
  from dotenv import load_dotenv

  load_dotenv()

  async def vision_base64():
      """Analyze local image via base64."""
      client = AsyncDedalus()

      image_path = Path("image.png")
      if not image_path.exists():
          print("Skipped: image.png not found")
          return

      b64 = base64.b64encode(image_path.read_bytes()).decode()
      completion = await client.chat.completions.create(
          model="openai/gpt-5.2",
          messages=[
              {
                  "role": "user",
                  "content": [
                      {"type": "text", "text": "Describe this image."},
                      {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                  ],
              }
          ],
      )
      print(completion.choices[0].message.content)

  if __name__ == "__main__":
      asyncio.run(vision_base64())
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus from "dedalus-labs";
  import * as fs from "fs";
  import * as path from "path";
  import * as dotenv from "dotenv";

  dotenv.config();

  async function visionBase64() {
  	const client = new Dedalus();

  	const imagePath = path.join(process.cwd(), "image.png");
  	if (!fs.existsSync(imagePath)) {
  		console.log("Skipped: image.png not found");
  		return;
  	}

  	const b64 = fs.readFileSync(imagePath).toString("base64");
  	const completion = await client.chat.completions.create({
  		model: "openai/gpt-5.2",
  		messages: [
  			{
  				role: "user",
  				content: [
  					{ type: "text", text: "Describe this image." },
  					{ type: "image_url", image_url: { url: `data:image/jpeg;base64,${b64}` } },
  				],
  			},
  		],
  	});
  	console.log(completion.choices[0].message.content);
  }

  visionBase64();
  ```
</CodeGroup>

## Advanced: Image Orchestration with DedalusRunner

Create complex image workflows by combining generation, editing, and vision capabilities using DedalusRunner.

```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
import asyncio
import httpx
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv

load_dotenv()

class ImageToolSuite:
    """Helper that exposes image endpoints as DedalusRunner tools."""

    def __init__(self, client: AsyncDedalus):
        self._client = client

    async def generate_concept_art(
        self,
        prompt: str,
        model: str = "openai/dall-e-3",
        size: str = "1024x1024",
    ) -> str:
        """Create concept art and return the hosted image URL."""
        response = await self._client.images.generate(
            prompt=prompt,
            model=model,
            size=size,
        )
        return response.data[0].url

    async def edit_concept_art(
        self,
        prompt: str,
        reference_url: str,
        mask_url: str | None = None,
        model: str = "openai/dall-e-2",
    ) -> str:
        """Apply edits to the referenced image URL and return a new URL."""

        if not reference_url:
            raise ValueError("reference_url must be provided when editing an image.")

        async with httpx.AsyncClient() as http:
            base_image = await http.get(reference_url)
            mask_bytes = await http.get(mask_url) if mask_url else None

        edit_kwargs = {
            "image": base_image.content,
            "prompt": prompt,
            "model": model,
        }
        if mask_bytes:
            edit_kwargs["mask"] = mask_bytes.content

        response = await self._client.images.edit(**edit_kwargs)
        return response.data[0].url

    async def describe_image(
        self,
        image_url: str,
        question: str = "Describe this image.",
        model: str = "openai/gpt-5.2",
    ) -> str:
        """Run a lightweight vision pass against an existing image URL."""
        completion = await self._client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": question},
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            ],
        )
        return completion.choices[0].message.content

async def runner_storyboard():
    """Demonstrate DedalusRunner + agent-as-tool pattern for image workflows."""

    client = AsyncDedalus()
    runner = DedalusRunner(client, verbose=True)
    image_tools = ImageToolSuite(client)

    instructions = (
        "You are a creative director. Use the provided tools to generate concept art, "
        "optionally refine it, and then describe the final render. Always keep the "
        "main conversation on a text model and rely on the tools for image work."
    )

    result = await runner.run(
        instructions=instructions,
        input="Create a retro Dedalus mission patch, refine it with a neon palette, and describe it.",
        model="openai/gpt-5.2",
        tools=[
            image_tools.generate_concept_art,
            image_tools.edit_concept_art,
            image_tools.describe_image,
        ],
        max_steps=4,
        verbose=True,
        debug=False,
    )

    print("Runner final output:", result.final_output)
    print("Tools invoked:", result.tools_called)

if __name__ == "__main__":
    asyncio.run(runner_storyboard())
```

## Next steps

* **See end-to-end agents**: [Use Cases](/sdk/use-cases/data-analyst) — Multimodal patterns
* **Deploy your own MCP server**: [MCP quickstart](/dmcp/quickstart) — Host your own tools for your agent
* **Build a chat server**: [Cookbook: Chat server](/sdk/cookbook/chat-server) — Serve your agent in production

<Tip>
  [Connect these docs programmatically](/contextual/use-these-docs) to Claude, VSCode, and more via
  MCP for real-time answers.
</Tip>
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.dedaluslabs.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Web Search Agent

> Create a web search agent using multiple search MCPs to find and analyze information from the web.

<CodeGroup>
  ```python Python theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import asyncio
  from dedalus_labs import AsyncDedalus, DedalusRunner
  from dotenv import load_dotenv

  load_dotenv()

  async def main():
      client = AsyncDedalus()
      runner = DedalusRunner(client)

      result = await runner.run(
          input="""I need to research the latest developments in AI agents for 2024.
          Please help me:
          1. Find recent news articles about AI agent breakthroughs
          2. Search for academic papers on multi-agent systems
          3. Look up startup companies working on AI agents
          4. Find GitHub repositories with popular agent frameworks
          5. Summarize the key trends and provide relevant links

          Focus on developments from the past 6 months.""",
          model="openai/gpt-4.1",
          mcp_servers=[
              "tsion/exa",        # Semantic search engine
              "windsor/brave-search-mcp"  # Privacy-focused web search
          ]
      )

      print(f"Web Search Results:\n{result.final_output}")

  if __name__ == "__main__":
      asyncio.run(main())
  ```

  ```typescript TypeScript theme={"theme":{"light":"github-light","dark":"github-dark"}}
  import Dedalus, { DedalusRunner } from "dedalus-labs";
  import * as dotenv from "dotenv";

  dotenv.config();

  async function main() {
  	const client = new Dedalus({
  		apiKey: process.env.DEDALUS_API_KEY,
  	});

  	const runner = new DedalusRunner(client);

  	const result = await runner.run({
  		input: `I need to research the latest developments in AI agents for 2024.
      Please help me:
      1. Find recent news articles about AI agent breakthroughs
      2. Search for academic papers on multi-agent systems
      3. Look up startup companies working on AI agents
      4. Find GitHub repositories with popular agent frameworks
      5. Summarize the key trends and provide relevant links

      Focus on developments from the past 6 months.`,
  		model: "openai/gpt-4.1",
  		mcpServers: [
  			"tsion/exa", // Semantic search engine
  			"windsor/brave-search-mcp", // Privacy-focused web search
  		],
  	});

  	console.log(`Web Search Results:\n${result.finalOutput}`);
  }

  main();
  ```
</CodeGroup>

<Tip>
  This example uses multiple search MCP servers:

  * **Exa MCP** (`tsion/exa`): Semantic search, great for finding conceptually related content
  * **Brave Search MCP** (`windsor/brave-search-mcp`): Privacy-focused web search for current events and specific queries

  Together, they cover more ground than either alone—Exa finds related ideas while Brave handles current events.
</Tip>

