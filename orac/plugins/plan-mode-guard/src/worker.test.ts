// Runs the hook as Orca would, with this worker as the only plugin in the chain.
import { assert, mountWorker, mockHost, test } from 'orca/testing'
import * as main from './worker'
import { PLAN_MODE_RULES, hasPlanMode, withoutPlanMode, withPlanMode } from './plan-mode-rules'

const prompt = (text: string, over: { inputKind?: 'driving' | 'orchestration' | 'launch'; agent?: string | null } = {}) => ({
  agent: over.agent === undefined ? 'claude' : over.agent,
  terminalId: 't1',
  prompt: text,
  inputKind: over.inputKind ?? 'driving'
})

const mount = (settings: Record<string, unknown> = {}) =>
  mountWorker(main, {
    host: mockHost({ capabilities: ['settings:own'], settings }),
    hooks: [{ event: 'agent.prompt.before' }]
  })

// As the host answers it: a setting the person has chosen reads back as stored, and a manifest
// default reads back as "off" here (the scaffolded manifest shape the plugin relies on).
const mountWithStored = (mode: string) => mount({ mode })

test('put the rules ahead of an Orca-submitted prompt', async () => {
  const worker = await mountWithStored('plan')
  const decision = await worker.hooks.fire('agent.prompt.before', prompt('修复登录状态判断'))
  assert.equal(decision.kind, 'continue')
  if (decision.kind !== 'continue') return
  assert.equal(decision.event.prompt, PLAN_MODE_RULES + '\n\n修复登录状态判断')
  assert.equal(decision.event.inputKind, 'driving')
  await worker.deactivate()
})

test('leave a prompt that already carries the rules as it is', async () => {
  const worker = await mountWithStored('plan')
  const already = withPlanMode('提交并推送')
  assert.deepEqual(await worker.hooks.fire('agent.prompt.before', prompt(already)), {
    kind: 'continue',
    event: prompt(already)
  })
  await worker.deactivate()
})

test('do nothing when the setting turns the guard off', async () => {
  const worker = await mountWithStored('off')
  assert.deepEqual(await worker.hooks.fire('agent.prompt.before', prompt('ls')), {
    kind: 'continue',
    event: prompt('ls')
  })
  assert.deepEqual(worker.logs, [])
  await worker.deactivate()
})

test('the rules block is added once, however the prompt reaches it', () => {
  const once = withPlanMode('任务')
  assert.equal(withPlanMode(withPlanMode('任务')), once)
  assert.equal(withPlanMode(once, '\n\n'), once)
  assert.equal(withoutPlanMode(once), '任务')
  assert.equal(withoutPlanMode('任务'), '任务')
  assert.ok(hasPlanMode(once))
  assert.ok(!hasPlanMode('任务'))
})
