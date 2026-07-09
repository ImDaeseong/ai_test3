from __future__ import annotations

import importlib.util
import json
import math
import struct
import subprocess
import sys
import tempfile
import unittest
import wave
from pathlib import Path

from app.analyzers import AudioAnalyzer, TextAnalyzer
from app.core import AnalysisMode, TrackInput, Verdict
from app.services import AnalysisService
from app.web.server import WebPaths, UploadedAudio, analyze_upload, is_allowed_audio, render_home, render_user_result, safe_filename


ROOT = Path(__file__).resolve().parents[1]


def write_test_wav(path: Path, seconds: float = 1.0, sample_rate: int = 8000, peak_amp: float = 0.6) -> None:
    frames = int(seconds * sample_rate)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        data = bytearray()
        for index in range(frames):
            amp = 0.2 if index < frames // 2 else peak_amp
            sample = int(32767 * amp * math.sin(2 * math.pi * 440 * index / sample_rate))
            data.extend(struct.pack("<h", sample))
        wav.writeframes(bytes(data))


def has_optional_dsp() -> bool:
    return bool(importlib.util.find_spec("numpy") and importlib.util.find_spec("soundfile"))


def codec_available(format_name: str) -> bool:
    if not importlib.util.find_spec("soundfile"):
        return False
    import soundfile as sf

    return format_name.upper() in sf.available_formats()


def write_soundfile_audio(path: Path, format_name: str, seconds: float = 1.0, sample_rate: int = 8000) -> None:
    import numpy as np
    import soundfile as sf

    t = np.arange(int(seconds * sample_rate), dtype=float) / sample_rate
    first = 0.2 * np.sin(2 * np.pi * 440 * t[: len(t) // 2])
    second = 0.6 * np.sin(2 * np.pi * 440 * t[len(t) // 2 :])
    y = np.concatenate([first, second])
    sf.write(str(path), y, sample_rate, format=format_name.upper())


class CliMvpTests(unittest.TestCase):
    def test_audio_analyzer_reads_wav_without_ui(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "sample.wav"
            write_test_wav(audio_path)
            features = AudioAnalyzer().analyze(audio_path)
        self.assertTrue(features.available)
        self.assertEqual(features.sample_rate, 8000)
        self.assertGreater(features.rms_mean, 0)
        self.assertEqual(len(features.section_energies), 8)

    def test_full_scale_peak_is_flagged_and_not_overrewarded(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "hot.wav"
            write_test_wav(audio_path, seconds=12.0, peak_amp=1.0)
            features = AudioAnalyzer().analyze(audio_path)
            report = AnalysisService().analyze(TrackInput(audio_path=audio_path, mode=AnalysisMode.AUTO))
        scores = {score.group: score for score in report.scores}
        self.assertGreaterEqual(features.peak_amplitude, 0.98)
        self.assertTrue(any("Peak" in warning for warning in features.warnings))
        self.assertIn("peak_headroom_risk", scores["Technical Audio"].evidence)
        self.assertIn("peak_headroom_risk", scores["Mix and Master"].evidence)
        self.assertLess(scores["Technical Audio"].score or 100, 90)
        self.assertEqual(scores["Mix and Master"].verdict, Verdict.REVISE)
        self.assertLess(scores["Mix and Master"].score or 100, 70)

    def test_dynamic_range_uses_robust_percentiles(self) -> None:
        value = AudioAnalyzer._dynamic_range_db([0.000001, 0.20, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28])
        self.assertLess(value, 6.0)

    def test_text_analyzer_detects_sections_and_ai_mentions(self) -> None:
        lyrics = "[Verse]\n오늘 밤\n[Chorus]\n빛이 남아\n빛이 남아\n[ad-lib]"
        prompt = "Suno clean studio mix"
        features = TextAnalyzer().analyze(lyrics=lyrics, prompt=prompt)
        self.assertTrue(features.has_lyrics)
        self.assertIn("Verse", features.section_names)
        self.assertIn("suno", features.ai_tool_mentions)
        self.assertTrue(features.warnings)

    def test_analysis_service_keeps_pipeline_separated(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "sample.wav"
            out_dir = Path(tmp) / "out"
            write_test_wav(audio_path)
            service = AnalysisService()
            report = service.analyze(TrackInput(audio_path=audio_path, mode=AnalysisMode.GENERAL))
            paths = service.write_reports(report, out_dir)
        self.assertNotEqual(report.overall_verdict, Verdict.HOLD)
        self.assertEqual({path.name for path in paths}, {"analysis_report.md", "analysis_report.ko.md", "analysis_report.json"})

    def test_cli_generates_markdown_and_json_reports(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "sample.wav"
            out_dir = Path(tmp) / "out"
            write_test_wav(audio_path)
            result = subprocess.run(
                [sys.executable, "-m", "app.cli", "analyze", str(audio_path), "--out", str(out_dir), "--mode", "general"],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue((out_dir / "analysis_report.md").exists())
            self.assertTrue((out_dir / "analysis_report.ko.md").exists())
            data = json.loads((out_dir / "analysis_report.json").read_text(encoding="utf-8"))
        self.assertIn("overall_verdict", data)
        self.assertGreater(len(data["scores"]), 0)

    def test_korean_report_contains_user_facing_sections(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "sample.wav"
            out_dir = Path(tmp) / "out"
            write_test_wav(audio_path)
            report = AnalysisService().analyze(TrackInput(audio_path=audio_path, mode=AnalysisMode.AUTO))
            AnalysisService().write_reports(report, out_dir)
            text = (out_dir / "analysis_report.ko.md").read_text(encoding="utf-8")
        self.assertIn("# 음악 분석 리포트", text)
        self.assertIn("## 핵심 오디오 근거", text)
        self.assertIn("## 세부 평가", text)
        self.assertIn("기술적 오디오 품질", text)
        self.assertIn("## 우선 개선 포인트", text)
        self.assertIn("가사 또는 훅 정보를 추가", text)
        self.assertIn("mode를 `ai_music`", text)
        self.assertIn("최종 판단", text)
        self.assertIn("수정 권장", text)
        self.assertIn("## Suno 스타일 제안", text)
        self.assertIn("현재 스타일", text)
        self.assertIn("개선 스타일", text)
        self.assertIn("수정 권장: 공개 전 수정 권장", text)
        self.assertNotIn("REVISE / 수정 권장", text)

    def test_hot_korean_report_recommends_headroom(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "hot.wav"
            out_dir = Path(tmp) / "out"
            write_test_wav(audio_path, seconds=12.0, peak_amp=1.0)
            report = AnalysisService().analyze(TrackInput(audio_path=audio_path, mode=AnalysisMode.GENERAL))
            AnalysisService().write_reports(report, out_dir)
            text = (out_dir / "analysis_report.ko.md").read_text(encoding="utf-8")
        self.assertIn("avoid clipping", text)
        self.assertIn("more mastering headroom", text)
        self.assertIn("피크가 너무 높아 헤드룸/클리핑 확인 필요", text)
        self.assertIn("마스터링 리미터 ceiling", text)



    def test_short_fixture_is_not_overrated_as_release_ready(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "sample.wav"
            write_test_wav(audio_path)
            report = AnalysisService().analyze(TrackInput(audio_path=audio_path, mode=AnalysisMode.GENERAL))
        self.assertEqual(report.overall_verdict, Verdict.REVISE)
        self.assertLess(report.overall_score or 0, 70)
        evidence = " ".join(item for score in report.scores for item in score.evidence)
        self.assertIn("duration_too_short_for_music_judgment", evidence)

    def test_release_length_audio_scores_audio_quality_without_overclaiming_market_fit(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "release.wav"
            write_test_wav(audio_path, seconds=90.0)
            report = AnalysisService().analyze(TrackInput(audio_path=audio_path, mode=AnalysisMode.GENERAL, target_platform="spotify"))
        scores = {score.group: score for score in report.scores}
        self.assertEqual(scores["Technical Audio"].verdict, Verdict.PASS)
        self.assertEqual(scores["Mix and Master"].verdict, Verdict.PASS)
        self.assertIn("duration_release_window", scores["Market and Release Fit"].evidence)
        self.assertNotEqual(report.overall_verdict, Verdict.HOLD)
        self.assertGreater(report.overall_score or 0, 60)

    def test_composition_and_production_evidence_explains_energy_variety(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            flat_path = Path(tmp) / "flat.wav"
            varied_path = Path(tmp) / "varied.wav"
            write_test_wav(flat_path, seconds=90.0, peak_amp=0.2)
            write_test_wav(varied_path, seconds=90.0, peak_amp=0.6)
            flat_report = AnalysisService().analyze(TrackInput(audio_path=flat_path, mode=AnalysisMode.GENERAL))
            varied_report = AnalysisService().analyze(TrackInput(audio_path=varied_path, mode=AnalysisMode.GENERAL))
        flat_scores = {score.group: score for score in flat_report.scores}
        varied_scores = {score.group: score for score in varied_report.scores}
        self.assertIn("energy_label_variety=1", flat_scores["Composition"].evidence)
        self.assertIn("energy_spread=flat", flat_scores["Production"].evidence)
        self.assertGreaterEqual(len({e for e in varied_scores["Composition"].evidence if e.startswith("energy_label_variety=")}), 1)
        self.assertNotIn("energy_label_variety=1", varied_scores["Composition"].evidence)
        self.assertGreater(varied_scores["Composition"].score or 0, flat_scores["Composition"].score or 0)

    def test_ai_music_without_prompt_or_lyrics_is_not_overrated(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "ai.wav"
            write_test_wav(audio_path, seconds=90.0)
            report = AnalysisService().analyze(TrackInput(audio_path=audio_path, mode=AnalysisMode.AI_MUSIC))
        scores = {score.group: score for score in report.scores}
        self.assertEqual(scores["AI Naturalness"].verdict, Verdict.REVISE)
        self.assertIn("ai_context_missing", scores["AI Naturalness"].evidence)


class WebMvpTests(unittest.TestCase):
    def test_web_upload_validation_allows_supported_audio_only(self) -> None:
        self.assertTrue(is_allowed_audio("demo.WAV"))
        self.assertTrue(is_allowed_audio("demo.flac"))
        self.assertTrue(is_allowed_audio("demo.mp3"))
        self.assertFalse(is_allowed_audio("demo.txt"))
        self.assertEqual(safe_filename("../bad name.mp3"), "bad_name.mp3")

    def test_web_home_renders_upload_form(self) -> None:
        page = render_home().decode("utf-8")
        self.assertIn('enctype="multipart/form-data"', page)
        self.assertIn('name="audio"', page)
        self.assertIn('name="mode"', page)
        self.assertNotIn('name="prompt"', page)
        self.assertNotIn('name="lyrics"', page)
        self.assertNotIn('name="target"', page)
        self.assertIn("음악 분석", page)
        self.assertIn("음원 파일", page)
        self.assertIn("분석 모드", page)
        self.assertIn("분석하기", page)
        self.assertNotIn("Audio File", page)
        self.assertNotIn(">Analyze<", page)

    def test_web_upload_uses_analysis_service_and_returns_inline_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "sample.wav"
            write_test_wav(audio_path)
            uploaded = UploadedAudio("sample.wav", audio_path.read_bytes())
            links, verdict, score, report_text = analyze_upload(
                uploaded,
                AnalysisMode.GENERAL,
                "general",
                WebPaths(Path(tmp) / "uploads", Path(tmp) / "outputs"),
            )
            generated = list((Path(tmp) / "outputs").glob("*/analysis_report.ko.md"))
        self.assertEqual(verdict, Verdict.REVISE)
        self.assertIsNotNone(score)
        self.assertIn("korean_markdown", links)
        self.assertEqual(len(generated), 1)
        self.assertIn("# 음악 분석 리포트", report_text)
        self.assertIn("## 세부 평가", report_text)

    def test_web_result_shows_json_link_only_and_friendly_verdict(self) -> None:
        html_text = render_user_result(
            {
                "markdown": "/reports/demo/analysis_report.md",
                "korean_markdown": "/reports/demo/analysis_report.ko.md",
                "json": "/reports/demo/analysis_report.json",
            },
            Verdict.REVISE,
            69.7,
            "# 음악 분석 리포트\n\n## 요약\n\n- 최종 판단: **수정 권장**\n",
        )
        self.assertIn("수정 권장", html_text)
        self.assertIn("analysis_report.json", html_text)
        self.assertNotIn("Korean Markdown", html_text)
        self.assertNotIn(">Markdown</a>", html_text)
class OptionalDspFallbackTests(unittest.TestCase):
    def test_mp3_dependency_behavior_is_explicit(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "placeholder.mp3"
            audio_path.write_bytes(b"not a real mp3")
            features = AudioAnalyzer().analyze(audio_path)
        self.assertFalse(features.available)
        if has_optional_dsp():
            self.assertIn("optional dsp analysis failed", features.error.lower())
        else:
            self.assertIn("optional dependencies", " ".join(features.warnings).lower())
            self.assertEqual(features.error, "")

    def test_report_includes_advanced_audio_fields_even_when_unestimated(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "sample.wav"
            out_dir = Path(tmp) / "out"
            write_test_wav(audio_path)
            report = AnalysisService().analyze(TrackInput(audio_path=audio_path, mode=AnalysisMode.GENERAL))
            paths = AnalysisService().write_reports(report, out_dir)
            markdown_path = next(path for path in paths if path.name == "analysis_report.md")
            text = markdown_path.read_text(encoding="utf-8")
        self.assertIn("BPM:", text)
        self.assertIn("Estimated key:", text)
        self.assertIn("LUFS integrated:", text)


class CodecAnalysisTests(unittest.TestCase):
    @unittest.skipUnless(has_optional_dsp() and codec_available("FLAC"), "FLAC codec unavailable in this environment")
    def test_audio_analyzer_reads_real_flac(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "sample.flac"
            write_soundfile_audio(audio_path, "FLAC")
            features = AudioAnalyzer().analyze(audio_path)
        self.assertTrue(features.available, features.error)
        self.assertEqual(features.extension, ".flac")
        self.assertEqual(features.sample_rate, 8000)
        self.assertEqual(features.estimated_key, "A")
        self.assertIsNotNone(features.lufs_integrated)
        self.assertEqual(len(features.frequency_bands), 7)

    @unittest.skipUnless(has_optional_dsp() and codec_available("MP3"), "MP3 codec unavailable in this environment")
    def test_audio_analyzer_reads_real_mp3(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audio_path = Path(tmp) / "sample.mp3"
            write_soundfile_audio(audio_path, "MP3")
            features = AudioAnalyzer().analyze(audio_path)
        self.assertTrue(features.available, features.error)
        self.assertEqual(features.extension, ".mp3")
        self.assertEqual(features.sample_rate, 8000)
        self.assertGreater(features.duration_sec, 0.9)
        self.assertEqual(len(features.frequency_bands), 7)


if __name__ == "__main__":
    unittest.main()


