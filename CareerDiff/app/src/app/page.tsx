"use client";

import { useState } from "react";
import type { AnalyzeResponse, ApiErrorResponse, CareerDiffAnalysisResult } from "@/core/types";
import { AnalysisDashboard } from "@/features/analysis-dashboard/AnalysisDashboard";
import {
  CandidateProfileInputPanel,
  isCandidateProfileValid,
} from "@/features/candidate-profile-input/CandidateProfileInputPanel";
import { isJobDescriptionValid, JobDescriptionInputPanel } from "@/features/job-description-input/JobDescriptionInputPanel";

type Status = "idle" | "loading" | "error" | "done";

/**
 * Owns page composition and analysis state (docs/design/UI_DESIGN.md
 * "UI component boundaries"). Input panels and the dashboard stay
 * display/input-only and receive typed props or callbacks.
 */
export default function AnalyzerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [candidateProfile, setCandidateProfile] = useState("");
  const [targetSeniority, setTargetSeniority] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CareerDiffAnalysisResult | null>(null);

  const canAnalyze =
    isJobDescriptionValid(jobDescription) && isCandidateProfileValid(candidateProfile) && status !== "loading";

  async function handleAnalyze() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          candidateProfile,
          targetRole: targetRole || undefined,
          targetSeniority: targetSeniority || undefined,
        }),
      });
      if (!response.ok) {
        const body = (await response.json()) as ApiErrorResponse;
        setErrorMessage(body.error.message);
        setStatus("error");
        return;
      }
      const body = (await response.json()) as AnalyzeResponse;
      setResult(body.result);
      setStatus("done");
    } catch {
      setErrorMessage("네트워크 오류로 분석에 실패했습니다. 다시 시도해 주세요.");
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold text-neutral-900">CareerDiff</h1>
        <p className="mt-1 text-sm text-neutral-600">
          채용공고와 이력서/커리어를 비교해 적합도, 부족한 역량, 이력서 수정안, 보완 프로젝트, 면접 준비 플랜을 확인하세요.
        </p>
      </header>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        CareerDiff는 기본적으로 이력서나 채용공고를 저장하지 않습니다. 비밀번호, 토큰, 사내 전용 식별자, 고객 개인정보 등
        민감한 정보는 붙여넣지 마세요.
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <JobDescriptionInputPanel
          value={jobDescription}
          onChange={setJobDescription}
          targetRole={targetRole}
          onTargetRoleChange={setTargetRole}
        />
        <CandidateProfileInputPanel
          value={candidateProfile}
          onChange={setCandidateProfile}
          targetSeniority={targetSeniority}
          onTargetSeniorityChange={setTargetSeniority}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? "분석 중..." : "분석하기"}
        </button>
      </div>

      {status === "error" && errorMessage && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {result && <AnalysisDashboard result={result} />}
    </main>
  );
}
