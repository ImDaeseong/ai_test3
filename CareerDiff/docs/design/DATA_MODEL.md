# Data Model

This document defines shared data contracts between features, including RAG-ready contracts for future embeddings and retrieval.

## Core types

```ts
export type Confidence = 'high' | 'medium' | 'low';
export type ConsentBasis = 'session_only' | 'explicit_save' | 'public_data' | 'anonymized';
export type Visibility = 'private' | 'team' | 'public_taxonomy' | 'anonymized_aggregate';
export type PiiRisk = 'low' | 'medium' | 'high';

export type JobDescriptionInput = {
  rawText: string;
  normalizedText: string;
  targetRole?: string;
  companyDomain?: string;
};

export type CandidateProfileInput = {
  rawText: string;
  normalizedText: string;
  targetSeniority?: string;
};

export type RequirementItem = {
  id: string;
  label: string;
  category: string;
  evidenceSnippet?: string;
  confidence: Confidence;
  sourceRecordId?: string;
};

export type JobRequirements = {
  requiredSkills: RequirementItem[];
  preferredSkills: RequirementItem[];
  domain: RequirementItem[];
  seniority?: string;
  collaboration: RequirementItem[];
  deliveryExpectations: RequirementItem[];
};

export type EvidenceItem = {
  id: string;
  label: string;
  sourceSnippet: string;
  confidence: Confidence;
  sourceRecordId?: string;
};

export type CandidateEvidence = {
  skills: EvidenceItem[];
  projects: EvidenceItem[];
  responsibilities: EvidenceItem[];
  achievements: EvidenceItem[];
  collaboration: EvidenceItem[];
};

export type MatchItem = {
  requirement: string;
  status: 'strong' | 'weak' | 'missing' | 'risk';
  reason: string;
  evidenceSnippet?: string;
  sourceRequirementId?: string;
  sourceEvidenceId?: string;
};

export type MatchResult = {
  strong: MatchItem[];
  weak: MatchItem[];
  missing: MatchItem[];
  risks: MatchItem[];
};

export type FitScore = {
  total: number;
  categories: Array<{ label: string; score: number; reason: string }>;
};

export type ResumeSuggestions = {
  bullets: string[];
  projectDescriptions: string[];
  skillPriority: string[];
  atsKeywords: string[];
};

export type MiniProjectRecommendation = {
  title: string;
  goal: string;
  targetGaps: string[];
  deliverables: string[];
  suggestedDurationDays: number;
};

export type InterviewPrep = {
  questions: string[];
  weakAreas: string[];
  sevenDayPlan: string[];
};
```

## RAG-ready contracts

RAG is included in the base data model even though the first MVP can keep retrieval disabled.

```ts
export type EmbeddableChunk = {
  id: string;
  ownerUserId?: string;
  sourceType: 'job_requirement' | 'candidate_evidence' | 'project_evidence' | 'skill_taxonomy' | 'analysis_summary';
  visibility: Visibility;
  textForEmbedding: string;
  sourceRecordId: string;
  sourceField: string;
  piiRisk: PiiRisk;
  consentBasis: ConsentBasis;
  schemaVersion: string;
  createdAt: string;
};

export type RetrievedContextItem = {
  chunkId: string;
  sourceType: EmbeddableChunk['sourceType'];
  sourceRecordId: string;
  text: string;
  relevanceScore: number;
  visibility: Visibility;
  piiRisk: PiiRisk;
  reason: string;
};

export type RetrievalContext = {
  enabled: boolean;
  query: string;
  items: RetrievedContextItem[];
  provider: 'none' | 'mock' | 'pgvector' | 'managed_vector_db';
  filters: {
    ownerUserId?: string;
    visibility: Visibility[];
    sourceTypes: EmbeddableChunk['sourceType'][];
    maxPiiRisk: PiiRisk;
  };
};

export type AnalysisMetadata = {
  schemaVersion: string;
  promptVersion?: string;
  modelVersion?: string;
  scoringVersion: string;
  retrievalUsed: boolean;
  persisted: boolean;
};

export type CareerDiffAnalysisResult = {
  fitScore: FitScore;
  summary: string;
  jobRequirements: JobRequirements;
  candidateEvidence: CandidateEvidence;
  retrievalContext: RetrievalContext;
  matches: MatchResult;
  resumeSuggestions: ResumeSuggestions;
  miniProjects: MiniProjectRecommendation[];
  interviewPrep: InterviewPrep;
  metadata: AnalysisMetadata;
};
```

## Rules

Feature implementations must exchange data through these contracts instead of passing raw unstructured text between unrelated modules.

RAG-related fields must exist from the beginning, but MVP can set `retrievalContext.enabled` to `false` and `provider` to `none`.

Embeddings derived from private user data are sensitive and must be deleted when the source record is deleted.
