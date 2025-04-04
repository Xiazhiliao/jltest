import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import skillChange from './skillChange.js';
import bugFix from './bugFix.js';
export default {
  //变更魔势力
  groupChange: function () {
    lib.skill["jlsgsy_baonu3"] = {
      trigger: { player: "phaseDrawBegin2" },
      filter: (event) => {
        if (get.mode() != "boss") return false;
        return !event.numFixed;
      },
      ruleSkill: true,
      unique: true,
      charlotte: true,
      fixed: true,
      forced: true,
      popup: false,
      content() {
        let least = player.hasSkill("jlsgsy_baonu2") ? 0 : 2;
        if (lib.config.extension_极略测试_boss_mode == "hard") least += 2;
        trigger.num += least;
      }
    }
    lib.skill["jlsgsy_baonu2"].content = function () {
      if (get.mode() != "boss") {
        event.finish();
        return;
      }
      let least = 2;
      if (lib.config.extension_极略测试_boss_mode == "hard") least = 4;
      let cards = get.cards(least);
      player.directgain(cards, false);
    };
    lib.skill["jlsgsy_baonu"] = {
      audio: "ext:极略:1",
      skillAnimation: true,
      trigger: { player: 'changeHp' },
      forced: true,
      charlotte: true,
      priority: 100,
      unique: true,
      ruleSkill: true,
      mode: ['identity', 'guozhan', 'boss', 'stone'],
      init(player, skill) {
        let nameList = get.nameList(player)
        if (nameList.every(i => !i.startsWith("jlsgsy_"))) {
          game.log(player, "非法获得技能，已移除");
          player.removeSkill(skill);
        }
        if (get.mode() == "boss") player.addInvisibleSkill("jlsgsy_baonu3");
      },
      filter: function (event, player) {
        let nameList = get.nameList(player)
        if (nameList.every(i => !i.startsWith("jlsgsy_"))) return false;
        let least = 4;
        if (get.mode() == "boss" && lib.config.extension_极略测试_boss_mode == "hard") least = 6;
        return player.hp <= least;
      },
      content: function () {
        "step 0"
        var slimName = null;
        if (event.name.length > 12 && event.name.startsWith("jlsgsy_baonu")) slimName = event.name.substr(12);
        else {
          event.finish();
          return;
        }
        game.broadcastAll(ui.clear);
        if (get.mode() == "boss") {
          if (player.isLinked()) player.link();
          if (player.isTurnedOver()) player.turnOver();
          player.discard(player.getCards("j"));
        }
        player.insertPhase(event.name);
        event.trigger("jlsgsy_baonuBefore");
        "step 1"
        let least = 4;
        if (get.mode() == "boss" && lib.config.extension_极略测试_boss_mode == "hard") least = 6;
        if (player.hp < least) player.hp = least;
        var name1 = player.name1, name2 = player.name2;
        if (name1.startsWith('jlsgsy_') && !name1.endsWith('baonu')) {
          game.log(player, "将", get.translation(name1), "变更为", get.translation(name1 + 'baonu'));
          player.reinit(name1, name1 + 'baonu');
        }
        if (name2 && name2.startsWith('jlsgsy_') && !name2.endsWith('baonu')) {
          game.log(player, "将", get.translation(name2), "变更为", get.translation(name2 + 'baonu'));
          player.reinit(name2, name2 + 'baonu');
        }
        player.update();
        event.trigger("jlsgsy_baonuAfter");
        "step 2"
        var evt = _status.event.getParent("phase");
        if (evt) {
          _status.event = evt;
          _status.event.finish();
          game.log(_status.currentPhase, "结束了回合");
        }
        _status.paused = false;
      },
      group: ['jlsgsy_baonu2'],
    };
    if (lib.skill.jlsg_wushen2) {
      lib.skill.jlsg_wushen2.filter = function (event) {
        return event.player && ["shen", "jlsgsy"].includes(event.player.group);
      };
      lib.translate["jlsg_wushen_info"] = "锁定技，你的【杀】和【桃】均视为【决斗】。你对神势力和魔势力角色造成的伤害+1。";
    }
    let pack = ["jlsg_sy", "jlAddition", "jlRumor"];
    for (let i of pack) {
      if (!lib.characterPack[i]) continue;
      for (const name in lib.characterPack[i]) {
        if (!name.startsWith("jlsgsy_") && !name.startsWith("jlsgrm_")) continue;
        const config = lib.character[name];
        lib.characterPack[i][name].group = "jlsgsy";
        if (config) lib.character[name].group = "jlsgsy";
        const title = lib.translate[name],
          baonu = name.endsWith("baonu") ? true : false;
        const info = baonu ? name.slice(7, -5) : name.slice(7);
        if (baonu) {
          let num = (get.mode() == "boss" && lib.config.extension_极略测试_boss_mode == "hard") ? 6 : 4;
          let filter = `锁定技，当你的体力值降至${num}或更低时，`;
          let eff1 = `重置武将牌并弃置判定区内所有牌，`;
          let eff2 = `你进入暴怒状态，${num == 6 ? eff1 : ""}然后立即执行一个额外回合。`;
          let str = filter + eff2;
          game.broadcastAll(function (name, str) {
            let skill = "jlsgsy_baonu" + name;
            if (lib.skill[skill]) lib.translate[skill + "_info"] = str;
          }, info, str);
        }
        let num1 = 8,
          num2 = 3;
        if (get.mode() == "boss") {
          num2 = 4;
          if (lib.config.extension_极略测试_boss_mode == "hard") {
            num1 = 10;
            num2 = 6;
          }
        }
        lib.characterPack[i][name].hp = baonu ? num2 : num1;
        lib.characterPack[i][name].maxHp = baonu ? num2 : num1;
        if (config) {
          lib.character[name].hp = baonu ? num2 : num1;
          lib.character[name].maxHp = baonu ? num2 : num1;
        }
        if (get.mode() != "boss") {
          if (!title) continue;
          else {
            lib.characterTitle[name] = title;
            let translation = get.rawName(info);
            lib.translate[name] = "SY" + (baonu ? "暴怒" : "") + translation;
            lib.translate[name + "_ab"] = "极略SY" + (baonu ? "暴怒" : "") + translation;
            lib.translate[name + "_prefix"] = baonu ? "极略SY暴怒" : "极略SY";
            if (name == 'jlsgsy_sunhaobaonu') {
              lib.characterPack[i][name].skills.remove('jlsgsy_shisha');
              lib.characterPack[i][name].skills.unshift('jlsgsy_mingzheng');
              if (config) {
                lib.character[name].skills.remove('jlsgsy_shisha');
                lib.character[name].skills.unshift('jlsgsy_mingzheng');
              }
            }
            if (!baonu) {//AI禁选
              lib.characterPack[i][name].isAiForbidden = true;
              if (config) lib.character[name].isAiForbidden = true;
            }
          }
        }
      };
    };
  },
  //七杀包规则重构
  cardReconstitute: function (bool) {
    if (bool) {
      const cardPacks = lib.cardPack,
        baowuEquip = async function () {
          const event = get.event(),
            player = get.player(),
            card = get.event("card");
          event.baowu = player.getCards("e", i => {
            if (event.card.cards && event.card.cards.includes(i)) return false;
            if (!lib.filter.canBeReplaced(i, get.player())) return false;
            let info = lib.card[i.name],
              subtype = get.subtype(i);
            return info && info.jlsgqs_qiwu || ["equip3", "equip4", "equip5"].includes(subtype);
          });
          if (event.baowu.length > 2) {
            const cards = event.baowu;
            const { result } = await player.chooseButton(["选择替换掉一装备牌", [cards, "vcard"]], true, 1)
              .set("ai", button => {
                const player = get.player();
                return -get.value(button.link, player);
              });
            if (result.bool) {
              player.$throw(result.links, 1000);
              await player.lose(result.links, "visible").set("type", "equip").set("getlx", false);
            }
          }
          if (lib.card[card.name].onEquip2) {
            await game.createEvent(card.name + "onEquip", false)
              .setContent(lib.card[card.name].onEquip2)
              .set("card", event.card)
              .set("player", event.player);
          }
        };
      for (const pack in cardPacks) {
        const cards = cardPacks[pack];
        for (const i of cards) {
          let info = lib.card[i];
          if (!info) continue;
          if (info.subtype == "equip5") {
            delete lib.card[i].subtype;
            delete lib.card[i].subtypes;
            lib.card[i].jlsgqs_qiwu = true;
            if (pack != "jlsg_qs" && info.onEquip) lib.card[i].onEquip2 = info.onEquip;
            if (i != "jlsgqs_taipingyaoshu") lib.card[i].onEquip = baowuEquip;
            else lib.card[i].onEquip = async function () {
              const event = get.event(),
                player = get.player(),
                card = get.event("card");
              event.baowu = player.getCards("e", i => {
                if (event.card.cards && event.card.cards.includes(i)) return false;
                if (!lib.filter.canBeReplaced(i, get.player())) return false;
                let info = lib.card[i.name],
                  subtype = get.subtype(i);
                return info && info.jlsgqs_qiwu || ["equip3", "equip4", "equip5"].includes(subtype);
              });
              if (event.baowu.length > 2) {
                const cards = event.baowu;
                let { result } = await player.chooseButton(["选择替换掉一装备牌", [cards, "vcard"]], true, 1)
                  .set("ai", button => {
                    const player = get.player();
                    return -get.value(button.link, player);
                  });
                if (result.bool) {
                  player.$throw(result.links, 1000);
                  await player.lose(result.links, "visible").set("type", "equip").set("getlx", false);
                }
              }
              if (lib.card[card.name].onEquip2) {
                await game.createEvent(card.name + "onEquip", false)
                  .setContent(lib.card[card.name].onEquip2)
                  .set("card", event.card)
                  .set("player", event.player);
              }
              let { result } = await player.chooseToDiscard('h', function (card) {
                return get.color(card) == 'red';
              }).set('ai', function (card) {
                let player = get.player();
                if (card.name == 'tao') return -10;
                if (card.name == 'jiu' && player.hp == 1) return -10;
                if (player.hp == 1) return 15 - ai.get.value(card);
                return 8 - ai.get.value(card);
              }).set('prompt2', '太平要术：弃置一张红色手牌，否则失去1点体力');
              if (!result.bool) {
                await player.loseHp();
              }
            }
          }
          else if (["equip3", "equip4", "equip5"].includes(get.subtype(i))) {
            lib.card[i].jlsgqs_zuoqi = true;
            if (pack != "jlsg_qs" && info.onEquip) lib.card[i].onEquip2 = info.onEquip;
            lib.card[i].onEquip = baowuEquip;
          }
          if (get.mode() == "boss" && get.subtype(i) == "equip1") lib.card[i].recastable = true;
        }
      }
    }
    if (!lib.config.mount_combine && bool) {
      game.saveConfig("mount_combine", true);
      setTimeout(function () {
        game.reload();
      }, 1000);
    }
  },
  skillChange,
  bugFix,
};
