# Verified API Reference — Calex Backend

All methods below are verified from official documentation as of March 2025.

---

## 1. AgentMail (Python SDK)

```bash
pip install agentmail python-dotenv
```

```python
from agentmail import AgentMail

client = AgentMail(api_key="am_us_...")

# Create inbox (default @agentmail.to domain)
inbox = client.inboxes.create()
# inbox has: inbox.address, inbox.id, etc.

# Send email
client.inboxes.messages.send(
    inbox_id="your-email@agentmail.to",
    to="recipient@example.com",
    subject="Hello",
    text="Body text"
)
```

Env var: `AGENT_MAIL_API`

---

## 2. Supermemory (Python SDK)

```bash
pip install supermemory
```

```python
from supermemory import Supermemory

client = Supermemory(api_key="sm_...")

# Add memory (scoped by container_tags)
client.add(
    content="Some knowledge text",
    container_tags=["company_123"],
    metadata={"source": "website", "category": "docs"}
)

# Search memories
response = client.search.documents(
    q="how to install",
    container_tags=["company_123"]
)
# response.results -> list of results

# Search with filters
results = client.search.documents(
    q="query",
    container_tags=["company_123"],
    filters={"AND": [{"key": "category", "value": "docs"}]}
)

# Get user/company profile
profile = client.profile(container_tag="company_123")
# profile.profile.static, profile.profile.dynamic

# List documents
docs = client.documents.list(container_tags=["company_123"], limit=10)

# Delete document
client.documents.delete(doc_id="doc_123")
```

Env var: `SUPERMEMORY_API_KEY`

---

## 3. Browser Use (Python SDK)

```bash
pip install browser-use-sdk
```

```python
import asyncio
from browser_use_sdk import AsyncBrowserUse

client = AsyncBrowserUse()  # reads BROWSER_USE_API_KEY from env

# Run a task (blocks until complete)
result = await client.run("Navigate to example.com and extract main content")
print(result.output)

# Structured output
from pydantic import BaseModel

class PageContent(BaseModel):
    title: str
    summary: str
    links: list[str]

result = await client.run(
    "Extract content from example.com",
    output_schema=PageContent
)
# result.output is a PageContent instance
```

Env var: `BROWSER_USE_API_KEY`

---

## 4. Vapi (REST API)

Base URL: `https://api.vapi.ai`
Auth header: `Authorization: Bearer {VAPI_API_KEY}`

### Create Assistant
```
POST https://api.vapi.ai/assistant
{
  "name": "Calex - CompanyName",
  "model": {
    "provider": "openai",
    "model": "gpt-4o",
    "temperature": 0.4,
    "systemPrompt": "You are Calex, a DevRel agent for {company}..."
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "rachel"
  },
  "firstMessage": "Hi! I'm Calex...",
  "serverUrl": "https://your-server/api/vapi/webhook"
}
Response: { "id": "assistant_id", ... }
```

### Create Free US Phone Number
```
POST https://api.vapi.ai/phone-number
{
  "assistantId": "assistant_id"
}
Response: { "id": "phone_id", "number": "+1234567890", ... }
```

### Place Outbound Call
```
POST https://api.vapi.ai/call
{
  "assistantId": "assistant_id",
  "phoneNumberId": "phone_id",
  "customer": { "number": "+1234567890" }
}
```

### Inbound Calls
Assign `assistantId` to a phone number. When someone calls that number, Vapi uses that assistant automatically.

Up to 10 free US phone numbers per account.

Env var: `VAPI_API_KEY`

---

## 5. MiniMax TTS (REST HTTP API)

```
POST https://api.minimax.io/v1/t2a_v2
Authorization: Bearer {MINI_MAX_API_KEY}
Content-Type: application/json

{
  "model": "speech-2.8-hd",
  "text": "Hello, welcome to our docs!",
  "stream": false,
  "output_format": "url",
  "language_boost": "English",
  "voice_setting": {
    "voice_id": "English_expressive_narrator",
    "speed": 1,
    "vol": 1,
    "pitch": 0
  },
  "audio_setting": {
    "sample_rate": 32000,
    "bitrate": 128000,
    "format": "mp3",
    "channel": 1
  }
}

Response (output_format="url"):
{
  "data": {
    "audio": "https://...",  // URL valid 24h
    "status": 2
  },
  "extra_info": {
    "audio_length": 5000,
    "audio_sample_rate": 32000,
    "usage_characters": 35,
    "audio_format": "mp3"
  },
  "base_resp": { "status_code": 0, "status_msg": "success" }
}

Response (output_format="hex"):
{
  "data": {
    "audio": "<hex encoded audio bytes>",
    "status": 2
  }
}
```

Models: speech-2.8-hd (best), speech-2.8-turbo (fast), speech-02-hd, speech-02-turbo
Voice IDs: "English_expressive_narrator" and others
Max 10,000 chars per request.

Env var: `MINI_MAX_API_KEY`

---

## 6. OpenAI (Python SDK)

```bash
pip install openai
```

```python
from openai import OpenAI

client = OpenAI(api_key="sk-...")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "system", "content": "..."}, {"role": "user", "content": "..."}],
    temperature=0.3,
    response_format={"type": "json_object"}
)
answer = response.choices[0].message.content
```

Env var: `OPENAI_API_KEY`
