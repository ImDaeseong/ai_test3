"use client";

import { useState } from "react";

export const CANDIDATE_PROFILE_MIN_LENGTH = 30;

export function isCandidateProfileValid(value: string): boolean {
  return value.trim().length >= CANDIDATE_PROFILE_MIN_LENGTH;
}

export type CandidateProfileInputPanelProps = {
  value: string;
  onChange: (value: string) => void;
  targetSeniority: string;
  onTargetSeniorityChange: (value: string) => void;
};

export function CandidateProfileInputPanel({
  value,
  onChange,
  targetSeniority,
  onTargetSeniorityChange,
}: CandidateProfileInputPanelProps) {
  const [touched, setTouched] = useState(false);
  const trimmedLength = value.trim().length;
  const isEmpty = trimmedLength === 0;
  const isTooShort = !isEmpty && trimmedLength < CANDIDATE_PROFILE_MIN_LENGTH;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="candidate-profile" className="text-sm font-semibold text-neutral-800">
        이력서 / 커리어 / 프로젝트
      </label>
      <textarea
        id="candidate-profile"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => setTouched(true)}
        rows={10}
        placeholder="이력서, 커리어 요약, 프로젝트 설명을 붙여넣으세요."
        className="w-full resize-y rounded-md border border-neutral-300 p-3 text-sm focus:border-neutral-500 focus:outline-none"
      />
      <div className="flex min-h-[1rem] items-center justify-between text-xs text-neutral-500">
        <span>{trimmedLength.toLocaleString()}자</span>
        {touched && isEmpty && <span role="alert" className="text-red-600">이력서/커리어 정보를 입력해 주세요.</span>}
        {touched && isTooShort && (
          <span role="alert" className="text-red-600">최소 {CANDIDATE_PROFILE_MIN_LENGTH}자 이상 입력해 주세요.</span>
        )}
      </div>
      <input
        type="text"
        value={targetSeniority}
        onChange={(event) => onTargetSeniorityChange(event.target.value)}
        placeholder="목표 연차/시니어리티 (선택)"
        className="w-full rounded-md border border-neutral-300 p-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
      <p className="text-xs text-amber-700">
        비밀번호, 토큰, 사내 전용 식별자 등 민감 정보는 붙여넣지 마세요.
      </p>
    </div>
  );
}
