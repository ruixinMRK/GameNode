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

		// console.log(obj);
		LiveClient.BackAllowList(obj.room,client);
		obj.room&&this.roomData[obj.room].die(obj);
		// console.log(obj,'---');
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
			this.roomData[roomName].createMil(client);
			
			// console.log(this.roomData[roomName].prop,this.roomData[roomName].aiO);
			let obj = {KPI:'matchNOR',room:roomName,ai:this.roomData[roomName].aiO,prop:this.roomData[roomName].prop};
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
				
				if(c.length<=20){
					
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

			this.roomData[roomName].createMil(client);
			let obj = {KPI:'matchNOR',room:roomName,ai:this.roomData[roomName].aiO,prop:this.roomData[roomName].prop};
			WebSocket.instance.send(obj,client);

		}

		console.log('加入房间:'+roomName);
	}

	//客户端离线
	over(obj,client){
		
		//给其他用户发送某个客户端掉线
		for(let str in LiveClient.norRoomData){
			if(LiveClient.norRoomData[str]&&str!='l'&&LiveClient.norRoomData[str].indexOf(client)>-1){
				let n = LiveClient.SearchName(client);//名字
				LiveClient.BackAllowList(str,client);//限定发送范围
				let obj = {KPI:'goDie',type:'-1',name:n};//数据格式
				//清除存储的飞机数据
				this.roomData[str].planeData.heroPlane[n]&&(delete this.roomData[str].planeData.heroPlane[n]);
				WebSocket.instance.send(obj);//发送
				break;
			}
		}
		
		

		// console.log('---nor');
		super.over(obj,client);
		// console.log('---nor1');
		

		for(let str in LiveClient.norRoomData){

			let arr = LiveClient.norRoomData[str];
			// console.log('---nor2');
			if(str=='l'||!arr||arr.length==0) continue;
			// console.log('nor模式离线');
			for(let i=0;i<arr.length;i++){
				if(client === arr[i]){
					LiveClient.norRoomData[str].splice(i,1);
					if(this.roomData[str]&&LiveClient.norRoomData[str].length==0) {
						this.clear(str);
					}
					return;
				}
			}
		}

	}

	//当有客户端存在且房间时间过完
	destoryNor(name){
		this.clear(name);
	}

}

module.exports = ModeNor;