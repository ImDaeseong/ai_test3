import { describe, expect, it } from "vitest";
import { careerDiffAnalysisResultSchema } from "@/core/schemas/analysisResult";
import { jobReadinessFixtures } from "./jobReadiness.fixtures";
import { buildLocalAnalysis, inspectJobDescription } from "./LocalAnalysisProvider";

function classify(description: string): "ready" | "no-known-skills" | "too-short" {
  const readiness = inspectJobDescription(description);
  if (readiness.ready) return "ready";
  return readiness.reason ?? "no-known-skills";
}

describe("inspectJobDescription semantic regression (labeled fixtures)", () => {
  it.each(jobReadinessFixtures)("classifies '$label' as $expected", ({ description, expected }) => {
    expect(classify(description)).toBe(expected);
  });
});

describe("inspectJobDescription", () => {
  it("is ready only when a known skill is present", () => {
    expect(inspectJobDescription("Python과 AWS로 백엔드 서비스를 운영할 개발자를 찾습니다.").ready).toBe(true);
    const noSkill = inspectJobDescription("매장 운영과 고객 응대를 담당할 매니저를 모집합니다. 경력 3년 이상.");
    expect(noSkill.ready).toBe(false);
    expect(noSkill.reason).toBe("no-known-skills");
  });

  it("is not ready for text below the analyzable length", () => {
    const short = inspectJobDescription("개발자 모집");
    expect(short.ready).toBe(false);
    expect(short.reason).toBe("too-short");
  });

  it("recognizes skills added from real postings (C++/Flutter/HTML)", () => {
    const result = inspectJobDescription("프런트엔드 개발자 모집. 담당업무는 Flutter, HTML, CSS와 C++ 기반 개발입니다.");
    expect(result.ready).toBe(true);
    expect(result.detectedSkills).toEqual(expect.arrayContaining(["Flutter", "HTML", "CSS", "C++"]));
  });

  it("recognizes hardware/CAD skills added from a real 로봇제어 posting", () => {
    const result = inspectJobDescription(
      "로봇제어/강화학습 연구·개발자 채용. 스킬: C, C++, Linux, CATIA, NX, OrCAD, CUDA, MCU, Embedded, SIMD",
    );
    expect(result.ready).toBe(true);
    expect(result.detectedSkills).toEqual(
      expect.arrayContaining(["C++", "Linux", "CATIA", "OrCAD", "CUDA", "MCU", "Embedded", "SIMD"]),
    );
  });

  it("recognizes WPF from a real 'C# WPF 개발자' posting", () => {
    const result = inspectJobDescription("모집분야: C# WPF 개발자. 스킬: C#, WPF, CIM, HCM");
    expect(result.ready).toBe(true);
    expect(result.detectedSkills).toEqual(expect.arrayContaining(["C#", "WPF"]));
  });
});

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
