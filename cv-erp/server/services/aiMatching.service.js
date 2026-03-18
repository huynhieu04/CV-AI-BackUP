// server/services/aiMatching.service.js
const { generateJson } = require("./geminiClient");
const Job = require("../models/job.model");
const MatchResult = require("../models/MatchResult");

/**
 * HR-GRADE MATCHING (Stable + Explainable)
 * - Seniority: Intern | Fresher | Junior | Mid | Senior | Lead | Unknown
 * - Không undefined jobTitle/jobCode
 * - Score/label backend rule để HR tin được
 */

/* =========================================================
   1) TEXT PREPROCESS + HEURISTICS
   ========================================================= */

function normalizeText(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function detectSignals(rawText) {
  const t = String(rawText || "").toLowerCase();

  // Base flags
  const isStudent = /\bstudent\b|sinh viên|đang học|undergraduate|đại học|university|college/.test(t);
  const isIntern = /\bintern(ship)?\b|thực tập|\btt\b/.test(t);
  const isFresher = /\bfresher\b|mới tốt nghiệp|new graduate|fresh graduate/.test(t);

  // Context: school/club vs company/work
  const hasStudentContext =
    /clb|câu lạc bộ|đoàn|hội|tân sinh viên|khoa|trường|campus|student organization|đội tình nguyện|văn phòng khoa/.test(
      t
    );

  const hasWorkContext =
    /company|công ty|doanh nghiệp|khách hàng|client|kpi|doanh thu|revenue|full[-\s]?time|part[-\s]?time|nhân viên|phòng ban|báo cáo cho|report to|stakeholder/.test(
      t
    );

  // Leadership keywords (soft + hard)
  const hasLeaderKeywords =
    /\b(team lead|leader|lead|manager|supervisor|head of|tech lead|project lead)\b|trưởng nhóm|quản lý|trưởng bộ phận|giám sát/.test(
      t
    );

  const hasManagerKeywords =
    /\b(manager|head of|supervisor)\b|trưởng bộ phận|quản lý|giám sát/.test(t);

  const hasSeniorKeywords = /\bsenior\b|\bsr\b|sr\./.test(t);
  const hasJuniorKeywords = /\bjunior\b|\bjr\b|jr\./.test(t);

  // Leader appears mainly in school context -> treat as potential (avoid over-level)
  const leaderStudentContext = hasLeaderKeywords && hasStudentContext && !hasWorkContext;

  return {
    isStudent,
    isIntern,
    isFresher,

    hasStudentContext,
    hasWorkContext,

    hasLeaderKeywords,
    hasManagerKeywords,
    leaderStudentContext,

    hasSeniorKeywords,
    hasJuniorKeywords,
  };
}

/* =========================================================
   2) EXPERIENCE MONTHS (Prefer experienceText)
   ========================================================= */

const MONTHS = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

function nowYearMonth() {
  const d = new Date();
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
}

function parseYearMonth(token) {
  const s = String(token || "").trim().toLowerCase();

  // Month name + year: "jun 2025"
  const mName = s.match(/\b([a-z]{3,9})\b\W+(\d{4})/i);
  if (mName) {
    const mm = MONTHS[mName[1].toLowerCase()];
    const yy = Number(mName[2]);
    if (mm && yy) return { y: yy, m: mm };
  }

  // MM/YYYY or MM-YYYY
  const mmyy = s.match(/(\d{1,2})\s*[\/-]\s*(\d{4})/);
  if (mmyy) {
    const mm = Number(mmyy[1]);
    const yy = Number(mmyy[2]);
    if (mm >= 1 && mm <= 12 && yy >= 1970) return { y: yy, m: mm };
  }

  // Year only
  const yy = s.match(/\b(19\d{2}|20\d{2})\b/);
  if (yy) return { y: Number(yy[1]), m: 1 };

  // Present
  if (/present|now|current|hiện tại|nay/.test(s)) return nowYearMonth();

  return null;
}

function toIndex(ym) {
  return ym.y * 12 + (ym.m - 1);
}

// Merge ranges để không double-count
function mergeRanges(ranges) {
  if (!ranges.length) return [];
  const sorted = ranges
    .map((r) => ({ s: toIndex(r.from), e: toIndex(r.to) }))
    .filter((r) => r.e >= r.s)
    .sort((a, b) => a.s - b.s);

  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = merged[merged.length - 1];
    if (cur.s <= last.e + 1) {
      last.e = Math.max(last.e, cur.e);
    } else {
      merged.push(cur);
    }
  }
  return merged;
}

function estimateExperienceMonthsFromText(text) {
  const t = String(text || "").replace(/\u2013|\u2014/g, "-"); // en dash -> -
  const lower = t.toLowerCase();

  // Range patterns: "06/2025 - 11/2025", "Jun 2025 - Nov 2025", "2022 - 2024", "... - Present"
  const rangeRegex =
    /(\b(?:\d{1,2}[\/-]\d{4}|[a-z]{3,9}\s+\d{4}|\d{4})\b)\s*-\s*(\b(?:\d{1,2}[\/-]\d{4}|[a-z]{3,9}\s+\d{4}|present|now|current|hiện tại|\d{4})\b)/gi;

  let m;
  const ranges = [];
  while ((m = rangeRegex.exec(lower)) !== null) {
    const from = parseYearMonth(m[1]);
    const to = parseYearMonth(m[2]);
    if (from && to) ranges.push({ from, to });
  }

  let months = 0;

  if (ranges.length) {
    const merged = mergeRanges(ranges);
    for (const r of merged) months += r.e - r.s + 1;
  } else {
    // fallback "x years" patterns
    const yrRange = lower.match(/(\d+)\s*[-]\s*(\d+)\s*(years?|năm)/);
    if (yrRange) {
      const a = Number(yrRange[1]);
      const b = Number(yrRange[2]);
      if (!Number.isNaN(a) && !Number.isNaN(b)) return Math.round((a + b) / 2) * 12;
    }

    const plus = lower.match(/(\d+)\s*\+\s*(years?|năm)/);
    if (plus) {
      const n = Number(plus[1]);
      if (!Number.isNaN(n)) return n * 12;
    }

    const more = lower.match(/hơn\s*(\d+)\s*năm/);
    if (more) {
      const n = Number(more[1]);
      if (!Number.isNaN(n)) return n * 12;
    }

    const single = lower.match(/(\d+)\s*(years?|năm)/);
    if (single) {
      const n = Number(single[1]);
      if (!Number.isNaN(n)) return n * 12;
    }
  }

  if (months > 600) months = 600;
  return months || null;
}

function estimateYearsOfExperienceFromMonths(months) {
  if (typeof months !== "number" || months <= 0) return null;
  return Math.round((months / 12) * 10) / 10;
}

/**
 * Seniority hint (HR-safe):
 * - Student/Intern có ưu tiên cao (chặn over Senior/Lead)
 * - Leader trong trường -> chỉ coi là potential (không auto Lead)
 * - months là nguồn ổn định nhất
 */
function deriveSeniorityHint(signals, months) {
  const m = typeof months === "number" ? months : null;

  // 1) Intern
  if (signals.isIntern) {
    if (m !== null) {
      if (m <= 6) return "Intern";
      if (m <= 12) return "Fresher";
      if (m <= 24) return "Junior";
      return "Mid";
    }
    return "Intern";
  }

  // 2) Student (không auto Intern nữa, để Fresher an toàn hơn)
  if (signals.isStudent) {
    if (m !== null) {
      if (m <= 12) return "Fresher";
      if (m <= 24) return "Junior";
      if (m <= 48) return "Mid";
      if (m <= 72) return "Senior";
      return "Lead";
    }
    return signals.isFresher ? "Fresher" : "Fresher";
  }

  // 3) Leader keywords (phân biệt school vs work)
  if (signals.hasLeaderKeywords) {
    // Lead trong CLB/trường: không cho Lead, max Mid (hoặc Senior nếu months thật sự đủ)
    if (signals.leaderStudentContext) {
      if (m !== null) {
        if (m <= 24) return "Junior";
        if (m <= 48) return "Mid";
        return "Senior";
      }
      return "Mid";
    }

    // Lead trong work context: cần months đủ để lên Senior/Lead
    if (m !== null) {
      if (m >= 72) return "Lead";   // >= 6 năm
      if (m >= 48) return "Senior"; // 4-6 năm
      if (m >= 24) return "Mid";    // 2-4 năm
      return "Junior";              // <2 năm mà lead -> thường lead dự án nhỏ
    }

    if (signals.hasWorkContext && signals.hasManagerKeywords) return "Senior";
    return "Mid";
  }

  // 4) months thresholds (ổn định)
  if (m !== null) {
    if (m <= 12) return "Fresher";
    if (m <= 24) return "Junior";
    if (m <= 48) return "Mid";
    if (m <= 72) return "Senior";
    return "Lead";
  }

  // 5) keyword fallback
  if (signals.isFresher) return "Fresher";
  if (signals.hasSeniorKeywords) return "Senior";
  if (signals.hasJuniorKeywords) return "Junior";
  return "Unknown";
}

function calcSeniorityConfidence(months, signals) {
  const m = typeof months === "number" ? months : null;

  // Student/intern detect khá chắc, nhưng level chỉ là ước lượng -> Medium
  if (signals.isIntern || signals.isStudent) return "Medium";

  if (m !== null) {
    if (m >= 36) return "High";
    if (m >= 12) return "Medium";
    return "Low";
  }

  if (signals.hasWorkContext) return "Medium";
  return "Low";
}

function buildStructuredCvText(cvData) {
  const parts = [
    `CANDIDATE: ${cvData.name || ""} | ${cvData.email || ""} | ${cvData.phone || ""}`,
    `SENIORITY_HINT: ${cvData.seniorityHint || "Unknown"} | CONFIDENCE: ${cvData.seniorityConfidence || "N/A"} | YEARS: ${cvData.yearsOfExperience ?? "N/A"} | MONTHS: ${cvData.monthsOfExperience ?? "N/A"}`,
    `SIGNALS: ${JSON.stringify(cvData.signals || {})}`,
    "",
    `SKILLS: ${cvData.skillsText || ""}`,
    `EXPERIENCE: ${cvData.experienceText || ""}`,
    `EDUCATION: ${cvData.educationText || ""}`,
    `LANGUAGES: ${cvData.languagesText || ""}`,
    "",
    `RAW_TEXT: ${cvData.rawText || ""}`,
  ];

  return normalizeText(parts.join("\n"));
}

/* =========================================================
   3) PROMPT + PAYLOAD
   ========================================================= */

function buildSystemInstruction() {
  return `
Bạn là hệ thống AI so khớp CV với Job Description (JD) cho HR.

NGUYÊN TẮC:
- Chỉ trả về JSON đúng schema, KHÔNG thêm text.
- Dựa trên CV + từng JD để chấm điểm phù hợp 0-100.
- Output phải ổn định và nhất quán.

ENUM:
- candidateSummary.seniority: Intern | Fresher | Junior | Mid | Senior | Lead | Unknown
- label: Suitable | Potential | NotFit

XÁC ĐỊNH SENIORITY:
- Ưu tiên dùng cv.seniorityHint nếu nó không phải Unknown.
- Nếu cv.seniorityHint = Unknown, suy ra từ CV (experience/skills) và dữ liệu timeline.

RÀNG BUỘC CHỐNG OVER-LEVEL:
- Nếu signals.isStudent = true hoặc signals.isIntern = true thì candidateSummary.seniority KHÔNG được là Senior/Lead,
  trừ khi monthsOfExperience >= 48.
- Nếu signals.leaderStudentContext = true (lead trong CLB/trường) thì tối đa candidateSummary.seniority = Mid
  (hoặc Senior nếu monthsOfExperience >= 48).
- "Lead" chỉ dùng khi có bằng chứng quản lý trong môi trường doanh nghiệp + kinh nghiệm đủ (ưu tiên months).

CHẤM ĐIỂM:
- skills: mức khớp kỹ năng chính
- experience: mức khớp kinh nghiệm / dự án
- education: mức khớp học vấn / chuyên ngành
- languages: mức khớp ngoại ngữ (nếu JD yêu cầu)
- Tổng score là tổng hợp có trọng số, phải hợp lý và có thể giải thích.

LEVEL MAPPING (JD level -> seniority yêu cầu):
- Intern -> Intern
- Junior -> Junior
- Middle -> Mid
- Senior -> Senior
- Manager -> Lead

Nếu seniority ứng viên lệch xa level JD => trừ điểm.

BẮT BUỘC MỖI MATCH PHẢI CÓ (đúng y như input jobs[]):
- jobId
- jobCode
- jobTitle

TRẢ JSON:
{
  "candidateSummary": {
    "mainSkills": ["string"],
    "mainDomains": ["string"],
    "seniority": "Intern|Fresher|Junior|Mid|Senior|Lead|Unknown",
    "confidence": "Low|Medium|High"
  },
  "matches": [
    {
      "jobId": "id JD",
      "jobCode": "mã JD",
      "jobTitle": "tên JD",
      "score": 0-100,
      "label": "Suitable|Potential|NotFit",
      "reasons": ["..."],
      "breakdown": {
        "skills": 0-100,
        "experience": 0-100,
        "education": 0-100,
        "languages": 0-100
      }
    }
  ],
  "bestJobId": "id phù hợp nhất hoặc null",
  "disclaimer": "string"
}
`.trim();
}

function buildPayload(cvData, jobs) {
  const structured = buildStructuredCvText(cvData);

  return {
    cv: {
      name: cvData.name,
      email: cvData.email,
      phone: cvData.phone,
      seniorityHint: cvData.seniorityHint,
      seniorityConfidence: cvData.seniorityConfidence,
      yearsOfExperience: cvData.yearsOfExperience,
      monthsOfExperience: cvData.monthsOfExperience,
      signals: cvData.signals,
      structuredText: structured,
    },
    jobs: jobs.map((j) => ({
      id: j._id?.toString?.() || j.id,
      code: j.code,
      title: j.title,
      level: j.level || "",
      type: j.type || "",
      skillsRequired: j.skillsRequired || "",
      experienceRequired: j.experienceRequired || "",
      educationRequired: j.educationRequired || "",
      description: j.description || "",
    })),
  };
}

/* =========================================================
   4) NORMALIZE + ENFORCE OUTPUT
   ========================================================= */

function clampScore(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function labelByScore(score) {
  if (score >= 75) return "Suitable";
  if (score >= 50) return "Potential";
  return "NotFit";
}

function levelToSeniority(level) {
  const map = {
    Intern: "Intern",
    Junior: "Junior",
    Middle: "Mid",
    Senior: "Senior",
    Manager: "Lead",
  };
  return map[level] || null;
}

function seniorityDistance(a, b) {
  const order = {
    Intern: 1,
    Fresher: 2,
    Junior: 3,
    Mid: 4,
    Senior: 5,
    Lead: 6,
    Unknown: 3, // treat Unknown ~ Junior
  };
  const da = order[a] ?? 3;
  const db = order[b] ?? 3;
  return Math.abs(da - db);
}

function applyLevelPenalty(score, candidateSeniority, jobLevel) {
  const required = levelToSeniority(jobLevel);
  if (!required) return score;

  const dist = seniorityDistance(candidateSeniority, required);

  let penalty = 0;
  if (dist === 1) penalty = 6;
  if (dist === 2) penalty = 14;
  if (dist >= 3) penalty = 24;

  return clampScore(score - penalty);
}

function enforceSeniority(result, cvData) {
  if (!result) return result;
  if (!result.candidateSummary) result.candidateSummary = {};

  const allowed = new Set(["Intern", "Fresher", "Junior", "Mid", "Senior", "Lead", "Unknown"]);
  const s = result.candidateSummary.seniority;

  // 1) sanitize enum
  if (!allowed.has(s)) result.candidateSummary.seniority = "Unknown";

  // 2) nếu model Unknown thì dùng hint backend
  if (result.candidateSummary.seniority === "Unknown" && cvData?.seniorityHint) {
    result.candidateSummary.seniority = cvData.seniorityHint;
  }

  // 3) confidence (nếu model không trả)
  if (!result.candidateSummary.confidence && cvData?.seniorityConfidence) {
    result.candidateSummary.confidence = cvData.seniorityConfidence;
  }

  // 4) ✅ HARD RULE chống "Lead bậy" cho student/intern
  // - student/intern: KHÔNG được Lead (trừ khi months >= 48)
  const sig = cvData?.signals || {};
  const months = cvData?.monthsOfExperience;

  if ((sig.isStudent || sig.isIntern) && result.candidateSummary.seniority === "Lead") {
    const ok = typeof months === "number" && months >= 48;
    if (!ok) result.candidateSummary.seniority = "Mid"; // hoặc "Senior" tùy bạn
  }

  // 5) ✅ nếu leaderStudentContext (CLB/trường) thì cap max Mid (trừ khi months >= 48)
  if (sig.leaderStudentContext && result.candidateSummary.seniority === "Lead") {
    const ok = typeof months === "number" && months >= 48;
    if (!ok) result.candidateSummary.seniority = "Mid";
  }

  return result;
}


function fillJobFields(matches, jobsById, jobsByCode) {
  return (matches || []).map((m) => {
    const out = { ...m };

    const job =
      (out.jobId && jobsById.get(String(out.jobId))) ||
      (out.jobCode && jobsByCode.get(String(out.jobCode)));

    if (job) {
      out.jobId = out.jobId || String(job._id);
      out.jobCode = out.jobCode || job.code;
      out.jobTitle = out.jobTitle || job.title;
      out._jobLevel = job.level || "";
    } else {
      out._unmapped = true;
    }

    out.score = clampScore(out.score);

    if (out.breakdown && typeof out.breakdown === "object") {
      out.breakdown = {
        skills: clampScore(out.breakdown.skills),
        experience: clampScore(out.breakdown.experience),
        education: clampScore(out.breakdown.education),
        languages: clampScore(out.breakdown.languages),
      };
    } else {
      out.breakdown = { skills: 0, experience: 0, education: 0, languages: 0 };
    }

    if (!Array.isArray(out.reasons)) out.reasons = [];

    return out;
  });
}

function normalizeAndEnforceResult(result, cvData, jobs) {
  if (!result) return result;
  if (!Array.isArray(result.matches)) result.matches = [];

  const jobsById = new Map(jobs.map((j) => [String(j._id), j]));
  const jobsByCode = new Map(jobs.map((j) => [String(j.code), j]));

  result = enforceSeniority(result, cvData);

  let matches = fillJobFields(result.matches, jobsById, jobsByCode);
  matches = matches.filter((m) => !m._unmapped);

  const candSeniority = result?.candidateSummary?.seniority || "Unknown";
  matches = matches.map((m) => {
    const newScore = applyLevelPenalty(m.score, candSeniority, m._jobLevel || "");
    return { ...m, score: newScore, label: labelByScore(newScore) };
  });

  matches.sort((a, b) => (b.score || 0) - (a.score || 0));

  if (!result.bestJobId) result.bestJobId = matches[0]?.jobId || null;

  // default disclaimer (if model didn't return)
  if (!result.disclaimer) {
    result.disclaimer =
      "Kết quả AI hỗ trợ sàng lọc ban đầu dựa trên nội dung CV; không thay thế đánh giá nhân sự trực tiếp (phỏng vấn và thử việc).";
  }

  result.matches = matches.map((m) => {
    const { _jobLevel, _unmapped, ...clean } = m;
    return clean;
  });

  return result;
}

/* =========================================================
   5) GEMINI CALL (SAFE PARSE)
   ========================================================= */

async function matchCvWithJobsGemini(cvData, jobs) {
  const systemInstruction = buildSystemInstruction();
  const payload = buildPayload(cvData, jobs);

  const raw = await generateJson(systemInstruction, JSON.stringify(payload, null, 2));

  if (raw && typeof raw === "object") return raw;

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return {
        candidateSummary: {
          mainSkills: [],
          mainDomains: [],
          seniority: cvData.seniorityHint || "Unknown",
          confidence: cvData.seniorityConfidence || "Low",
        },
        matches: [],
        bestJobId: null,
        disclaimer:
          "Kết quả AI hỗ trợ sàng lọc ban đầu dựa trên nội dung CV; không thay thế đánh giá nhân sự trực tiếp (phỏng vấn và thử việc).",
        _parseError: String(e?.message || e),
        _raw: raw?.slice?.(0, 2000),
      };
    }
  }

  return null;
}

/* =========================================================
   6) SAVE MATCH HISTORY
   ========================================================= */

async function saveMatchHistory({ candidateId, cvFileId, result }) {
  if (!candidateId || !cvFileId || !result?.matches?.length) return;

  const bulkOps = result.matches.map((m) => ({
    updateOne: {
      filter: {
        candidate: candidateId,
        job: m.jobId,
        provider: "gemini",
        cvFile: cvFileId,
      },
      update: {
        $set: {
          candidate: candidateId,
          cvFile: cvFileId,
          job: m.jobId,
          provider: "gemini",
          score: m.score ?? null,
          label: m.label || null,
          breakdown: m.breakdown || {},
          reasons: m.reasons || [],
          rawResponse: result,
        },
      },
      upsert: true,
    },
  }));

  if (bulkOps.length) await MatchResult.bulkWrite(bulkOps);
}

/* =========================================================
   7) MAIN ENTRY
   ========================================================= */

async function matchCandidateToJobs(candidate, rawText, cvFileId) {
  const raw = normalizeText(rawText);

  // ⭐ ưu tiên estimate exp từ experienceText để tránh dính Education date
  const expTextForEstimate = candidate.experienceText || raw;
  const signals = detectSignals(expTextForEstimate || raw);

  const months = estimateExperienceMonthsFromText(expTextForEstimate || raw);
  const years = estimateYearsOfExperienceFromMonths(months);
  const seniorityHint = deriveSeniorityHint(signals, months);
  const seniorityConfidence = calcSeniorityConfidence(months, signals);

  const cvData = {
    name: candidate.fullName || "",
    email: candidate.email || "",
    phone: candidate.phone || "",

    skillsText: Array.isArray(candidate.skills) ? candidate.skills.join(", ") : "",
    experienceText: candidate.experienceText || "",

    // ✅ FIX: extractor trả educationText, không phải education
    educationText: candidate.educationText || candidate.education || "",

    languagesText: Array.isArray(candidate.languages) ? candidate.languages.join(", ") : "",

    rawText: raw,

    monthsOfExperience: months,
    yearsOfExperience: years,
    signals,
    seniorityHint,
    seniorityConfidence,
  };

  const jobs = await Job.find({ isActive: true }).lean();
  if (!jobs.length) return null;

  let result = await matchCvWithJobsGemini(cvData, jobs);
  result = normalizeAndEnforceResult(result, cvData, jobs);

  await saveMatchHistory({
    candidateId: candidate._id,
    cvFileId,
    result,
  });

  return result;
}

module.exports = {
  matchCvWithJobsGemini,
  matchCandidateToJobs,
};
