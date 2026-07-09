from __future__ import annotations

from app.core import AnalysisMode, Verdict
from app.scoring.base import BaseScorer, ScoringContext, clamp, verdict_from_score
from app.scoring.rubric import (
    MIN_DYNAMIC_RANGE_DB,
    MIN_FULL_TRACK_DURATION_SEC,
    MIN_REVIEWABLE_DURATION_SEC,
    MIN_SIGNAL_RMS,
    PEAK_HEADROOM_LIMIT,
    RELEASE_DURATION_MAX_SEC,
    RELEASE_DURATION_MIN_SEC,
    cap_for_short_duration,
    duration_evidence,
)


class TechnicalAudioScorer(BaseScorer):
    group = "Technical Audio"
    criteria_file = "docs/audio_analysis_scope.md"

    def score(self, context: ScoringContext):
        audio = context.audio
        if not audio.available:
            return self.result(0, Verdict.HOLD, [audio.error or "No measurable audio features available."], "Audio evidence is unavailable, so technical scoring is on HOLD.", next_action="Use a readable WAV/MP3/FLAC file or install optional decoders.")
        score = 45.0
        if audio.duration_sec >= MIN_FULL_TRACK_DURATION_SEC:
            score += 15
        elif audio.duration_sec >= MIN_REVIEWABLE_DURATION_SEC:
            score += 8
        else:
            score -= 10
        if audio.rms_mean > MIN_SIGNAL_RMS:
            score += 15
        if audio.peak_amplitude < PEAK_HEADROOM_LIMIT:
            score += 10
        elif audio.peak_amplitude >= 0.999:
            score -= 15
        else:
            score -= 8
        if audio.dynamic_range_db >= MIN_DYNAMIC_RANGE_DB:
            score += 10
        if audio.section_energies:
            score += 5
        if audio.lufs_integrated is not None and audio.frequency_bands:
            score += 5
        score = cap_for_short_duration(clamp(score), audio.duration_sec, 65.0)
        evidence = [duration_evidence(audio.duration_sec), f"duration={audio.duration_label}", f"rms={audio.rms_mean:.4f}", f"peak={audio.peak_amplitude:.3f}", f"bpm={audio.bpm:.2f}", f"key={audio.estimated_key}"]
        if audio.peak_amplitude >= PEAK_HEADROOM_LIMIT:
            evidence.append("peak_headroom_risk")
        if audio.lufs_integrated is not None:
            evidence.append(f"lufs={audio.lufs_integrated:.2f}")
        uncertainty = "BPM/key/LUFS are computational estimates and need human listening confirmation." if audio.lufs_integrated is not None else "LUFS is unavailable unless pyloudnorm is installed."
        return self.result(score, verdict_from_score(score), evidence, "Audio evidence indicates the file is measurable and has usable signal quality.", uncertainty, "Use listening review or reference-track comparison before final release decisions.")


class ComposerScorer(BaseScorer):
    group = "Composition"
    criteria_file = "docs/composer_criteria.md"

    def score(self, context: ScoringContext):
        audio = context.audio
        text = context.text
        score = 45.0
        if audio.available and len(audio.section_energies) >= 4:
            if len({section.energy_label for section in audio.section_energies}) >= 2:
                score += 20
        if text.section_names:
            score += 15
        if text.hook_candidates:
            score += 10
        if audio.available and audio.duration_sec >= MIN_FULL_TRACK_DURATION_SEC:
            score += 5
        score = cap_for_short_duration(clamp(score), audio.duration_sec, 55.0)
        return self.result(score, verdict_from_score(score), [duration_evidence(audio.duration_sec), f"sections={len(text.section_names)}", f"hook_candidates={len(text.hook_candidates)}"], "Composition is estimated from section structure, energy movement, and hook evidence.", "Precise melody and harmony review needs chords, MIDI, or deeper audio analysis.", "Provide lyrics/prompt sections and chord progression to improve this score.")


class LyricistScorer(BaseScorer):
    group = "Lyrics and Hook"
    criteria_file = "docs/lyricist_criteria.md"

    def score(self, context: ScoringContext):
        if context.mode == AnalysisMode.INSTRUMENTAL:
            return self.result(None, Verdict.NOT_APPLICABLE, ["instrumental mode"], "Lyrics scoring is skipped in instrumental mode.")
        text = context.text
        if not text.has_lyrics:
            return self.result(45, Verdict.REVISE, ["lyrics not provided"], "Lyrics were not provided, so hook, pronunciation, and language quality are limited.", "The system does not infer lyric quality from audio alone.", "Provide lyrics or Suno Lyrics for a stronger lyricist review.")
        score = 60.0
        if text.hook_candidates:
            score += 15
        if text.repeated_line_count <= 2:
            score += 10
        if not text.warnings:
            score += 10
        if text.lyric_line_count >= 8:
            score += 5
        score = clamp(score)
        return self.result(score, verdict_from_score(score), [f"lines={text.lyric_line_count}", f"repeated_lines={text.repeated_line_count}"], "Lyrics are scored from line count, repetition, hook candidates, and Suno tag safety.", next_action="Review title fit, singability, and short-form hook strength manually.")


class ProducerScorer(BaseScorer):
    group = "Production"
    criteria_file = "docs/producer_criteria.md"

    def score(self, context: ScoringContext):
        audio = context.audio
        score = 45.0
        if audio.available and audio.section_energies:
            labels = [section.energy_label for section in audio.section_energies]
            if "High" in labels and "Low" in labels:
                score += 20
            elif len(set(labels)) >= 2:
                score += 12
        if context.text.has_prompt:
            score += 10
        if audio.rms_std > 0.005:
            score += 10
        if audio.available and audio.duration_sec >= MIN_FULL_TRACK_DURATION_SEC:
            score += 5
        score = cap_for_short_duration(clamp(score), audio.duration_sec, 60.0)
        return self.result(score, verdict_from_score(score), [duration_evidence(audio.duration_sec), f"section_energy_count={len(audio.section_energies)}", f"prompt={context.text.has_prompt}"], "Production is estimated from section energy movement and prompt texture evidence.", "Instrument layout and vocal space are only proxies until stem or deeper analysis is added.", "Add rhythm, texture, vocal attitude, and space notes in the prompt.")


class MixMasterScorer(BaseScorer):
    group = "Mix and Master"
    criteria_file = "docs/mixing_criteria.md, docs/mastering_criteria.md"

    def score(self, context: ScoringContext):
        audio = context.audio
        if not audio.available:
            return self.result(0, Verdict.HOLD, [audio.error or "audio unavailable"], "Mix/master scoring needs readable audio evidence.")
        score = 50.0
        if 0.02 <= audio.rms_mean <= 0.35:
            score += 15
        if audio.peak_amplitude <= PEAK_HEADROOM_LIMIT:
            score += 15
        else:
            score -= 15
        if audio.dynamic_range_db >= MIN_DYNAMIC_RANGE_DB:
            score += 10
        if audio.lufs_integrated is not None:
            score += 5
        if audio.frequency_bands:
            score += 5
        if audio.peak_amplitude >= 0.999:
            score = min(score, 65.0)
        elif audio.peak_amplitude >= PEAK_HEADROOM_LIMIT:
            score = min(score, 68.0)
        score = cap_for_short_duration(clamp(score), audio.duration_sec, 70.0)
        evidence = [duration_evidence(audio.duration_sec), f"rms={audio.rms_mean:.4f}", f"peak={audio.peak_amplitude:.3f}", f"dynamic_range={audio.dynamic_range_db:.2f}dB"]
        if audio.peak_amplitude >= PEAK_HEADROOM_LIMIT:
            evidence.append("peak_headroom_risk")
        if audio.lufs_integrated is not None:
            evidence.append(f"lufs={audio.lufs_integrated:.2f}")
        if audio.frequency_bands:
            evidence.append(f"frequency_bands={len(audio.frequency_bands)}")
        uncertainty = "True peak, codec artifacts, and final release loudness still need dedicated mastering checks."
        return self.result(score, verdict_from_score(score), evidence, "Mix/master risk is estimated from RMS, peak, dynamic range, LUFS, and frequency-band proxies when available.", uncertainty, "Compare against platform loudness targets and a reference track before release.")


class AIMusicScorer(BaseScorer):
    group = "AI Naturalness"
    criteria_file = "docs/ai_music_criteria.md"

    def score(self, context: ScoringContext):
        text = context.text
        ai_mode = context.mode == AnalysisMode.AI_MUSIC or bool(text.ai_tool_mentions)
        if context.mode == AnalysisMode.GENERAL and not ai_mode:
            return self.result(None, Verdict.NOT_APPLICABLE, ["non-ai mode"], "AI naturalness scoring is skipped in general music mode.")
        missing_context = not text.has_prompt and not text.has_lyrics
        score = 55.0 if missing_context else 70.0
        if text.repeated_line_count > 3:
            score -= 15
        if text.warnings:
            score -= 20
        if text.has_prompt:
            score += 5
        score = clamp(score)
        evidence = [f"ai_mentions={','.join(text.ai_tool_mentions) or 'none'}", f"warnings={len(text.warnings)}"]
        if missing_context:
            evidence.append("ai_context_missing")
        return self.result(score, verdict_from_score(score), evidence, "AI naturalness is estimated from AI-tool mentions, repetition, and label-only tag warnings.", "Actual vocal artifacts require listening or a specialized model.", "Provide Suno/Udio prompt and Lyrics to evaluate prompt-result fit later.")


class MarketReleaseScorer(BaseScorer):
    group = "Market and Release Fit"
    criteria_file = "docs/market_release_criteria.md"

    def score(self, context: ScoringContext):
        audio = context.audio
        text = context.text
        score = 40.0
        if text.hook_candidates:
            score += 15
        if audio.available and RELEASE_DURATION_MIN_SEC <= audio.duration_sec <= RELEASE_DURATION_MAX_SEC:
            score += 15
        elif audio.available and audio.duration_sec >= MIN_FULL_TRACK_DURATION_SEC:
            score += 5
        if audio.available and any(section.energy_label == "High" for section in audio.section_energies):
            score += 10
        if context.target_platform.lower() in {"youtube", "shorts", "spotify", "melon", "apple"}:
            score += 5
        score = cap_for_short_duration(clamp(score), audio.duration_sec, 45.0)
        return self.result(score, verdict_from_score(score), [duration_evidence(audio.duration_sec), f"target={context.target_platform}", f"duration={audio.duration_label}"], "Release fit is estimated from hook evidence, duration, energy points, and target platform.", "Views, playlist placement, and revenue are never guaranteed.", "For A/B comparison, add Hook, Visual, Channel Fit, and Personal Taste inputs.")
