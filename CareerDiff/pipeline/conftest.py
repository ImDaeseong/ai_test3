"""Redirect pytest's tmp_path basetemp into a project-local scratch dir.

This sandbox's global Windows temp path (AppData/Local/Temp/pytest-of-*) is permission-locked in
some dev environments, which breaks the `tmp_path` fixture. Point basetemp at a local, gitignored
folder instead so `pytest` works out of the box without extra flags.
"""

from __future__ import annotations

from pathlib import Path


def pytest_configure(config):
    if not config.option.basetemp:
        config.option.basetemp = Path(__file__).parent / ".pytest_tmp"
