import re

# Catches [happy] or [emotion: happy]
TAG_REGEX = re.compile(r"\[(?:emotion:\s*)?([a-zA-Z]+)\]", re.IGNORECASE)

def parse_semantic_chunk(chunk: str):
    text = chunk.strip()
    matches = TAG_REGEX.findall(text)
    
    # Get the last emotion tag found, default to neutral
    emotion = matches[-1].lower() if matches else "neutral"
    
    # Strip all tags from the text so they are NOT spoken
    clean_text = TAG_REGEX.sub("", text).strip()
    
    return {"emotion": emotion, "text": clean_text}