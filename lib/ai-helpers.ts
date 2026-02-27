export function parseAIJsonResponse(responseText: string): any {
  const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1])
  }
  return JSON.parse(responseText)
}
