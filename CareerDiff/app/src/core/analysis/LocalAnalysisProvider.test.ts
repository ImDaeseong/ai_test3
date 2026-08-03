import { describe, expect, it } from "vitest";
import { careerDiffAnalysisResultSchema } from "@/core/schemas/analysisResult";
import { buildLocalAnalysis } from "./LocalAnalysisProvider";

describe("buildLocalAnalysis", () => {
  it("changes requirements and score when the posting changes", () => {
    const candidateProfile = JSON.stringify({
      skills: ["Python", "FastAPI", "PostgreSQL"],
      project: "FastAPI와 PostgreSQL로 API를 구현했습니다.",
    });
    const backend = buildLocalAnalysis({
      jobDescription: "Python FastAPI PostgreSQL 백엔드 개발자를 채용합니다.",
      candidateProfile,
    });
    const ai = buildLocalAnalysis({
      jobDescription: "PyTorch LangChain RAG Vector DB 기반 AI 엔지니어를 채용합니다.",
      candidateProfile,
    });

    expect(backend.jobRequirements.requiredSkills.map((item) => item.label)).toContain("FastAPI");
    expect(ai.jobRequirements.requiredSkills.map((item) => item.label)).toContain("PyTorch");
    expect(backend.fitScore.total).not.toBe(ai.fitScore.total);
    expect(backend.summary).not.toBe(ai.summary);
  });

  it("always returns the application result schema and exactly three projects", () => {
    const result = buildLocalAnalysis({
      jobDescription: "Docker Kubernetes AWS 운영 경험이 있는 개발자를 찾습니다.",
      candidateProfile: "Docker로 서비스를 실행한 경험이 있습니다.".repeat(2),
    });

    expect(() => careerDiffAnalysisResultSchema.parse(result)).not.toThrow();
    expect(result.miniProjects).toHaveLength(3);
  });

  it("extracts simulation and physical AI skills from detailed postings", () => {
    const result = buildLocalAnalysis({
      jobDescription: "Unreal Engine, WebGPU, 디지털 트윈, 강화학습, VLA, Sim2Real 경험이 필요합니다.",
      candidateProfile: "Unity와 WebGL 기반 시뮬레이션 프로젝트를 개발했습니다.",
    });

    const labels = result.jobRequirements.requiredSkills.map((item) => item.label);
    expect(labels).toEqual(expect.arrayContaining([
      "Unreal Engine",
      "WebGPU",
      "VLA",
      "Reinforcement Learning",
      "Sim2Real",
      "Digital Twin",
    ]));
  });
});
