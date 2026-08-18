"use client";

import { useEffect, useState } from "react";
import { inspectJobDescription } from "@/core/analysis/LocalAnalysisProvider";
import type { AnalyzeResponse, ApiErrorResponse, CareerDiffAnalysisResult } from "@/core/types";
import {
  appendValidationCase,
  loadValidationCases,
  type AnalysisValidationCase,
} from "@/core/validation/analysisValidationStore";
import { AnalysisDashboard } from "@/features/analysis-dashboard/AnalysisDashboard";
import { AnalysisJsonPanel } from "@/features/analysis-dashboard/AnalysisJsonPanel";
import { ValidationCaseHistoryPanel } from "@/features/analysis-dashboard/ValidationCaseHistoryPanel";
import {
  CandidateProfileInputPanel,
  isCandidateProfileValid,
} from "@/features/candidate-profile-input/CandidateProfileInputPanel";
import { JobDescriptionInputPanel } from "@/features/job-description-input/JobDescriptionInputPanel";

type Status = "idle" | "loading" | "error" | "done";

/**
 * Owns page composition and analysis state (docs/ARCHITECTURE.md
 * "UI component boundaries"). Input panels and the dashboard stay
 * display/input-only and receive typed props or callbacks.
 */
export default function AnalyzerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [candidateProfile, setCandidateProfile] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationCount, setValidationCount] = useState(0);
  const [result, setResult] = useState<CareerDiffAnalysisResult | null>(null);
  const [cases, setCases] = useState<AnalysisValidationCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  useEffect(() => {
    // Deferred to a microtask so state updates happen in a callback rather
    // than synchronously in the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      const loaded = loadValidationCases();
      setCases(loaded);
      setValidationCount(loaded.length);
      if (loaded.length > 0) {
        const last = loaded[loaded.length - 1];
        setResult(last.result);
        setSelectedCaseId(last.id);
      }
    });
  }, []);

  function handleSelectCase(validationCase: AnalysisValidationCase) {
    setResult(validationCase.result);
    setSelectedCaseId(validationCase.id);
  }

  // Enable on length only. The local skill dictionary is incomplete, so a job
  // with no recognized skill must NOT be a hard block (it would trap valid
  // postings) — it stays analyzable with a non-blocking warning, and the
  // zero-match banner explains any empty result afterward.
  const jobReadiness = inspectJobDescription(jobDescription);
  const jobLengthOk = jobReadiness.reason !== "too-short";
  const candidateReady = isCandidateProfileValid(candidateProfile);
  const canAnalyze = jobLengthOk && candidateReady && status !== "loading";
  const missingInputs = [!jobLengthOk && "채용공고", !candidateReady && "이력서/커리어"].filter(Boolean);
  const noSkillWarning = canAnalyze && jobReadiness.reason === "no-known-skills";

  async function handleAnalyze() {
    setStatus("loading");
    setErrorMessage(null);
    setValidationError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          candidateProfile,
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
      try {
        const { cases: updatedCases, added } = appendValidationCase({
          jobDescription,
          candidateProfile,
          result: body.result,
        });
        setCases(updatedCases);
        setValidationCount(updatedCases.length);
        const matchedCase =
          added ??
          updatedCases.find(
            (existingCase) =>
              existingCase.jobDescription === jobDescription &&
              existingCase.candidateProfile === candidateProfile &&
              JSON.stringify(existingCase.result) === JSON.stringify(body.result),
          );
        if (matchedCase) setSelectedCaseId(matchedCase.id);
        // Identical input and result already stored: skip the redundant file write.
        if (added) {
          const saveResponse = await fetch("/api/validation-cases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(added),
          });
          if (!saveResponse.ok) {
            throw new Error("Validation case file save failed.");
          }
        }
      } catch {
        setValidationError("분석은 완료됐지만 검증 데이터를 브라우저 또는 data 폴더에 저장하지 못했습니다.");
      }
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
        첨부한 후보자 JSON은 이 브라우저에 저장되고, 분석 검증 데이터는 브라우저와 CareerDiff/data 폴더에 저장됩니다.
        비밀번호, 토큰, 사내 전용 식별자, 고객 개인정보 등 민감한 정보는 첨부하지 마세요. 누적 JSON을 외부에 공유하기
        전 개인정보를 확인하세요.
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <JobDescriptionInputPanel
          value={jobDescription}
          onChange={setJobDescription}
        />
        <CandidateProfileInputPanel
          value={candidateProfile}
          onChange={setCandidateProfile}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? "분석 중..." : "분석하기"}
        </button>
        {status !== "loading" && missingInputs.length > 0 && (
          <p className="text-xs text-neutral-500">분석하려면 {missingInputs.join("와 ")}를 30자 이상 입력하세요.</p>
        )}
        {noSkillWarning && (
          <p className="text-xs text-amber-700">
            인식된 기술 요건이 없어 분석 결과가 제한적일 수 있습니다. 공고의 상세 모집요강을 붙여넣으면 더 정확합니다.
          </p>
        )}
      </div>

      {status === "error" && errorMessage && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {validationError && <p role="alert" className="text-sm text-red-600">{validationError}</p>}

      <ValidationCaseHistoryPanel cases={cases} selectedCaseId={selectedCaseId} onSelect={handleSelectCase} />

      {result && (
        <>
          <AnalysisJsonPanel result={result} validationCount={validationCount} />
          <AnalysisDashboard result={result} />
        </>
      )}
    </main>
  );
}
