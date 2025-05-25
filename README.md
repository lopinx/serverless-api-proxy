<div align="right">
   <a href="README_CN.md">中文</a> | <strong>English</strong>
</div>
<div align="center">
<h1>Serverless API Proxy</h1>
<p>Serverless API Proxy: Multi-API Proxy Gateway Based on Vercel Routes, Cloudflare Workers, and Netlify Redirects</p>
</div>
<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/lopinx/serverless-api-proxy)](https://github.com/lopinx/serverless-api-proxy/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/lopinx/serverless-api-proxy)](https://github.com/lopinx/serverless-api-proxy/network/members)
[![GitHub issues](https://img.shields.io/github/issues/lopinx/serverless-api-proxy)](https://github.com/lopinx/serverless-api-proxy/issues)
[![GitHub license](https://img.shields.io/github/license/lopinx/serverless-api-proxy)](https://github.com/lopinx/serverless-api-proxy/blob/main/LICENSE)

</div>

## Demo

<div align="center">

![image](https://github.com/user-attachments/assets/00d2a2f1-676c-4524-a541-1692f61d164e 'Demo')

</div>

## Notice

**Due to login restrictions on the original account([lopins](https://github.com/lopins)), I'm now using this account([lopinx](https://github.com/lopinx)) for maintenance purposes.**

## Support

- openai、gemini、claude、xAI、groq、llama and so on...

## How to deploy

### Cloudflare

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/lopinx/serverless-api-proxy)

**Environment Variables List**

| Variable Name      | Type       | Required/Optional | Description                                                      | Example Value/Format                                                                                   | Security Recommendations                                                                                   |
| ------------------ | ---------- | ----------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **ADMIN_USERNAME** | String     | Required          | Admin dashboard login username                                   | `admin` (strongly recommend changing)                                                                  | Use a strong username and avoid default values                                                             |
| **ADMIN_PASSWORD** | Secret     | Required          | Admin dashboard login password                                   | `admin` (strongly recommend changing to a strong password)                                             | Encrypt storage and use complex character combinations                                                     |
| **SESSION_SECRET** | Secret     | Required          | Session cookie signing secret                                    | `$qA,.3!_I1^0AQ5rZm3!z-S3^(IgF$A8` (default value, must be changed in production)                      | Generate a long random string and encrypt it                                                               |
| **API_ENDPOINTS**  | JSON/Array | Optional          | Static API endpoint configuration (used if KV is not configured) | `[["/openai", "https://api.openai.com/v1"], ["/gemini", "https://generativelanguage.googleapis.com"]]` | Mutually exclusive with KV configuration. Static configurations cannot be modified via the admin dashboard |

**KV Namespace Binding Variables**

| Variable Name     | Type         | Required/Optional | Description                                                                  | Associated Step                                                                       |
| ----------------- | ------------ | ----------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **API_ENDPOINTS** | KV Reference | Optional          | Bind to Cloudflare KV Namespace to store dynamic API endpoint configurations | Bind to the `Namespace Name` of KV Namespace (must match `env.API_ENDPOINTS` in code) |

### Vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lopinx/serverless-api-proxy)

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/lopinx/serverless-api-proxy)

## How to use

### Configure proxy address

| Provider         | Identifier       | API Endpoint                                                              | Documentation Link                                                                                                    | Compatibility                                              |
| ---------------- | ---------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Amazon Bedrock   | aws-bedrock      | https://bedrock-runtime.us-east-1.amazonaws.com                           | [docs](https://docs.aws.amazon.com/zh_cn/bedrock/latest/userguide/what-is-bedrock.html)                               | Non OpenAI Compatible                                      |
| Anthropic        | anthropic        | https://api.anthropic.com/v1                                              | [docs](https://docs.anthropic.com/en/api/openai-sdk)                                                                  | OpenAI Compatible                                          |
| Azure OpenAI     | azure-openai     | https://{RESOURCE_NAME}.openai.azure.com                                  | [docs](https://github.com/openai/openai-python?tab=readme-ov-file#microsoft-azure-openai)                             | OpenAI Compatible                                          |
| Cartesia         | cartesia         | https://api.cartesia.ai                                                   | [docs](https://docs.cartesia.ai/2025-04-16/use-the-api/api-conventions)                                               | Non OpenAI Compatible                                      |
| Cerebras         | cerebras-ai      | https://api.cerebras.ai/v1                                                | [docs](https://inference-docs.cerebras.ai/resources/openai)                                                           | OpenAI Compatible                                          |
| Cohere           | cohere           | https://api.cohere.ai                                                     | [docs](https://docs.cohere.com/docs/compatibility-api)                                                                | OpenAI Compatible (https://api.cohere.ai/compatibility/v1) |
| DeepSeek         | deepseek         | https://api.deepseek.com                                                  | [docs](https://api-docs.deepseek.com/zh-cn/api/deepseek-api)                                                          | OpenAI Compatible                                          |
| Google AI Studio | google-ai-studio | https://generativelanguage.googleapis.com                                 | [docs](https://ai.google.dev/gemini-api/docs)                                                                         | /v1beta/models/{model}:generateContent                     |
| Google Vertex AI | google-vertex-ai | https://us-east1-aiplatform.googleapis.com                                | [docs](https://cloud.google.com/vertex-ai/generative-ai/docs/start/express-mode/vertex-ai-express-mode-api-reference) | /v1beta1/{model}:generateContent                           |
| Grok             | grok             | https://api.x.ai/v1                                                       | [docs](https://docs.x.ai/docs/guides/chat)                                                                            | OpenAI Compatible                                          |
| Groq             | groq             | https://api.groq.com/openai/v1                                            | [docs](https://console.groq.com/docs/overview)                                                                        | OpenAI Compatible                                          |
| HuggingFace      | huggingface      | https://router.huggingface.co/hf-inference/models/Qwen/Qwen3-235B-A22B/v1 | [docs](https://huggingface.co/docs/inference-providers/providers/hf-inference)                                        | OpenAI Compatible                                          |
| Mistral AI       | mistral          | https://api.mistral.ai/v1                                                 | [docs](https://docs.mistral.ai/capabilities/completion/)                                                              | OpenAI Compatible                                          |
| OpenAI           | openai           | https://api.openai.com/v1                                                 | [docs](https://platform.openai.com/docs/api-reference)                                                                | OpenAI Compatible                                          |
| OpenRouter       | openrouter       | https://openrouter.ai/api/v1                                              | [docs](https://openrouter.ai/docs/api-reference/overview)                                                             | OpenAI Compatible                                          |
| Perplexity       | perplexity-ai    | https://api.perplexity.ai                                                 | [docs](https://docs.perplexity.ai/api-reference/chat-completion)                                                      | OpenAI Compatible                                          |
| Replicate        | replicate        | https://api.replicate.com/v1                                              | [docs](https://replicate.com/docs/reference/http)                                                                     | OpenAI Compatible                                          |
| Workers AI       | workers-ai       | https://api.cloudflare.com/client/v4/accounts/[account_id]/ai             | [docs](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/)                             | OpenAI Compatible                                          |
| Github AI        | github-ai        | https://models.github.ai/inference                                        | [docs](https://learn.microsoft.com/zh-cn/python/api/overview/azure/ai-inference-readme?view=azure-python-preview)     | OpenAI Compatible                                          |

### API Usage

```python
import random
import re

from openai import OpenAI

ApiKey = "sk-Qa7GFtgCspCVfVGqKhm43QFmEB1FxsFvkXNysVycCuwDv2rz"
BaseUrl = "https://self.domain/openai/v1"
models = [
    "gpt-3.5-turbo",
    "gpt-4o-mini"
]

def gentext():
    client = OpenAI(api_key=ApiKey, base_url=BaseUrl)
    model = random.choice(models)
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a smart and creative novelist."
                },
                {
                    "role": "user",
                    "content": "As the king of fairy tales, please write a short fairy tale, the theme of the story is to always maintain a kind heart, to stimulate children's interest and imagination in learning, and to help children better understand and accept the truth and values contained in the story. Only the story content is output, and the title and others are not required."
                }
            ],
            top_p=0.7,
            temperature=0.7
        )
        text = completion.choices[0].message.content
        print(f"{model}：{re.sub(r'\n+', '', text)}")
    except Exception as e:
        print(f"{model}：{str(e)}\n")
```

## Vercel Region List

https://vercel.com/docs/edge-network/regions#region-list
