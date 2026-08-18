import type { AnalyzeRequestInput } from "@/core/schemas/analyzeRequest";
import type {
  CareerDiffAnalysisResult,
  EvidenceItem,
  MatchItem,
  RelatedSkillGuidance,
  RequirementItem,
} from "@/core/types";

type SkillDefinition = {
  label: string;
  category: string;
  aliases: string[];
  /**
   * Labels of other SKILLS entries this one builds on or connects to (a
   * lightweight ontology relation, not a free-text guess). Only set where the
   * relationship is a well-established technical fact — most entries have none.
   */
  relatedTo?: string[];
};

const SKILLS: SkillDefinition[] = [
  { label: "Python", category: "language", aliases: ["python"] },
  { label: "Java", category: "language", aliases: ["java"] },
  { label: "Kotlin", category: "language", aliases: ["kotlin"] },
  { label: "TypeScript", category: "language", aliases: ["typescript"] },
  { label: "JavaScript", category: "language", aliases: ["javascript"] },
  { label: "FastAPI", category: "framework", aliases: ["fastapi"] },
  { label: "Django", category: "framework", aliases: ["django"] },
  { label: "Flask", category: "framework", aliases: ["flask"] },
  { label: "Spring", category: "framework", aliases: ["spring"] },
  { label: "Node.js", category: "framework", aliases: ["node.js", "nodejs"] },
  { label: "React", category: "framework", aliases: ["react"] },
  { label: "Next.js", category: "framework", aliases: ["next.js", "nextjs"], relatedTo: ["React"] },
  { label: "SQL", category: "database", aliases: ["sql"] },
  { label: "PostgreSQL", category: "database", aliases: ["postgresql", "postgres"], relatedTo: ["SQL"] },
  { label: "MySQL", category: "database", aliases: ["mysql"], relatedTo: ["SQL"] },
  { label: "Redis", category: "database", aliases: ["redis"] },
  { label: "MongoDB", category: "database", aliases: ["mongodb"] },
  { label: "Elasticsearch", category: "database", aliases: ["elasticsearch"] },
  { label: "AWS", category: "infrastructure", aliases: ["aws", "amazon web services"] },
  { label: "GCP", category: "infrastructure", aliases: ["gcp", "google cloud"] },
  { label: "Azure", category: "infrastructure", aliases: ["azure"] },
  { label: "Docker", category: "infrastructure", aliases: ["docker"], relatedTo: ["Kubernetes"] },
  { label: "Kubernetes", category: "infrastructure", aliases: ["kubernetes", "k8s"], relatedTo: ["Docker"] },
  { label: "Terraform", category: "infrastructure", aliases: ["terraform"] },
  { label: "GitHub Actions", category: "delivery", aliases: ["github actions"], relatedTo: ["CI/CD"] },
  { label: "CI/CD", category: "delivery", aliases: ["ci/cd", "cicd"], relatedTo: ["GitHub Actions"] },
  { label: "REST API", category: "api", aliases: ["rest api", "restful"] },
  { label: "GraphQL", category: "api", aliases: ["graphql"] },
  { label: "Kafka", category: "messaging", aliases: ["kafka"] },
  { label: "RabbitMQ", category: "messaging", aliases: ["rabbitmq"] },
  { label: "Airflow", category: "data", aliases: ["airflow"], relatedTo: ["Spark"] },
  { label: "Spark", category: "data", aliases: ["spark"] },
  { label: "PyTorch", category: "ai", aliases: ["pytorch"], relatedTo: ["CUDA"] },
  { label: "TensorFlow", category: "ai", aliases: ["tensorflow"], relatedTo: ["CUDA"] },
  { label: "LangChain", category: "ai", aliases: ["langchain"], relatedTo: ["LLM"] },
  { label: "LangGraph", category: "ai", aliases: ["langgraph"], relatedTo: ["LangChain"] },
  { label: "RAG", category: "ai", aliases: ["rag", "retrieval augmented"], relatedTo: ["Vector DB", "LangChain"] },
  { label: "LLM", category: "ai", aliases: ["llm", "large language model"], relatedTo: ["OpenAI"] },
  { label: "OpenAI", category: "ai", aliases: ["openai", "gpt"] },
  { label: "Embedding", category: "ai", aliases: ["embedding", "임베딩"], relatedTo: ["Vector DB"] },
  {
    label: "Vector DB",
    category: "ai",
    aliases: ["vector db", "vector database", "벡터 db", "벡터 데이터베이스"],
    relatedTo: ["Embedding"],
  },
  { label: "Unreal Engine", category: "simulation", aliases: ["unreal engine", "unreal", "언리얼"] },
  { label: "Unity", category: "simulation", aliases: ["unity3d", "unity"] },
  { label: "WebGL", category: "simulation", aliases: ["webgl"] },
  { label: "WebGPU", category: "simulation", aliases: ["webgpu"] },
  {
    label: "VLA",
    category: "ai",
    aliases: ["vla", "vision-language-action"],
    relatedTo: ["Reinforcement Learning", "Computer Vision"],
  },
  {
    label: "Reinforcement Learning",
    category: "ai",
    aliases: ["reinforcement learning", "강화학습"],
    relatedTo: ["Sim2Real"],
  },
  { label: "Sim2Real", category: "simulation", aliases: ["sim2real"], relatedTo: ["Reinforcement Learning", "Digital Twin"] },
  {
    label: "Digital Twin",
    category: "simulation",
    aliases: ["digital twin", "디지털 트윈"],
    relatedTo: ["Unreal Engine", "Unity"],
  },
  { label: "Playwright", category: "testing", aliases: ["playwright"] },
  { label: "Selenium", category: "testing", aliases: ["selenium"] },
  { label: "BeautifulSoup", category: "collection", aliases: ["beautifulsoup", "beautiful soup"] },
  // Added from real postings (C++/C#/Flutter/HTML/CSS/QA/DevOps were present but
  // unmatched) plus common languages/frameworks that were missing. Aliases are
  // kept substring-safe on purpose — e.g. no bare "go"/"뷰"/"rust", which would
  // falsely match 하고/인터뷰/cluster.
  { label: "C++", category: "language", aliases: ["c++"] },
  { label: "C#", category: "language", aliases: ["c#"] },
  { label: "Go", category: "language", aliases: ["golang"] },
  { label: "Swift", category: "language", aliases: ["swift"] },
  { label: "PHP", category: "language", aliases: ["php"] },
  { label: "Vue.js", category: "framework", aliases: ["vue.js", "vuejs", "vue"] },
  { label: "Angular", category: "framework", aliases: ["angular"] },
  { label: "Flutter", category: "framework", aliases: ["flutter", "플러터"] },
  { label: "HTML", category: "frontend", aliases: ["html"] },
  { label: "CSS", category: "frontend", aliases: ["css"] },
  { label: "DevOps", category: "delivery", aliases: ["devops"], relatedTo: ["CI/CD"] },
  { label: "QA", category: "testing", aliases: ["qa"] },
  // Robotics/hardware domain, added from real CTO/로봇 postings. Aliases stay
  // substring-safe — no bare "ros" (across), "imu" (simulation), or "제어"
  // (원격제어), which would false-match.
  { label: "Robotics", category: "robotics", aliases: ["로봇", "로보틱스", "robotics"], relatedTo: ["ROS", "Embedded"] },
  { label: "Mechatronics", category: "robotics", aliases: ["메카트로닉스", "mechatronics"] },
  { label: "Autonomous Driving", category: "robotics", aliases: ["자율주행", "autonomous driving"] },
  { label: "ROS", category: "robotics", aliases: ["ros2", "ros 2", "robot operating system"], relatedTo: ["Robotics"] },
  { label: "Embedded", category: "hardware", aliases: ["embedded", "임베디드"], relatedTo: ["Firmware", "MCU"] },
  { label: "Firmware", category: "hardware", aliases: ["firmware", "펌웨어"], relatedTo: ["Embedded", "MCU"] },
  { label: "Computer Vision", category: "ai", aliases: ["computer vision", "컴퓨터 비전", "컴퓨터비전"], relatedTo: ["PyTorch", "TensorFlow"] },
  { label: "CUDA", category: "ai", aliases: ["cuda"], relatedTo: ["PyTorch", "TensorFlow"] },
  // Added from a real 로봇제어/강화학습 posting (C, Linux, CATIA, NX, OrCAD,
  // CUDA, MCU, Embedded, SIMD listed as required 스킬) that a local-analyzer
  // run left mostly unmatched. Bare "NX" is skipped as unsafe (2-char substring).
  { label: "Linux", category: "infrastructure", aliases: ["linux", "리눅스"] },
  { label: "CATIA", category: "hardware", aliases: ["catia"] },
  { label: "OrCAD", category: "hardware", aliases: ["orcad"] },
  { label: "MCU", category: "hardware", aliases: ["mcu"], relatedTo: ["Embedded", "Firmware"] },
  { label: "SIMD", category: "hardware", aliases: ["simd"] },
  // Added from a real "C# WPF 개발자" posting where a 47-case batch test run
  // left WPF unmatched. CIM/HCM from the same 스킬 line were skipped as
  // ambiguous ERP-module acronyms, not identifiable developer skills.
  { label: "WPF", category: "framework", aliases: ["wpf"], relatedTo: ["C#"] },
];

const FALLBACK_GAPS = ["요구사항 기반 API 구현", "자동화 테스트", "배포 및 운영 문서화"];

function includesSkill(text: string, skill: SkillDefinition): boolean {
  const lower = text.toLowerCase();
  return skill.aliases.some((alias) => lower.includes(alias));
}

export type AnalysisReadiness = {
  /** True only when this analyzer can produce a non-empty analysis. */
  ready: boolean;
  detectedSkills: string[];
  reason?: "too-short" | "no-known-skills";
};

const MIN_ANALYZABLE_LENGTH = 30;

/**
 * The analyzer's own judgment of whether a job description will produce a
 * usable analysis. It is the single source of truth for readiness: the
 * importer delegates here instead of guessing from text markers, so a
 * requirements heading with no recognizable skill is correctly not ready
 * (it would still yield an empty analysis). When the analyzer changes (e.g.
 * an LLM provider), this readiness logic changes with it.
 */
export function inspectJobDescription(description: string): AnalysisReadiness {
  const detectedSkills = SKILLS.filter((skill) => includesSkill(description, skill)).map((skill) => skill.label);
  if (description.trim().length < MIN_ANALYZABLE_LENGTH) {
    return { ready: false, detectedSkills, reason: "too-short" };
  }
  if (detectedSkills.length === 0) {
    return { ready: false, detectedSkills, reason: "no-known-skills" };
  }
  return { ready: true, detectedSkills };
}

function evidenceSnippet(text: string, skill: SkillDefinition): string {
  const line = text
    .split(/\r?\n/)
    .find((candidate) => includesSkill(candidate, skill))
    ?.trim();
  return (line || `${skill.label} 관련 내용이 후보자 프로필에 포함되어 있습니다.`).slice(0, 240);
}

function requirement(skill: SkillDefinition, index: number, prefix: string): RequirementItem {
  return {
    id: `${prefix}-${index + 1}`,
    label: skill.label,
    category: skill.category,
    confidence: "high",
  };
}

export function buildLocalAnalysis(input: AnalyzeRequestInput): CareerDiffAnalysisResult {
  const preferredMarker = input.jobDescription.search(/우대|preferred|plus/i);
  const detected = SKILLS.filter((skill) => includesSkill(input.jobDescription, skill));
  const required = detected.filter((skill) => {
    if (preferredMarker < 0) return true;
    const first = Math.min(
      ...skill.aliases
        .map((alias) => input.jobDescription.toLowerCase().indexOf(alias))
        .filter((index) => index >= 0),
    );
    return first < preferredMarker;
  });
  const preferred = detected.filter((skill) => !required.includes(skill));
  const matched = detected.filter((skill) => includesSkill(input.candidateProfile, skill));
  const missing = detected.filter((skill) => !matched.includes(skill));
  const denominator = detected.length || 1;
  const score = detected.length ? Math.round((matched.length / denominator) * 100) : 40;

  const evidence: EvidenceItem[] = matched.map((skill, index) => ({
    id: `evidence-${index + 1}`,
    label: skill.label,
    sourceSnippet: evidenceSnippet(input.candidateProfile, skill),
    confidence: "high",
  }));
  const strong: MatchItem[] = matched.map((skill, index) => ({
    requirement: skill.label,
    status: "strong",
    reason: `후보자 프로필에서 ${skill.label} 관련 직접 근거가 확인됩니다.`,
    evidenceSnippet: evidence[index].sourceSnippet,
    sourceEvidenceId: evidence[index].id,
  }));
  const missingMatches: MatchItem[] = missing.map((skill) => ({
    requirement: skill.label,
    status: "missing",
    reason: `후보자 프로필에서 ${skill.label} 관련 근거를 찾지 못했습니다.`,
  }));
  const gaps = missing.length ? missing.map((skill) => skill.label) : FALLBACK_GAPS;
  const projectGaps = Array.from({ length: 3 }, (_, index) => gaps[index % gaps.length]);

  // A lightweight ontology pass: for each missing skill with a known relation,
  // explain the connection and, when the candidate already has a related
  // skill, name it as a concrete starting point instead of a bare gap list.
  const relatedSkillGuidance: RelatedSkillGuidance[] = missing
    .filter((skill) => (skill.relatedTo?.length ?? 0) > 0)
    .map((skill) => {
      const relatedLabels = skill.relatedTo ?? [];
      const bridgeSkills = relatedLabels.filter((label) =>
        SKILLS.some((related) => related.label === label && includesSkill(input.candidateProfile, related)),
      );
      const reason = bridgeSkills.length
        ? `${skill.label}은 ${relatedLabels.join(", ")}과 연결된 기술입니다. 후보자는 이미 ${bridgeSkills.join(", ")} 경험이 있어 ${skill.label} 학습의 출발점으로 활용할 수 있습니다.`
        : `${skill.label}은 ${relatedLabels.join(", ")}과 연결된 기술입니다. 관련 기술부터 함께 준비하면 학습 경로를 좁힐 수 있습니다.`;
      return { skill: skill.label, relatedSkills: relatedLabels, reason };
    });

  return {
    fitScore: {
      total: score,
      categories: [
        {
          label: "기술 요구사항 일치",
          score,
          reason: `공고에서 찾은 기술 ${detected.length}개 중 ${matched.length}개가 후보자 프로필에서 확인됩니다.`,
        },
        {
          label: "근거 충실도",
          score: matched.length ? Math.min(100, 50 + matched.length * 10) : 20,
          reason: `직접 인용 가능한 기술 근거 ${matched.length}개를 확인했습니다.`,
        },
      ],
    },
    summary: detected.length
      ? `공고 기술 ${detected.map((skill) => skill.label).join(", ")} 중 ${matched.length}개가 일치하고 ${missing.length}개는 근거가 부족합니다.`
      : "공고에서 알려진 기술 키워드를 충분히 추출하지 못했습니다. 공고 본문과 후보자 프로필을 직접 확인해 주세요.",
    jobRequirements: {
      requiredSkills: required.map((skill, index) => requirement(skill, index, "required")),
      preferredSkills: preferred.map((skill, index) => requirement(skill, index, "preferred")),
      domain: [],
      collaboration: [],
      deliveryExpectations: [],
    },
    candidateEvidence: {
      skills: evidence,
      projects: [],
      responsibilities: [],
      achievements: [],
      collaboration: [],
    },
    retrievalContext: {
      enabled: false,
      query: "",
      items: [],
      provider: "none",
      filters: {
        visibility: ["private"],
        sourceTypes: [],
        maxPiiRisk: "low",
      },
    },
    matches: {
      strong,
      weak: [],
      missing: missingMatches,
      risks: detected.length
        ? []
        : [{ requirement: "기술 요구사항", status: "risk", reason: "공고에서 비교 가능한 기술 키워드를 추출하지 못했습니다." }],
    },
    resumeSuggestions: {
      bullets: matched.slice(0, 3).map((skill) => `${skill.label}을 활용한 프로젝트의 역할, 규모, 성과 수치를 이력서에 명시하세요.`),
      projectDescriptions: projectGaps.map((gap) => `${gap} 보완 프로젝트의 문제, 구현, 테스트, 결과를 한 문단으로 정리하세요.`),
      skillPriority: gaps,
      atsKeywords: detected.map((skill) => skill.label),
    },
    miniProjects: projectGaps.map((gap, index) => ({
      title: `${gap} 검증 프로젝트 ${index + 1}`,
      goal: `${gap}에 대한 직접적인 구현 근거를 만듭니다.`,
      targetGaps: [gap],
      deliverables: ["실행 가능한 소스 코드", "자동화 테스트", "설계와 실행 방법을 설명하는 README"],
      suggestedDurationDays: 3,
    })),
    interviewPrep: {
      questions: detected.slice(0, 5).map((skill) => `${skill.label}을 실제 프로젝트에서 어떻게 사용했는지 설명해 주세요.`),
      weakAreas: gaps,
      sevenDayPlan: [
        `1일차: 공고 요구 기술 ${detected.map((skill) => skill.label).join(", ") || "원문"} 정리`,
        "2일차: 후보자 프로필의 직접 근거와 성과 수치 정리",
        `3~4일차: ${projectGaps[0]} 보완 프로젝트 구현`,
        "5일차: 이력서 프로젝트 설명 수정",
        "6일차: 예상 질문에 STAR 형식으로 답변",
        "7일차: 모의 면접과 누락 근거 최종 점검",
      ],
    },
    relatedSkillGuidance,
    metadata: {
      schemaVersion: "1.0.0",
      modelVersion: "local-keyword-analyzer",
      scoringVersion: "local-1.0.0",
      retrievalUsed: false,
      persisted: false,
    },
  };
}
