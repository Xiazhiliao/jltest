import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import { postProcessPack } from '../postProcessPack.js';
let characterPack = {
	//在这里编写角色信息。
	name: "jlRumor",
	connect: true,
	character: {
		"jlsgrm_jiaxubaonu": ["male", "qun", 3, ["jlsg_rm_guanwang", "jlsg_rm_yintui", "jlsg_rm_jiuhu"], ["qun", "boss", "bossallowed"], "qun"],
	},
	characterSort: {
	},
	characterTitle: {
	},
	characterIntro: {//武将简介    
	},
	characterReplace: {//可切换武将

	},
	translate: {
		jlRumor: "极略散谣",
		jlsgrm_jiaxubaonu: "乱世之始",
	},
	dynamicTranslate: {//动态翻译

	},
	perfectPair: {//珠联璧合

	}
};
postProcessPack(characterPack);
export const character = characterPack;