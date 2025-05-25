<div align="right">
   <strong>中文</strong> | <a href="README.md">English</a>
</div>
<div align="center">
<h1>Serverless API Proxy</h1>
<p>Serverless API Proxy: 基于Vercel Routes、Cloudflare Worker、Netlify Redirects的多API代理网关</p>
<hr />

[![GitHub stars](https://img.shields.io/github/stars/lopinx/serverless-api-proxy)](https://github.com/lopinx/serverless-api-proxy/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/lopinx/serverless-api-proxy)](https://github.com/lopinx/serverless-api-proxy/network/members)
[![GitHub issues](https://img.shields.io/github/issues/lopinx/serverless-api-proxy)](https://github.com/lopinx/serverless-api-proxy/issues)
[![GitHub license](https://img.shields.io/github/license/lopinx/serverless-api-proxy)](https://github.com/lopinx/serverless-api-proxy/blob/main/LICENSE)

</div>

## 演示截图

<div align="center">

![image](https://github.com/user-attachments/assets/00d2a2f1-676c-4524-a541-1692f61d164e '演示截图')

</div>

## 特别提示

**原账号（[lopins](https://github.com/lopins)）由于被限制登录，现在使用本账号（[lopinx](https://github.com/lopinx)）维护**

## 支持服务

- openai、gemini、claude、xAI、groq、llama等等...

## 怎么部署

### Cloudflare 部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/lopinx/serverless-api-proxy)

**环境变量列表**

| 变量名             | 类型      | 必填/可选 | 说明                                 | 示例值/格式                                                                                            | 安全建议                                     |
| ------------------ | --------- | --------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| **ADMIN_USERNAME** | 字符串    | 必填      | 管理后台登录用户名                   | `admin`（强烈建议修改）                                                                                | 使用强用户名，避免默认值                     |
| **ADMIN_PASSWORD** | 密钥      | 必填      | 管理后台登录密码                     | `admin`（强烈建议修改为强密码）                                                                        | 加密存储，使用复杂字符组合                   |
| **SESSION_SECRET** | 密钥      | 必填      | 会话 Cookie 签名密钥                 | `$qA,.3!_I1^0AQ5rZm3!z-S3^(IgF$A8`（默认值，生产环境需更换）                                           | 生成随机长字符串并加密                       |
| **API_ENDPOINTS**  | JSON/数组 | 可选      | 静态 API 端点配置（KV 未配置时生效） | `[["/openai", "https://api.openai.com/v1"], ["/gemini", "https://generativelanguage.googleapis.com"]]` | 与 KV 配置互斥，静态配置不可通过管理后台修改 |

**KV Namespace 绑定变量**

| 变量名            | 类型    | 必填/可选 | 说明                                                  | 关联步骤                                                                    |
| ----------------- | ------- | --------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| **API_ENDPOINTS** | KV 引用 | 可选      | 绑定到 Cloudflare KV Namespace，存储动态 API 端点配置 | 绑定为 KV Namespace 的`命名空间名称`（需与代码中 `env.API_ENDPOINTS` 一致） |

### Vercel 部署

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lopinx/serverless-api-proxy)

### Netlify 部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/lopinx/serverless-api-proxy)

## 如何使用

### API地址

| 官方平台         | ID               | API节点                                                                   | 文档链接                                                                                                              | OpenAI兼容                                                 |
| ---------------- | ---------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Amazon Bedrock   | aws-bedrock      | https://bedrock-runtime.us-east-1.amazonaws.com                           | [文档](https://docs.aws.amazon.com/zh_cn/bedrock/latest/userguide/what-is-bedrock.html)                               | Non OpenAI Compatible                                      |
| Anthropic        | anthropic        | https://api.anthropic.com/v1                                              | [文档](https://docs.anthropic.com/en/api/openai-sdk)                                                                  | OpenAI Compatible                                          |
| Azure OpenAI     | azure-openai     | https://{RESOURCE_NAME}.openai.azure.com                                  | [文档](https://github.com/openai/openai-python?tab=readme-ov-file#microsoft-azure-openai)                             | OpenAI Compatible                                          |
| Cartesia         | cartesia         | https://api.cartesia.ai                                                   | [文档](https://docs.cartesia.ai/2025-04-16/use-the-api/api-conventions)                                               | Non OpenAI Compatible                                      |
| Cerebras         | cerebras-ai      | https://api.cerebras.ai/v1                                                | [文档](https://inference-docs.cerebras.ai/resources/openai)                                                           | OpenAI Compatible                                          |
| Cohere           | cohere           | https://api.cohere.ai                                                     | [文档](https://docs.cohere.com/docs/compatibility-api)                                                                | OpenAI Compatible (https://api.cohere.ai/compatibility/v1) |
| DeepSeek         | deepseek         | https://api.deepseek.com                                                  | [文档](https://api-docs.deepseek.com/zh-cn/api/deepseek-api)                                                          | OpenAI Compatible                                          |
| Google AI Studio | google-ai-studio | https://generativelanguage.googleapis.com                                 | [文档](https://ai.google.dev/gemini-api/docs)                                                                         | /v1beta/models/{model}:generateContent                     |
| Google Vertex AI | google-vertex-ai | https://us-east1-aiplatform.googleapis.com                                | [文档](https://cloud.google.com/vertex-ai/generative-ai/docs/start/express-mode/vertex-ai-express-mode-api-reference) | /v1beta1/{model}:generateContent                           |
| Grok             | grok             | https://api.x.ai/v1                                                       | [文档](https://docs.x.ai/docs/guides/chat)                                                                            | OpenAI Compatible                                          |
| Groq             | groq             | https://api.groq.com/openai/v1                                            | [文档](https://console.groq.com/docs/overview)                                                                        | OpenAI Compatible                                          |
| HuggingFace      | huggingface      | https://router.huggingface.co/hf-inference/models/Qwen/Qwen3-235B-A22B/v1 | [文档](https://huggingface.co/docs/inference-providers/providers/hf-inference)                                        | OpenAI Compatible                                          |
| Mistral AI       | mistral          | https://api.mistral.ai/v1                                                 | [文档](https://docs.mistral.ai/capabilities/completion/)                                                              | OpenAI Compatible                                          |
| OpenAI           | openai           | https://api.openai.com/v1                                                 | [文档](https://platform.openai.com/docs/api-reference)                                                                | OpenAI Compatible                                          |
| OpenRouter       | openrouter       | https://openrouter.ai/api/v1                                              | [文档](https://openrouter.ai/docs/api-reference/overview)                                                             | OpenAI Compatible                                          |
| Perplexity       | perplexity-ai    | https://api.perplexity.ai                                                 | [文档](https://docs.perplexity.ai/api-reference/chat-completion)                                                      | OpenAI Compatible                                          |
| Replicate        | replicate        | https://api.replicate.com/v1                                              | [文档](https://replicate.com/docs/reference/http)                                                                     | OpenAI Compatible                                          |
| Workers AI       | workers-ai       | https://api.cloudflare.com/client/v4/accounts/[account_id]/ai             | [文档](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/)                             | OpenAI Compatible                                          |
| Github AI        | github-ai        | https://models.github.ai/inference                                        | [文档](https://learn.microsoft.com/zh-cn/python/api/overview/azure/ai-inference-readme?view=azure-python-preview)     | OpenAI Compatible                                          |

### API使用

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
                    "content": "你是一个聪明且富有创造力的小说作家。"
                },
                {
                    "role": "user",
                    "content": "请你作为童话故事大王，写一篇短篇童话故事，故事的主题是要永远保持一颗善良的心，要能够激发儿童的学习兴趣和想象力，同时也能够帮助儿童更好地理解和接受故事中所蕴含的道理和价值观。只输出故事内容不需要标题和其他。"
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

## Vercel区域

https://vercel.com/docs/edge-network/regions#region-list
