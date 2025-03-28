import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import { postProcessPack } from '../postProcessPack.js';
let characterPack = {
	name: "jlAddition",
	connect: true,
	character: {

		jlsgsk_gygs_sunce:["male","wu",4,["jlsg_gygs_jiang","jlsg_gygs_weifeng"],["name:孙|策"]],
	},
	characterSort: {
		jlAddition: {
			jlsg_sk_character_config: [],
			jlsg_soul_character_config: [],
			jlsg_sy_character_config: [],
			jlsg_skpf_character_config: [],
			jlsg_skpf_character_config: ["jlsgsk_gygs_sunce"],
		},
	},
	characterTitle: {
		jlsgsk_qinmi: "纵天之舌",
		jlsgsk_xingdaorong: "零陵上将",
		jlsgsk_zhouyi: "夷陵情殇",
		jlsgsk_guohuai: "垂问秦雍",
		jlsgsk_huangchengyan: "沔阳雅士",
		jlsgsk_lvkai: "尽忠凯南",

		jlsgsoul_pangtong: "凤唳九天",
		jlsgsoul_sp_zhaoyun: "破渊追天",
		jlsgsoul_sp_sunshangxiang: "星流霆击",
		jlsgsoul_caiwenji: "霜弦哀世",

		jlsgsk_smdq_diaochan: "水墨丹青",
		jlsgsk_gygs_sunce:"冠勇盖世",
	},
	characterIntro: {//武将简介    
	},
	characterReplace: {//可切换武将

	},
	translate: {
		jlAddition: "极略补充",
		jlsgsk_gygs_sunce:"SPF孙策",
		jlsgsk_gygs_sunce_ab:"孙策",
	},
	dynamicTranslate: {//动态翻译

	},
	perfectPair: {//珠联璧合

	}
};
postProcessPack(characterPack);
export const character = characterPack;