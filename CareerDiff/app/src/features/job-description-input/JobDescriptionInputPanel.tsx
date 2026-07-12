"use client";

import { useState } from "react";

export const JOB_DESCRIPTION_MIN_LENGTH = 30;

export function isJobDescriptionValid(value: string): boolean {
  return value.trim().length >= JOB_DESCRIPTION_MIN_LENGTH;
}

export type JobDescriptionInputPanelProps = {
  value: string;
  onChange: (value: string) => void;
  targetRole: string;
  onTargetRoleChange: (value: string) => void;
};

export function JobDescriptionInputPanel({ value, onChange, targetRole, onTargetRoleChange }: JobDescriptionInputPanelProps) {
  const [touched, setTouched] = useState(false);
  const trimmedLength = value.trim().length;
  const isEmpty = trimmedLength === 0;
  const isTooShort = !isEmpty && trimmedLength < JOB_DESCRIPTION_MIN_LENGTH;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="job-description" className="text-sm font-semibold text-neutral-800">
        채용공고
      </label>
      <textarea
        id="job-description"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => setTouched(true)}
        rows={10}
        placeholder="채용공고 원문을 붙여넣으세요."
        className="w-full resize-y rounded-md border border-neutral-300 p-3 text-sm focus:border-neutral-500 focus:outline-none"
      />
      <div className="flex min-h-[1rem] items-center justify-between text-xs text-neutral-500">
        <span>{trimmedLength.toLocaleString()}자</span>
        {touched && isEmpty && <span role="alert" className="text-red-600">채용공고를 입력해 주세요.</span>}
        {touched && isTooShort && (
          <span role="alert" className="text-red-600">최소 {JOB_DESCRIPTION_MIN_LENGTH}자 이상 입력해 주세요.</span>
        )}
      </div>
      <input
        type="text"
        value={targetRole}
        onChange={(event) => onTargetRoleChange(event.target.value)}
        placeholder="목표 직무 (선택)"
        className="w-full rounded-md border border-neutral-300 p-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
    </div>
  );
}
