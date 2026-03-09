"""
Groq API integration utility.

Usage:
    from apps.ai_chat.utils import call_groq, EXPLAIN_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT

    messages = [
        {'role': 'system', 'content': EXPLAIN_SYSTEM_PROMPT},
        {'role': 'user', 'content': 'Explain this code: ...'},
    ]
    response_text = call_groq(messages)
"""

from groq import Groq
from django.conf import settings

# ---------------------------------------------------------------------------
# System prompts
# ---------------------------------------------------------------------------

EXPLAIN_SYSTEM_PROMPT = """You are a senior software engineer and friendly coding tutor.
When given a code snippet, you MUST respond ONLY in clean Markdown using EXACTLY this structure:

## Overview
One concise paragraph summarising what the code does and its purpose.

## Line-by-Line Breakdown
A numbered list explaining each key line or logical block of code.

## Key Concepts
A bullet list of programming concepts used (e.g., recursion, list comprehension, async/await).

## Complexity
State the time and space complexity where applicable. If not relevant, write "N/A".

## Suggestions
One or two brief, actionable improvement tips. If the code is already clean, say "Looks good!".

---
Rules:
- Use Markdown code blocks (```language) for any inline code examples.
- Keep language beginner-friendly — avoid unnecessary jargon.
- Adjust depth based on the requested complexity level (simple / intermediate / advanced).
- Never add extra sections beyond the five listed above.
"""

CHAT_SYSTEM_PROMPT = """You are a helpful and patient coding assistant specialising in explaining code snippets.
Your role is to answer follow-up questions, clarify concepts, and help users understand code.

Rules:
- Always use Markdown formatting in your responses.
- Wrap any code in Markdown code blocks with the correct language tag (```python, ```js, etc.).
- Use numbered lists for step-by-step explanations and bullet lists for concept summaries.
- Keep responses concise but complete — prefer clarity over length.
- If you don't know something, say so honestly rather than guessing.
"""

# ---------------------------------------------------------------------------
# Groq API call
# ---------------------------------------------------------------------------

def call_groq(messages: list[dict]) -> str:
    """
    Send a list of messages to the Groq API and return the assistant's reply.

    Args:
        messages: List of dicts with 'role' and 'content' keys.
                  Example: [{'role': 'system', 'content': '...'}, {'role': 'user', 'content': '...'}]

    Returns:
        The assistant's response as a plain string (Markdown formatted).

    Raises:
        Exception: Re-raises Groq API errors so the caller can handle them.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    response = client.chat.completions.create(
        model='llama-3.1-8b-instant',
        messages=messages,
        temperature=0.7,
        max_tokens=2048,
    )

    return response.choices[0].message.content
