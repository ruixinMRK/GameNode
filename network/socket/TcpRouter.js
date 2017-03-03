

class TcpRouter{

	constructor(){
		this.map = {};
	}

	static get instance(){
		if(!TcpRouter.__instance){
			TcpRouter.__instance  = new TcpRouter();
		}
		return TcpRouter.__instance;
	}

	//注册
	reg(id,fn){
		!this.map[id]&&(this.map[id] = []);
		// console.log(id);
		this.map[id].push(fn);
	}
	
	//派发数据
	subscr(obj,socket){
		let name = obj.KPI;
		// console.log(name);
		if(!this.map[name]) return [];
		let  i = this.map[name].length;
		let parserData = [];

		while(i--){
			parserData.push(this.map[name][i](obj,socket));
		}
		return parserData;
	}

}
TcpRouter.__instance = null;
module.exports = TcpRouter;
