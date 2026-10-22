import sys
from pathlib import Path

# Add scripts directory to path
sys.path.append(str(Path(__file__).parent))
from generate_plan_pdf import PHASES_DATA

lines = []
lines.append('# NextRisk AI (TRUVIA) — Comprehensive Master Task Backlog')
lines.append('')
lines.append('**Document Version:** 2.0.0  ')
lines.append('**Date:** October 2026  ')
lines.append('**Lead Architect:** Mohamed Shosha  ')
lines.append('**Format:** Structured for Jira / Linear Project Management Migration (96 Granular Tasks across 10 Sprints)  ')
lines.append('')
lines.append('---')
lines.append('')
lines.append('## 1. Priority Scale')
lines.append('- **P0 (Critical / Blocker):** Core architectural, security, or foundational capabilities required for platform viability.')
lines.append('- **P1 (High):** Primary business module functionality required for minimal viable operation of that module.')
lines.append('- **P2 (Medium):** Advanced capabilities, workflow automation, enhanced visualizations, or usability features.')
lines.append('- **P3 (Low):** Nice-to-have optimizations, cosmetic enhancements, or non-critical extensions.')
lines.append('')
lines.append('## 2. Effort Scale')
lines.append('- **S (Small):** 1–2 development days.')
lines.append('- **M (Medium):** 3–5 development days.')
lines.append('- **L (Large):** 1–2 development weeks.')
lines.append('- **XL (Extra Large):** 2–4 development weeks.')
lines.append('')
lines.append('---')
lines.append('')
lines.append('## 3. Sprint-by-Sprint Master Task Breakdown')
lines.append('')

total_tasks = 0
for phase in PHASES_DATA:
    pid = phase['phase_id']
    pname = phase['phase_name']
    sprint = phase['sprint']
    status = phase['status']
    obj = phase['objective']
    tasks = phase['tasks']
    total_tasks += len(tasks)
    
    lines.append(f'### {pid}: {pname} ({sprint})')
    lines.append(f'**Milestone Goal:** {obj}  ')
    lines.append(f'**Sprint Status:** `{status}`  ')
    lines.append('')
    lines.append('| Task ID | Title & Acceptance Criteria | Subsystem | Priority | Effort | Status | Dependencies |')
    lines.append('|---|---|---|---|---|---|---|')
    for t in tasks:
        tid, title, sub, prio, effort, st, dep, crit = t
        lines.append(f'| **{tid}** | **{title}**<br>_{crit}_ | {sub} | {prio} | {effort} | {st} | {dep} |')
    lines.append('')
    
    # Deliverable block
    out = phase.get('platform_output', {})
    lines.append(f'#### 🎯 Deliverables & Outputs after {pid} ({sprint})')
    lines.append(f"{out.get('summary', '')}")
    lines.append('')
    lines.append('**UI & Pages:**')
    for item in out.get('ui_features', []):
        lines.append(f'- {item}')
    lines.append('')
    lines.append('**Backend & APIs:**')
    for item in out.get('backend_capabilities', []):
        lines.append(f'- {item}')
    lines.append('')
    lines.append(f"**Business Impact:** {out.get('business_value', '')}")
    lines.append('')
    lines.append('---')
    lines.append('')

output_file = Path(r"c:\Users\Mohamed Shosha\Desktop\nextrisk\docs\TASK_BACKLOG.md")
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'Successfully updated docs/TASK_BACKLOG.md with {total_tasks} tasks!')
