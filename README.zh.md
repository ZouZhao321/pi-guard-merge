# pi-guard-merge

[English](./README.md) | [中文](./README.zh.md)

把「静默地合并 PR、推主干」变成明确的确认动作的 pi 扩展。命中 `bash` 命令里的合并、改分支规则、推 `main` / `master` 等动作时，先弹框要你批准；没回应按拒绝处理。

## 安装

首选从 npm 安装已发布的包：

```bash
pi install npm:pi-guard-merge
```

也可以直接从 git 仓库安装：

```bash
pi install git:github.com/ZouZhao321/pi-guard-merge
```

本地开发时直接安装检出目录：

```bash
pi install ./guard-merge
```

## 做什么

扩展入口是 `src/guard-merge.ts`，在 `package.json` 里由 `pi.extensions` 声明。它不注册工具，也不注册命令，只挂一个事件：

- `pi.on("tool_call", ...)` —— 检查每次 `bash` 工具调用，命中守卫规则时拦下。只处理 `bash` 调用，判定走 `isToolCallEventType("bash", event)`。

受守卫的命令，以及扩展给每条规则用的弹框标题：

| 命令                                                 | 标题                     |
| ---------------------------------------------------- | ------------------------ |
| `gh pr merge ...`                                    | `合并 PR`                |
| `gh api .../merge`、`.../protection`、`.../rulesets` | `合并 PR 或改动分支规则` |
| `git push` 未给分支名                                | `推送（未指定分支）`     |
| `git push <remote>` 未给分支名                       | `推送（未指定分支）`     |
| `git push ... main` 或 `git push ... master`         | `推送主干分支`           |
| `git push ... --all`、`--mirror`、`--force` 或 `-f`  | `推送全部分支或强制推送` |

三种结果：

1. 命中且有 UI —— 弹确认框，显示命中的标题与完整命令，倒计时 10 秒（`ctx.ui.confirm(..., { timeout: TIMEOUT_MS })`）。批准后调 `ctx.ui.notify` 并放行；10 秒内没有回应按拒绝处理，该次调用被拦下并给出原因。
2. 命中且无 UI（`pi -p`、`--mode json`）—— 直接拒绝，因为非交互会话里没有人能给出授权；否则用 `-p` 跑就成了一条绕过通道。
3. 未命中 —— 原样放行。

这是打断静默动作的机制，不是安全边界。扩展与 agent 同权限（见 pi 的 `docs/security.md`「No Built-in Sandbox」），正则可以被变量拼接之类的写法绕过，扩展文件本身也能被改写。

## 配置

没有配置文件，也没有环境变量。所有可调项都是 `src/guard-merge.ts` 里的常量：

- `TIMEOUT_MS`（`10_000`）—— 确认框等待多久后按拒绝处理；提示文案按 `TIMEOUT_MS / 1000` 换算成秒。
- `GUARDED` —— 上表那些 `{ pattern, label }` 条目。按顺序对原始 `bash` 命令字符串做匹配，第一条命中生效。

要改守卫范围，改这两个常量后重新安装扩展。

## 开发

需要 Node.js >= 22。

```bash
npm install
npm run typecheck     # tsc --noEmit
npm run format        # prettier --write src/ scripts/
npm run format:check  # prettier --check src/ scripts/
npm test              # node scripts/smoke.mjs
```

`npm test` 跑冒烟检查：解析 `package.json`，断言 `license` 为 `MIT`，并断言 `pi.extensions` 列出的路径都真实存在。

要在 pi 里试本地改动，重新跑 `pi install ./guard-merge`。

## 贡献

见 [.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md)；安全问题按 [.github/SECURITY.md](./.github/SECURITY.md) 从仓库的 Security 页报告。

## 许可证

MIT，见 [LICENSE](./LICENSE)。
