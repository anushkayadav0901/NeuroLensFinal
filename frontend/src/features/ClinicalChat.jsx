import { useMemo, useState } from "react";
import "./clinical-chat.css";

const REGIONS = ["Left Frontal", "Right Temporal", "Cerebellum", "Brain Stem", "Parietal"];
const TUMOR_TYPES = ["Glioblastoma", "Meningioma", "Astrocytoma"];

function typeShort(tumorType) {
  if (tumorType === "Glioblastoma") return "GBM";
  if (tumorType === "Meningioma") return "MNG";
  return "AST";
}

function makeCaseId(location, age) {
  const slug = location.replace(/\s+/g, "").slice(0, 4).toUpperCase();
  return `NL-Demo-${slug}-${age}`;
}

function computeInfiltrationPct({ tumorType, sizeCm, age }) {
  let v = 34 + (sizeCm - 1) * 7;
  if (tumorType === "Glioblastoma") v += 20;
  else if (tumorType === "Astrocytoma") v += 10;
  else v += 4;
  if (age >= 65) v += 4;
  return Math.min(94, Math.max(26, Math.round(v)));
}

function buildResponses(c) {
  const { location, tumorType, typeShort: ts, size, infiltrationPct, age } = c;
  return {
    location: `The tumor is located in the ${location} region, specifically at coordinates approximately 45mm lateral, 25mm anterior, and 30mm superior to the AC-PC line. The lesion shows infiltrative margins extending into the surrounding white matter tracts. Based on T1CE imaging, the enhancing portion measures ${size} with additional FLAIR hyperintensity suggesting peritumoral edema extending 1.2–1.5cm beyond the enhancing margin.`,

    functions: `Given the ${location} location, the following functions are at risk:\n\n• Motor control: proximity to the precentral gyrus can place primary motor cortex at risk, particularly hand and facial motor control\n• Speech production: Broca's area (BA 44/45) may be within a few centimeters of the tumor margin — expressive aphasia is a consideration when frontal\n• Executive function: dorsolateral prefrontal involvement may impact working memory, planning, and cognitive flexibility\n• Supplementary motor area: risk of transient mutism and motor planning deficits after resection\n\nRecommendation: Awake craniotomy with intraoperative language mapping and motor monitoring should be considered when anatomy is eloquent.`,

    infiltration: `The infiltration score of ${infiltrationPct}% indicates ${infiltrationPct >= 70 ? "a highly invasive" : infiltrationPct >= 50 ? "a moderately invasive" : "a comparatively focal"} pattern relative to the enhancing core. This demo metric is synthesized from:\n\n• DTI tractography patterns (disruption vs displacement of white matter tracts)\n• FLAIR signal abnormality extent beyond T1CE enhancement\n• Perfusion MRI patterns in the peritumoral rim\n• DWI signal in non-enhancing regions\n\nClinical implication: gross total resection may be limited by function when infiltration is high. Molecular markers (IDH, MGMT) and ${tumorType} biology guide adjuvant therapy intensity.`,

    imaging: `Recommended pre-operative imaging protocol:\n\n1. Structural MRI:\n   • 3D T1 MPRAGE pre/post gadolinium (1mm isotropic)\n   • 3D T2-FLAIR (1mm isotropic)\n   • T2-weighted axial\n\n2. Functional imaging:\n   • fMRI: language paradigm (verb generation, picture naming)\n   • fMRI: motor mapping (hand/foot movement)\n   • DTI: 64-direction minimum for tractography\n\n3. Advanced sequences:\n   • MR spectroscopy: Cho/NAA ratio, lactate peak\n   • Perfusion (DSC): rCBV mapping\n   • DWI/ADC: cellularity assessment\n\n4. Surgical planning:\n   • Neuronavigation protocol with fiducial markers\n   • Vessel imaging (MRA/MRV) if near major vessels\n\nAcquire within 48 hours of surgery when feasible and load into neuronavigation.`,

    approach: `Surgical approach options for ${location} (${ts}):\n\n1. Awake craniotomy (often preferred for eloquent cortex):\n   • Real-time language and motor mapping\n   • Supine positioning with controlled head rotation\n   • Cortical and subcortical stimulation during resection\n\n2. Asleep craniotomy with neuromonitoring:\n   • Motor evoked potentials (MEPs) and SSEPs\n   • Language testing limitations vs awake mapping\n\n3. Stereotactic biopsy:\n   • When resection risk outweighs benefit\n   • Tissue for molecular profiling with minimal morbidity\n\nFor this demo case (${size}, age ${age}), coordinate with neuroanesthesia and speech pathology if awake surgery is planned.`,
  };
}

const defaultDraft = () => ({
  location: "Left Frontal",
  tumorType: "Glioblastoma",
  sizeCm: 4.1,
  age: 54,
});

function draftToActive(d) {
  const infiltrationPct = computeInfiltrationPct(d);
  return {
    ...d,
    id: makeCaseId(d.location, d.age),
    typeShort: typeShort(d.tumorType),
    size: `${d.sizeCm.toFixed(1)}cm`,
    infiltrationPct,
  };
}

/**
 * FEATURE 4 — AI Clinical Chat Demo
 * Case is defined by the visitor; responses follow the active case.
 */
export default function ClinicalChat() {
  const [draft, setDraft] = useState(defaultDraft);
  const [activeCase, setActiveCase] = useState(() => draftToActive(defaultDraft()));
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const responses = useMemo(() => buildResponses(activeCase), [activeCase]);

  const prompts = useMemo(
    () => [
      { id: "location", label: "Where exactly is the tumor?" },
      { id: "functions", label: "What functions are at risk?" },
      {
        id: "infiltration",
        label: `What does infiltration score ${activeCase.infiltrationPct}% mean?`,
      },
      { id: "imaging", label: "Recommend pre-op imaging" },
      { id: "approach", label: "What are the surgical approach options?" },
    ],
    [activeCase.id, activeCase.infiltrationPct],
  );

  const applyCase = () => {
    setActiveCase(draftToActive(draft));
    setMessages([]);
  };

  const typeMessage = (text) => {
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text }]);
      setIsTyping(false);
    }, 900);
  };

  const handlePromptClick = (promptId) => {
    const prompt = prompts.find((p) => p.id === promptId);
    const text = responses[promptId];
    if (!prompt || !text) return;
    setMessages((prev) => [...prev, { role: "user", text: prompt.label }]);
    typeMessage(text);
  };

  return (
    <section className="cc-section">
      <div className="cc-badge">Feature 4</div>
      <h2 className="cc-title">AI Clinical Chat Demo</h2>
      <p className="cc-lede">
        Build a synthetic case below, apply it to the assistant, then use the clinical prompts. All
        answers update to match your selections (demo content, not medical advice).
      </p>

      <div className="cc-shell">
        <div className="cc-builder">
          <p className="cc-builder-title">Build your case</p>
          <div className="cc-builder-grid">
            <div className="cc-field">
              <label htmlFor="cc-region">Tumor region</label>
              <select
                id="cc-region"
                value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="cc-field">
              <label htmlFor="cc-type">Tumor type</label>
              <select
                id="cc-type"
                value={draft.tumorType}
                onChange={(e) => setDraft((d) => ({ ...d, tumorType: e.target.value }))}
              >
                {TUMOR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="cc-field">
              <label htmlFor="cc-size">Enhancing size (cm)</label>
              <input
                id="cc-size"
                type="number"
                min={1}
                max={6}
                step={0.1}
                value={draft.sizeCm}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    sizeCm: Math.min(6, Math.max(1, parseFloat(e.target.value) || 1)),
                  }))
                }
              />
              <div className="cc-field-hint">1.0 – 6.0 cm</div>
            </div>
            <div className="cc-field">
              <label htmlFor="cc-age">Patient age</label>
              <input
                id="cc-age"
                type="number"
                min={18}
                max={95}
                step={1}
                value={draft.age}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    age: Math.min(95, Math.max(18, parseInt(e.target.value, 10) || 18)),
                  }))
                }
              />
            </div>
            <button type="button" className="cc-apply" onClick={applyCase}>
              Apply case & reset chat
            </button>
          </div>
        </div>

        <div className="cc-meta">
          <div className="cc-meta-row">
            <span className="dim">Case:</span> {activeCase.id}
            <span className="dim"> · Type:</span> {activeCase.typeShort} ({activeCase.tumorType})
            <span className="dim"> · Location:</span> {activeCase.location}
            <span className="dim"> · Size:</span> {activeCase.size}
            <span className="dim"> · Age:</span> {activeCase.age}
            <span className="dim"> · Demo infiltration:</span> {activeCase.infiltrationPct}%
          </div>
        </div>

        <div className="cc-scroll">
          {messages.length === 0 && !isTyping && (
            <div className="cc-empty">
              Choose parameters above, click &quot;Apply case & reset chat&quot;, then select a
              question to start.
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={`${idx}-${msg.role}-${msg.text.slice(0, 12)}`}
              className={`cc-msg ${msg.role === "user" ? "cc-msg-user" : ""}`}
            >
              <div className="cc-msg-label">{msg.role === "user" ? "You" : "NeuroLens AI"}</div>
              <div className={`cc-bubble ${msg.role === "user" ? "cc-bubble-user" : "cc-bubble-ai"}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="cc-msg">
              <div className="cc-msg-label">NeuroLens AI</div>
              <div className="cc-typing" aria-live="polite">
                <span className="cc-dot" />
                <span className="cc-dot" />
                <span className="cc-dot" />
              </div>
            </div>
          )}
        </div>

        <div className="cc-prompts">
          {prompts.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              className="cc-chip"
              onClick={() => handlePromptClick(prompt.id)}
              disabled={isTyping}
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
