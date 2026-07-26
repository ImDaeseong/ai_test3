from app.crawler.parser import parse_job_detail, parse_job_list


def test_parse_job_list():
    html = """
    <html><body>
      <article>
        <div class="company-name">테스트회사</div>
        <a href="/Recruit/GI_Read/12345">C# MFC 개발팀장</a>
        <p>서울 금천구 경력10년↑ 08/20 마감</p>
      </article>
    </body></html>
    """
    jobs = parse_job_list(html)
    assert len(jobs) == 1
    assert jobs[0].title == "C# MFC 개발팀장"
    assert jobs[0].company_name == "테스트회사"


def test_parse_job_list_handles_current_site_dual_anchor_layout():
    """2026-07 실측: 회사명 앵커와 제목 앵커가 같은 GI_Read 링크를 공유한다."""
    html = """
    <html><body>
      <li>
        <a href="/Recruit/GI_Read/49999999">가상회사</a>
        <span>즐겨찾기</span>
        <a href="/Recruit/GI_Read/49999999">C# MFC 개발팀장 채용/신입ㅣ정규직</a>
        <span>스크랩</span>
        <p>경력무관 학력무관 서울 강남구 D-9</p>
      </li>
    </body></html>
    """
    jobs = parse_job_list(html)
    assert len(jobs) == 1
    assert jobs[0].company_name == "가상회사"
    assert jobs[0].title == "C# MFC 개발팀장 채용/신입ㅣ정규직"
    assert jobs[0].deadline == "D-9"
    assert "즐겨찾기" not in jobs[0].summary
    assert "스크랩" not in jobs[0].summary


def test_parse_job_detail_strips_ai_recommendation_boilerplate():
    """공고 본문과 무관한 'AI추천공고' 상용구가 classify()의 AI 키워드로 오인되지 않아야 한다."""
    html = """
    <html><body>
      <main>
        <div data-sentry-component="CompanyName">가상회사</div>
        <div data-sentry-component="Qualification">지원자격 경력무관 학력무관 스킬 우대조건 엑셀 문서작업</div>
        <p>로그인 하고 비슷한 조건의 AI추천공고를 확인해 보세요! TOP 궁금해요</p>
      </main>
    </body></html>
    """
    detail = parse_job_detail(html)
    assert detail.company_name == "가상회사"
    assert "AI추천공고" not in detail.summary
    assert "AI추천공고" not in detail.requirements
    assert detail.requirements.startswith("지원자격")
    assert detail.preferred.startswith("우대조건")


def test_parse_job_detail_ai_recommend_widget_is_removed_entirely():
    """AIRecommendList 컴포넌트는 문구가 바뀌어도(예: 개행/공백 변형) summary에 남지 않아야 한다."""
    html = """
    <html><body>
      <main>
        <div data-sentry-component="RecruitmentGuidelines">모집요강 모집분야 백엔드 개발자 고용형태 정규직</div>
        <div data-sentry-component="AIRecommendList">로그인하고 비슷한 조건의<br/>AI추천공고를 확인해보세요!</div>
      </main>
    </body></html>
    """
    detail = parse_job_detail(html)
    assert "AI" not in detail.summary
    assert detail.summary.startswith("모집요강")
