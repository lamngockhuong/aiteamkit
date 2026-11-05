// One `claude -p` call, and the two shapes the bench makes of it: a turn of the skill session, whose
// stream-json output becomes the transcript, and a helper call with no tool at all. Every child is
// spawned detached and tracked, so a signal or an exit kills it with its process group.

import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { baseArgs, claudeEnv, mask, track, killTree } from './isolate.mjs';

const IS_WINDOWS = process.platform === 'win32';

function call({ args, input, env, cwd, timeoutMs }) {
  return new Promise((done) => {
    const child = spawn('claude', args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'], detached: !IS_WINDOWS, shell: false });
    track(child);
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    child.stdout.on('data', (b) => { stdout += b.toString('utf8'); });
    child.stderr.on('data', (b) => { stderr = (stderr + b.toString('utf8')).slice(-2000); });
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, timeoutMs);
    let finished = false;
    const finish = (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      done({ code, timedOut, stdout, stderr });
    };
    child.on('error', (e) => { stderr = e.message; finish(-1); });
    // 'exit' can come before stdout is drained, and the result event is its last line; 'close' waits
    // for the pipes. A process the child left holding them gets two seconds, then the call ends.
    child.on('close', (code) => finish(code));
    child.on('exit', (code) => setTimeout(() => finish(code), 2000).unref());
    child.stdin.on('error', () => { /* the child left before reading */ });
    child.stdin.end(input);
  });
}

// One turn: the first one starts the session under a known ID, a later one resumes it. The prompt
// reaches the child on standard input only. The transcript is appended with every secret masked.
export async function turn({ run, auth, secrets, prompt, sessionId, resume, model, allowedTools, pluginDir, budgetUsd, timeoutMs, transcript }) {
  const args = [...baseArgs(run), '--output-format', 'stream-json', '--verbose', '--model', model,
    '--max-budget-usd', String(budgetUsd)];
  if (allowedTools?.length) args.push('--allowedTools', ...allowedTools);
  if (pluginDir) args.push('--plugin-dir', pluginDir);
  args.push(resume ? '--resume' : '--session-id', sessionId);
  const started = Date.now();
  const r = await call({ args, input: prompt, env: claudeEnv(run, auth), cwd: run.seed, timeoutMs });
  // Masked once, before anything is read from it, so no field the run keeps can carry a secret.
  const stdout = mask(r.stdout, secrets);
  appendFileSync(transcript, mask(JSON.stringify({ type: 'bench_prompt', resume: !!resume, prompt }), secrets) + '\n' + stdout);
  const out = { cost: 0, turns: 0, wallMs: Date.now() - started, error: null, denials: [], toolUses: [], lastText: '' };
  let result = null;
  for (const line of stdout.split('\n')) {
    let ev;
    try { ev = JSON.parse(line); } catch { continue; }
    if (ev.type === 'assistant') {
      for (const part of ev.message?.content || []) {
        if (part.type === 'tool_use') out.toolUses.push({ name: part.name, input: part.input });
        if (part.type === 'text' && part.text.trim()) out.lastText = part.text;
      }
    }
    if (ev.type === 'result') result = ev;
  }
  if (result) {
    out.cost = Number(result.total_cost_usd) || 0;
    out.turns = Number(result.num_turns) || 0;
    out.denials = result.permission_denials || [];
    if (typeof result.result === 'string' && result.result.trim()) out.lastText = result.result;
  }
  if (r.timedOut) out.error = `timed out after ${Math.round(timeoutMs / 1000)} s`;
  else if (!result) out.error = mask(r.stderr.trim().split('\n').pop() || `exit ${r.code}, no result`, secrets);
  else if (result.is_error || result.subtype !== 'success') out.error = `session ended with ${result.subtype || 'an error'}`;
  return out;
}

// A helper call: no tool, no plugin, its own config, an empty working directory. Returns the text
// it answered and what it cost. A call that fails, or whose answer `accept` refuses, is made once
// more, since one bad helper answer would otherwise end a paid run.
export async function helper({ run, auth, secrets, prompt, model, budgetUsd, timeoutMs = 180_000, accept = () => true }) {
  const args = [...baseArgs(run), '--tools', '', '--output-format', 'json', '--model', model, '--max-budget-usd', String(budgetUsd)];
  let cost = 0;
  let error = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await call({ args, input: prompt, env: claudeEnv(run, auth, { helper: true }), cwd: run.helperDir, timeoutMs });
    let parsed = null;
    try { parsed = JSON.parse(r.stdout); } catch { parsed = null; }
    cost += Number(parsed?.total_cost_usd) || 0;
    if (!parsed || parsed.is_error) {
      error = `helper call failed: ${r.timedOut ? 'timed out' : mask((parsed?.subtype) || r.stderr.trim().split('\n').pop() || `exit ${r.code}`, secrets)}`;
      continue;
    }
    const text = mask(String(parsed.result || ''), secrets);
    if (accept(text)) return { text, cost, error: null };
    error = 'helper answer could not be read';
  }
  return { text: '', cost, error };
}

// The first JSON object in a model's answer, which may carry prose around it.
export function firstJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}
