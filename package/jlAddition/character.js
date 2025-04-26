import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import { postProcessPack } from '../postProcessPack.js';
let characterPack = {
	name: "jlAddition",
	connect: true,
	character: {
	},
	characterSort: {
		jlAddition: {
			jlsg_sk_character_config: [],
			jlsg_soul_character_config: [],
			jlsg_sy_character_config: [],
			jlsg_skpf_character_config: [],
		},
	},
	characterTitle: {
		jlsgsk_qinmi: "纵天之舌",
		jlsgsk_xingdaorong: "零陵上将",
		jlsgsk_zhouyi: "夷陵情殇",
		jlsgsk_guohuai: "垂问秦雍",
		jlsgsk_huangchengyan: "沔阳雅士",
		jlsgsk_lvkai: "尽忠凯南",
		jlsgsk_yangwan: "融沫之鲡",
	},
	characterIntro: {//武将简介    
	},
	characterReplace: {//可切换武将

	},
	translate: {
		jlAddition: "极略补充",
	},
	dynamicTranslate: {//动态翻译

	},
	perfectPair: {//珠联璧合

	}
};
postProcessPack(characterPack);
export const character = characterPack;