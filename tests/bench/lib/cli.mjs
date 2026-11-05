// The runner's command line and its defaults. A default found wrong after a measured run is changed
// here, which is a commit of a setting rather than of a result.

export const DEFAULTS = {
  runs: 3,
  arms: ['kit', 'bare'],
  model: 'sonnet',
  helperModel: 'haiku',
  judgeModel: 'sonnet',
  judgeVotes: 3,
  parallel: 2,
  // Seconds one turn of a session may take before the run is an error.
  timeout: 900,
  // Per turn, passed to --max-budget-usd: every --resume is a call of its own.
  budgetUsd: 2,
  // Per step, summed over its turns; over it the run is an error.
  stepBudgetUsd: 5,
  maxTurns: 6,
  // Per helper call: the classifier, the responder and one judge vote.
  helperBudgetUsd: 0.5,
};

// The design caps runs at three per scenario and refuses a higher value.
export const MAX_RUNS = 3;

export class UsageError extends Error {}

export const USAGE = 'node tests/bench/run.mjs <scenario|all> [--runs n] [--arms kit,bare] [--model id] '
  + '[--max-cost-usd n] [--parallel n] [--timeout s] [--dry-run] | --recheck <results-dir>';

export function parseArgs(argv) {
  const opts = { target: null, runs: null, arms: null, model: DEFAULTS.model, maxCostUsd: null, parallel: DEFAULTS.parallel,
    timeout: DEFAULTS.timeout, dryRun: false, recheck: null };
  const value = (i, flag) => {
    if (i >= argv.length || argv[i].startsWith('--')) throw new UsageError(`${flag} needs a value`);
    return argv[i];
  };
  const whole = (v, flag, max = Infinity) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > max) {
      throw new UsageError(`${flag} needs a whole number of 1 or more${Number.isFinite(max) ? `, at most ${max}` : ''}`);
    }
    return n;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--runs') opts.runs = whole(value(++i, a), a, MAX_RUNS);
    else if (a === '--parallel') opts.parallel = whole(value(++i, a), a, 8);
    else if (a === '--timeout') opts.timeout = whole(value(++i, a), a, 3600);
    else if (a === '--model') {
      opts.model = value(++i, a);
      if (!/^[\w.:[\]-]+$/.test(opts.model)) throw new UsageError('--model needs a model name');
    } else if (a === '--arms') {
      opts.arms = [...new Set(value(++i, a).split(','))];
      if (!opts.arms.length || opts.arms.some((x) => !DEFAULTS.arms.includes(x))) throw new UsageError('--arms takes kit, bare or kit,bare');
    } else if (a === '--max-cost-usd') {
      opts.maxCostUsd = Number(value(++i, a));
      if (!(opts.maxCostUsd > 0)) throw new UsageError('--max-cost-usd needs an amount above 0');
    } else if (a === '--recheck') opts.recheck = value(++i, a);
    else if (a.startsWith('--')) throw new UsageError(`unknown flag ${a}`);
    else if (!opts.target) opts.target = a;
    else throw new UsageError(`unexpected argument ${a}`);
  }
  if (opts.recheck ? opts.target || opts.dryRun : !opts.target) throw new UsageError(USAGE);
  // A recheck pays only for the judge's votes, one rubric per run, and has no cap to stop them by.
  if (opts.recheck && opts.maxCostUsd) throw new UsageError('--max-cost-usd does not apply to --recheck, which starts no session');
  return opts;
}
