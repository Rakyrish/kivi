// The AI generation pipeline (backend/apps/ai_generator/generation.py) uses these
// literal strings as an explicit "could not be determined" sentinel instead of
// guessing. Product detail pages must hide them rather than render the sentinel
// text itself to a site visitor.
const PLACEHOLDER_RE = /information requires manual verification|^n\/a$/i

export function hasRealValue(value?: string | null): value is string {
  if (!value) return false
  const trimmed = value.trim()
  return trimmed.length > 0 && !PLACEHOLDER_RE.test(trimmed)
}
