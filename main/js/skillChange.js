import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
//技能调整
export default {
  //废案
  /*SK曹婴
  jlsgsk_caoying: {
    jlsg_lingruo: {
      audio: "xinfu_lingren",
      trigger: {
        player: "useCardToPlayered",
        target: "useCardToTargeted",
      },
      filter: function (event, player, name) {
        if (event.card.name != 'sha' && get.type(event.card) != 'trick') return false;
        var target = name == "useCardToPlayered" ? event.target : event.player;
        return player != target;
      },
      logTarget: function (event, player, name) {
        return name == "useCardToPlayered" ? event.target : event.player;
      },
      ptompt2: function (event, player, name) {
        var target = name == "useCardToPlayered" ? event.target : event.player;
        return `对${get.translation(target)}随机执行一项效果`;
      },
      check: function (event, player, name) {
        var target = name == "useCardToPlayered" ? event.target : event.player;
        return get.attitude(player, target) < 0;
      },
      async content(event, trigger, player) {
        event.target = event.triggername == "useCardToPlayered" ? trigger.target : trigger.player;
        event.num = 0;
        for (var i of ['basic', 'trick', 'equip']) {
          var pl = player.countCards('he', card => get.type2(card) == i);
          var ta = event.target.countCards('he', card => get.type2(card) == i);
          if (pl > ta) event.num++;
        };
        for (var i = 0; i < event.num; i++) {
          const list = ['draw', 'gain', 'discard'];
          if (!event.target.countGainableCards(player, 'he')) list.remove('gain');
          if (!event.target.countDiscardableCards(player, 'he')) list.remove('discard');
          switch (list.randomGet(i)) {
            case 'draw':
              game.log(`凌弱：${get.translation(player)}本次随机效果为摸一张牌`);
              await player.draw();
              break;
            case 'gain':
              game.log(`凌弱：${get.translation(player)}本次随机效果为获得${get.translation(event.target)}一张牌`);
              await player.gainPlayerCard(event.target, 1);
              break;
            case 'discard':
              game.log(`凌弱：${get.translation(player)}本次随机效果为令${get.translation(event.target)}随机弃置一张牌`);
              await event.target.randomDiscard(1);
              break;
          }
          await game.asyncDelay();
        };
      },
      ai: {
        threaten: 2.4,
      },
    },
    jlsg_fujian: {
      init(player) {
        player.storage.jlsg_fujian = {};
      },
      onremove: true,
      mark: true,
      intro: {
        markcount: () => 0,
        mark(dialog, storage, player) {
          dialog.addText('伏间已记录');
          var targets = [];
          for (var i in storage) {
            var target = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
            if (player == game.me || player.isUnderControl()) {
              var cards = [];
              for (var j in storage[i]) target.getCards('he', function (card) {
                if (card.cardid == j) cards.add(card);
              });
              const buttons = ui.create.div('.buttons', dialog.content);
              buttons.classList.add('smallzoom');
              dialog.buttons = dialog.buttons.concat(ui.create.buttons([target], 'player', buttons, true), ui.create.buttons(cards, 'card', buttons, true));
              if (dialog.buttons.length) {
                if (dialog.forcebutton !== false) dialog.forcebutton = true;
                if (dialog.buttons.length > 5) {
                  dialog.classList.remove('forcebutton-auto');
                }
                else if (!dialog.noforcebutton) {
                  dialog.classList.add('forcebutton-auto');
                }
              }
              ui.update();
            }
            else targets.add(target);
          };
          if (targets.length) dialog.addSmall(targets);
        },
        content(storage) {
          var targets = [], str = '<div class="text center">伏间已记录</div><br>';
          for (var i in storage) {
            var target = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
            var cards = [];
            for (var j in storage[i]) {
              target.getCards('he', function (card) {
                if (card.cardid == j) cards.add(card);
              })
            }
            if (player == game.me || player.isUnderControl()) str += `${get.translation(target)}:${get.translation(cards)}<br>`;
            else targets.add(target);
          }
          if (targets.length) str += `${get.translation(targets)}`
          return str;
        },
      },
      audio: "xinfu_fujian",
      trigger: { player: "phaseZhunbeiBegin" },
      filter(event, player) {
        return game.hasPlayer(function (current) {
          return current != player && current.countCards('h');
        });
      },
      check(event, player) {
        return game.hasPlayer(function (current) {
          if (current == player || !current.countCards('h')) return false;
          if (get.attitude(current, player) > 0) {
            return get.effect(current, { name: 'losehp' }, player, current) > 2;
          }
          else return current.countCards('h');
        });
      },
      popup: false,
      async cost(event, trigger, player) {
        event.result = await player.chooseTarget(`伏间：请一名有手牌的角色`, true, 1)
          .set('filterTarget', function (card, player, target) {
            return target != player && target.countCards('h');
          })
          .set('ai', function (target) {
            var player = get.player();
            if (get.attitude(target, player) > 0) {
              return get.effect(target, { name: 'losehp' }, player, target) > 2;
            }
            else return target.countCards('h');
          })
          .forResult();
      },
      async content(event, trigger, player) {
        const target = event.targets[0]
        const cards = target.getCards('h');
        if (!player.storage.jlsg_fujian[target.playerid]) player.storage.jlsg_fujian[target.playerid] = {};
        const [bool, links] = await player
          .chooseButton(['选择要标记的一张牌作', cards], true)
          .set("target", target)
          .set('filterButton', function (button) {
            const vcard = [];
            for (var i in player.storage.jlsg_fujian[get.event("target").playerid]) vcard.add(i);
            return !vcard.some(i => button.link.cardid == i)
          })
          .set('ai', function (button) {
            var target = get.event("target"), card = button.link;
            var val = target.getUseValue(card);
            if (val > 0) return val;
            return get.value(card);
          })
          .forResult('bool', 'links');
        if (!bool) return
        await player.logSkill('jlsg_fujian', target);
        player.storage.jlsg_fujian[target.playerid][links[0].cardid] = 0;
        await game.delayx();
      },
      group: ['jlsg_fujian_draw'],
      subSkill: {
        draw: {
          trigger: {
            global: ["die", "useCard", "loseAfter", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
          },
          filter: function (event, player) {
            if (['useCard', 'die'].includes(event.name)) return player.storage.jlsg_fujian[event.player.playerid];
            return game.hasPlayer(function (current) {
              for (var i in player.storage.jlsg_fujian) {
                if (i == current.playerid) {
                  var cards = [];
                  for (var j in player.storage.jlsg_fujian[i]) cards.push(j);
                  var evt = event.getl(current);
                  if (evt && evt.player == current && evt.cards && evt.cards.some(i => cards.includes(i.cardid))) return true;
                  return false;
                }
              }
            });
          },
          forced: true,
          popup: false,
          charlotte: true,
          content: function () {
            if (trigger.name == 'useCard') {
              for (var i in player.storage.jlsg_fujian[trigger.player.playerid]) player.storage.jlsg_fujian[trigger.player.playerid][i]++;
            }
            else if (trigger.name == 'die') delete player.storage.jlsg_fujian[trigger.player.playerid];
            else {
              game.countPlayer(function (current) {
                for (var i in player.storage.jlsg_fujian) {
                  if (i == current.playerid) {
                    var cards = [], tag = [];
                    for (var j in player.storage.jlsg_fujian[i]) cards.push(j);
                    var evt = trigger.getl(i);
                    if (evt && evt.player == i && evt.cards && evt.cards.some(i => cards.includes(i.cardid))) {
                      var num1 = 0, num2 = 0;
                      for (var j of evt.cards) {
                        if (cards.includes(j.cardid)) {
                          var eff = trigger.getParent();
                          var name = trigger.name == 'loseAsync' ? eff.type : eff.name;
                          if (name == "useCard") num2++;
                          num1++;
                          num2 += player.storage.jlsg_fujian[i.playerid][j.cardid];
                          delete player.storage.jlsg_fujian[i.playerid][j.cardid];
                        }
                      }
                      for (var j in player.storage.jlsg_fujian[i.playerid]) tag.add(j);
                      if (!tag.length) delete player.storage.jlsg_fujian[i.playerid];
                      player.logSkill('jlsg_fujian', i);
                      i.loseHp(num1);
                      player.draw(num2);
                    }
                  }
                }
              });
            }
          },
        }
      },
    },
  },*/
  //SK关索
  jlsgsk_guansuo: {
    jlsg_zhengnan: {
      audio: "ext:极略:2",
      enable: "phaseUse",
      usable: 1,
      filterTarget: function (card, player, target) {
        let vcard = get.autoViewAs({ name: "nanman", isCard: true, storage: { jlsg_zhengnan: true } }, []);
        return target.hasUseTarget(vcard);
      },
      async content(event, trigger, player) {
        const target = event.targets[0],
          card = get.autoViewAs({ name: "nanman", isCard: true, storage: { jlsg_zhengnan: true } }, []);
        await target.chooseUseTarget(card, true);
      },
      ai: {
        order: function (item, player) {
          return get.order({ name: 'nanman' }, player) + 0.5;
        },
        result: {
          target: function (player, target) {
            return Math.sign(get.effect(target, { name: "draw" }, player, player))
          },
          player: 1,
        },
        threaten: 0.5,
      },
      group: ["jlsg_zhengnan_damage"],
      subSkill: {
        damage: {
          audio: "jlsg_zhengnan",
          forced: true,
          trigger: { global: 'damageEnd' },
          filter: function (event, player) {
            return event.card && event.card.name == 'nanman' && event.card.storage?.jlsg_zhengnan;
          },
          async content(event, trigger, player) {
            let drawer = [player, trigger.source].filter(p => p.isIn());
            await game.asyncDraw(drawer);
          },
        },
      },
    },
    delete: ["jlsg_zhengnan2"],
    translate: {
      jlsg_zhengnan_info: "出牌阶段限一次，你可以选则一名角色，视为其使用【南蛮入侵】，当此牌每造成一次伤害，你与其各摸一张牌。",
    },
  },
  //SP姜维
  jlsgsk_jiangwei: {
    jlsg_kunfen: {
      audio: "ext:极略:2",
      trigger: { player: ["damageEnd", "loseHpEnd", "loseMaxHpAfter"] },
      forced: true,
      content() {
        player.draw(3);
        if (player.getHistory("useSkill", evt => evt.skill == "jlsg_kunfen").length < 2) player.recover();
      },
      ai: {
        maixie: true,
        maixue_hp: true,
        effect: {
          target: function (card, player, target) {
            if (get.tag(card, 'fireDamage') && target.hasSkillTag("nofire", null, { player: target, card: card })) return 0;
            else if (get.tag(card, 'thunderDamage') && target.hasSkillTag("nothunder", null, { player: target, card: card })) return 0;
            else if (get.tag(card, "damage")) {
              if (!target.hasFriend()) return;
              if (target.hasSkillTag("nodamage", null, { player: target, card: card })) return 0;
              let num = 1;
              if (get.attitude(player, target) > 0) {
                if (player.needsToDiscard()) num = 0.5;
                else num = 0.3;
              }
              if (target.hp >= 4) num = num * 2;
              if (target.hp == 3) num = num * 1.5;
              if (target.hp == 2) num = num * 0.5;
              if (!target.hasHistory("useSkill", evt => evt.skill == "jlsg_kunfen")) return [1, num * 1.1];
              return [1, num];
            }
          },
        },
      },
    },
    jlsg_caiyu: {
      audio: "ext:极略:2",
      init: (player) => {
        player.addInvisibleSkill("jlsg_caiyu_flash");
        player.storage.jlsg_caiyu = {};
      },
      onremove: true,
      trigger: { player: "phaseZhunbeiBegin" },
      getList(player) {
        const configx = lib.config.extension_极略测试_jlsgsk_jiangwei;
        let list = {};
        if (!_status.characterlist) lib.skill.pingjian.initList();
        let character = _status.characterlist.filter(name => {
          if (["character", "all"].includes(configx)) {
            if (!lib.translate[name]) return false;
            return lib.translate[name].includes("诸葛亮") || name.includes("zhugeliang");
          }
          else return [
            'jlsgsr_zhugeliang',
            'sp_zhugeliang',
            'jlsgsoul_zhugeliang',
            'jlsgsoul_sp_zhugeliang',
          ].includes(name);
        });
        for (const name of character) {
          if (!get.character(name)) continue;
          list[name] = (get.character(name)[3] ?? []).filter(skill => {
            if (player.hasSkill(skill)) return false;
            const info = get.info(skill);
            if (!info) return false;
            let filter = true;
            if (!["skills", "all"].includes(configx)) {
              if (info.ai && info.ai.combo) filter = player.hasSkill(info.ai.combo);
            }
            return filter && !info.charlotte && (info.zhuSkill && player.isZhu2() || !info.zhuSkill);
          });
          if (!list[name] || !list[name].length) delete list[name];
        }
        return list;
      },
      async cost(event, trigger, player) {
        let configx = lib.config.extension_极略测试_jlsgsk_jiangwei,
          list = lib.skill.jlsg_caiyu.getList(player);
        let str = "###才遇：是否减1点体力上限，随机获得一个诸葛亮";
        if (["skills", "all"].includes(configx)) str += "的全部技能";
        else str += "的一个技能";
        if (!Object.keys(list).length) str += "###<div class='center text'>（已经获得全部技能了）</div>";
        const { result } = await player.chooseBool(str)
          .set("list", list)
          .set("ai", (event, player) => {
            const list = Object.entries(get.event("list"));
            if (player.hasSkill("jlsg_xingyun") && !player.hasSkill("shuishi")) return false;
            return list.length && player.maxHp > 2;
          })
        event.result = {
          bool: result.bool,
          cost_data: list,
        };
      },
      async content(event, trigger, player) {
        await player.loseMaxHp();
        const configx = lib.config.extension_极略测试_jlsgsk_jiangwei,
          info = event.cost_data;
        const name = Object.keys(info).randomGet();
        const skills = ["skills", "all"].includes(configx) ? info[name] : info[name].randomGets(1);
        if (!player.storage.jlsg_caiyu[name]) player.storage.jlsg_caiyu[name] = [];
        if (skills.some(i => !player.storage.jlsg_caiyu[name].includes(i))) player.storage.jlsg_caiyu[name].push(...skills);
        player.flashAvatar(event.name, name);
        await player.addSkills(skills);
      },
      subSkill: {
        flash: {
          trigger: { player: ["logSkillBegin", "useSkillBegin", "changeSkillsAfter"] },
          filter(event, player, name) {
            if (name != "changeSkillsAfter") {
              const skill = event.sourceSkill || event.skill;
              for (let i in player.storage.jlsg_caiyu) {
                if (player.storage.jlsg_caiyu[i].includes(skill)) return true;
              };
              return false;
            }
            else {
              if (!event.getParent("jlsg_caiyu") && !event.addSkill.length) return false;
              let ss = game.expandSkills(event.addSkill);
              for (let s of ss) {
                if (!lib.skill[s] || !lib.skill[s].trigger) continue;
                let tri = lib.skill[s].trigger;
                if (tri.player) {
                  if (typeof tri.player == "string") tri.player = [tri.player];
                  if (Array.isArray(tri.player)) {
                    if (tri.player.includes("enterGame")) return true;
                  }
                }
              };
              return false;
            }
          },
          forced: true,
          popup: false,
          charlotte: true,
          async content(event, trigger, player) {
            if (event.triggername != "changeSkillsAfter") {
              const skill = trigger.sourceSkill || trigger.skill;
              for (let name in player.storage.jlsg_caiyu) {
                if (player.storage.jlsg_caiyu[name].includes(skill)) {
                  player.flashAvatar("jlsg_caiyu", name);
                  break;
                }
              };
            }
            else {
              let skills = trigger.addSkill.filter(i => {
                let ss = game.expandSkills([i]);
                for (let s of ss) {
                  if (!lib.skill[s] || !lib.skill[s].trigger) continue;
                  let tri = lib.skill[s].trigger;
                  if (tri.player) {
                    if (typeof tri.player == "string") tri.player = [tri.player];
                    if (Array.isArray(tri.player)) {
                      if (tri.player.includes("enterGame")) return true;
                    }
                  }
                };
                return false;
              });
              if (skills.length) {
                const next = game.createEvent("enterGame", false, { next: [] });
                for (let i of skills) await game.createTrigger("enterGame", i, player, next);
              }
            }
          },
        },
      },
    },
  },
  //SK南华老仙
  jlsgsk_nanhualaoxian: {
    jlsg_xianshou: {
      audio: "ext:极略:2",
      derivation: "jlsg_tiandao",
      trigger: { player: "phaseBegin" },
      async cost(event, trigger, player) {
        event.result = await player.chooseTarget(`仙授：选择一名角色，令其获得天道，若已拥有，则改为判定`)
          .set("ai", (target, targets) => {
            const player = get.player();
            const bool = (player.hasSkill("spshicai") || player.hasSkill("yjshicai")) || _status.pileTop?.isKnownBy(player);
            const bool2 = bool ? get.suit(_status.pileTop, player) != "spade" : Math.random() > 0.3;
            const bool3 = bool ? get.suit(_status.pileTop, player) == "spade" : Math.random() > 0.7;
            if (get.attitude(player, target) > 0) {
              if (!target.hasSkill("jlsg_tiandao")) return 1.5;
              if (targets) {
                for (let i of targets) {
                  if (get.attitude(player, i) > 0 && !i.hasSkill("jlsg_tiandao")) return 0;
                }

              }
              return target.hasSkill("jlsg_tiandao") && bool2;
            }
            return target.hasSkill("jlsg_tiandao") && bool3;
          })
          .forResult();
      },
      async content(event, trigger, player) {
        const target = event.targets[0];
        if (!target.hasSkill("jlsg_tiandao")) await target.addSkills(["jlsg_tiandao"]);
        else {
          const suit = await player.judge("jlsg_xianshou").forResult("suit");
          const num = [0, 1, 2, 3].randomGet();
          if (suit != "spade") target.storage.jlsg_tiandao[num]++;
          else target.storage.jlsg_tiandao[num]--;
        }
        target.markSkill("jlsg_tiandao");
      },
    },
    jlsg_tiandao: {
      audio: "ext:极略:2",
      marktext: "道",
      mark: true,
      intro: {
        markcount: storage => storage,
        content(storage) {
          return `回合开始阶段，你摸${storage[0]}张牌，随机获得不在场上且你拥有的群势力武将的${storage[1]}个技能，然后可与选择一名角色，令其随机弃置${storage[2]}张牌，对其造成${storage[3]}点雷电伤害。`
        },
      },
      init(player, skill) {
        player.storage[skill] = [1, 1, 1, 1];
        lib.dynamicTranslate[skill] = function (player) {
          const storage = player.storage.jlsg_tiandao;
          return `锁定技回合开始阶段，你摸${storage[0]}张牌，随机获得不在场上且你拥有的群势力武将的${storage[1]}个技能，然后可与选择一名角色，令其随机弃置${storage[2]}张牌，对其造成${storage[3]}点雷电伤害。`
        };
      },
      onremove: true,
      trigger: { player: "phaseZhunbeiBegin" },
      forced: true,
      filter: (event, player) => player.storage.jlsg_tiandao.some(i => i > 0),
      async content(event, trigger, player) {
        const info = player.storage.jlsg_tiandao;
        if (info[0] > 0) await player.draw(info[0]);
        if (info[1] > 0) {
          const skills = lib.skill.jlsg_tiandao.getSkill(player, info[1]);
          if (skills.length) await player.addSkills(skills);
          else player.chat(`没有技能了`);
        };
        if (info[2] < 1 && info[3] < 1) return;
        else {
          const prompt2 = [];
          if (info[2] > 0) prompt2.push(`令其随机弃置${info[2]}张牌`);
          if (info[3] > 0) prompt2.push(`对其造成${info[3]}点雷电伤害`);
          const targets = await player.chooseTarget()
            .set("prompt", "天道：是否选择一名角色")
            .set("prompt2", prompt2.join("，"))
            .set("ai", target => {
              if (info[2] < 1 && info[3] < 1) return 0;
              let damage = get.damageEffect(target, get.player(), get.player(), "thunder"),
                discard = get.effect(target, { name: "guohe_copy2" }, get.player(), get.player());
              return damage + discard > 0;

            })
            .forResultTargets();
          if (!targets) return;
          await player.logSkill("jlsg_tiandao", targets[0]);
          if (info[2] > 0) await targets[0].randomDiscard(info[2]);
          if (info[3] > 0) await targets[0].damage(player, info[3], "thunder");
          await game.delayx();
        }
      },
      getSkill: function (player, num) {
        const list = [];
        if (_status.connectMode) {
          let characters = get.charactersOL();
          for (var i of characters) {
            const info = get.character(i);
            if (!info) continue;
            if (info[1] != "qun") continue;
            let list2 = (info[3] ?? []);
            list.addArray(list2);
          };
        }
        else {
          for (var i in lib.character) {
            if (lib.filter.characterDisabled2(i) || lib.filter.characterDisabled(i)) continue;
            const info = lib.character[i];
            if (!info) continue;
            if (info[1] != "qun") continue;
            let list2 = get.gainableSkillsName(i, (skills, skill) => !player.hasSkill(skill));
            list.addArray(list2);
          };
        }
        const skillList = list.filter(i => {
          const skill = get.info(i);
          if (!skill || !lib.translate[i] || !lib.translate[i + "_info"]) return false;
          let filter = true;
          if (skill.groupSkill && skill.groupSkill != "qun") return false;
          if (skill.ai && skill.ai.combo) filter = player.hasSkill(skill.ai.combo);
          return filter &&
            !skill.zhuSkill &&
            !skill.limited &&
            !skill.juexingji &&
            !skill.hiddenSkill &&
            !skill.charlotte &&
            !skill.dutySkill;
        });
        if (skillList.length > num) return skillList.randomGets(num);
        return skillList;
      },
    },
    jlsg_chengfeng: {
      audio: "ext:极略:2",
      intro: {
        content: "mark",
      },
      trigger: {
        player: "damageBegin3",
        global: "phaseAfter"
      },
      filter(event, player, name) {
        if (name != "phaseAfter") return event.num > 0;
        return player.countMark("jlsg_chengfeng") > 1;
      },
      forced: true,
      async content(event, trigger, player) {
        if (event.triggername != "phaseAfter") {
          const suit = await player.judge("jlsg_chengfeng").forResult("suit");
          if (suit != "spade") trigger.num--;
          else player.addMark("jlsg_chengfeng", 1);
        }
        else {
          player.removeMark("jlsg_chengfeng", 2);
          player.insertPhase("jlsg_chengfeng");
        }
      },
      ai: {
        maixie: true,
        "maixie_hp": true,
        effect: {
          target(card, player, target) {
            if (get.tag(card, "damage")) {
              if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
              if (!target.hasFriend()) return;
              let num = 1;
              if (get.attitude(player, target) > 0) {
                if (player.needsToDiscard()) num = 0.7;
                else num = 0.5;
              }
              if (target.hp >= 4) return [1, num * 2];
              if (target.hp == 3) return [1, num * 1.5];
              if (target.hp == 2) return [1, num * 0.5];
            }
          },
        },
      },
    },
  },
  //SK孙登
  jlsgsk_sundeng: {
    jlsg_kuangbi: {
      audio: "ext:极略:2",
      trigger: { global: 'useCard2' },
      filter: function (event, player) {
        if (player.hasSkill("jlsg_kuangbi_used")) return false;
        var type = get.type(event.card);
        if (!['basic', 'trick'].includes(type)) return false;
        var info = get.info(event.card);
        if (info.allowMultiple == false || info.notarget) return false;
        if (info.filterAddedTarget) return false;
        return true;
      },
      async cost(event, trigger, player) {
        event.result = await player.chooseBool(`匡弼：是否取消${get.translation(trigger.card)}的所有目标并重新指定任意目标？`)
          .set("ai", () => true)
          .forResult();
      },
      async content(event, trigger, player) {
        player.addTempSkill("jlsg_kuangbi_used");
        trigger.targets = [];
        game.log(player, `取消了${get.translation(trigger.card)}的所有目标`);
        const { result } = await player.chooseTarget(true, `请选择${get.translation(trigger.card)}的目标`)
          .set("selectTarget", [0, game.countPlayer()])
          .set("ai", target => {
            const player = get.player();
            return get.effect(target, trigger.card, trigger.player, player) > 0;
          });
        if (!result.bool || !result.targets.length) return;
        else {
          result.targets.sortBySeat(trigger.player)
          player.line(result.targets);
          trigger.targets = result.targets;
          game.log(result.targets, "成为了", trigger.card, "的新目标");
        }
      },
      subSkill: {
        used: {
          charlotte: true,
          sub: true,
        },
      },
      ai: {
        threaten: 4,
      },
    },
    translate: {
      jlsg_kuangbi_info: "每回合限一次，当一名角色使用基本牌或普通锦囊牌时，你可以取消所有目标；然后你可以选择任意名角色，令这些角色成为此牌的目标（无距离限制）。",
    },
    delete: ["jlsg_kuangbi2"],
  },
  //SK万年公主
  jlsgsk_wanniangongzhu: {
    jlsg_zhenge: {
      audio: "ext:极略:2",
      init(player) {
        player.addInvisibleSkill("jlsg_zhenge_use");
        game.addGlobalSkill("jlsg_zhenge_mod", player);
      },
      trigger: { player: "useCardAfter" },
      filter(event, player) {
        const bool = player.hasHistory("lose", evt => {
          if (evt.getParent() != event) return false;
          for (let i in evt.gaintag_map) {
            if (evt.gaintag_map[i].includes("jlsg_zhenge")) return true;
          }
          return false;
        });
        return !bool;
      },
      unique: true,
      forced: true,
      async content(event, trigger, player) {
        const cards = get.bottomCards(1);
        await player.gain(cards, "draw").set("gaintag", ["jlsg_zhenge"]);
        game.log(player, "获得了牌堆底的一张牌");
      },
      get effect() {
        const negative = {
          "横置": async function (event, trigger, player) { await player.link() },
          "翻面": async function (event, trigger, player) { await player.turnOver() },
          "随机弃置1-5张牌": async function (event, trigger, player) {
            let num = Math.min(event.num, player.countDiscardableCards(player, "he"));
            await player.discard(player.getDiscardableCards(player, "he").randomGets(num));
          },
          "随机受到1-3点伤害": async function (event, trigger, player) {
            await player.damage(event.num, event.source);
          },
          "随机受到1-3点雷电伤害": async function (event, trigger, player) {
            await player.damage(event.num, "thunder", event.source);
          },
          "随机受到1-3点火焰伤害": async function (event, trigger, player) {
            await player.damage(event.num, "fire", event.source);
          },
          "随机失去1-3点体力": async function (event, trigger, player) {
            await player.loseHp(event.num);
          },
          "随机减1-3点体力上限": async function (event, trigger, player) {
            await player.loseMaxHp(event.num);
          },
          "随机失去1个技能": async function (event, trigger, player) {
            let skills = player.getSkills(null, false, false);
            if (skills.length) {
              let skill = skills.randomGet();
              await player.removeSkills(skill);
            }
          },
        };
        const positive = {
          "随机摸1-5张牌": async function (event, trigger, player) { await player.draw(event.num) },
          "从牌堆或弃牌堆随机获得1-2张装备牌，1-2张基本牌，1-2张锦囊牌": async function (event, trigger, player) {
            let type = ["basic", "trick", "equip"],
              num = Math.floor(Math.random() * 2 + 1),
              cardPile = Array.from(ui.cardPile.childNodes).concat(Array.from(ui.discardPile.childNodes)),
              cards = [];
            while (type.length) {
              let type2 = type.randomRemove();
              cards = cardPile
                .filter(c => get.type2(c) == type2)
                .randomGets(num);
              if (cards.length) break;
              else cards = [];
            };
            if (cards.length) type = get.translation(get.type2(cards[0]));
            else type = get.translation(type[0]);
            game.log(player, `随机到的正面效果为<span style='color:#e83535'>从牌堆或弃牌堆获得${get.cnNumber(num)}张${type}牌</span>`);
            if (cards.length) await player.gain(cards, "draw");
            else game.log("但是牌堆中没有这种牌");
          },
          "随机回复1-3点体力": async function (event, trigger, player) {
            await player.recover(event.num, event.source);
          },
          "随机加1-3点体力上限": async function (event, trigger, player) {
            await player.gainMaxHp(event.num);
          },
          "使用杀的次数上限+1": async function (event, trigger, player) {
            if (!player.hasSkill("jlsg_zhenge_effect")) await player.addSkill("jlsg_zhenge_effect");
            player.storage.jlsg_zhenge_effect.sha++;
            player.markSkill("jlsg_zhenge_effect");
          },
          "摸牌数+1": async function (event, trigger, player) {
            if (!player.hasSkill("jlsg_zhenge_effect")) await player.addSkill("jlsg_zhenge_effect");
            player.storage.jlsg_zhenge_effect.draw++;
            player.markSkill("jlsg_zhenge_effect");
          },
          "手牌上限+1": async function (event, trigger, player) {
            if (!player.hasSkill("jlsg_zhenge_effect")) await player.addSkill("jlsg_zhenge_effect");
            player.storage.jlsg_zhenge_effect.maxHandCards++;
            player.markSkill("jlsg_zhenge_effect");
          },
          "随机获得1个技能": async function (event, trigger, player) {
            let skill = lib.skill.jlsg_zhenge.skillsList.filter(i => !player.hasSkill(i)).randomGet();
            await player.addSkills([skill]);
          },
        };
        delete this.effect
        this.effect = { positive, negative };
        return { positive, negative };
      },
      get skillsList() {
        let characters = Object.entries(lib.skill.jlsg_xinghan.getCharacters).map(i => i[1]).flat();
        let list = [];
        for (let name of characters) {
          list.addArray(get.gainableSkillsName(name));
        };
        delete this.skillsList;
        this.skillsList = list;
        return list;
      },
      subSkill: {
        mod: {
          charlotte: true,
          mod: {
            aiOrder: function (player, card, num) {
              let cards = player.getCards("h", (card) => card.hasGaintag('jlsg_zhenge'));
              if (cards.includes(card)) return num - 5;
            },
            aiValue: function (player, card, num) {
              let cards = player.getCards("h", (card) => card.hasGaintag('jlsg_zhenge'));
              if (cards.includes(card)) return num + 5;
            },
            aiUseful: function (player, card, num) {
              let cards = player.getCards("h", (card) => card.hasGaintag('jlsg_zhenge'));
              if (cards.includes(card)) return num + 1;
            },
            ignoredHandcard: function (card, player) {
              if (card.hasGaintag("jlsg_zhenge")) return true;
            },
            cardDiscardable: function (card, player, name) {
              if (name == "phaseDiscard" && card.hasGaintag("jlsg_zhenge")) return false;
            },
            cardUsable: function (card, player, num) {
              if (!card.cards) return;
              if (card.cards.some(i => i.hasGaintag("jlsg_zhenge"))) return Infinity;
            },
          },
        },
        use: {
          audio: "ext:极略:2",
          trigger: { player: "useCardToTargeted" },
          filter(event, player, name, target) {
            if (!event.target) return false;
            if (!["red", "black"].includes(get.color(event.card, player))) return false;
            return player.hasHistory("lose", evt => {
              if (evt.getParent() != event.getParent()) return false;
              for (let i in evt.gaintag_map) {
                if (evt.gaintag_map[i].includes("jlsg_zhenge")) return true;
              }
              return false;
            });
          },
          async cost(event, trigger, player) {
            const target = trigger.target, color = get.color(trigger.card, player);
            let str = `枕戈：是否令${get.translation(target)}随机受到一种`
            if (color == "red") str += "正";
            else str += "负";
            str += "面效果？"
            const { result } = await player.chooseBool(str)
              .set("color", get.color(trigger.card, player))
              .set("target", target)
              .set("ai", (event, player) => {
                const target = get.event("target"),
                  color = get.event("color", player)
                if (get.attitude(player, target) > 1) return color == "red";
                else return color == "black";
              });
            event.result = {
              bool: result.bool,
              targets: [target],
              cost_data: { color },
            };
          },
          async content(event, trigger, player) {
            const { color } = event.cost_data,
              target = event.targets[0];
            const next = game.createEvent("jlsg_zhenge_effect", false);
            next.player = target;
            next.source = player;
            let effect = Object.keys(lib.skill.jlsg_zhenge.effect[color == "red" ? "positive" : "negative"]).filter(i => {
              if (i == "随机回复1-3点体力") return get.recoverEffect(target, player, target) > 0;
              else if (i == "随机失去1个技能") return target.getSkills(null, false, false).length;
              return true;
            }).randomGet();
            if (effect != "从牌堆或弃牌堆随机获得1-2张装备牌，1-2张基本牌，1-2张锦囊牌") {
              let str = effect.slice();
              if (str.indexOf("1-") > -1) {
                let num1 = str.indexOf("1-");
                let str2 = str[num1 + 2];
                let num = Math.floor(Math.random() * Number(str2) + 1);
                next.num = num;
                str = str.slice(2).replace(`1-${str2}`, get.cnNumber(num));
              }
              else if (str.indexOf("1") > -1 && str.indexOf("+1") == -1) str = str.replace(`1`, "一");
              game.log(target, `随机到的${color == "red" ? "正" : "负"}面效果为<span style='color:#e83535'>${str}</span>`);
            }
            next.setContent(lib.skill.jlsg_zhenge.effect[color == "red" ? "positive" : "negative"][effect]);
            await next;
          },
        },
        effect: {
          init(player) {
            if (!player.storage.jlsg_zhenge_effect) player.storage.jlsg_zhenge_effect = {
              draw: 0,
              maxHandCards: 0,
              sha: 0,
            }
          },
          mod: {
            cardUsable(card, player, num) {
              if (!player.storage.jlsg_zhenge_effect) return;
              var add = player.storage.jlsg_zhenge_effect.sha;
              if (card.name == "sha") return num + add;
            },
            maxHandcard: function (player, num) {
              if (!player.storage.jlsg_zhenge_effect) return;
              var add = player.storage.jlsg_zhenge_effect.maxHandCards;
              return num + add;
            },
          },
          onremove: true,
          mark: true,
          marktext: '戈',
          intro: {
            mark(dialog, num, player) {
              let list = Object.entries(player.storage.jlsg_zhenge_effect).filter(i => i[1] > 0);
              if (list.length) {
                for (let i of list) {
                  if (i[0] == "draw") dialog.addText(`摸牌阶段摸牌数+${i[1]}`);
                  else if (i[0] == "maxHandCards") dialog.addText(`手牌上限+${i[1]}`);
                  else if (i[0] == "sha") dialog.addText(`出杀次数+${i[1]}`);
                }
              }
              else return ``;
            },
          },
          charlotte: true,
          forced: true,
          popup: false,
          trigger: { player: "phaseDrawBegin1" },
          filter(event, player) {
            if (event.fixed) return false;
            return player.storage && player.storage.jlsg_zhenge_effect.draw;
          },
          content() {
            trigger.num += player.storage.jlsg_zhenge_effect.draw;
          }
        },
      },
      ai: {//@.修改
        effect: {
          player_use: function (card, player, target) {
            let cards = player.getCards("h", (card) => card.hasGaintag('jlsg_zhenge'));
            if (!cards.includes(card)) return [1, 1];
            if (get.color(card) == 'black' && cards.includes(card)) return [1, 0, 1, -1];
            if (get.color(card) == 'red' && cards.includes(card)) return [1, 0, 1, 1];
          },
        }
      },
    },
    jlsg_xinghan: {
      marktext: "汉",
      intro: {
        noucount: true,
        mark(dialog, content, player) {
          var content = Object.entries(player.storage.jlsg_xinghan).slice(1);
          if (content && content.length) {
            if (player == game.me || player.isUnderControl()) {
              dialog.addText("已招募武将：");
              dialog.add([content, lib.skill.jlsg_xinghan.characterInfo]);
            } else {
              return "共有" + get.cnNumber(content.length) + "名招募武将";
            }
          }
        },
      },
      audio: "ext:极略:2",
      unique: true,
      priority: 1,
      get getCharacters() {//角色列表
        if (!_status.characterlist) lib.skill.pingjian.initList();
        let list = {};
        for (const pack in lib.characterPack) {
          if (![
            //"standard", "refresh", "shiji", "shenhua", "mobile",
            "jlsg_sk", "jlsg_skpf", "jlsg_sr", "jlsg_soul", "jlsg_sy", "jlAddition",
          ].includes(pack)) continue;
          for (const name in lib.characterPack[pack]) {
            if (name.startsWith("jlsgsy_") && !name.endsWith("baonu")) continue;
            if (_status.characterlist.includes(name) || name.startsWith("jlsgsy_")) {
              if (lib.translate[name] && get.character(name)) {
                if (get.character(name, 1)) {
                  const group = get.character(name, 1);
                  if (!list[group]) list[group] = [];
                  list[group].add(name);
                }
              }
            }
          };
        };
        delete this.getCharacters;
        this.getCharacters = list;
        return list;
      },
      init(player) {
        if (!get.nameList(player).includes("jlsgsk_wanniangongzhu")) {//防获取
          player.removeSkill("jlsg_xinghan");
          player.unmarkSkill("jlsg_xinghan");
          player.update();
          return;
        }
        if (!player.invisibleSkills.includes("jlsg_xinghan_turn")) {
          player.addInvisibleSkill("jlsg_xinghan_turn");
          let names = ["name1", "name2"], num = 0;
          for (let i in names) {//此处用于获取万年公主在双将的位置
            if (player[names[i]] == "jlsgsk_wanniangongzhu") {
              num = i;
              break;
            }
          };
          if (!player.storage.jlsg_xinghan_turn) player.storage.jlsg_xinghan_turn = {
            num: num,//主副将位置
            dead: [],//阵亡招募武将的势力
          };
          const name = player[`name${Number(player.storage.jlsg_xinghan_turn.num) + 1}`];
          let info = [player.hp, player.maxHp, player.hujia];
          if (player.isZhu2()) {//主公/地主加成
            let bool = false;
            if (Array.isArray(get.character(name))) bool = !get.character(name)[4] || (get.character(name)[4] && !get.character(name)[4].includes("noZhuHp"));
            else bool = !get.character(name).initFilters.includes("noZhuHp");
            if (bool) {
              info[0]++;
              info[1]++;
            }
          }
          if (!player.storage.jlsg_xinghan) player.storage.jlsg_xinghan = {}
          player.storage.jlsg_xinghan[name] = [null, info, get.character(name)[3]];
        }
      },
      onremove(player) {
        delete player.storage.jlsg_xinghan;
        if (player.invisibleSkills.includes("jlsg_xinghan_turn")) player.removeInvisibleSkill("jlsg_xinghan_turn");
      },
      trigger: {
        global: "gameDrawBegin",
        player: "phaseEnd",
      },
      filter(event, player, name) {
        let filterx = true;
        if (name == "phaseEnd") filterx = (!event.skill || event.skill != "jlsg_xinghan_turn");
        return filterx;
      },
      async cost(event, trigger, player) {
        const dead = player.storage.jlsg_xinghan_turn.dead;
        let group = ["wei", "shu", "wu", "qun", "shen", "jlsgsy"]
          .filter(i => {
            if (!lib.skill.jlsg_xinghan.getCharacters[i]) return false;
            return lib.skill.jlsg_xinghan.getCharacters[i].filter(j => {
              return !Object.keys(player.storage.jlsg_xinghan).includes(j);
            }).length;
          })
          .filter(i => !dead.includes(i));
        if (!group.length) return;
        var storageGroups = Object.entries(player.storage.jlsg_xinghan).map(i => i[1][0]);
        if (Object.keys(player.storage.jlsg_xinghan).length == 4) {
          group = group.filter(i => storageGroups.includes(i));
        }
        const { result } = await player.chooseControl(group, "cancel2")
          .set("prompt", "兴汉：请选择一个势力")
          .set("ai", function () {
            if (!storageGroups.includes('shen') && group.includes('shen')) return 'shen';
            return group.randomGet();
          });
        if (result.control != "cancel2") {
          event.result = {
            bool: true,
            cost_data: result.control,
          }
        }
        else event.result = { bool: false };
      },
      async content(event, trigger, player) {
        const gro = event.cost_data,
          storage = Object.entries(player.storage.jlsg_xinghan).map(i => [i[0], i[1][0], i[1][1][0]]),
          list = lib.skill.jlsg_xinghan.getCharacters[gro]
            .filter(i => !storage.map(i => i[0]).includes(i))
            .randomGets(3);
        if (!list.length) return;
        let str = "";
        if (storage.length > 1) {
          str = "<br>已招募武将：";
          const org = Object.keys(player.storage.jlsg_xinghan)[0];
          for (let i in player.storage.jlsg_xinghan) {
            if (i == org) continue;
            let info = player.storage.jlsg_xinghan[i][1];
            let str2 = `(${info[0]}/${info[1]}${info[3] ? `/${info[3]}` : ""})，`;
            str += get.translation(i) + str2;
          };
        }
        let { result } = await player.chooseButton(true, ["兴汉：请选择一名武将加入我方阵营" + str, [list, "character"]])
          .set('ai', function (button) {
            return get.rank(button.link, true) - get.character(button.link)[2];
          });
        if (result.bool) {
          let info;
          const name = result.links[0];
          if (Array.isArray(get.character(name))) {//适配旧版本武将格式
            let [sex, group, hp, skills = []] = get.character(name);
            skills = skills.filter(i => {
              const info = get.info(i);
              if (!info) return false;
              return !info.zhuSkill || info.zhuSkill && player.isZhu2();
            });
            info = [group, [get.infoHp(hp), get.infoMaxHp(hp), get.infoHujia(hp)], skills];
          }
          else {
            let { hp, maxHp, hujia, group, skills = [] } = get.character(name);
            skills = skills.filter(i => {
              const info = get.info(i);
              if (!info) return false;
              return !info.zhuSkill || info.zhuSkill && player.isZhu2();
            });
            info = [group, [hp, maxHp, hujia], skills];//招募武将存储格式
          }
          let same = storage.find(i => i[1] == info[0]);
          if (same) {//替换部分
            let { result } = await player.chooseBool(`兴汉：是否将招募武将${get.translation(same[0])}替换为${get.translation(name)}？`)
              .set("ai", function () { //@.修改
                return (get.rank(name, true) - get.character(name)[2]) - (get.rank(same[0], true) - get.character(same[0])[2]);
              });
            if (!result.bool) return;
            else {
              if (lib.config.extension_极略测试_jlsgsk_wanniangongzhu === "jlsg") info[1][0] = same[2];
              let list = {};
              for (let i in player.storage.jlsg_xinghan) {
                if (i == same[0]) list[name] = info;
                else list[i] = player.storage.jlsg_xinghan[i];
              };
              if (!player.storage.jlsg_xinghan[name]) {
                for (let i of player.storage.jlsg_xinghan[same[0]][2]) await player.removeSkill(i);
              }
              player.storage.jlsg_xinghan = list;
            }
          }
          if (!player.storage.jlsg_xinghan[name]) player.storage.jlsg_xinghan[name] = info;
          if (_status.characterlist) _status.characterlist.remove(name);
          if (event.triggername != "phaseEnd") await lib.skill.jlsg_xinghan.chooseCharacter(player);
          player.markSkill("jlsg_xinghan");
        }
      },
      reinitCharacters(player, to, insert = false) {//切换角色的content
        const rawPairs = [player.name1],
          num = Number(player.storage.jlsg_xinghan_turn.num),
          info = player.storage.jlsg_xinghan,
          master = Object.entries(player.storage.jlsg_xinghan).find(i => i[1][0] === null)[0];
        if (player.name2 && get.character(player.name2)) rawPairs.push(player.name2);
        let from = rawPairs[num];
        rawPairs[num] = to;
        if (from == to) return;
        const fromInfo = info[from],
          toInfo = info[to];
        let next,
          evt = _status.event.getParent("phase");
        if (insert && evt && evt.parent && evt.parent.next) {
          next = game.createEvent("jlsg_xinghan_change", false, evt.parent);
        } else {
          next = game.createEvent("jlsg_xinghan_change", false);
        }
        next.player = player;
        next.newPairs = rawPairs;
        next.info = {
          from: {
            name: from,
            hp: fromInfo[1][0],
            maxHp: fromInfo[1][1],
            hujia: fromInfo[1][2],
            skills: fromInfo[2],
          },
          to: {
            name: to,
            hp: toInfo[1][0],
            maxHp: toInfo[1][1],
            hujia: toInfo[1][2],
            skills: toInfo[2],
          },
        };
        next.setContent(async function (event, trigger, player) {
          const rawPairs = [player.name1];
          if (player.name2 && get.character(player.name2)) rawPairs.push(player.name2);
          event.rawPairs = rawPairs;
          const newPairs = event.newPairs;
          const removeSkills = event.info.from.skills,
            addSkills = event.info.to.skills;
          for (let i = 0; i < Math.min(2, rawPairs.length); i++) {
            let rawName = rawPairs[i],
              newName = newPairs[i];
            if (rawName != newName) {
              game.log(player, `将${i == 0 ? "主" : "副"}将从`, `#b${get.translation(rawName)}`, "变更为了", `#b${get.translation(newName)}`);
            }
          };
          player.reinit2(newPairs);
          event.addSkill = addSkills.slice(0).unique();
          event.removeSkill = removeSkills.slice(0).unique();
          if (event.addSkill.length) {
            player.addSkill(event.addSkill, null, null, true);
          }
          if (event.removeSkill.length) {
            for (let skill of event.removeSkill) {
              _status.event.clearStepCache();
              var info = lib.skill[skill];
              game.broadcastAll(
                function (player, skill) {
                  player.skills.remove(skill);
                  player.hiddenSkills.remove(skill);
                  player.invisibleSkills.remove(skill);
                  delete player.tempSkills[skill];
                  for (var i in player.additionalSkills) {
                    player.additionalSkills[i].remove(skill);
                  }
                },
                player,
                skill
              );
              player.checkConflict(skill);
              if (info) {
                player.removeSkillTrigger(skill);
                if (!info.keepSkill) {
                  player.removeAdditionalSkills(skill);
                }
              }
              player.enableSkill(skill + "_awake");
            };
          }
          player.storage.jlsg_xinghan[event.info.from.name][1][0] = player.hp;
          player.storage.jlsg_xinghan[event.info.from.name][1][1] = player.maxHp;
          player.storage.jlsg_xinghan[event.info.from.name][1][2] = player.hujia;
          player.hp = event.info.to.hp;
          player.maxHp = event.info.to.maxHp;
          player.hujia = event.info.to.hujia;
          player.markSkill("jlsg_xinghan");
          if (to == master) player.unmarkSkill("jlsg_xinghan_turn");
          else player.markSkill("jlsg_xinghan_turn");
          player.update();
        });
        return next;
      },
      chooseCharacter(player, insert = false) {//选择登场角色
        const character = Object.entries(player.storage.jlsg_xinghan),
          org = Object.keys(player.storage.jlsg_xinghan)[0];
        const next = game.createEvent("jlsg_xinghan_choose", false);
        next.player = player;
        next.setContent(async function (event, trigger, player) {
          const { result } = await player.chooseButton(true, ["兴汉：请选择要上场的武将", [character, lib.skill.jlsg_xinghan.characterInfo]])
            .set('ai', function (button) {
              if (get.event().getParent("phaseAfter") && button.link[0] == org) return -114514;
              else return get.rank(button.link[0], true)
            });
          if (result.bool) {
            const name = result.links[0][0];
            lib.skill.jlsg_xinghan.reinitCharacters(player, name, insert);
          }
        });
        return next;
      },
      characterInfo: function (item, type, position, noclick, node) {//此处为信息显示部分，待优化
        const _item = item;
        item = _item[0];
        if (node) {
          node.classList.add("button");
          node.classList.add("character");
          node.style.display = "";
        } else { node = ui.create.div(".button.character", position) }
        node._link = item;
        node.link = item;
        var double = get.is.double(node._link, true);
        if (double) node._changeGroup = true;
        var func = function (node, item) {
          node.setBackground(item, "character");
          if (node.node) {
            node.node.name.remove();
            node.node.hp.remove();
            node.node.group.remove();
            node.node.intro.remove();
            if (node.node.replaceButton) node.node.replaceButton.remove();
          }
          node.node = {
            name: ui.create.div(".name", node),
            hp: ui.create.div(".hp", node),
            group: ui.create.div(".identity", node),
            intro: ui.create.div(".intro", node),
          };
          var infoitem = get.character(item),
            info = _item[1][1];
          node.node.name.innerHTML = get.slimName(item);
          var hp = info[0],
            maxHp = info[1],
            hujia = info[2];
          if (
            lib.config.buttoncharacter_style == "default" ||
            lib.config.buttoncharacter_style == "simple"
          ) {
            if (lib.config.buttoncharacter_style == "simple") node.node.group.style.display = "none";
            node.classList.add("newstyle");
            node.node.name.dataset.nature = get.groupnature(get.bordergroup(infoitem));
            node.node.group.dataset.nature = get.groupnature(get.bordergroup(infoitem), "raw");
            ui.create.div(node.node.hp);
            var str = get.numStr(hp);
            if (hp !== maxHp) {
              str += "/";
              str += get.numStr(maxHp);
            }
            var textnode = ui.create.div(".text", str, node.node.hp);
            if (info[0] == 0) node.node.hp.hide()
            else if (get.infoHp(info[0]) <= 3) node.node.hp.dataset.condition = "mid";
            else node.node.hp.dataset.condition = "high";
            if (hujia > 0) {
              ui.create.div(node.node.hp, ".shield");
              ui.create.div(".text", get.numStr(hujia), node.node.hp);
            }
          } else {
            if (maxHp > 14) {
              if (hp !== maxHp || shield > 0)
                node.node.hp.innerHTML = info[0];
              else node.node.hp.innerHTML = get.numStr(info[0]);
              node.node.hp.classList.add("text");
            } else {
              for (var i = 0; i < maxHp; i++) {
                var next = ui.create.div("", node.node.hp);
                if (i >= hp) next.classList.add("exclude");
              }
              for (var i = 0; i < shield; i++) ui.create.div(node.node.hp, ".shield");
            }
          }
          if (node.node.hp.childNodes.length == 0) node.node.name.style.top = "8px";
          if (node.node.name.querySelectorAll("br").length >= 4) {
            node.node.name.classList.add("long");
            if (lib.config.buttoncharacter_style == "old") {
              node.addEventListener("mouseenter", ui.click.buttonnameenter);
              node.addEventListener("mouseleave", ui.click.buttonnameleave);
            }
          }
          node.node.intro.innerHTML = lib.config.intro;
          if (!noclick) lib.setIntro(node)
          if (infoitem[1]) {
            if (double) {
              node.node.group.innerHTML = double.reduce(
                (previousValue, currentValue) =>
                  `${previousValue}<div data-nature="${get.groupnature(currentValue)}">${get.translation(currentValue)}</div>`,
                ""
              );
              if (double.length > 4) {
                if (new Set([5, 6, 9]).has(double.length)) node.node.group.style.height = "48px";
                else node.node.group.style.height = "64px";
              }
            } else node.node.group.innerHTML = `<div>${get.translation(infoitem[1])}</div>`;
            node.node.group.style.backgroundColor = get.translation(`${get.bordergroup(infoitem)}Color`);
          } else node.node.group.style.display = "none";
        };
        node.refresh = func;
        node.refresh(node, item);
        node.link = _item;
        node._customintro = uiintro => {
          let skills = _item[1][2];
          for (let skill of skills) {
            uiintro.add(
              '<div style="width:calc(100% - 10px);display:inline-block"><div class="skill">【' +
              get.skillTranslation(skill, get.player()) +
              "】</div><div>" +
              get.skillInfoTranslation(skill, get.player()) +
              "</div></div>",
            );
          };
        };
        return node;
      },
    },
    jlsg_xinghan_turn: {//切换角色
      priority: -114514,
      trigger: { player: ["phaseBefore", "phaseAfter", "dieBefore", "changeSkillsEnd", "changeCharacterAfter"] },
      unique: true,
      locked: true,
      charlotte: true,
      lastDo: true,
      popup: false,
      marktext: "募",
      intro: {
        name: "兴汉",
        content(storage, player) {
          const master = Object.entries(player.storage.jlsg_xinghan).find(i => i[1][0] === null)[0];
          return `此为${get.translation(master)}招募的武将`;
        },
      },
      async cost(event, trigger, player) {
        if (_status.over == true ||
          !player.storage.jlsg_xinghan
          || Object.keys(player.storage.jlsg_xinghan).length < 2
          || !String(player.storage.jlsg_xinghan_turn.num)
        ) return;
        const nameList = Object.keys(player.storage.jlsg_xinghan);
        const name = player[`name${Number(player.storage.jlsg_xinghan_turn.num) + 1}`],
          org = Object.keys(player.storage.jlsg_xinghan)[0];
        let max = nameList.length - 1,
          num = nameList.indexOf(name),
          bool = false;
        if (event.triggername == "dieBefore") bool = name != org;
        else if (event.triggername == "phaseBefore") {
          let bool2 = true;
          if (player.isTurnedOver()) bool2 = trigger._noTurnOver;
          bool = name != org && !trigger.skill && bool2;
        }
        else if (event.triggername == "changeSkillsEnd") {
          bool = (trigger.removeSkill && trigger.removeSkill.some(i => {
            let skills = player.storage.jlsg_xinghan[nameList[num]][2];
            return skills.includes(i);
          }) || lib.config.extension_极略测试_jlsgsk_wanniangongzhu === "jlsg" && trigger.addSkill?.length);
        }
        else if (event.triggername == "changeCharacterAfter") bool = true;
        else bool = max >= num && (trigger.skill == "jlsg_xinghan_turn" || num == 0 && !trigger.skill);
        event.result = {
          bool: bool,
          skill_popup: false,
          cost_data: {
            num: num,
            max: max,
          },
        };
      },
      async content(event, trigger, player) {
        const { num, max } = event.cost_data,
          nameList = Object.keys(player.storage.jlsg_xinghan),
          org = Object.keys(player.storage.jlsg_xinghan)[0];
        if (["phaseBefore", "dieBefore"].includes(event.triggername)) {
          if (player[`name${Number(player.storage.jlsg_xinghan_turn.num) + 1}`] != org) {
            await lib.skill.jlsg_xinghan.reinitCharacters(player, org);
            if ("dieBefore" == event.triggername) {
              if (player.storage.jlsg_xinghan[nameList[num]]) {
                trigger.cancel();
                let info = player.storage.jlsg_xinghan[nameList[num]];
                for (let i of info[2]) await player.removeSkill(i);
                player.storage.jlsg_xinghan_turn.dead.add(info[0]);
                if (_status.characterlist) _status.characterlist.add(nameList[num]);
                delete player.storage.jlsg_xinghan[nameList[num]];
              }
            }
          }
        }
        else if (event.triggername == "changeSkillsEnd") {
          let skills = player.storage.jlsg_xinghan[nameList[num]][2];
          if (trigger.removeSkill) {
            for (let i of trigger.removeSkill) {
              if (skills.includes(i)) player.storage.jlsg_xinghan[nameList[num]][2].remove(i);
            };
          }
          if (trigger.addSkill && lib.config.extension_极略测试_jlsgsk_wanniangongzhu === "jlsg") {
            for (let i of trigger.addSkill) {
              if (!skills.includes(i)) player.storage.jlsg_xinghan[nameList[num]][2].add(i);
            };
          }
        }
        else if (event.triggername == "changeCharacterAfter") {
          player.storage.jlsg_xinghan[nameList[num]] = player[`name${Number(player.storage.jlsg_xinghan_turn.num) + 1}`];
        }
        else {
          if (num < max) {
            const name = nameList[num + 1];
            lib.skill.jlsg_xinghan.reinitCharacters(player, name, true);
            player.insertPhase("jlsg_xinghan_turn").set("_noTurnOver", true);
            player.phaseNumber--;
          }
          else {
            await lib.skill.jlsg_xinghan.chooseCharacter(player, true);
          }
        }
      },
    },
    translate: {
      jlsg_xinghan_turn: "invisible",
    },
    delete: ["jlsg_xinghan_recruit"],
  },
  //SK文鸯
  jlsgsk_wenyang: {
    jlsg_jueyong: {
      intro: {
        nocount: true,
        content: "limited",
      },
      audio: "ext:极略:2",
      skillAnimation: true,
      limited: true,
      trigger: { source: 'damageSource' },
      filter(event, player) {
        if (!event.card || event.card.name != "sha") return false;
        return player.countCards("h") > player.maxHp;
      },
      async cost(event, trigger, player) {
        event.result = await player.chooseBool(`###绝勇：是否将体力上限调整至${player.countCards("h")}？###然后将体力回复至体力上限。`)
          .set("ai", (event, player) => {
            return player.countCards("h") - player.maxHp > 1;
          })
          .forResult();
      },
      async content(event, trigger, player) {
        player.awakenSkill("jlsg_jueyong");
        player.maxHp = player.countCards("h");
        player.update();
        await player.recoverTo(player.maxHp);
        await game.delayx();
      },
    },
    jlsg_choujue: {
      audio: "ext:极略:2",
      locked: false,
      usable: 1,
      viewAs: {
        name: 'sha',
        isCard: true,
        storage: {
          jlsg_choujue: true,
        },
      },
      enable: 'phaseUse',
      filterCard: function () { return false },
      selectCard: -1,
      precontent() {
        player.loseMaxHp(1);
        player.draw();
        event.getParent().addCount = false;
      },
      mod: {
        cardUsable: function (card) {
          if (_status.event.skill == "jlsg_choujue") return Infinity;
          if (card.storage && card.storage.jlsg_choujue) return Infinity;
        },
      },
      group: 'jlsg_choujue2',
      ai: {
        order: 2.9,
        result: {
          player: -1,
        },
      },
    },
    jlsg_choujue2: {
      silent: true,
      locked: false,
      forced: true,
      trigger: { source: 'damageBegin2' },
      filter(event, player) {
        return event.card && event.card.storage && event.card.storage.jlsg_choujue;
      },
      content() {
        for (let skill of player.skills) {
          let translation = get.skillInfoTranslation(skill, event.player);
          if (!translation) continue;
          let match = translation.match(/“?出牌阶段限一次/g);
          if (!match || match.every(value => value != "出牌阶段限一次")) continue;
          let ss = game.expandSkills([skill]);
          for (let s of ss) {
            let uses = player.getStat('skill');
            if (uses[s]) uses[s] = 0;
            if (player.storage.counttrigger && player.storage.counttrigger[s]) {
              player.storage.counttrigger[s] = 0;
            }
          };
        };
      },
    },
    translate: {
      jlsg_jueyong_info: '限定技，当你使用【杀】对目标角色造成伤害后，若你的手牌数大于体力上限，你可以将体力上限调整至与你的手牌数相同，然后回复体力至体力上限。',
      jlsg_choujue_info: '出牌阶段限一次,你可以减一1点体力上限并摸一张牌，然后视为使用【杀】（无次数限制）,当你以此法造成伤害时,令你所有出牌阶段限一次的技能视为未发动过。',
    },
  },
  //SK赵嫣
  jlsgsk_zhaoyan: {
    jlsg_sanjue: {
      init(player, skill) {
        player.storage[skill] = {
          card: {},
          skill: {},
          given: [],
        };
      },
      intro: {
        nocount: true,
        mark(dialog, content, player) {
          var storage = Object.entries(player.storage.jlsg_sanjue.skill);
          if (storage && storage.length) {
            if (player == game.me || player.isUnderControl()) {
              dialog.addText(`储备技能数：${storage.map(i => i[1]).flat().length}`);
              dialog.add([storage, lib.skill.jlsg_sanjue.skillInfo]);
            } else {
              return "共有" + get.cnNumber(storage.length) + "个储备技能";
            }
          }
        },
      },
      audio: "ext:极略:3",
      enable: "phaseUse",
      direct: true,
      onChooseToUse(event) {
        if (game.online) return;
        let buttons = [], storage = Object.entries(event.player.storage.jlsg_sanjue.skill);
        if (!storage || !storage.length) return;
        for (let info of storage) {
          if (!info[1].length) continue;
          for (let skill of info[1]) {
            buttons.push([info[0], skill]);
          };
        };
        event.set("jlsg_sanjue", buttons);
      },
      filter: (event, player) => {
        if (Object.entries(event.player.storage?.jlsg_sanjue?.skill ?? {}).length) return true;
        return event.jlsg_sanjue?.length ?? false;
      },
      chooseButton: {
        dialog(event, player) {
          let dialog = ui.create.dialog("三绝：请选择要给予的技能");
          dialog.add([event.jlsg_sanjue, lib.skill.jlsg_sanjue.skillInfo]);
          return dialog;
        },
        check() {
          return true;
        },
        backup(links, player) {
          return {
            audio: "jlsg_sanjue",
            info: links[0],
            filterTarget: () => true,
            selectCard: -1,
            filterCard: () => false,
            async content(event, trigger, player) {
              const target = event.targets[0],
                info = lib.skill.jlsg_sanjue_backup.info,
                storage = player.storage.jlsg_sanjue.skill;
              for (let i in storage) {
                if (i == info[0]) player.storage.jlsg_sanjue.skill[i].remove(info[1]);
                if (!player.storage.jlsg_sanjue.skill[i].length) delete player.storage.jlsg_sanjue.skill[i];
              };
              player.storage.jlsg_sanjue.given.add(info[1]);
              await target.addSkills(info[1]);
            },
            ai2(target, targets) {
              const player = get.player(),
                skill = lib.skill.jlsg_sanjue_backup.info[1];
              const info = get.info(skill);
              let negative = info && info.ai && info.ai.neg,
                att = get.attitude(player, target);
              if (att < 0 && negative) return -1;
              else if (att > 0 && !negative) {
                if (info.ai?.combo ?? false) {
                  if (target.hasSkill(info.ai.combo)) return get.skillRank(skill);
                  return 0;
                }
                return get.skillRank(skill) * Math.random();
              };
              return 0;
            },
          };
        },
        prompt(links, player) {
          return `令一名角色获得【${get.translation(links[0][1])}】
          <br><div class="text">${get.skillInfoTranslation(links[0][1], player)}</div>`;
        },
      },
      getCharacters: function () {
        let result = [];
        if (_status.characterlist) result = _status.characterlist;
        else if (_status.connectMode) result = get.charactersOL(() => true);
        else result = get.gainableCharacters(true);
        return result;
      },
      skillInfo: function (item, type, position, noclick, node) {
        const _item = item;
        item = _item[1];
        if (lib.config.extension_十周年UI_enable) {
          node = ui.create.buttonPresets.character(_item[0], type, position, noclick, node);
          node.node.hp.remove();
          node.node.group.remove();
          node.node.intro.remove();
        } else {
          node = ui.create.card(position, "noclick", noclick);
          node.classList.add("button");
          var bg = _item[0];
          var img = get.dynamicVariable(
            function (mass) {
              if (!mass) return null;
              if (Array.isArray(mass)) {
                let list = mass[4];
                if (!list) return null;
                for (let i of list) {
                  if (typeof i == "string") {
                    if (i.endsWith(".jpg") || i.endsWith(".png")) return i;
                  }
                };
              }
              else {
                let list = mass.trashBin;
                for (let i of list) {
                  if (typeof i == "string") {
                    if (i.endsWith(".jpg") || i.endsWith(".png")) return i;
                  }
                };
              }
            },
            get.character(_item[0])
          );
          if (img) {
            if (img.startsWith("db:")) {
              img = img.slice(3);
            } else if (!img.startsWith("ext:")) {
              img = null;
            }
          }
          node.classList.remove("fullskin");
          node.classList.remove("fullborder");
          node.dataset.cardName = _item[0];
          node.classList.add("fullimage");
          if (img) {
            if (img.startsWith("ext:")) {
              node.setBackgroundImage(img.replace(/^ext:/, "extension/"));
              node.style.backgroundSize = "cover";
            } else node.setBackgroundDB(img);
          } else node.setBackground(bg, "character");
        }
        if (Array.isArray(item)) {
          name = `<span data-nature=${get.groupnature(get.bordergroup(_item[0]))}>${get.slimName(_item[0])}</span>`;
          node.node.info.innerHTML = ""
          for (let i of item) {
            node.node.info.innerHTML += `<span style='font-weight:500;color:#ffffff' data-nature='watermm'>${get.skillTranslation(i, get.player())}</span><br>`;
          };
        }
        else name = `<span style='font-weight:500;color:#ffffff' data-nature='watermm'>${get.translation(item)}</span>`;
        node.node.name.innerHTML = name;
        if (name.length >= 5) {
          node.node.name.classList.add("long");
          if (name.length >= 7) {
            node.node.name.classList.add("longlong");
          }
        }
        node.link = _item;
        node._customintro = uiintro => {
          if (!Array.isArray(item)) item = [item];
          for (let i of item) {
            uiintro.add(
              '<div style="width:calc(100% - 10px);display:inline-block"><div class="skill">【' +
              get.skillTranslation(i, get.player()) +
              "】</div><div>" +
              get.skillInfoTranslation(i, get.player()) +
              "</div></div>",
            );
          }
        };
        return node;
      },
      group: "jlsg_sanjue_use",
      subSkill: {
        use: {
          audio: "jlsg_sanjue",
          trigger: { player: "useCard" },
          direct: true,
          content() {
            let s = player.storage.jlsg_sanjue.card[trigger.card.name];
            player.storage.jlsg_sanjue.card[trigger.card.name] = (s || 0) + 1;
            s = player.storage.jlsg_sanjue.card[trigger.card.name];
            if (s != 1 && s != 3) return;
            player.logSkill(event.name);
            player.draw();
            let list1 = lib.skill.jlsg_sanjue.getCharacters().filter(c => get.character(c) && get.character(c, 1) == 'wu').randomSort();
            const storage = Object.entries(player.storage.jlsg_sanjue.skill).map(i => i[1]).flat();
            for (let name of list1) {
              let skills = get.character(name)[3];
              if (!skills || !skills.length) continue;
              skills = skills.filter(s => {
                if (player.storage.jlsg_sanjue.given.includes(s)) return false;
                if (storage.includes(s)) return false;
                for (let c of game.filterPlayer()) {
                  if (c.hasSkill(s)) return false;
                };
                const info = get.info(s);
                if (!info) return false;
                return !info.charlotte;
              });
              if (!skills.length) continue;
              if (!player.storage.jlsg_sanjue.skill[name]) player.storage.jlsg_sanjue.skill[name] = [];
              player.storage.jlsg_sanjue.skill[name].add(skills.randomGet());
              break;
            };
            player.markSkill("jlsg_sanjue");
          },
        },
        backup: { sourceSkill: "jlsg_sanjue" },
      },
      ai: {
        order(skill, player) {
          const storage = Object.entries(player.storage.jlsg_sanjue.skill).map(i => i[1]).flat();
          if (!storage.length) return 0;
          else {
            for (let s in storage) {
              const info = get.info(s);
              if (!info || info && info.ai && info.ai.neg) {
                if (game.hasPlayer(c => get.attitude(player, c) < 0)) return 12;
              }
              else return 12;
            }
          }
          return 8;
        },
        result: {
          player: 1,
        }
      }
    },
    translate: {
      jlsg_sanjue_info: "锁定技,当你第一次或第三次使用同名牌时,你摸一张牌并随机将一个未上场的吴势力武将的一个技能加入技能库。出牌阶段,你可以令一名角色获得一个技能库中的技能。",
    },
    delete: ["jlsg_sanjue2"],
  },
  //SK吕玲绮
  jlsgsk_lvlingqi: {
    info: function () {
      lib.characterPack["jlsg_sk"].jlsgsk_lvlingqi.skills = ["jlsg_jiwux"];
      if (!_status.connectMode) lib.character.jlsgsk_lvlingqi.skills = ["jlsg_jiwux"];
    }
  },

  //SK神曹操
  jlsgsoul_caocao: {
    jlsg_guixin: {
      audio: "ext:极略:2",
      trigger: { player: "damageEnd" },
      filter(event) {
        return event.num > 0;
      },
      getIndex(event, player) {
        return event.num;
      },
      check(event, player) {
        if (player.isTurnedOver() || event.num > 1 || (game.countPlayer() - 1 < 5 && game.countPlayer(function (current) {
          return get.attitude(player, current) <= 0 && current.countGainableCards(player, 'hej') > 0;
        }) >= game.countPlayer(function (currentx) {
          return get.attitude(player, currentx) > 0 && currentx.countGainableCards(player, 'hej') > 0;
        }))) return true;
        let num = game.countPlayer(function (current) {
          if (current.countCards('he') && current != player && get.attitude(player, current) <= 0) return true;
          if (current.countCards('j') && current != player && get.attitude(player, current) > 0) return true;
        });
        return num >= 2;
      },
      logTarget(event, player) {
        return game.filterPlayer(current => current != player).sortBySeat(player);
      },
      async content(event, trigger, player) {
        const targets = event.targets;
        let num = 0;
        while (num < 4) {
          for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            let gainableCards = target.getGainableCards(player, "hej");
            if (gainableCards) await player.gain(gainableCards.randomGet(), target, 'giveAuto', 'bySelf');
          };
          let history = player.getHistory("gain", evt => evt.getParent() == event);
          num = history.reduce((t, evt) => t + evt.cards.length, 0);
          if (targets.every(i => !i.countGainableCards(player, "hej"))) break;
        };
        await player.turnOver();
      },
      ai: {
        maixie: true,
        "maixie_hp": true,
        threaten: function (player, target) {
          if (target.hp == 1) return 2.5;
          return 1;
        },
        effect: {
          target: function (card, player, target) {
            if (get.tag(card, 'damage')) {
              if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
              if (target.hp == 1) return 0.8;
              if (target.isTurnedOver()) return [0, 3];
              var num = game.countPlayer(function (current) {
                if (current.countCards('he') && current != player && get.attitude(player, current) <= 0) {
                  return true;
                }
                if (current.countCards('j') && current != player && get.attitude(player, current) > 0) {
                  return true;
                }
              });
              if (num > 2) return [0, 1];
              if (num == 2) return [0.5, 1];
            }
          },
        },
      },
    },
    jlsg_feiying: {
      mod: {
        cardUsable(card, player) {
          if (player.isDamaged()) return;
          const color = ["unsure", "black"].includes(get.color(card, player));
          if (color && card.name == 'sha') return Infinity;
        },
        targetInRange(card, player) {
          if (player.isDamaged()) return;
          const color = ["unsure", "black"].includes(get.color(card, player));
          if (color && card.name == 'sha') return true;
        },
        cardname(card, player) {
          if (player.isHealthy()) return;
          const color = get.color(card, player);
          if (["unsure", "red"].includes(color) && get.type(card, null, false) == "equip") return "tao";
        },
        aiOrder(player, card, num) {
          if (player.isDamaged() || !player.hasCard(card => {
            const color1 = get.color(card, player);
            return color1 == "red" && card.name == 'sha';
          }, "hs")) return;
          const color2 = get.color(card, player);
          if (color2 == "black" && card.name == 'sha') return num - 2;
        },
      },
      forced: true,
    },
    translate: {
      jlsg_guixin_info: "当你受到1点伤害后，你可以随机获得每名其他角色区域里的一张牌，若你以此法获得的总牌数少于4，重复此流程，然后你翻面。",
      jlsg_feiying_info: "锁定技，若你未受伤，你使用黑色【杀】无距离和次数限制限制；若你已受伤，你手牌中的红色装备牌视为【桃】",
    },
  },
  //SK神典韦
  jlsgsoul_dianwei: {
    jlsg_zhiji: {
      audio: "ext:极略:3",
      usable: 1,
      enable: "phaseUse",
      filter: function (event, player) {
        return player.countCards('he', { subtype: 'equip1' });
      },
      filterCard: function (card) {
        return get.subtype(card) == 'equip1';
      },
      position: "he",
      selectCard: [1, Infinity],
      filterTarget(card, player, target) {
        return target != player;
      },
      selectTarget: function () {
        var player = get.player();
        return [1, player.countCards('he', i => get.subtype(i) == 'equip1')];
      },
      filterOk: function () {
        return ui.selected.targets.length <= ui.selected.cards.length;
      },
      check: function (card) {
        return 9 - get.value(card);
      },
      prompt: `出牌阶段限一次，你可以弃置任意张武器牌，然后你对至多X名其他角色各造成X点伤害（X为你弃置的牌数）`,
      multiline: true,
      content: function () {
        target.damage(cards.length);
      },
      group: ["jlsg_zhiji_damage"],
      subSkill: {
        damage: {
          audio: "ext:极略:1",
          trigger: {
            player: ["damageEnd", "phaseZhunbeiBegin"],
          },
          filter: function (event, player) {
            if (event.name == 'damege') return true;
            else return player.isDamaged();
          },
          check: function (event, player) {
            return !player.hasSkillTag('nogain');
          },
          prompt: `掷戟：是否从从牌堆或弃牌堆中、场上的随机获得一张武器牌，然后你弃置一张非装备牌。`,
          content() {
            var bool, position = ['pile', 'target'];
            while (position.length) {
              var card, o = position.randomGet();
              if (o == 'pile') {
                card = get.cardPile(i => get.subtype(i) == 'equip1');
                if (card) {
                  player.gain(card, 'gain2');
                  bool = true;
                  break;
                }
              }
              else {
                var targets = game.filterPlayer(function (current) {
                  return current != player && current.getEquips(1).length > 0;
                });
                if (targets.length) {
                  var target = targets.randomGet();
                  player.gain(target.getEquips(1)[0], target, 'give', 'bySelf');
                  bool = true;
                  break;
                }
              }
              position.remove(o);
            };
            if (bool) {
              if (player.countDiscardableCards(player, 'h', i => get.type(i) != 'equip')) player.chooseToDiscard(true, 'h', function (card, player) {
                return get.type(card) != 'equip';
              });
            }
            else player.chat(`你们把武器藏哪了！`);
          },
          ai: {
            maixie: true,
            "maixie_hp": true,
            effect: {
              target(card, player, target) {
                var card1 = get.cardPile(i => get.subtype(i) == 'equip1');
                var card2 = game.filterPlayer(function (current) {
                  return current != target && current.getEquips(1).length > 0;
                });
                if (!card1 && !card2.length) return;
                if (get.tag(card, 'damage')) {
                  if (player.hasSkillTag('jueqing', false, target)) return [1, -1];
                  if (!target.hasFriend()) return;
                  let num = 0.5;
                  if (get.attitude(player, target) > 0) {
                    if (player.needsToDiscard()) num = 0.35;
                    else num = 0.25;
                  }
                  if (target.hp >= 4) return [1, num * 2];
                  if (target.hp == 3) return [1, num * 1.5];
                  if (target.hp == 2) return [1, num * 0.5];
                }
              },
            },
          },
          sub: true,
          sourceSkill: "jlsg_zhiji",
        },
      },
      ai: {
        order: function (item, player) {
          if (game.hasPlayer(i => i != player && get.damageEffect(i, player, player) > 0)
            && player.hasCard(i => {
              return get.subtype(i) == 'equip1' && (get.value(i, player) < 9 || get.useful(i, player) < 8);
            }, 'he')) return 10;
          else return 0;
        },
        result: {
          target: -1.5,
        },
        tag: {
          damage: 1,
        },
      },
    },
    translate: {
      jlsg_zhiji_info: "出牌阶段限一次，你可以弃置任意张武器牌，然后你对至多X名其他角色各造成X点伤害（X为你弃置的牌数）。回合开始时，若你已受伤；或当你受到伤害后，你可以从牌堆或弃牌堆中、场上的随机获得一张武器牌，然后你弃置一张非装备牌。",
    },
  },
  //SK神貂蝉
  jlsgsoul_diaochan: {
    jlsg_tianzi: {
      mod: {
        maxHandcard(player, num) {
          return num + game.countPlayer(cur => cur != player);
        },
      },
      audio: "ext:极略:1",
      trigger: { player: "phaseDrawBegin1" },
      filter(event, player) {
        return !event.fixed && event.num && game.countPlayer(cur => cur != player);
      },
      forced: true,
      content() {
        trigger.num += game.countPlayer(cur => cur != player);
      },
      /*group: "jlsg_tianzi_gameDraw",
      subSkill: {
        gameDraw: {
          trigger: {
            global: "phaseBefore",
            player: "enterGame",
          },
          forced: true,
          filter(event, player) {
            const sum = game.countPlayer(cur => cur != player);
            return sum && (event.name != "phase" || game.phaseNumber == 0);
          },
          forced: true,
          content() {
            let num = game.countPlayer(cur => cur != player);
            const cards = get.cards(num);
            player.directgain(cards);
          },
        },
      },*/
    },
    jlsg_meixin: {
      onremove: true,
      enable: "phaseUse",
      marktext: "魅",
      intro: {
        content: "正在遭受女性毒打",
      },
      audio: "ext:极略:4",
      filter(event, player) {
        const num = game.countPlayer(current => {
          return current.hasMark("jlsg_meixin");
        }) + 1;
        if (player.countCards("he") <= num) return false;
        return game.hasPlayer(current => {
          if (current == player) return false;
          if (!current.hasSex("male")) return false;
          return !current.hasMark("jlsg_meixin");
        });
      },
      selectCard() {
        const num = game.countPlayer(current => {
          return current.hasMark("jlsg_meixin");
        }) + 1;
        return [num, num];
      },
      filterCard(card, player, event) {
        return lib.filter.cardDiscardable(card, player, event);
      },
      check(card) {
        return 8 > get.value(card);
      },
      filterTarget(card, player, target) {
        if (target == player) return false;
        if (!target.hasSex("male")) return false;
        return !target.hasMark("jlsg_meixin");
      },
      filterOk() {
        const player = get.player(), target = ui.selected.targets[0];
        if (_status.connectMode && !player.isAuto) return true;
        else if (!_status.auto) return true;
        if (get.attitude(player, target) > 1) return false;
        else return true;
      },
      prompt() {
        const num = game.countPlayer(current => {
          return current.hasMark("jlsg_meixin");
        }) + 1;
        return `魅心：弃置${num}张牌并选择一名其他男性角色，令其直到其回合开始前遭受女性毒打`;
      },
      async content(event, trigger, player) {
        event.target.addMark("jlsg_meixin", 1);
      },
      ai: {
        order: 20,
        result: {
          player(player, target) {
            if (!game.hasPlayer(current => {
              if (current == player) return false;
              if (get.attitude(player, target) < 1) return false;
              return current.hasSex("male");
            })) return 0;
            else return 0.1;
          },
          target: -1,
        },
      },
      group: "jlsg_meixin_effect",
      subSkill: {
        effect: {
          trigger: { global: ["phaseBegin", "useCardAfter"] },
          filter(event, player, name) {
            if (name == "phaseBegin") return event.player.hasMark("jlsg_meixin");
            else {
              if (!event.player.hasSex("female") && event.player != player) return false;
              return game.hasPlayer(current => {
                return current.hasMark("jlsg_meixin");
              });
            }
          },
          forced: true,
          popup: false,
          async content(event, trigger, player) {
            if (event.triggername == "phaseBegin") trigger.player.removeMark("jlsg_meixin", trigger.player.countMark("jlsg_meixin"), false);
            else {
              const type = get.type2(trigger.card, trigger.player);
              let targets = game.filterPlayer(cur => cur.hasMark("jlsg_meixin")).sortBySeat(player);
              await player.logSkill("jlsg_meixin", targets);
              for (const target of targets) {
                if (!target.isIn()) continue;
                if (type == "basic") await target.discard(target.getCards("he").randomGet());
                else if (type == "trick" && target.countGainableCards(player, "he")) {
                  let card = target.getGainableCards(player, 'he').randomGet();
                  await player.gain(card, target, 'giveAuto', 'bySelf');
                }
                else await target.damage(player);
                await game.delayx();
              };
            }
          },
        },
      },
    },
    translate: {
      jlsg_tianzi_info: "锁定技，摸牌数和手牌上限+X（X为存活的其他角色数）。",
      jlsg_meixin_info: "出牌阶段，你可以弃置X张牌并选择一名未拥有“魅心”标记的其他男性角色（X为拥有“魅心”标记的角色数+1），令其获得1枚“魅心”标记直到其下个回合开始。对于拥有“魅心”标记的角色，当你或任意女性角色使用：基本牌后，你令其随机弃置一张牌；锦囊牌后，你随机获得其一张牌；装备牌后，你对其造成1点伤害。",
    },
    "delete": ["jlsg_meixin2", "jlsg_meixin3"],
  },
  //SK神黄盖
  jlsgsoul_huanggai: {
    jlsg_lianti: {
      audio: "ext:极略:2",
      forced: true,
      delay: false,
      trigger: {
        player: "showCharacterEnd",
      },
      init: function (player) {
        if (player.hasSkill('jlsg_lianti')) {
          player.useSkill('jlsg_lianti');
        };
      },
      intro: {
        content: "mark",
      },
      filter: function (event, player) {
        return !player.isLinked();
      },
      content: function () {
        player.link(true)._triggered = null;
      },
      group: ["jlsg_lianti_guard", "jlsg_lianti2", "jlsg_lianti3", "jlsg_lianti4"],
      subSkill: {
        guard: {
          silent: true,
          charlotte: true,
          trigger: {
            player: "linkBefore",
          },
          filter: function (event, player) {
            return player.isLinked() && player.hasSkill('jlsg_lianti');
          },
          content: function () {
            trigger.cancel();
            game.log(player, '取消了重置');
          },
          sub: true,
          sourceSkill: "jlsg_lianti",
          forced: true,
          popup: false,
        },
      },
      "_priority": 0,
    },
    jlsg_lianti2: {
      audio: "jlsg_lianti",
      forced: true,
      trigger: {
        global: "damageEnd",
      },
      filter: function (event, player) {
        return player === _status.currentPhase && player != event.player && event.nature
          && event.player.getHistory('damage', e => e.nature).indexOf(event) == 0;
      },
      content: function () {
        trigger.player.damage(trigger.num, trigger.source, trigger.nature);
      },
    },
    jlsg_lianti3: {
      audio: "jlsg_lianti",
      forced: true,
      trigger: {
        player: "damageEnd",
      },
      filter: function (event, player) {
        return event.nature;
      },
      content: function () {
        "step 0"
        player.addMark("jlsg_lianti");
        "step 1"
        if (player.getRoundHistory('damage', evt => {
          return evt.hasNature();
        }).indexOf(trigger) == 0) player.loseMaxHp();
      },
    },
    jlsg_yanlie: {
      audio: "ext:极略:2",
      enable: 'phaseUse',
      usable: 1,
      filterCard: true,
      selectCard: function () {
        if (ui.selected.targets.length) return [ui.selected.targets.length, Math.min(ui.selected.targets.length + 1, game.players.length - 1)];
        return [1, Infinity];
      },
      check: function (card) {
        var player = _status.event.player;
        let maxTarget = game.countPlayer(
          p => lib.skill.jlsg_yanlie.ai.result.target(player, p) * get.attitude(player, p) > 0
        );
        if (maxTarget <= ui.selected.cards.length) return 0;
        return 6 - get.value(card);
      },
      selectTarget: function () {
        return ui.selected.cards.length;
      },
      filterTarget() {
        return lib.filter.notMe;
      },
      line: false,
      delay: false,
      multitarget: true,
      multiline: true,
      content: function () {
        'step 0'
        player.useCard({
          name: 'tiesuo', isCard: true, storage: {
            nowuxie: true,
          }
        }, targets);
        'step 1'
        player.chooseTarget(true, function (_, player, target) { return target.isLinked(); })
          .set("prompt2", "对一名横置角色造成1点火焰伤害")
          .set("ai", function (target, targets) {
            if (target == _status.event.player) {
              return 0;
            }
            return Math.random();
          });
        'step 2'
        if (result.bool) {
          result.targets[0].damage('fire');
        }
      },
      ai: {
        order: 7,
        fireDamage: true,
        result: {
          target: function (player, target) {
            if (target.isLinked() && !target.hasSkill("jlsg_lianti")) {
              return 0.5;
            }
            if (target.hasSkillTag('nofire')) return 0;
            let eff = get.damageEffect(target, player, player, 'fire') / get.attitude(player, target);
            if (player.hasSkill("jlsg_lianti")) {
              eff *= 2;
            }
            return eff;
          }
        }
      },
    },
    translate: {
      jlsg_lianti_info: "锁定技，你始终横置，其他角色于你的回合内第一次受到属性伤害后，你令其再受到一次等量同属性伤害。当你受到属性伤害后，你摸牌阶段摸牌数和手牌上限+1，然后若为你本轮首次受到属性伤害，你减1点体力上限。",
      jlsg_yanlie_info: "出牌阶段限一次，你可以弃置至少一张手牌并选择等量的其他角色，视为你对这些角色使用不能被响应的【铁索连环】，然后对一名横置角色造成1点火焰伤害。",
    },
  },
  //SK神贾诩
  jlsgsoul_jiaxu: {
    jlsg_yanmie: {
      audio: "ext:极略:2",
      enable: "phaseUse",
      filter: function (event, player) {
        return player.countCards('he', { suit: 'spade' }) > 0;
      },
      check(card) {
        return 7 - get.value(card);
      },
      filterCard(card) {
        return get.suit(card) == 'spade';
      },
      position: "he",
      filterTarget(card, player, target) {
        return player != target && target.countCards('he');
      },
      content() {
        "step 0"
        var cards = target.getCards('he');
        target.discard(cards);
        target.draw(cards.length);
        target.showHandcards();
        "step 1"
        event.cards = target.getCards('h', function (card) {
          return get.type(card) != 'basic';
        });
        if (cards.length) {
          player.chooseBool("湮灭：是否令" + get.translation(target) + "弃置非基本牌并受到" + get.translation(event.cards.length) + "点伤害？")
            .set("ai", (event, player) => {
              return get.damageEffect(target, player, player) > 0;
            });
        }
        "step 2"
        if (result.bool) {
          target.discard(event.cards, player);
          target.damage(event.cards.length);
        }
      },
      ai: {
        order: 8,
        expose: 0.3,
        threaten: 1.8,
        result: {
          target: function (player, target) {
            return -target.countCards('h') - 1;
          },
        },
      },
    },
    jlsg_shunshi: {
      audio: "ext:极略:2",
      trigger: {
        target: "useCardToBegin",
      },
      filter: function (event, player) {
        return event.player != player && ["basic", "trick"].includes(get.type(event.card))
          && event.targets.length == 1 && game.hasPlayer(p => p != player);
      },
      direct: true,
      content: function () {
        "step 0"
        player.chooseTarget('###是否发动【顺世】?###令至多三名其他角色也成为此牌(' + get.translation(trigger.card) + ')的目标', [1, 3])
          .set("filterTarget", (card, player, target) => {
            if (player == target) return false;
            if (game.checkMod(trigger.card, trigger.player, target, "unchanged", "playerEnabled", trigger.player) == false) return false;
            if (game.checkMod(trigger.card, trigger.player, target, "unchanged", "targetEnabled", target) == false) return false;
            return true;
          })
          .set("ai", target => get.effect(target, trigger.card, trigger.player, player) > 0);
        "step 1"
        if (result.bool) {
          result.targets.sortBySeat();
          player.logSkill('jlsg_shunshi', result.targets);
          for (var i = 0; i < result.targets.length; i++) {
            trigger.targets.push(result.targets[i]);
            game.log(result.targets[i], '成为了额外目标');
          };
          player.draw(result.targets.length);
        }
      },
      ai: {
        effect: {
          target(card, player, target) {
            if (player == target) return;
            if (card.name == 'tao') {
              return [1, 2];
            }
            else if (card.name == 'sha') {
              return [1, 0.74];
            }
            else if (get.type(card) == 'trick') {
              return [1, 0.5];
            }
          },
        },
      },
    },
    translate: {
      jlsg_yanmie_info: '出牌阶段，你可以弃置一张黑桃牌，令一名其他角色先弃置所有牌再摸等量的牌并展示之。你弃置其中所有非基本牌，并对其造成等量的伤害。',
      jlsg_shunshi_info: '当你成为其他角色使用的基本牌或普通锦囊牌的唯一目标时，你可以令至多三名不为此牌的其他角色成为此牌的额外目标，然后你摸X张牌（X为以此法增加的目标数）。',
    },
  },
  //SK神吕布
  jlsgsoul_lvbu: {
    jlsg_kuangbao1: {
      trigger: {
        source: "damageEnd",
        player: "damageEnd",
      },
      forced: true,
      audio: "ext:极略:true",
      filter: function (event) {
        return event.num != 0;
      },
      content: function () {
        let num = trigger.num;
        if (player.hasSkill("jlsg_wuqian") && player.countMark("jlsg_kuangbao") > 3) num++;
        player.addMark('jlsg_kuangbao', num);
        if (trigger.player == player) player.draw(2);
      },
    },
    jlsg_wumou: {
      audio: "ext:极略:1",
      trigger: {
        player: "useCard",
      },
      forced: true,
      filter: function (event) {
        return get.type(event.card) == 'trick';
      },
      content: function () {
        'step 0'
        if (player.storage.jlsg_kuangbao > 0) {
          player.chooseControl('选项一', '选项二').set('prompt', '无谋<br><br><div class="text">1:弃置1枚「暴」标记</div><br><div class="text">2:受到1点伤害</div></br>').ai = function () {
            if (player.storage.jlsg_kuangbao > 6) return '选项一';
            if (player.hp >= 4 && player.countCards('h', 'tao') >= 1) return '选项二';
            return Math.random() < 0.5 && '选项一';
          };
        } else {
          player.damage('nosource');
          event.finish();
        }
        'step 1'
        if (result.control == '选项一') {
          player.storage.jlsg_kuangbao--;
          player.syncStorage('jlsg_kuangbao');
        } else {
          player.damage('nosource');
        }
        trigger.nowuxie = true;
      },
      ai: {
        halfneg: true,
      },
    },
    jlsg_wuqian: {
      audio: "ext:极略:1",
      derivation: ["wushuang", "jlsgsy_shenji"],
      trigger: {
        player: ["jlsg_kuangbao1After", "jlsg_kuangbaoAfter", "jlsg_wumouAfter", "jlsg_shenfenAfter"],
      },
      forced: true,
      filter(event, player) {
        if (player.countMark("jlsg_kuangbao") > 3) return (!player.hasSkill("wushuang") || !player.hasSkill("jlsgsy_shenji"));
        else if (player.countMark("jlsg_kuangbao") < 4) player.additionalSkills["jlsg_wuqian"] && player.additionalSkills["jlsg_wuqian"].length;
        return false;
      },
      content: function () {
        if (player.countMark("jlsg_kuangbao") > 3) {
          player.addAdditionalSkills("jlsg_wuqian", ['wushuang', 'jlsgsy_shenji']);
          player.update();
        }
        else player.removeAdditionalSkills("jlsg_wuqian");
      },
      ai: {
        result: {
          player: function (player) {
            if (player.countCards('h', 'juedou') > 0) {
              return 2;
            }
            var ph = player.get('h');
            var num = 0;
            for (var i = 0; i < ph.length; i++) {
              if (get.tag(ph[i], 'damage')) num++;
            }
            if (num > 1) return num;
            return 0;
          },
        },
      },
    },
    jlsg_shenfen: {
      audio: "ext:极略:1",
      enable: "phaseUse",
      usable: 1,
      filter: function (event, player) {
        return player.storage.jlsg_kuangbao >= 6;
      },
      skillAnimation: true,
      animationColor: "metal",
      mark: true,
      content: function () {
        "step 0"
        player.removeMark("jlsg_kuangbao", 6)
        event.targets = game.players.slice(0);
        event.targets.remove(player);
        event.targets.sort(lib.sort.seat);
        event.targets2 = event.targets.slice(0);
        "step 1"
        if (event.targets.length) {
          event.targets.shift().damage();
          event.redo();
        }
        "step 2"
        if (event.targets2.length) {
          var cur = event.targets2.shift();
          if (cur && cur.num('he')) cur.discard(cur.get('he'));
          event.redo();
        }
        "step 3"
        player.turnOver();
      },
      ai: {
        order: 9,
        result: {
          player: function (player) {
            var num = 0;
            for (var i = 0; i < game.players.length; i++) {
              if (game.players[i] != player) {
                if (game.players[i].ai.shown == 0) return 0;
                num += get.damageEffect(game.players[i], player, player) > 0 ? 1 : -1;
              }
            }
            return num;
          },
        },
      },
    },

    translate: {
      jlsg_kuangbao_info: "锁定技，游戏开始时，你获得2枚「暴」标记。每当你造成或受到伤害时，你获得等量的「暴」标记。当你受到伤害后，你摸两张牌。",
      jlsg_wumou_info: "锁定技，当你使用非延时锦囊牌时，你须选择一项：1，弃置一枚「暴」标记；2，受到一点伤害；然后此牌不能被【无懈可击】响应",
      jlsg_wuqian_info: "锁定技，若你有不少于4枚「暴」标记，你获得“无双”和“神戟”；且你造成伤害后额外获得一枚「暴」标记。",
      jlsg_shenfen_info: "每回合限一次，出牌阶段，你可以弃6个暴怒标记，你对每名其他角色各造成一点伤害，其他角色各自弃置所有牌，然后将你的武将牌翻面。",
    },
  },
  //SK神刘备
  jlsgsoul_liubei: {
    jlsg_jizhao: {
      audio: "ext:极略:2",
      intro: {
        content: 'mark',
      },
      trigger: { player: "phaseUseBegin" },
      filter: (event, player) => player.countCards('h'),
      async cost(event, trigger, player) {
        const hs = player.getCards('h');
        const given = [], given_map = {};
        while (hs.length) {
          const { result } = await player.chooseCardTarget({
            complexCard: true,
            complexSelect: true,
            filterCard(card) {
              return get.event("hs").includes(card);
            },
            hs: hs,
            given: given,
            filterTarget: lib.filter.notMe,
            selectCard: [1, hs.length],
            prompt: '激诏：是否将手牌牌分配给其他角色？',
            prompt2: "获得牌的角色获得一枚“激诏”标记",
            ai1(card) {
              const player = get.owner(card), hs = get.event("hs"), given = get.event("given");
              if (!ui.selected.cards.length && get.name(card) == "du") return 20;
              if (ui.selected.cards.length) return 0;
              if (given.length && get.value(hs) < get.value(given) / Object.keys(given_map).length) return 0;
              if (player.hasUseTarget(card) && get.type(card) != "equip") {
                return game.filterPlayer(current => {
                  if (current == player) return false;
                  if (get.attitude(player, current) > 1) return false;
                  if (current.getUseValue(card) > 0 && current.getUseValue(card) > player.getUseValue(card)) return 10 > get.value(card);
                });
              }
              else if (!player.hasUseTarget(card)) {
                if (get.useful(card) < 5) return game.hasPlayer(current => {
                  return get.attitude(player, current) < 1 && get.value(card) < 5;
                })
                return game.filterPlayer(current => {
                  if (current == player) return false;
                  if (get.attitude(player, current) > 1) return false;
                  if (current.getUseValue(card) > 0 && current.getUseValue(card) > player.getUseValue(card)) return true;
                  return get.useful(card, current) > get.useful(card, player);
                });
              }
              return 0;
            },
            ai2(target) {
              const card = ui.selected.cards[0];
              const player = get.owner(card), att = get.attitude(player, target);
              if (!card) return false;
              if (get.name(card, player) == "du") {
                if (target.hasSkillTag("nodu")) return att < 0;
                if (target.hasSkillTag("usedu")) return att > 0;
                return att < 0;
              }
              if (att > 1) {
                let add;
                if (given_map[target.playerid] && given_map[target.playerid].length) add = given_map[target.playerid];
                if (target.hasJudge("lebu")) return target.needsToDiscard(add) < 3;
                else if (target.isTurnedOver()) return get.useful(card, target) >= get.useful(card, player) || target.getUseValue(card) > 0;
                if (target.getUseValue(card) > 0 && target.getUseValue(card) > player.getUseValue(card)) {
                  if (!target.isTurnedOver() && !target.hasJudge("lebu")) {
                    if (get.attitude(target, player) >= 3 && get.attitude(player, target) >= 3) return 11 > get.value(card);
                  }
                  else return target.needsToDiscard(add) < 1;
                }
                return target.needsToDiscard() < 3 && 8 > get.value(card);
              }
              else {
                if (given_map[target.playerid] && given_map[target.playerid].length) return 0;
                if (target.hasJudge("lebu")) return get.value(card, player) <= 5 && card.name != "wuxie";
                else if (target.hasSkillTag("nogain")) return get.useful(card, player) <= 5;
                else return !get.tag(card, 'damage') && !get.tag(card, 'save') && !get.tag(card, 'recover') && get.useful(card, player) <= 5;
              }
            },
          });
          if (!result.bool) break;
          const res = result.cards, target = result.targets[0].playerid;
          const tag = `jlsg_jizhao_g${target}`;
          if (!lib.translate[tag]) {
            game.broadcastAll(function (tag, name) {
              lib.translate[tag] = `激诏(${get.translation(name)})`;
            }, tag, result.targets[0].name);
          }
          player.addGaintag(res, tag);
          hs.removeArray(res);
          given.addArray(res);
          if (!given_map[target]) given_map[target] = [];
          given_map[target].addArray(res);
        };
        event.result = {
          bool: Object.keys(given_map).length,
          cost_data: given_map,
        };
      },
      async content(event, trigger, player) {
        const given_map = {},
          players = game.filterPlayer().sortBySeat(player);
        for (let i = 0; i < players.length; i++) {
          const id = players[i].playerid;
          if (event.cost_data[id]) given_map[id] = event.cost_data[id];
        };
        const map = Object.entries(given_map).map(i => [(_status.connectMode ? lib.playerOL : game.playerMap)[i[0]], i[1]]),
          cards = Object.entries(given_map).map(i => i[1]).flat()
        if (map.length) {
          await player.addExpose(0.3);
          await game.loseAsync({
            gain_list: map,
            player: player,
            cards: cards,
            giver: player,
            animate: 'giveAuto',
          }).setContent(async function (event, trigger, player) {
            event.type = "gain";
            await player.lose(cards, ui.special).set("type", "gain").set("forceDie", true).set("getlx", false);
            var evt = event.getl(player);
            await game.asyncDelay(0, get.delayx(500, 500));
            for (var i = 0; i < event.gain_list.length; i++) {
              const info = event.gain_list[i];
              if (get.itemtype(i[1]) == "card") info[1] = [info[1]];
              info[1] = info[1].filter((card) => {
                return !cards.includes(card) || !player.getCards("hejsx").includes(card);
              });
              var shown = info[1].slice(0), hidden = [];
              for (var card of info[1]) {
                if (evt.hs.includes(card)) {
                  shown.remove(card);
                  hidden.push(card);
                }
              }
              if (shown.length > 0) await player.$give(shown, info[0]);
              if (hidden.length > 0) await player.$giveAuto(hidden, info[0]);
              await info[0].addMark('jlsg_jizhao', 1);
            };
            for (var i = 0; i < event.gain_list.length; i++) {
              const info = event.gain_list[i];
              if (info[1].length > 0) {
                const next = info[0].gain(info[1]);
                next.getlx = false;
                next.giver = event.giver;
                await next;
              }
            }
          });
          await game.asyncDelay();
        }
      },
      group: ['jlsg_jizhao_damage', 'jlsg_jizhao_remove'],
      subSkill: {
        damage: {
          audio: "jlsg_jizhao_zhao",
          trigger: { global: "damageBegin1" },
          filter: (event) => event.source && event.source.hasMark('jlsg_jizhao'),
          prompt: (event) => `是否对${get.translation(event.source)}发动“激诏”？`,
          prompt2: (event) => `移去${get.translation(event.source)}的一个“激诏”标记，并令此次伤害+1`,
          check: function (event, player) {
            var att = get.attitude(event.player, player);
            if (att > 0) {
              if (get.attitude(event.source, player) < 0) return false;
              if (event.player.hasSkillTag('filterDamage', null, { player: event.source })) return event.player.hp > 1;
              else return event.player.hasSkillTag('maixie', null, { player: event.source });
            }
            else return !event.player.hasSkillTag('filterDamage', null, { player: event.source }) && att < 0;
          },
          content: function () {
            trigger.source.removeMark('jlsg_jizhao', 1);
            trigger.num++;
          },
        },
        remove: {
          audio: "ext:极略:2",
          trigger: { player: "phaseBegin" },
          filter: () => game.hasPlayer(current => current.hasMark('jlsg_jizhao')),
          prompt: `激诏：你可以移去场上所有角色的“激诏”标记`,
          prompt2: `这些角色失去等量体力`,
          check: function (event, player) {
            var targets = game.filterPlayer(current => current.hasMark('jlsg_jizhao'));
            var eff = 0
            for (var target of targets) {
              if (get.attitude(target, player) > 0) {
                if (get.effect(target, { name: 'losehp' }, player, target) > 0 && target.hp > target.countMark('jlsg_jizhao')) eff += 2;
                else eff--;
              }
              else {
                if (get.effect(target, { name: 'losehp' }, player, target) > 0 && target.hp > target.countMark('jlsg_jizhao')) eff--;
                else eff += 2;
              }
            }
            return eff > 0;
          },
          content() {
            for (var i of game.filterPlayer(current => current.hasMark('jlsg_jizhao'))) {
              const num = i.countMark('jlsg_jizhao');
              i.removeMark('jlsg_jizhao', num);
              i.loseHp(num);
            };
          },
        }
      },
    },
    jlsg_junwang: {
      audio: "ext:极略:2",
      trigger: {
        global: ["phaseUseBegin", "phaseUseEnd"],
      },
      filter(event, player) {
        return event.player != player && event.player.countCards('h') >= player.countCards('h');
      },
      logTarget: 'player',
      forced: true,
      content() {
        trigger.player.chooseToGive(true, player, `###${get.translation(player)}对你发动了【君望】###交给其一张手牌`);
      },
    },
    translate: {
      jlsg_jizhao_info: "出牌阶段开始时，你可以将任意张手牌分配给任意名其他角色，然后这些角色各获得一个“激诏”标记。有此标记的角色造成伤害时，你可以移去其一个“激诏”标记，令此伤害+1。回合开始时，你可以移去场上所有“激诏”标记，然后这些角色失去等量体力。",
    },
  },
  //SK神孙权
  jlsgsoul_sunquan: {
    jlsg_huju: {
      audio: "ext:极略:true",
      init(player) {
        player.maxHp = player.maxHp + 1;
        player.hp = player.hp + 1;
        player.update()
      },
      trigger: { global: "phaseBegin" },
      derivation: ['zhiheng', 'jlsg_hufu', 'jlsg_xionglve'],
      filter: () => true,
      forced: true,
      content: function () {
        player.draw(4);
        if (trigger.player == player) {
          player.loseMaxHp(1);
          player.removeSkills('jlsg_huju');
          player.addSkills(lib.skill[event.name].derivation);
        }
      },
    },
    jlsg_hufu: {
      audio: "ext:极略:2",
      enable: "phaseUse",
      usable: 1,
      filter: (event, player) => game.hasPlayer(current => current != player && current.countCards('e')),
      filterTarget: (card, player, target) => target != player && target.countCards('e'),
      content() {
        var num = target.countCards('e');
        target.chooseToDiscard(`${get.translation(player)}对你发动“虎缚”，请弃置${num}张牌`, true, [num, num], "he");
      },
      ai: {
        expose: 0.2,
        order: 9,
        result: {
          target: function (player, target) {
            return -target.countCards('e');
          },
        },
      },
    },
    jlsg_xionglve: {
      audio: 'ext:极略/jlsg_xionglve1.mp3',
      marktext: `略`,
      intro: {
        markcount: "expansion",
        mark(dialog, content, player) {
          var content = player.getExpansions('jlsg_xionglve');
          if (content && content.length) {
            if (player == game.me || player.isUnderControl()) {
              dialog.addAuto(content);
            }
            else return '共有' + get.cnNumber(content.length) + '张略';
          }
        },
        content(content, player) {
          var content = player.getExpansions('jlsg_xionglve');
          if (content && content.length) {
            if (player == game.me || player.isUnderControl()) return get.translation(content);
            return '共有' + get.cnNumber(content.length) + '张略';
          }
        },
      },
      enable: "phaseUse",
      filter: (event, player) => player.hasCard(card => card.hasGaintag('jlsg_xionglve'), 'x'),
      direct: true,
      hiddenCard: function (player, name) {
        if (!lib.inpile.includes(name) || !player.isPhaseUsing()) return false;
        var type = get.type2(name);
        return (type == 'basic' || type == 'trick') && player.hasCard(card => {
          return card.hasGaintag('jlsg_xionglve') && get.type(card) == type;
        }, 'x');
      },
      chooseButton: {
        dialog(event, player) {
          var list = [];
          for (var i = 0; i < lib.inpile.length; i++) {
            var name = lib.inpile[i];
            if (!player.getExpansions('jlsg_xionglve').some(j => get.type(j) == get.type(name)) || get.type(name) == 'equip') continue;
            if (name == 'sha') {
              if (event.filterCard({ name: name }, player, event)) list.push(['基本', '', 'sha']);
              for (var j of lib.inpile_nature) {
                if (event.filterCard({ name: name, nature: j }, player, event)) list.push(['基本', '', 'sha', j]);
              }
            }
            else if (event.filterCard({ name: name }, player, event)) list.push([`${get.translation(get.type2(name))}`, '', name]);
          }
          var dialog = ui.create.dialog('<font size=6>雄略', '<font size=3>', 'hidden');
          dialog.add('选择一张牌使用');
          dialog.add([list, 'vcard']);
          dialog.add('选择一张“略”');
          dialog.add(player.getExpansions('jlsg_xionglve'));
          return dialog;
        },
        select() {
          if (ui.selected.buttons.length && get.itemtype(ui.selected.buttons[0].link) == 'card') {
            if (get.type(ui.selected.buttons[0].link) == 'equip') return 1;
          }
          return 2;
        },
        filter(button) {
          if (ui.selected.buttons.length) {
            var card = ui.selected.buttons[0].link;
            if (get.itemtype(card) == get.itemtype(button.link)) return false;
            if (get.itemtype(card) != 'card') return get.type2(card[2]) == get.type2(button.link);
            else return get.type2(card) == get.type2(button.link[2]);
          }
          else {
            if (get.itemtype(button.link) == 'card') return true;
            else return get.player().hasUseTarget(button.link[2]) > 0;
          }
        },
        check(button) {
          var player = get.player();
          if (!ui.selected.buttons.length) {
            if (player.getExpansions('jlsg_xionglve').some(i => get.type(i) == 'equip')) {
              if (get.itemtype(button.link) == 'card' && get.type(button.link) == 'equip') return 1;
              else return 0;
            }
            return player.getUseValue({
              name: button.link[2],
              nature: button.link[3],
            }) > 0;
          }
          return 1;
        },
        backup(links, player) {
          if (get.itemtype(links[1]) == 'card') links.reverse();
          return {
            audio: 'ext:极略:2',
            viewAs: function () {
              if (get.type(links[0]) == 'equip') return links[0];
              else return { name: links[1][2], nature: links[1][3] }
            },
            position: 'x',
            filterCard: (card) => card == lib.skill.jlsg_xionglve_backup.card,
            selectCard: -1,
            filterTarget: function (card, player, target) {
              if (get.type(links[0]) == 'equip') return target != player;
              else return player.canUse({ name: links[1][2], nature: links[1][3] }, target);
            },
            selectTarget: function () {
              if (get.type(links[0]) == 'equip') return 1;
              else return lib.filter.selectTarget({ name: links[1][2], nature: links[1][3] }, get.player());
            },
            card: links[0],
            popname: true,
            precontent: function () {
              player.logSkill('jlsg_xionglve');
            },
          };
        },
        prompt: function (links, player) {
          if (get.type(links[0]) == 'equip') return '请选择' + get.translation(links[0]) + '的目标';
          else return '请选择' + get.translation(links[1][2]) + '的目标';
        },
      },
      ai: {
        fireAttack: true,
        save: true,
        respondSha: true,
        respondShan: true,
        skillTagFilter: function (player) {
          if (!player.isPhaseUsing()) return false;
          return player.hasCard(card => {
            return card.hasGaintag('jlsg_xionglve') && get.type(card) == 'basic';
          }, 'x');
        },
        order: 6,
        result: {
          player: function (player) {
            if (player.hp <= 2) return 3;
            return player.getExpansions('jlsg_xionglve').length - 1;
          },
        },
      },
      group: 'jlsg_xionglve_draw',
      subSkill: {
        draw: {
          audio: "ext:极略/jlsg_xionglve21.mp3",
          trigger: { player: "phaseDrawBegin1" },
          filter: (event) => !event.numFixed,
          prompt: `雄略：是否放弃摸牌，改为亮出牌堆顶的两张牌`,
          prompt2: `获得其中一张并将另一张牌置于武将牌上称为“略”`,
          check: function (event, player) {
            var num = player.getCards('h').reduce((p, c) => p + get.useful(c), 0);
            return event.num < 2 || player.hp < 3 || num < 30 || player.phaseNumber <= 1;
          },
          content: function () {
            "step 0"
            trigger.changeToZero();
            event.cards = get.cards(2);
            game.cardsGotoOrdering(event.cards);
            event.videoId = lib.status.videoId++;
            game.broadcastAll(function (player, id, cards) {
              var str;
              if (player == game.me && !_status.auto) str = '雄略：选择获得其中一张牌';
              else str = '雄略';
              var dialog = ui.create.dialog(str, cards);
              dialog.videoId = id;
            }, player, event.videoId, event.cards);
            event.time = get.utc();
            game.addVideo('showCards', player, ['雄略', get.cardsInfo(event.cards)]);
            game.addVideo('delay', null, 2);
            "step 1"
            var next = player.chooseButton(1, true);
            next.set('dialog', event.videoId);
            next.set('ai', function (button) {
              var player = get.player();
              var card1 = button.link;
              var card2 = event.cards.slice().filter(i => i != card1)[0];
              var num1 = [], num2 = [], list1 = [], list2 = [];
              game.countPlayer(current => {
                if (current == player) return false;
                if (get.type(card1) == 'equip') num1.add(get.effect_use(current, card1, player, player)).sort((a, b) => b - a);
                if (get.type(card2) == 'equip') num2.add(get.effect_use(current, card2, player, player)).sort((a, b) => b - a);
              });
              for (var i of lib.inpile) {
                if (get.type(card1) != 'equip' && get.type2(i) == get.type2(card1)) list1.add(player.getUseValue(i)).sort((a, b) => b - a);
                if (get.type(card1) != 'equip' && get.type2(i) == get.type2(card2)) list2.add(player.getUseValue(i)).sort((a, b) => b - a);
              };
              if (num1.length && num2.length) return num1[0] <= get.effect_use(player, card1, player, player);
              else if (num1.length && !num2.length) return list2[0] <= get.effect_use(player, card1, player, player);
              else if (!num1.length && num2.length) return list1[0] <= get.effect_use(player, card2, player, player);
              else {
                if (list2[0] >= player.getUseValue(card1)) return 1;
                else if (player.getUseValue(card2) >= player.getUseValue(card1)) return 1;
                else if (list1[0] <= player.getUseValue(card2)) return 1;
              }
              return Math.random();
            });
            "step 2"
            if (result.bool && result.links) {
              event.cards2 = result.links;
              event.cards.removeArray(event.cards2);
            }
            else event.finish();
            var time = 1000 - (get.utc() - event.time);
            if (time > 0) game.delay(0, time);
            "step 3"
            game.broadcastAll('closeDialog', event.videoId);
            player.gain(event.cards2, 'log', 'gain2');
            player.addToExpansion(event.cards, player, 'giveAuto').gaintag.add('jlsg_xionglve');
          },
        },
        backup: {
          sub: true,
          sourceSkill: "jlsg_xionglve",
        },
      },
    },
    translate: {
      jlsg_huju_info: "锁定技，一名角色的回合开始时，你摸四张牌；若为你的回合，你减1点体力上限，失去“虎踞”，获得“制衡”、“虎缚”、“雄略”。",
    },
    info: function () {
      lib.characterPack["jlsg_soul"].jlsgsoul_sunquan.maxHp = 5;
      lib.characterPack["jlsg_soul"].jlsgsoul_sunquan.hp = 5;
      if (!_status.connectMode) {
        lib.character.jlsgsoul_sunquan.maxHp = 5;
        lib.character.jlsgsoul_sunquan.hp = 5;
      }
    }
  },
  //SK神司马懿
  jlsgsoul_simayi: {
    jlsg_jilve: {
      audio: "ext:极略:3",
      trigger: { player: "useCardAfter" },
      forced: true,
      content() {
        player.draw();
      },
    },
    jlsg_tongtian: {
      audio: "ext:极略:1",
      enable: 'phaseUse',
      unique: true,
      skillAnimation: true,
      limited: true,
      mark: true,
      marktext: "通",
      intro: { content: true },
      prompt: "通天：摸四张牌并弃置任意张花色各不相同的牌，获得各花色的技能。",
      derivation: ['jlsg_tongtian_wei', 'jlsg_tongtian_shu', 'jlsg_tongtian_qun', 'jlsg_tongtian_wu'],
      async contentBefore(event, trigger, player) {
        player.awakenSkill('jlsg_tongtian');
        await player.draw(4);
      },
      async content(event, trigger, player) {
        const { result } = await player.chooseToDiscard("弃置任意张花色各不相同的牌，获得各花色的技能。", true, [1, 4], "he")
          .set("filterCard", (card, player) => {
            let suit = get.suit(card, player);
            return !ui.selected.cards.map(card => get.suit(card, player)).includes(suit);
          })
          .set("complexCard", true)
          .set("ai", card => {
            if (get.suit(card, get.player()) == "none") return -114514;
            return 8 - get.value(card);
          });
        if (!result.bool || !result.cards || !result.cards.length) return;
        const storage = result.cards.map(card => get.suit(card, player)),
          skillList = lib.skill.jlsg_tongtian.derivation,
          suits = ['spade', 'heart', 'club', 'diamond'];
        let skills = [];
        for (let i in suits) {
          if (storage.includes(suits[i])) skills.add(skillList[i]);
        };
        if (skills.length) await player.addSkills(skills);
      },
      ai: {
        order: 6,
        result: {
          player: function (player) {
            if (player.hp < 3 && player.countCards("he") < 4) return 1;
            var cards = player.get('he');
            var suits = [];
            for (var i = 0; i < cards.length; i++) {
              if (!suits.includes(get.suit(cards[i]))) {
                suits.push(get.suit(cards[i]));
              }
            }
            if (suits.length < 3) return -1;
            return suits.length;
          }
        }
      },

    },
    "delete": ["jlsg_jilve2"],
    translate: {
      jlsg_jilve_info: "锁定技，当你使用牌后，你摸一张牌。",
      jlsg_tongtian_info: "限定技，出牌阶段，你可以摸四张牌并弃置任意张花色各不相同的牌，然后若你以此法弃置的牌包含花色获得技能：黑桃·反馈；红桃·观星；梅花·完杀；方片·制衡",
    },
  },
  //SP神司马懿
  jlsgsoul_sp_simayi: {
    jlsg_yingshi: {
      mod: {
        targetInRange(card, player) {
          let cards = player.getCards("h", card => card.hasGaintag("jlsg_yingshi"));
          if (
            cards.includes(card) ||
            Array.isArray(card.cards) && card.cards.some(c => cards.includes(c))
          ) return true;
        },
        cardUsable(card, player) {
          let cards = player.getCards("h", card => card.hasGaintag("jlsg_yingshi"));
          if (
            cards.includes(card) ||
            Array.isArray(card.cards) && card.cards.some(c => cards.includes(c))
          ) return Infinity;
        },
        aiOrder(player, card, num) {
          let cards = player.getCards("h", card => card.hasGaintag("jlsg_yingshi"));
          if (_status.currentPhase != player) {
            if (
              cards.includes(card) ||
              Array.isArray(card.cards) && card.cards.some(c => cards.includes(c))
            ) return num + 2;
          } else {
            if (
              cards.includes(card) ||
              Array.isArray(card.cards) && card.cards.some(c => cards.includes(c))
            ) return num - 2;
          }
        },
        aiUseful(player, card, num) {
          let cards = player.getCards("h", card => card.hasGaintag("jlsg_yingshi"));
          if (
            cards.includes(card) ||
            Array.isArray(card.cards) && card.cards.some(c => cards.includes(c))
          ) return 0;
        },
      },
      init(player) {
        player.storage.jlsg_yingshi = player.storage.jlsg_yingshi || [];
      },
      mark: true,
      marktext: "鹰",
      intro: {
        mark(dialog, storage, player) {
          if (storage.length) {
            if (player == game.me || player.isUnderControl()) dialog.add([storage, "vcard"]);
            else return "已有" + storage.length + "张牌";
          }
        },
      },
      audio: "ext:极略:2",
      trigger: {
        global: ["gameDrawEnd", "phaseEnd"],
      },
      forced: true,
      filter(event, player) {
        if (event.name == "phase") {
          const cards = player.storage.jlsg_yingshi.filter(card => ["e", "h", "j", "c", "d", "o"].includes(get.position(card))),
            hs = player.getCards("h", card => get.type(card) == "basic" && card.hasGaintag("jlsg_yingshi"));
          return cards.concat(hs).filter((item, index, arr) =>
            arr.indexOf(item) == arr.lastIndexOf(item)
          ).length > 0;
        }
        else return true;
      },
      async content(event, trigger, player) {
        if (event.triggername == "gameDrawEnd") {
          const vcards = [];
          for (let name of lib.inpile) {
            if (get.type(name) == "basic") vcards.push(["基本", "", name]);
          }
          if (vcards.length) {
            const [bool, links] = await player
              .chooseButton([`鹰视：请选择要获得的一张基本牌`, [vcards, "vcard"]], true)
              .set("ai", button => {
                let name = button.link[2];
                if (name == "hufu") return 1;
                else if (name == "tao") return 0.8;
                else if (name == "jiu") return 0.6;
                else return 0.1;
              })
              .forResult("bool", "links");
            if (bool) {
              let card = get.cardPile(card => card.name == links[0][2]);
              if (card) await player.gain(card, "draw");
            }
          }
          const cards = player.getCards("h", card => get.type(card) == "basic");
          if (cards) {
            player.addGaintag(cards, "jlsg_yingshi");
            player.storage.jlsg_yingshi.addArray(cards);
          }
        }
        else {
          const cards = ['cardPile', 'discardPile']
            .map(pos => Array.from(ui[pos].childNodes))
            .flat()
            .filter(c => player.storage.jlsg_yingshi.includes(c));
          if (cards.length) await player.$gain2(cards);
          for (let p of game.filterPlayer(p => p != player)) {
            let pCards = p.getCards('hej', c => player.storage.jlsg_yingshi.includes(c));
            if (pCards.length) {
              p.$give(pCards, player);
              cards.addArray(pCards);
            }
          };
          await game.loseAsync({
            gain_list: [[player, cards]],
            cards: cards,
            visible: true,
            //gaintag: ['jlsg_yingshi'],
          }).setContent("gaincardMultiple");
          await game.delayx();
        }
      },
      group: ["jlsg_yingshi_gain", "jlsg_yingshi_draw"],
      subSkill: {
        gain: {
          sourceSkill: "jlsg_yingshi",
          trigger: {
            global: ["gainAfter", "loseAsyncAfter"],
          },
          getIndex(event, player) {
            return game.filterPlayer(current => {
              return event.getg && event.getg(current).length;
            }).sortBySeat(_status.currentPhase);
          },
          filter(event, player, name, target) {
            if (!target) return false;
            const gain = event.getg(target),
              storage = player.storage.jlsg_yingshi;
            let cards = gain.filter(c => storage.includes(c));
            if (target != player) return cards.length;
            else {
              let targets = game.filterPlayer2(current => {
                if (!event.getl || !event.getl(current)) return false;
                let lose = event.getl(current);
                let cards2 = gain.filter(c => lose.cards2.includes(c));
                if (!cards2.length) return false;
                if (cards2.some(c => get.type(c, null, false) != "basic")) return false;
                return true;
              });
              player.getHistory("useSkill", evt => {
                if (evt.skill != "jlsg_yingshi_gain") return false;
                if (!evt.targets?.length) return false;
                targets.removeArray(evt.targets);
              });
              return targets.length ? true : cards.length;
            }
          },
          async cost(event, trigger, player) {
            const target = event.indexedData;
            event.result = {
              bool: true,
              cost_data: target,
            };
            const gain = trigger.getg(target),
              storage = player.storage.jlsg_yingshi;
            let cards = [];
            if (target != player) {
              cards = gain.filter(c => storage.includes(c));
              if (cards.length) {
                event.result.cards = cards;
                event.result.skill_popup = false;
              }
            } else {
              let targets = game.filterPlayer2(current => {
                if (!trigger.getl(current)) return false;
                let lose = trigger.getl(current);
                let cards2 = gain.filter(c => lose.cards2.includes(c));
                if (!cards2.length) return false;
                if (cards2.some(c => get.type(c, null, false) != "basic")) return false;
                cards.addArray(cards2);
                return true;
              });
              player.getHistory("useSkill", evt => {
                if (evt.skill != "jlsg_yingshi_gain") return false;
                if (!evt.targets?.length) return false;
                targets.removeArray(evt.targets);
              });
              event.result.cards = cards;
              if (!targets.length) {
                event.result.cards = gain.filter(c => storage.includes(c))
                event.result.skill_popup = false;
              }
              else event.result.targets = targets;
            }
          },
          async content(event, trigger, player) {
            const cards = event.cards;
            if (event.cost_data.isIn()) event.cost_data.addGaintag(cards, "jlsg_yingshi");
            if (event.targets) player.storage.jlsg_yingshi.addArray(cards);
          }
        },
        draw: {
          sourceSkill: "jlsg_yingshi",
          trigger: { player: "useCardAfter" },
          forced: true,
          filter(event, player) {
            return player.hasHistory("lose", evt => {
              if (evt.getParent() != event) return false;
              for (var i in evt.gaintag_map) {
                if (evt.gaintag_map[i].includes("jlsg_yingshi")) return true;
              }
              return false;
            })
          },
          content() { player.draw() },
        }
      },
    },
    jlsg_langxi: {
      mark: true,
      marktext: "狼",
      intro: { content: "已记录:$" },
      init(player) {
        player.storage.jlsg_langxi ??= [];
      },
      priority: 2,
      audio: "ext:极略:2",
      trigger: {
        global: "phaseBefore",
        player: ["enterGame", "useCard"],
      },
      filter: function (event, player) {
        if (event.name == "useCard") {
          if (get.type(event.card) != "trick" || event.card.name == "wuxie") return false;
          return player.hasHistory("lose", evt => {
            if (evt.getParent() != event || !evt || !evt.hs) return false;
            return event.cards.every(card => evt.hs.includes(card)) && !player.storage.jlsg_langxi.includes(event.card.name);
          });
        }
        else return event.name != 'phase' || game.phaseNumber == 0;
      },
      async cost(event, trigger, player) {
        if (event.triggername != "useCard") {
          const vcards = [];
          for (var name of lib.inpile) {
            if (name == "wuxie") continue;
            if (player.storage.jlsg_langxi.includes(name)) continue;
            if (get.type(name) == "trick") vcards.push(["锦囊", "", name]);
          }
          if (!vcards.length) return;
          const [bool, links] = await player
            .chooseButton([`狼袭：请选择要标记的一张普通锦囊牌`, [vcards, "vcard"]], true)
            .set("ai", button => {
              var name = button.link[2];
              if (get.tag(name, "damage")) return 1;
              else {
                var cards = get.selectableButtons();
                if (!cards.some(button => get.tag(button.link[2], "damage"))) return Math.random();
                else return 0;
              }
            })
            .forResult("bool", "links");
          event.result = { bool: bool, cost_data: links[0][2] };
        }
        else event.result = await player
          .chooseBool(`###狼袭：是否将${get.translation(trigger.card.name)}标记为“狼”？###狼（${get.translation(player.storage.jlsg_langxi)}）`)
          .set("ai", (event, player) => {
            if (!lib.inpile.some(card => get.tag(card, "damage"))) return 1;
            else return get.tag(trigger.card, "damage");
          })
          .forResult();
      },
      async content(event, trigger, player) {
        const name = event.cost_data || trigger.card.name;
        player.storage.jlsg_langxi.add(name);
      },
      group: "jlsg_langxi_use",
      subSkill: {
        use: {
          audio: "jlsg_langxi",
          trigger: { player: "useCardAfter" },
          filter(event, player) {
            if (get.type(event.card) != "trick") return false;
            if (!player.storage.jlsg_langxi) return false;
            if (!event.cards) return false;
            if (event.targets.every(target => !target.isIn())) return false;
            return player.hasHistory("lose", evt => {
              if (!evt || evt.getParent() != event || !evt.hs) return false;
              return event.cards.every(card => evt.hs.includes(card));
            });
          },
          async cost(event, trigger, player) {
            event.result = await player.chooseTarget(`###狼袭：请选择“狼袭”牌的目标###（${get.translation(player.storage.jlsg_langxi)}）`)
              .set("filterTarget", (card, player, target) => trigger.targets.filter(i => i.isIn()).includes(target))
              .set("selectTarget", () => [1, trigger.targets.filter(target => target.isIn()).length])
              .set("ai", target => {
                let eff = 0, player = get.player();
                for (let name of player.storage.jlsg_langxi) eff += (get.effect(target, { name: name }, player, player));
                return eff;
              })
              .forResult();
          },
          async content(event, trigger, player) {
            const cards = player.storage.jlsg_langxi;
            event.targets.sortBySeat();
            for (let i = 0; i < cards.length; i++) {
              let targetx = event.targets.filter(i => i.isIn());
              await player.useCard({ name: cards[i], isCard: true }, targetx);
              await game.delayx();
            };
          }
        }
      }
    },
    jlsg_shenyin: {
      audio: "ext:极略:2",
      marktext: "隐",
      intro: {
        content(storage, player) {
          var str = `共有${player.countMark("jlsg_shenyin")}个标记`;
          if (player == game.me || player.isUnderControl()) str += `<br>${lib.skill.jlsg_shenyin.getInfo(player)}`
          return str;
        },
      },
      onremove(player) {
        if (player.hasMark("jlsg_shenyin")) player.useSkill("jlsg_shenyin_dying", false);
        else delete player.storage.jlsg_shenyin_record;
      },
      priority: 1,
      trigger: {
        global: "phaseBefore",
        player: ["enterGame", "phaseBegin"],
        source: "die",
      },
      filter(event, player, name) {
        if (name == "die") return event.player != player;
        if (name == "phaseBegin") return player.hasMark("jlsg_shenyin");
        else return name != 'phaseBefore' || game.phaseNumber == 0;
      },
      locked: true,
      async cost(event, trigger, player) {
        if (event.triggername != "phaseBegin") event.result = { bool: true };
        else {
          event.result = await player.chooseBool(() => true)
            .set("prompt2", lib.skill.jlsg_shenyin.getInfo(player))
            .set("prompt", "神隐：是否记录当前信息并获得一枚“神隐”标记？")
            .forResult();
        }
      },
      content() {
        if (event.triggername != "die") lib.skill.jlsg_shenyin.record(player);
        player.addMark("jlsg_shenyin", 1);
        player.markSkill("jlsg_shenyin");
      },
      record: function (player, norecord = false) {
        let hp = player.getHp(),
          maxhp = player.maxHp,
          skills = player.getSkills(null, false, false).filter(i => lib.translate[i] != undefined) || [],
          ying = player.storage.jlsg_yingshi || null,
          lang = player.storage.jlsg_langxi || null;
        const list = {
          "体力": Number(hp.toString().slice()),
          "体力上限": Number(maxhp.toString().slice()),
          "技能": skills.slice(),
          "鹰标记牌": ying.slice(),
          "狼标记牌": lang.slice(),
        };
        if (!norecord) player.storage.jlsg_shenyin_record = list;
        return list;
      },
      getInfo: function (player, num) {
        const translate = function (arr, player) {
          let list = {};
          for (let i = 0; i < lib.inpile.length; i++) {
            const card = lib.inpile[i];
            if (get.type(card, null, player) != "basic") continue;
            let name;
            name = get.translation(card);
            list[name] = 0;
            if (name == "杀") {
              for (let nature of lib.inpile_nature) {
                name = lib.translate["nature_" + nature] || lib.translate[nature] || "";
                name += "杀";
                list[name] = 0;
              };
            }
          };
          for (const str of arr) {
            let str2 = get.translation(str.name);
            if (str2 == "杀") {
              str2 = "";
              if (typeof str.nature == "string") {
                let natures = str.nature.split(lib.natureSeparator).sort(lib.sort.nature);
                for (let nature of natures) str2 += lib.translate["nature_" + nature] || lib.translate[nature] || "";
              }
              str2 += "杀";
            }
            if (list[str2] && typeof list[str2] == "number") list[str2]++;
            else list[str2] = 1;
          };
          const cardsInfo = Object.entries(list).filter(i => i[1] != 0);
          let resultStr = [];
          for (let i = 0; i < cardsInfo.length; i++) {
            let info = cardsInfo[i];
            resultStr.push(`${info[1]}张<span class="yellowtext">${info[0]}</span>`);
          }
          if (resultStr.length) resultStr = resultStr.join(",");
          return resultStr;
        }
        const list1 = Object.entries(player.storage.jlsg_shenyin_record),
          list2 = Object.entries(lib.skill.jlsg_shenyin.record(player, true));
        let str1 = `神隐记录:`,
          str2 = `<br>当前信息:`;
        for (let i = 0; i < list1.length; i++) {
          let key1 = list1[i][0], value1 = list1[i][1] || "无";
          let key2 = list2[i][0], value2 = list2[i][1] || "无";
          if (typeof value1 != "number" && value1 != "无") {
            if (key1 == "鹰标记牌") value1 = translate(value1, player);
            else value1 = `<span class="yellowtext">${get.translation(value1)}</span>`;
          }
          else value1 = `<span class="yellowtext">${value1}</span>`;
          if (typeof value2 != "number" && value2 != "无") {
            if (key2 == "鹰标记牌") value2 = translate(value2, player);
            else value2 = `<span class="yellowtext">${get.translation(value2)}</span>`;
          }
          else value2 = `<span class="yellowtext">${value2}</span>`;
          str1 += `${key1}为${value1}；`;
          str2 += `${key2}为${value2}；`;
        };
        if (num == 1) return str1.slice(0, -1) + "。";
        else if (num == 2) return str2.slice(0, -1) + "。";
        else return str1 + str2.slice(0, -1) + "。";
      },
      group: ["jlsg_shenyin_dying"],
      subSkill: {
        dying: {
          trigger: { player: "dying" },
          locked: true,
          direct: true,
          async content(event, trigger, player) {
            const num = player.countMark("jlsg_shenyin");
            if (num == 0) return;
            const bool = await player.chooseBool(() => true)
              .set("prompt", `神隐：是否弃置所有“神隐”标标记并恢复至记录状态，然后摸${get.translation(2 * num)}`)
              .set("prompt2", lib.skill.jlsg_shenyin.getInfo(player, 1))
              .forResultBool();
            if (!bool) return;
            await player.logSkill("jlsg_shenyin");
            await player.removeMark("jlsg_shenyin", num);
            await game.delayx();
            const info = player.storage.jlsg_shenyin_record;
            if (player.maxHp != info["体力上限"]) {
              const maxhp = info["体力上限"] - player.maxHp;
              if (maxhp > 0) await player.gainMaxHp(maxhp);
              else await player.loseMaxHp(-maxhp);
            }
            await player.recoverTo(info["体力"]);
            await player.addSkills(info["技能"].filter(i => !player.hasSkill(i)));
            await player.removeGaintag("jlsg_yingshi", player.getCards("h"));
            player.storage.jlsg_yingshi = info["鹰标记牌"];
            await player.useSkill("jlsg_yingshi");
            player.addGaintag(info["鹰标记牌"], "jlsg_yingshi");
            player.storage.jlsg_langxi = info["狼标记牌"];
            await player.draw(2 * num);
          },
        },
      },
    },
    translate: {
      jlsg_yingshi_info: "锁定技,分发起始手牌后，你选择一种基本牌的牌名并随机获得一张，然后将手牌里的所有基本牌标记为“鹰”。每回合每名角色限一次，当你获得其他角色的牌后，若这些牌均为基本牌，你将这些牌标记为“鹰”。任意角色回合结束时，你从所有区域里获得所有“鹰”。你使用“鹰”无距离和次数限制限制。当你使用“鹰”后，你摸一张牌。",
      jlsg_shenyin_info: "锁定技，游戏开始时，你获得1枚「神隐」标记并记录你当前的体力、体力上限、技能、“鹰”和“狼”。回合开始时，若你拥有「神隐」标记，你可以记录你当前的体力、体力上限、技能、“鹰”和“狼”，然后获得1枚「神隐」标记。当你进入濒死状态时，或失去此技能后，若有记录的信息，你可以弃置所有「神隐」标记，将你恢复至记录的状态，并摸两倍弃置标记数的牌。当你杀死其他角色后，你获得一枚「神隐」标记。"
    },
    "delete": ["jlsg_yingshi2", "jlsg_yingshi3"],
  },
  //SK神张角
  jlsgsoul_zhangjiao: {
    jlsg_dianjie: {
      audio: "ext:极略:2",
      trigger: { player: ['phaseDrawBefore', 'phaseUseBefore'] },
      prompt: function (event, player) {
        if (event.name == 'phaseDraw') {
          return '是否发动【电界】跳过摸牌阶段？';
        }
        return '是否发动【电界】跳过出牌阶段？';
      },
      check: function (event, player) {
        if (event.name == 'phaseDraw') {
          if (player.countCards('h') <= 1 || player.hp == 1) return -1;
        } else {
          if (player.countCards('h', function (card) {
            return get.value(card) > 7;
          })) return -1;
          if (player.countCards('h') - player.hp >= 3) return -1;
        }
        return 1;
      },
      content: function () {
        "step 0"
        trigger.finish();
        trigger.untrigger();
        player.judge(function (card) {
          const suit = get.suit(card);
          if (suit == "spade") return 4;
          if (suit == "club") return 2;
          return 0;
        }).judge2 = function (result) {
          return result.bool == false;
        };
        "step 1"
        if (result.suit == "spade") {
          player.chooseTarget('选择一个目标对其造成2点雷电伤害').ai = function (target) {
            return get.damageEffect(target, player, player, 'thunder');
          }
        } else if (result.suit == "club") {
          player.chooseTarget('选择任意个目标将其横置', [1, game.countPlayer()], function (card, player, target) {
            return !target.isLinked();
          }).ai = function (target) {
            return -get.attitude(player, target);
          }
          event.goto(3);
        }
        else event.finish();
        'step 2'
        if (result.bool) {
          player.line(result.targets[0], 'thunder');
          result.targets[0].damage('thunder', 2);
        }
        event.finish();
        'step 3'
        if (result.bool) {
          player.line(result.targets, 'thunder');
          for (var i = 0; i < result.targets.length; i++) {
            result.targets[i].link();
          }
        }
      }
    },
    translate: {
      jlsg_dianjie_info: '你可以跳过你的摸牌阶段或出牌阶段,然后判定:若结果为黑桃,你对一名角色造成2点雷电伤害;若结果为梅花,你令任意名武将牌未横置的角色将其武将牌横置.',
    },
  },
  //SP神张角
  jlsgsoul_sp_zhangjiao: {
    jlsg_yinyang_s: {
      audio: "ext:极略:2",
      derivation: ['jlsg_jiyang', 'jlsg_jiyin', 'jlsg_xiangsheng'],
      forced: true,
      charlotte: true,
      unique: true,
      trigger: {
        player: ['showCharacterEnd', 'changeHpAfter', 'gainMaxHpAfter', 'loseMaxHpAfter'],
      },
      delay: false,
      init: function (player) {
        if (player.hasSkill('jlsg_yinyang_s')) {
          player.useSkill('jlsg_yinyang_s');
        };
      },
      onremove: true,
      filter: function (event, player) {
        let skill = lib.skill.jlsg_yinyang_s.getCurrentSkill(player);
        return !player.hasSkill(skill, null, false, false) || player.isTempBanned(skill);
      },
      async content(event, trigger, player) {
        const skill = lib.skill.jlsg_yinyang_s.getCurrentSkill(player);
        await player.changeSkills([skill], [player.storage.jlsg_yinyang_s].filter(i => i));
        game.broadcastAll((player, skill) => { player.storage.jlsg_yinyang_s = skill; }, player, skill);
      },
      getCurrentSkill(player) {
        let diff = player.hp - player.getDamagedHp();
        if (diff > 0) return 'jlsg_jiyang';
        else if (diff < 0) return 'jlsg_jiyin';
        else return 'jlsg_xiangsheng';
      },
    },
    jlsg_jiyang: {
      audio: "ext:极略:2",
      sub: true,
      unique: true,
      thundertext: true,
      init: function (player) {
        player.addMark('jlsg_jiyang', 3);
      },
      onremove(player, skill) {
        let cards = [], num = player.storage[skill];
        player.clearMark(skill);
        while (num > 0) {
          let card = get.cardPile(function (card) {
            if (cards.includes(card)) return false;
            return get.color(card, false) == "red";
          });
          num--;
          if (card) cards.add(card);
          else break;
        }
        if (cards.length) player.gain(cards, 'gain2');
      },
      marktext: '阳',
      intro: {
        name: '阳',
        content: 'mark',
      },
      trigger: {
        player: 'loseAfter',
        global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
      },
      filter: function (event, player) {
        if (!player.countMark('jlsg_jiyang')) return false;
        var evt = event.getl(player);
        if (!evt || !evt.cards2 || !evt.cards2.length) return false;
        for (var i of evt.cards2) {
          if (get.color(i, player) == 'red') return true;
        }
        return false;
      },
      async cost(event, trigger, player) {
        event.result = await player.chooseTarget(get.prompt("jlsg_jiyang"))
          .set('prompt2', '令一名角色回复1点体力,若其未受伤则改为加1点体力上限.')
          .set('ai', target => {
            var player = get.player();
            var eff = get.attitude(player, target);
            eff = 2 * Math.atan(eff);
            if (!target.isHealthy()) {
              eff = get.recoverEffect(target, player, player);
            }
            return eff - 0.5 + Math.random();
          }).forResult();
      },
      async content(event, trigger, player) {
        player.removeMark(event.name);
        const target = event.targets[0];
        if (player.ai.shown < target.ai.shown) {
          player.addExpose(0.2);
        }
        if (target.isHealthy()) await target.gainMaxHp();
        else await target.recover(player);
      },
    },
    jlsg_jiyin: {
      audio: "ext:极略:2",
      sub: true,
      unique: true,
      thundertext: true,
      init: function (player) {
        player.addMark('jlsg_jiyin', 3);
      },
      onremove(player, skill) {
        let cards = [], num = player.storage[skill];
        player.clearMark(skill);
        while (num > 0) {
          let card = get.cardPile(function (card) {
            if (cards.includes(card)) return false;
            return get.color(card, false) == "black";
          });
          num--;
          if (card) cards.add(card);
          else break;
        }
        if (cards.length) player.gain(cards, 'gain2');
      },
      marktext: '阴',
      intro: {
        name: '阴',
        content: 'mark',
      },
      trigger: {
        player: 'loseAfter',
        global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
      },
      filter: function (event, player) {
        if (!player.countMark('jlsg_jiyin')) return false;
        var evt = event.getl(player);
        if (!evt || !evt.cards2 || !evt.cards2.length) return false;
        for (var i of evt.cards2) {
          if (get.color(i, player) == 'black') return true;
        }
        return false;
      },
      async cost(event, trigger, player) {
        event.result = await player.chooseTarget(get.prompt("jlsg_jiyin"))
          .set('prompt2', '对一名角色造成1点雷电伤害,若其已受伤则改为减1点体力上限.')
          .set('ai', target => {
            var player = get.player();
            var eff = get.attitude(player, target);
            eff = -2 * Math.atan(eff);
            if (target.isHealthy()) {
              eff = get.damageEffect(target, player, player, 'thunder');
            }
            return eff - 0.5 + Math.random();
          }).forResult();
      },
      async content(event, trigger, player) {
        player.removeMark(event.name);
        const target = event.targets[0];
        if (player.ai.shown < target.ai.shown) {
          player.addExpose(0.2);
        }
        if (target.isHealthy()) await target.damage('thunder', player);
        else await target.loseMaxHp();
      },
    },
    jlsg_xiangsheng: {
      audio: "ext:极略:2",
      sub: true,
      unique: true,
      thundertext: true,
      init: function (player) {
        player.addMark('jlsg_xiangsheng', 6);
      },
      onremove(player, skill) {
        let num = player.storage[skill];
        player.clearMark(skill);
        if (num > 0) player.draw(num);
      },
      marktext: '生',
      intro: {
        name: '生',
        content: 'mark',
      },
      trigger: {
        player: 'loseAfter',
        global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
      },
      getIndex(event, player) {
        const colors = [],
          evt = event.getl(player);
        for (let i of evt.cards2) {
          let color = get.color(i, player);
          if (color == 'black') colors.add('red');
          if (color == 'red') colors.add('black');
        };
        return colors;
      },
      filter: function (event, player, triggername, color) {
        if (!player.countMark('jlsg_xiangsheng') || !color) return false;
        return true;
      },
      frequent: true,
      async cost(event, trigger, player) {
        const { indexedData: color } = event;
        event.result = player.chooseBool(get.prompt("jlsg_xiangsheng"))
          .set('prompt2', `你可以摸一张${lib.translate[color]}牌`)
          .set('frequentSkill', "jlsg_xiangsheng")
          .forResult();
      },
      async content(event, trigger, player) {
        const { indexedData: color } = event;
        player.removeMark(event.name);
        const card = get.cardPile2(function (card) {
          return get.color(card, false) == color;
        });
        if (card) await player.gain(card, 'gain2');
      },
    },
    translate: {
      jlsg_jiyang_info: '锁定技,获得此技能时,你获得3枚「阳」标记;失去此技能时,你弃置所有「阳」标记并从牌堆中获得等量红色牌;当你失去红色牌后,你可以弃置1枚「阳」标记令一名角色回复1点体力,若其未受伤则改为加1点体力上限.',
      jlsg_jiyin_info: '锁定技,获得此技能时,你获得3枚「阴」标记;失去此技能时,你弃置所有「阴」标记并从牌堆中获得等量黑色牌;当你失去黑色牌后,你可以弃置1枚「阴」标记对一名角色造成1点雷电伤害,若其已受伤则改为减1点体力上限.',
      jlsg_xiangsheng_info: '锁定技,获得此技能时,你获得6枚「生」标记;失去此技能时,你弃置所有「生」标记并摸等量的牌;当你失去黑色/红色牌后,你可以弃置1枚「生」标记并摸一张红色/黑色牌.',
    },
  },
  //SK神张飞
  jlsgsoul_zhangfei: {
    jlsg_shayi: {
      audio: "ext:极略:4",
      mod: {
        targetInRange(card) {
          if (card.name === 'sha') return true;
        },
        cardUsable(card) {
          if (card.name === 'sha') return Infinity;
        },
      },
      enable: "chooseToUse",
      filter(event, player) {
        return player.isPhaseUsing() && player.hasCard(card => card.hasGaintag('jlsg_shayi'));
      },
      filterCard(card, player) {
        return card.hasGaintag('jlsg_shayi');
      },
      position: "hs",
      log: false,
      viewAs: { name: "sha" },
      viewAsFilter(player) {
        if (!player.countCards('hs', card => {
          return card.hasGaintag('jlsg_shayi');
        })) return false;
      },
      prompt: "将一张“杀意”牌当【杀】使用",
      check: (card) => get.value(card) < 7.5,
      precontent: function () {
        player.logSkill("jlsg_shayi");
        player.draw();
      },
      ai: {
        skillTagFilter(player) {
          if (!player.countCards('hes', card => {
            return card.hasGaintag('jlsg_shayi');
          })) return false;
        },
        respondSha: true,
        yingbian: function (card, player, targets, viewer) {
          if (get.attitude(viewer, player) <= 0) return 0;
          var base = 0, hit = false;
          if (get.cardtag(card, 'yingbian_hit')) {
            hit = true;
            if (targets.some(target => {
              return target.mayHaveShan(viewer, 'use', target.getCards('h', i => {
                return i.hasGaintag('sha_notshan');
              })) && get.attitude(viewer, target) < 0 && get.damageEffect(target, player, viewer, get.natureList(card)) > 0;
            })) base += 5;
          }
          if (get.cardtag(card, 'yingbian_add')) {
            if (game.hasPlayer(function (current) {
              return !targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && get.effect(current, card, player, player) > 0;
            })) base += 5;
          }
          if (get.cardtag(card, 'yingbian_damage')) {
            if (targets.some(target => {
              return get.attitude(player, target) < 0 && (hit || !target.mayHaveShan(viewer, 'use', target.getCards('h', i => {
                return i.hasGaintag('sha_notshan');
              })) || player.hasSkillTag('directHit_ai', true, {
                target: target,
                card: card,
              }, true)) && !target.hasSkillTag('filterDamage', null, {
                player: player,
                card: card,
                jiu: true,
              })
            })) base += 5;
          }
          return base;
        },
        canLink: function (player, target, card) {
          if (!target.isLinked() && !player.hasSkill('wutiesuolian_skill')) return false;
          if (player.hasSkill('jueqing') || player.hasSkill('gangzhi') || target.hasSkill('gangzhi')) return false;
          return true;
        },
        basic: {
          useful: [5, 3, 1],
          value: [5, 3, 1],
        },
        order(item, player) {
          let res = 3.2;
          if (player.hasSkillTag('presha', true, null, true)) res = 10;
          if (typeof item !== 'object' || !game.hasNature(item, 'linked') || game.countPlayer(cur => cur.isLinked()) < 2) return res;
          let uv = player.getUseValue(item, true);
          if (uv <= 0) return res;
          let temp = player.getUseValue('sha', true) - uv;
          if (temp < 0) return res + 0.15;
          if (temp > 0) return res - 0.15;
          return res;
        },
        result: {
          player: function (player) {
            var cards = player.getCards('hs', card => {
              return get.value(card) < 7.5 && card.hasGaintag('jlsg_shayi');
            });
            if (cards) return 1;
            else return 0;
          },
          target: function (player, target, card, isLink) {
            let eff = -1.5, odds = 1.35, num = 1;
            if (isLink) {
              let cache = _status.event.getTempCache('sha_result', 'eff');
              if (typeof cache !== 'object' || cache.card !== get.translation(card)) return eff;
              if (cache.odds < 1.35 && cache.bool) return 1.35 * cache.eff;
              return cache.odds * cache.eff;
            }
            if (player.hasSkill('jiu') || player.hasSkillTag('damageBonus', true, {
              target: target,
              card: card
            })) {
              if (target.hasSkillTag('filterDamage', null, {
                player: player,
                card: card,
                jiu: true,
              })) eff = -0.5;
              else {
                num = 2;
                if (get.attitude(player, target) > 0) eff = -7;
                else eff = -4;
              }
            }
            if (!player.hasSkillTag('directHit_ai', true, {
              target: target,
              card: card,
            }, true)) odds -= 0.7 * target.mayHaveShan(player, 'use', target.getCards('h', i => {
              return i.hasGaintag('sha_notshan');
            }), 'odds');
            _status.event.putTempCache('sha_result', 'eff', {
              bool: target.hp > num && get.attitude(player, target) > 0,
              card: get.translation(card),
              eff: eff,
              odds: odds
            });
            return odds * eff;
          },
        },
        tag: {
          respond: 1,
          respondShan: 1,
          damage: function (card) {
            if (game.hasNature(card, 'poison')) return;
            return 1;
          },
          natureDamage: function (card) {
            if (game.hasNature(card, 'linked')) return 1;
          },
          fireDamage: function (card, nature) {
            if (game.hasNature(card, 'fire')) return 1;
          },
          thunderDamage: function (card, nature) {
            if (game.hasNature(card, 'thunder')) return 1;
          },
          poisonDamage: function (card, nature) {
            if (game.hasNature(card, 'poison')) return 1;
          },
        },
      },
      group: 'jlsg_shayi_mark',
      subSkill: {
        mark: {
          audio: 'jlsg_shayi',
          trigger: {
            player: ["phaseUseBegin", "phaseUseAfter"],
          },
          filter: () => true,
          forced: true,
          popup: false,
          async content(event, trigger, player) {
            if (event.triggername == "phaseUseBegin") {
              await player.logSkill('jlsg_shayi');
              await player.draw();
              let cards = player.getCards('h', { color: 'black' });
              if (cards.length) player.addGaintag(cards, 'jlsg_shayi');
            }
            else {
              let cards = player.getCards('hs', card => {
                return card.hasGaintag('jlsg_shayi');
              });
              if (cards) await player.removeGaintag('jlsg_shayi', cards);
            }
          },
        }
      },
    },
    jlsg_zhenhun: {
      audio: "ext:极略:true",
      enable: "phaseUse",
      usable: 1,
      selectTarget: -1,
      content: function () {
        var targets = game.filterPlayer(i => i != player);
        for (var i of targets) i.addTempSkill('jlsg_zhenhun_debuff', "phaseUseAfter");
      },
      ai: {
        order: 10,
        result: {
          player: function (player) {
            let eff, num = 0, targets = game.filterPlayer(i => i != player);
            for (let i of targets) {
              let skills = i.getSkills(null, false, false).filter(i => get.is.locked(i) && !i.charlotte && !i.persevereSkill).length;
              if (get.attitude(i, player) > 0) eff = 1;
              else eff = -1
              num += ((skills ? skills : 1) * eff);
            }
            if (num > 0) return 1;
            else return 0
          },
          target: -1,
        },
        threaten: 1.3,
      },
      subSkill: {
        debuff: {
          mod: {
            cardEnabled: function (card, player) {
              if (player != _status.event.dying && card.name == 'tao') return false;
            },
            cardSavable: function (card, player) {
              if (player != _status.event.dying && card.name == 'tao') return false;
            },
          },
          init: function (player, skill) {
            player.addSkillBlocker(skill);
          },
          onremove: function (player, skill) {
            player.removeSkillBlocker(skill);
          },
          charlotte: true,
          skillBlocker: function (skill, player) {
            if (!lib.skill[skill]) return false;
            return !lib.skill[skill].charlotte && !lib.skill[skill].persevereSkill && !get.is.locked(skill, player);
          },
          mark: true,
          intro: {
            content: function (storage, player, skill) {
              var list = player.getSkills(null, false, false).filter(function (i) {
                return lib.skill.jlsg_zhenhun_mark.skillBlocker(i, player);
              });
              if (list.length) return '你不处于濒死时不能使用【桃】<br>失效技能：' + get.translation(list);
              return '你不处于濒死时不能使用【桃】';
            },
          },
          sub: true,
          sourceSkill: "jlsg_zhenhun",
        },
      },
    },
    translate: {
      jlsg_shayi_info: "锁定技，出牌阶段开始时，你摸一张牌并标记手牌里的黑色牌，你与此阶段内可以将这些牌当【杀】使用，然后摸一张牌。你使用【杀】无距离和次数限制。",
      jlsg_zhenhun_info: "出牌阶段限一次，你可以令所有其他角色的非锁定技于此阶段内无效，且不处于濒死状态的这些角色不能使用【桃】",
    },
  },
  //SK神赵云
  jlsgsoul_zhaoyun: {
    jlsg_juejing: {
      audio: "ext:极略:2",
      mod: {
        maxHandcardBase: (player) => player.maxHp,
      },
      init(player) {
        if (player.hp > 1 && (game.phaseNumber == 0 || player.phaseNumber == 0)) {
          player.hp = 1;
          player.update();
        }
      },
      trigger: {
        global: "phaseBefore",
        player: ["changeHpAfter", "enterGame"],
      },
      filter: (event, player) => (event.name != 'phase' || game.phaseNumber == 0) || player.hp > 1,
      forced: true,
      popup: false,
      content: () => {
        if (player.hp > 1) {
          player.logSkill('jlsg_juejing');
          player.hp = 1;
          player.update();
        }
      },
      ai: {
        effect: {
          target: function (card, player, target) {
            if (get.tag(card, 'recover') && target.hp > 0) {
              if (player.hasSkill('jlsg_longhun') && card.cards.length == 2) return [1, 2];
              return 0;
            };
          },
        },
      },
      group: 'jlsg_juejing_draw',
      subSkill: {
        draw: {
          audio: "jlsg_juejing",
          trigger: {
            player: ["dying", "dyingAfter"],
          },
          forced: true,
          content: () => { player.draw(2) },
          ai: {
            maixie: true,
            maixue_hp: true,
            skillTagFilter: function (player) {
              if (player.hasSkill('jlsg_longhun')) return player.hasCard(card => {
                return get.suit(card, player) == 'heart' || get.tag(card, 'save');
              }, 'hes');
              return player.hasCard(card => get.tag(card, 'save'), 'hes');
            },
            effect: {
              target: function (card, player, target) {
                if (get.tag(card, 'damage')) {
                  if (get.attitude(player, target) > 0) return;
                  return [1, 2];
                }
              },
            },
          },
        },
      },
    },
    jlsg_longhun: {
      audio: "ext:极略:4",
      mod: {
        aiValue(player, card, num) {
          if (!card || card.cards && card.cards.length != 1) return;
          const cn = player.countCards("hse", i => get.tag(i, "save") || get.suit(i, player) == "heart");
          if ((player.isPhaseUsing() ? true : cn > 0) && card.name == "shan") return num - 2;
        },
        aiUseful(player, card, num) {
          if (!card || card.cards && card.cards.length != 1) return;
          if (get.suit(card, player) == "heart") return num + 2;
          const cn = player.countCards("hse", i => get.tag(i, "save") || get.suit(i, player) == "heart");
          if (cn > 0 && card.name == "shan") return num - 2;
        },
      },
      locked: false,
      enable: ["chooseToUse", "chooseToRespond"],
      prompt: "将♦牌当做杀，♥牌当做桃，♣牌当做闪，♠牌当做无懈可击使用或打出",
      viewAs(cards, player) {
        if (cards.length) {
          var name = false, nature = null;
          switch (get.suit(cards[0], player)) {
            case 'club': name = 'shan'; break;
            case 'diamond': name = 'sha'; nature = 'fire'; break;
            case 'spade': name = 'wuxie'; break;
            case 'heart': name = 'tao'; break;
          }
          if (name) return { name: name, nature: nature };
        }
        return null;
      },
      check(card) {
        const event = get.event(), player = get.player();
        const value = function (cardx, player) {
          if (Array.isArray(cardx)) return cardx.reduce((t, v) => t + value(v), 0);
          return get[get.type(cardx, null, player) != "equip" ? "value" : "equipValue"](cardx, player)
        };
        const map = { sha: "diamond", shan: "club", tao: "heart", wuxie: "spade" },
          map2 = { diamond: "sha", club: "shan", heart: "tao", spade: "wuxie" };
        const cards = ui.selected.cards;
        const val1 = cards.length ? value(cards[0], player) : undefined,
          val2 = value(card, player);
        const val = val1 ? (val1 + val2) / 2 : val2;
        var suit = cards.length ? get.suit(cards[0], player) : null;
        if (!suit) {
          var max = 0;
          for (var name in map) {
            if (!event._backup.filterCard(get.autoViewAs({ name: name, nature: name == "sha" ? "fire" : null }, 'unsure'), player, event)) continue;
            if (!player.countCards("hes", i => get.suit(i, player) == map[name])) continue;
            var temp = name == "wuxie" ? 2 : name == "shan" ? 3 : get.order({ name: name, nature: name == "sha" ? "fire" : null }, player);
            if (temp <= max) continue;
            suit = map[name];
            max = temp;
          };
          if (!suit) return 0;
        }
        const hes = player.getCards("hes", i => {
          if (cards.length && i == cards[0]) return false;
          return get.suit(i, player) == suit;
        }).sort((a, b) => value(a, player) - value(b, player));
        var filter = hes[0] == card;
        if (cards.length) {
          if (event.name != 'chooseToUse') return 0;
          if (suit == "club") {
            const evt = event.getParent();
            if (evt && evt.player) filter = get.attitude(player, evt.player) <= 0 && evt.player.countCards("he");
          }
          else if (suit == "heart") {
            if (player.countCards("hse", i => get.tag(i, "save") || get.suit(i, player) == "heart") < 3) return 0;
            if (event.getTrigger() && event.getTrigger().player && event.getTrigger().player != player) filter = val2 < 8;
            else filter = player.isPhaseUsing() ? player.needsToDiscard() : player.hp > -1;
          }
          else if (suit == "spade") {
            if (event.getParent(4).name == "phaseJudge") return 0;
            if (event.getTrigger() && event.getTrigger().card && event.getTrigger().card.cards.length) filter = val1 + val2 <= value(event.getTrigger().card.cards, player);
          }
          else filter = player.getUseValue({ name: "sha", nature: "fire" }) > 0;
        }
        if (!cards.length && suit == "heart") return hes[0] == card;
        if (cards.length && suit == "spade") return filter && hes[0] == card;
        return filter && hes[0] == card && val <= get.value({ name: map2[suit] }, player);
      },
      selectCard: [1, 2],
      complexCard: true,
      position: "hes",
      filter(event, player) {
        var filter = event.filterCard;
        if (filter(get.autoViewAs({ name: 'sha', nature: 'fire' }, 'unsure'), player, event) && player.countCards('hes', { suit: 'diamond' })) return true;
        if (filter(get.autoViewAs({ name: 'shan' }, 'unsure'), player, event) && player.countCards('hes', { suit: 'club' })) return true;
        if (filter(get.autoViewAs({ name: 'tao' }, 'unsure'), player, event) && player.countCards('hes', { suit: 'heart' })) return true;
        if (filter(get.autoViewAs({ name: 'wuxie' }, 'unsure'), player, event) && player.countCards('hes', { suit: 'spade' })) return true;
        return false;
      },
      filterCard(card, player, event) {
        if (ui.selected.cards.length) return get.suit(card, player) == get.suit(ui.selected.cards[0], player);
        event = event || get.event();
        var filter = event._backup.filterCard;
        var name = get.suit(card, player);
        if (name == 'club' && filter(get.autoViewAs({ name: 'shan' }, 'unsure'), player, event)) return true;
        if (name == 'diamond' && filter(get.autoViewAs({ name: 'sha', nature: 'fire' }, 'unsure'), player, event)) return true;
        if (name == 'spade' && filter(get.autoViewAs({ name: 'wuxie' }, 'unsure'), player, event)) return true;
        if (name == 'heart' && filter(get.autoViewAs({ name: 'tao' }, 'unsure'), player, event)) return true;
        return false;
      },
      hiddenCard(player, name) {
        if (name == 'wuxie' && _status.connectMode && player.countCards('hs') > 0) return true;
        var suit;
        switch (name) {
          case "sha": suit = "diamond"; break;
          case "shan": suit = "club"; break;
          case "tao": suit = "heart"; break;
          case "wuxie": suit = "spade"; break;
          default: suit = undefined; break;
        };
        if (name) return player.countCards('hes', { suit: suit }) > 0;
      },
      ai: {
        respondSha: true,
        respondShan: true,
        skillTagFilter(player, tag) {
          var name;
          switch (tag) {
            case 'respondSha': name = 'diamond'; break;
            case 'respondShan': name = 'club'; break;
            case 'save': name = 'heart'; break;
          }
          if (!player.countCards('hes', { suit: name })) return false;
        },
        order(item, player) {
          const event = get.event();
          if (player && (event.name == 'chooseToUse')) {
            var max = 0;
            const map = { sha: "diamond", shan: "club", tao: "heart" };
            for (var name in map) {
              if (!event.filterCard(get.autoViewAs({ name: name, nature: name == "sha" ? "fire" : null }, 'unsure'), player, event)) continue;
              if (!player.countCards("hes", i => get.suit(i, player) == map[name])) continue;
              var temp = get.order({ name: name, nature: name == 'sha' ? 'fire' : null });
              if (temp > max) max = temp;
            }
            if (max > 0) return max * 1.2;
          }
          return 2;
        },
      },
      group: ['jlsg_longhun_effect'],
      subSkill: {
        effect: {
          trigger: { player: 'useCard' },
          forced: true,
          popup: false,
          filter(event) {
            return event.skill == 'jlsg_longhun' && event.cards && event.cards.length == 2;
          },
          content() {
            switch (trigger.card.name) {
              case 'tao':
                trigger.targets.forEach(p => p.gainMaxHp());
                break;
              case 'sha':
                trigger.effectCount += 2;
                break;
              case 'shan':
                if (trigger.respondTo && trigger.respondTo[0].isIn()) trigger.respondTo[0].randomDiscard(2, "he");
                break;
              case 'wuxie':
                trigger.directHit.addArray(game.players);
                player.when({ global: 'eventNeutralized' })
                  .then(() => {
                    if (game.hasGlobalHistory('everything', evt => {
                      if (evt._neutralized || evt.responded && (!evt.result || !evt.result.bool)) {
                        if (evt.getParent().card == trigger.card) return true;
                      }
                      return false;
                    })) {
                      var cards = trigger.cards.filterInD('od');
                      if (cards) player.gain(cards, 'gain2');
                    }
                  });
                break;
            };
          },
        },
      },
    },
    "delete": ["jlsg_longhun1", "jlsg_longhun2", "jlsg_longhun3", "jlsg_longhun4", "jlsg_longhun_sp"],
  },
  //SK神郭嘉
  jlsgsoul_guojia: {
    jlsg_tianqi: {
      audio: "ext:极略:2",
      enable: ['chooseToUse', 'chooseToRespond'],
      hiddenCard: function (player, name) {
        if (!lib.inpile.includes(name)) return false;
        if (player.isDying()) return false;
        let type = get.type(name);
        if (!["basic", "trick"].includes(type)) return false;
        if (player.isPhaseUsing() && get.event().type == "phase") {
          let basic = (player.storage?.jlsg_tianqi_used?.basic) ?? false,
            trick = (player.storage?.jlsg_tianqi_used?.trick) ?? false;
          return type == "basic" && !basic || type == "trick" && !trick;
        }
        return true;
      },
      filter: function (event, player) {
        if (player.isDying()) return false;
        let basic = (player.storage?.jlsg_tianqi_used?.basic) ?? false,
          trick = (player.storage?.jlsg_tianqi_used?.trick) ?? false;
        if (player.isPhaseUsing() && get.event().type == "phase" && basic && trick) return false;
        for (let i of lib.inpile) {
          let type = get.type(i);
          if (!["basic", "trick"].includes(type)) continue;
          if (get.event().type == "phase") {
            if (type == "basic" && basic) continue;
            else if (type == "trick" && trick) continue;
          }
          if (i == 'sha') {
            for (let j of lib.inpile_nature) {
              if (event.filterCard({ name: i, nature: j }, player, event)) return true;
            };
          }
          else if ((type == 'basic' || type == 'trick') && event.filterCard({ name: i }, player, event)) return true;
        };
        return false;
      },
      direct: true,
      chooseButton: {
        dialog: function (event, player) {
          let list1 = [],
            list2 = [],
            basic = (player.storage?.jlsg_tianqi_used?.basic) ?? false,
            trick = (player.storage?.jlsg_tianqi_used?.trick) ?? false;
          for (let i of lib.inpile) {
            let type = get.type(i);
            if (!["basic", "trick"].includes(type)) continue;
            if (player.isPhaseUsing() && get.event().type == "phase") {
              if (type == "basic" && basic) continue;
              else if (type == "trick" && trick) continue;
            }
            if (type == 'basic') {
              if (i == 'sha') {
                let natures = lib.inpile_nature.concat([null])
                for (let j of natures) {
                  if (event.filterCard({ name: i, nature: j }, player, event)) list1.push([type, '', i, j]);
                };
              }
              else if (event.filterCard({ name: i }, player, event)) list1.push([type, '', i]);
            }
            if (type == 'trick') {
              if (event.filterCard({ name: i }, player, event)) list2.push([type, '', i]);
            }
          }
          let dialog = ui.create.dialog();
          if (list1.length) {
            dialog.add('基本牌');
            dialog.add([list1, 'vcard']);
          }
          if (list2.length) {
            dialog.add('锦囊牌');
            dialog.add([list2, 'vcard']);
          }
          return dialog;
        },
        filter: function (button, player) {
          var evt = get.event().getParent();
          return evt.filterCard({ name: button.link[2], nature: button.link[3] }, player, evt);
        },
        check: function (button, buttons) {
          var player = get.player();
          var card = { name: button.link[2], nature: button.link[3] };
          var knowHead = _status.pileTop?.isKnownBy(player);
          var event = get.event().getParent();
          var val = get.event().type == "phase" ? player.getUseValue(card) / 10 : 3;
          if (val > 0 && !get.event().type == "phase" && (get.tag(event.getParent(), 'damage') && event.getParent().name != 'juedou') && !player.countCards('h', { name: button.link[2] })
            && (!knowHead || get.type(ui.cardPile.firstChild, 'trick') == get.type(button.link[2], "trick") || event.getParent().baseDamage > 1)) {
            return val;
          }
          var loseHpEffect = lib.jlsg.getLoseHpEffect(player);
          if (!knowHead) {
            loseHpEffect /= 2;
          } else {
            if (get.type(_status.pileTop, 'trick') == get.type(button.link[2], "trick")) {
              loseHpEffect = 0;
            }
          }
          return val + loseHpEffect;
        },
        backup: function (links, player) {
          var tianqiOnUse = function (result, player) {
            if (player.isPhaseUsing() && get.event().type == "phase") {
              player.addTempSkill('jlsg_tianqi_used', 'phaseUseAfter');
              player.storage.jlsg_tianqi_used[get.type(result.card, "trick", false)] = true;
            }
            player.logSkill('jlsg_tianqi');
            game.log(player, '声明了' + get.translation(links[0][0]) + '牌');
            var cards = get.cards(1);
            player.showCards(cards);
            result.cards = cards;
            result.card.cards = cards;
            if (get.type(cards[0], 'trick') != links[0][0]) {
              player.loseHp();
              result.card.isCard = false;
            }
          };
          return {
            filterCard: () => false,
            selectCard: -1,
            popname: true,
            viewAs: {
              name: links[0][2],
              nature: links[0][3],
              isCard: false,
            },
            onuse: tianqiOnUse,
            onrespond: tianqiOnUse
          }
        },
        prompt: function (links, player) {
          return '亮出牌堆顶的一张牌,并将此牌当' + get.translation(links[0][2]) + '使用或打出.若亮出的牌不为' + get.translation(links[0][0]) + '牌,你须先失去1点体力.(你的出牌阶段每个类别限一次.)';
        },
      },
      ai: {
        order: 10,
        fireAttack: true,
        respondShan: true,
        respondSha: true,
        skillTagFilter: function (player, tag, arg) {
          if (player.isDying()) return false;
          let basic = (player.storage?.jlsg_tianqi_used?.basic) ?? false,
            trick = (player.storage?.jlsg_tianqi_used?.trick) ?? false;
          if (player.isPhaseUsing()) return !basic || !trick;
        },
        result: {
          player: function (player) {
            if (get.event().dying) return get.attitude(player, get.event().dying);
            var knowHead = _status.pileTop?.isKnownBy(player);
            if (knowHead) return 1;
            if (!knowHead) {
              if (Math.random() < 0.67) return 0.5;
              return get.effect(player, { name: "losehp" }, player, player) * Math.random();
            }
          },
        },
        threaten: 4,
      },
      subSkill: {
        used: {
          temp: true,
          charlotte: true,
          init(player) {
            player.storage.jlsg_tianqi_used = {};
          },
          onremove: true,
        },
      },
    },
    jlsg_tianji: {
      audio: "ext:极略:1",
      trigger: { global: 'phaseUseBegin' },
      frequent: true,
      filter: function (event, player) {
        if (!_status.pileTop) return false;
        return true;
      },
      async content(event, trigger, player) {
        const cards = get.cards(3);
        if (!cards.length) return;
        await game.cardsGotoOrdering(cards);
        const { result } = await player.chooseToMove_new()
          .set("list", [["牌堆顶", cards], ["获得的牌"]])
          .set("prompt", "天机：请选择获得至多一张牌，并可以改变其余牌的顺序")
          .set("filterMove", function (from, to, moved) {
            if (to == 1) return moved[1].length < 1;
            return true;
          })
          .set("processAI", function (list) {
            let top = list[0][1],
              player = _status.event.player,
              target = _status.currentPhase || player,
              gain = [];
            top.sort((a, b) => {
              if (get.attitude(player, target) > 1) return get.value(b, target) - get.value(a, target);
              return get.value(a, target) - get.value(b, target);
            });
            if (get.attitude(player, target) > 1) {
              if (player.getUseValue(top[0]) >= target.getUseValue(top[0])) gain.push(top.shift());
            }
            else if (get.value(top[top.length - 1], target) > 6) gain.push(top.pop());
            return [top, gain];
          });
        let top = cards,
          gain;
        if (result.bool) {
          top = result.moved[0],
            gain = result.moved[1];
        }
        top.reverse();
        for (let i = 0; i < top.length; i++) {
          ui.cardPile.insertBefore(top[i], ui.cardPile.firstChild);
        }
        game.addCardKnower(top, player);
        if (gain?.length) await player.gain(gain, "draw");
        game.updateRoundNumber();
        await game.delayx();
      },
    },
    translate: {
      jlsg_tianqi_info: "出牌阶段基本牌和非延时锦囊牌各限一次，或当你于濒死状态外需要使用或打出基本牌或非延时锦囊牌时，你可以将牌堆顶牌当此牌使用或打出，若转化前后的牌类别不同，你于此牌结算前失去1点体力。",
      jlsg_tianji_info: "任意角色的出牌阶段开始时，你可以观看牌堆顶的三张牌，然后你可以获得其中至多一张牌并改变其余牌的顺序。",
    },
    "delete": ["jlsg_tianqi_wuxie", "jlsg_tianqi_shan", "jlsg_tianqi_phase"],
  },
  //SK神诸葛亮
  jlsgsoul_zhugeliang: {
    jlsg_qixing: {
      audio: "ext:极略:1",
      mark: true,
      marktext: '星',
      intro: {
        mark: function (dialog, content, player) {
          var content = player.getExpansions('jlsg_qixing');
          if (content && content.length) {
            if (player == game.me || player.isUnderControl()) {
              dialog.add(content);
            } else {
              return '共有' + get.cnNumber(content.length) + '张「星」';
            }
          }
        },
      },
      mod: {
        maxHandcard: function (player, num) {
          return num + player.getExpansions("jlsg_qixing").length;
        },
      },
      trigger: {
        global: 'gameDrawAfter',
      },
      forced: true,
      filter() {
        return true;
      },
      async content(event, trigger, player) {
        player.directgain(get.cards(7));
        if (player == game.me) {
          game.addVideo('delay', null);
        }
        let num = Math.min(player.countCards("h"), 7);
        if (num == 0) return;
        const { result } = await player.chooseCard(`七星：选择至少${get.cnNumber(num)}张牌作为「星」`, [num, player.countCards("h")], true)
          .set("ai", function (card) {
            return _status.event.player.hasValueTarget(card) && get.value(card) > 8;
          });
        if (result.bool) {
          await player.addToExpansion(result.cards, player, 'giveAuto').set("gaintag", ["jlsg_qixing"]);
        }
      },
      group: ['jlsg_qixing2'],
    },
    jlsg_qixing2: {
      trigger: {
        player: "phaseDrawAfter",
      },
      direct: true,
      sourceSkill: "jlsg_qixing",
      filter(event, player) {
        return player.getExpansions("jlsg_qixing").length > 0 && player.countCards("h") > 0;
      },
      content() {
        "step 0";
        var cards = player.getExpansions("jlsg_qixing");
        if (!cards.length || !player.countCards("h")) {
          event.finish();
          return;
        }
        var next = player.chooseToMove("七星：是否交换“星”和手牌？");
        next.set("list", [
          [get.translation(player) + "（你）的星", cards],
          ["手牌区", player.getCards("h")],
        ]);
        next.set("filterMove", function (from, to) {
          return typeof to != "number";
        });
        next.set("processAI", function (list) {
          var player = _status.event.player,
            cards = list[0][1].concat(list[1][1]).sort(function (a, b) {
              return get.value(a) - get.value(b);
            }),
            cards2 = cards.splice(0, player.getExpansions("jlsg_qixing").length);
          return [cards2, cards];
        });
        "step 1";
        if (result.bool) {
          var pushs = result.moved[0],
            gains = result.moved[1];
          pushs.removeArray(player.getExpansions("jlsg_qixing"));
          gains.removeArray(player.getCards("h"));
          if (!pushs.length || pushs.length != gains.length) return;
          player.logSkill("jlsg_qixing", null, null, null, ["ext:极略/jlsg_qixing2.mp3"]);
          player.addToExpansion(pushs, player, "giveAuto").gaintag.add("jlsg_qixing");
          player.gain(gains, "draw");
        }
      },
    },
    jlsg_kuangfeng: {
      audio: "ext:极略:2",
      trigger: { player: 'phaseZhunbeiBegin' },
      direct: true,
      filter: function (event, player) {
        return player.getExpansions('jlsg_qixing').length;
      },
      async content(event, trigger, player) {
        const { result: chooseTarget } = await player.chooseTarget('狂风：是否选择一名角色获得狂风标记')
          .set("ai", function (target) {
            if (player.getExpansions('jlsg_qixing').length > 3) return lib.jlsg.isWeak(target) && lib.jlsg.isEnemy(player, target);
            return -1;
          });
        if (chooseTarget.bool) {
          const target = chooseTarget.targets[0];
          const { result: discard } = await player.chooseCardButton('弃置1枚「星」', player.getExpansions('jlsg_qixing'), true);
          player.loseToDiscardpile(discard.links);
          await player.logSkill('jlsg_kuangfeng', target, 'fire');
          if (!target.hasSkill("jlsg_kuangfeng2")) target.addSkill("jlsg_kuangfeng2");
          target.addMark("jlsg_kuangfeng2", 1);
        }
      },
      group: ["jlsg_kuangfeng2"],
    },
    jlsg_kuangfeng2: {
      charlotte: true,
      forced: true,
      popup: false,
      mark: true,
      marktext: '风',
      intro: {
        content: '已有#个「风」标记'
      },
      trigger: { player: 'damageBegin1' },
      filter(event, player) {
        if (!player.hasMark("jlsg_kuangfeng2")) return false;
        return !event.jlsg_kuangfeng;
      },
      async content(event, trigger, player) {
        trigger.jlsg_kuangfeng = true;
        let gainer = game.filterPlayer(cur => cur.hasSkill("jlsg_kuangfeng")).sortBySeat(player);
        if (game.hasNature(trigger)) {
          if (trigger.nature == 'fire') {
            await player.logSkill('jlsg_kuangfeng2', null, "fire");
            trigger.num += player.countMark("jlsg_kuangfeng2");
          }
          if (game.hasNature(trigger, "thunder")) {
            await player.popup("jlsg_kuangfeng2", null, 'thunder');
            if (gainer.length) {
              for (let current of gainer) {
                if (!current.hasSkill("jlsg_qixing")) continue;
                let card = get.cards(1);
                if (card) {
                  await current.addToExpansion(card, current, 'draw').set("gaintag", ['jlsg_qixing']);
                  game.log(current, '将牌堆顶的一张牌置入「星」');
                }
              }
            }
          }
        } else {
          if (gainer.length) {
            await player.logSkill("jlsg_kuangfeng2");
            for (let current of gainer) {
              await current.draw(player.countMark("jlsg_kuangfeng2"));
            }
          }
        }
      },
      ai: {
        threaten: 3,
        effect: {
          target: function (card, player, target, current) {
            let mark = target.countMark("jlsg_kuangfeng2");
            if (get.tag(card, 'damage')) {
              if (get.tag(card, 'fireDamage')) return 1 + (mark / 10);
              if (get.tag(card, "thunder") && player.hasSkill("jlsg_kuangfeng") && player.hasSkill("jlsg_qixing")) return [1, 0, 1, 1];
              if (!get.tag(card, "natureDamage")) return [1, 0, 1, mark / 5];
            }
          }
        }
      }
    },
    jlsg_dawu: {
      audio: "ext:极略:2",
      trigger: { player: 'phaseJieshuBegin' },
      priority: 1,
      direct: true,
      filter: function (event, player) {
        return player.getExpansions('jlsg_qixing').length;
      },
      content: function () {
        "step 0"
        player.chooseTarget('大雾：选择角色获得大雾标记',
          [1, Math.min(game.players.length, player.getExpansions('jlsg_qixing').length)]).ai = function (target) {
            if (target.isMin()) return 0;
            if (target.hasSkill('biantian2')) return 0;
            var att = get.attitude(player, target);
            if (att >= 4) {
              if (target.hp == 1 && target.maxHp > 2) return att;
              if (target.hp == 2 && target.maxHp > 3 && target.countCards('he') == 0) return att * 0.7;
              if (jlsg.isWeak(target)) return att * 1.1;
              return 0;
            }
            return -1;
          }
        "step 1"
        if (result.bool) {
          var length = result.targets.length;
          for (var i = 0; i < length; i++) {
            result.targets[i].addSkill('jlsg_dawu2');
            result.targets[i].popup('jlsg_dawu');
          }
          player.logSkill('jlsg_dawu', result.targets, 'thunder');
          player.chooseCardButton('弃置' + get.cnNumber(length) + '枚「星」', length, player.getExpansions('jlsg_qixing'), true);
        } else {
          event.finish();
        }
        "step 2"
        player.loseToDiscardpile(result.links);
      },
      group: ['jlsg_dawu_remove'],
      subSkill: {
        remove: {
          trigger: { player: ['phaseBegin', 'dieBegin'] },
          forced: true,
          unique: true,
          popup: false,
          silent: true,
          content: function () {
            for (var i = 0; i < game.players.length; i++) {
              if (game.players[i].hasSkill('jlsg_dawu2')) {
                game.players[i].removeSkill('jlsg_dawu2');
                game.players[i].popup('jlsg_dawu');
              }
            }
          }
        }
      }
    },
    jlsg_dawu2: {
      charlotte: true,
      forced: true,
      mark: true,
      marktext: '雾',
      intro: {
        content: '已获得大雾标记'
      },
      trigger: { player: 'damageBegin2' },
      filter: function (event, player) {
        return !game.hasNature(event, "thunder");
      },
      content: function () {
        trigger.cancel();
        player.draw();
      },
      ai: {
        nofire: true,
        nodamage: true,
        maixue_hp: true,
        effect: {
          target: function (card, player, target, current) {
            if (player.hasSkillTag("jueqing")) return;
            if (get.tag(card, 'damage') && !get.tag(card, 'thunderDamage')) return [0, 1];
          }
        },
      },
    },
    translate: {
      jlsg_qixing_info: '分发起始手牌时，你额外获得七张牌，然后你将至少七张手牌置于武将牌上，称为"星"。摸牌阶段结束时，你可以用手牌替换等量的"星"。你的手牌上限＋ X ( X 为你的"星"的数量）。',
      jlsg_kuangfeng_info: '准备阶段，你可以将一张"星"置入弃牌堆并选择一名角色，该角色获得一个"狂风"标记。当有此标记的角色受到伤害时，若此伤害：无属性，你摸 X 张牌；火焰伤害，此伤害+ X ；雷电伤害，你将牌堆顶的一张牌置入"星"( X 为其"狂风"标记数）。',
      jlsg_dawu_info: '结束阶段，你可以将任意张"星"置入弃牌堆，并令等量角色各获得一个"大雾"标记直到你的下一个回合开始。当有此标记的角色受到伤害时，若此伤害不是雷电伤害，防止之且该角色摸一张牌。',
    }
  },
  //SK神甘宁
  jlsgsoul_ganning: {
    jlsg_lvezhen: {
      audio: "ext:极略:2",
      trigger: { source: "damageSource" },
      filter: function (event, player) {
        if (event.player == player) return false;
        const phaseUse = event.getParent("phaseUse");
        if (!phaseUse || phaseUse.name != "phaseUse" || phaseUse.player != player) return false;
        return event.player.isIn() && event.player.countCards("he") > 0;
      },
      async cost(event, trigger, player) {
        const next = await player.gainPlayerCard(trigger.player, "he")
          .set("prompt", "掠阵：是否获得" + get.translation(trigger.player) + "的一张牌并翻面？")
          .set("prompt2", "然后若你背面朝上，你可以结束当前回合")
          .set("chooseonly", true);
        event.result = {
          bool: next.result?.bool,
          targets: [trigger.player],
          cost_data: { next: next },
        };
      },
      async content(event, trigger, player) {
        const { cost_data: { next } } = event;
        await player.gain(next.result.cards, next.target, "bySelf");
        await player.turnOver();
        const phase = trigger.getParent("phase");
        if (player.isTurnedOver() && phase && !phase.finished) {
          const { result } = await player.chooseBool("掠阵：是否结束" + get.translation(_status.currentPhase) + "的回合")
            .set("ai", (event, player) => get.attitude(player, get.event("target")) > 0)
            .set("target", _status.currentPhase);
          if (result.bool) {
            await player.logSkill("jlsg_lvezhen", _status.currentPhase);
            _status.event = phase;
            phase.finish();
            game.log(_status.currentPhase, "的回合结束了");
          }
        }
      },
    },
    jlsg_youlong: {
      audio: "ext:极略:2",
      trigger: { global: "phaseBegin" },
      filter(event, player) {
        return event.player != player;
      },
      forced: true,
      async content(event, trigger, player) {
        await player.draw();
        const next = game.createEvent("phaseUse", false, event);
        next.player = player;
        event.next.remove(next);
        event.next.unshift(next);
        next.setContent("phaseUse");
        await next;
      },
    },
    translate: {
      jlsg_lvezhen_info: "出牌阶段，当你对其他角色造成伤害后，你可以获得其一张牌并翻面，然后若你背面朝上，你可以结束当前回合",
      jlsg_youlong_info: "锁定技，其他角色的回合开始时，你摸一张牌并执行一个额外的出牌阶段。",
    },
    delete: ["jlsg_lvezhen2", "jlsg_youlong2"],
  },

  //蛇蝎美人[魔蔡夫人]
  jlsgsy_caifuren: {
    jlsgsy_luansi: {
      audio: "ext:极略:2",
      enable: 'phaseUse',
      usable: 1,
      unique: true,
      filterTarget: function (card, player, target) {
        if (!target.countCards('h')) return false;
        if (ui.selected.targets.length) {
          return !target.hasSkillTag('noCompareTarget');
        } else {
          return !target.hasSkillTag('noCompareSource');
        }
      },
      filter: function (event, player) {
        return game.countPlayer(p => p.countCards('h')) >= 2;
      },
      multitarget: true,
      targetprompt: ['发起拼点', '被拼点'],
      selectTarget: 2,
      prompt: '乱嗣：选择两名拼点目标,然后你弃置没赢的角色的两张牌。若拼点赢的角色不是你，你摸两张牌',
      async content(event, trigger, player) {
        const [target1, target2] = event.targets;
        target1.line(target2, 'green');
        const { result } = await target1.chooseToCompare(target2);
        const lose = [];
        if (result.winner) lose.add(result.winner == target1 ? target2 : target1);
        else if (result.tie) lose.addArray(event.targets);
        for (const target of lose) {
          if (target.isIn() && target.countDiscardableCards(player, "he")) {
            await player.discardPlayerCard(target, "he", true, 2);
          }
        }
        if (!result.winner || result.winner != player) await player.draw(2);
      },
      ai: {
        order: 8,
        result: {
          target: function (player, target) {
            if (game.players.length <= 2) return 0;
            if (target.countCards('he') < 1) return 0;
            var att = ai.get.attitude(player, target);
            if (att < 0) return -target.countCards('he');
          }
        },
      },
    },
    jlsgsy_huoxin: {
      audio: "ext:极略:1",
      trigger: { player: 'damageBegin4' },
      filter: function (event, player, name) {
        if (event.num < 1) return false;
        return event.source && event.source.isIn();
      },
      forced: true,
      unique: true,
      logTarget: "source",
      async content(event, trigger, player) {
        const { result } = await trigger.source.chooseBool(`###${get.translation(player)}对你发动了祸心###是否令${get.translation(player)}获得你区域里的各一张牌？否则其防止此次伤害且你失去一点体力`)
          .set("ai", (event, source) => {
            const player = event.player;
            const losehp = get.effect(source, { name: "losehp" }, player, source),
              damage = get.damageEffect(player, source, source, event.getTrigger().nature),
              gain = get.effect(source, { name: "shunshou_copy" }, player, source);
            return gain + damage > losehp;
          });
        if (result.bool) {
          let position = "";
          for (let i of "hej") {
            if (trigger.source.countGainableCards(player, i)) position += i;
          }
          if (position.length > 0) {
            await player.gainPlayerCard(trigger.source, position, position.length, "祸心：获得每个区域各一张牌")
              .set("filterButton", button => {
                const player = get.player(),
                  target = get.event("target");
                if (!lib.filter.canBeGained(button.link, player, target)) return false;
                if (ui.selected.buttons?.length) {
                  const cards = ui.selected.buttons.map(i => i.link);
                  for (const card of cards) {
                    if (get.position(card) == get.position(button.link)) return false;
                  };
                }
                return true;
              })
              .set("target", trigger.source);
          }
        }
        else {
          game.log(player, "防止了伤害");
          trigger.cancel();
          await trigger.source.loseHp(1);
        }
      },
      ai: {
        maixie_defend: true,
      },
    },
    translate: {
      jlsgsy_luansi_info: "变身技，出牌阶段限一次，你可以令两名角色拼点，然后你弃置没赢的角色两张牌；若拼点赢的角色不为你，你摸两张牌。",
      jlsgsy_huoxin_info: "变身技，锁定技，当你受到伤害时，除非伤害来源令你获得其区域里的牌各一张，否则你防止此伤害，其失去1点体力。",
    },
  },
  //嗜血狂狼[魔魏延]
  jlsgsy_weiyan: {
    jlsgsy_shiao: {
      audio: "ext:极略:true",
      trigger: { player: ["phaseZhunbeiBegin", "phaseJieshuBegin"] },
      filter: (event, player) => player.hasUseTarget("sha", false),
      direct: true,
      content() {
        player.chooseUseTarget('###是否发动【恃傲】？###视为使用一张【杀】', { name: 'sha' }, false, 'nodistance').set("logSkill", 'jlsgsy_shiao');
      },
    },
    translate: {
      jlsgsy_shiao_info: "准备/结束阶段，你可以视为使用一张【杀】。"
    },
    delete: ["jlsgsy_shiao2"],
  },
}