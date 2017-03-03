var TcpRouter = require('../socket/TcpRouter');
let LiveClient = require('../manager/LiveClient');

//客户端的添加和移除
class PingParser{
	constructor(){
		this.data = {};
		TcpRouter.instance.reg('ping',this.parse.bind(this));
	}

	parse(obj,client){
		this.data = obj;
		LiveClient.allowList = client;
		return this.data;
	}

	getData(){
		return this.data;
	}

}

module.exports = PingParser;