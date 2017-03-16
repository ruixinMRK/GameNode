var TcpRouter = require('../socket/TcpRouter');
var WebSocket = require('../socket/WebSocket');
let LiveClient = require('../manager/LiveClient');
let RoomPVP = require('./RoomPVP');
let ModeParent = require('./ModeParent');

//pvp模式
class ModePVP extends ModeParent{
	
	constructor(){
		super('pvp');
		this.modeRoom = LiveClient.pvpRoomData;
		this.modeWait = LiveClient.pvpWaitList;
		this.dieRoom = {};

		TcpRouter.instance.reg('joinPVP',this.parsePVP.bind(this));
		TcpRouter.instance.reg('resultPVP',this.resultPVP.bind(this));
	}

	//结果返回
	resultPVP(obj,client){

		if(obj.room.indexOf('pvp')<0||this.dieRoom[obj.room]) return;
		
		// console.log(obj.room,obj,'---pvp模式结束');
		//死亡数据
		if(!this.dieRoom[obj.room]){
			this.dieRoom[obj.room] = 1;
			// console.log('---godie数据处理成功');
			WebSocket.instance.send(obj,this.modeRoom[obj.room]);
		}
		
	}

	parsePVP(obj,client){

		this.parse(obj,client);
		//后期如果是战斗力匹配时，LiveClient.pvpWaitList应改为对象，比如说 key为one时 战斗力是100~200 
		if(LiveClient.pvpWaitList.length%2==0){
			this.createRoom();
		}
		return '';
	}

	createRoom(){

		if(LiveClient.pvpWaitList.length<2) return;

		//截取头两位客户端
		let twoClient = LiveClient.pvpWaitList.splice(0,2);
		//告诉客户端匹配成功
		let pvpC = [twoClient[0].tar,twoClient[1].tar];
		

		let roomName = '';
		//曾经有的房间但是已经销毁了,先从缓存中读取
		for(let str in LiveClient.pvpRoomData){
			if(str === 'l') continue;
			let c = LiveClient.pvpRoomData[str];
			if(!c){
				roomName = str;
				LiveClient.pvpRoomData[roomName] = pvpC;
			}
		}

		//为空时表示没有缓存房间
		if(!roomName){
			let L = LiveClient.pvpRoomData.l;
			roomName = 'pvp_r_'+L;
			LiveClient.pvpRoomData[roomName] = pvpC;
			LiveClient.pvpRoomData.l+=1;
		}

		// console.log(roomName);
		//给对手发不同的数据
		for(let j=0;j<twoClient.length;j++){

				let match = null;
				let matchName = '';
				if(j == 0){
					match = twoClient[0].tar;
					matchName = twoClient[1].n;
				} 
				else {
					match = twoClient[1].tar;
					matchName = twoClient[0].n;
				}
				//生成房间信息
				!this.roomData[roomName]&&(this.roomData[roomName] = new RoomPVP(roomName,this.sendData.bind(this),this.clear.bind(this)));

				let obj = {KPI:'matchPVP',room:roomName,p:matchName,ai:this.roomData[roomName].aiO,prop:this.roomData[roomName].prop};
				WebSocket.instance.send(obj,match);
		}

		

		
		this.createRoom();
		console.log('加入房间:'+roomName);
	}

	//计时器调用清除房间
	clear(n){
		super.clear(n);
	}

	//通知对手,一方客户端已掉线
	destoryPVP(n){

		this.dieRoom[n]&&(delete this.dieRoom[n]);
		if(!LiveClient.pvpRoomData[n]) return;

		//检测有一方没有退出的情况,通知 其对方掉线
		let destroyArr = LiveClient.pvpRoomData[n].filter(item=>{
			return item.readyState === item.OPEN;
		})
		// console.log(destroyArr.length,'destroyArr.length');
		if(destroyArr.length>0){
				let obj = {KPI:'destroyPvpRoom',room:n};
				LiveClient.allowList = destroyArr;
				WebSocket.instance.send(obj);
		}

	}

}

module.exports = ModePVP;