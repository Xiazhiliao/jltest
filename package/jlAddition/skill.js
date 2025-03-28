import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
let skillInfo = {
	//在这里编写技能。
	skill: {
		//孙策[冠勇盖世]
		jlsg_gygs_jiang: {
			audio: "ext:极略:2",
			trigger: {
				player: "useCardToPlayered",
				target: "useCardToTargeted",
			},
			filter(event, player, name) {
				if (!["sha", "juedou"].includes(event.card.name)) return false;
				let giver;
				if (name == "useCardToPlayered") {
					if (event.targets.length != 1) return false;
					giver = event.target;
				}
				else giver = event.player;
				return giver.countGainableCards(player, "h");
			},
			async cost(event, trigger, player) {
				let giver;
				if (event.triggername == "useCardToPlayered") giver = trigger.target;
				else giver = trigger.player;
				let name = ["sha", "juedou"].filter(i => trigger.card.name != i)[0];
				const card = get.autoViewAs({ name }, []);
				event.result = await player.gainPlayerCard("h", giver)
					.set("prompt", get.prompt("jlsg_gygs_jiang", giver))
					.set("prompt2", lib.translate["jlsg_gygs_jiang_info"])
					.set("ai", () => {
						if (get.event("check")) return get.event().getRand();
						return false;
					})
					.set("check", (function () {
						const gain = get.effect(giver, { name: "shunshou_copy2" }, player, player),
							use = get.effect(giver, card, player, player);
						if (giver.countGainableCards(player, "h") > 1) return gain + use > 0;
						else return gain > 0;
					})())
					.set("logSkill", ["jlsg_gygs_jiang", giver])
					.set("chooseonly", true)
					.forResult();
				if (event.result) {
					event.result.targets = [giver];
					event.result.skill_popup = false;
					event.result.cost_data = { card };
				}
			},
			async content(event, trigger, player) {
				const { targets: [target], cards, cost_data: { card } } = event;
				await player.gain(cards, target, "bySelf");
				player.when({ global: "useCardAfter" })
					.filter(evt => evt.card == trigger.card)
					.step(async (event, trigger, player) => {
						if (!target.countCards("h")) return;
						if (player.canUse(card, target, false)) await player.useCard(card, target).set("addCount", false);
					});
			},
			ai: {
				effect: {
					target(card, player, target) {
						if (!["sha", "juedou"].includes(card.name)) return;
						if (player.countGainableCards(target, "h")) return [1, 1, 1, -1];
					},
					player(card, player, target) {
						if (!["sha", "juedou"].includes(card.name)) return;
						if (target.countGainableCards(player, "h")) return [1, 1, 1, -1];
					},
				}
			},
		},
		jlsg_gygs_weifeng: {
			audio: "ext:极略:2",
			trigger: { global: "phaseZhunbeiBegin" },
			filter(event, player) {
				if (event.player == player) return false;
				return player.canCompare(event.player);
			},
			check(event, player) {
				return get.attitude(player, event.player) < 0;
			},
			logTarget: "player",
			async content(event, trigger, player) {
				const card = get.autoViewAs({ name: "sha" }, []),
					{ player: target } = trigger;
				const { result } = await player.chooseToCompare(target);
				if (result.winner == player) {
					await player.draw(2);
					if (player.canUse(card, target, false)) await player.useCard(card, target).set("addCount", false);
				}
				else {
					const bool = player.chooseBool(`威风：是否令${get.translation(target)}摸两张牌并视为对你使用一张【杀】？`)
						.set("ai", (event, player) => {
							const trigger = event.getTrigger();
							const target = trigger.player;
							const draw = get.effect(target, { name: "draw" }, player, player),
								sha = get.effect(player, get.autoViewAs({ name: "sha" }, []), target, player);
							return draw + sha > 0;
						})
						.forResultBool();
					if (bool) {
						await target.draw(2);
						if (target.canUse(card, player, false)) await target.useCard(card, player).set("addCount", false);
					}
				}
			},
		},
	},
	translate: {
	},
	dynamicTranslate: {
	},
}
export const skill = skillInfo;