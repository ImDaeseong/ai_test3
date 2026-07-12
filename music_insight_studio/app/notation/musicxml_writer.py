from __future__ import annotations

from pathlib import Path
from xml.etree import ElementTree as ET

from app.core import EvaluationReport


class LeadSheetMusicXmlWriter:
    """Writes a conservative MusicXML session chart from analysis metadata."""

    KEY_FIFTHS = {
        "Cb": -7,
        "Gb": -6,
        "Db": -5,
        "Ab": -4,
        "Eb": -3,
        "Bb": -2,
        "F": -1,
        "C": 0,
        "G": 1,
        "D": 2,
        "A": 3,
        "E": 4,
        "B": 5,
        "F#": 6,
        "C#": 7,
    }

    def write(self, report: EvaluationReport, out_dir: Path) -> Path:
        out_dir.mkdir(parents=True, exist_ok=True)
        path = out_dir / "analysis_lead_sheet.musicxml"
        tree = ET.ElementTree(self._build_score(report))
        ET.indent(tree, space="  ")
        tree.write(path, encoding="utf-8", xml_declaration=True)
        return path

    def _build_score(self, report: EvaluationReport) -> ET.Element:
        root = ET.Element("score-partwise", version="3.1")
        work = ET.SubElement(root, "work")
        ET.SubElement(work, "work-title").text = report.track.audio_path.stem
        identification = ET.SubElement(root, "identification")
        encoding = ET.SubElement(identification, "encoding")
        ET.SubElement(encoding, "software").text = "Music Insight Studio"
        ET.SubElement(encoding, "encoding-description").text = "Generated from analysis metadata. This is a lead sheet/session chart, not exact transcription."
        part_list = ET.SubElement(root, "part-list")
        score_part = ET.SubElement(part_list, "score-part", id="P1")
        ET.SubElement(score_part, "part-name").text = "Analysis Lead Sheet"
        part = ET.SubElement(root, "part", id="P1")
        sections = report.audio.section_energies or [None]
        for index, section in enumerate(sections, start=1):
            measure = ET.SubElement(part, "measure", number=str(index))
            if index == 1:
                self._add_attributes(measure, report.audio.estimated_key)
                self._add_tempo(measure, report.audio.bpm)
            if section is None:
                label = "Full Track"
            else:
                label = f"{section.name} - {section.energy_label} energy"
            self._add_rehearsal(measure, label)
            self._add_whole_rest(measure)
            if section is not None:
                self._add_words(measure, f"{section.start_sec:.1f}s-{section.end_sec:.1f}s, RMS {section.mean_rms:.4f}")
        self._add_limitations(part, len(sections) + 1)
        return root

    def _add_attributes(self, measure: ET.Element, key_name: str) -> None:
        attributes = ET.SubElement(measure, "attributes")
        ET.SubElement(attributes, "divisions").text = "1"
        key = ET.SubElement(attributes, "key")
        ET.SubElement(key, "fifths").text = str(self.KEY_FIFTHS.get(key_name, 0))
        time = ET.SubElement(attributes, "time")
        ET.SubElement(time, "beats").text = "4"
        ET.SubElement(time, "beat-type").text = "4"
        clef = ET.SubElement(attributes, "clef")
        ET.SubElement(clef, "sign").text = "G"
        ET.SubElement(clef, "line").text = "2"

    @staticmethod
    def _add_tempo(measure: ET.Element, bpm: float) -> None:
        if bpm <= 0:
            return
        direction = ET.SubElement(measure, "direction", placement="above")
        direction_type = ET.SubElement(direction, "direction-type")
        metronome = ET.SubElement(direction_type, "metronome")
        ET.SubElement(metronome, "beat-unit").text = "quarter"
        ET.SubElement(metronome, "per-minute").text = f"{bpm:.0f}"
        sound = ET.SubElement(direction, "sound")
        sound.set("tempo", f"{bpm:.0f}")

    @staticmethod
    def _add_rehearsal(measure: ET.Element, label: str) -> None:
        direction = ET.SubElement(measure, "direction", placement="above")
        direction_type = ET.SubElement(direction, "direction-type")
        ET.SubElement(direction_type, "rehearsal").text = label

    @staticmethod
    def _add_words(measure: ET.Element, text: str) -> None:
        direction = ET.SubElement(measure, "direction", placement="below")
        direction_type = ET.SubElement(direction, "direction-type")
        ET.SubElement(direction_type, "words").text = text

    @staticmethod
    def _add_whole_rest(measure: ET.Element) -> None:
        note = ET.SubElement(measure, "note")
        ET.SubElement(note, "rest")
        ET.SubElement(note, "duration").text = "4"
        ET.SubElement(note, "type").text = "whole"

    def _add_limitations(self, part: ET.Element, measure_number: int) -> None:
        measure = ET.SubElement(part, "measure", number=str(measure_number))
        self._add_rehearsal(measure, "Limitations")
        self._add_words(measure, "No melody/chord transcription; use as analysis guide only.")
        self._add_whole_rest(measure)
