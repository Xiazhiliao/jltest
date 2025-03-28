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
		//SK杨婉
		jlsg_youyan: {
			audio: "ext:极略:2",
			trigger: { player: "useCardAfter" },
			filter(event, player) {
				if (event.card.storage?.jlsg_youyan) return false;
				if (!player.isPhaseUsing()) return false;
				if (!["basic", "trick"].includes(get.type(event.card))) return false;
				if (lib.card[event.card.name]?.notarget) return false;
				return game.hasPlayer(current => !player.hasStorage("jlsg_youyan_used", current));
			},
			async cost(event, trigger, player) {
				const card = get.autoViewAs({ name: trigger.card.name, storage: { "jlsg_youyan": true } }, []);
				const select = get.select(lib.card[trigger.card.name]?.selectTarget);
				let toSelf = false;
				if (select[1] >= 1) toSelf = true;
				event.result = await player.chooseTarget(`###是否发动诱言？###选择一名角色令其${toSelf ? "对你" : ""}使用【${get.translation(card.name)}】，然后你恢复1点体力并摸三张牌`)
					.set("filterTarget", (card, player, target) => !player.hasStorage("jlsg_youyan_used", target))
					.set("ai", target => {
						const player = get.player(),
							card = get.event().card,
							toSelf = get.event().toSelf,
							extraEff = get.event().extraEff;
						const att = Math.sign(get.attitude(player, target));
						if (toSelf) return get.effect(player, card, target, player) + extraEff;
						return att * target.getUseValue(card) + extraEff;
					})
					.set("extraEff", get.recoverEffect(player, player, player) + get.effect(player, { name: "draw" }, player, player) * 1.5)
					.set("card", card)
					.set("toSelf", toSelf)
					.forResult();
				if (event.result) {
					event.result.cost_data = { card, toSelf };
				}
			},
			async content(event, trigger, player) {
				const { targets: [target], cost_data: { card, toSelf } } = event;
				player.addTempSkill("jlsg_youyan_used", { player: "phaseUseEnd" });
				player.markAuto("jlsg_youyan_used", [target]);
				let next;
				if (target == player && toSelf) next = player.useCard(card, player);
				else {
					next = target.chooseUseTarget(card, true);
					if (toSelf) {
						next.set("source", player)
							.set("filterTarget", (card, player, target) => target == get.event("source"));
					}
				}
				await next;
				await player.recover(1);
				await player.draw(3);
			},
			subSkill: {
				used: {
					sourceSkill: "jlsg_youyan",
					sub: true,
					charlotte: true,
					onremove: true,
					intro: {
						content: "本阶段已对$发动过技能",
					},
				},
			},
		},
		jlsg_zhuihuan: {
			audio: "ext:极略:2",
			onremove: true,
			intro: {
				nocount: true,
				content(storage, player) {
					const targets = storage[0];
					if (targets.length) return `${get.translation(targets)}和你有仇`;
					return `你暂时没有仇家`;
				},
			},
			trigger: { player: "phaseZhunbeiBegin" },
			filter(event, player) {
				return player.hasStorage("jlsg_zhuihuan");
			},
			direct: true,
			async content(event, trigger, player) {
				const targets = player.getStorage("jlsg_zhuihuan")[0].filter(target => target.isIn());
				if (targets.length) {
					const { result } = await player.chooseBool(get.prompt2(event.name, player.getStorage("jlsg_zhuihuan")[0], player))
						.set("ai", (event, player) => {
							return (player.getStorage("jlsg_zhuihuan")[0]
								.reduce((sum, current) => sum + get.damageEffect(current, player, player), 0)
								> 0);
						})
					if (result.bool) {
						await player.logSkill(event.name, targets)
						for (let target of targets) {
							if (!target.isIn()) continue;
							await target.damage(2, player, "nocard");
						};
					}
				}
				player.storage.jlsg_zhuihuan[0] = player.storage.jlsg_zhuihuan[1];
				player.markSkill("jlsg_zhuihuan");
			},
			group: "jlsg_zhuihuan_record",
			subSkill: {
				record: {
					sourceSkill: "jlsg_youyan",
					sub: true,
					forced: true,
					popup: false,
					charlotte: true,
					trigger: { player: ["phaseBegin", "damageEnd"] },
					filter(event, player) {
						if (event.name == "damage") return event.source?.isIn() && event.source != player;
						return true;
					},
					async content(event, trigger, player) {
						if (trigger.name == "damage") {
							if (!player.hasStorage("jlsg_zhuihuan")) return;
							if (player.storage.jlsg_zhuihuan[1]) {
								player.storage.jlsg_zhuihuan[1].add(trigger.source);
								player.storage.jlsg_zhuihuan[1].sortBySeat();
							}
							player.markSkill("jlsg_zhuihuan");
						}
						else {
							if (!player.storage.jlsg_zhuihuan) {
								player.storage.jlsg_zhuihuan = [[], []];
							}
							else {
								player.storage.jlsg_zhuihuan[1] = [];
							}
						}
					}
				},
			},
		},
	},
	translate: {
		jlsg_gygs_jiang: "激昂",
		jlsg_gygs_jiang_info: "当你使用【杀】或【决斗】仅指定一名其他角色为目标后，或成为其他角色使用这些牌的目标后，你可以获得其一张手牌，若如此做，此牌结算后，若其有手牌，你视为对其使用另一种牌。",
		jlsg_gygs_weifeng: "威风",
		jlsg_gygs_weifeng_info: "其他角色的准备阶段，你可以与该角色拼点：若你赢，你摸两张牌并视为对其使用一张不计入次数的【杀】；否则，你可以令其摸两张牌并视为对你使用一张不计入次数的【杀】。",
		jlsg_youyan: "诱言",
		jlsg_youyan_info: "出牌阶段对每名角色限一次，当你使用基本牌或非延时锦囊牌后，你可以选择一名角色，视为其使用此牌（须选择目标的牌的目标为你），然后你回复1点体力并摸三张牌。",
		jlsg_zhuihuan: "追还",
		jlsg_zhuihuan_info: "准备阶段，你可以对你的上个回合开始后对你造成过伤害的其他角色各造成2点伤害。"
	},
	dynamicTranslate: {
	},
}
export const skill = skillInfo;