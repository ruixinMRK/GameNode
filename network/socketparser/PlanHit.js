var TcpRouter = require('../socket/TcpRouter');
let  LiveClient = require('../manager/LiveClient');

//飞机的 碰撞数据
class PlanHit{
	
	constructor(){
		this.data = {};
		TcpRouter.instance.reg('planHit',this.parse.bind(this));
	}

	parse(obj,client){
		this.data = obj;
		LiveClient.BackAllowList(obj.room,client);
		return this.data;
	}

	getData(){
		return this.data;
	}

}

module.exports = PlanHit;