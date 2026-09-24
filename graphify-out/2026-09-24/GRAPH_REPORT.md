# Graph Report - MICROSOFT WINNER  (2026-09-24)

## Corpus Check
- 270 files · ~533,554 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 30 file(s) not represented in the graph (top: .toml 18, (none) 6, .css 3)

## Summary
- 1963 nodes · 2641 edges · 166 communities (124 shown, 42 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `999ff172`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- "3,000 Alerts, One Analyst" — SentinelOps AI
- Security and Hardening
- Worked example: Agent Teams for competing-hypothesis debugging
- Code Review and Quality
- Test-Driven Development
- Context Engineering
- run-evals.js
- Performance Checklist
- Git Workflow and Versioning
- test_pipeline.py
- sdd-cache hook
- Shipping and Launch
- API and Interface Design
- Browser Testing with DevTools
- Performance Optimization
- CI/CD and Automation
- Constraint-Driven Development
- Deprecation and Migration
- Frontend UI Engineering
- Incremental Implementation
- OpenCode Setup
- Code Simplification
- Debugging and Error Recovery
- Documentation and ADRs
- Skill Anatomy
- Agent Skills
- Getting Started with agent-skills
- validate-reference-links-test.js
- Planning and Task Breakdown
- Using agent-skills with Cursor
- Security Checklist
- ReOrder: Keep Your Regulars Ordering Direct
- Interview Me
- Accessibility Checklist
- How agent-skills compares
- Doubt-Driven Development
- Process
- Web Performance Auditor
- Path A | Greenfield: full lifecycle from day one
- Using agent-skills with Antigravity CLI (agy)
- SentinelSpatial.jsx
- validate-commands-test.js
- Idea Refine
- Using Agent Skills
- Contributing to Agent Skills
- Using agent-skills with Gemini CLI
- Testing Patterns Reference (JavaScript/TypeScript)
- validate-versions-test.js
- Spec-Driven Development
- ref_node_assert_strict
- validate-artifact-paths-test.js
- agent-skills/README.md
- Review Scope
- Agent Personas
- Using agent-skills with GitHub Copilot
- Refinement & Evaluation Criteria
- package.json
- Review Framework
- The Standing Checklist
- Observability Checklist
- validate-commands.js
- OpenCode Integration
- Approach
- Developer Onboarding
- apply_entries
- skill-lint.js
- skill-lint-test.js
- Advanced per-agent configuration
- benchmark.js
- validate-reference-links.js
- Ideation Frameworks Reference
- skill-impact.md
- agent-skills
- marketplace.json
- Using agent-skills with GitHub Copilot CLI
- Skill Evals
- simplify-ignore hook
- simplify-ignore-test.sh
- validate-artifact-paths.js
- Using agent-skills with Windsurf
- ref_node_test
- test-driven-development/package.json
- simplify-ignore.sh
- typing
- Using agent-skills with Command Code
- ci-cd-and-automation/package.json
- config-parser.test.js
- pagination.test.js
- webhook.test.js
- split.test.js
- .oxlintrc.json
- app.py
- ship.md
- Using agent-skills with Codex
- split-payment
- sdd-cache-post.sh
- build.md
- webperf.md
- sdd-cache-pre.sh
- React + Vite
- service-brief.md
- browser-testing-with-devtools/README.md
- context-audit.md
- time-pressure.md
- api-inventory.md
- decision-context.md
- migration-plan.md
- design-system.md
- scenario.md
- tasks/plan.md
- operations.md
- notifications-spec.md
- authority-pressure.md
- launch-status.md
- framework-task.md
- billing-brief.md
- portal-brief.md
- BUG.md
- test-driven-development-ecosystem/README.md
- incident.md
- session-start.sh
- session-start-test.sh
- idea-refine.sh
- rules/graphify.md
- workflows/graphify.md
- react
- generate_alerts
- ai_briefer.py
- NormalizedAlert
- Microsoft Innovate 2026 — Problem Statement #25: "3,000 Alerts, One Analyst"
- inference.py
- run-evals-test.js
- IncidentDetailModal.jsx
- dependencies
- .sync_normalized_asset_fields
- validate-skills.js
- verify_endpoints.py
- devDependencies
- client/package.json
- IncidentIntelligence.jsx
- IncidentMapPanel.jsx
- AppLayout.jsx
- scripts
- models.py
- preprocessing.py
- App.jsx
- get_feature_names
- test_human_review.py
- IncidentInspectionModal.jsx
- mockData.js
- tokens.js
- client_src_components_triageimpact_triageimpact
- client_src_index
- ref_three_examples_jsm_controls_orbitcontrols_js
- get
- test_ml_pipeline.py
- prepare_dataframe
- CorrelationReviewModal.jsx

## God Nodes (most connected - your core abstractions)
1. `react` - 55 edges
2. `NormalizedAlert` - 34 edges
3. `lucide-react` - 24 edges
4. `correlate_normalized_alerts()` - 20 edges
5. `generate_alerts()` - 19 edges
6. `RawAlert` - 19 edges
7. `Incident` - 19 edges
8. `Code Review and Quality` - 19 edges
9. `Security and Hardening` - 17 edges
10. `build_authoritative_graph()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Step 2: Identify Simplification Opportunities` --references--> `get()`  [INFERRED]
  .agents/plugins/agent-skills/skills/code-simplification/SKILL.md → scratch/verify_e2e_live.py
- `What to cut first` --references--> `find()`  [INFERRED]
  .agents/plugins/agent-skills/skills/context-engineering/SKILL.md → backend/correlation.py
- `extract_structured_evidence()` --uses--> `Incident`  [INFERRED]
  backend/ai_briefer.py → backend/models.py
- `generate_shift_brief()` --uses--> `Incident`  [INFERRED]
  backend/ai_briefer.py → backend/models.py
- `enrich_incidents_with_briefs()` --uses--> `Incident`  [INFERRED]
  backend/ai_briefer.py → backend/models.py

## Import Cycles
- None detected.

## Communities (166 total, 42 thin omitted)

### Community 0 - ""3,000 Alerts, One Analyst" — SentinelOps AI"
Cohesion: 0.25
Nodes (7): "3,000 Alerts, One Analyst" — SentinelOps AI, Microsoft Innovate 2026: Problem Statement #25, Official Solution Implemented, Problem Scenario, Project Structure, Running the Application, Verification & Unit Tests

### Community 1 - "Security and Hardening"
Cohesion: 0.06
Nodes (31): Always Do (No Exceptions), Ask First (Requires Human Approval), Broken Access Control, Broken Authentication, Common Rationalizations, Cross-Site Scripting (XSS), Data Privacy & Compliance, Destructive Operations on Derived Paths (+23 more)

### Community 2 - "Worked example: Agent Teams for competing-hypothesis debugging"
Cohesion: 0.06
Nodes (31): 1. Direct invocation (no orchestration), 2. Single-persona slash command, 3. Parallel fan-out with merge, 4. Sequential pipeline as user-driven slash commands, 5. Research isolation (context preservation), A. Router persona ("meta-orchestrator"), Anti-pattern in this scenario, Anti-patterns (+23 more)

### Community 3 - "Code Review and Quality"
Cohesion: 0.07
Nodes (29): 1. Correctness, 2. Readability & Simplicity, 3. Architecture, 4. Security, 5. Performance, Change Descriptions, Change Sizing, Code Review and Quality (+21 more)

### Community 4 - "Test-Driven Development"
Cohesion: 0.07
Nodes (29): Browser Testing with DevTools, Common Rationalizations, DAMP Over DRY in Tests, Decision Guide, Discover the Stack First, Name Tests Descriptively, One Assertion Per Concept, Overview (+21 more)

### Community 5 - "Context Engineering"
Cohesion: 0.06
Nodes (30): Anti-Patterns, Common Rationalizations, Compress before dropping, Confusion Management, Context Budget Management, Context Engineering, Context Packing Strategies, Level 1: Rules Files (+22 more)

### Community 6 - "run-evals.js"
Cohesion: 0.10
Nodes (30): buildCorpus(), CASES_DIR, cosine(), EVAL_KINDS, { execFileSync }, FIXTURES_DIR, fs, loadCases() (+22 more)

### Community 7 - "Performance Checklist"
Cohesion: 0.07
Nodes (26): API, Backend Checklist, Cache checklist, Caching Strategies, Common Anti-Patterns, Connection pooling, Core Web Vitals Targets, CSS (+18 more)

### Community 8 - "Git Workflow and Versioning"
Cohesion: 0.07
Nodes (26): 1. Commit Early, Commit Often, 2. Atomic Commits, 3. Descriptive Messages, 4. Keep Concerns Separate, 5. Size Your Changes, Branch Naming, Branching Strategy, Change Summaries (+18 more)

### Community 9 - "test_pipeline.py"
Cohesion: 0.18
Nodes (20): correlate_normalized_alerts(), Determines which alerts are related and groups them into unified incidents.…, generate_3000_alerts(), Default demonstration entry point producing exactly 3,000 synthetic alerts with…, RawAlert, normalize_alert(), normalize_batch(), parse_iso_timestamp() (+12 more)

### Community 10 - "sdd-cache hook"
Cohesion: 0.08
Nodes (24): 1. Smoke test the scripts directly, 2. End-to-end in a real session, 3. Freshness verification, 4. Debugging, How it works, Known limitations, Local testing, Mental model (+16 more)

### Community 11 - "Shipping and Launch"
Cohesion: 0.08
Nodes (25): Accessibility, Code Quality, Common Rationalizations, Documentation, Error Budget Release Gate, Error Reporting, Feature Flag Strategy, Infrastructure (+17 more)

### Community 12 - "API and Interface Design"
Cohesion: 0.08
Nodes (24): 1. Contract First, 2. Consistent Error Semantics, 3. Validate at Boundaries, 4. Prefer Addition Over Modification, 5. Predictable Naming, 6. Honouring an Idempotency Key, API and Interface Design, Common Rationalizations (+16 more)

### Community 13 - "Browser Testing with DevTools"
Cohesion: 0.08
Nodes (24): Accessibility Verification with DevTools, Available Tools, Browser Testing with DevTools, Clean Console Standard, Common Rationalizations, Console Analysis Patterns, Content Boundary Markers, For Network Issues (+16 more)

### Community 14 - "Performance Optimization"
Cohesion: 0.08
Nodes (24): Common Rationalizations, Connection Pool Exhaustion, Core Web Vitals Targets, Large Bundle Size, Log every attempt, including the reverted ones, Missing Caching (Backend), Missing Image Optimization (Frontend), N+1 Queries (Backend) (+16 more)

### Community 15 - "CI/CD and Automation"
Cohesion: 0.08
Nodes (23): Automation Beyond CI, Basic CI Pipeline, Build Cop Role, CI/CD and Automation, CI Optimization, Common Rationalizations, Dependabot / Renovate, Deployment Strategies (+15 more)

### Community 16 - "Constraint-Driven Development"
Cohesion: 0.08
Nodes (22): Adapting it, Contract, Floor guard: reference implementation, Reference (Node, ~stack-agnostic patterns), Common Rationalizations, Constraint-Driven Development, Escalation Path, Loading Constraints (+14 more)

### Community 17 - "Deprecation and Migration"
Cohesion: 0.08
Nodes (23): Adapter Pattern, Code Is a Liability, Common Rationalizations, Compulsory vs Advisory Deprecation, Core Principles, Database Schema Migrations (Expand/Contract), Deprecation and Migration, Deprecation Planning Starts at Design Time (+15 more)

### Community 18 - "Frontend UI Engineering"
Cohesion: 0.08
Nodes (23): Accessibility (WCAG 2.1 AA), ARIA Labels, Avoid the AI Aesthetic, Color, Common Rationalizations, Component Architecture, Component Patterns, Design System Adherence (+15 more)

### Community 19 - "Incremental Implementation"
Cohesion: 0.09
Nodes (22): Common Rationalizations, Contract-First Slicing, Implementation Rules, Increment Checklist, Incremental Implementation, Overview, Red Flags, Risk-First Slicing (+14 more)

### Community 20 - "OpenCode Setup"
Cohesion: 0.09
Nodes (22): 1. Skill Discovery, 2. Automatic Skill Invocation, 3. Lifecycle Mapping (Implicit Commands), Agent Expectations, Copy the optional slash commands, Cross-compatible paths, Example 1: Feature Development, Example 2: Bug Fix (+14 more)

### Community 21 - "Code Simplification"
Cohesion: 0.09
Nodes (21): 1. Preserve Behavior Exactly, 2. Follow Project Conventions, 3. Prefer Clarity Over Cleverness, 4. Maintain Balance, 5. Scope to What Changed, Code Simplification, Common Rationalizations, Language-Specific Guidance (+13 more)

### Community 22 - "Debugging and Error Recovery"
Cohesion: 0.09
Nodes (21): Build Failure Triage, Common Rationalizations, Debugging and Error Recovery, Error-Specific Patterns, Instrumentation Guidelines, Overview, Red Flags, Runtime Error Triage (+13 more)

### Community 23 - "Documentation and ADRs"
Cohesion: 0.09
Nodes (21): ADR Lifecycle, ADR Template, API Documentation, Architecture Decision Records (ADRs), Changelog Maintenance, Common Rationalizations, Document Known Gotchas, Documentation and ADRs (+13 more)

### Community 24 - "Skill Anatomy"
Cohesion: 0.10
Nodes (21): Common Rationalizations, Context Efficiency, Core Process, Cross-Skill References, File Location, Frontmatter (Required), Naming Conventions, Overview (+13 more)

### Community 25 - "Agent Skills"
Cohesion: 0.10
Nodes (21): Adoption, Agent Personas, Agent Skills, All 25 Skills, Build - Write the code, Commands, Contributing, Define - Clarify what to build (+13 more)

### Community 26 - "Getting Started with agent-skills"
Cohesion: 0.10
Nodes (20): 1. Clone the repository, 2. Choose a skill, 3. Load the skill into your agent, 4. Use the meta-skill for discovery when needed, Context-Aware Loading, Existing projects need no migration, Full Lifecycle, Getting Started with agent-skills (+12 more)

### Community 27 - "validate-reference-links-test.js"
Cohesion: 0.11
Nodes (14): fs, http, path, { afterEach, test }, assert, fs, os, path (+6 more)

### Community 28 - "Planning and Task Breakdown"
Cohesion: 0.11
Nodes (18): Common Rationalizations, Output Files, Overview, Parallelization Opportunities, Plan Document Template, Planning and Task Breakdown, Red Flags, See Also (+10 more)

### Community 29 - "Using agent-skills with Cursor"
Cohesion: 0.11
Nodes (18): 1. Install skills into `.cursor/skills/`, 2. Add minimal project rules (optional but useful), 3. User-level skills (optional), 4. Verify, `agents/` directory, Checklist (new project), Context tips, How agents should use skills (+10 more)

### Community 30 - "Security Checklist"
Cohesion: 0.11
Nodes (17): AI / LLM Security, Authentication, Authorization, CORS Configuration, Data Protection, Dependency Security, Destructive Path Operations, Error Handling (+9 more)

### Community 31 - "ReOrder: Keep Your Regulars Ordering Direct"
Cohesion: 0.11
Nodes (17): Example 1: Vague Early-Stage Concept (Full 3-Phase Session), Example 2: Feature Idea Within an Existing Product (Codebase-Aware), Example 3: Process/Workflow Idea (Non-Product), Ideation Session Examples, Key Assumptions to Validate, MVP Scope, Not Doing (and Why), Open Questions (+9 more)

### Community 32 - "Interview Me"
Cohesion: 0.11
Nodes (17): Common Rationalizations, Example, Interaction with Other Skills, Interview Me, Loading Constraints, Output, Overview, Red Flags (+9 more)

### Community 33 - "Accessibility Checklist"
Cohesion: 0.12
Nodes (16): Accessibility Checklist, Accessible Lists, ARIA Roles, Buttons vs. Links, Common Anti-Patterns, Common HTML Patterns, Content, Essential Checks (+8 more)

### Community 34 - "How agent-skills compares"
Cohesion: 0.12
Nodes (15): A real head-to-head: Superpowers vs. agent-skills, agent-skills (this project), At a glance, Combining them, Concrete scenarios, How agent-skills compares, How to decide what to use, Matt Pocock's skills (+7 more)

### Community 35 - "Doubt-Driven Development"
Cohesion: 0.12
Nodes (15): Common Rationalizations, Cross-model escalation, Doubt-Driven Development, Interaction with Other Skills, Loading Constraints, Overview, Red Flags, Step 1: CLAIM — Surface what stands (+7 more)

### Community 36 - "Process"
Cohesion: 0.12
Nodes (15): 1. Define "working" before instrumenting, 2. Pick the right signal for each question, 3. Structured logging, 4. Metrics, 5. Distributed tracing, 6. Alerting, 7. Verify the telemetry itself, Common Rationalizations (+7 more)

### Community 37 - "Web Performance Auditor"
Cohesion: 0.13
Nodes (15): 1. Core Web Vitals, 2. Loading, 3. Rendering / JavaScript, 4. Network, Composition, Deep mode (activated when tool artifacts or live measurement are available), Metric-Honesty Rule, Operating Modes (+7 more)

### Community 38 - "Path A | Greenfield: full lifecycle from day one"
Cohesion: 0.13
Nodes (15): Add as the project grows, Adoption Guide: New Projects vs. Established Codebases, Brownfield anti-patterns, Day 0 | Define before you build, Day 0 | Install and wire up, From the start, treat these as always-on, Greenfield anti-patterns, Path A | Greenfield: full lifecycle from day one (+7 more)

### Community 39 - "Using agent-skills with Antigravity CLI (agy)"
Cohesion: 0.13
Nodes (14): 1. On-Demand Skill Activation, 2. Specialized Agent Personas, Configuration & Customization, How It Works, Lifecycle Workflows and Command Compatibility, Option 1: Native Plugin Installation (Recommended), Option 2: Import from Gemini CLI, Project-Specific Enforcements (`AGENTS.md`) (+6 more)

### Community 40 - "SentinelSpatial.jsx"
Cohesion: 0.14
Nodes (12): AiShiftHandoverSection(), ArchitectureSection(), DEFAULT_STAGES, AnimatedNumber(), CorrelationSection(), MITRE_TECHNIQUES, MitreSection(), RiskIntelligenceSection() (+4 more)

### Community 41 - "validate-commands-test.js"
Cohesion: 0.17
Nodes (12): { afterEach, test }, assert, fs, os, path, sandboxes, { spawnSync }, VALIDATOR (+4 more)

### Community 42 - "Idea Refine"
Cohesion: 0.13
Nodes (14): Anti-patterns to Avoid, Detailed Instructions, How It Works, Idea Refine, Output, Phase 1: Understand & Expand (Divergent), Phase 2: Evaluate & Converge, Phase 3: Sharpen & Ship (+6 more)

### Community 43 - "Using Agent Skills"
Cohesion: 0.13
Nodes (14): 1. Surface Assumptions, 2. Manage Confusion Actively, 3. Push Back When Warranted, 4. Enforce Simplicity, 5. Maintain Scope Discipline, 6. Verify, Don't Assume, Core Operating Behaviors, Failure Modes to Avoid (+6 more)

### Community 44 - "Contributing to Agent Skills"
Cohesion: 0.14
Nodes (14): Adding a New Skill, Before proposing a new skill, Contributing to Agent Skills, Creating the skill, License, Modifying Existing Skills, Repo-scoped files, Reporting Issues (+6 more)

### Community 45 - "Using agent-skills with Gemini CLI"
Cohesion: 0.14
Nodes (13): Advanced Configuration, Always-On (GEMINI.md), Explicit Context Loading, MCP Integration, On-Demand (Skills), Option 1: Install as Skills (Recommended), Option 2: GEMINI.md (Persistent Context), Recommended Configuration (+5 more)

### Community 46 - "Testing Patterns Reference (JavaScript/TypeScript)"
Cohesion: 0.14
Nodes (13): API / Integration Testing, Common Assertions, E2E Testing (Playwright), Mock at Boundaries Only, Mock Functions, Mock Modules, Mocking Patterns, React/Component Testing (+5 more)

### Community 47 - "validate-versions-test.js"
Cohesion: 0.14
Nodes (10): { execFileSync }, expectedVersion, manifestPaths, { readFileSync }, assert, { execFileSync }, manifestPaths, { readFileSync } (+2 more)

### Community 48 - "Spec-Driven Development"
Cohesion: 0.14
Nodes (13): Common Rationalizations, Keeping the Spec Alive, Overview, Phase 0: Scope Check, Phase 1: Specify, Phase 2: Plan, Phase 3: Tasks, Phase 4: Implement (+5 more)

### Community 49 - "ref_node_assert_strict"
Cohesion: 0.18
Nodes (9): slugify(), assert, { slugify }, test, assert, test, { total }, total() (+1 more)

### Community 50 - "validate-artifact-paths-test.js"
Cohesion: 0.15
Nodes (9): { afterEach, test }, assert, fs, os, path, sandboxes, { spawnSync }, VALIDATOR (+1 more)

### Community 52 - "Review Scope"
Cohesion: 0.17
Nodes (12): 1. Input Handling, 2. Authentication & Authorization, 3. Data Protection, 4. Infrastructure, 5. Third-Party Integrations, 6. AI / LLM Features (if present), Composition, Output Format (+4 more)

### Community 53 - "Agent Personas"
Cohesion: 0.17
Nodes (12): Adding a new persona, Agent Personas, Claude Code interop, Decision matrix, Direct persona invocation, How personas relate to skills and commands, Rules for personas, Slash command (orchestrator — fan-out) (+4 more)

### Community 54 - "Using agent-skills with GitHub Copilot"
Cohesion: 0.17
Nodes (12): Agent Personas (*.agent.md), Copilot Instructions, Custom Instructions (User Level), .github/copilot-instructions.md, If the skill slash commands don't appear, Lifecycle Workflows, Optional: short `/spec`-style aliases, Recommended Configuration (+4 more)

### Community 55 - "Refinement & Evaluation Criteria"
Cohesion: 0.17
Nodes (11): 1. User Value, 2. Feasibility, 3. Differentiation, Assumption Audit, Core Evaluation Dimensions, Decision Framework, Might Be True (Nice to Have), Must Be True (Dealbreakers) (+3 more)

### Community 56 - "package.json"
Cohesion: 0.14
Nodes (13): author, description, keywords, license, name, scripts, backend, build (+5 more)

### Community 57 - "Review Framework"
Cohesion: 0.18
Nodes (11): 1. Correctness, 2. Readability, 3. Architecture, 4. Security, 5. Performance, Composition, Output Format, Review Framework (+3 more)

### Community 58 - "The Standing Checklist"
Cohesion: 0.18
Nodes (10): Correctness, Definition of Done, Definition of Done vs. Acceptance Criteria, Documentation, How to Apply, Integration, Quality, Red Flags (+2 more)

### Community 59 - "Observability Checklist"
Cohesion: 0.18
Nodes (10): Alerting, Dashboards, Distributed Tracing, Metrics, Observability Checklist, On-Call Questions (Start Here), Pre-Launch Gate, Structured Logging (+2 more)

### Community 60 - "validate-commands.js"
Cohesion: 0.24
Nodes (10): descriptionFromMd(), descriptionFromToml(), DIRS, fs, loadCommands(), main(), NAME_MAP, NAME_MAP_REVERSE (+2 more)

### Community 61 - "OpenCode Integration"
Cohesion: 0.20
Nodes (9): Anti-Rationalization, Core Rules, Creating a New Skill, Execution Model, Intent → Skill Mapping, Lifecycle Mapping (Implicit Commands), OpenCode Integration, Orchestration: Personas, Skills, and Commands (+1 more)

### Community 62 - "Approach"
Cohesion: 0.18
Nodes (10): 1. Analyze Before Writing, 2. Test at the Right Level, 3. Follow the Prove-It Pattern for Bugs, 4. Write Descriptive Tests, 5. Cover These Scenarios, Approach, Composition, Output Format (+2 more)

### Community 63 - "Developer Onboarding"
Cohesion: 0.20
Nodes (10): 1. The mental model, 2. Local setup, 3. The verification loop, 4. Contribution paths, 5. Pre-PR checklist, 6. Suggested reading order, Developer Onboarding, Path 1: Fixing or improving an existing skill (most common, best first PR) (+2 more)

### Community 64 - "apply_entries"
Cohesion: 0.29
Nodes (5): apply_entries(), Simple in-memory ledger utilities., Apply entries to a starting balance and return the result. Entries are (kind,…, ApplyEntriesTest, unittest

### Community 65 - "skill-lint.js"
Cohesion: 0.27
Nodes (9): extractSkillReferences(), fs, lintSkillContent(), parseFrontmatter(), path, REQUIRED_SECTIONS, SECTION_EXEMPT_SKILLS, SKILL_REF_PATTERNS (+1 more)

### Community 66 - "skill-lint-test.js"
Cohesion: 0.20
Nodes (6): assert, FENCE_KNOWN, KNOWN, { lintSkillContent }, { test }, VALID_FRONTMATTER

### Community 67 - "Advanced per-agent configuration"
Cohesion: 0.22
Nodes (8): Advanced per-agent configuration, Automating with scripts, Claude Code, Gemini CLI and Antigravity, Model guidance, Principles, Status, Where vendor fields belong

### Community 68 - "benchmark.js"
Cohesion: 0.25
Nodes (7): output, { performance }, products, { renderProducts }, start, renderProducts(), ref_node_perf_hooks

### Community 69 - "validate-reference-links.js"
Cohesion: 0.28
Nodes (8): fencedLineNumbers(), findViolations(), fs, main(), path, ROOT, SKILLS_DIR, ref_path

### Community 70 - "Ideation Frameworks Reference"
Cohesion: 0.22
Nodes (8): Analogous Inspiration, Constraint-Based Ideation, First Principles Thinking, How Might We (HMW), Ideation Frameworks Reference, Jobs to Be Done (JTBD), Pre-mortem, SCAMPER

### Community 72 - "agent-skills"
Cohesion: 0.25
Nodes (8): agent-skills, Boundaries, Commands, Contributing, Conventions, Project Structure, Pull Requests, Skills by Phase

### Community 73 - "marketplace.json"
Cohesion: 0.25
Nodes (7): description, name, owner, name, url, plugins, $schema

### Community 74 - "Using agent-skills with GitHub Copilot CLI"
Cohesion: 0.25
Nodes (6): Install, Troubleshooting, Usage, Using agent-skills with GitHub Copilot CLI, Verify, What you get, and what you don't

### Community 75 - "Skill Evals"
Cohesion: 0.29
Nodes (7): Adding a skill, Eval case format, Metrics to watch, Prior art (and what we adopted), Running, Skill Evals, The three tiers

### Community 76 - "simplify-ignore hook"
Cohesion: 0.25
Nodes (7): Annotation syntax, Crash recovery, How it works, Known limitations, Requirements, Setup, simplify-ignore hook

### Community 77 - "simplify-ignore-test.sh"
Cohesion: 0.36
Nodes (6): assert_eq(), block_hash(), CACHE, file_id(), hash_cmd(), simplify-ignore-test.sh script

### Community 78 - "validate-artifact-paths.js"
Cohesion: 0.25
Nodes (8): ARTIFACT_ALLOWLIST, findViolations(), fs, GUARDED_FILES, main(), path, ROOT, ref_fs

### Community 79 - "Using agent-skills with Windsurf"
Cohesion: 0.29
Nodes (6): Global Rules, Project Rules, Recommended Configuration, Setup, Usage Tips, Using agent-skills with Windsurf

### Community 80 - "ref_node_test"
Cohesion: 0.33
Nodes (5): assert, test, { visibleReports }, visibleReports(), ref_node_test

### Community 81 - "test-driven-development/package.json"
Cohesion: 0.29
Nodes (6): description, name, private, scripts, test, version

### Community 82 - "simplify-ignore.sh"
Cohesion: 0.57
Nodes (6): block_hash(), escape_glob(), file_id(), filter_file(), hash_cmd(), simplify-ignore.sh script

### Community 83 - "typing"
Cohesion: 0.27
Nodes (10): map_alerts_to_mitre(), Maps alert evidence to MITRE ATT&CK techniques ONLY when concrete evidence…, MitreTechnique, calculate_incident_priority(), Computes an explainable Risk Score (0 - 100) and Priority Tier. Crucial…, 5. MITRE ATT&CK Mapping: Only maps when supported by actual evidence., 4. Asset Criticality MUST matter! An incident on a Critical asset with few…, test_4_asset_criticality_prioritization() (+2 more)

### Community 84 - "Using agent-skills with Command Code"
Cohesion: 0.33
Nodes (5): Install, Manage, Usage, Using agent-skills with Command Code, Where skills live

### Community 85 - "ci-cd-and-automation/package.json"
Cohesion: 0.33
Nodes (5): name, private, scripts, lint, test

### Community 86 - "config-parser.test.js"
Cohesion: 0.40
Nodes (4): parseConfig(), assert, { parseConfig }, test

### Community 87 - "pagination.test.js"
Cohesion: 0.40
Nodes (4): paginate(), assert, { paginate }, test

### Community 88 - "webhook.test.js"
Cohesion: 0.40
Nodes (4): previewWebhook(), assert, { previewWebhook }, test

### Community 89 - "split.test.js"
Cohesion: 0.40
Nodes (4): splitCents(), assert, { splitCents }, test

### Community 90 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 91 - "app.py"
Cohesion: 0.09
Nodes (38): add_incident_note(), AddAnalystNoteRequest, AiBriefReviewRequest, AlertUploadBatch, AnalystReviewRequest, CorrelationReviewRequest, EvidenceReviewRequest, ingest_custom_batch() (+30 more)

### Community 92 - "ship.md"
Cohesion: 0.40
Nodes (4): Phase A — Parallel fan-out, Phase B — Merge in main context, Phase C — Decision and rollback, Rules

### Community 93 - "Using agent-skills with Codex"
Cohesion: 0.40
Nodes (4): How it works, Install, Usage, Using agent-skills with Codex

### Community 94 - "split-payment"
Cohesion: 0.40
Nodes (4): API, Invariants, split-payment, Tests

### Community 95 - "sdd-cache-post.sh"
Cohesion: 0.70
Nodes (4): dbg(), extract_header(), hash_key(), sdd-cache-post.sh script

### Community 96 - "build.md"
Cohesion: 0.50
Nodes (3): Autonomous: the whole plan (`/build auto`), Default: one task, Modes

### Community 97 - "webperf.md"
Cohesion: 0.50
Nodes (3): Determine the mode, Output, Run the audit

### Community 98 - "sdd-cache-pre.sh"
Cohesion: 0.83
Nodes (3): dbg(), hash_key(), sdd-cache-pre.sh script

### Community 99 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + Vite

### Community 133 - "react"
Cohesion: 0.09
Nodes (3): Button, IncidentField(), react

### Community 134 - "generate_alerts"
Cohesion: 0.07
Nodes (25): argparse, DatasetValidationReport, Dataset Validator for Problem Statement #25 ("3,000 Alerts, One Analyst").…, validate_dataset(), _build_attack_scenarios(), _build_scaled_attack_scenarios(), generate_alerts(), Any (+17 more)

### Community 135 - "ai_briefer.py"
Cohesion: 0.28
Nodes (11): enrich_incidents_with_briefs(), extract_structured_evidence(), generate_ai_synopsis(), generate_shift_brief(), get_or_load_ai_model(), Any, Generates an auditable, evidence-grounded Shift Handover Brief. Includes full…, Lazily loads the lightweight Seq2Seq transformer model on CPU. Designed… (+3 more)

### Community 136 - "NormalizedAlert"
Cohesion: 0.26
Nodes (18): build_authoritative_graph(), extract_incident_entities(), parse_iso(), Any, datetime, Generates the authoritative correlation graph structure derived directly from…, Constructs the authoritative correlation graph: 1. Global Incident Topology (15…, NormalizedAlert (+10 more)

### Community 137 - "Microsoft Innovate 2026 — Problem Statement #25: "3,000 Alerts, One Analyst""
Cohesion: 0.13
Nodes (14): 10. Reproducibility Instructions, 11. Known Limitations & Boundaries, 1. Executive Summary & Why This Dataset Exists, 2. Dataset Generation Methodology & Single-Generator Architecture, 3. Realistic 19-Field Alert Schema, 4. Scenario-Driven Attack Progression, 5. Benign Noise & False-Positive Distribution, 6. Asset Criticality Hierarchy (+6 more)

### Community 138 - "inference.py"
Cohesion: 0.14
Nodes (17): extract_features_from_normalized_alert(), format_feature_attribution(), get_or_load_pipeline(), Any, Production inference engine for SentinelOps AI. Applies the trained Random…, Loads the serialized scikit-learn artifact containing preprocessor and model., Converts a NormalizedAlert instance into feature row for the preprocessor., Scores a batch of normalized alerts with the real trained model. Attaches… (+9 more)

### Community 139 - "run-evals-test.js"
Cohesion: 0.14
Nodes (10): assert, behavioralEval(), completeCase(), fs, { materializeWorkspace, parseGrading }, os, path, RUNNER (+2 more)

### Community 140 - "IncidentDetailModal.jsx"
Cohesion: 0.12
Nodes (17): AiBriefReviewPanel(), BRIEF_RATINGS, AnalystDecisionCenter(), REASON_OPTIONS, AnalystNotesPanel(), CHALLENGE_REASONS, EvidenceReviewPanel(), IncidentDetailModal() (+9 more)

### Community 141 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, canvas-confetti, lucide-react, react, react-dom, @react-three/drei, @react-three/fiber, three

### Community 143 - "validate-skills.js"
Cohesion: 0.33
Nodes (6): lintSkill(), fs, { lintSkill }, main(), path, SKILLS_DIR

### Community 144 - "verify_endpoints.py"
Cohesion: 0.38
Nodes (5): http_get(), http_post(), run_verification(), time, urllib_request

### Community 145 - "devDependencies"
Cohesion: 0.33
Nodes (6): devDependencies, oxlint, @types/react, @types/react-dom, vite, @vitejs/plugin-react

### Community 146 - "client/package.json"
Cohesion: 0.15
Nodes (12): name, private, type, version, canvas-confetti, oxlint, react-dom, @react-three/drei (+4 more)

### Community 147 - "IncidentIntelligence.jsx"
Cohesion: 0.16
Nodes (14): IncidentIntelligence(), IncidentMergeModal(), IncidentSummaryStrip(), MyReviewQueueRail(), MitreDrawer(), BASE_TECHNIQUES, MitreIntelligence(), AiMlEvaluationLab() (+6 more)

### Community 148 - "IncidentMapPanel.jsx"
Cohesion: 0.16
Nodes (13): BASE_XY_COORDINATES, CurvedGraphRelationships(), findCorrelationEvidence(), getIncident3DPosition(), getIncidentEntities(), getPriorityTheme(), hashString(), IncidentGraphNode() (+5 more)

### Community 149 - "AppLayout.jsx"
Cohesion: 0.36
Nodes (3): Header(), Sidebar(), StatusBar()

### Community 150 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 151 - "models.py"
Cohesion: 0.22
Nodes (16): MeasuredAnalystTest, MLEvaluationReport, MTTTMetrics, BaseModel, SimulationEstimate, TriageSessionRecord, calculate_measured_analyst_test(), calculate_mttt_metrics() (+8 more)

### Community 152 - "preprocessing.py"
Cohesion: 0.18
Nodes (12): Independent Evaluation Script for Alert Relevance Model. Evaluates the trained…, Feature Preprocessing and Explainability Engine for Alert Triage. Combines TF-…, Supervised Model Training Script for Alert Relevance Triage. Trains an…, joblib, numpy, pandas, sklearn_compose, sklearn_ensemble (+4 more)

### Community 153 - "App.jsx"
Cohesion: 0.18
Nodes (10): App(), ArchitecturePipeline(), STAGES, PlaneTopology(), Navigation(), DigitalWater(), SentinelAtmosphere, rootElement (+2 more)

### Community 154 - "get_feature_names"
Cohesion: 0.25
Nodes (9): evaluate_held_out_test_set(), Any, build_preprocessor(), get_feature_names(), Constructs a ColumnTransformer combining TF-IDF vectorization for telemetry…, Retrieves human-readable feature names across all transformer branches., Verifies ColumnTransformer preprocessing across categorical, numerical, and TF-…, test_2_preprocessing_pipeline() (+1 more)

### Community 155 - "test_human_review.py"
Cohesion: 0.19
Nodes (17): app, initialize_pipeline(), Incident, load_reviews(), Any, Safely loads saved analyst reviews from a local JSON file. Returns empty dict…, Persists the human-in-the-loop 2.0 review state for a specific incident.…, Rehydrates existing incidents in memory with previously saved human review… (+9 more)

### Community 156 - "IncidentInspectionModal.jsx"
Cohesion: 0.60
Nodes (4): getPriorityColor(), IncidentInspectionModal(), parseRiskFactors(), PRIORITY_COLORS

### Community 162 - "get"
Cohesion: 0.11
Nodes (19): get_correlation_graph(), get_incident_detail(), get_incident_queue(), get_ingestion_status(), get_ml_metrics(), get_mttt_metrics(), get_raw_alerts(), get_reviews_summary() (+11 more)

### Community 163 - "test_ml_pipeline.py"
Cohesion: 0.17
Nodes (14): generate_training_dataset(), Any, Synthetic Training Dataset Generator for Microsoft Problem Statement #25.…, Transforms a RawAlert from the unified generator into an ML training sample.…, Generates labeled training alerts using the unified generator., transform_alert_to_training_sample(), Verifies metrics.json exists and contains calculated test-set metrics (not…, Verifies that backend/app.py loads the trained model and populates ML fields on… (+6 more)

### Community 164 - "prepare_dataframe"
Cohesion: 0.18
Nodes (13): explain_alert_prediction(), explain_transformed_sample(), map_to_generic_alert_type(), prepare_dataframe(), Any, High-speed vectorized feature attribution for an already-transformed alert…, Computes local feature attributions for a single raw alert DataFrame row., Maps specific alert types to realistic generic SOC alert types/categories,… (+5 more)

## Knowledge Gaps
- **1077 isolated node(s):** `$schema`, `name`, `description`, `name`, `url` (+1072 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1267 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Step 2: Identify Simplification Opportunities` connect `Code Simplification` to `get`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `NormalizedAlert` (e.g. with `correlate_normalized_alerts()` and `map_alerts_to_mitre()`) actually correct?**
  _`NormalizedAlert` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `name`, `description` to the rest of the system?**
  _1077 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Security and Hardening` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `Worked example: Agent Teams for competing-hypothesis debugging` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Code Review and Quality` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Test-Driven Development` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._