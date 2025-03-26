import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { skill } from "./skill.js";
import { character } from "./character.js";
for (let i in skill) {
	if (i in character && typeof skill[i] == "object" && Object.keys(skill[i]).length) {
		let info = skill[i]
		for (let j in info) character[i][j] = info[j];
	}
	else character[i] = skill[i];
};
character.skill = skill.skill;
const pack = {
	connect: true,
}
for (let i in character) {
	pack[i] = character[i];
}
export default pack;