// The plan-mode collaboration rules the guard attaches to prompts Orca submits to agents.
// Edit the text here, bump `version` in orca-plugin.json, then reinstall the plugin.

export const RULES_MARKER = '【计划模式 · Orca 看守插件注入】'

/** What a previously injected block starts with, whatever version wrote it. */
const INJECTED_BLOCK = /^【计划模式[^】]*】/

export const PLAN_MODE_RULES = `${RULES_MARKER}以下规则适用于本次任务：
1. 澄清与计划：先只读检查查明事实；影响目标、范围、兼容性、数据、费用、部署或外部影响的未决问题先问用户（每题 2–4 个选项，推荐项放第一并说明取舍），不擅自决定。跳过、空答、超时与关闭都不是同意，也不重复追问已跳过的同一问题。开工前给出短计划：目标、必要改动、明确不改什么、风险与验收方式。用户只要方案时不执行。
2. 最小改动：改前先读文件并检查 git status、暂存区和现有差异，只改必需内容；不顺手重构、不全局格式化、不升级无关依赖、不批量改名；保留他人已有修改；不自动 stash、reset、clean、checkout 覆盖、amend 或删除已有文件。
3. 修改后询问"是否对本次必要改动进行快速测试？"，说明建议命令、覆盖面及是否写入数据或访问网络；选项：测试后提交推送（推荐）、跳过测试继续提交推送、暂不测试也不提交推送。跳过提问或无法取得回答时按待确认交付，不提交、不推送。涉及真实服务、数据或计费的测试另行确认；测试失败只修相关问题，不提交失败版本。
4. Git：用户选中本模式即视为对明确仓库、当前分支、本任务范围内普通提交与非强制推送的默认意图；只暂存本任务明确文件，不用 git add . 或 -A；提交信息用中文；不提交密钥、令牌、凭据、生产数据转储。推送前 fetch 目标远端分支并核对 ahead/behind 与分叉；远端领先或分叉时暂停询问，不强推、不改写历史。多个候选仓库、无远端、detached HEAD 或目标分支不明时先问；不自行 git init、建远端、切分支或改全局 Git 配置。
5. 宝塔部署：区分已本地提交与已推送；站点、域名、SSL、反向代理、运行环境、数据库等面板配置优先用宝塔官方 API，不绕过面板直接改；密钥不写入仓库、命令或日志；官方 API 无能力时停下给选项；部署前确认目标、影响、备份与回滚。
6. 交付：简要列出必要改动、未改范围、快速测试的通过、失败、明确跳过或待确认状态、本地提交与远端结果、部署状态与剩余阻碍。本规则是协作指令，不是权限沙箱，不能承诺绝不偏离。`

/** The run of newlines text starts with. */
const LEADING_NEWLINES = /^\n*/

/**
 * The prompt to submit with the rules ahead of it. The extra newlines placed between the rules and
 * the prompt include any `separator` Orca itself puts there, so the rules are not glued to the
 * prompt. A rewritable hook can be given this plugin's own output as its next prompt; a prompt that
 * already starts with the rules is left as it is rather than gaining a copy.
 */
export function withPlanMode(text: string, separator = ''): string {
  if (hasPlanMode(text)) return text
  const gap = separator.length > 1 ? separator : '\n\n'
  return PLAN_MODE_RULES + gap + text
}

/** True when the text already carries these rules. */
export function hasPlanMode(text: string): boolean {
  return text.includes(RULES_MARKER)
}

/** True when the text carries any version of this plugin's rules block, current or older. */
export function hasInjectedRules(text: string): boolean {
  return INJECTED_BLOCK.test(text)
}

/** Leading newlines in `text`, used by the tests to reason about the separator. */
export function leadingNewlines(text: string): string {
  return LEADING_NEWLINES.exec(text)![0]
}

/**
 * `text` without a rules block at its start (plus the newlines that followed it), so the rules can
 * be attached again after they changed; text with no such block is returned unchanged. A block
 * from an older version has other lines, so the remainder may keep its last line.
 */
export function withoutPlanMode(text: string): string {
  if (!hasInjectedRules(text)) return text
  const ruleLines = PLAN_MODE_RULES.split('\n').length
  return text.split('\n').slice(ruleLines).join('\n').replace(/^\n+/, '')
}
