# Changelog

所有重要的版本变更都会记录在此文件。

格式基于 [Keep a Changelog](https://keepachangelog.com/)。

## [Unreleased]

## [0.1.0] - 2026-10-14

### Added

- 注册 `tool_call` 钩子，只用 `isToolCallEventType("bash", event)` 检查 `bash` 工具调用，命中受守卫模式时才介入，不注册任何工具与命令
- 受守卫的命令：`gh pr merge`，`gh api` 中带 `/merge`、`/protection`、`/rulesets` 的调用，未给出分支名的 `git push`，推 `main` 或 `master` 的 `git push`，以及带 `--all`、`--mirror`、`--force` 或 `-f` 的 `git push`
- 有 UI 时用 `ctx.ui.confirm` 弹出确认框，展示命中的用途标签与原始命令，授权通过 `ctx.ui.notify` 提示后放行
- 确认框按 `TIMEOUT_MS` 倒计时，十秒内无回应按拒绝处理并给出拦截原因
- 非交互模式（`pi -p`、`--mode json`）下命中命令直接拒绝，避免把无人授权的会话变成绕过通道
- 用 `TIMEOUT_MS` 与 `GUARDED` 两个常量集中配置等待时长与被守卫的命令清单，`GUARDED` 按顺序匹配原始命令字符串且首个命中生效
- 未命中任何模式的其他命令原样放行
