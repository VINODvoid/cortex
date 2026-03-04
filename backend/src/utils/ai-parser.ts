/**
 * Robust AI response parser.
 *
 * Problems with the naive approach (regex on ```json blocks):
 *  - LLMs often include conversational text before/after the JSON block
 *  - Some models wrap JSON in single backtick inline code
 *  - findFirst + findLast brace matching handles all these cases
 */

export interface AgentResponseShape {
  action: string;
  reasoning: string;
  confidence: number;
  target?: string;
}

/**
 * Extracts the first complete JSON object from arbitrary LLM output.
 *
 * Strategy (in order):
 *  1. Look for a fenced code block (```json ... ``` or ``` ... ```)
 *  2. Find the outermost balanced { ... } braces
 *  3. Fall back to JSON.parse on the entire trimmed string
 */
export function extractJSON(text: string): unknown {
  const trimmed = text.trim();

  // 1. Fenced code block
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1].trim());
  }

  // 2. Balanced brace matching — finds the first complete {...}
  let depth = 0;
  let start = -1;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        return JSON.parse(trimmed.slice(start, i + 1));
      }
    }
  }

  // 3. Last resort: parse the whole string
  return JSON.parse(trimmed);
}

/**
 * Parse and validate an LLM response into a typed AgentResponseShape.
 * Throws with a descriptive message if the shape is wrong.
 */
export function parseAgentResponse(text: string): AgentResponseShape {
  const raw = extractJSON(text);

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Response is not a JSON object");
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj["action"] !== "string" || !obj["action"]) {
    throw new Error(`Missing or invalid 'action' field: ${JSON.stringify(obj)}`);
  }
  if (typeof obj["reasoning"] !== "string") {
    throw new Error("Missing 'reasoning' field");
  }
  if (typeof obj["confidence"] !== "number" || isNaN(obj["confidence"] as number)) {
    throw new Error("Missing 'confidence' field (must be a number)");
  }

  return {
    action: obj["action"],
    reasoning: obj["reasoning"],
    confidence: Math.max(0, Math.min(100, obj["confidence"])),
    target: typeof obj["target"] === "string" && obj["target"] ? obj["target"] : undefined,
  };
}
