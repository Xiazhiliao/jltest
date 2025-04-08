import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
//bug修复
export default {
  sr: {
  },
  sk: {
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
  },
  soul: {
  },
  spf: {
  },
  sy: {
    //末世暴君[魔孙皓]
    jlsgsy_sunhao: {
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
  },
}