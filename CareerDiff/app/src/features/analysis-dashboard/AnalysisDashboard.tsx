import type { CareerDiffAnalysisResult } from "@/core/types";
import { InterviewPrepPanel } from "./InterviewPrepPanel";
import { MatchPanel } from "./MatchPanel";
import { MiniProjectPanel } from "./MiniProjectPanel";
import { RequirementPanel } from "./RequirementPanel";
import { ScorePanel } from "./ScorePanel";
import { SuggestionPanel } from "./SuggestionPanel";

/**
 * Page-level composition for the result view (docs/features/10). Display-only:
 * it must not recalculate any analysis logic, only render `result`.
 */
export function AnalysisDashboard({ result }: { result: CareerDiffAnalysisResult }) {
  return (
    <div className="flex flex-col gap-4">
      <ScorePanel fitScore={result.fitScore} summary={result.summary} />
      <RequirementPanel jobRequirements={result.jobRequirements} />
      <MatchPanel matches={result.matches} />
      <SuggestionPanel resumeSuggestions={result.resumeSuggestions} />
      <MiniProjectPanel miniProjects={result.miniProjects} />
      <InterviewPrepPanel interviewPrep={result.interviewPrep} />
    </div>
  );
}
