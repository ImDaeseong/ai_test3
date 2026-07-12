# Library Decision Index

This directory records library choices before implementation so coding can proceed with clear boundaries.

## Purpose

- Decide the default stack before writing app code.
- Keep each feature's required libraries separate.
- Record why the chosen library is better than alternatives for this project.
- Avoid adding dependencies without a documented reason.

## Documents

- `TECH_STACK_DECISIONS.md`: project-wide library choices.
- `SELECTION_CRITERIA.md`: criteria used when comparing libraries.
- `FEATURE_LIBRARY_MATRIX.md`: feature-to-library map.
- `features/*.md`: per-feature implementation and library notes.

## Rule

A library should be added only when it clearly improves implementation speed, reliability, testability, type safety, or user experience.
