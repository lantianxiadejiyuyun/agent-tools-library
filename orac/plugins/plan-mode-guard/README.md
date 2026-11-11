# plan-mode-guard（计划模式看守）

> Agent：Orca ｜ 类别：插件
>
> 插件名：计划模式看守 ｜ ID：`plan-mode-guard`（文件夹安装后为 `local.plan-mode-guard`）

## 作用

Orca 把提示提交给 Agent（Claude Code、Codex 等）之前，自动在提示最前面附加一套「计划模式」协作规则：
先只读查证、有歧义先征求选项、先给短计划再动手、最小改动、测试前先选、中文提交与安全推送、宝塔配置走官方 API、交付时汇报状态。

触发范围：

| 场景 | 是否附加规则 |
| --- | --- |
| Orca 启动新 Agent 时的启动提示 | 会 |
| Orca orchestration 派发、`orca terminal send` 发给 Agent 的提示 | 会 |
| 你在终端里亲手输入的提示 | 不会（Orca 本身不拦截人工输入） |

规则文本在 `src/plan-mode-rules.ts` 的 `PLAN_MODE_RULES`。已经带规则块的提示不会重复附加；旧版本的规则块会被替换成当前版本。

## 安装

需要 Orca ≥ 1.4.248（用到了 `agent.prompt.before` 钩子）。

1. 把本目录放到 Orca 能读到的位置（任意路径均可）。
2. 在本目录下执行：

   ```sh
   orca plugin validate .
   orca plugin install .
   ```

   它是 `trusted-worker` 插件（会运行代码），第一次安装会返回 `approval_required` 与指纹。核对它申请的内容后，按提示带上指纹重跑：

   ```sh
   orca plugin install . --approve ap1-xxxxxxxx
   ```

   安装后 Orca 会把插件复制到全局目录 `%APPDATA%\orca\plugins\local.plan-mode-guard\`，从这里加载。

   - **批准的访问**：以你的用户权限在独立 Node 进程中运行插件代码；读写插件自己的设置（`settings:own`）；挂接 `agent.prompt.before` 钩子。
   - 之后修改源码或规则，需要把 `orca-plugin.json` 的 `version` 加一，再重新执行 `orca plugin install .`（文件变化后会要求新的批准）。
   - 开发时可用热重载代替安装：`orca plugin dev watch .`，Ctrl-C 卸载。

3. 确认状态：

   ```sh
   orca plugin list                                              # local.plan-mode-guard 应显示 running
   orca plugin logs local.plan-mode-guard                        # 查看注入日志
   ```

   `orca plugin test .` 运行 `src/worker.test.ts` 的单元测试。

## 使用

- 无需任何操作。Orca 代发给 Agent 的提示会自动带上规则，Agent 的回复会按「计划模式」执行。
- 关闭/开启：Orca → 设置 → 插件 → 计划模式看守 → 「注入计划模式规则」，选「开（附加规则）」或「关（原样发送）」。设置只接受这两个值，其他值按「关」处理。
- 临时不想让某个 Agent 遵循规则，也可以直接在提示里写明忽略。

示例日志：

```
plan-mode-guard: rules added to a launch prompt for claude
```

## 维护

- 位置：`orac/plugins/plan-mode-guard/`
- 新增后同步更新：仓库根 `README.md` 的「插件总览」、`index.html` 的 `AGENTS` 数据
