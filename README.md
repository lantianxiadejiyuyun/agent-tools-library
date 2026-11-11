# agent-tools-library

多个自用 Agent 插件的合集仓库。按 **Agent（一级目录）/ 功能分类（二级目录）/ 插件（三级目录）** 组织，每个插件目录内自带 `README.md`，说明**它有什么用**以及**如何安装**。

在线索引：[index.html](index.html)

## 目录结构

```
<agent>/<类别>/<插件名>/
    README.md        # 必须：作用说明 + 安装方法
```

| 类别 | 目录 | 含义 |
| --- | --- | --- |
| Skill | `skills/` | 技能：按需加载的指令/知识包（如 `SKILL.md`） |
| 插件 | `plugins/` | 独立可安装的插件包（commands / hooks / MCP 等） |
| 模式 | `modes/` | 角色模式 / 行为模式提示词 |

### 当前 Agent 一级目录

| Agent | 目录 | 本仓库内的插件 |
| --- | --- | --- |
| Orca | [`orac/`](orac/) | [plan-mode-guard](orac/plugins/plan-mode-guard/) |
| DeepSeek | [`deepseek/`](deepseek/) | 暂无 |

> 新增 Agent 时，同样创建 `skills/`、`plugins/`、`modes/` 三个分类目录，并在上表补一行。

## 插件总览

| Agent | 类别 | 插件 | 说明 |
| --- | --- | --- | --- |
| Orca | 插件 | [plan-mode-guard](orac/plugins/plan-mode-guard/README.md) | Orca 下发给 Agent 的提示自动附加「计划模式」协作规则（先只读查证、有歧义先征求选项、先给短计划、最小改动、测试前先选、中文提交与安全推送、交付汇报） |

## 新增一个插件

1. 在对应位置创建目录：`<agent>/<类别>/<插件名>/`
2. 编写 `README.md`，至少包含：
   - **作用**：解决什么问题、何时触发
   - **安装**：文件放到哪里、如何启用
   - **使用示例**
3. 更新本文件「插件总览」表格，以及 `index.html` 中的插件数据。

## 维护约定

- 目录名使用小写英文 + 连字符（如 `code-review`）。
- 同一插件若提供多种能力，归入其主要类别，其余在 README 中注明。
- 删除或重命名插件时，同步更新本 README 和 `index.html`。
- 新建插件时可直接复制 [`_template/README.md`](_template/README.md) 作为模板（模板目录本身不是插件，不登记）。
- 预览索引页：直接在浏览器打开 `index.html`（纯静态，无依赖）。
