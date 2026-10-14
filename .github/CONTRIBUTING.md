# 贡献指南

## 开发流程

1. 创建特性分支：`git checkout -b feat/你的功能名`
2. 提交代码，标题遵循下面的 Commit 规范
3. 推送分支并创建 Pull Request

## Commit 规范

标题格式：`type(scope): 中文描述`，`scope` 可选。

| Type     | 说明     |
| -------- | -------- |
| feat     | 新功能   |
| fix      | Bug 修复 |
| refactor | 重构     |
| test     | 测试相关 |
| docs     | 文档变更 |
| chore    | 杂项     |
| perf     | 性能优化 |

描述必须含中文。以 `Merge `、`Revert `、`fixup! `、`squash! `、`amend! ` 开头的标题直接放行。

仓库带一个 `commit-msg` 钩子（`.pre-commit-config.yaml`），提交前按 `scripts/check-commit-msg.py` 校验标题。克隆后装一次：

```bash
python -m pip install --user pre-commit   # 已装可跳过；用 pipx 也行：pipx install pre-commit
pre-commit install --hook-type commit-msg
```

## 提交前自检

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run format:check
npm run check:pack
```

同一套检查在 CI 里跑（`.github/workflows/ci.yml`），矩阵覆盖 ubuntu 与 windows、Node 22 与 24；另有 `gitleaks` 工作流扫描密钥。

## PR 要求

- 一个 PR 只做一件事，标题遵循同一套 Commit 规范
- 说明改了什么、怎么验证的

## 问题反馈

用 [Issue Tracker](../issues) 提交问题或建议；安全问题按 [SECURITY.md](./SECURITY.md) 走仓库的 Security 页。
