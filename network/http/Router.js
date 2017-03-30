
let UploadFile = require('./UploadFile.js');
let Reg = require('./Reg.js');
let Shop = require('./Shop.js');
let UserInfo = require('./UserInfo.js');
let DestoryClient = require('./DestoryClient.js');
let LiveClient = require('../manager/LiveClient');

let route = {
	'/upload': UploadFile,
	'/user':Reg,
	'/shop':Shop,
	'/userinfo':UserInfo,
	'/des':DestoryClient,
}
//路由
class Router{
	constructor(){
		
	}
	
	query(...args){
		// path,req,res,query 四个参数
		let className = this.toCamelString(args[0]);
		let C = route[args[0]];
		if(!this[className]) this[className] = new C();
		//执行对应的操作命令
		if(args[1].method.toUpperCase()!=this[className].moth){
			LiveClient.writeRes(args[2],200,JSON.stringify({err:1,mess:'请求类型不对'}));
			return;
		}
		this[className].query(args[1],args[2],args[3]);

	}

	//首字母大写
	toCamelString(path){
		path = path.split("").reverse().join("");
		let arr = path.match(/\w+(?=\/)/g);
		if(!arr) return 'mainHtml';
		let str = arr.reduce((curr,prev)=>{
			return curr+prev.substring(0,1).toUpperCase()+prev.substring(1);
		},'');

		return str;
	}

	//检查路径是否在配置中
	static checkRouter(path){
		for(let str in route){
			if(str === path) return true;
		}
		return false;
	}
}

module.exports = Router;
