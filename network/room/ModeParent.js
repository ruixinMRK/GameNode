var TcpRouter = require('../socket/TcpRouter');
var WebSocket = require('../socket/WebSocket');
let LiveClient = require('../manager/LiveClient');

//模式的父类
class ModeParent{
	
	constructor(mode){

		this.mode = mode;
		this.roomData = {};

		//以下被变量重写
		this.modeRoom = null;
		this.modeWait = null;

		//记录分
		this.recordPoints = {};

		TcpRouter.instance.reg('goDie',this.die.bind(this));
		TcpRouter.instance.reg('gameOver',this.over.bind(this));
		TcpRouter.instance.reg('goLive',this.live.bind(this));
		TcpRouter.instance.reg('planProp',this.planProp.bind(this));
		TcpRouter.instance.reg('planWalk',this.planWalk.bind(this));
		TcpRouter.instance.reg('AiHit',this.aiHit.bind(this));
	}

	die(obj,client){

	}

	parse(obj,client){

		if(!obj.name) return;

		// LiveClient.scList[obj.name]!='1'?client.socket.end():LiveClient.scList[obj.name] = client;
		LiveClient.scList[obj.name] = client;

		let clientObj = {};
		clientObj.n = obj.name;
		clientObj.tar = client;
		clientObj.t = new Date().getTime();
		clientObj.ip = client.socket.remoteAddress;
		clientObj.port = client.socket.remotePort;

		let L= this.modeWait.length;

		for(let i=0;i<L;i++){
			let o = this.modeWait[i];
			if(o.ip === client.socket.remoteAddress&&o.port === client.socket.remotePort) this.modeWait.splice(i,1);
			this.modeWait.push(clientObj);
		}

		L==0&&this.modeWait.push(clientObj);
		// console.log('---',this.modeWait,LiveClient.pvpWaitList);
	}

	//房间的回调信息(主动发送道具和电脑AI)
	sendData(data,roomName){
		let roomData = this.modeRoom[roomName];
		// console.log(roomName,roomData,'---111');
		if(!roomData) return;
		WebSocket.instance.send(data,roomData);
	}

	//客户端加入
	live(obj,client){
		// this.data = obj;
		//必须要先登录  登录时对象会被赋值为1
		// if(!obj.name) return;

		LiveClient.BackAllowList(obj.room,client);
		return obj;
	}

	//处理客户端回传的道具问题
	planProp(obj,client){
		let roomData = this.roomData[obj.room];
		if(!roomData) return;
		roomData.createProp(obj.id);
	}

	

	//飞机的位置，角度，状态的实时数据
	planWalk(obj,client){
		
	
		if(!this.roomData[obj.room]) return '';
		//处理飞机数据
		this.roomData[obj.room]&&(this.roomData[obj.room].handleHeroPlan(obj));
		////处理AI掉血数据
		this.roomData[obj.room]&&obj['AI']&&(this.roomData[obj.room].checkAI(obj));

		return '';
	}

	aiHit(obj,client){
		if(!obj.room||!this.roomData[obj.room]) return '';
		LiveClient.allowList = this.modeRoom[obj.room];
		return obj;
	}

	//客户端退出(pvp和nor都会执行方法)
	over(obj,client){

		for(let n = 0;n<this.modeWait.length;n++){
			let c = this.modeWait[n].tar;
			if(c === client) this.modeWait.splice(n,1);
		}

		for(let str in LiveClient.scList){
			if(LiveClient.scList[str] === client){
				LiveClient.scList[str].socket.end();
				LiveClient.scList[str] = null;
				delete LiveClient.scList[str];
				break;
			}
		}

		//nor模式，不需要以下检测
		if(this.mode==='nor') return;

		for(let str in this.modeRoom){
				
				if(str === 'l') continue;	
				//检测pvp模式,有一个人退出，房间就会关闭
				let arr = this.modeRoom[str];
				if(!arr||arr.length==0) continue;
				let t = arr.filter(item=>{return item === client});
				t.length>0&&this.clear(str);
		}

		

		return '';
	}

	//房间清理
	clear(n){

		console.log(n,'清除房间');

		//调用pvp中的方法
		this.constructor.prototype.hasOwnProperty('destoryPVP')&&this.destoryPVP(n);

		if(!this.roomData[n]||!this.modeRoom[n]) return;

		//清除房间
		this.roomData[n].clear();
		this.roomData[n] = null;

		//清除房间的socket
		let o = this.modeRoom[n];
		for(let i=0,L=o.length;i<L;i++){
			o[i].socket.end();
		}
		o.length = 0;
		this.modeRoom[n] = null;

	}

}

module.exports = ModeParent;