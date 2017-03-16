
let LiveClient = require('../manager/LiveClient');
let RoomParent = require('./RoomParent');

//房间PVP
class RoomPVP extends  RoomParent{

	constructor(name,fn,desFn){
		super(name,fn);

		this.totalTime = 120;
		this.desFn = desFn;
		this.timer = setInterval(e=>{

			let callObj = {KPI:'PVPTime',room:this.name,time:this.totalTime};
			
			this.fn(callObj,this.name);
			if(this.totalTime<=0){
				desFn(name);//销毁房间吧
				clearInterval(this.timer);
			}
			this.totalTime--;
		},1000);

	}

	clear(){
		super.clear();
		clearInterval(this.timer);
		this.desFn = null;
	}

}

module.exports = RoomPVP;