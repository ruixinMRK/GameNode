var TcpRouter = require('../socket/TcpRouter');
var WebSocket = require('../socket/WebSocket');
let LiveClient = require('../manager/LiveClient');
let RoomNOR = require('./RoomNOR');
let ModeParent = require('./ModeParent');

//20人混战模式
class ModeNor extends ModeParent{
	
	constructor(){
		super('nor');
		this.modeRoom = LiveClient.norRoomData;
		this.modeWait = LiveClient.norWaitList;

		TcpRouter.instance.reg('joinNOR',this.parseNor.bind(this));
	}

	//客户端死亡
	die(obj,client){

		LiveClient.BackAllowList(obj.room,client);
		return obj;
	}

	parseNor(obj,client){

		
		this.parse(obj,client);
		
		if(LiveClient.norWaitList.length>0){
			this.createRoom(obj);
		}

		return '';
	}

	createRoom(ob){

		// if(obj.name.indexOf('nor')<0) return;
		//截取头两位客户端
		let client = LiveClient.norWaitList.splice(0,1)[0].tar;
		let roomName = '';
		//曾经有的房间但是已经销毁了,先从缓存中读取 如果是Null，证明房间曾经存在,取出房间名

		let L = LiveClient.norRoomData.l;
		if(L == 0 ){
			roomName = 'nor_r_'+L;

			LiveClient.norRoomData[roomName] = [client];
			LiveClient.norRoomData.l+=1;
			this.roomData[roomName] = new RoomNOR(roomName,this.sendData.bind(this),this.destoryNor.bind(this));
			let obj = {KPI:'matchNOR',room:roomName};
			WebSocket.instance.send(obj,client);
			return;
		}

		for(let str in LiveClient.norRoomData){

		
			if(str === 'l') continue;
			let c = LiveClient.norRoomData[str];
			//c==null  房间曾经被用，现在没人用
			
			if(!c){
				roomName = str;
				LiveClient.norRoomData[str] = [client];
				//生成房间信息
				this.roomData[roomName] = new RoomNOR(roomName,this.sendData.bind(this),this.destoryNor.bind(this));
			}
			else{
				//不等于null 表示房间没满 或者满了 需要先建房间
				
				if(c.length<20){
					
					roomName = str;
					c.push(client);
					
				}
				else{
					
					roomName = 'nor_r_'+L;
					LiveClient.norRoomData[roomName] = [client];
					LiveClient.norRoomData.l+=1;
					this.roomData[roomName] = new RoomNOR(roomName,this.sendData.bind(this),this.destoryNor.bind(this));
				}
					
			}

			let obj = {KPI:'matchNOR',room:roomName};
			WebSocket.instance.send(obj,client);

		}

		// console.log(roomName);	
	}

	//客户端离线
	over(obj,client){
		
		super.over(obj,client);
		for(let str in LiveClient.norRoomData){

			let arr = LiveClient.norRoomData[str];
			if(str=='l'||!arr||arr.length==0) return;
			console.log('nor模式离线');
			for(let i=0;i<arr.length;i++){
				if(client === arr[i]){
					LiveClient.norRoomData[str].splice(i,1);
					if(this.roomData[str]&&this.roomData[str].l==0) {
						this.destoryNor(str);
						this.clear();
					}
					return;
				}
			}
		}

	}

	destoryNor(name){
		this.clear(name);
	}

}

module.exports = ModeNor;