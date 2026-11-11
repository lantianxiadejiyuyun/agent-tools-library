// Plan-mode guard: before Orca submits a prompt to an agent (agent.prompt.before), it puts the
// plan-mode collaboration rules ahead of the prompt. Prompts a person types are never hooked; only
// text Orca itself sends is changed. Orca transpiles this file when it loads: no build step.
// No `export` besides the default: a named export breaks loading.
// Keep `orca-plugin.json` at its scaffolded shape (one hook, a string setting `mode`): re-rendering
// it from a larger manifest made the host read the setting as `off`.
import type { OrcaWorkerApi } from 'orca/worker'
import { hasPlanMode, withoutPlanMode, withPlanMode } from './plan-mode-rules'

export default function activate(orca: OrcaWorkerApi): void {
  orca.hooks.on('agent.prompt.before', async (event, next) => {
    // "off" sends the prompt unchanged; that is the only other value Settings offers.
    if ((await orca.settings.get('mode')) === 'off') return undefined
    if (hasPlanMode(event.prompt)) return undefined
    // An agent launch is hooked before its prompt is submitted, so a launch prompt may already
    // carry an older copy: swap it for this version's rules.
    const prompt = withPlanMode(withoutPlanMode(event.prompt))
    orca.log(`plan-mode-guard: rules added to a ${event.inputKind} prompt for ${event.agent ?? 'an agent'}`)
    return next({ prompt })
  })
}
