"""Tests parse_work24_xml against a hand-built fixture based on public work24 API docs.

NOTE: tests/fixtures/work24_sample_response.xml is NOT a captured real response — it's built from
publicly documented field names because calling the live API requires an issued auth key (see
tasks/work24_client.py docstring). Once a real key is available, replace the fixture with an
actual saved response and re-run this test to confirm field names still match.

No network calls happen in this test file — fetch_postings_xml (the actual HTTP call) is
intentionally not exercised here.
"""

from __future__ import annotations

from pathlib import Path

from tasks.work24_client import parse_work24_xml

FIXTURE_PATH = Path(__file__).parent / "fixtures" / "work24_sample_response.xml"


def test_parse_work24_xml_maps_to_internal_posting_shape():
    xml_text = FIXTURE_PATH.read_text(encoding="utf-8")
    postings = parse_work24_xml(xml_text)

    assert len(postings) == 2

    first = postings[0]
    assert first["postingId"] == "work24-D2410250001"
    assert first["source"] == "work24_open_api"
    assert first["title"] == "백엔드 개발자 채용"
    assert first["company"] == "가상기관 X"
    assert first["seniority"] == "경력무관"
    assert first["domain"] == ["정보통신"]
    assert "서울 강남구" in first["rawHtml"]


def test_parse_work24_xml_skips_entries_without_id():
    xml_text = "<wantedRoot><wanted><title>제목없는공고</title></wanted></wantedRoot>"
    assert parse_work24_xml(xml_text) == []


def test_parse_work24_xml_empty_response_returns_empty_list():
    assert parse_work24_xml("<wantedRoot></wantedRoot>") == []
