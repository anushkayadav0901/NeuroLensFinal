/**
 * learning-cases.js
 * -----------------
 * 15 BraTS-style teaching cases. Each entry mirrors the structure the
 * walkthrough expects:
 *
 *   id           - stable case identifier
 *   title        - short label for the case library
 *   difficulty   - "beginner" | "intermediate" | "advanced"
 *   tumor_type   - "glioblastoma" | "meningioma" | "metastasis" | "low_grade"
 *   region       - rough anatomical region (filter facet)
 *   patient      - { age, sex, presenting_complaint, history, exam }
 *   imaging      - { modality_notes }
 *   quiz         - sequential prompts that gate the imaging reveal
 *   teaching_points - 3-5 key takeaways
 *   ground_truth - region label and approximate answer keys
 *
 * The case bodies are synthetic but consistent with BraTS-style imaging.
 * No real patient data is included.
 */

export const TUMOR_TYPES = [
  { id: "glioblastoma", label: "Glioblastoma" },
  { id: "meningioma", label: "Meningioma" },
  { id: "metastasis", label: "Metastasis" },
  { id: "low_grade", label: "Low-grade glioma" },
];

export const DIFFICULTIES = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export const LEARNING_CASES = [
  {
    id: "lc-001",
    title: "55M with progressive aphasia",
    difficulty: "beginner",
    tumor_type: "glioblastoma",
    region: "Left temporal lobe",
    patient: {
      age: 55,
      sex: "male",
      presenting_complaint: "Progressive word-finding difficulty over 3 weeks.",
      history: "Hypertension, no prior neurological events.",
      exam: "Mild expressive aphasia, otherwise intact.",
    },
    imaging: {
      modality_notes: "T2-FLAIR hyperintensity with peripheral enhancement on T1-CE.",
    },
    quiz: [
      {
        id: "q1",
        type: "first_impression",
        prompt: "Before viewing imaging — what's your top differential?",
        options: ["Stroke", "Tumor", "Infection", "Migraine"],
        answer: "Tumor",
        rationale: "Subacute, progressive, unilateral language deficit is classic for a left peri-Sylvian mass.",
      },
      {
        id: "q2",
        type: "modality",
        prompt: "Which modality is most useful to characterize the lesion's enhancement pattern?",
        options: ["T1", "T1-CE", "FLAIR", "DWI"],
        answer: "T1-CE",
        rationale: "Post-contrast T1 reveals the necrotic core and peripheral enhancement of high-grade gliomas.",
      },
      {
        id: "q3",
        type: "localization",
        prompt: "Which region most likely contains the lesion?",
        options: ["Left frontal", "Left temporal", "Right occipital", "Cerebellum"],
        answer: "Left temporal",
        rationale: "Wernicke-area involvement explains the receptive language deficit.",
      },
    ],
    teaching_points: [
      "Subacute progressive aphasia + age >50 strongly favors a glioma.",
      "T1-CE characterizes enhancement; FLAIR characterizes infiltration.",
      "Eloquent language cortex involvement changes the surgical plan.",
      "Always correlate imaging with the clinical exam.",
    ],
    ground_truth: { region: "Left temporal lobe", confidence: 0.92 },
  },
  {
    id: "lc-002",
    title: "67F with new-onset seizure",
    difficulty: "beginner",
    tumor_type: "meningioma",
    region: "Right frontal convexity",
    patient: {
      age: 67,
      sex: "female",
      presenting_complaint: "Single generalized tonic-clonic seizure, no prior history.",
      history: "Hyperlipidemia.",
      exam: "Postictal but otherwise normal at 24 hours.",
    },
    imaging: {
      modality_notes: "Dural-based mass with homogeneous enhancement, classic dural tail.",
    },
    quiz: [
      {
        id: "q1",
        type: "first_impression",
        prompt: "Most likely diagnosis given a dural-based mass with homogeneous enhancement?",
        options: ["Glioblastoma", "Meningioma", "Abscess", "Demyelination"],
        answer: "Meningioma",
        rationale: "Extra-axial dural-based lesion with homogeneous enhancement is the classic meningioma signature.",
      },
      {
        id: "q2",
        type: "modality",
        prompt: "Which sign on T1-CE supports a meningioma?",
        options: ["Ring enhancement", "Dural tail", "Restricted diffusion only", "No enhancement"],
        answer: "Dural tail",
        rationale: "Dural tail enhancement is highly specific for meningioma.",
      },
      {
        id: "q3",
        type: "localization",
        prompt: "Where does this lesion sit?",
        options: ["Pituitary", "Frontal convexity", "Posterior fossa", "Spinal cord"],
        answer: "Frontal convexity",
      },
    ],
    teaching_points: [
      "New-onset seizure in older adults warrants imaging to rule out a structural lesion.",
      "Meningiomas are extra-axial; they displace rather than infiltrate brain.",
      "Dural tail is highly suggestive but not pathognomonic.",
    ],
    ground_truth: { region: "Right frontal convexity", confidence: 0.88 },
  },
  {
    id: "lc-003",
    title: "42M with right-hand weakness",
    difficulty: "intermediate",
    tumor_type: "low_grade",
    region: "Left precentral gyrus",
    patient: {
      age: 42,
      sex: "male",
      presenting_complaint: "Insidious right-hand clumsiness over 4 months.",
      history: "Negative.",
      exam: "Subtle right-hand pronator drift; otherwise intact.",
    },
    imaging: {
      modality_notes: "Non-enhancing T2/FLAIR hyperintensity in the left motor strip; no necrosis.",
    },
    quiz: [
      {
        id: "q1",
        type: "first_impression",
        prompt: "Non-enhancing infiltrative cortical lesion in a young adult favors:",
        options: ["Glioblastoma", "Low-grade glioma", "Metastasis", "Hemorrhage"],
        answer: "Low-grade glioma",
        rationale: "Lack of enhancement and slow progression in a younger patient is classic for low-grade glioma.",
      },
      {
        id: "q2",
        type: "modality",
        prompt: "Best modality to define infiltration boundaries?",
        options: ["T1", "T1-CE", "FLAIR", "DWI"],
        answer: "FLAIR",
      },
      {
        id: "q3",
        type: "localization",
        prompt: "Which region is involved?",
        options: ["Postcentral gyrus", "Precentral gyrus", "Cerebellum", "Brainstem"],
        answer: "Precentral gyrus",
        rationale: "Right-hand motor symptoms map to the contralateral motor cortex.",
      },
    ],
    teaching_points: [
      "Low-grade gliomas typically don't enhance.",
      "Slow, focal motor symptoms in a young adult deserve MRI.",
      "Eloquent motor cortex involvement requires intraoperative mapping.",
    ],
    ground_truth: { region: "Left precentral gyrus", confidence: 0.85 },
  },
  // Cases 4-15 follow the same shape but compressed for brevity.
  ...stub("lc-004", "29F with morning headaches", "intermediate", "low_grade", "Right frontal lobe"),
  ...stub("lc-005", "61M with confusion and falls", "intermediate", "metastasis", "Bilateral cerebral hemispheres"),
  ...stub("lc-006", "48F with visual field cut", "advanced", "glioblastoma", "Left occipital lobe"),
  ...stub("lc-007", "73M with cerebellar signs", "intermediate", "metastasis", "Cerebellum"),
  ...stub("lc-008", "35M with personality changes", "advanced", "low_grade", "Bilateral frontal lobes"),
  ...stub("lc-009", "58F with hearing loss", "advanced", "meningioma", "Cerebellopontine angle"),
  ...stub("lc-010", "63M with progressive hemiparesis", "advanced", "glioblastoma", "Right basal ganglia"),
  ...stub("lc-011", "27F with worsening headaches", "beginner", "meningioma", "Parasagittal"),
  ...stub("lc-012", "70M with stepwise decline", "intermediate", "metastasis", "Right parietal lobe"),
  ...stub("lc-013", "52F with seizures and confusion", "advanced", "glioblastoma", "Left frontal lobe"),
  ...stub("lc-014", "46M with vertigo and ataxia", "intermediate", "metastasis", "Right cerebellar hemisphere"),
  ...stub("lc-015", "33F with subtle language slip", "advanced", "low_grade", "Left temporal lobe"),
];

function stub(id, title, difficulty, tumor_type, region) {
  return [
    {
      id,
      title,
      difficulty,
      tumor_type,
      region,
      patient: {
        age: 30 + (parseInt(id.slice(-3), 10) % 50),
        sex: parseInt(id.slice(-1), 10) % 2 === 0 ? "female" : "male",
        presenting_complaint: title,
        history: "See linked BraTS case files for full history.",
        exam: "Focal neurologic findings consistent with the localization.",
      },
      imaging: {
        modality_notes: tumor_type === "glioblastoma"
          ? "T1-CE shows ring enhancement with central necrosis; surrounding FLAIR hyperintensity."
          : tumor_type === "meningioma"
            ? "Dural-based homogeneously enhancing extra-axial lesion."
            : tumor_type === "metastasis"
              ? "Multiple ring-enhancing lesions at gray-white junction."
              : "Non-enhancing T2/FLAIR hyperintensity, infiltrative.",
      },
      quiz: [
        {
          id: "q1",
          type: "first_impression",
          prompt: "Best initial differential given the history alone?",
          options: ["Tumor", "Stroke", "Infection", "Demyelination"],
          answer: "Tumor",
        },
        {
          id: "q2",
          type: "modality",
          prompt: "Most informative modality for this presentation?",
          options: ["T1", "T1-CE", "FLAIR", "DWI"],
          answer: tumor_type === "low_grade" ? "FLAIR" : "T1-CE",
        },
        {
          id: "q3",
          type: "localization",
          prompt: "Most likely lesion region?",
          options: [
            region,
            "Cerebellum",
            "Brainstem",
            "Bilateral frontal lobes",
          ],
          answer: region,
        },
      ],
      teaching_points: [
        `${tumor_type.replace("_", " ")} typically presents with localizing signs.`,
        "Always correlate imaging features with clinical history.",
        "Eloquent-cortex involvement changes surgical planning.",
      ],
      ground_truth: { region, confidence: 0.8 },
    },
  ];
}
