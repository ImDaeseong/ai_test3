import type { AnalysisValidationCase } from "@/core/validation/analysisValidationStore";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString("ko-KR");
}

function snippet(text: string, length: number): string {
  const trimmed = text.trim();
  return trimmed.length > length ? `${trimmed.slice(0, length)}...` : trimmed;
}

/**
 * Lists every accumulated validation case so past analyses can be browsed and
 * reopened, not only downloaded as one JSON blob (AnalysisJsonPanel). Each
 * row also surfaces relatedSkillGuidance's count — the ontology-bridge output
 * — since that is what distinguishes one case's analysis from a bare score.
 */
export function ValidationCaseHistoryPanel({
  cases,
  selectedCaseId,
  onSelect,
}: {
  cases: AnalysisValidationCase[];
  selectedCaseId: string | null;
  onSelect: (validationCase: AnalysisValidationCase) => void;
}) {
  if (cases.length === 0) return null;

  const ordered = [...cases].reverse();

  return (
    <section aria-labelledby="validation-case-history-heading" className="rounded-lg border border-neutral-200 p-4">
      <h2 id="validation-case-history-heading" className="text-sm font-semibold text-neutral-800">
        분석 히스토리 ({cases.length}건)
      </h2>
      <ul className="mt-3 flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
        {ordered.map((item) => {
          const selected = item.id === selectedCaseId;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                aria-pressed={selected}
                className={`w-full rounded-md border p-3 text-left text-sm ${
                  selected ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-neutral-800">{snippet(item.jobDescription, 40)}</span>
                  <span className="text-xs text-neutral-500">{formatDate(item.createdAt)}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-600">
                  <span>적합도 {item.result.fitScore.total}점</span>
                  <span>연관 기술 가이드 {item.result.relatedSkillGuidance.length}건</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
