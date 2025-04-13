import { lib, game, ui, get, ai, _status } from '../../../noname.js'
import configPack from '../main/js/configPack.js'
export const content = function (config, pack) {
  //在这里编写启动阶段执行的代码。
  //检测极略扩展是否开启
  if (!game.hasExtension("极略")) {
    alert('检测到未开启极略扩展，已自动关闭极略测试');
    game.saveExtensionConfig("极略测试", "enable", false);
    setTimeout(function () {
      game.reload();
    }, 1000);
  }
  //隐藏武将及其技能
  /*if (lib.characterPack["jlAddition"]) {
    let packA = lib.characterPack["jlAddition"];
    for (let name in packA) {
      if (!packA[name].isAiForbidden) lib.config.forbidai.remove(name);
      if (packA[name].isUnseen) {
        game.broadcastAll(function (name, skills) {
          for (let i of skills) {
            game.broadcastAll(function (skill) {
              Object.defineProperty(lib.skill, skill, {
                configurable: true,
                enumerable: false,
                writable: true,
              });
            }, i);
          };
          Object.defineProperty(lib.characterPack.jlAddition, name, {
            configurable: true,
            enumerable: false,
            writable: true,
          });
          if (lib.characterTitle[name]) Object.defineProperty(lib.characterTitle, name, {
            configurable: true,
            enumerable: false,
            writable: true,
          });
        }, name, packA[name].skills)
      }
    };
  }*/
  game.runAfterExtensionLoaded("极略", function () {//极略修改
    for (const i in config) {
      if (!config[i] || config[i] == "false") continue;
      if (i == "bugFix") {//bug修复
        for (const packName in configPack.bugFix) {
          let pack = configPack.bugFix[packName];
          for (const name in pack) {
            for (const j in pack[name]) {
              let info = pack[name][j];
              if (j == "delete") {
                for (let x of info) delete lib.skill[x];
              }
              else if (j == "translate") {
                for (let x in info) lib.translate[x] = info[x];
              }
              else if (j == "info" && typeof info == "function") info();
              else {
                if (["jlsgsy_sunhao"].includes(name) && lib.extensionPack["极略"]?.version != "2.6.1003") lib.skill[j] = info;
                else if (lib.extensionPack["极略"]?.version == "2.6.1003") lib.skill[j] = info;
              }
            };
          }
        };
      }
      else if (i.startsWith("jlsg")) {//技能替换
        if (!configPack.skillChange[i]) continue;
        for (const j in configPack.skillChange[i]) {
          const info = configPack.skillChange[i][j];
          if (j == "delete") {
            for (let x of info) delete lib.skill[x];
          }
          else if (j == "translate") {
            for (let x in info) lib.translate[x] = info[x];

          } else if (j == "info" && typeof info == "function") info();
          else lib.skill[j] = info;
        };
      }
      else if (i == "groupChange") configPack.groupChange();//变更魔势力
      else if (i == "cardReconstitute") {//七杀包规则重构
        if (lib.config.cards.includes("jlsg_qs") && lib.config.extension_极略_qsRelic) {
          configPack.cardReconstitute();
        }
        else game.saveExtensionConfig("极略测试", "cardReconstitute", false);
      }
      if (get.mode() != "boss") {
        const packList = ["jlAddition", "jlRumor", "jlsg_sy"];
        for (let packName of packList) {
          const pack = lib.characterPack[packName];
          for (let name in pack) {
            if (!name.includes("baonu")) continue;
            const info = pack[name][4];
            for (let i of info) {
              if (i.includes("boss")) {
                lib.characterPack[packName][name][4].remove(i);
                if (lib.character[name]) lib.character[name][4].remove(i);
              }
            };
            if (!lib.config.forbidai_user.includes(name)) lib.config.forbidai.remove(name);
            /*
            const skills = pack[name][3];
            for (let i of skills) {
              delete lib.skill[i].charlotte;
              delete lib.skill[i].unique;
            }
              */
          };
        };
      }
    };
  });
}