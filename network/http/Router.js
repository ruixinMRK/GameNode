
let UploadFile = require('./UploadFile.js');
let Reg = require('./Reg.js');
let Shop = require('./Shop.js');

let route = {
	'/upload': UploadFile,
	'/user':Reg,
	'/shop':Shop
}
//路由
class Router{
	constructor(){
		
	}
	
	query(path,req,res){
		// if(!route[path]) return false;

		let className = this.toCamelString(path);
		let C = route[path];
		if(!this[className]) this[className] = new C();
		//执行对应的操作命令
		this[className].query(req,res);

	}

	//首字母大写
	toCamelString(path){
		path = path.split("").reverse().join("");
		let arr = path.match(/\w+(?=\/)/g);

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
