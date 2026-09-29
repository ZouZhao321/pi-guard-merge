/**
 * Merge Guard Extension — 远端动作前的确认守卫
 *
 * 在 bash 里检测到「需要用户明确授权」的命令时，弹出带倒计时的确认框；
 * 超时按拒绝处理，非交互模式直接拒绝。
 *
 * 覆盖的命令：
 *   - gh pr merge ...                                合并 PR
 *   - gh api .../merge|/protection|/rulesets         直接调合并接口或改动分支规则
 *   - git push（未给出分支名）                        推的是当前分支，落在主干上就拦不住
 *   - git push ... master|main                       显式推送主干分支
 *   - git push ... --all|--mirror|--force|-f         推全部分支或强制推送
 *
 * 三层行为：
 *   1. 命中命令 + 有 UI  → 弹确认框，10 秒倒计时，超时算拒绝
 *   2. 命中命令 + 无 UI  → 直接拒绝（没有人能给出授权）
 *   3. 未命中            → 放行
 *
 * 这是「打断静默行为」的机制，不是安全边界。扩展与 agent 同权限
 * （见 pi 的 docs/security.md「No Built-in Sandbox」），正则可以被
 * 变量拼接之类的写法绕过，扩展文件本身也能被改写。
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";

/** 确认框的等待毫秒数，超时按拒绝处理。 */
const TIMEOUT_MS = 10_000;

/** 需要用户明确授权的命令。 */
const GUARDED: { pattern: RegExp; label: string }[] = [
	{ pattern: /\bgh\s+pr\s+merge\b/, label: "合并 PR" },
	{
		pattern: /\bgh\s+api\b[^\n]*\/(merge|protection|rulesets)/,
		label: "合并 PR 或改动分支规则",
	},
	// 没给出分支名：推的是当前分支，落在主干上就拦不住
	{ pattern: /\bgit\s+push\b(?=\s*(?:$|[;&|]))/m, label: "推送（未指定分支）" },
	{
		pattern: /\bgit\s+push\b(?:\s+-{1,2}[\w-]+)*\s+\S+\s*$/m,
		label: "推送（未指定分支）",
	},
	// 显式推主干，或推全部分支 / 强制推送
	{ pattern: /\bgit\s+push\b[^\n]*\b(master|main)\b/, label: "推送主干分支" },
	{
		pattern: /\bgit\s+push\b[^\n]*\s(?:--all|--mirror|--force|-f)\b/,
		label: "推送全部分支或强制推送",
	},
];

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;

		const command = event.input.command ?? "";
		const hit = GUARDED.find((g) => g.pattern.test(command));
		if (!hit) return;

		// 非交互模式（pi -p / --mode json）没有对话框，也就没有人能授权。
		// 按拒绝处理：否则用 -p 跑就成了一条绕过通道。
		if (!ctx.hasUI) {
			return {
				block: true,
				reason: `非交互模式下无法获得授权，已拒绝「${hit.label}」：${command}`,
			};
		}

		const approved = await ctx.ui.confirm(
			`需要你确认：${hit.label}`,
			`${command}\n\n${TIMEOUT_MS / 1000} 秒内无回应按拒绝处理。`,
			{ timeout: TIMEOUT_MS },
		);

		if (approved) {
			ctx.ui.notify(`已授权：${hit.label}`, "info");
			return;
		}
		return {
			block: true,
			reason: `${TIMEOUT_MS / 1000} 秒内未获确认，按拒绝处理：${hit.label}`,
		};
	});
}
