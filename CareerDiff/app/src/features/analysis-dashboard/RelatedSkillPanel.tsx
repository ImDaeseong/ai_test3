import type { RelatedSkillGuidance } from "@/core/types";

export function RelatedSkillPanel({ relatedSkillGuidance }: { relatedSkillGuidance: RelatedSkillGuidance[] }) {
  return (
    <section aria-labelledby="related-skill-panel-heading" className="rounded-lg border border-neutral-200 p-4">
      <h2 id="related-skill-panel-heading" className="text-sm font-semibold text-neutral-800">
        연관 기술 가이드
      </h2>
      {relatedSkillGuidance.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-400">연결된 기술 정보가 없습니다.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {relatedSkillGuidance.map((guidance) => (
            <li key={guidance.skill} className="rounded-md border border-neutral-200 p-3">
              <p className="text-sm font-semibold text-neutral-800">{guidance.skill}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {guidance.relatedSkills.map((related) => (
                  <span key={related} className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-700">
                    {related}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-500">{guidance.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
