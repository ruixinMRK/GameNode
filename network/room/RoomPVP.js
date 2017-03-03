
let LiveClient = require('../manager/LiveClient');
let RoomParent = require('./RoomParent');

//房间PVP
class RoomPVP extends  RoomParent{

	constructor(name,fn){
		super(name,fn);
	}

}

module.exports = RoomPVP;