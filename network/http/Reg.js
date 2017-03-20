
let url = require('url');
let LiveClient = require('../manager/LiveClient');
let mysql = require('mysql');
let poolModule = require('generic-pool');
let HttpParent = require('./HttpParent');

//登录注册
class Reg extends HttpParent{

	constructor(){
		super();
	}

	query(req,res){
		
		super.query(req,res);

		let params = url.parse(req.url,true).query;

		let pro = this.insert(params);
		pro.then(d=>{
			res.end(d);
		}).catch(e=>{
			console.log(e);
		})

	}

	insert(obj){
		
		var  userAddSql = 'INSERT INTO userdata VALUES(0,?,?,?,\' \')';
		var  userAddSql_Params = [obj.name,obj.password,new Date().getTime()];
		
		// console.log(JSON.stringify(obj));

		var pro = this.search(obj).then(data=>{
			
			//判断登陆成功了
			if(obj.type=='login'&&data.length!=0) {
				// LiveClient.scList[obj.name] = '1';
				console.log('登陆界面',obj.name);
				return Promise.resolve(JSON.stringify({'data':'1'}));	
			}
			if(obj.type=='login'&&data.length==0) return Promise.resolve(JSON.stringify({'data':'0'}));
			
			// console.log(data,'data');
			//写入数据
			if(data.length == 0){
				return super.insert(userAddSql,userAddSql_Params);
			}
			//已经存在用户名了
			return Promise.resolve(JSON.stringify({'data':'0'}));
		
			
		},function(err){
			
			return Promise.reject(err);
			
		})

		return pro;
	}
	search(obj){
		
		// escape 防sql注入 运用此方法后 就不需要用单引号了
		var selectSql = '';
		if(obj.type=='reg')  selectSql = "SELECT * FROM userdata WHERE name = " + this.Client.escape(obj.name);
		else if(obj.type=='login') selectSql = "SELECT * FROM userdata WHERE name = " + this.Client.escape(obj.name) + " and password= " + this.Client.escape(obj.password);
		return super.search(selectSql);
	}

}

module.exports = Reg;
