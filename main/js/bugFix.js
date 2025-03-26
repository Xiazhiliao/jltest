import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
//bug修复
export default {
  sr: {
    //SR许褚
    jlsgsr_xuzhu: {
      jlsg_huxiao2: {
        sourceSkill: "jlsg_huxiao",
        audio: false,
        trigger: { player: 'shaEnd' },
        forced: true,
        popup: false,
        content: function () {
          var evt = _status.event.getParent("phaseUse");
          if (evt && evt.name == "phaseUse") {
            evt.skipped = true;
          }
          var evt = _status.event.getParent("phase");
          if (evt && evt.name == "phase") {
            evt.finish();
          }
          player.turnOver();
        }
      },
    },
    //SR吕蒙
    jlsgsr_lvmeng: {
      jlsg_shixue2: {
        sourceSkill: "jlsg_shixue",
        trigger: { player: 'shaMiss' },
        forced: true,
        popup: false,
        content: function () {
          player.chooseToDiscard(2, true, "he");
        }
      },
    },
    //SR曹操
    jlsgsr_caocao: {
      jlsg_zhaoxiang: {
        audio: "ext:极略:1",
        srlose: true,
        trigger: { global: 'shaBegin' },
        filter: function (event, player) {
          return event.player != player;
        },
        direct: true,
        content: function () {
          'step 0'
          if (trigger.player.inRangeOf(player)) {
            var next = player.chooseBool(get.prompt('jlsg_zhaoxiang', trigger.player));
            next.ai = function () {
              return get.effect(trigger.target, trigger.card, trigger.player, player) < 0;
            };
          } else {
            if (!player.countDiscardableCards(player, 'h')) {
              event.finish();
              return;
            }
            var next = player.chooseToDiscard(get.prompt('jlsg_zhaoxiang', trigger.player));
            next.ai = function (card) {
              const player = get.player(),
                trigger = get.event().getTrigger();
              var income = Math.min(-get.effect(trigger.target, trigger.card, trigger.player, player) * 1.5,
                get.effect(trigger.player, { name: 'shunshou_copy2' }, player, player) / 1.5
              );
              return income - get.value(card);
            };
            next.logSkill = ['jlsg_zhaoxiang', trigger.player];
          }
          'step 1'
          if (result.bool) {
            if (!result.cards) {
              player.logSkill('jlsg_zhaoxiang', trigger.player);
            }
            if (trigger.player.countCards('he')) {
              trigger.player.chooseBool('令' + get.translation(player) + '获得你的一张牌或令打出的杀无效')
                .set('ai', function (event, player) {
                  const trigger = event.getTrigger(),
                    source = get.event("source");
                  let num = trigger.targets.reduce((n, target) => n + get.effect(target, trigger.card, player, player), 0);
                  return get.effect(player, { name: "shunshou_copy2" }, source, player) < num;
                }).set("source", player);
            } else {
              trigger.untrigger();
              trigger.finish();
              event.finish();
            }
          } else {
            event.finish();
          }
          'step 2'
          if (!result.bool) {
            trigger.untrigger();
            trigger.finish();
          } else {
            player.gainPlayerCard(trigger.player, true);
          }
        },
        ai: {
          expose: 0.5,
        }
      },
    },
  },
  sk: {
    //SK曹节
    jlsgsk_caojie: {
      jlsg_zhixi: {
        audio: "ext:极略:2",
        usable: 1,
        enable: 'phaseUse',
        init(player) {
          player.storage.jlsg_zhixi = [];
        },
        filter: function (event, player) {
          return player.getExpansions('jlsg_huaibi').length;
        },
        filterTarget: function (card, player, target) {
          return target != player;
        },
        content: function () {
          'step 0'
          target.gain('give', player, player.getExpansions('jlsg_huaibi'));
          'step 1'
          if (player.getStorage(event.name).includes(target)) {
            target.loseHp();
          } else {
            target.loseHp(3);
            player.storage[event.name].push(target);
          }
        },
        ai: {
          order: 2,
          result: {
            player: function (player, target) {
              if (player.hasSkill('jlsg_huaibi')) {
                return 1;
              }
            },
            target: function (player, target) {
              let result = get.effect(target, { name: 'losehp' }, player, target)
                / get.attitude(target, target);
              if (player.getStorage('jlsg_zhixi').includes(target)) {
                return result * 2;
              }
              return result;
            },
          }
        },
      },
      translate: {
        jlsg_zhixi_info: "出牌阶段限一次，你可以将「玺」交给一名其他角色，令其失去3点体力。若你已对其发动过此技能则改为失去1点体力。",
      },
    },
    //SK关兴
    jlsgsk_guanxing: {
      jlsg_wuzhi: {
        audio: "ext:极略:1",
        forced: true,
        trigger: { player: 'phaseDiscardEnd' },
        filter: function (event, player) {
          let shaFulfilled = () => {
            var shaTemplate = { name: 'sha', isCard: true };
            var num = lib.card['sha'].usable;
            if (!num) return true;
            num = game.checkMod(shaTemplate, player, num, 'cardUsable', player);
            var numUsed = player.getHistory('useCard', event => get.name(event.card) == 'sha'
            ).length;
            return !num || num <= numUsed;
          };
          return !shaFulfilled();
        },
        content: function () {
          'step 0'
          player.damage("nosource");
          'step 1'
          var card = get.cardPile2('sha');
          if (card) player.gain(card, 'gain2', 'log');
        }
      },
      translate: {
        jlsg_wuzhi_info: '锁定技，弃牌阶段结束后，若你本回合内【杀】的使用次数未达到上限，你受到一点无来源伤害并从牌堆中获得一张【杀】',
      },
    },
    //SK李严
    jlsgsk_liyan: {
      jlsg_yanliang: {
        audio: "ext:极略:2",
        trigger: { global: 'phaseZhunbeiBegin' },
        filter: function (event, player) {
          return player.countDiscardableCards(player, 'he');
        },
        popup: false,
        async cost(event, trigger, player) {
          event.result = await player
            .chooseToDiscard('是否对' + get.translation(trigger.player) + '发动【延粮】?', 'he')
            .set("ai", card => {
              if (get.attitude(player, trigger.player) > 0 && trigger.player.countCards('j', 'lebu')) return 8 - get.value(card) && get.color(card) == 'black';
              if (get.attitude(player, trigger.player) < 0) return 4 - get.value(card);
              return 0;
            })
            .forResult();
        },
        async content(event, trigger, player) {
          await player.logSkill('jlsg_yanliang', trigger.player);
          var list = trigger.getParent("phase").phaseList;
          var draw = list.find(i => i.startsWith('phaseDraw'));
          if (!draw) {
            await player.chat(`无粮可延`);
            return;
          }
          else {
            var color = get.color(event.cards[0], player) == 'red';
            if (!list.some(i => i.startsWith(color ? 'phaseUse' : 'phaseDiscard'))) {
              await player.chat(`延无期限`);
              return;
            }
            else {
              list.remove(draw);
              for (var i = 0; i < list.length; i++) {
                if (list[i].startsWith(color ? 'phaseUse' : 'phaseDiscard')) {
                  list.splice(i + 1, 0, draw);
                  trigger.player.addTempSkill(`jlsg_yanliang_${color ? 'red' : 'black'}`);
                  break;
                }
              }
              await game.delayx();
            }
          }
        },
        subSkill: {
          red: {
            charlotte: true,
            mark: true,
            intro: {
              marktext: '延',
              content: '摸牌阶段在出牌阶段后进行'
            },
          },
          black: {
            charlotte: true,
            mark: true,
            intro: {
              marktext: '延',
              content: '摸牌阶段在弃牌阶段后进行'
            },
          }
        }
      },
    },
    //SK潘璋
    jlsgsk_panzhang: {
      jlsg_jiejun: {
        audio: "ext:极略:2",
        trigger: { global: "useCardAfter" },
        filter(event, player) {
          return event.player != player
            && _status.currentPhase != player
            && get.color(event.card, event.player) == 'red';
        },
        direct: true,
        content() {
          "step 0"
          player.chooseToUse({
            logSkill: "jlsg_jiejun",
            preTarget: trigger.player,
            prompt: `截军：是否对${get.translation(trigger.player)}使用一张【杀】？`,
            prompt2: `若此【杀】造成伤害，你获得其所有牌`,
            filterCard: function (card, player) {
              return get.name(card) == 'sha' && lib.filter.filterCard.apply(this, arguments);
            },
            filterTarget: function (card, player, target) {
              return target == _status.event.preTarget && lib.filter.targetEnabled.apply(this, arguments);
            },
            addCount: false,
          });
          "step 1"
          if (!result.bool) {
            event.finish();
            return;
          }
          let evts = player.getHistory('sourceDamage', function (evt) {
            return evt.getParent(4) == event;
          })

          if (evts.length) {
            player.gain(trigger.player, trigger.player.getGainableCards(player, 'he'), 'giveAuto');
          }
        }
      },
      translate: {
        jlsg_jiejun_info: "你的回合外，当其他角色使用红色牌后，你可以对其使用一张【杀】，当此【杀】造成伤害后，你获得其所有牌。",
      },
    },
    //SK王朗
    jlsgsk_wanglang: {
      jlsg_quanxiang2: {
        sourceSkill: "jlsg_quanxiang",
        trigger: { global: 'dyingAfter' },
        forced: true,
        charlotte: true,
        filter: function (event, player) {
          if (!player.storage.jlsg_quanxiang2) {
            return false;
          }
          return event.player === player.storage.jlsg_quanxiang2[0];
        },
        direct: true,
        content: function () {
          'step 0'
          if (trigger.reason !== player.storage.jlsg_quanxiang2[1]) {
            event.goto(2);
            return;
          }
          trigger.player.recover(trigger.reason.num, player);
          'step 1'
          player.addMark('jlsg_raoshe', 1);
          if (player.countMark('jlsg_raoshe') >= 7) {
            player.die();
          }
          'step 2'
          player.removeSkill(event.name);
        },
      },
    },
    //SK吴苋
    jlsgsk_wuxian: {
      jlsg_hechun: {
        audio: "ext:极略:2",
        enable: 'phaseUse',
        usable: 1,
        selectTarget: -1,
        filterTarget(card, player, target) {
          return target != player;
        },
        multitarget: true,
        multiline: true,
        async content(event, trigger, player) {
          event.targets.sortBySeat();
          const pairs = [];
          for (const target of event.targets) {
            if (!target.countGainableCards(player, 'he')) continue;
            const { result } = await target.chooseToGive(true, player, 'he', `交给${get.translation(player)}一张牌`)
              .set("target", player)
              .set("filterCard", (card, player) => lib.filter.canBeGained(card, get.event("target"), player))
              .set('ai', function (card, cards) {
                let player = get.player();
                let target = get.event("target");
                let num = -get.attitude(player, player) * get.value(card, player) + get.attitude(player, target) * get.value(card, target);
                if (get.color(card, player) == 'black') num -= 15
                if (get.color(card, player) == 'red' && player.isDamaged()) num += 15;
                return num;
              });
            pairs.add([target, get.color(result.cards[0], target)]);
          };
          for (const pair of pairs) {
            const [target, color] = pair;
            if (!color) continue;
            const bool = await player
              .chooseBool(`是否令${get.translation(target)}${color == "red" ? "回复" : "失去"}1点体力？`)
              .set("ai", (event, player) => {
                if (get.event("color") == "red") return get.recoverEffect(target, player, player) > 0;
                else return get.effect(target, { name: "losehp" }, player, player) > 0;
              })
              .set("color", color)
              .forResultBool();
            if (bool) {
              player.line(target, "green");
              await target[color == "red" ? "recover" : "loseHp"]();
            }
            if (!event.isMine() && !event.isOnline()) await game.delayx();
          }
        },
        ai: {
          order: 9,
          threaten: 2,
          result: {
            player: 1,
          },
        },
      },
    },
    //SK夏侯氏
    jlsgsk_xiahoushi: {
      jlsg_yingge2: {
        sourceSkill: "jlsg_yingge",
        mark: true,
        intro: {
          name: "莺歌",
          content: function (event, player) {
            return `圣数：<b>${Number(player.storage.jlsg_yingge2)}`;
          },
        },
        mod: {
          cardEnabled: function (card, player) {
            let number = get.number(card, player);
            if (!number || typeof number != "number") return;
            if (get.is.virtualCard(card) || get.is.convertedCard(card)) return;
            if (number < Number(player.storage.jlsg_yingge2)) return false;
          },
          cardSavable: function (card, player) {
            let number = get.number(card, player);
            if (!number || typeof number != "number") return;
            if (get.is.virtualCard(card) || get.is.convertedCard(card)) return;
            if (number < Number(player.storage.jlsg_yingge2)) return false;
          },
          cardname: function (card, player, name) {
            let number = get.number(card, player);
            if (!number || typeof number != "number") return;
            if (number >= Number(player.storage.jlsg_yingge2)) return 'sha';
          },
          cardUsable: function (card, player, num) {
            if (get.name(card, player) == 'sha') return num + Number(player.storage.jlsg_yingge2);
          },
          attackRange: function (player, num) {
            return num + Number(player.storage.jlsg_yingge2);
          },
        },
      },
      translate: {
        jlsg_yingge_info: "一名角色的出牌阶段开始时，你可以弃置一张手牌，令其不能使用点数小于X的非转化非虚拟牌、点数不小于X的手牌均视为【杀】、攻击范围和【杀】的使用次数上限+X，直到该阶段结束。（X为你弃置牌的点数）",
      },
    },
    //SK严颜
    jlsgsk_yanyan: {
      jlsg_juzhan: {
        audio: "ext:极略:2",
        trigger: { global: "phaseUseBegin" },
        filter(event, player) {
          return event.player != player;
        },
        check(event, player) {
          player.isDamaged() && get.attitude(player, event.player) < 0 && Math.random() < 0.6;
        },
        logTarget: "player",
        async content(event, trigger, player) {//🔥佬提供
          if (player.getDamagedHp() > 0) await player.draw(player.getDamagedHp());
          const card = get.autoViewAs({ name: "sha", isCard: true }, []);
          await trigger.player.useCard(card, player, "noai", false);
          if (player.hasHistory("damage", evt => evt.getParent(3) == event) && player.getDamagedHp()) {
            const { result } = await trigger.player.chooseToDiscard(Math.min(5, player.getDamagedHp()), "he")
              .set("prompt", `${get.translation(player)}对你发动了【拒战】，请弃置${player.getDamagedHp()}张牌`)
              .set("prompt2", "否则跳过出牌阶段")
              .set("ai", card => get.value(card) < 6);
            if (!result.cards || !result.cards[0]) {
              trigger.cancel();
              game.log(trigger.player, "跳过了出牌阶段");
            }
          }
        },
        ai: {
          "maixue_hp": true,
        }
      },
    },
    //SK于吉
    jlsgsk_yuji: {
      jlsg_fulu: {
        audio: "ext:极略:3",
        trigger: { player: "damageEnd" },
        getIndex(event) {
          return event.num;
        },
        getTargets(player) {
          let damage = player.getAllHistory("damage", evt => {
            return evt.source && evt.source.isIn();
          }).map(evt => evt.source).reverse().slice(0, 3),
            recover = game.getAllGlobalHistory("changeHp", evt => {
              if (evt.player != player || !evt.parent) return false;
              if (evt.parent.name != "recover") return false;
              if (evt.parent.source && evt.parent.source.isIn()) return true;
              return evt.getParent(2)?.player?.isIn();
            }).map(evt => evt.parent.source || evt.getParent(2).player).reverse().slice(0, 3);
          return [damage, recover];
        },
        filter(event, player) {
          const [damage, recover] = lib.skill.jlsg_fulu.getTargets(player);
          return event.num > 0 && (damage.length || recover.length);
        },
        async cost(event, trigger, player) {
          const [damage, recover] = lib.skill.jlsg_fulu.getTargets(player);
          let str = "###符箓：是否令最近三名对你造成伤害的角色依次随机弃置一张牌，最近三次令你回复体力的角色各摸一张牌？###";
          str += `<div class='center text'>打你的人：${damage.length ? get.translation(damage) : "无"}</div><br>`;
          str += `<div class='center text'>帮你的人：${recover.length ? get.translation(recover) : "无"}</div>`;
          const { result } = await player.chooseBool(str)
            .set("info", [damage, recover])
            .set("ai", (event, player) => {
              let v = 0,
                [damage, recover] = get.event("info");
              for (let p of damage) v += get.attitude(player, p) > 0 ? -1 : 1;
              for (let p of recover) v += get.attitude(player, p) > 0 ? 1 : -1;
              return v >= 0;
            })
          let targets = [...damage, ...recover].unique().sortBySeat();
          event.result = {
            bool: result.bool,
            targets: targets,
            cost_data: {
              damage: damage.sortBySeat(),
              recover: recover,
            },
          };
        },
        async content(event, trigger, player) {
          const { damage, recover } = event.cost_data;
          for (let target of damage) {
            if (target.isIn()) {
              let hs = target.getDiscardableCards(player, "he");
              if (hs.length > 0) await target.discard(hs.randomGet());
            }
          };
          if (recover.length) await game.asyncDraw(recover);
        },
      },
    },
    //SK张让
    jlsgsk_zhangrang: {
      jlsg_taoluan: {
        audio: "ext:极略:2",
        trigger: {
          global: 'useCardToPlayered',
        },
        init: function (player) {
          player.storage.jlsg_taoluan2 = [];
        },
        filter: function (event, player) {
          if (!event.isFirstTarget) {
            return false;
          }
          if (game.countPlayer(p => p.isDying())) {
            return false;
          }
          var type = get.type(event.card);
          if (!['basic', 'trick'].includes(type)) {
            return false;
          }
          if (lib.card[event.card.name].notarget) {
            return false;
          }
          if (!player.countDiscardableCards(player, 'he')) {
            return false;
          }
          return lib.skill.jlsg_taoluan.getPile(player, type).filter(c => c != event.card.name).length != 0;
        },
        direct: true,
        content: function () {
          'step 0'
          var maxEffect = -Infinity, maxCardName = null;
          {
            var type = get.type(trigger.card);
            for (let cardName of lib.skill.jlsg_taoluan.getPile(player, type)) {
              let card = { ...trigger.card, name: cardName };
              let effect = 0;
              for (let t of trigger.targets) {
                // ai is so stupid
                if (t == trigger.player && cardName == 'shunshou') {
                  continue;
                }
                if (t.isHealthy() && cardName == 'tao') {
                  continue;
                }
                effect += get.effect(t, card, trigger.player, player);
              }
              if (effect > maxEffect) {
                maxEffect = effect;
                maxCardName = cardName;
              }
            }
            for (let t of trigger.targets) {
              maxEffect -= get.effect(t, trigger.card, trigger.player, player);
            }
            if (maxCardName === trigger.card.name) {
              maxCardName = null;
              maxEffect = -Infinity
            }
          }
          var prompt = `###${get.prompt(event.name, trigger.player)}###${get.translation(trigger.player)}对${trigger.targets.map(p => get.translation(p)).join('、')}使用了${lib.translate[trigger.card.name]}`;
          player.chooseToDiscard('he', get.prompt2(event.name, trigger.player))
            .set("ai", function (card) {
              return _status.event.effect - get.value(card) * 2 - 2;
            })
            .set('effect', maxEffect)
            .set('logSkill', [event.name, trigger.player]);
          event.maxCardName = maxCardName;
          'step 1'
          if (!result.bool) {
            event.finish();
            return;
          }
          for (let p of trigger.targets) {
            if (p.ai.shown > player.ai.shown) {
              player.addExpose(0.15);
            }
          }
          var type = get.type2(trigger.card);
          var dialog = lib.skill.jlsg_taoluan.getPile(player, type).filter(c => c != trigger.card.name);
          dialog = dialog.map(i => [type, '', i]);
          player.chooseButton(['滔乱', [dialog, 'vcard']], true).set("ai", function (button) {
            return button.link[2] == _status.event.choice;
          }).set('choice', event.maxCardName);
          'step 2'
          if (!result.bool) {
            event.finish();
            return;
          }
          var name = result.links[0][2];
          player.popup(name);
          game.log(player, "将", trigger.card, "改为", { ...trigger.card, name });
          trigger.card.name = name;
          trigger.effectCount = get.info(trigger.card, false).effectCount || 1;
          trigger.excluded = [];
          trigger.directHit = [];
          trigger.card.storage = {};
          trigger.baseDamage = 1;
          trigger.extraDamage = 0;
          player.addTempSkill('jlsg_taoluan2', 'roundStart');
          player.markAuto('jlsg_taoluan2', [name]);
        },
        getPile(player, type) {
          return lib.inpile
            .filter(c => type == get.type(c) &&
              !lib.card[c].complexSelect &&
              !lib.card[c].notarget &&
              lib.card[c].content &&
              !player.getStorage('jlsg_taoluan2').includes(c)
            );
        },
      },
    },
    //SK朱治
    jlsgsk_zhuzhi: {
      jlsg_anguo: {
        audio: "ext:极略:2",
        trigger: { player: 'phaseDrawBegin2' },
        filter: function (event, player) {
          return !event.numFixed && event.num > 0;
        },
        async cost(event, trigger, player) {
          event.result = await player.chooseTarget(`###安国：是否少摸一张牌并选择一名角色吗，令其随机使用一张装备牌？###此牌为:武器牌,其摸X张牌（X为此武器牌的攻击范围）;防具或宝物牌,其回复1点体力;坐骑牌,重复此流程.`)
            .set('ai', target => {
              if (get.cardPile(card => get.type(card) == "equip")) return get.attitude(_status.event.player, target);
              else return 0;
            })
            .forResult();
        },
        async content(event, trigger, player) {
          --trigger.num;
          let target = event.targets[0],
            subtypes = {},
            noStop = true,
            cards = Array.from(ui.cardPile.childNodes)
              .concat(Array.from(ui.discardPile.childNodes))
              .filter(i => get.type(i, null, false) == "equip")
              .filter(i => ["c", "d"].includes(get.position(i)));
          if (target.ai.shown > player.ai.shown) player.addExpose(0.2);
          for (const i of cards) {
            let subtype = get.subtype(i);
            subtypes[subtype] = subtypes[subtype] || [];
            subtypes[subtype].add(i);
          };
          while (noStop) {
            noStop = false;
            if (!Object.keys(subtypes).length) {
              await game.delayx();
              break;
            }
            let subtype = Object.keys(subtypes).randomSort().find(i => target.isEmpty(i));
            if (!subtype) subtype = Object.keys(subtypes).randomGet();
            let card = subtypes[subtype].randomRemove();
            if (!card) {
              if (!subtypes[subtype].length) delete subtypes[subtype];
              noStop = true;
              continue;
            }
            await target.gain(card, "gain2");
            if (!target.canUse(card, target)) break;
            await target.chooseUseTarget(card, true).set("nopopup", true);
            if (subtype == "equip1") {
              if (lib.card[card.name].distance) {
                let range = 1 - lib.card[card.name].distance.attackFrom;
                if (range > 0) await target.draw(player, range);
              }
            }
            else if (["equip2", "equip5"].includes(subtype)) await target.recover(player);
            else noStop = true;
          };
        },
      },
    },
    //SK钟繇
    jlsgsk_zhongyao: {
      jlsg_huomo: {
        audio: "ext:极略:2",
        enable: 'chooseToUse',
        hiddenCard: function (player, name) {
          if (get.type(name) != 'basic') return false;
          const list = player.getStorage('jlsg_huomo');
          if (list.includes(name)) return false;
          return player.countCards('he', { color: 'black' });
        },
        filter: function (event, player) {
          if (event.type == 'wuxie' || !player.countCards('he', { color: 'black' })) return false;
          const list = player.getStorage('jlsg_huomo');
          for (var name of lib.inpile) {
            if (get.type(name) != 'basic' || list.includes(name)) continue;
            var card = { name: name, isCard: true };
            if (event.filterCard(card, player, event)) return true;
            if (name == 'sha') {
              for (var nature of lib.inpile_nature) {
                card.nature = nature;
                if (event.filterCard(card, player, event)) return true;
              }
            }
          }
          return false;
        },
        chooseButton: {
          dialog: function (event, player) {
            const vcards = [];
            const list = player.getStorage('jlsg_huomo');
            for (let name of lib.inpile) {
              if (get.type(name) != 'basic' || list.includes(name)) continue;
              let card = { name: name, isCard: true };
              if (event.filterCard(card, player, event)) vcards.push(['基本', '', name]);
              if (name == 'sha') {
                for (let nature of lib.inpile_nature) {
                  card.nature = nature;
                  if (event.filterCard(card, player, event)) vcards.push(['基本', '', name, nature]);
                }
              }
            }
            return ui.create.dialog('活墨', [vcards, 'vcard'], 'hidden');
          },
          check: function (button) {
            const player = _status.event.player;
            const card = { name: button.link[2], nature: button.link[3] };
            if (game.hasPlayer(function (current) {
              return player.canUse(card, current) && get.effect(current, card, player, player) > 0;
            })) {
              switch (button.link[2]) {
                case 'tao': return 5;
                case 'jiu': return 3.01;
                case 'sha':
                  if (button.link[3] == 'fire') return 2.95;
                  else if (button.link[3] == 'thunder') return 2.92;
                  else return 2.9;
                case 'shan': return 1;
              }
            }
            return 0;
          },
          backup: function (links, player) {
            return {
              check: function (card) {
                return 1 / Math.max(0.1, get.value(card));
              },
              filterCard: function (card) {
                return get.color(card) == 'black';
              },
              viewAs: {
                name: links[0][2],
                nature: links[0][3],
              },
              position: 'he',
              popname: true,
              ignoreMod: true,
              precontent: function () {
                if (!player.storage.jlsg_huomo) {
                  player.when({ global: ["phaseAfter", "phaseBefore"] }).then(() => {
                    player.unmarkSkill("jlsg_huomo");
                  });
                }
                player.markAuto("jlsg_huomo", event.result.card.name);
              },
            }
          },
          prompt: function (links, player) {
            return '将一张黑色牌当作' + get.translation(links[0][3] || '') + get.translation(links[0][2]);
          }
        },
        marktext: '墨',
        intro: {
          content: '本回合已因〖活墨〗使用过$',
          onunmark: true,
        },
        ai: {
          order: function () {
            var player = _status.event.player;
            var event = _status.event;
            var list = player.getStorage('jlsg_huomo');
            if (!list.includes('jiu') && event.filterCard({ name: 'jiu' }, player, event) && get.effect(player, { name: 'jiu' }) > 0) {
              return 3.1;
            }
            return 2.9;
          },
          respondSha: true,
          fireAttack: true,
          respondShan: true,
          skillTagFilter: function (player, tag, arg) {
            if (tag == 'fireAttack') return true;
            if (player.hasCard(function (card) {
              return get.color(card) == 'black';
            }, 'he')) {
              var list = player.getStorage('jlsg_huomo');
              if (tag == 'respondSha') {
                if (arg != 'use') return false;
                if (list.includes('sha')) return false;
              }
              else if (tag == 'respondShan') {
                if (list.includes('shan')) return false;
              }
            }
            else {
              return false;
            }
          },
          result: {
            player: 1,
          }
        }
      },
      jlsg_dingguan: {
        audio: "ext:极略:2",
        trigger: { global: 'useCardToPlayered' },
        filter(event, player) {
          if (!event.isFirstTarget) return false;
          return get.color(event.card) == 'black' &&
            event.player.isPhaseUsing() && event.targets && event.targets.length && !game.hasPlayer2(function (current) {
              return current.getHistory('damage').length > 0;
            });
        },
        direct: true,
        content() {
          'step 0'
          player.chooseTarget(get.prompt('jlsg_dingguan'), '令目标角色摸一张牌', function (card, player, target) {
            return _status.event.targets.includes(target);
          }, [1, trigger.targets.length]).set('ai', function (target) {
            return get.attitude(_status.event.player, target);
          }).set('targets', trigger.targets);
          'step 1'
          if (result.bool) {
            player.logSkill('jlsg_dingguan', result.targets);
            game.asyncDraw(result.targets.sortBySeat());
          }
        },
        ai: {
          expose: 0.2
        },
      },
    },
    //SK左慈
    jlsgsk_zuoci: {
      jlsg_qianhuan: {
        audio: "ext:极略:2",
        // forbid:['guozhan'],
        trigger: {
          player: 'enterGame',
          global: 'phaseBefore',
        },
        forced: true,
        unique: true,
        priority: -555,
        init: function (player) {
          player.storage.jlsg_qianhuan_fenpei = [];
        },
        filter: function (event, player) {
          if (event.name == 'phase') {
            return event.player == player || game.phaseNumber == 0;
          } else {
            return true;
          }
        },
        content: function () {
          "step 0"
          if (get.config('double_character') === true) {
            event.set('num', 4);
          } else {
            event.set('num', 2);
          }
          var list = lib.jlsg.characterList;
          var stagePlayers = game.players.concat(game.dead);
          for (const player of stagePlayers) {
            list.remove(player.name);
            list.remove(player.name1);
            list.remove(player.name2);
          }
          list = list.randomGets(3);
          event.list = list;
          var skills = [];
          for (var i of list) {
            skills.addArray((get.character(i)[3] || []).filter(function (skill) {
              var info = get.info(skill);
              return info && !info.zhuSkill && !info.hiddenSkill && !info.charlotte && !info.hiddenSkill && !info.dutySkill;
            }));
          }
          skills.addArray(player.storage.jlsg_qianhuan_fenpei);
          if (!list.length || !skills.length) { event.finish(); return; }
          if (player.isUnderControl()) {
            game.swapPlayerAuto(player);
          }
          var switchToAuto = function () {
            _status.imchoosing = false;
            event._result = {
              bool: true,
              skills: skills.randomGets(event.num),
            };
            if (event.dialog) event.dialog.close();
            if (event.control) event.control.close();
          };
          var chooseButton = function (list, skills) {
            var event = _status.event;
            if (!event._result) event._result = {};
            event._result.skills = [];
            var rSkill = event._result.skills;
            var dialog = null;
            if (player.storage.jlsg_qianhuan_fenpei.length) {
              get.character(player.name)[3] = player.storage.jlsg_qianhuan_fenpei;
              dialog = ui.create.dialog(`请选择获得至多${event.num == 2 ? '两' : '四'}个技能`, [list.concat(player.name), 'character'], 'hidden');
            } else {
              dialog = ui.create.dialog(`请选择获得至多${event.num == 2 ? '两' : '四'}个技能`, [list, 'character'], 'hidden');
            }
            event.dialog = dialog;
            var table = document.createElement('div');
            table.classList.add('add-setting');
            table.style.margin = '0';
            table.style.width = '100%';
            table.style.position = 'relative';
            for (var i = 0; i < skills.length; i++) {
              var td = ui.create.div('.shadowed.reduce_radius.pointerdiv.tdnode');
              td.link = skills[i];
              table.appendChild(td);
              td.innerHTML = '<span>' + get.translation(skills[i]) + '</span>';
              td.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                if (_status.dragged) return;
                if (_status.justdragged) return;
                _status.tempNoButton = true;
                setTimeout(function () {
                  _status.tempNoButton = false;
                }, 500);
                var link = this.link;
                if (!this.classList.contains('bluebg')) {
                  if (rSkill.length >= event.num) return;
                  rSkill.add(link);
                  this.classList.add('bluebg');
                }
                else {
                  this.classList.remove('bluebg');
                  rSkill.remove(link);
                }
              });
            }
            dialog.content.appendChild(table);
            dialog.add('　　');
            dialog.open();

            event.switchToAuto = function () {
              event.dialog.close();
              event.control.close();
              game.resume();
              _status.imchoosing = false;
            };
            event.control = ui.create.control('ok', function (link) {
              event.dialog.close();
              event.control.close();
              game.resume();
              _status.imchoosing = false;
            });
            for (var i = 0; i < event.dialog.buttons.length; i++) {
              event.dialog.buttons[i].classList.add('selectable');
            }
            game.pause();
            game.countChoose();
          };
          if (event.isMine()) {
            chooseButton(list, skills);
          }
          else if (event.isOnline()) {
            event.player.send(chooseButton, list, skills);
            event.player.wait();
            game.pause();
          }
          else {
            switchToAuto();
          }
          'step 1'
          var map = event.result || result;
          if (map && map.skills && map.skills.length) {
            let remove = player.storage.jlsg_qianhuan_fenpei
              .filter(s => player.hasSkill(s) && !map.skills.includes(s));
            let add = map.skills.filter(s => !player.hasSkill(s));
            player.changeSkills(add, remove);
            //if(add.length){
            //  for(let skill of add){
            //    if(player.awakenedSkills.includes(skill)) player.restoreSkill(skill)
            //  }
            //}
            player.storage.jlsg_qianhuan_fenpei = map.skills;
          }
        },
        ai: {
          threaten: 2.5,
        },
        group: ['jlsg_qianhuan_2'],
        subSkill: {
          "2": {
            sourceSkill: "jlsg_yingge",
            trigger: { global: 'phaseBefore' },
            forced: true,
            priority: 100,
            unique: true,
            popup: false,
            silent: true,
            filter: function (event, player) {
              return game.phaseNumber == 0 && get.config('double_character') === true;
            },
            content: function () {
              "step 0"
              if (lib.config.mode == 'guozhan' && get.config('guozhan_mode') != 'mingjiang') player.showCharacter(2);
              player.uninit();
              player.style.transform = '';
              player.node.avatar.style.transform = '';
              player.node.avatar2.style.transform = '';
              player.classList.remove('fullskin2');
              player.node.avatar2.setBackground = '';
              player.node.avatar2.hide();
              player.node.name2.style.display = 'none';
              "step 1"
              player.init('jlsgsk_zuoci');
              if (!player.ai.shown) {
                player.ai.shown = 0;
              }
            },
          },
        },
      },
      delete: ["jlsg_qianhuan2"],
    },
    //SK张宝
    jlsgsk_zhangbao: {
      jlsg_zhoufu: {
        audio: "ext:极略:2",
        trigger: { global: 'phaseBegin' },
        filter: function (event, player) {
          return player.countCards('h') != 0 && event.player != player;
        },
        direct: true,
        content: function () {
          'step 0'
          player.chooseToDiscard('h', get.prompt2(event.name, trigger.player)).set("ai", function (card) {
            return get.attitude(player, trigger.player) > -1 ? 0 : 6 - get.useful(card);
          }).set('logSkill', event.name);
          'step 1'
          if (!result.bool) {
            event.finish();
            return;
          }
          trigger.player.judge(function (card) {
            if (get.color(card) == 'black') return -1;
            return 1;
          }).set('judge2', result => !result.bool)
            .set("callback", function () {
              if (event.judgeResult.suit === "spade") player.addTempSkill('baiban');
              else if (event.judgeResult.suit === 'club') player.chooseToDiscard(2, true);
            });
        },
        ai: {
          threaten: function (player, target) {
            if (player.getStat().skill.jlsg_zhoufu > 0 && target == _status.currentPhase) {
              return 2;
            }
            return 1.2;
          },
          expose: 0.2,
        }
      },
      translate: {
        jlsg_zhoufu_info: '其他角色的回合开始时，你可以弃置一张手牌，令其判定，若结果为黑桃，你令其所有非Charlotte技失效直到回合结束；若结果为梅花，其弃置两张牌。',
      },
    },
    //SK花鬘
    jlsgsk_huaman: {
      jlsg_manyi: {
        audio: "ext:极略:2",
        trigger: {
          player: "useCardToPlayered",
          target: "useCardToTargeted",
        },
        filter(event, player, name) {
          if (event.card.name == "nanman") return false;
          if (name == "useCardToTargeted" && event.player == player) return false;
          return event.card.name == "sha" || get.type(event.card) == "trick"
        },
        prompt(event, player) {
          return `蛮裔：是否将${get.translation(event.card)}的效果改为【南蛮入侵】？`;
        },
        prompt2(event, player) {
          return `然后你可以摸一张牌`;
        },
        check(event, player, name) {
          let eff1 = 0, eff2 = 0, source = event.player,
            card = get.autoViewAs({ name: "nanman", ...event.card }, event.cards);
          if (name == "useCardToPlayered") source = player;
          for (let target of event.targets) {
            eff1 += get.effect(target, card, source, player);
            eff2 += get.effect(target, event.card, source, player);
          };
          return eff1 >= eff2;
        },
        async content(event, trigger, player) {
          game.log(player, "将", trigger.card, "的效果改为了【南蛮入侵】");
          trigger.card.name = 'nanman';
          if (trigger.card.isCard) trigger.card.isCard = false;
          trigger.getParent().effectCount = get.info(trigger.card, false).effectCount || 1;
          trigger.getParent().excluded = [];
          trigger.getParent().directHit = [];
          trigger.getParent().card.storage = {};
          trigger.getParent().baseDamage = 1;
          trigger.getParent().extraDamage = 0;
          await player.draw();
        },
        ai: {
          expose: 0.2,
        },
      },
    },
    //SK赵襄
    jlsgsk_zhaoxiang: {
      jlsg_fanghun: {
        audio: "ext:极略:2",
        enable: ["chooseToUse", "chooseToRespond"],
        position: "hs",
        locked: false,
        prompt: "将【杀】/【闪】当作【闪】/【杀】使用或打出，然后获得对方的一张手牌",
        viewAs(cards, player) {
          if (cards.length) {
            var name = false;
            switch (get.name(cards[0], player)) {
              case 'sha': name = 'shan'; break;
              case 'shan': name = 'sha'; break;
            }
            if (name) return { name: name };
          }
          return null;
        },
        check: (card) => 1,
        filterCard(card, player, event) {
          event = event || _status.event;
          var filter = event._backup.filterCard;
          var name = get.name(card, player);
          if (name == 'sha' && filter({ name: 'shan', cards: [card] }, player, event)) return true;
          if (name == 'shan' && filter({ name: 'sha', cards: [card] }, player, event)) return true;
          return false;
        },
        filter(event, player) {
          if (event.filterCard(get.autoViewAs({ name: 'sha' }, 'unsure'), player, event) && player.countCards('hs', 'shan')) return true;
          if (event.filterCard(get.autoViewAs({ name: 'shan' }, 'unsure'), player, event) && player.countCards('hs', 'sha')) return true;
          return false;
        },
        ai: {
          respondSha: true,
          respondShan: true,
          skillTagFilter(player, tag) {
            var name;
            switch (tag) {
              case 'respondSha': name = 'shan'; break;
              case 'respondShan': name = 'sha'; break;
            }
            if (!player.countCards('hs', name)) return false;
          },
          order(item, player) {
            if (player && _status.event.type == 'phase') return get.order({ name: 'sha' }) + 0.3;
            return 10;
          },
          effect: {
            target: function (card, player, target, current) {
              if (get.tag(card, 'respondShan') || get.tag(card, 'respondSha')) {
                if (get.attitude(target, player) <= 0) {
                  if (current > 0) return;
                  if (target.countCards('h') == 0) return 1.6;
                  if (target.countCards('h') == 1) return 1.2;
                  if (target.countCards('h') == 2) return [0.8, 0.2, 0, -0.2];
                  return [0.4, 0.7, 0, -0.7];
                }
              }
            },
          }
        },
        group: ["jlsg_fanghun_cz"],
        subSkill: {
          cz: {
            trigger: {
              player: ["useCard", "respond"],
            },
            filter: function (event, player) {
              if (event.card.name != "sha" && event.card.name != "shan") return false;
              if (!event.skill || event.skill != "jlsg_fanghun") return false;
              var target = lib.skill.chongzhen.logTarget(event, player);
              return target && target.countGainableCards(player, "h") > 0;
            },
            logTarget: function (event, player) {
              return lib.skill.chongzhen.logTarget.apply(this, arguments);
            },
            "prompt2": function (event, player) {
              var target = lib.skill.chongzhen.logTarget(event, player);
              return "获得" + get.translation(target) + "的一张手牌";
            },
            content: function () {
              var target = lib.skill.chongzhen.logTarget(trigger, player);
              player.gainPlayerCard(target, "h", true);
            },
          },
        },
      },
      jlsg_fuhan: {
        audio: "ext:极略:2",
        trigger: { player: 'useCardAfter' },
        frequent: true,
        get list() {
          var list = new Set();
          for (let c of lib.jlsg.characterList.filter(c => get.character(c, 1) == 'shu')) {
            get.character(c)[3].forEach(s => list.add(s));
          }
          delete this.list;
          this.list = [...list];
          return this.list;
        },
        usable: 1,
        filter: function (event) {
          if (!"cards" in event.card || !event.card.cards.length) return false;
          return !event.card.isCard;
        },
        content() {
          var skill = lib.skill.jlsg_fuhan.list.randomGet();
          lib.skill.jlsg_fuhan.list.remove(skill);
          player.addSkills(skill);
        },
      },
    },
    //SK田丰
    jlsgsk_tianfeng: {
      jlsg_gangzhi: {
        audio: "ext:极略:2",
        logAudio(event, player) {
          if (player.countDiscardableCards(player, "h")) return ["ext:极略/jlsg_gangzhi1.mp3"];
          return ["ext:极略/jlsg_gangzhi2.mp3"];
        },
        trigger: { player: 'damageBegin4' },
        filter(event, player) {
          if (event.num < 1) return false;
          if (!player.countCards("h")) return true;
          if (player.countDiscardableCards(player, "h")) return true;
          return false;
        },
        check(event, player) {
          if (player.hp <= 1) return true;
          let eff = lib.skill.jlsg_gangzhi.ai.effect.target(event.card, event.source, player);
          if (!eff) {
            if (!player.countCards("h")) {
              if (!player.hasFriend() && (!player.isTurnedOver() || player.hp == 1)) eff = 1;
              eff = player.isTurnedOver() ? [0, 4] : 0.5;
            }
            else {
              if (!player.hasFriend()) eff = [1, 0];
              else eff = [0.6, -0.4 * (player.countCards('h') - (player.hasSkill('jlsg_sijian') ? player.hp : 0))];
            }
          }
          let num = player.getCards("h").reduce((n, c) => n + player.getUseValue(c), 0) / player.countCards("h");
          if (Array.isArray(eff)) return event.num + Math.abs(eff[1]) > num;
          return event.num > num;
        },
        prompt(event, player) {
          let str = "刚直：是否"
          if (!player.countCards("h")) str += '将武将牌翻面，然后将手牌数补至体力上限';
          else str += '弃置所有手牌，然后防止此伤害';
          return str;
        },
        async content(event, trigger, player) {
          if (!player.countCards("h")) {
            await player.turnOver();
            await player.drawTo(player.maxHp);
          }
          else {
            await player.discard(player.getDiscardableCards(player, "h"));
            await trigger.cancel();
          }
        },
        ai: {
          maixie: true,
          maixie_hp: true,
          maixie_defend: true,
          effect: {
            target: function (card, player, target) {
              if (player && player.hasSkillTag('jueqing', false, target)) return;
              if (!get.tag(card, 'damage')) return;
              if (target.countCards('h') != 0) {
                if (!target.hasFriend()) return;
                return [0.6, -0.4 * (target.countCards('h') - (target.hasSkill('jlsg_sijian') ? target.hp : 0))];
              }
              else {
                if (!target.hasFriend() && (!target.isTurnedOver() || target.hp == 1)) return;
                return target.isTurnedOver() ? [0, 4] : 0.5;
              }
            }
          },
        },
      },
      delete: ['jlsg_gangzhi2'],
    },
  },
  soul: {
    //SK神曹丕
    jlsgsoul_caopi: {
      jlsg_chuyuan: {
        audio: "ext:极略:2",
        marktext: "储",
        intro: {
          markcount: "expansion",
          mark(dialog, content, player) {
            var content = player.getExpansions("jlsg_chuyuan");
            if (content && content.length) {
              if (player == game.me || player.isUnderControl()) {
                dialog.addAuto(lib.skill.jlsg_chuyuan.prompt2(null, player))
                dialog.addAuto(content);
              } else {
                return "共有" + get.cnNumber(content.length) + "张储";
              }
            }
          },
          content(content, player) {
            var content = player.getExpansions("jlsg_chuyuan");
            if (content && content.length) {
              if (player == game.me || player.isUnderControl()) {
                return `${lib.skill.jlsg_chuyuan.prompt2(null, player)}<br>${get.translation(content)}`;
              }
              return "共有" + get.cnNumber(content.length) + "张储";
            }
          },
        },
        trigger: { global: "useCardAfter" },
        filter(event) {
          return ["sha", "shan"].includes(get.name(event.card));
        },
        prompt(event, player) {
          const color = event.card.name == "sha" ? "黑" : "红";
          return `储元：是否摸两张牌，然后可以将一张${color}色牌至于武将牌上称为“储”？`
        },
        prompt2(event, player) {
          const cards = player.getExpansions("jlsg_chuyuan"),
            black = cards.filter(i => get.color(i) == "black").length,
            red = cards.filter(i => get.color(i) == "red").length;
          let str1 = `<span style='color:#000000' data-nature='graymm'>${black}</span>`,
            str2 = `<span style='color:#FF0000' data-nature='watermm'>${red}</span>`;
          return `<div class='center text'>当前“储”：${cards.length}（${str1}|${str2}）</div>`;
        },
        check(event, player) {
          return get.effect(player, { name: "draw" }, player, player) + 1;
        },
        async content(event, trigger, player) {
          await player.draw(2);
          const color = trigger.card.name == "sha" ? ["black", "黑"] : ["red", "红"];
          if (!player.countCards("he", c => get.color(c, player) == color[0])) return;
          else {
            let str = lib.skill.jlsg_chuyuan.prompt2(trigger, player);
            const { result: { bool, cards } } = await player
              .chooseCard("he", `###储元：请选择一张${color[1]}色牌置于武将牌上称为“储”###${str}`)
              .set("color", color)
              .set("filterCard", (card, player, event) => get.color(card, player) == get.event("color")[0])
              .set("ai", card => {
                const player = get.player();
                return 8 - get.value(card, player);
              })
            if (!bool) return;
            await player.addToExpansion(player, cards, "giveAuto").set("gaintag", "jlsg_chuyuan");
            player.markSkill("jlsg_chuyuan");
            player.update();
            game.asyncDelayx();
          }
        },
        group: "jlsg_chuyuan_effect",
        subSkill: {
          effect: {
            mod: {
              maxHandcard(player, num) {
                const cards = player.getExpansions("jlsg_chuyuan"),
                  black = cards.filter(i => get.color(i) == "black").length,
                  red = cards.filter(i => get.color(i) == "red").length;
                let eff = Math.min(black, red);
                return num + eff;
              },
            },
            trigger: { player: "phaseDrawBegin1" },
            filter(event, player) {
              const cards = player.getExpansions("jlsg_chuyuan"),
                black = cards.filter(i => get.color(i) == "black").length,
                red = cards.filter(i => get.color(i) == "red").length;
              let num = Math.min(black, red);
              return !event.fixed && num > 0;
            },
            forced: true,
            popup: false,
            content() {
              const cards = player.getExpansions("jlsg_chuyuan"),
                black = cards.filter(i => get.color(i) == "black").length,
                red = cards.filter(i => get.color(i) == "red").length;
              let num = Math.min(black, red);
              trigger.num += num;
            },
          },
        },
      },
      jlsg_dengji: {
        audio: "ext:极略:2",
        intro: {
          nocount: true,
          content: "limited",
        },
        derivation: ["jlsg_renzheng", "jlsg_jiquan"],
        trigger: { player: "phaseZhunbeiBegin" },
        filter(event, player) {
          let num = player.countExpansions("jlsg_chuyuan");
          return num % 2 != 0 && num >= 5;
        },
        juexingji: true,
        limited: true,
        skillAnimation: true,
        forced: true,
        async content(event, trigger, player) {
          player.awakenSkill("jlsg_dengji");
          const cards = player.getExpansions("jlsg_chuyuan"),
            black = cards.filter(i => get.color(i) == "black").length,
            red = cards.filter(i => get.color(i) == "red").length;
          const num = Math.min(black, red);
          await player.gain(player, cards, "giveAuto", true);
          player.disableSkill("jlsg_dengji_awake", "jlsg_chuyuan");
          if (num == black) await player.addSkills(["jlsg_renzheng"]);
          else await player.addSkills(["jlsg_jiquan"]);
          const characters = lib.skill.jlsg_dengji.getCharacters();
          var skills = [];
          for (const name of characters) {
            if (!get.character(name)) continue;
            const skills2 = get.character(name)[3];
            if (!skills2 || !skills2.length) continue;
            for (let j = 0; j < skills2.length; j++) {
              if (player.hasSkill(skills2[j])) continue;
              else if (skills.includes(skills2[j])) continue;
              const info = lib.skill[skills2[j]];
              if (!info || (!info.trigger && !info.enable && !info.mod) || info.silent || info.hiddenSkill || (info.zhuSkill && !player.isZhu2())) continue;
              if (info.ai && (info.ai.combo && !player.hasSkill(info.ai.combo))) continue;
              skills.add(skills2[j]);
            };
          };
          if (skills.length) {
            if (skills.length >= num) skills = skills.randomGets(num);
            await player.addSkills(skills);
          }
        },
        getCharacters() {
          const name = [
            '曹操', '曹芳', '曹奂', '曹髦', '曹丕',
            '曹睿', '曹叡', '董卓', '公孙度', '公孙恭',
            '公孙康', '公孙渊', '公孙瓒', '郭汜', '韩遂',
            '李傕', '刘备', '刘辩', '刘表', '刘禅',
            '刘琮', '刘宏', '刘琦', '刘协', '刘焉',
            '刘繇', '刘璋', '吕布', '马超', '马腾',
            '孟获', '士燮', '司马炎', '司马昭', '孙策',
            '孙登', '孙皓', '孙坚', '孙亮', '孙权',
            '孙休', '陶谦', '王朗', '袁尚', '袁绍',
            '袁术', '袁谭', '袁熙', '张角', '张鲁',
          ];
          if (!_status.characterlist) {
            let list = [];
            if (_status.connectMode) list = get.charactersOL();
            else {
              for (var i in lib.character) {
                if (!lib.filter.characterDisabled2(i) && !lib.filter.characterDisabled(i)) list.push(i);
              };
            }
            game.countPlayer2(function (current) {
              list.remove(current.name);
              list.remove(current.name1);
              list.remove(current.name2);
            });
            _status.characterlist = list;
          }
          let list = _status.characterlist.filter(i => {
            const str1 = get.translation(i);
            return name.some(i => str1.indexOf(i) > -1 && str1.lastIndexOf(i) > -1);
          });
          return list.randomSort();
        },
        ai: {
          combo: "jlsg_chuyuan",
        },
      },
      jlsg_jiquan: {
        audio: "ext:极略:1",
        enable: "phaseUse",
        usable: 1,
        filterTarget: lib.filter.notMe,
        selectTarget: [1, Infinity],
        multitarget: true,
        multiline: true,
        async content(event, trigger, player) {
          event.targets.sortBySeat();
          for (let target of event.targets) {
            if (player.ai.shown > target.ai.shown && get.attitude(player, target) < -1) {
              player.addExpose(0.1);
            }
          }
          let history = player.getAllHistory('useSkill', e => e.skill == 'jlsg_jiquan');
          for (let target of event.targets) {
            if (!player.isIn()) {
              return;
            }
            if (!target.isIn()) {
              continue;
            }
            let cnt = history.filter(e => e.event.targets.includes(target)).length;
            cnt = Math.min(cnt, 3);
            let index;
            let valid0 = cnt <= target.countGainableCards(player, 'he');
            let valid1 = target.getSkills(null, false, false).length != 0;
            if (!valid0 && !valid1) {
              continue;
            }
            if (!valid0) {
              index = 1;
            }
            else if (!valid1) {
              index = 0;
            }
            else {
              ({ result: { index } } = await target.chooseControlList([
                `交给${get.translation(player)}${get.cnNumber(cnt)}张牌`,
                `交给${get.translation(player)}一个技能`,
              ], true, () => _status.event.choice,
              ).set('choice', cnt != 3 ? 0 : 1));
            }
            switch (index) {
              case 0:
                await target.chooseToGive(player, cnt, 'he', true);
                break;
              case 1:
                let skills = target.getSkills(null, false, false).map(s => [s, get.translation(s)]);
                let { result } = await target.chooseButton([
                  `选择一个技能交给${get.translation(player)}`,
                  [skills, 'tdnodes'],
                ], true);
                if (result.bool) {
                  let skill = result.links[0];
                  target.popup(skill, 'gray');
                  player.popup(skill);
                  await Promise.all([
                    target.removeSkills(skill),
                    player.addSkills(skill),
                  ]);
                }
                break;
            }
          }
          if (player.maxHp <= event.targets.map(p => p.maxHp || 0).reduce((a, b) => a + b, 0)) {
            player.gainMaxHp();
            player.recover();
          }
        },
        ai: {
          threaten: 3,
        }
      },
      translate: {
        jlsg_dengji_info: "觉醒技，回合开始阶段，若你的「储」数为单数且不小于5，你获得所有「储」并失去〖储元〗；若以此法获得的黑色「储」多于红色「储」，你获得〖极权〗；否则你获得〖仁政〗。每以此法获得一张黑色「储」和红色「储」，你随机获得一个君主技。",
      },
    },
    //SK神曹仁
    jlsgsoul_caoren: {
      jlsg_bamen: {
        audio: "ext:极略:2",
        trigger: { player: 'phaseUseBegin' },
        forced: true,
        async content(event, trigger, player) {
          await player.chooseToDiscard(true, 'h', player.countCards('h'));
          let list = [];
          for (let i = 0; i < ui.cardPile.childElementCount; i++) {
            const card = ui.cardPile.childNodes[i];
            const name = get.name(card, false);
            if (list.some(c => get.name(c, false) === name)) {
              if (name == "sha") {
                if (list.some(c => c.name == "sha" && get.nature(card) === get.nature(c))) continue;
              }
              else continue;
            }
            list.add(card);
            if (list.length >= 8) break;
          };
          if (list.length) await player.gain(list, "draw2");
          if (list.length < 8) {
            const { result } = await player.chooseTarget(`八门：请选择一名其他角色受到${8 - list.length}点雷电伤害`, lib.filter.notMe)
              .set('ai', target => get.damageEffect(target, _status.event.player, _status.event.player, 'thunder'));
            if (result.bool && result.targets) await result.targets[0].damage("thunder", 8 - list.length);
          }
        },
      },
      jlsg_gucheng: {
        audio: "ext:极略:2",
        init(player) { player.storage.jlsg_gucheng = [] },
        onremove: true,
        mod: {
          aiOrder(player, card, num) {
            if (!['basic', 'trick'].includes(get.type(card))) return;
            let used = player.storage.jlsg_gucheng;
            if (used.some(i => i.name == card.name)) {
              if (card.name == "sha") {
                if (used.some(i => i.name == "sha" && i.nature == get.nature(card))) return;
              }
              else return;
            }
            if (game.hasPlayer(cur => {
              if (cur == player) return false;
              player.storage.jlsg_gucheng_check = true;
              if (-get.effect(player, card, cur, player) > player.getUseValue(card)) {
                delete player.storage.jlsg_gucheng_check;
                return true;
              };
              delete player.storage.jlsg_gucheng_check;
              return false;
            })) return 0;
          },
        },
        mark: true,
        intro: {
          content(_, player, skill) {
            let used = player.storage.jlsg_gucheng;
            if (!used.length) return '';
            return '使用过：' + used.map(n => get.translation(n)).join(' ');
          },
        },
        trigger: {
          player: "useCard",
          global: 'useCardToPlayered',
        },
        firstDo: true,
        forced: true,
        popup: false,
        filter: function (event, player) {
          if (event.name == "useCardToPlayered") {
            if (event.getParent().excluded.includes(player)) return false;
            if (event.player == player) return false;
            if (!(event._targets || event.targets).includes(player)) return false;
          }
          if (!['basic', 'trick'].includes(get.type(event.card))) return false;
          let card = { name: event.card.name, nature: get.nature(event.card) },
            used = player.storage.jlsg_gucheng;
          if (card.name != "sha") return !used.some(i => i.name == card.name);
          return !used.some(i => i.name == "sha" && i.nature == card.nature);
        },
        async content(event, trigger, player) {
          if (trigger.name == "useCardToPlayered") {
            await player.logSkill("jlsg_gucheng");
            trigger.getParent().excluded.add(player);
          }
          else {
            let card = { name: trigger.card.name, nature: get.nature(trigger.card) };
            player.storage.jlsg_gucheng.add(card);
            player.markSkill("jlsg_gucheng");
          }
        },
        ai: {
          effect: {
            target: function (card, player, target, current) {
              if (target.storage.jlsg_gucheng_check) return;
              if (player != target && ['basic', 'trick'].includes(get.type(card))) {
                let used = target.storage.jlsg_gucheng;
                if (
                  card.name != "sha" && !used.some(i => i.name == card.name)
                  || card.name == "sha" && !used.some(i => i.name == "sha" && i.nature == card.nature)
                ) return "zeroplayertarget";
              }
            },
          },
        },
      },
    },
    //SK神大乔
    jlsgsoul_daqiao: {
      jlsg_wangyue: {
        audio: "ext:极略:2",
        trigger: {
          global: ['loseAfter', 'loseAsyncAfter', 'loseHpAfter', 'loseMaxHpAfter'],
        },
        getIndex(event, player) {
          const name = event.name == "loseAsync" ? "lose" : event.name;
          if (name == "lose") return game.filterPlayer(current => {
            return event.getl(current) && event.getl(current).cards2.length;
          }).sortBySeat(_status.currentPhase);
          return event.player;
        },
        filter(event, player, triggername, target) {
          const name = event.name == "loseAsync" ? "lose" : event.name;
          const filterx = !player.hasHistory("useSkill", evt => {
            if (evt.skill != "jlsg_wangyue") return false;
            return evt.event._result.cost_data == name;
          });
          if (!filterx) return false;
          if (name == 'lose') return event.type == 'discard';
          else if (name == 'loseHp') return game.hasPlayer(p => p.isDamaged());
          else return target?.isIn();
        },
        async cost(event, trigger, player) {
          let prompt = `望月:令一名角色`;
          const name = trigger.name == "loseAsync" ? "lose" : trigger.name;
          if (name == 'lose') prompt += `摸${trigger.getl(event.indexedData).cards2.length}张牌`;
          else if (name == 'loseHp') prompt += `回复${trigger.num}点体力`;
          else prompt += `加${trigger.num}点体力上限`;
          const { result } = await player.chooseTarget(prompt)
            .set("filterTarget", (_, player, target) => {
              return target != _status.event.source;
            })
            .set("ai", (target) => {
              const player = get.player(),
                name = get.event("key");
              if (name == "lose") return get.effect(target, { name: "draw" }, player, player);
              else if (name == "loseHp") return get.recoverEffect(target, player, player);
              else return get.attitude(player, target);
            })
            .set("key", name)
            .set("source", event.indexedData);
          event.result = result;
          if (result.bool) event.result.cost_data = name;
        },
        async content(event, trigger, player) {
          let target = event.targets[0];
          if (target.ai.shown > player.ai.shown) player.addExpose(0.2);
          let name = event.cost_data;
          if (name == 'lose') await target.draw(trigger.num, player);
          else if (name == 'loseHp') await target.recover(trigger.num, player);
          else await target.gainMaxHp(trigger.num);
        },
      },
      translate: {
        jlsg_wangyue_info: "当一名角色弃牌/失去体力/减体力上限后，你可以令另一名角色摸牌/回复体力/加体力上限，每项每回合限一次。",
      },
    },
    //SP神貂蝉
    jlsgsoul_sp_diaochan: {
      jlsg_lihun: {
        audio: "ext:极略:2",
        trigger: { player: 'phaseEnd' },
        filter: () => true,
        async cost(event, trigger, player) {
          event.result = await player.chooseTarget(get.prompt2("jlsg_lihun"), lib.filter.notMe)
            .set('ai', target => {
              return get.rank(target) - get.attitude(get.player(), target);
            })
            .forResult()
        },
        async content(event, trigger, player) {
          const target = event.targets[0];
          target.addTempSkill('jlsg_lihun_buff', { player: 'phaseAfter' });
          player.storage.jlsg_lihun = target;
          target.insertPhase("jlsg_lihun");
        },
        group: "jlsg_lihun_swapControl",
        subSkill: {
          swapControl: {
            trigger: {
              global: ["phaseBeginStart", "phaseAfter", "dieEnd"],
            },
            filter(event, player) {
              if (!player.storage.jlsg_lihun) return false;
              return player.storage.jlsg_lihun == event.player;
            },
            charlotte: true,
            forceDie: true,
            forced: true,
            popup: false,
            content() {
              if (
                event.triggername == "phaseBeginStart"
                && (!trigger.player._trueMe || trigger.player._trueMe != player)
              ) {
                trigger.player._trueMe = player;
                game.addGlobalSkill("autoswap");
                if (trigger.player == game.me) {
                  game.notMe = true;
                  if (!_status.auto) ui.click.auto();
                }
              }
              else {
                if (trigger.player == game.me) {
                  if (!game.notMe) game.swapPlayerAuto(trigger.player._trueMe);
                  else delete game.notMe;
                  if (_status.auto) ui.click.auto();
                }
                delete player.storage.jlsg_lihun;
                delete trigger.player._trueMe;
              }
            },
          },
          buff: {
            mark: true,
            marktext: '离',
            intro: {
              name: '离魂',
              content: '使用牌无次数距离限制,且可以指定任意角色为目标,且可指定任意名目标',
            },
            mod: {
              cardUsable: () => true,
              targetInRange: () => true,
              playerEnabled: (card, player, target) => {
                let info = get.info(card);
                if (!info) return;
                if (info.modTarget) {
                  if (typeof info.modTarget == 'boolean') return info.modTarget;
                  else if (typeof info.modTarget == 'function') return Boolean(info.modTarget(card, player, target));
                }
                if (info.selectTarget) return true;
              },
              selectTarget(card, player, num) {
                if (get.info(card).allowMultiple === false) {
                  if (num[1] < 0) {
                    if (num[0] === num[1]) num[0] = 1;
                    num[1] = 1;
                  }
                  return;
                }
                if (num[1] > 0) {
                  num[1] = Infinity;
                  return;
                }
                else if (num[0] <= -1 || num[1] <= -1) {
                  num[0] = 1;
                  num[1] = Infinity;
                  return;
                }
                if (get.info(card, player).filterTarget) {
                  num[0] = 1;
                  num[1] = Infinity;
                  return;
                }
              },
            },
          },
        }
      },
      jlsg_jueshi: {
        audio: "ext:极略:2",
        priority: 114514,
        forced: true,
        trigger: { player: 'showCharacterEnd' },
        delay: false,
        init: function (player) {
          if (player.hasSkill('jlsg_jueshi')) {
            player.useSkill('jlsg_jueshi');
          };
        },
        filter: function (event, player) {
          return player.maxHp != 1;
        },
        content: function () {
          player.maxHp = 1;
          player.update();
        },
        group: ['jlsg_jueshi2', 'jlsg_jueshi_guard'],
        subSkill: {
          guard: {
            audio: 'jlsg_jueshi',
            charlotte: true,
            forced: true,
            trigger: { player: ['gainMaxHpBefore', 'loseMaxHpBefore'] },
            filter: function (event, player) {
              return player.hasSkill('jlsg_jueshi');
            },
            content: function () {
              trigger.cancel();
            },
          }
        },
      },
    },
    //SP神甘宁
    jlsgsoul_sp_ganning: {
      jlsg_jieying2: {
        sourceSkill: "jlsg_jieying",
        audio: "jlsg_jieying",
        forced: true,
        locked: false,
        firstDo: true,
        trigger: { global: ['drawBefore', 'recoverBefore', 'gainMaxHpBefore', 'phaseBefore', 'changeSkillsBefore'] },
        filter(event, player) {
          if (!event.player.countMark('jlsg_jieying')) {
            return false;
          }
          if (event.player == player) {
            return false;
          }
          if (event.name == 'phase') {
            return event.skill;
          }
          if (event.name == 'changeSkills') {
            return event.addSkill.length
              && !(
                player.countMark('jlsg_jieying')
                && game.hasPlayer(p => p != player && p.hasSkill('jlsg_jieying'))
              );
          }
          return true;
        },
        logTarget: 'player',
        content() {
          if (trigger.name != 'changeSkills') {
            trigger.player.removeMark('jlsg_jieying');
            trigger.player = player;
            event.finish();
            return;
          }
          let changed = trigger.addSkill;
          trigger.addSkill = [];
          trigger.player.removeMark('jlsg_jieying');
          player.addSkills(changed);
        },
      },
      jlsg_jinlong: {
        audio: "ext:极略:2",
        intro: {
          content: 'expansion',
          markcount: 'expansion',
        },
        mod: {
          globalFrom: function (from, to, distance) {
            var num = distance + from.getExpansions('jlsg_jinlong')
              .map(c => {
                let d = get.info(c).distance;
                return d && d.globalFrom;
              })
              .reduce((a, b) => a + (b ? b : 0), 0);
            return num;
          },
          globalTo: function (from, to, distance) {
            var num = distance + to.getExpansions('jlsg_jinlong')
              .map(c => {
                let d = get.info(c).distance;
                return d && d.globalTo;
              })
              .reduce((a, b) => a + (b ? b : 0), 0);
            return num;
          },
        },
        trigger: {
          player: 'gainAfter',
          global: ['loseAfter', 'cardsDiscardAfter', 'loseAsyncAfter', 'equipAfter'],
        },
        forced: true,
        filter(event, player) {
          if (event.getg && event.getg(player)) return event.getg(player).some(c => c.name != "muniu" && get.type(c) == 'equip');
          if (event.name == "cardsDiscard") {
            const evt = event.getParent().relatedEvent;
            if (evt && evt.name != "judge") {
              return event.cards.some(i => i.name != "muniu" && get.position(i, true) == "d" && get.type(i) == 'equip');
            }
          } else {
            if (event.getlx !== false) {
              for (const target of game.filterPlayer2()) {
                const evt = event.getl(target);
                if (evt && (evt.cards2 || []).length) {
                  return evt.cards2.some(i => i.name != "muniu" && i.original != "j" && get.position(i, true) == "d" && get.type(i) == 'equip');
                }
              }
            }
          }
          return false;
        },
        content() {
          let cards = [], gain = [];
          if (trigger.getg && trigger.getg(player)) {
            gain = trigger.getg(player).filter(c => c.name != "muniu" && get.type(c) == 'equip');
            player.addToExpansion(gain, "give").gaintag.add("jlsg_jinlong");
          }
          if (trigger.name == "cardsDiscard") {
            const evt = trigger.getParent().relatedEvent;
            if (evt && evt.name != "judge") {
              cards.addArray(trigger.cards.filter(i => i.name != "muniu" && get.position(i, true) == "d" && get.type(i) == 'equip'));
            }
          } else {
            if (trigger.getlx !== false) {
              for (const target of game.filterPlayer2()) {
                const evt = trigger.getl(target);
                if (evt && (evt.cards2 || []).length) {
                  cards.addArray((evt.cards2 || []).filter(i => i.name != "muniu" && i.original != "j" && get.position(i, true) == "d" && get.type(i) == 'equip'));
                }
              }
            }
          }
          player.addToExpansion(cards, "gain2").gaintag.add(event.name);
          player.addAdditionalSkill(event.name, cards.addArray(gain).map(c => get.info(c).skills || []).flat(), true);
          player.draw(cards.concat(gain).unique().length);
        },
      },
      translate: {
        jlsg_jinlong_info: "锁定技，当装备牌被你获得或不因判定而进入弃牌堆后，将之置于你的武将牌上，然后你摸一张牌。你视为拥有这些装备牌的技能。",
        jlsg_jinlong_append: '<span style="font-family: yuanli">木牛流马由于需要实体牌作为存储基础，故排除在外</span>'
      }
    },
    //SK神关羽
    jlsgsoul_guanyu: {
      jlsg_suohun: {
        audio: "ext:极略:1",
        trigger: {
          player: 'damageEnd',
          source: 'damageSource',
        },
        filter: function (event, player, name) {
          if (name == "damageEnd") return event.source && event.source != player;
          return event.player != player && event.player?.isIn();
        },
        forced: true,
        init: function (player) {
          for (var i = 0; i < game.players.length; i++) {
            game.players[i].storage.jlsg_suohun_mark = 0;
          }
        },
        content: function () {
          var target = trigger.source, cnt = trigger.num;
          if (trigger.source == player) {
            target = trigger.player;
            cnt = 1;
          }
          if (!target.storage.jlsg_suohun_mark) {
            target.storage.jlsg_suohun_mark = 0;
          }
          target.storage.jlsg_suohun_mark += cnt;
          target.syncStorage('jlsg_suohun_mark');
          target.markSkill('jlsg_suohun_mark');
        },
        global: ['jlsg_suohun_mark'],
        subSkill: {
          mark: {
            forced: true,
            charlotte: true,
            mark: true,
            onremove: true,
            marktext: '魂',
            intro: {
              content: '共有#个标记'
            }
          }
        },
        group: ['jlsg_suohun2'],
        ai: {
          maixie_defend: true,
        }
      },
      translate: {
        jlsg_suohun_info: '锁定技，当你对其他角色造成伤害后，或当你受到其他角色造成的1点伤害后，其获得一个「魂」标记。当你进入濒死状态时，减一半(向上取整)的体力上限并恢复体力至体力上限，拥有「魂」标记的角色依次弃置所有的「魂」标记，然后受到与弃置的「魂」标记数量相同的伤害。',
      },
    },
    //SP神黄月英
    jlsgsoul_sp_huangyueying: {
      jlsg_linglong: {
        audio: "ext:极略:2",
        trigger: { player: ['damageBegin3', 'loseHpBefore', 'loseMaxHpBefore', 'changeSkillsBefore'] },
        filter: function (event, player) {
          if (event.name == 'damage') {
            if (!event.source || event.source == player) return false;
          }
          else if (event.name == 'changeSkills') {
            if (!event.removeSkill.length) return false;
            if (event.getParent().name == 'jlsg_linglong') return false;
            return lib.skill.jlsg_linglong.validTargets(player, event.removeSkill).length;
          }
          return lib.skill.jlsg_linglong.validTargets(player).length;
        },
        direct: true,
        content: function () {
          'step 0'
          var targets = lib.skill.jlsg_linglong.validTargets(player, trigger.removeSkill);
          var prompt = `###${get.prompt(event.name)}###选择失去技能的角色`;
          if (trigger.name == 'changeSkills') {
            prompt += `来抵消失去${trigger.removeSkill.map(s => `【${get.translation(s)}】`).join("")}`;
          } else {
            let eff = {
              "damage": "受到伤害",
              "loseHp": "失去体力",
              "loseMaxHp": "扣减体力上限",
            }[trigger.name];
            prompt += `来抵消或转移<span style="font-weight: bold;">${eff}</span>效果`;
          }
          player.chooseTarget(prompt, (_, player, target) => {
            return _status.event.targets.includes(target);
          })
            .set('ai', (target, targets) => Math.random())
            .set('targets', targets);
          'step 1'
          if (!result.bool) {
            event.finish();
            return;
          }
          var target = result.targets[0];
          event.target = target;
          var skills;
          if (target == player) {
            skills = lib.skill.jlsg_linglong.validSkillsSelf(target, trigger.removeSkill);
          } else {
            skills = lib.skill.jlsg_linglong.validSkillsOthers(target);
          }
          if (!skills.length) {
            event.finish();
            return;
          }
          player.logSkill(event.name, target);
          if (skills.length == 1) {
            event._result = {
              bool: true,
              links: skills,
            };
            return;
          }
          var next = player.chooseButton([
            `玲珑:请选择${get.translation(target)}失去的技能`,
            [skills.map(s => [s, get.translation(s)]), 'tdnodes'],
          ]);
          next.set('forced', true);
          if (trigger.name == 'changeSkills' && trigger.removeSkill.length > 1) {
            next.set('selectButton', [1, trigger.removeSkill.length]);
          }
          'step 2'
          if (!result.bool) {
            event.finish();
            return;
          }
          var target = event.target;
          target.removeSkills(result.links);
          if (trigger.name != 'changeSkills') {
            if (target == player) {
              trigger.neutralize();
            } else {
              trigger.player = target;
            }
            event.finish();
            return;
          }
          if (result.links.length >= trigger.removeSkill.length) {
            event._result = {
              bool: true,
              links: trigger.removeSkill.slice(),
            };
            return;
          }
          var next = player.chooseButton([
            `玲珑:请选择${get.translation(result.links.length)}个技能不被失去`,
            [trigger.removeSkill.map(s => [s, get.translation(s)]), 'tdnodes'],
          ]);
          next.set('forced', true);
          next.set('selectButton', result.links.length);
          'step 3'
          if (!result.bool) {
            event.finish();
            return;
          }
          trigger.removeSkill.removeArray(result.links);
          game.log(player, '失去', ...result.links.map(i => {
            return '#g【' + get.translation(i) + '】';
          }), '技能的效果被抵消了');
          if (!trigger.addSkill.length && !trigger.removeSkill.length) {
            trigger.neutralize();
          }
        },
        validSkillsSelf: function (player, ignoreSkills) {
          let skills = player.getSkills(null, false, false)
            .removeArray(player.getStockSkills())
            .filter(s => lib.translate[s] && lib.translate[s + '_info'] && lib.skill[s] && !lib.skill[s].charlotte);
          if (ignoreSkills) skills.removeArray(ignoreSkills);
          return skills;
        },
        validSkillsOthers: function (player) {
          return player.getSkills(null, false, false).filter(s => s.startsWith('jlsg_tiangong_jiguan_'));
        },
        validTargets: function (player, ignoreSkills) {
          let result = game.filterPlayer(p => p != player
            && lib.skill.jlsg_linglong.validSkillsOthers(p).length
          );
          let skills = lib.skill.jlsg_linglong.validSkillsSelf(player, ignoreSkills);
          if (skills.length) result.push(player);
          return result;
        },
      },
      translate: {
        jlsg_tiangong_info: "游戏开始/回合开始/回合结束时，你可以创造2/1/1个机关技能并令一名角色获得之。场上至多有七个机关技能。",
      },
    },
    //SK神黄忠
    jlsgsoul_huangzhong: {
      jlsg_liegong: {
        audio: "ext:极略:2",
        enable: 'chooseToUse',
        complexCard: true,
        locked: false,
        filterCard: function (card) {
          var suit = get.suit(card);
          for (var i = 0; i < ui.selected.cards.length; i++) {
            if (get.suit(ui.selected.cards[i]) == suit) return false;
          }
          return true;
        },
        viewAsFilter: function (player) {
          let cnt = player.storage.jlsg_liegong_used ?? 0;
          return player.countCards('h') && cnt < (player.isDamaged() ? 2 : 1);
        },
        selectCard: [1, 4],
        viewAs: {
          name: 'sha',
          nature: 'fire',
          jlsg_liegong: true,
        },
        check: function (card) {
          var val = get.value(card);
          return 10 - val;
        },
        precontent() {
          "step 0"
          player.addTempSkill("jlsg_liegong_used");
          player.storage.jlsg_liegong_used++;
        },
        mod: {
          targetInRange: function (card, player) {
            if (card.jlsg_liegong) return true;
          },
          cardUsable: function (card, player) {
            if (card.jlsg_liegong) return Infinity;
          },
        },
        group: ['jlsg_liegong2', 'jlsg_liegong3'],
        subSkill: {
          used: {
            init(player) {
              player.storage.jlsg_liegong_used = 0;
            },
            onremove: true,
            charlotte: true,
            sub: true,
          },
        },
        ai: {
          fireDamage: true,
          directHit_ai: true,
        },
      },
      jlsg_liegong2: {
        sourceSkill: "jlsg_liegong",
        silent: true,
        charlotte: true,
        trigger: {
          player: 'useCard',
        },
        filter(event, player) {
          return event.card.name == "sha" && event.card.jlsg_liegong && event.cards;
        },
        content() {
          let cnt = trigger.cards.length;
          if (cnt >= 1) {
            trigger.directHit.addArray(game.players);
          }
          if (cnt >= 2) {
            player.when({ player: "useCardToAfter" })
              .filter(evt => evt.parent == trigger)
              .then(() => {
                if (trigger.card.name == "sha" && trigger.card.jlsg_liegong && trigger.cards.length >= 2) {
                  player.draw(3);
                }
              })
          }
          if (cnt >= 3) {
            trigger.baseDamage++;
          }
        }
      },
      jlsg_liegong3: {
        sourceSkill: "jlsg_liegong",
        silent: true,
        charlotte: true,
        trigger: {
          source: 'damageSource',
        },
        filter(event, player) {
          let skills = event.player.getSkills(null, false, false).filter(skill => {
            var info = get.info(skill);
            if (!info || get.is.empty(info) || info.charlotte) return false;
            return true;
          });
          return event.card && event.card.name == "sha" && event.card.jlsg_liegong && event.notLink()
            && event.cards.length >= 4 && skills.length;
        },
        content() {
          let skill = trigger.player.getSkills(null, false, false).filter(skill => {
            var info = get.info(skill);
            if (!info || get.is.empty(info) || info.charlotte) return false;
            return true;
          }).randomGet();
          // TODO: make popup synced
          trigger.player.popup(skill, 'gray');
          trigger.player.removeSkills(skill);
        },
      },
    },
    //SP神吕布
    jlsgsoul_sp_lvbu: {
      jlsg_luocha: {
        audio: "ext:极略:2",
        initList: function () {
          if (!_status.characterlist) {
            lib.skill.pingjian.initList();
          }
          _status.jlsg_luocha_list = [];
          _status.jlsg_luocha_list_hidden = [];
          for (var c of _status.characterlist) {
            if (!get.character(c)) continue;
            let list = (get.character(c)[3] ?? []).filter(s => lib.skill[s] && lib.translate[s] && lib.translate[s + '_info']);
            _status.jlsg_luocha_list.addArray(
              list.filter(s => lib.skill[s].shaRelated)
            );
            _status.jlsg_luocha_list_hidden.addArray(
              list.filter(s => get.skillInfoTranslation(s, get.player()).includes('【杀】'))
            );
          }
        },
        trigger: {
          player: "enterGame",
          global: ["phaseBefore", "dying"],
        },
        forced: true,
        filter: function (event, player, name) {
          if (name == "dying") return event.player != player;
          return event.name != 'phase' || game.phaseNumber == 0;
        },
        async content(event, trigger, player) {
          if (!_status.jlsg_luocha_list || !_status.jlsg_luocha_list_hidden) {
            lib.skill.jlsg_luocha.initList();
          }
          let num = event.triggername == "dying" ? 1 : 3;
          if (num == 1) await player.draw(2);
          if (!_status.jlsg_luocha_list.length && !_status.jlsg_luocha_list_hidden.length) {
            game.log("没有可以获得的技能了");
          } else {
            let list1 = _status.jlsg_luocha_list.filter(s => !player.hasSkill(s)).randomSort(),
              list2 = _status.jlsg_luocha_list_hidden.filter(s => !player.hasSkill(s)).randomSort()
            let skills = list1.concat(list2).unique().randomGets(num);
            if (!skills.length) game.log("没有可以获得的技能了");
            else await player.addSkills(skills);
          }
          await game.delayx();
        },
      },
      delete: ['jlsg_luocha2'],
    },
    //SK神吕蒙
    jlsgsoul_lvmeng: {
      jlsg_shelie: {
        audio: "ext:极略:1",
        trigger: {
          player: "useCard",
        },
        filter(event, player) {
          return !player.hasHistory("useSkill", evt => {
            return evt.skill == "jlsg_shelie" && evt.event.type0 == get.type2(event.card);
          });
        },
        frequent: true,
        popup: false,
        content() {
          let type0 = get.type2(trigger.card);
          event.type0 = type0;
          const cards = [get.cardPile2(c => get.type2(c) != type0)];
          if (!cards[0]) return;
          let type1 = get.type2(cards[0]);
          let card2 = get.cardPile2(c => get.type2(c) != type0 && get.type2(c) != type1);
          if (card2) cards.push(card2);
          player.logSkill("jlsg_shelie");
          player.gain(cards, 'gain2');
        },
      },
      jlsg_gongxin: {
        audio: "ext:极略:1",
        enable: 'phaseUse',
        usable: 1,
        filterTarget: function (card, player, target) {
          return target != player && target.countCards('h');
        },
        async content(event, trigger, player) {
          const target = event.target;
          game.log(player, '观看了', target, '的手牌');
          const { result: result1 } = await player.gainPlayerCard(target, 'h', 'visible', 'visibleMove');
          if (!result1.bool) return;
          if (!target.countCards("h")) return;
          const card = result1.cards[0];
          let prompt = `###是否弃置${get.translation(target)}一张牌？###令${get.translation(target)}不能使用或打出其余花色的牌`;
          const { result: result2 } = await player.discardPlayerCard(prompt, target, 'h', 'visible')
            .set('target', target)
            .set('suit', get.suit(card, target))
            .set("filterButton", button => get.suit(button.link, get.event("target")) != get.event("suit"))
            .set('ai', button => get.value(button.link, get.event("target")))
          if (!result2.bool) return;
          const suits = [
            get.suit(card, target),
            get.suit(result2.cards[0], target),
          ];
          target.storage.jlsg_gongxin2 = target
            .getStorage('jlsg_gongxin2')
            .addArray(lib.suit.filter(s => !suits.includes(s)));
          target.addTempSkill('jlsg_gongxin2');
        },
        ai: {
          result: {
            target: function (player, target) {
              return -target.countCards('h');
            }
          },
          order: 10,
        }
      },
      translate: {
        jlsg_shelie_info: "当你使用牌时，你从牌堆中随机获得两张与此牌列别不同的牌，每回合每种类别限一次。",
      },
    },
    //SK司马徽
    jlsgsoul_simahui: {
      jlsg_zhitian: {
        audio: "ext:极略:1",
        trigger: { player: 'phaseBegin' },
        forced: true,
        unique: true,
        content: function () {
          "step 0"
          if (!_status.characterlist) {
            lib.skill.pingjian.initList();
          }
          _status.characterlist.randomSort();
          var list = [];
          var skills = [];
          var map = [];
          for (var i = 0; i < _status.characterlist.length; i++) {
            var name = _status.characterlist[i];
            if (name.indexOf('zuoci') != -1 || name.indexOf('xushao') != -1) continue;
            if (!get.character(name)) continue;
            var skills2 = (get.character(name)[3] ?? []);
            if (!skills2.length) continue;
            for (var j = 0; j < skills2.length; j++) {
              if (skills.includes(skills2[j])) {
                list.add(name);
                if (!map[name]) map[name] = [];
                map[name].push(skills2[j]);
                skills.add(skills2[j]);
                continue;
              }
              var list2 = [skills2[j]];
              game.expandSkills(list2);
              for (var k = 0; k < list2.length; k++) {
                var info = lib.skill[list2[k]];
                if (!info || info.silent || info.hiddenSkill || info.unique || info.charlotte) continue;
                list.add(name);
                if (!map[name]) map[name] = [];
                map[name].push(skills2[j]);
                skills.add(skills2[j]);
              }
            }
            if (list.length > 2) break;
          };
          if (!skills.length) event.finish();
          else {
            player.chooseControl(skills)
              .set('dialog', ['选择一个技能', [list, 'character']])
              .set('ai', function () { return Math.floor(Math.random() * _status.event.controls.length); });
          }
          "step 1"
          if (!lib.skill[result.control]) return;
          event.skill = result.control;
          player.chooseTarget(true)
            .set('prompt2', '将所有手牌交给一名角色')
            .set('ai', function (target) {
              return get.attitude(player, target);
            });
          "step 2"
          if (!result.bool) return;
          if (result.targets[0] == player) return;
          player.line(result.targets[0], 'green');
          var cards = player.getCards('h');
          result.targets[0].gain(cards, player, 'giveAuto');
          "step 3"
          result.targets[0].addSkills(event.skill);
          result.targets[0].loseHp();
        },
      },
      translate: {
        jlsg_zhitian_info: "锁定技,你的回合开始时,系统从剩余武将堆随机挑选三张,你须选择其中一个技能,然后将所有手牌交给一名角色,并令该角色获得此技能,然后该角色失去一点体力.",
      },
    },
    //SK神小乔
    jlsgsoul_xiaoqiao: {
      jlsg_xingwu: {
        marktext: "舞",
        intro: { content: "mark" },
        audio: "ext:极略:2",
        trigger: { global: "phaseBegin" },
        filter(event, player) {
          return player.countDiscardableCards(player, "h", card => get.suit(card, player) == "heart");
        },
        async cost(event, trigger, player) {
          let str;
          if (!trigger.player.hasMark("jlsg_xingwu")) str = `星舞：是否弃置一张红桃，令${get.translation(trigger.player)}获得一枚“星舞”标记？`;
          else str = `星舞：是否弃置一张红桃，令${get.translation(trigger.player)}的一枚“星舞”标记移动给另一名角色或其再获得一枚“星舞”标记？`
          event.result = await player.chooseCardTarget({
            source: trigger.player,
            filterCard: (card, player, event) => get.suit(card, player) == "heart" && lib.filter.canBeDiscarded(card, player, player, event),
            filterTarget: function (card, player, target) {
              if (target == get.event("source")) return false;
              return get.event("source").hasMark("jlsg_xingwu");
            },
            selectTarget() {
              if (!get.event("source").hasMark("jlsg_xingwu")) return [0, 0];
              else return [0, 1];
            },
            prompt: str,
            targetprompt: "获得标记",
            ai1(card) {
              const player = get.player(),
                source = get.event("source");
              if (get.attitude(player, source) > 1) return get.value(card) < 9;
              else return get.value(card) < (source.countMark("jlsg_xingwu") + 1) ^ 2;
            },
            ai2(target) {
              const player = get.player(),
                source = get.event("source");
              if (get.attitude(player, source) > 1) return 0;
              else return get.attitude(player, target) > 1;
            }
          }).forResult();
          event.result.skill_popup = false;
        },
        async content(event, trigger, player) {
          event.skillstop = true;
          await player.logSkill("jlsg_xingwu", trigger.player);
          await player.discard(event.cards);
          if (event.targets) {
            trigger.player.line(event.targets[0]);
            trigger.player.removeMark("jlsg_xingwu", 1);
            lib.skill.jlsg_xingwu.loseSkill(trigger.player);
            event.targets[0].addMark("jlsg_xingwu", 1);
            await lib.skill.jlsg_xingwu.gainSkill(event.targets[0]);
          }
          else {
            trigger.player.addMark("jlsg_xingwu", 1);
            await lib.skill.jlsg_xingwu.gainSkill(trigger.player);
          }
          const { result } = await player.chooseBool(`是否令${get.translation(trigger.player)}重新获得【星舞】的技能？`, () => Math.random() < 0.5);
          if (result.bool) {
            let skills = trigger.player.storage.jlsg_xingwu_skill;
            if (!skills) return;
            await trigger.player.removeSkills(skills);
            trigger.player.storage.jlsg_xingwu_skill = [];
            await lib.skill.jlsg_xingwu.gainSkill(trigger.player, true, skills.length);
          }
        },
        get skills() {
          let skills = {},
            list = [];
          if (_status.connectMode) list = get.charactersOL();
          else {
            for (var i in lib.character) {
              if (!lib.filter.characterDisabled2(i) && !lib.filter.characterDisabled(i)) list.push(i);
            }
          };
          for (const i of list) {
            if (i.includes("xushao") || i.includes("zuoci")) continue;
            if (!get.character(i) || !get.character(i)[3]?.length) continue;
            if (lib.filter.characterDisabled(i)) continue;
            if (lib.filter.characterDisabled2(i)) continue;
            if (get.character(i).isBoss) continue;
            if (get.character(i).isHiddenBoss) continue;
            if (get.character(i).isMinskin) continue;
            if (get.character(i).isUnseen) continue;
            let sex = get.character(i, 0);
            skills[sex] = skills[sex] || [];
            for (const skill of get.character(i)[3]) {
              const info = lib.skill[skill];
              if (lib.filter.skillDisabled(skill)) continue;
              if (info?.charlotte) continue;
              skills[sex].add(skill);
            };
          };
          const list2 = game.filterPlayer(undefined, undefined, true).reduce((i, current) => i.addArray(current.getSkills(null, false, false)), []);
          if (list2.length) {
            for (let i in skills) skills[i].removeArray(list);
          };
          return skills;
        },
        gainSkill(target, norecover, cnt = 1) {
          const next = game.createEvent("jlsg_xingwu_gainSkill", false);
          next.player = target;
          next.num = cnt;
          next.norecover = norecover;
          next.setContent(async function (event, trigger, player) {
            if (player.isDamaged() && !norecover) await player.recover();
            let targetSkills = player.getSkills(null, false, false);
            let skills = [];
            const skillList = lib.skill.jlsg_xingwu.skills;
            for (let sex in skillList) {
              if (sex === player.sex) continue;
              skills.addArray(skillList[sex].filter(s => {
                const info = get.info(s);
                if (info.ai?.combo && player.hasSkill) return player.hasSkill(info.ai.combo);
                return !targetSkills.includes(s);
              }));
            };
            skills = skills.randomGets(cnt);
            if (!skills.length) return;
            player.storage.jlsg_xingwu_skill = player.storage.jlsg_xingwu_skill || [];
            player.storage.jlsg_xingwu_skill.addArray(skills);
            await player.addSkills(skills);
          })
          return next;
        },
        loseSkill(target) {
          const next = game.createEvent("jlsg_xingwu_loseSkill", false);
          next.player = target;
          next.setContent(async function (event, trigger, player) {
            await player.loseHp();
            let skills = [];
            let targetSkills = player.getSkills(null, false, false);
            for (let pack in lib.characterPack) {
              for (let c in lib.characterPack[pack]) {
                if (get.character(c, 0) != player.sex) continue;
                skills.addArray(get.character(c)[3].filter(s => targetSkills.includes(s)));
              }
            }
            let skill = skills.randomGet();
            if (skill) await player.removeSkills(skill);
          })
          return next;
        },
        group: ["jlsg_xingwu_start"],
        subSkill: {
          start: {
            audio: "jlsg_xingwu",
            trigger: {
              global: 'phaseBefore',
              player: 'enterGame',
            },
            getIndex(event, player) {
              const array = new Array(player.maxHp + 1)
                .fill(player.maxHp + 1)
                .map((v, i) => v - i);
              return array;
            },
            prompt(event, player, name, num) {
              let prompt = `是否发动<span class="yellowtext">星舞</span>？`;
              if (num <= player.maxHp) prompt += `（可重复${num}次）`
              return prompt;
            },
            filter: function (event, player) {
              return (event.name != 'phase' || game.phaseNumber == 0);
            },
            check: () => true,
            logTarget(event, player) {
              return game.filterPlayer().sortBySeat(player);
            },
            async content(event, trigger, player) {
              const targets = game.filterPlayer();
              for (let i of targets) {
                i.addMark("jlsg_xingwu", 1);
                await lib.skill.jlsg_xingwu.gainSkill(i);
              };
            },
            sourceSkill: "jlsg_xingwu",
          },
        },
      },
      "delete": ["jlsg_xingwu2"],
    },
    //SP神张辽
    jlsgsoul_sp_zhangliao: {
      jlsg_fengying: {
        audio: "ext:极略:2",
        trigger: { player: 'drawBegin' },
        getIndex(event) {
          return event.num;
        },
        filter(event, player) {
          return player.getHistory('useSkill', e => e.skill == 'jlsg_fengying').length < 4;
        },
        direct: true,
        async content(event, trigger, player) {
          const sha = get.autoViewAs({ name: 'sha', nature: 'thunder', isCard: true }, []);
          const { result } = await player.chooseUseTarget(
            "nodistance",
            get.prompt2("jlsg_fengying"),
            sha,
            false,
          )
            .set("logSkill", "jlsg_fengying")
          if (result.bool) --trigger.num;
        }
      },
      jlsg_zhiti: {
        audio: "ext:极略:2",
        trigger: { source: 'damageBegin2' },
        filter(event, player) {
          if (event.player == player) {
            return false;
          }
          return event.player.getStorage('jlsg_zhiti').length < 5;
        },
        direct: true,
        content() {
          'step 0'
          event._options = [
            '取其1点体力和体力上限',
            '取其摸牌阶段的一摸牌数',
            '取其一个技能',
            '令其不能使用装备牌',
            '令其翻面',
          ];
          event.options = event._options.filter(c => !trigger.player.getStorage(event.name).includes(c));
          event.skills = trigger.player.getSkills(null, false, false).filter(i => {
            let info = get.info(i);
            if (!info) return false;
            return !info.persevereSkill && !info.charlotte;
          })
          if (!event.skills.length) {
            event.options.remove(event._options[2]);
          }
          player.chooseControlList(get.prompt(event.name, trigger.player), event.options, function () {
            return Math.floor(Math.random() * _status.event.parent.options.length);
          });
          'step 1'
          if (result.control == 'cancel2') {
            event.finish();
            return;
          }
          player.logSkill(event.name, trigger.player);
          event.choice = event.options[result.index];
          trigger.player.storage[event.name] = trigger.player.getStorage(event.name).concat(event.choice);
          game.log(player, '选择' + event.choice);
          switch (event.choice) {
            case event._options[0]:
              trigger.player.loseHp();
              trigger.player.loseMaxHp();
              break;
            case event._options[1]:
              trigger.player.addSkill('jlsg_zhiti2');
              trigger.player.storage.jlsg_zhiti2 = (trigger.player.storage.jlsg_zhiti2 || 0) - 1;
              break;
            case event._options[2]:
              player.chooseControl(event.skills)
                .set("ai", () => Math.random())
                .set("prompt", `获取${get.translation(trigger.player)}一个技能`);
              break;
            case event._options[3]:
              trigger.player.addSkill('jlsg_zhiti3');
              break;
            case event._options[4]:
              trigger.player.turnOver();
              break;

            default:
              break;
          }
          'step 2'
          switch (event.choice) {
            case event._options[0]:
              player.gainMaxHp();
              player.recover();
              break;
            case event._options[1]:
              player.addSkill('jlsg_zhiti2');
              player.storage.jlsg_zhiti2 = (player.storage.jlsg_zhiti2 || 0) + 1;
              break;
            case event._options[2]:
              trigger.player.removeSkills(result.control);
              player.addSkills(result.control);
              break;

            default:
              break;
          }
          'step 3'
          game.delayx();
        },
      },
    },
    //SP神诸葛亮
    jlsgsoul_sp_zhugeliang: {
      jlsg_yaozhi: {
        audio: "ext:极略:2",
        trigger: {
          player: ['phaseBegin', 'damageEnd', 'phaseJieshuBegin'],
        },
        frequent: true,
        content: function () {
          'step 0'
          if (!player.storage.jlsg_yaozhi) player.storage.jlsg_yaozhi = [];
          player.draw();
          'step 1'
          if (!_status.characterlist) {
            lib.skill.pingjian.initList();
          }
          var list = [];
          var skills = [];
          _status.characterlist.randomSort();
          var name2 = [];
          if (event.triggername == 'phaseBegin') {
            name2.push('phaseZhunbeiBegin');
            name2.push(event.triggername);
          } else { name2.push(event.triggername); }
          for (var i = 0; i < _status.characterlist.length; i++) {
            var name = _status.characterlist[i];
            if (name.indexOf('zuoci') != -1 || name.indexOf('xushao') != -1 || name == 'jlsgsoul_sp_xushao') continue;
            if (!get.character(name)) continue;
            var skills2 = get.character(name)[3];
            for (var j = 0; j < skills2.length; j++) {
              if (player.hasSkill(skills2[j])) continue;
              if (skills.includes(skills2[j])) continue;
              if (player.storage.jlsg_yaozhi.includes(skills2[j])) continue;
              var list2 = [skills2[j]];
              game.expandSkills(list2);
              for (var k = 0; k < list2.length; k++) {
                var info = lib.skill[list2[k]];
                if (!info || !info.trigger || !info.trigger.player || info.silent || info.limited || info.juexingji || info.zhuanhuanji || info.hiddenSkill || info.dutySkill) continue;
                for (var y = 0; y < name2.length; y++) {
                  if (info.trigger.player == name2[y] || Array.isArray(info.trigger.player) && info.trigger.player.includes(name2[y])) {
                    if (info.init || info.ai && (info.ai.combo || info.ai.notemp || info.ai.neg)) continue;
                    if (info.filter) {
                      try {
                        var bool = info.filter(trigger, player, name2[y]);
                        if (!bool) continue;
                      }
                      catch (e) {
                        continue;
                      }
                    }
                    list.add(name);
                    skills.add(skills2[j]);
                    break;
                  }
                }
              }
              if (skills.includes(skills2[j])) {
                break;
              }
            }
            if (skills.length > 2) break;
          }
          player.chooseControl(skills).set('dialog', ['请选择要发动的技能', [list, 'character']]).set('ai', function () { return 0 });
          'step 2'
          player.storage.jlsg_yaozhi.add(result.control);
          var removeT = 'damageAfter';
          if (event.triggername == 'phaseJieshuBegin') {
            removeT = 'phaseJieshuEnd';
          }
          else if (event.triggername == 'phaseBegin') {
            removeT = 'phaseZhunbeiEnd';
          }
          player.addTempSkill(result.control, removeT);
        },
        ai: {
          maixie: true,
          maixie_hp: true,
          effect: {
            target(card, player, target) {
              if (get.tag(card, 'damage')) {
                if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
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
            }
          }
        },
        group: 'jlsg_yaozhi_use',
      },
      jlsg_yaozhi_use: {
        sourceSkill: "jlsg_yaozhi",
        audio: 'jlsg_yaozhi',
        enable: 'phaseUse',
        usable: 1,
        content: function () {
          'step 0'
          if (!player.storage.jlsg_yaozhi) player.storage.jlsg_yaozhi = [];
          player.draw();
          'step 1'
          var list = [];
          var skills = [];
          if (!_status.characterlist) {
            lib.skill.pingjian.initList();
          }
          _status.characterlist.randomSort();
          for (var i = 0; i < _status.characterlist.length; i++) {
            var name = _status.characterlist[i];
            if (name.indexOf('zuoci') != -1 || name.indexOf('xushao') != -1 || name == 'jlsgsoul_sp_xushao') continue;
            var skills2 = get.character(name)[3];
            for (var j = 0; j < skills2.length; j++) {
              if (skills.includes(skills2[j])) continue;
              if (player.hasSkill(skills2[j])) continue;
              if (player.storage.jlsg_yaozhi.includes(skills2[j])) continue;
              if (lib.skill.pingjian.phaseUse_special.includes(skills2[j])) {
                list.add(name);
                skills.add(skills2[j]);
                continue;
              }
              var list2 = [skills2[j]];
              game.expandSkills(list2);
              for (var k = 0; k < list2.length; k++) {
                var info = lib.skill[list2[k]];
                if (!info || !info.enable || info.viewAs || info.limited || info.juexingji || info.zhuanhuanji || info.hiddenSkill || info.dutySkill) continue;
                if (info.enable == 'phaseUse' || Array.isArray(info.enable) && info.enable.includes('phaseUse')) {
                  if (info.init || info.onChooseToUse || info.ai && (info.ai.combo || info.ai.notemp || info.ai.neg)) continue;
                  if (info.filter) {
                    try {
                      var bool = info.filter(event.getParent(2), player);
                      if (!bool) continue;
                    }
                    catch (e) {
                      continue;
                    }
                  }
                  list.add(name);
                  skills.add(skills2[j]);
                  break;
                }
              }
              if (skills.includes(skills2[j])) break;
            }
            if (skills.length > 2) break;
          }
          player.chooseControl(skills).set('dialog', ['请选择要发动的技能', [list, 'character']]).set('ai', function () { return 0 });
          'step 2'
          if (result.control == '摸一张牌') {
            player.draw();
            return;
          }
          player.storage.jlsg_yaozhi.add(result.control);
          player.addTempSkill(result.control, 'phaseUseEnd');
          player.addTempSkill('jlsg_yaozhi_temp', 'phaseUseEnd');
          player.storage.jlsg_yaozhi_temp = result.control;
          //event.getParent(2).goto(0);
        },
        ai: { order: 10, result: { player: 1 } },
      },
    },
  },
  spf: {
    //关羽（水淹七军）
    jlsgsk_syqj_guanyu: {
      jlsg_syqj_wusheng2: {
        sourceSkill: "jlsg_syqj_wusheng",
        audio: false,
        trigger: { player: 'useCardToPlayered' },
        filter(event, player) {
          return event.card.name == "sha" && event.skill === 'jlsg_syqj_wusheng' && event.isFirstTarget;
        },
        silent: true,
        frequent: true,
        content() {
          'step 0'
          player.draw();
          'step 1'
          player.chooseToDiscard(`###${get.prompt(event.name, trigger.targets)}###弃置一~三张手牌，然后目标弃置等量的牌`, [1, 3])
            .set('ai', card => 9 - get.value(card) - (get.color(card) == 'red' ? 1 : 0) - 2 * ui.selected.cards.length + Math.random());
          'step 2'
          if (!result.bool) {
            event.finish();
            return;
          }
          event.cnt = result.cards.length;
          trigger.targets.slice().sortBySeat().forEach(p => p.chooseToDiscard('he', true, event.cnt));
          trigger.getParent().baseDamage += event.cnt;
          player.addTempSkill('jlsg_syqj_wusheng_buff', ['phaseChange', 'phaseAfter']);
          player.addMark('jlsg_syqj_wusheng_buff', event.cnt);
        },
      },
    },
    //吕布（杀破万千）
    jlsgsk_spwq_lvbu: {
      jlsg_spwq_wushuang: {
        audio: "ext:极略:2",
        mod: {
          cardUsable(card, player, num) {
            if (_status.event.skill == "jlsg_spwq_wushuang") return Infinity;
            if (card && card.storage?.jlsg_spwq_wushuang) return Infinity;
          },
          targetInRange: function () {
            if (_status.event.skill == "jlsg_spwq_wushuang") return true;
          },
        },
        onChooseToUse(event) {
          if (game.online || event.jlsg_spwq_wushuang) return;
          let bool = true,
            num = event.player.getHistory("useCard", evt => {
              if (evt.skill != "jlsg_spwq_wushuang") return false;
              return evt.card.storage?.jlsg_spwq_wushuang_double;
            }).length,
            history = event.player.getHistory("useSkill", evt => {
              if (evt.skill != "jlsg_spwq_wushuang") return false;
              return !evt.targets;
            }).length;
          if (history > num) bool = false;
          event.set("jlsg_spwq_wushuang", bool);
        },
        enable: "chooseToUse",
        filter(event, player) {
          let check = event.jlsg_spwq_wushuang;
          if (!check) return false;
          if (!player.countCards("h")) return false;
          let vcard = get.autoViewAs({ name: "sha", isCard: true, storage: { jlsg_spwq_wushuang: true }, cards: [] }, []);
          return event.filterCard(vcard, player, event);
        },
        hiddenCard(name, player) {
          if (name == "sha") return player.countCards("h");
        },
        position: "h",
        filterCard: true,
        selectCard: -1,
        prompt: "无双：是否弃置所有手牌并摸等量张牌，视为使用【杀】？",
        viewAsFilter: function (player) {
          if (!player.countCards('h')) return false;
          let num = player.getHistory("useCard", evt => {
            if (evt.skill != "jlsg_spwq_wushuang") return false;
            return evt.card.storage.jlsg_spwq_wushuang_double;
          }).length,
            history = player.getHistory("useSkill", evt => {
              if (evt.skill != "jlsg_spwq_wushuang") return false;
              return !evt.targets;
            });
          return history.length < num;
        },
        viewAs(cards, player) {
          return {
            name: "sha",
            isCard: true,
            storage: { jlsg_spwq_wushuang: true },
            cards: [],
          }
        },
        discard: false,
        lose: false,
        log: false,
        locked: false,
        onuse(event, player) {
          let hs = player.getCards("h");
          player.logSkill("jlsg_spwq_wushuang");
          player.discard(hs);
          if (hs.some(i => get.subtype(i) == "equip1")) event.card.storage.jlsg_spwq_wushuang_double = true;
          if (player.isIn()) player.draw(hs.length);
        },
        group: ["jlsg_spwq_wushuang_useCardTo", "jlsg_spwq_wushuang_damage"],
        subSkill: {
          useCardTo: {
            trigger: { player: "useCardToPlayered" },
            filter(event, player, name, target) {
              if (!target || !target.isIn() || event.getParent().excluded.includes(target)) return false;
              return event.card.name == "sha" && event.card.storage?.jlsg_spwq_wushuang;
            },
            getIndex: (event) => event.targets,
            async cost(event, trigger, player) {
              const target = event.indexedData;
              if (!target.isIn()) return;
              event.result = {
                bool: true,
                targets: [target],
              }
              if (trigger.card.storage.jlsg_spwq_wushuang_double) event.result.cost_data = [0, 1];
              else {
                const { result } = await player.chooseButton(true, [
                  get.prompt("jlsg_spwq_wushuang"),
                  [
                    [
                      [0, `将${get.translation(target)}区域里所有牌于本回合内移出游戏`],
                      [1, `令${get.translation(target)}所有技能本回合无效`],
                    ],
                    "textbutton",
                  ],
                ])
                  .set("target", target)
                  .set("ai", button => {
                    const player = get.player(),
                      target = get.event("target");
                    if (get.attitude(player, target) < 1) {
                      if (get.effect(target, { name: "sha", isCard: true, cards: [] }, player, target) > target.countCards("hej")) return button.link == 1;
                      else return button.link == 0;
                    }
                    else return 1;
                  });
                if (result.bool && result.links) event.result.cost_data = result.links;
              }
            },
            async content(event, trigger, player) {
              if (!trigger.parent.jlsg_spwq_wushuang_damage) {
                trigger.parent.jlsg_spwq_wushuang_damage = true;
                trigger.parent.baseDamage *= 2;
                trigger.parent.extraDamage *= 2;
              }
              const target = event.targets[0];
              if (event.cost_data.includes(0) && target.countCards("hej")) {
                target.addTempSkill("jlsg_spwq_wushuang_lose");
                await target.addToExpansion("log", "giveAuto", target.getCards("hej"), target)
                  .set("gaintag", ["jlsg_spwq_wushuang"]);
              }
              if (event.cost_data.includes(1)) target.addTempSkill("baiban");
            },
          },
          lose: {
            forced: true,
            popup: false,
            charlotte: true,
            onremove: function (player) {
              let cards = player.getExpansions("jlsg_spwq_wushuang");
              if (cards.length) {
                player.gain(cards, "draw");
                game.log(player, "收回了" + get.cnNumber(cards.length) + "张“无双”牌");
              }
            },
            mark: true,
            intro: {
              markcount: "expansion",
              mark: function (dialog, storage, player) {
                var cards = player.getExpansions("jlsg_spwq_wushuang");
                if (player.isUnderControl() || player == game.me) dialog.addAuto(cards);
                else return "共有" + get.cnNumber(cards.length) + "张牌";
              },
            },
          },
        },
        ai: {
          respondSha: true,
          skillTagFilter: function (player) {
            return !!lib.skill.jlsg_spwq_wushuang.viewAsFilter(player);
          },
          order: function (item, player) {
            return get.order({ name: "sha" }, player) - 0.1;
          },
          result: {
            target: function (player, target) {
              if (!target) return;
              var cards = player.getCards("h").slice(0);
              var names = [];
              for (var i of cards) names.add(i.name);
              if (names.length < player.hp) return 0;
              if (player.hasUnknown() && (player.identity != "fan" || !target.isZhu)) return 0;
              if (get.attitude(player, target) >= 0) return -20;
              return lib.card.sha.ai.result.target.apply(this, arguments);
            },
          },
          basic: {
            useful: [5, 3, 1],
            value: [5, 3, 1],
          },
          tag: {
            respond: 1,
            respondShan: 1,
            damage: function (card) {
              if (game.hasNature(card, "poison")) return;
              return 2;
            },
            natureDamage: function (card) {
              if (game.hasNature(card, "linked")) return 2;
            },
            fireDamage: function (card, nature) {
              if (game.hasNature(card, "fire")) return 2;
            },
            thunderDamage: function (card, nature) {
              if (game.hasNature(card, "thunder")) return 2;
            },
            poisonDamage: function (card, nature) {
              if (game.hasNature(card, "poison")) return 2;
            },
          },
        },
      },
      translate: {
        jlsg_spwq_wushuang_info: '每回合限一次，当你需要使用【杀】时，你可以弃置所有手牌并摸等量的牌，视为使用之。你以此法使用的【杀】造成的伤害翻倍，无次数和距离限制，并于指定目标后选择一项: 1.将其区域里的所有牌于本回合内移出游戏; 2.令其所有非Charlotte技能于本回合内失效。若你以此法弃置的牌里有武器牌，改为依次执行两项且令此技能于本回合内可再发动一次。',
      }
    },
  },
  sy: {
    //乱世枭雄[魔曹操]
    jlsgsy_caocaobaonu: {
      jlsgsy_longbian: {
        audio: "ext:极略:2",
        trigger: { player: 'phaseBegin' },
        direct: true,
        countShaUsable(player) {
          const card = get.autoViewAs({ name: "sha" }),
            name = "cardUsable";
          let num = get.info(card).usable,
            skills = [];
          if (typeof num == "function") num = num(card, player);
          if (typeof player.getModableSkills == "function") {
            skills = player.getModableSkills();
          } else if (typeof player.getSkills == "function") {
            skills = player.getSkills().concat(lib.skill.global);
            game.expandSkills(skills);
            skills = skills.filter(function (skill) {
              let info = get.info(skill);
              return info && info.mod;
            });
            skills.sort((a, b) => get.priority(a) - get.priority(b));
          }
          const arg = [card, player, num];
          skills.forEach(value => {
            var mod = get.info(value).mod[name];
            if (!mod) return;
            const result = mod.call(this, ...arg);
            if (!result || result === Infinity) return;
            if (typeof arg[arg.length - 1] != "object") arg[arg.length - 1] = result;
          });
          return arg[arg.length - 1];
        },
        filter(event, player) {
          let cnt = [
            lib.skill.jlsgsy_longbian.countShaUsable(player),
            2 + (player.storage.jlsgsy_duzun_buff || [null, 0])[1],
            player.maxHp,
          ];
          return cnt.filter(cnt => cnt > 0).length >= 2;
        },
        content() {
          'step 0'
          var cnt = [
            lib.skill.jlsgsy_longbian.countShaUsable(player),
            2 + (player.storage.jlsgsy_duzun_buff || [null, 0])[1],
            player.maxHp,
          ];
          event.cnt = cnt;
          var names = [
            '使用【杀】的次数上限',
            '摸牌阶段摸牌基数',
            '体力上限',
          ];
          var promptGen = function (index) {
            let prompt = `令${names[index]}+1,令`;
            for (let index2 of [0, 1, 2]) {
              if (index2 == index) {
                continue;
              }
              prompt += names[index2] + `(${cnt[index2]})`;
            }
            prompt += '互换';
            return prompt;
          };
          event.choices = [0, 1, 2].map(promptGen);

          if (cnt.some(cnt => cnt <= 0)) {
            let index = cnt.findIndex(cnt => cnt <= 0);
            event.index = index;
            let prompt = `###${get.prompt(event.name)}###${promptGen(index)}`;
            player.chooseBool(prompt, true);
          } else {
            let choice = [0, 1, 2]
              .filter(index => {
                if (index == 2) {
                  return true;
                }
                return cnt[1 - index] > player.hp - 2;
              })
              .randomGet();
            player.chooseControlList(get.prompt(event.name), event.choices)
              .set('ai', function () {
                return _status.event.choice;
              })
              .set('choice', choice);
            event.goto(2);
          }
          'step 1'
          if (!result.bool) {
            event.finish();
            return;
          }
          event._result = { index: event.index };
          'step 2'
          if (result.control == 'cancel2') {
            event.finish();
            return;
          }
          player.logSkill(event.name);
          game.log(player, event.choices[result.index]);
          player.addSkill('jlsgsy_duzun_buff');
          var otherTwo = [0, 1, 2].filter(index => index != result.index);
          var diff = event.cnt[otherTwo[0]] - event.cnt[otherTwo[1]];
          lib.skill.jlsgsy_duzun_buff.addMark(player, otherTwo[0], -diff);
          lib.skill.jlsgsy_duzun_buff.addMark(player, otherTwo[1], diff);
          lib.skill.jlsgsy_duzun_buff.addMark(player, result.index, 1);
        },
        ai: {
          combo: 'jlsgsy_duzun',
        },
      },
    },
    //三分归晋[魔司马懿]
    jlsgsy_simayi: {
      jlsgsy_bolue: {
        audio: "ext:极略:4",
        trigger: { player: "phaseBegin" },
        forced: true,
        initList() {
          let result = {};
          for (let c of lib.jlsg.characterList) {
            let info = get.character(c);
            if (!result[info[1]]) {
              result[info[1]] = new Set();
            }
            info[3]
              .filter(s => lib.skill[s] && (!lib.skill[s].ai || !lib.skill[s].ai.neg))
              .forEach(s => result[info[1]].add(s));
          }
          for (let g in result) {
            result[g] = [...result[g]];
          }
          _status.jlsgsy_bolue_list = result;
        },
        init(player) {
          player.storage.jlsgsy_bolue = {
            'wei': 1,
            'shu': 1,
            'wu': 1,
          };
        },
        content: function () {
          'step 0'
          if (!_status.jlsgsy_bolue_list) {
            lib.skill.jlsgsy_bolue.initList();
          }
          let obj = Object.assign({}, player.storage.jlsgsy_bolue);
          let list = [];
          for (let g in obj) {
            if (!_status.jlsgsy_bolue_list[g]) continue;
            list.addArray(_status.jlsgsy_bolue_list[g].randomGets(obj[g]));
          }
          player.addTempSkills(list, { player: 'phaseBefore' });
        },
      },
    },
    //末世暴君[魔孙皓]
    jlsgsy_sunhao: {
      /*jlsgsy_mingzheng2: {
        sourceSkill: "jlsgsy_mingzheng",
        trigger: { player: "changeHpBegin" },
        filter(event, player) {
          return event.getParent().name == "damage";
        },
        forced: true,
        popup: false,
        content: function () {
          let next1 = game.createEvent("jlsgsy_mingzheng_change", false, trigger.getParent("phase"));
          next1.info = trigger.parent.name;
          next1.player = player;
          next1.setContent(async function (event, trigger, player) {
            await player.logSkill("jlsgsy_mingzheng");
            await player.draw(player.phaseNumber);
            await player.logSkill("jlsgsy_mingzheng");
            await player.draw(player.phaseNumber + 1);
            await player.changeSkills(['jlsgsy_shisha'], ['jlsgsy_mingzheng']);
          });
          let next2 = game.createEvent("jlsgsy_mingzheng_damage", false, trigger.parent);
          next2.info = [trigger.parent.name, next1];
          next2.player = player;
          next2.setContent(async function (event, trigger, player) {
            await player.logSkill("jlsgsy_mingzheng");
            await player.draw(player.phaseNumber);
            await player.changeSkills(['jlsgsy_shisha'], ['jlsgsy_mingzheng']);
            if (event.getParent("phase")) {
              if (event.getParent("phase").next && event.getParent("phase").next.includes(event.info[1])) {
                event.getParent("phase").next.remove(event.info[1])
              }
            }
          });
        },
      },*/
      jlsgsy_mingzheng2: {
        sourceSkill: "jlsgsy_mingzheng",
        trigger: {
          player: "damageEnd",
          global: ["jlsgsy_baonuBefore", "jlsgsy_baonuAfter"],
        },
        filter(event, player, name) {
          if (name.includes("jlsgsy_baonu")) return event.player == player;
          return true;
        },
        forced: true,
        popup: false,
        async content(event, trigger, player) {
          await player.logSkill("jlsgsy_mingzheng");
          let num = player.phaseNumber;
          if (event.triggername = "jlsgsy_baonuAfter") num++;
          await player.draw(player.phaseNumber + 1);
          await player.changeSkills(['jlsgsy_shisha'], ['jlsgsy_mingzheng']);
        },
      },
      translate: {
        jlsgsy_mingzheng_info: "锁定技，其他角色摸牌阶段摸牌数+1，你的摸牌阶段摸牌数+2。当你受到一次伤害或变声后，你摸X张牌（X为你的行动回合数），然后失去该技能，并获得技能〖嗜杀〗",
      },
    },
    //权倾梦魇[魔孙鲁班]
    jlsgsy_sunluban: {
      jlsgsy_quanqing: {
        audio: "ext:极略:2",
        init(player) {
          player.storage.jlsgsy_quanqing = {
            shown: [],
            targets: [],
          }
        },
        onremove: true,
        enable: 'phaseUse',
        filter: function (event, player) {
          if (!player.storage.jlsgsy_quanqing) return false;
          return player.countCards('h', c => !player.getStorage('jlsgsy_quanqing').shown.includes(c))
            && game.hasPlayer(current => lib.skill.jlsgsy_quanqing.filterTarget(null, player, current));
        },
        filterTarget: function (card, player, target) {
          return player != target && !player.getStorage('jlsgsy_quanqing').targets.includes(target);
        },
        filterCard: function (card, player) {
          return (!player.getStorage('jlsgsy_quanqing').shown?.includes(card)) || false;
        },
        check(card) {
          const player = get.player();
          let hs = player.getCards("h", c => !player.getStorage('jlsgsy_quanqing').shown.includes(c))
            .sort((a, b) => get.number(a, player) - get.number(b, player));
          return hs.filter((v, i) => i == 0 || i == hs.length - 1).includes(card);
        },
        discard: false,
        lose: false,
        delay: false,
        content() {
          'step 0'
          player.showCards(cards);
          player.storage.jlsgsy_quanqing.shown.add(cards[0]);
          player.storage.jlsgsy_quanqing.targets.add(target);
          if (target.countCards('he', c => get.number(c, target) > get.number(cards[0]))) {
            var next = target.chooseToDiscard(c => get.number(c) > _status.event.number)
              .set('number', get.number(cards[0]))
              .set('recover', player.isDamaged());
            if (get.attitude(target, player) < 0) {
              next.set('ai', c => {
                let v = 9 - get.value(c);
                if (_status.event.recover) {
                  v += 4;
                }
                return v - 2 * Math.random();
              });
            } else next.set("ai", () => 0);
          } else event.goto(2);
          'step 1'
          if (result.bool) {
            delete player.storage.jlsgsy_quanqing.choice;
            event.finish();
          }
          'step 2'
          let list = get.inpileVCardList(v => {
            if (!["basic", "trick"].includes(get.type(v[2], null, false))) return false;
            let card = get.autoViewAs({ name: v[2], nature: v[3], isCard: true }, []);
            return target.hasUseTarget(card)
          });
          var next = player.chooseButton(['', `###权倾###请选择${get.translation(target)}使用的牌`, [list, 'vcard']]);
          next.ai = function (button) {
            return button.link[2] === _status.event.choice[0] &&
              (button.link[3] || true) === (_status.event.choice[1] || true);
          }
          next.choice = player.storage.jlsgsy_quanqing.choice ?? [];
          'step 3'
          delete player.storage.jlsgsy_quanqing.choice;
          if (!result.bool) {
            event.finish();
            return;
          }
          let card = { name: result.links[0][2], nature: result.links[0][3] };
          event.card = card;
          let info = get.info(card);
          let range;
          if (!info.notarget) {
            let select = get.copy(info.selectTarget);
            if (select == undefined) {
              range = [1, 1];
            }
            else if (typeof select == 'number') range = [select, select];
            else if (get.itemtype(select) == 'select') range = select;
            else if (typeof select == 'function') range = select(card, target);
            game.checkMod(card, target, range, 'selectTarget', target);
          }
          if (info.notarget || range[1] == -1) {
            target.chooseUseTarget(card, true);
            event.goto(5);
            return;
          }
          var next = player.chooseTarget();
          next.set('_get_card', card);
          next.set('filterTarget', function (card, player, target) {
            return lib.filter.targetInRange(card, _status.event.subject, target)
              && lib.filter.targetEnabledx(card, _status.event.subject, target);
          });
          next.set('ai', function (target, targets) {
            return get.effect_use(target, [], _status.event.subject, _status.event.player);
          });
          next.set('selectTarget', range);
          next.set('forced', true);
          next.set('subject', target);
          next.set('prompt', `选择${get.translation(card)}的目标`);
          next.set('prompt2', `由${get.translation(target)}使用`);
          'step 4'
          if (result.bool) {
            target.useCard(event.card, result.targets, 'noai');
          }
          'step 5'
          if (player.isDamaged()) player.recover();
        },
        ai: {
          order(skill, player) {
            if (!lib.skill.jlsgsy_quanqing.filter(null, player)) return 0;
            let hs = player.getCards('h', c => !player.getStorage('jlsgsy_quanqing').shown.includes(c));
            let numbers = hs.map(i => get.number(i, player)).filter(i => i != Infinity && typeof i == "number"),
              orders = hs.map(i => get.order(i, player)).filter(i => i != Infinity && typeof i == "number");
            return Math.max.apply(Math, numbers.concat(orders)) + 0.1;
          },
          result: {
            player(player, target) {
              const cards = get.inpileVCardList(v => {
                if (!["basic", "trick"].includes(get.type(v[2], null, false))) return false;
                let card = get.autoViewAs({ name: v[2], nature: v[3], isCard: true }, []);
                return target.hasUseTarget(card);
              });
              if (cards.length) {
                let choice,
                  value = 0,
                  keys = ["effect", "canUse", "effect_use", "getUseValue"];
                for (let [, , cardName, nature] of cards) {
                  let card = get.autoViewAs({ name: cardName, nature: nature }, []);//神金传虚拟牌，cardid也不设置一下😅
                  let newV = lib.skill.dcpandi.getUseValue(card, target, player);
                  if (newV > value) {
                    choice = [cardName, nature];
                    value = newV;
                  }
                  for (let key of keys) {//补救措施
                    let info = _status.event._tempCache[key];
                    for (let i in info) {
                      if (i.indexOf(player.playerid) > -1 && i.endsWith("-") && i.indexOf("c:") == -1) delete _status.event._tempCache[key][i];
                    };
                  };
                };
                if (choice) {
                  player.storage.jlsgsy_quanqing.choice = choice;
                  return 1;
                }
              }
              return 0;
            },
            target(player, target) {
              if (lib.skill.jlsgsy_quanqing.ai.result.player.apply(this, arguments) > 0) {
                if (Math.floor(Math.random() * 7) + 1 > get.number(ui.selected.cards[0], player)) return 1;
              }
              return -1;
            },
          },
        },
        group: ["jlsgsy_quanqing_temp"],
        subSkill: {
          temp: {
            charlotte: true,
            forced: true,
            popup: false,
            trigger: { player: "phaseUseAfter" },
            content() {
              lib.skill.jlsgsy_quanqing.init(player);
            },
          },
        }
      },
    },
    //嗜血狂狼[魔魏延]
    jlsgsy_weiyanbaonu: {
      jlsgsy_fangu: {
        audio: "ext:极略:1",
        trigger: {
          player: "damageEnd",
        },
        forced: true,
        priority: 100,
        content: function () {
          "step 0"
          game.broadcastAll(ui.clear);
          player.insertPhase("jlsgsy_fangu");
          "step 1"
          var evt = _status.event.getParent("phase");
          if (evt) {
            _status.event = evt;
            _status.event.finish();
            game.log(_status.currentPhase, "结束了回合");
          }
          _status.paused = false;
        },
        "_priority": 10000,
      },
      jlsgsy_kuangxi: {
        audio: "ext:极略:2", // audio: ['kuangxi', 2],
        trigger: { player: 'useCardEnd' },
        filter: function (event, player) {
          let targets = event.targets.slice().remove(player);
          if (!targets || targets.length == 0 || !event.card) return false;
          if (event.card.name == 'wuxie') return false;
          return get.type(event.card, 'trick') == 'trick';
        },
        check: function (event, player) {
          let targets = event.targets.slice().remove(player),
            att = 0;
          for (var i = 0; i < targets.length; i++) {
            att += ai.get.effect(targets[i], { name: 'sha' }, player, player);
          }
          return att > 1;
        },
        content: function () {
          "step 0"
          let targets = trigger.targets.slice().remove(player);
          event.evt = player.useCard({ name: 'sha', jlsgsy_kuangxi: true }, targets, false);
          "step 1"
          let evt = player.getHistory('sourceDamage', e => e.getParent(2) === event.evt);
          if (!evt.length && player.isIn()) {
            player.loseHp();
          }
        },
        ai: {
          effect: {
            player: function (card, player, target) {
              if (get.type(card) == 'trick') return [1, 2];
            },
          },
        },
      },
    },
    //大贤良师[魔张角]
    jlsgsy_zhangjiaobaonu: {
      jlsgsy_yaohuo: {
        audio: "ext:极略:1",
        enable: 'phaseUse',
        usable: 1,
        filterTarget: function (card, player, target) {
          if (player == target) return false;
          let quota = player.countDiscardableCards(player, 'he'),
            skills = target.getSkills(null, false, false);
          skills = target.getStockSkills(true, true).filter(s => {
            for (let i in target.disabledSkills) {
              if (i == s) return false;
            };
            return skills.includes(s);
          });
          return target.countCards('h') > 0 && quota >= target.countCards('h')
            || skills.length && quota >= skills.length;
        },
        delay: false,
        init(player) {
          player.storage.jlsg_yaohuo_retrieve = new Map();
        },
        content: function () {
          'step 0'
          let quota = player.countDiscardableCards(player, 'he'),
            skills = target.getSkills(null, false, false);
          event.skills = target.getStockSkills(true, true).filter(s => {
            for (let i in target.disabledSkills) {
              if (i == s) return false;
            };
            return skills.includes(s);
          });
          let list = [];
          if (target.countCards('h') > 0 && quota >= target.countCards('h')) {
            list.push(`弃置${get.cnNumber(target.countCards('h'))}张牌并获得${get.translation(target)}的所有手牌。`);
          }
          if (event.skills.length && quota >= event.skills.length) {
            list.push(`弃置${get.cnNumber(event.skills.length)}张牌并取走${get.translation(target)}的所有技能。`);
          }
          event.list = list;
          player.chooseControlList(list, true);
          'step 1'
          event.choseCard = event.list[result.index].includes('并获得');
          if (event.choseCard) {
            player.chooseToDiscard(target.countCards('h'), true, "he");
          } else {
            player.chooseToDiscard(event.skills.length, true, "he");
          }
          'step 2'
          if (!result.bool) {
            event.finish();
            return;
          }
          if (event.choseCard) {
            player.gain(target.getCards('h'), target, 'giveAuto');
            event.finish();
            return;
          }
          let addSkills = player.addTempSkills(event.skills, { player: 'dieAfter' });
          addSkills.$handleInner = addSkills.$handle;
          addSkills.jlsg_yaohuo_target = target;
          addSkills.$handle = function () {
            let currentAdditional = Object.keys(this.player.additionalSkills);
            this.$handleInner.apply(this, arguments);
            let addtionalSkill = Object.keys(this.player.additionalSkills).removeArray(currentAdditional);
            console.assert(addtionalSkill.length == 1, 'jlsg_yaohuo hook not working properly');
            if (!this.player.storage.jlsg_yaohuo_retrieve.has(this.jlsg_yaohuo_target)) {
              this.player.storage.jlsg_yaohuo_retrieve.set(this.jlsg_yaohuo_target, addtionalSkill[0]);
            }
          };

          target.storage.jlsgsy_yaohuo2 = target.storage.jlsgsy_yaohuo2 || [];
          target.storage.jlsgsy_yaohuo2.addArray(event.skills);
          target.storage.jlsgsy_yaohuo2_player = player;
          target.addTempSkill('jlsgsy_yaohuo2', { player: 'phaseBeginStart' });
        },
        group: 'jlsgsy_yaohuo_clear',
        ai: {
          order: 9.5,
          result: {
            target: function (player, target) {
              if (target.num('h') < 3) return 0;
              return -jlsg.relu(get.attitude(player, target));
            }
          },
          expose: 0.2
        },
      },
    },
    //祸乱之源[魔张让]
    jlsgsy_zhangrangbaonu: {
      jlsgsy_luanzheng: {
        audio: "ext:极略:2",
        trigger: { global: 'useCardToPlayer' },
        usable: 1,
        filter: function (event, player) {
          return event.targets.length == 1
            && event.player != player
            && ['basic', 'trick'].includes(get.type(event.card))
            && game.filterPlayer(p => !event.targets.includes(p)).length;
        },
        direct: true,
        content: function () {
          "step 0"
          player.chooseTarget(get.prompt2(event.name), function (card, player, target) {
            return !trigger.targets.includes(target);
          })
            .set('ai', function (target) {
              return get.effect(target, _status.event.card, _status.event.user, _status.event.player);
            })
            .set('card', trigger.card)
            .set('user', trigger.player);
          "step 1"
          if (result.bool) {
            player.logSkill(event.name, result.targets);
            trigger.targets.addArray(result.targets);
          }
        },
        ai: {
          threaten: 3,
        },
      },
      delete: ["jlsgsy_luanzheng2"],
    },
  },
}