import { lib, game, ui, get, ai, _status } from '../../../noname.js';
import jlAddition from '../package/jlAddition/index.js';
import jlRumor from '../package/jlRumor/index.js';
export const precontent = function (jltext) {
  if (lib.config && lib.config.extension_极略测试_groupChange) {//魔势力及前缀创建
    game.addGroup("jlsgsy", "魔", "极略三英", { color: "#8B4A51" });
    lib.namePrefix.set("极略SY", {
      getSpan: () => {
        const span = document.createElement("span"),
          style = span.style;
        style.color = "#8B4A51";
        style.writingMode = style.webkitWritingMode = "horizontal-tb";
        style.fontFamily = "MotoyaLMaru";
        style.transform = "scaleY(0.85)";
        span.dataset.nature = "keymm";
        span.innerHTML = "SY";
        return span.outerHTML;
      },
    });
    lib.namePrefix.set("极略SY暴怒", {
      getSpan: () => {
        const span = document.createElement("span"),
          style = span.style;
        style.color = "#B22222";
        style.writingMode = style.webkitWritingMode = "horizontal-tb";
        style.fontFamily = "MotoyaLMaru";
        style.transform = "scaleY(0.85)";
        span.dataset.nature = "orangemm";
        span.innerHTML = "SY";
        return span.outerHTML;
      },
    });
  };
  if (jltext.enable) {
    //补充部分
    if (game.hasExtension("极略")) {
      game.runAfterExtensionLoaded("极略", function () {
        const jilueVersion = lib.extensionPack["极略"]?.version;
        const jilueData = String(jilueVersion).split(".")[2];
        const month = Number(jilueData.slice(0, 2)),
          day = Number(jilueData.slice(2));
        let check=false;
        if (month > 3) check = true;
        else if (month == 3) {
          if (day >= 30) check = true;
        }
        if (check) {
          for (let name in jlAddition.character) {
            if (name != "jlsgsoul") {
              const skills = jlAddition.character[name][3];
              for (let skill of skills) {
                if (jlAddition.translate[skill]) {
                  delete jlAddition.translate[skill];
                  delete jlAddition.translate[skill + "_info"];
                  delete jlAddition.translate[skill + "_append"];
                }
                if (jlAddition.dynamicTranslate[skill]) delete jlAddition.dynamicTranslate[skill];
                if (jlAddition.skill[skill]) delete jlAddition.skill[skill];
              };
              delete jlAddition.character[name];
              delete jlAddition.translate[name];
              delete jlAddition.translate[name + "_ab"];
              delete jlAddition.translate[name + "_prefix"];
            }
          }
        };
        if (Object.keys(jlAddition.character).length) {
          game.import('character', function () { return jlAddition });
          lib.config.all.characters.add('jlAddition');
          lib.config.all.sgscharacters.add('jlAddition');
          if (!lib.config.characters.includes('jlAddition')) lib.config.characters.remove('jlAddition');
          lib.translate['jladdition_character_config'] = '极略补充';
        }
        //}
      })
    }
    //散谣部分
    game.import('character', function () { return jlRumor });
    lib.config.all.characters.add('jlRumor');
    lib.config.all.sgscharacters.add('jlRumor');
    if (!lib.config.characters.includes('jlRumor')) lib.config.characters.remove('jlRumor');
    lib.translate['jlRumor_character_config'] = '极略散谣';
  }
}