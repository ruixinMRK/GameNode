
//存储所有的客户端
class LiveClient{
	constructor(){
	}

	//返回允许列表  房间号 当前socket
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

	static SearchName(client){
		
		for(let str in LiveClient.scList){
			if(LiveClient.scList[str] === client) return str;
		}
		return '';
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

module.exports = LiveClient;