#!/usr/bin/env node
// UserPromptSubmit hook: prints the active design scratchpad and the design
// checklist so they land at the end of the context on every turn.
// Silent (no output, exit 0) when the project isn't a game-design project or
// no scratchpad is active. Never blocks the prompt.

const fs = require('fs');
const path = require('path');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8').replace(/^﻿/, '');
  } catch {
    return '';
  }
}

function frontmatterStatus(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const s = m[1].match(/^\s*status\s*:\s*(\S+)/m);
  return s ? s[1].trim().toLowerCase() : null;
}

function main() {
  let cwd = process.cwd();
  const raw = readStdin();
  if (raw) {
    try {
      const input = JSON.parse(raw);
      if (input && typeof input.cwd === 'string' && input.cwd) cwd = input.cwd;
    } catch {
      // not JSON — keep process.cwd()
    }
  }

  const config = path.join(cwd, '.claude', 'project-structure.json');
  if (!fs.existsSync(config)) return;

  const dir = path.join(cwd, '.claude', 'scratchpads');
  if (!fs.existsSync(dir)) return;

  let files;
  try {
    files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.md'));
  } catch {
    return;
  }

  const active = [];
  for (const f of files) {
    const full = path.join(dir, f);
    let text;
    try {
      text = fs.readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    if (frontmatterStatus(text) === 'active') {
      active.push({ name: f, text, mtime: fs.statSync(full).mtimeMs });
    }
  }
  if (active.length === 0) return;

  // If more than one is active (shouldn't happen), take the most recently touched.
  active.sort((a, b) => b.mtime - a.mtime);
  const pad = active[0];

  let checklist = '';
  try {
    checklist = fs.readFileSync(
      path.join(__dirname, '..', 'shared', 'design-checklist.md'),
      'utf8'
    );
  } catch {
    // checklist missing — still inject the scratchpad
  }

  const out = [];
  out.push('<design-session>');
  out.push(
    'Current design topic — working notes (`.claude/scratchpads/' +
      pad.name +
      '`). Frame, goals, fixed decisions, rejected ideas and user directives below are the ' +
      'state of this topic and take precedence over anything else loaded earlier in the ' +
      'conversation. Update the file after this turn if anything changes.'
  );
  out.push('');
  out.push(pad.text.trim());
  if (checklist) {
    out.push('');
    out.push('---');
    out.push(checklist.trim());
  }
  if (active.length > 1) {
    out.push('');
    out.push(
      'Note: more than one scratchpad is marked active (' +
        active.map((a) => a.name).join(', ') +
        '). Set all but the topic in focus to `paused`.'
    );
  }
  out.push('</design-session>');
  process.stdout.write(out.join('\n') + '\n');
}

try {
  main();
} catch (err) {
  // never fail the prompt; leave a trace for debugging
  process.stderr.write('inject-scratchpad: ' + (err && err.message ? err.message : err) + '\n');
}
process.exit(0);
