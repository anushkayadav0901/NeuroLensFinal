/**
 * aiValidator.js
 * --------------
 * Calls Google Gemini and forces it into a structured medical-reasoning JSON
 * shape. The system prompt locks the model to:
 *  - using ONLY the scan context we pass in
 *  - reusing numeric values verbatim (never inventing dimensions, volumes,
 *    distances, or risk levels)
 *  - returning a machine-parsable JSON object
 *
 * Out-of-scope questions return { status: "out_of_scope", message: ... }.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["answered", "out_of_scope"] },
    primary_finding: { type: "string" },
    supporting_observations: { type: "array", items: { type: "string" } },
    validations: { type: "array", items: { type: "string" } },
    anatomical_context: { type: "array", items: { type: "string" } },
    confidence: {
      type: "object",
      properties: {
        segmentation: { type: "string" },
        classification: { type: "string" },
      },
    },
    limitations: { type: "array", items: { type: "string" } },
    answer_summary: { type: "string" },
    out_of_scope_message: { type: "string" },
  },
  required: ["status"],
};

export const OUT_OF_SCOPE_MESSAGE =
  "I can only assist with questions about brain MRI scans and this scan report.";

function summarizeProximity(proximity) {
  if (!proximity || !proximity.length) return "No proximity data computed.";
  return proximity
    .slice(0, 6)
    .map(
      (p) =>
        `- ${p.name}: ${p.surface_distance_mm.toFixed(1)} mm (${p.risk_zone}). Function: ${p.function} Impact: ${p.impact}`,
    )
    .join("\n");
}

function buildSystemContext(result) {
  const s = result?.summary || {};
  const m = result?.metrics || {};
  const p = result?.pipeline || {};
  const reasoning = result?.reasoning || [];
  const proximity = result?.anatomical_proximity || [];
  const surgicalNote = result?.surgical_note || "";

  return `You are NeuroLens AI — a structured medical reasoning + validation assistant
embedded in the NeuroLens brain MRI analysis platform.

YOU ARE NOT A GENERIC CHATBOT. You are a clinical decision-support layer.

ABSOLUTE RULES:
1. Only answer questions about brain MRI scans, neuroanatomy of the analyzed
   case, segmentation, or this specific scan's findings.
2. If a question is unrelated, return JSON with status="out_of_scope" and
   out_of_scope_message="${OUT_OF_SCOPE_MESSAGE}".
3. Every numeric value (volume, dimensions, depth, distances, percentages,
   risk levels) MUST be copied VERBATIM from the SCAN CONTEXT below. NEVER
   invent or estimate new numbers. If data is missing, say so explicitly in
   limitations.
4. Do NOT recommend specific medications or treatment plans. You may reference
   general surgical considerations when they are present in the SCAN CONTEXT.
5. Always remind that the doctor is the final decision-maker; this is decision
   support only.
6. Always respond with a single JSON object, no Markdown, no commentary,
   matching this shape:
   {
     "status": "answered" | "out_of_scope",
     "primary_finding": "string",
     "supporting_observations": ["string", ...],
     "validations": ["string", ...],
     "anatomical_context": ["string", ...],
     "confidence": { "segmentation": "string", "classification": "string" },
     "limitations": ["string", ...],
     "answer_summary": "1-3 sentence direct answer to the doctor's question",
     "out_of_scope_message": "string (only when status=out_of_scope)"
   }

SCAN CONTEXT (use these values verbatim — never invent):

SUMMARY:
- Region: ${s.region || "N/A"}
- Volume: ${s.volume || "N/A"}
- Dimensions: ${s.dimensions || "N/A"}
- Laterality: ${s.laterality || "N/A"}
- Depth from surface: ${s.depth || "N/A"}
- Risk Level: ${s.risk_level || "N/A"}

CLINICAL METRICS:
- Tumor volume (cm³): ${m.tumor_volume_cm3 ?? "N/A"}
- Region function: ${m.region_function || "N/A"}
- Midline distance: ${m.midline_distance_mm ?? "N/A"} mm
- Centroid voxel: ${(m.centroid_voxel || []).join(", ") || "N/A"}
- Risk factors: ${(m.risk_factors || []).join("; ") || "none"}
- Risk note: ${m.risk_note || "N/A"}

PIPELINE:
- Segmentation mode: ${p.segmentation_mode || "N/A"}
- Voxel spacing: ${(p.voxel_spacing_mm || []).join(" × ") || "N/A"} mm

ANATOMICAL PROXIMITY (already computed — use these distances verbatim):
${summarizeProximity(proximity)}

SURGICAL CONTEXT:
${surgicalNote || "Not generated."}

CLINICAL REASONING TRACE:
${
    reasoning
      .map((step) => `Step ${step.step} - ${step.title} (${step.confidence}): ${step.detail}`)
      .join("\n") || "No reasoning steps available."
  }
`;
}

function extractJson(text) {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (err) {
    return null;
  }
}

export async function askValidator(messages, result) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key not configured. Set VITE_GEMINI_API_KEY in frontend/.env",
    );
  }
  const system = buildSystemContext(result);

  const turnsForGemini = messages
    .filter((m) => !m.initial && (m.role === "doctor" || m.role === "ai"))
    .map((m) => ({
      role: m.role === "ai" ? "model" : "user",
      parts: [{ text: m.role === "ai" ? JSON.stringify(m.payload || { answer_summary: m.text }) : m.text }],
    }));

  if (!turnsForGemini.some((c) => c.role === "user")) {
    return {
      status: "answered",
      primary_finding:
        result?.summary?.region || "No active scan",
      supporting_observations: [],
      validations: [],
      anatomical_context: [],
      confidence: { segmentation: "N/A", classification: "N/A" },
      limitations: ["No question received."],
      answer_summary: "Ask a question about this analysis to begin.",
    };
  }

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: turnsForGemini,
    generationConfig: {
      temperature: 0.15,
      maxOutputTokens: 900,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  let res;
  try {
    res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`Network error contacting Gemini: ${err.message}`);
  }

  if (!res.ok) {
    let errText = "";
    try {
      const errJson = await res.json();
      errText = errJson?.error?.message || JSON.stringify(errJson);
    } catch {
      errText = res.statusText;
    }
    throw new Error(`Gemini API error: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = extractJson(text);

  if (!parsed) {
    return {
      status: "answered",
      primary_finding: result?.summary?.region || "Analysis context",
      supporting_observations: [],
      validations: [],
      anatomical_context: [],
      confidence: { segmentation: "N/A", classification: "N/A" },
      limitations: ["The AI response could not be parsed into the structured format."],
      answer_summary:
        text?.slice(0, 600) ||
        "I couldn't generate a structured response. Please try again.",
    };
  }

  if (parsed.status === "out_of_scope") {
    parsed.out_of_scope_message = parsed.out_of_scope_message || OUT_OF_SCOPE_MESSAGE;
  }

  return parsed;
}

export function buildSeedPayload(result) {
  const s = result?.summary || {};
  const m = result?.metrics || {};
  const proximity = result?.anatomical_proximity || [];
  const top = proximity[0];

  const supporting = [];
  if (s.volume) supporting.push(`Tumor volume measured at ${s.volume}.`);
  if (s.dimensions) supporting.push(`Dimensions: ${s.dimensions}.`);
  if (s.depth) supporting.push(`Depth from surface: ${s.depth}.`);
  if (m.midline_distance_mm != null)
    supporting.push(`Midline distance: ${m.midline_distance_mm} mm.`);
  if ((m.risk_factors || []).length)
    supporting.push(`Risk factors: ${m.risk_factors.join("; ")}.`);

  const validations = [
    "Segmentation post-processed (largest connected component retained).",
    "Voxel-volume conversion applied with reported voxel spacing.",
    "Region mapped via normalized centroid to brain-region atlas.",
    "Anatomical proximity computed against bundled critical-structure atlas.",
  ];

  const anatomicalContext = proximity.slice(0, 3).map(
    (p) => `${p.name} proximity: ${p.surface_distance_mm.toFixed(1)} mm (${p.risk_zone}).`,
  );

  const limitations = [
    "Demonstrative atlas — not a registered MNI space; distances are approximate.",
    "Findings require clinical correlation by a qualified specialist.",
  ];
  if (m.region === "Unknown Region")
    limitations.push("Region could not be confidently mapped — manual review needed.");

  return {
    status: "answered",
    primary_finding: `${s.region || "Tumor"} — ${s.risk_level || "Unknown"} risk`,
    supporting_observations: supporting,
    validations,
    anatomical_context: anatomicalContext.length
      ? anatomicalContext
      : ["No proximity data available for the active scan."],
    confidence: {
      segmentation: m.tumor_voxels ? "high (rule-based / supervised)" : "n/a",
      classification: top ? "moderate" : "n/a",
    },
    limitations,
    answer_summary: `Initial AI summary for ${s.region || "the analyzed region"}: ${
      s.volume || "volume n/a"
    }, ${s.risk_level || "risk n/a"} risk. Ask a follow-up question to drill deeper.`,
  };
}
