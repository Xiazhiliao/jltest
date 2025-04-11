import { precontent } from "./main/precontent.js";
import { content } from "./main/content.js";
import { config } from "./main/config.js";
game.import("extension", function (lib, game, ui, get, ai, _status) {
  return {
    name: "极略测试",
    connect: true,
    precontent: precontent,
    content: content,
    config: config,
    help: {},
    package: {
      character: {}, card: {}, skill: {},
      intro: "本扩展将不再添加“极略自用”已有的武将，将以“极略自用”作为前置扩展，并以开关的形式覆盖部分内容。",
      author: `<samp id='宁宁澄'><small><strong>流年</strong></small></samp><style>#宁宁澄{animation:ningningchengbiaoqian 20s linear 1.5s infinite;font-family:shousha;font-size:40px;text-align: center; color: #00FFFF;text-shadow:-1.3px 0px 2.2px #000, 0px -1.3px 2.2px #000, 1.3px 0px 2.2px #000 ,0px 1.3px 2.2px #000;}@keyframes ningningchengbiaoqian{0% {color:#00FFFF;opacity:1;}9%{opacity:0;}18%{color: #00FFFF;opacity:1;}27%{opacity:0;}36% {color:#00FFFF;opacity:1;}45%{opacity:0;}54%{color: #00FFFF;opacity:1;}63%{opacity:0;}72%{color:#00FFFF;opacity:1;}81%{opacity:0;}90%{color: #00FFFF;opacity:1;}99%{opacity:0;}}</style>
       <img src='${lib.assetURL}extension/极略测试/author.jpg' alt='Q群昵称：流年（虫豸）' title='Q群昵称：流年（虫豸）' width='50px' height='50px' style="border-radius:100%;">
       <b><br>版本：2.20.17.0`,//以上扒了段宁宁澄的HTML CSS标签
      diskURL: "",
      forumURL: "",
      version: "2.20.17.0",
    },
    files: { "character": [], "card": [], "skill": [] },
  }
});
