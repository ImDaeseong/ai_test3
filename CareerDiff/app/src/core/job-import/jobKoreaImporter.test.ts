import { describe, expect, it } from "vitest";
import {
  JobImportError,
  parseJobKoreaDetailHtml,
  parseJobKoreaHtml,
  validateJobKoreaUrl,
} from "./jobKoreaImporter";

describe("validateJobKoreaUrl", () => {
  it("accepts only JobKorea detail URLs", () => {
    expect(validateJobKoreaUrl("https://www.jobkorea.co.kr/Recruit/GI_Read/49431616").hostname).toBe("www.jobkorea.co.kr");
    expect(() => validateJobKoreaUrl("http://www.jobkorea.co.kr/Recruit/GI_Read/1")).toThrow(JobImportError);
    expect(() => validateJobKoreaUrl("https://evil.example/Recruit/GI_Read/1")).toThrow(JobImportError);
    expect(() => validateJobKoreaUrl("https://www.jobkorea.co.kr/Recruit")).toThrow(JobImportError);
  });
});

describe("parseJobKoreaHtml", () => {
  it("returns structured JSON from a public posting page", () => {
    const html = `<html><head>
      <meta property="og:title" content="테스트회사 채용 - AI 백엔드 개발자 | 잡코리아">
      </head><body><main>
      <h1>AI 백엔드 개발자</h1>
      <section><h2>모집요강</h2><p>FastAPI와 Python을 사용한 API 개발</p></section>
      <section><h2>지원자격</h2><p>백엔드 개발 경력 및 RAG 서비스 경험을 우대합니다.</p></section>
      <section><h2>접수기간/방법</h2><p>잡코리아 즉시지원으로 접수합니다.</p></section>
      </main></body></html>`;
    expect(parseJobKoreaHtml(html, "https://www.jobkorea.co.kr/Recruit/GI_Read/1", "2026-07-31T00:00:00.000Z")).toEqual({
      source: "jobkorea",
      sourceUrl: "https://www.jobkorea.co.kr/Recruit/GI_Read/1",
      title: "테스트회사 채용 - AI 백엔드 개발자",
      company: "테스트회사",
      description: expect.stringContaining("FastAPI와 Python"),
      fetchedAt: "2026-07-31T00:00:00.000Z",
    });
  });

  it("removes numeric-only internal skill codes", () => {
    const html = `<html><head><title>테스트회사 채용 - 개발자 | 잡코리아</title></head><body><main>
      <h1>개발자</h1><p>1710001335</p><p>Python 개발 업무를 담당합니다.</p>
      <p>지원 자격과 업무 내용을 충분히 설명하기 위한 공개 채용공고 본문입니다.</p>
      <p>서비스 설계, 구현, 테스트, 배포 및 운영 과정에 참여하고 동료와 기술 내용을 공유합니다.</p>
    </main></body></html>`;

    const result = parseJobKoreaHtml(html, "https://www.jobkorea.co.kr/Recruit/GI_Read/1");
    expect(result.description).toContain("Python 개발 업무");
    expect(result.description).not.toContain("1710001335");
  });
});

describe("parseJobKoreaDetailHtml", () => {
  it("decodes the serialized detail content from the Next.js payload", () => {
    const html = String.raw`<html><body><script>self.__next_f.push([1,"payload:
      \u003cdiv id=\"template_common_title\"\u003e
      \u003ch1\u003ePhysical AI 로봇 시뮬레이션 기술총괄\u003c/h1\u003e
      \u003cp\u003eWebGPU와 디지털 트윈 기반 Sim2Real 파이프라인을 설계합니다.\u003c/p\u003e
      \u003cp\u003e강화학습 및 VLA 경험을 우대합니다.\u003c/p\u003e
      \u003c/div\u003e"])</script></body></html>`;

    const result = parseJobKoreaDetailHtml(html);
    expect(result).toContain("Physical AI 로봇 시뮬레이션 기술총괄");
    expect(result).toContain("WebGPU와 디지털 트윈");
    expect(result).not.toContain("self.__next_f");
  });
});
