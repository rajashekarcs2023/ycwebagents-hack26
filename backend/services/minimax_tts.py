"""MiniMax TTS client — verified from official T2A HTTP API docs."""

import os
import httpx

TTS_URL = "https://api.minimax.io/v1/t2a_v2"


async def generate_speech(text: str, output_format: str = "url") -> dict:
    """Generate speech from text using MiniMax T2A API.
    
    Args:
        text: Text to synthesize (max 10,000 chars)
        output_format: "url" (returns URL valid 24h) or "hex" (returns hex-encoded audio)
    
    Returns:
        {audio_url: str, audio_length: int, usage_characters: int} if output_format="url"
        {audio_hex: str, audio_length: int, usage_characters: int} if output_format="hex"
    """
    api_key = os.environ.get("MINI_MAX_API_KEY", "")
    if not api_key:
        print("[MiniMax] No API key — skipping TTS")
        return {}

    payload = {
        "model": "speech-2.8-hd",
        "text": text[:10000],
        "stream": False,
        "output_format": output_format,
        "language_boost": "English",
        "voice_setting": {
            "voice_id": "English_expressive_narrator",
            "speed": 1,
            "vol": 1,
            "pitch": 0,
        },
        "audio_setting": {
            "sample_rate": 32000,
            "bitrate": 128000,
            "format": "mp3",
            "channel": 1,
        },
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(TTS_URL, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    base_resp = data.get("base_resp", {})
    if base_resp.get("status_code", -1) != 0:
        print(f"[MiniMax] TTS error: {base_resp.get('status_msg', 'unknown')}")
        return {}

    audio_data = data.get("data", {})
    extra = data.get("extra_info", {})

    result = {
        "audio_length": extra.get("audio_length", 0),
        "usage_characters": extra.get("usage_characters", 0),
    }

    if output_format == "url":
        result["audio_url"] = audio_data.get("audio", "")
    else:
        result["audio_hex"] = audio_data.get("audio", "")

    print(f"[MiniMax] Generated {result['usage_characters']} chars of speech")
    return result
