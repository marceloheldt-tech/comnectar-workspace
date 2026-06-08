# Nano Banana Image Generator Skill

This skill generates images from text prompts using Google Gemini's API via curl and Python—no external dependencies needed.

## Initial Setup

Check for `~/.claude/skills/nanobanana-ratos/.env`. If missing, ask the user for their Gemini API key (free from https://aistudio.google.com/apikey) and create the file with `GEMINI_API_KEY=their-key`.

## Image Generation Process

1. Load credentials: `source ~/.claude/skills/nanobanana-ratos/.env`
2. Write a detailed English prompt specifying style, composition, colors, and context
3. Call the Gemini API via curl and extract the base64-encoded image using Python
4. Save to disk and display using Read function

## Key Points

- **Language**: Prompts must be in English for optimal results
- **Default model**: `gemini-2.5-flash-image` (free tier, ~500 images/day)
- **Aspect ratios**: Configurable via `imageConfig` (1:1, 16:9, 9:16, etc.)
- **Error handling**: Show full API response if generation fails; suggest Pollinations as free fallback
- **Security**: Never expose the API key in output—only reference the .env file
- **Refinement**: Support iterative improvement by analyzing results and regenerating with refined prompts

The skill triggers when users request image generation, illustrations, banners, thumbnails, or visual content.
