
let LiveClient = require('../manager/LiveClient');
let RoomParent = require('./RoomParent');


//房间20人混战
class RoomNOR extends  RoomParent{

	constructor(name,fn,desFn){

		super(name,fn);

		this.name= name;
		this.desFn = desFn;
		this.totalTime = 60;
		this.timer = setInterval(e=>{
			this.fn({KPI:'NorTime',room:this.name,time:this.totalTime},this.name);
			this.totalTime--;
			if(this.totalTime==0){
				desFn(name);//销毁房间吧
				clearInterval(this.timer);
			}
		},1000);

	}

	get l(){
		return LiveClient.norRoomData[this.name].length;
	}

	clear(){
		super.clear();
		clearInterval(this.timer);
		this.desFn = null;
	}

}

module.exports = RoomNOR;