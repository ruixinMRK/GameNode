let qs = require('querystring');
let crypto = require('crypto');

//存储所有的客户端
class LiveClient{
	constructor(){
	}

	//设置允许列表  房间号 当前socket
	static BackAllowList(roomStr,socket){

		if(!roomStr) return;
		
		let room = [];
		let match = roomStr.split('_')[0];

		if(match == 'pvp'){
			room = LiveClient.pvpRoomData[roomStr];
			if(room){
				let allowList = room.filter((item)=>{ return item!==socket});
				LiveClient.allowList = allowList;
			}
		}
		else if(match == 'nor'){

			room = LiveClient.norRoomData[roomStr];
			if(room){
				let allowList = room.filter((item)=>{ return item!==socket});
				LiveClient.allowList = allowList;
			}

		}

	}

	//给定客户端  返回名字
	static SearchName(client){
			
		for(let str in LiveClient.scList){
			if(LiveClient.scList[str] === client) return str;
		}
		return '';
	}

	//判断用户是否合法  返回 布尔值和名称
	static SerachUqid(request){

		let id = qs.parse(request.headers.cookie,';')['uqid'];
		let ip = (request.headers['x-forwarded-for']||request.connection.remoteAddress||request.socket.remoteAddress||request.connection.socket.remoteAddress).replace('::ffff:','');

		// console.log(qs.parse(request.headers.cookie,';'),request.headers.cookie);
		// console.log(id);
		for(let s in LiveClient.uqid){
			let uid = LiveClient.uqid[s].uqid;
			let uip = LiveClient.uqid[s].ip;
			// console.log(uid);
			if(uid === id&&ip===uip){
				return [true,s];
			}
		}
		return null;
	}

	//处理http请求
	static writeRes(res,status,log){

		res.writeHead(status, {'Content-Type': 'text/plain;charset=utf-8'});
		res.write(log);
		res.end();
	}

}

//在线用户
LiveClient.onlineList = {};
//接入socket用户
LiveClient.scList = {};

//房间信息(PVP)
LiveClient.pvpRoomData = {l:0};
//等待加入pvp用户列表
LiveClient.pvpWaitList = [];

//房间信息(20人混战版)
LiveClient.norRoomData = {l:0};
LiveClient.norWaitList = [];


//允许发送数据的客户端
LiveClient.allowList = [];

LiveClient.uqid = {};

module.exports = LiveClient;