import { lib, game, ui, get, ai, _status } from '../../../noname.js';
import configPack from '../main/js/configPack.js';
const configInfo = {
  Exclamation: {
    clear: true,
    name: "~·所有选项需重启生效·~",
  },
  FenJieXianA: {//功能杂项
    clear: true,
    name: "<li>功能杂项",
  },
  groupChange: {
    name: "魔势力重建",
    intro: "将非挑战模式下的三英武将势力变更为魔势力，名字还原，将非暴怒武将设置为AI禁选",
    init: false,
  },
  cardReconstitute: {
    name: "七杀包规则重构",
    intro: `必须先开启“七杀包”和“七杀包特殊规则”，否则无效<br>
            PS:此功能会自动开启无名杀的合并坐骑栏功能`,
    init: false,
  },
  boss_mode: {
    name: "三英挑战模式难度",
    init: "normal",
    item: {
      "normal": "普通",
      "hard": "困难",
    },
  },
  jlsg_skillChange: {//技能替换
    clear: true,
    name: "<li>技能替换（点击后折叠）▽",
    onclick: function () {
      if (lib.config.jlsg_skillChange == undefined) {
        lib.config.jlsg_skillChange = [];
        let nextSibling = this.nextSibling;
        while (!get.plainText(nextSibling.innerHTML).includes("BUG修复")) {
          lib.config.jlsg_skillChange.push(nextSibling);
          nextSibling = nextSibling.nextSibling;
        }
        this.innerHTML = "<li>技能替换（点击后展开）▷";
        lib.config.jlsg_skillChange.forEach(function (element) { element.hide() });
      } else {
        this.innerHTML = "<li>技能替换（点击后折叠）▽";
        lib.config.jlsg_skillChange.forEach(function (element) { element.show() });
        delete lib.config.jlsg_skillChange;
      }
    }
  },
},
  pack = {
    sk: {
      jlsgsk_guansuo: {
        name: "SK关索(更新)",
        intro: "技能调整为最新版",
        init: false,
      },
      jlsgsk_jiangwei: {
        name: "SP姜维(修改)",
        intro: "修改[才遇],优化[困奋]ai",
        init: "false",
        item: {
          "false": '关闭',
          "true": "开启",
          "character": "全扩",
          "skills": "全部技能",
          "all": "全都要",
        },
      },
      jlsgsk_nanhualaoxian: {
        name: "SK南华老仙(修改)",
        intro: "增添[天道]标记显示和动态描述，优化[仙授]ai",
        init: false,
      },
      jlsgsk_sundeng: {
        name: "SK孙登(回调)",
        intro: "技能替换为未削弱版本",
        init: false,
      },
      jlsgsk_wanniangongzhu: {
        name: "SK万年公主(修改)",
        intro: "关闭为谷歌个人版本，开启后覆盖[枕戈][兴汉]<br>" +
          "“极略”为极略官方版本[兴汉]<br>“无名杀”为加强版本[兴汉]",
        init: "false",
        item: {
          "false": '关闭',
          "jlsg": "极略",
          "noname": "无名杀",
        },
      },
      jlsgsk_wenyang: {
        name: "SK文鸯(更新)",
        intro: "技能调整为最新版",
        init: false,
      },
      jlsgsk_zhaoyan: {
        name: "SK赵嫣(修改)",
        intro: "调整为极略官方技能",
        init: false,
      },
      jlsgsk_lvlingqi: {
        name: "SK吕玲绮(还原)",
        intro: "调整为极略官方技能",
        init: false,
      },
    },
    soul: {
      jlsgsoul_caocao: {
        name: "SK神曹操(更新)",
        intro: "技能调整为最新版(6.2.3)",
        init: false,
      },
      jlsgsoul_dianwei: {
        name: "SK神典韦(更新)",
        intro: "技能调整为最新版",
        init: false,
      },
      jlsgsoul_diaochan: {
        name: "SK神貂蝉(更新)",
        intro: "技能调整为最新版（6.2.8）",
        init: false,
      },
      jlsgsoul_huanggai: {
        name: "SK神黄盖(更新)",
        intro: "技能调整为最新版",
        init: false,
      },
      jlsgsoul_jiaxu: {
        name: "SK神贾诩(更新)",
        intro: "技能调整为最新版(6.2.2)",
        init: false,
      },
      jlsgsoul_liubei: {
        name: "SK神刘备(更新)",
        intro: "技能替换为最新版，并优化ai",
        init: false,
      },
      jlsgsoul_lvbu: {
        name: "SK神吕布(更新)",
        intro: "技能替换为最新版",
        init: false,
      },
      jlsgsoul_sunquan: {
        name: "SK神孙权(更新)",
        intro: "调整【虎踞】,血量调整",
        init: false,
      },
      jlsgsoul_simayi: {
        name: "SK神司马懿(更新)",
        intro: "技能替换为最新版(6.3.1)",
        init: false,
      },
      jlsgsoul_sp_simayi: {
        name: "SP神司马懿(修改)",
        intro: "涉及全部技能修改，将[鹰视]调整为最新版，将[神隐]修改为符合极略三国的显示(6.2.1)",
        init: false,
      },
      jlsgsoul_zhangjiao: {
        name: "SK神张角(削弱)",
        intro: "技能替换为最新版(疑似削弱)",
        init: false,
      },
      jlsgsoul_sp_zhangjiao: {
        name: "SP神张角(更新)",
        intro: "技能替换为未削弱版本(6.2.1)",
        init: false,
      },
      jlsgsoul_zhangfei: {
        name: "SK神张飞(更新)",
        intro: "技能替换为最新版",
        init: false,
      },
      jlsgsoul_zhaoyun: {
        name: "SK神赵云(修改)",
        intro: "将[龙魂]模板从高达一号改为三代神赵，优化ai，[绝境]修改",
        init: false,
      },
      jlsgsoul_sp_zhaoyun: {
        name: "SP神赵云(修改)",
        intro: "[潜渊]添加“锁定技”标签",
        init: false,
      },
      jlsgsoul_guojia: {
        name: "SK神郭嘉(更新)",
        intro: "技能替换为最新版(6.3.5)",
        init: false,
      },
      jlsgsoul_zhugeliang: {
        name: "SK神诸葛亮(更新)",
        intro: "技能替换为最新版",
        init: false,
      },
      jlsgsoul_ganning: {
        name: "SK神甘宁(更新)",
        intro: "技能替换为最新版(6.4.2)",
        init: false,
      },
    },
    sy: {
      jlsgsy_weiyan: {
        name: "嗜血狂狼[魏延](更新)",
        intro: "技能替换为最新版",
        init: false,
      },
      jlsgsy_caifuren: {
        name: "蛇蝎美人[蔡夫人](修改)",
        intro: "还原技能",
        init: false,
      },
    },
  },
  last = {
    jlsg_bugfix: {//BUG修复
      clear: true,
      name: "<li>BUG修复（点击后折叠）▽",
      onclick: function () {
        if (lib.config.jlsg_bugfix == undefined) {
          lib.config.jlsg_bugfix = [];
          for (let i = 0; i < 2; i++) {
            if (i == 0) lib.config.jlsg_bugfix.push(this.nextSibling);
            else {
              let previous = lib.config.jlsg_bugfix[i - 1];
              lib.config.jlsg_bugfix.push(previous.nextSibling);
            }
          }
          this.innerHTML = "<li>BUG修复（点击后展开）▷";
          lib.config.jlsg_bugfix.forEach(function (element) { element.hide() });
        } else {
          this.innerHTML = "<li>BUG修复（点击后折叠）▽";
          lib.config.jlsg_bugfix.forEach(function (element) { element.show() });
          delete lib.config.jlsg_bugfix;
        }
      }
    },
    bugFix: {
      name: "修复部分BUG",
      init: false,
    },
    bugFix_intro: {
      name: '<div class="hth_menu">▶修复bug明细（点击后展开）</div>',
      clear: true,
      onclick: function () {
        if (this.hth_more == undefined) {
          let str = '<div style="border: 0px solid white;text-align:left"><div style="color:rgb(0,0,0); font-size:16px; line-height:18px; text-shadow: 0 0 2px white">';
          const bugFix = configPack.bugFix,
            div = {
              sr: `<span  data-nature="keymm">SR武将</span>`,
              sk: `<span style="color:#fbefef" data-nature="firemm">SK武将</span>`,
              soul: `<span style="color:#faecd1" data_nature:"orangemm">魂烈包</span>`,
              spf: `极略皮肤`,
              sy: `<span style="color:#8B4A51" data_nature:"keymm">SK三英</span>`,
            };
          for (const packName in bugFix) {
            if (packName != "sr") str += "<br>";
            str += `<li>${div[packName]}`;
            let pack = bugFix[packName];
            let list = Object.keys(pack).sort((a, b) => {
              return get.rawName(a).localeCompare(get.rawName(b));
            });
            for (const name of list) {
              str += `<br><span style="color:rgb(255,255,255);font-family:${lib.config.name_font}" data-nature=${get.groupnature(get.bordergroup(name))}>${get.slimName(name)}</span>`;
              if (packName == "spf") str += `(${(lib.characterTitle[name] ?? " ").split(" ")[0]})`
              let info = pack[name];
              let skills = Object.keys(info)
                .map(skill => {
                  let s = info[skill].sourceSkill || skill;
                  if (!lib.translate[s]) return null;
                  return s;
                })
                .filter(i => i)
                .unique();
              str += `${skills.map(i => `[${lib.translate[i]}]`)}`.replace(/,/g, "");
            };
            str += "<br>";
          };
          str += "</div></div>";
          var more = ui.create.div('.hth_more', str);
          this.hth_more = more;
        }
        if (this.hth_more_mode === undefined) {
          this.hth_more_mode = true;
          this.parentNode.insertBefore(this.hth_more, this.nextSibling);
          this.innerHTML = '<div class="hth_menu">▼修复bug明细（点击后折叠）</div>';
        }
        else {
          this.parentNode.removeChild(this.hth_more);
          delete this.hth_more_mode;
          this.innerHTML = '<div class="hth_menu">▶修复bug明细（点击后展开）</div>';
        };
      },
    },
    FenJieXianC: {
      clear: true,
      name: "<li>待开发",
    },
    bugfix_history: {
      name: '<div class="hth_menu">▶💩日志</div>',
      clear: true,
      onclick: function () {
        if (this.hth_more == undefined) {
          var more = ui.create.div('.hth_more',
            `<div style="border: 0px solid white;text-align:left"><div style="color:rgb(0,0,0); font-size:10px; line-height:11px; text-shadow: 0 0 2px white">
          <br><li>2.9.11.2(2024.10.31)
          <br>更正[落雁]描述
          <br>修复[虎啸]‘结束回合’不生效
          <br>修复[谏征]重新指定‘五谷’目标时，亮出牌数不正确
          <br>还原[锦龙]不会‘吃’因判定进入弃牌堆的装备牌
          <br><li>2.9.11.3(2024.11.1)
          <br>二修[谏征]，更正描述为‘结算目标’
          <br>优化[忧恤](测试)ai
          <br>微调部分开关的描述
          <br><li>2.9.11.4(2024.11.2)
          <br>针对[忧恤](测试)‘已损失体力值’的情况进行分类讨论
          <br>优化[天辩]‘使用’部分流程
          <br><li>2.9.11.5(2024.11.4)
          <br>修复[锦龙]部分情况下发动不摸牌
          <br>更正技能名[淫姿]→[淫恣]
          <br>修复[三绝](测试)部分情况下不移除给出的技能
          <br><li>2.9.11.6(2024.11.6)
          <br>修复[兴汉](测试)招募武将阵亡后一回合可以重新招募该势力
          <br><li>2.9.11.7
          <br><span style=" text-decoration:line-through">更正[蛮裔]效果</span>
          <br>修复[锦龙]摸牌数异常
          <br>重写[烈弓]三牌转化的摸牌效果
          <br><li>2.9.11.8
          <br><span style=" text-decoration:line-through">更正[莺歌]效果，不再封锁无点数牌</span>
          <br><li>2.9.11.9(2024.11.9)
          <br><span style=" text-decoration:line-through">修复[锦织]在极端情况下不转化所有手牌</span>
          <br>为[锦织]添加转化牌点数
          <br>更正[蛮裔]效果,转化后刷新牌信息
          <br>修复[誓学]弃牌区域的错误
          <br><li>2.9.11.10(2024.11.9)
          <br>还原[乱政]的额外目标指定范围
          <br>修复[妖惑]对目标角色的技能判断和弃牌区域的错误，以及失效技能的还原时机
          <br>更新“魔势力重建”开关
          <br><li>2.9.11.11(2024.11.10)
          <br>修复[暴怒][反骨]结束当前回合的问题，延后效果生效时机(未测试)
          <br><span style=" text-decoration:line-through">修复[天辩]在回合外的出牌阶段可以使用非基本牌</span>
          <br><li>2.9.11.12(2024.11.10)
          <br>修复[天辩]强制选牌，在回合外的出牌阶段可以使用非基本牌
          <br><li>2.9.11.13(2024.11.11)
          <br>修复[截军]限制转化技问题
          <br>修复[芳魂]部分情况无法发动
          <br>重写[蛮裔]
          <br><li>2.9.11.14(2024.11.15)
          <br>添加开关(SP神赵云)用于切换[潜渊]锁定技标签
          <br>还原[八门]可以获得不同属性的杀
          <br>添加开关(SK神郭嘉)更新技能[6.3.5]
          <br><li>2.10.11.0(2024.11.16)
          <br>更新武将(SK神庞统)
          <br><li>2.10.11.1(2024.11.16)
          <br>修复[栖凤][论策]若干bug
          <br><li>2.10.11.2(2024.11.16)
          <br>修复[论策]bug并添加简易ai
          <br><li>2.10.11.3(2024.11.16)
          <br>更正[论策]流程，修复计策生效优先级
          <br>调整[绝世]部分标签
          <br><li>2.10.11.4(2024.11.16)
          <br>优化[论策]的计策ai
          <br><li>2.10.11.5(2024.11.17)
          <br>为[兴汉]添加检测，非万年公主获得则失去该技能
          <br>为[论策]选择计策过程添加文字描述加以辅助
          <br>优化[论策]上策（获得同势力武将的一个技能）实际效果
          <br><li>2.10.11.6(2024.11.18)
          <br>继续优化[论策]的计策ai
          <br>更正[烈弓]三牌转化的摸牌时机
          <br>更正[莺歌]效果，不再封锁无点数牌
          <br><li>2.10.11.7(2024.11.19)
          <br>修复[论策]完成上策（用牌）时，会完成中策（用牌）
          <br>更正[刚直]发动时机
          <br><li>2.10.11.8(2024.11.20)
          <br>重写[论策]计策
          <br><li>2.10.11.9(2024.11.22)
          <br>优化[天辩]打出流程
          <br>优化[谏征]询问发动流程
          <br>添加开关(SK神诸葛亮)更新技能
          <br>更正[招降]发动条件和实际效果
          <br><li>2.10.11.10(2024.11.22)
          <br>更正[狂风]选择条件和描述
          <br>更正[大雾]标记效果
          <br><li>2.12.11.0(2024.11.29)
          <br>更新武将（SK周夷、貂蝉(水墨丹青)）
          <br><li>2.12.11.1(2024.11.30)
          <br>修复[离间]转化杀打出时的数量限制
          <br>更正[闭月]获得牌的game.log顺序(无影响)
          <br>(2024.12.4)
          <br>还原[鹰视]其他角色获得鹰牌也有标记
          <br>优化[鹰视]用牌ai
          <br><li>2.13.11.0(2024.12.13)
          <br>更新武将（SK郭淮）
          <br>(2024.12.13)
          <br>重写[精策]
          <br><li>2.13.11.1(2024.12.14)
          <br>添加散谣将包（魔贾诩）,日后撞名了再改
          <br>修改将包禁将方法，可以依照本体方法禁将
          <br><li>2.13.11.2(2024.12.17)
          <br>修复[精策]一个报错
          <br>(2024.12.22)
          <br>优化[逐寇]选择角色流程
          <br><li>2.14.11.0(2024.12.27)
          <br>更新武将(SK黄承彦)
          <br><li>2.14.11.1(2024.12.28)
          <br>修复非挑战模式下SY暴怒邹氏禁用问题
          <br>修复[仙授]联机模式下获得技能及后续效果不生效的问题
          <br>修复[观虚]联机模式下无效果的问题
          <br><li>2.14.11.2(2024.12.28)
          <br>还原[观虚]选牌情况
          <br>修复SY暴怒邹氏原画加载问题
          <br><li>2.14.11.3(2024.12.29)
          <br>修复[观虚]联机无确定按钮
          <br>优化[潜渊]标记显示(本体版本要求1.10.16)
          <br><li>2.14.11.4(2024.12.30)
          <br>修复[观虚]联机部分问题
          <br>修复[枕戈]效果
          <br><li>2.14.11.5(2025.1.15)
          <br><span style=" text-decoration:line-through">为[观虚]所有选项添加【取消】按钮（按钮不出现问题仍在定位）</span>
          <br>为部分bug修复的技能做联机适配（未测试）
          <br>修复[天启]部分情况不发动的问题|完善知情牌部分（未测试）
          <br><li>2.14.11.6(2025.1.16)
          <br>修复[观虚]在“自动确认”开启情况下部分效果不出现按钮的情况
          <br><li>2.14.11.7(2025.1.17)
          <br>修复“仅点将可用列表”
          <br>将bug修复中的技能做出调整以适配[中流]
          <br>补全极略补充中武将技能的ai部分
          <br><li>2.15.11.0(2025.1.21)
          <br>更新武将(魔孟获)
          <br><li>2.15.11.1
          <br>修复[魔兽]语音效果
          <br>修复[酋首]发动条件与实际不符
          <br><li>2.15.11.2
          <br>为[灵泽]添加效果接口
          <br><li>2.16.11.1(2025.1.25)
          <br>更新武将(SP神孙尚香)
          <br><li>2.16.11.1
          <br>为临牌添加标签(jlsg_xuyuan-glow)
          <br>修改[逐星]使用“逐星”牌的判断
          <br><li>2.16.11.2
          <br>修复[灵泽]许愿效果的若干bug
          <br><li>2.16.11.3
          <br>将[锋影]改为cost写法，修复不发动的bug
          <br><li>2.16.11.4(2025.1.26)
          <br>修复[灵泽]许愿效果bug,提高“获得技能”出现频率（30%）
          <br>修复[魔兽]效果恒为③的bug，优化ai
          <br><li>2.16.11.5
          <br>修复[灵泽]部分效果描述错误，效果错误
          <br><li>2.16.11.6(2025.2.8)
          <br>更正[逐寇]伤害点数
          <br>修复[反骨]不终止结算的问题
          <br><li>2.16.11.7(2025.2.10)
          <br>修复[灵泽]选择命运后不触发效果
          <br><li>2.17.12.0(2025.2.10)
          <br>更新武将(SK吕凯)
          <br>添加开关(SK神甘宁)更新技能[6.4.2]
          <br><li>2.17.12.1(2025.2.26)
          <br>适配新版本
          <br><li>2.17.13.0(2025.2.28)
          <br>添加开关(蛇蝎夫人[魔蔡夫人])还原技能
          <br>修复[明政]结算问题，补齐技能描述
          <br><li>2.18.14.0(6.4.4/2025.3.14)
          <br>更新[枕戈](6.4.4)，招募武将也可以触发“枕戈”牌效果
          <br>优化[兴汉]招募武将的标记
          <br>更新武将(SK神蔡文姬)
          <br><li>2.18.14.1(2025.3.17)
          <br>修复[兴汉]切换武将时触发“每轮开始时”时机
          <br><li>3.20.17.0(2025.4.13)
          <br>重写“七杀包规则重构”
          <br><li>3.20.17.1
          <br>修复“七杀包规则重构”的部分bug
          `
          );
          this.hth_more = more;
        }
        if (this.hth_more_mode === undefined) {
          this.hth_more_mode = true;
          this.parentNode.insertBefore(this.hth_more, this.nextSibling);
          this.innerHTML = '<div class="hth_menu">▼💩日志</div>';
        }
        else {
          this.parentNode.removeChild(this.hth_more);
          delete this.hth_more_mode;
          this.innerHTML = '<div class="hth_menu">▶💩日志</div>';
        };
      },
    },
  }
for (let packName in pack) {
  const info = pack[packName];
  const nameList = Object.keys(info)
    .sort((a, b) => {
      let nameA = info[a].name.slice(0, -4),
        nameB = info[b].name.slice(0, -4);
      return nameA.localeCompare(nameB);
    });
  for (let name of nameList) configInfo[name] = info[name];
}
for (let i in last) configInfo[i] = last[i];
export const config = configInfo;