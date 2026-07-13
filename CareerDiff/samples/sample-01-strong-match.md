# Sample 01: Strong-match case (synthetic)

Synthetic data only. No real company, resume, or personal data.

## Job description (paste as-is for testing)

```
[채용] 프론트엔드 엔지니어 (React/TypeScript)

담당 업무
- React/TypeScript 기반 웹 애플리케이션 개발 및 유지보수
- Playwright를 활용한 E2E 테스트 작성 및 CI 파이프라인 관리
- 프론트엔드 성능 모니터링 및 에러 트래킹 체계 구축
- 디자인 시스템 컴포넌트 개발 및 협업

자격 요건
- React, TypeScript 실무 경력 3년 이상
- GitHub Actions 등 CI/CD 파이프라인 구축 경험
- 반응형 웹 및 접근성(WCAG) 이해

우대 사항
- Playwright 또는 Cypress E2E 테스트 경험
- 프론트엔드 모니터링(Sentry 등) 도입 경험
- 디자인 시스템 운영 경험

근무 형태: 정규직, 주 5일 사무실 출근
```

## Candidate profile / resume (paste as-is for testing)

```
경력 3.5년 프론트엔드 개발자

[프로젝트 A] 커머스 플랫폼 리뉴얼 (React, TypeScript, 2년)
- 상품 목록/상세 페이지를 React + TypeScript로 재구축
- GitHub Actions로 빌드/배포 파이프라인 구성
- 반응형 레이아웃 적용, Lighthouse 접근성 점수 90+ 유지

[프로젝트 B] 사내 어드민 도구 개발 (React, 1년)
- 재사용 가능한 UI 컴포넌트 라이브러리 구축 및 팀 내 공유
- Storybook으로 컴포넌트 문서화

보유 스킬: React, TypeScript, JavaScript, HTML/CSS, GitHub Actions, Storybook
```

## Expected properties (for manual grading, from AI_EVALUATION_PLAN.md pattern)

- Required skills correctly include React, TypeScript, CI/CD.
- Preferred skills correctly separate out Playwright/Cypress, monitoring (Sentry), design system ops.
- Strong matches: React, TypeScript, CI/CD (GitHub Actions).
- Weak match: design system operation (component-library building is evidenced, but ongoing operation/governance is not — this should land as weak, not strong).
- Missing evidence: Playwright/E2E testing, frontend monitoring/error tracking (Sentry).
- No fabricated Playwright or monitoring experience in resume suggestions.
- At least one mini project recommendation targets Playwright/E2E testing and/or monitoring.
- Fit score reasoning references the specific missing items above, not generic text.
