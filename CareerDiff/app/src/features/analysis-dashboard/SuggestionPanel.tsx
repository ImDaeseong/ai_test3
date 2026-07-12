import type { ResumeSuggestions } from "@/core/types";
import { CopyButton } from "./CopyButton";

export function SuggestionPanel({ resumeSuggestions }: { resumeSuggestions: ResumeSuggestions }) {
  const hasAnything =
    resumeSuggestions.bullets.length > 0 ||
    resumeSuggestions.projectDescriptions.length > 0 ||
    resumeSuggestions.skillPriority.length > 0 ||
    resumeSuggestions.atsKeywords.length > 0;

  return (
    <section aria-labelledby="suggestion-panel-heading" className="rounded-lg border border-neutral-200 p-4">
      <h2 id="suggestion-panel-heading" className="text-sm font-semibold text-neutral-800">
        이력서 개선 제안
      </h2>
      {!hasAnything ? (
        <p className="mt-2 text-sm text-neutral-400">제안이 없습니다.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {resumeSuggestions.bullets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">이력서 불릿</h3>
              <ul className="mt-1 flex flex-col gap-2">
                {resumeSuggestions.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start justify-between gap-2 text-sm text-neutral-800">
                    <span>{bullet}</span>
                    <CopyButton text={bullet} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {resumeSuggestions.projectDescriptions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">프로젝트 설명</h3>
              <ul className="mt-1 flex flex-col gap-2">
                {resumeSuggestions.projectDescriptions.map((description) => (
                  <li key={description} className="flex items-start justify-between gap-2 text-sm text-neutral-800">
                    <span>{description}</span>
                    <CopyButton text={description} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {resumeSuggestions.skillPriority.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">스킬 우선순위</h3>
              <ol className="mt-1 list-decimal pl-5 text-sm text-neutral-800">
                {resumeSuggestions.skillPriority.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ol>
            </div>
          )}
          {resumeSuggestions.atsKeywords.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">ATS 키워드</h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {resumeSuggestions.atsKeywords.map((keyword) => (
                  <span key={keyword} className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
