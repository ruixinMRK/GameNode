
let url = require('url');
let LiveClient = require('../manager/LiveClient');

//客户端的移除
class DestoryClient{

	constructor(){
		this.moth = 'GET';
	}

	query(req,res,query){
		

		this.req = req;
		this.res = res;

		let name = LiveClient.SerachUqid(req);

		if(!name){
			LiveClient.writeRes(res,401,"{'errcode':401,'errmsg':'非法!!'}");
			return;
		}

		name&&(name = name[1]);

		this.res.setHeader('Set-Cookie',[`uqid=${name[2]};path=/;HttpOnly;Max-Age=0`, 'testCookie=1;path=/;Max-Age=0']);
		LiveClient.writeRes(res,200,"{'err':0}");
		LiveClient.uqid[name]&&(delete LiveClient.uqid[name]);
		// console.log(LiveClient.uqid[name],'---des');
	}


}

module.exports = DestoryClient;
