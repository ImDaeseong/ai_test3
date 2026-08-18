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

  it("explains a missing skill's ontology relation when the candidate has no bridge skill", () => {
    const result = buildLocalAnalysis({
      jobDescription: "RAG 기반 검색 시스템을 구축할 AI 엔지니어를 찾습니다.",
      candidateProfile: "Python으로 데이터 파이프라인을 구축한 경험이 있습니다.",
    });

    expect(result.relatedSkillGuidance).toEqual([
      expect.objectContaining({
        skill: "RAG",
        relatedSkills: ["Vector DB", "LangChain", "LLM"],
      }),
    ]);
    expect(result.relatedSkillGuidance[0].reason).not.toContain("이미");
  });

  it("names the candidate's existing skill as a bridge toward a missing related skill", () => {
    const result = buildLocalAnalysis({
      jobDescription: "Docker Kubernetes 운영 경험이 있는 개발자를 찾습니다.",
      candidateProfile: "Docker로 서비스를 컨테이너화해 운영한 경험이 있습니다.".repeat(2),
    });

    const kubernetesGuidance = result.relatedSkillGuidance.find((guidance) => guidance.skill === "Kubernetes");
    expect(kubernetesGuidance?.reason).toContain("Docker");
    expect(kubernetesGuidance?.reason).toContain("이미");
  });

  it("covers ontology relations added for web/data/delivery skills", () => {
    const result = buildLocalAnalysis({
      jobDescription: "Next.js, PostgreSQL, GitHub Actions, Airflow, WPF 경험이 있는 개발자를 찾습니다.",
      candidateProfile: "React와 SQL 기반 웹 서비스를 개발한 경험이 있습니다.",
    });

    const bySkill = Object.fromEntries(result.relatedSkillGuidance.map((g) => [g.skill, g]));
    expect(bySkill["Next.js"].relatedSkills).toEqual(["React"]);
    expect(bySkill["PostgreSQL"].relatedSkills).toEqual(["SQL"]);
    expect(bySkill["GitHub Actions"].relatedSkills).toEqual(["CI/CD"]);
    expect(bySkill["Airflow"].relatedSkills).toEqual(["Spark", "Python"]);
    expect(bySkill["WPF"].relatedSkills).toEqual(["C#"]);
  });

  it("covers ontology relations added for base-language and successor-API links", () => {
    const result = buildLocalAnalysis({
      jobDescription:
        "FastAPI, Django, Flask, Spring, Kotlin, PyTorch, TensorFlow, WebGPU 경험이 있는 개발자를 찾습니다.",
      candidateProfile: "웹 서비스와 백엔드 시스템을 개발한 경험이 있습니다.".repeat(2),
    });

    const bySkill = Object.fromEntries(result.relatedSkillGuidance.map((g) => [g.skill, g]));
    expect(bySkill["FastAPI"].relatedSkills).toEqual(["Python"]);
    expect(bySkill["Django"].relatedSkills).toEqual(["Python"]);
    expect(bySkill["Flask"].relatedSkills).toEqual(["Python"]);
    expect(bySkill["Spring"].relatedSkills).toEqual(["Java"]);
    expect(bySkill["Kotlin"].relatedSkills).toEqual(["Java"]);
    expect(bySkill["PyTorch"].relatedSkills).toEqual(["CUDA", "Python"]);
    expect(bySkill["TensorFlow"].relatedSkills).toEqual(["CUDA", "Python"]);
    expect(bySkill["WebGPU"].relatedSkills).toEqual(["WebGL"]);
  });

  it("names Python as the bridge skill for a missing Python web framework", () => {
    const result = buildLocalAnalysis({
      jobDescription: "Django 기반 백엔드 개발자를 채용합니다.",
      candidateProfile: "Python으로 데이터 처리 스크립트를 여러 개 작성한 경험이 있습니다.".repeat(2),
    });

    const djangoGuidance = result.relatedSkillGuidance.find((guidance) => guidance.skill === "Django");
    expect(djangoGuidance?.reason).toContain("Python");
    expect(djangoGuidance?.reason).toContain("이미");
  });

  it("covers ontology relations added in the second pass (frontend runtime links, engine languages, new DB/language skills)", () => {
    const result = buildLocalAnalysis({
      jobDescription:
        "TypeScript, Node.js, React, Vue.js, Angular, Unity, Unreal Engine, BeautifulSoup, MSSQL, MariaDB, Delphi 경험이 있는 개발자를 찾습니다.",
      candidateProfile: "웹 서비스와 게임 클라이언트를 개발한 경험이 있습니다.".repeat(2),
    });

    const bySkill = Object.fromEntries(result.relatedSkillGuidance.map((g) => [g.skill, g]));
    expect(bySkill["TypeScript"].relatedSkills).toEqual(["JavaScript"]);
    expect(bySkill["Node.js"].relatedSkills).toEqual(["JavaScript"]);
    expect(bySkill["React"].relatedSkills).toEqual(["JavaScript"]);
    expect(bySkill["Vue.js"].relatedSkills).toEqual(["JavaScript"]);
    expect(bySkill["Angular"].relatedSkills).toEqual(["TypeScript"]);
    expect(bySkill["Unity"].relatedSkills).toEqual(["C#"]);
    expect(bySkill["Unreal Engine"].relatedSkills).toEqual(["C++"]);
    expect(bySkill["BeautifulSoup"].relatedSkills).toEqual(["Python"]);
    expect(bySkill["MS SQL Server"].relatedSkills).toEqual(["SQL"]);
    expect(bySkill["MariaDB"].relatedSkills).toEqual(["SQL"]);
    // Delphi has no relatedTo — it was added as a standalone recognized skill.
    expect(bySkill["Delphi"]).toBeUndefined();

    const requiredLabels = result.jobRequirements.requiredSkills.map((item) => item.label);
    expect(requiredLabels).toEqual(expect.arrayContaining(["Delphi", "MS SQL Server"]));
  });

  it("recognizes Delphi and MS SQL Server from a real 'C, C#, C++, Delphi, JAVA, MSSQL, DBMS' posting", () => {
    const result = inspectJobDescription(
      "채용분야: 관제/정산시스템 개발자. 스킬: C, C#, C++, Delphi, JAVA, MSSQL, DBMS",
    );
    expect(result.ready).toBe(true);
    expect(result.detectedSkills).toEqual(
      expect.arrayContaining(["C#", "C++", "Delphi", "Java", "MS SQL Server"]),
    );
  });

  it("bridges a missing skill through a multi-hop relatedTo chain when no direct neighbor matches", () => {
    // LangGraph -> LangChain -> LLM -> OpenAI is a 3-hop relatedTo chain.
    // The candidate only has OpenAI, two hops past LangGraph's direct
    // neighbor (LangChain), so a 1-hop lookup would find no bridge at all.
    const result = buildLocalAnalysis({
      jobDescription: "LangGraph 기반 에이전트 시스템을 구축할 AI 엔지니어를 찾습니다.",
      candidateProfile: "OpenAI API로 챗봇을 만든 경험이 있습니다.".repeat(2),
    });

    const langGraphGuidance = result.relatedSkillGuidance.find((guidance) => guidance.skill === "LangGraph");
    expect(langGraphGuidance?.relatedSkills).toEqual(["LangChain"]);
    expect(langGraphGuidance?.reason).toContain("OpenAI → LLM → LangChain");
  });

  it("does not bridge a missing skill beyond MAX_BRIDGE_DEPTH hops", () => {
    // VLA -> Reinforcement Learning -> Sim2Real -> Digital Twin -> Unreal
    // Engine/Unity is 4 hops from VLA's direct neighbor (Reinforcement
    // Learning), past the 3-hop bridge limit, so no bridge should be found.
    const result = buildLocalAnalysis({
      jobDescription: "VLA 모델을 다루는 로보틱스 엔지니어를 찾습니다.",
      candidateProfile: "Unity로 3D 시뮬레이션 환경을 개발한 경험이 있습니다.".repeat(2),
    });

    const vlaGuidance = result.relatedSkillGuidance.find((guidance) => guidance.skill === "VLA");
    expect(vlaGuidance?.reason).not.toContain("이미");
    expect(vlaGuidance?.reason).not.toContain("→");
  });
});
