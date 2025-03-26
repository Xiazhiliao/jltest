import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
let skillInfo = {
	//在这里编写技能。
	skill: {
		jlsg_rm_guanwang: {//观望
			trigger: {
				player: ["phaseZhunbeiBegin", "phaseJieshuBegin", "useCard", "damageEnd", "loseMaxHpAfter", "loseAfter"],
				global: "loseAsyncAfter",
			},
			filter(event, player) {
				if (player.storage?.jlsg_rm_guanwang) {
					if (event.name == "phaseZhunbei") return true;
					else if (event.name == "damage") return false;
					else if (event.name == "loseMaxHp") return true;
				}
				if (event.name == "phaseJieshu") return true;
				else if (event.name == "damage") return true;
				else if (event.name == "useCard") return true;
				return event.getl && event.getl(player)?.cards2?.length && event.getParent().name != "useCard";
			},
			async cost(event, trigger, player) {
				if (["phaseZhunbei", "phaseJieshu"].includes(trigger.name)) {
					event.result = await player.chooseBool(`观望：是否翻面并摸${player.getHp()}张牌`)
						.set("ai", (event, player) => {
							if (player.hasSkillTag("noTurnover")) return true;
							else return 2 - player.getHp() > 0;
						})
						.forResult();
				} else {
					let str = `观望：回复1点体力，是否翻面并弃置一名角色X张手牌（X为你的体力值）`;
					if (!player.storage?.jlsg_rm_guanwang) str = `观望：是否翻面并弃置一名角色X张牌（X为你的体力值）`;
					event.result = await player.chooseTarget(str)
						.set("filterTarget", (_, player, target) => {
							let onlyHand = player.storage?.jlsg_rm_guanwang;
							if (onlyHand) return target.countDiscardableCards(player, "h");
							return target.countDiscardableCards(player, "he");
						})
						.set("ai", target => {
							const player = get.player();
							return get.effect(target, { name: "guohe_copy2" }, player, player);
						})
						.forResult();
					if (!event.result.bool && player.storage?.jlsg_rm_guanwang && player.isDamaged()) {
						event.result.bool = true;
					}
				}
			},
			async content(event, trigger, player) {
				if (["phaseZhunbei", "phaseJieshu"].includes(trigger.name)) {
					await player.turnOver();
					await player.draw(player.getHp());
				}
				else {
					if (player.storage?.jlsg_rm_guanwang) await player.recover(1);
					if (event.targets?.length) {
						await player.turnOver();
						await player.discardPlayerCard(
							`观望：弃置${get.translation(event.targets[0]), get.cnNumber(player.getHp())}张${player.storage?.jlsg_rm_guanwang ? "手" : ""}牌`,
							player.getHp(),
							event.targets[0],
							true,
							player.storage?.jlsg_rm_guanwang ? "h" : "he",
						);
					}
				}
			},
			group: ["jlsg_rm_guanwang_break"],
			subSkill: {
				break: {
					sub: true,
					sourceSkill: "jlsg_rm_guanwang",
					forced: true,
					trigger: { player: ["phaseBefore", "phaseAfter", "turnOverBefore", "linkBefore"] },
					filter(event, player) {
						if (player != _status.currentPhase || !player.storage?.jlsg_rm_guanwang) return false;
						if (get.sourceSkillFor(event) == "jlsg_rm_guanwang") return false;
						if (event.name.includes("turnOver")) return !player.isTurnedOver();
						else if (event.name.includes("link")) return !player.isLinked();
						return player.isTurnedOver() || player.isLinked();
					},
					async content(event, trigger, player) {
						if (trigger.name.includes("turnOver") || trigger.name.includes("link")) trigger.cancel();
						if (player.isTurnedOver()) await player.turnOver(false);
						if (player.isLinked()) await player.link(false);
					},
					ai: {
						noLink: true,
						noTurnover: true,
						skillTagFilter(player) {
							return player.storage?.jlsg_rm_guanwang && player == _status.currentPhase;
						},
					},
				},
			},
		},
		jlsg_rm_yintui: {//隐退
			locked: true,
			onremove: true,
			trigger: {
				player: ["addJudgeBefore", "damageBegin4", "useCard", "loseAfter"],
				global: "loseAsyncAfter",
				target: "useCardToTarget",
			},
			filter(event, player) {
				if (!player.isTurnedOver()) return false;
				if (event.name == "useCardToTarget") return get.type(event.card, null, false) == "trick" && get.color(event.card) == "black";
				else if (event.name == "addJudge") return get.color(event.card) == "black";
				else if (event.name == "damage") return event.num > 1;
				else if (event.name == "useCard") {
					let type = get.type2(event.card, player);
					return !player.hasHistory("useSkill", evt => {
						if (evt.skill != "jlsg_rm_yintui") return false;
						return evt.event._result?.cost_data?.includes(type);
					});
				}
				else {
					if (event.getParent().name == "useCard") return false;
					if (!event.getl || !event.getl(player)) return false;
					let cards = event.getl(player).cards2;
					if (cards.length) {
						let typeList = cards.map(c => get.type2(c, player)).unique().filter(i => {
							return !player.hasHistory("useSkill", evt => {
								if (evt.skill != "jlsg_rm_yintui") return false;
								return evt.event._result?.cost_data?.includes(i);
							});
						});
						return typeList.length;
					}
				}
				return false;
			},
			async cost(event, trigger, player) {
				event.result = { bool: true };
				if (!["useCardToTarget", "addJudge", "damage"].includes(trigger.name)) {
					if (trigger.name == "useCard") event.result.cost_data = [get.type2(trigger.card, player)];
					else {
						let typeList = trigger.getl(player).cards2
							.map(c => get.type2(c, player))
							.unique()
							.filter(i => {
								return !player.hasHistory("useSkill", evt => {
									if (evt.skill != "jlsg_rm_yintui") return false;
									return evt.event._result?.cost_data?.includes(i);
								});
							});
						event.result.cost_data = typeList;
					}
				}
			},
			async content(event, trigger, player) {
				if (trigger.name == "useCardToTarget") {
					trigger.targets.remove(player);
					trigger.getParent().triggeredTargets2.remove(player);
					trigger.untrigger();
				} else if (trigger.name == "addJudge") {
					trigger.cancel();
					const owner = get.owner(trigger.card);
					if (owner?.getCards("hej").includes(trigger.card)) await owner.lose(trigger.card, ui.discardPile);
					else await game.cardsDiscard(trigger.card);
					game.log(trigger.card, "进入了弃牌堆");
				} else if (trigger.name == "damage") {
					let num = trigger.num - 1;
					trigger.num -= num;
				} else {
					await player.draw(event.cost_data.length);
				}
			},
			ai: {
				effect: {
					target: function (card, player, target, current) {
						if (!target.isTurnedOver()) return;
						if (get.type(card, "trick") == "trick" && get.color(card) == "black") return "zeroplayertarget";
					},
				},
			},
			group: ["jlsg_rm_yintui_turnedOver"],
			subSkill: {
				turnedOver: {
					sub: true,
					sourceSkill: "jlsg_rm_yintui",
					forced: true,
					trigger: { source: ["damageBegin1", "dying"] },
					filter(event, player) {
						return !player.isTurnedOver();
					},
					async content(event, trigger, player) {
						if (trigger.name == "damage") trigger.num++;
						else {
							if (!trigger.player.hasSkill("jlsg_rm_yintui_block")) trigger.player.addTempSkill("jlsg_rm_yintui_block", { global: "roundStart" });
						}
					}
				},
				block: {
					sub: true,
					sourceSkill: "jlsg_rm_yintui",
					mark: true,
					intro: {
						content: "不能对其他角色使用牌",
					},
					mod: {
						playerEnabled: function (card, player, target) {
							if (player != target) return false;
						},
					},
				},
			},
		},
		jlsg_rm_jiuhu: {//九狐
			skillAnimation: true,
			animationColor: "orange",
			juexingji: true,
			forced: true,
			mark: true,
			limited: true,
			intro: {
				content: "limited",
			},
			trigger: { player: "dying" },
			async content(event, trigger, player) {
				player.awakenSkill("jlsg_rm_jiuhu");
				let num = 9 - player.maxHp;
				if (num > 0) await player.gainMaxHp(num);
				else if (num < 0) await player.loseMaxHp(-num);
				num = 3 - player.getHp();
				if (num > 0) await player.recoverTo(3);
				if (!player.hasSkill("jlsg_rm_xianji")) await player.addSkills("jlsg_rm_xianji");
				if (player.hasSkill("jlsg_rm_guanwang") && !player.storage?.jlsg_rm_guanwang) {
					player.storage.jlsg_rm_guanwang = true;
					game.log(player, "升级了", "#g观望");
				}
			},
			ai: {
				maixie: true,
				maixue_defend: true,
			},
		},
		jlsg_rm_xianji: {//献计
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return player.countDiscardableCards(player, "h") == player.countCards("h");
			},
			async content(event, trigger, player) {
				await player.discard(player.getCards("h"));
				const skillsList = [];
				for (var i in lib.character) {
					var info = lib.character[i];
					if (!info) continue;
					if (info[1] != "qun" || !info[3]?.length) continue;
					if (lib.filter.characterDisabled(i)) continue;
					if (lib.filter.characterDisabled2(i)) continue;
					skillsList.addArray(info[3].filter(s => {
						if (player.hasSkill(s)) return false;
						let skillInfo = get.info(s);
						if (!skillInfo) return false;
						if (lib.filter.skillDisabled(s)) return false;
						if (skillInfo.ai && skillInfo.ai.combo && !player.hasSkill(skillInfo.ai.combo)) return false;
						return true;
					}));
					skillsList.flat();
				};
				skillsList.randomSort();
				if (skillsList.length) await player.addSkills(skillsList.randomGet());
			},
			group: "jlsg_rm_xianji_phaseJieshu",
			subSkill: {
				phaseJieshu: {
					sourceSkill: "jlsg_rm_xianji",
					sub: true,
					trigger: { player: "phaseJieshuBegin" },
					filter(event, player) {
						return player.countCards("h") < player.getHp();
					},
					prompt(event, player) {
						let num = Math.min(5, player.getHp() - player.countCards());
						return `献计：是否减一点体力上限并摸${get.cnNumber(num)}张牌`;
					},
					check(event, player) {
						if (player.maxHp < 2 || get.effect(player, { name: "draw" }, player, player) < 0) return false;
						return player.countCards("h") < 2;
					},
					async content(event, trigger, player) {
						await player.loseMaxHp(1);
						let num = Math.min(5, player.getHp() - player.countCards());
						await player.draw(num);
					}
				},
			},
		},
	},
	translate: {
		jlsg_rm_guanwang: "观望",
		jlsg_rm_guanwang_info: "结束阶段，你可以翻面并摸X张牌；当你失去牌或受到伤害后，你可以翻面并弃置一名角色X张牌（X为你的体力值）。",
		jlsg_rm_yintui: "隐退",
		jlsg_rm_yintui_info: "锁定技，当你的武将牌背面朝上时，你受到的伤害固定为1，黑色锦囊牌指定你为目标时，取消之，你使用牌时或失去牌后，你摸一张牌（每回合每种类别限一次）；当你的武将牌背面朝上时，你造成的伤害+1，当你令其他角色进入濒死状态时，其本轮不能对其他角色使用牌。",
		jlsg_rm_jiuhu: "九狐",
		jlsg_rm_jiuhu_info: "觉醒技，当你进入濒死状态时，你将体力上限调整至9并将体力值回复至3点，然后你获得【献计】并升级【观望】。",
		jlsg_rm_xianji: "献计",
		jlsg_rm_xianji_info: "出牌阶段限一次，你可以弃置所有手牌，然后随机获得一个群势力武将的一个技能。结束阶段，你可以减少1点体力上限，然后将手牌数补至体力值（至多摸5张）。",
	},
	dynamicTranslate: {
		jlsg_rm_guanwang: function (player) {
			if (player.storage?.jlsg_rm_guanwang) return "准备阶段或结束阶段，你可以翻面并摸X张牌；当你失去牌或体力上限减少后，你回复1点体力，且可以翻面并弃置一名角色X张手牌（X为你的体力值）。你的回合内，你始终处于非横置和武将牌正面朝上状态。";
			return "结束阶段，你可以翻面并摸X张牌；当你失去牌或受到伤害后，你可以翻面并弃置一名角色X张牌（X为你的体力值）。";
		}
	},
}
export const skill = skillInfo;