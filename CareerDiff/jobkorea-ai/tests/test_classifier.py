from app.filters.classifier import classify


def test_csharp_mfc_team_lead_is_accepted():
    result = classify("서울 C# MFC 개발팀장 채용")
    assert result.accepted
    assert "개발" in result.categories
    assert "관리자" in result.categories
    assert "C#" in result.matched_keywords
    assert "MFC" in result.matched_keywords


def test_sales_team_lead_is_excluded():
    result = classify("보험 영업팀장 경력직 채용")
    assert not result.accepted


def test_golang_is_matched_but_plain_go_is_not():
    assert classify("Golang 백엔드 개발자").accepted
    assert not classify("Go to market 영업 담당").accepted


def test_it_overseas_worker_is_accepted():
    result = classify("베트남 해외법인 IT 주재원 정보시스템 운영")
    assert result.accepted
    assert "해외근무" in result.categories


def test_production_overseas_worker_is_excluded():
    result = classify("베트남 생산관리 주재원 채용")
    assert not result.accepted


def test_ai_word_boundary():
    assert classify("AI Python 엔지니어").accepted
    assert not classify("Retail 매장관리").accepted
