// let PlanWalk = require('../socketparser/PlanWalk');
let PingParser = require('../socketparser/PingParser');
let PlanHit = require('../socketparser/PlanHit');
// let JoinRoom  = require('../room/JoinRoom');
let ModePVP  = require('../room/ModePVP');
let ModeNor  = require('../room/ModeNor');

//parse解析器
let route = {
	// 'planWalk': PlanWalk,
	'ping':PingParser,
	'hit':PlanHit,
	// 'join':JoinRoom,
	'modepvp':ModePVP,
	'modenor':ModeNor,
}

class ManagerParser{

	constructor(){
		for(let str in route){
			let instance = new route[str];
		}
	}

}

module.exports = ManagerParser;
