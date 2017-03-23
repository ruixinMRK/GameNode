
let url = require('url');
let LiveClient = require('../manager/LiveClient');
let mysql = require('mysql');
let poolModule = require('generic-pool');
let HttpParent = require('./HttpParent');
let crypto = require('crypto');

//登录注册
class Reg extends HttpParent{

	constructor(){
		super();
		this.moth = 'GET';
	}

	query(req,res,query){
		
		super.query(req,res,query);

		if(!query['name']){
			LiveClient.writeRes(res,401,"{'errcode':401,'errmsg':'非法!!'}");
			return;
		}
		this.req = req;
		this.res = res;

		let pro = this.insert(query);
		pro.then(d=>{

			// res.end(d);
			LiveClient.writeRes(res,200,d);
			//新增一条个人私有产品数据
			if(query.type==='reg'){
				var  userAddSql = 'INSERT INTO user_info (id,name) VALUES(0,?)';
				var  userAddSql_Params = [query.name];
				super.insert(userAddSql,userAddSql_Params);
			}

			this.close();
		}).catch(e=>{
			console.log(e);
			this.close();
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

				//伪码
				for( var rs=''; rs.length < 5; rs  += Math.random().toString(36).substr(2));
				let randStr = rs.substr(0,5);
				let str = obj.name + "_"+ randStr;
				
				//sha1 加密
				var shasum = crypto.createHmac('sha1','maruokun');
				shasum.update(str);
				var uqid = shasum.digest('hex');

				let ip = this.req.headers['x-forwarded-for']||this.req.connection.remoteAddress||this.req.socket.remoteAddress||this.req.connection.socket.remoteAddress;
				LiveClient.uqid[obj.name] = {
					uqid:uqid,
					t:Date.now(),
					ip:ip.replace('::ffff:',''),
					rs:randStr
				}
				// console.log(uqid,obj.name,LiveClient.uqid,'---uid');
				// Max-Age=-1;
				this.res.setHeader('Set-Cookie',[`uqid=${uqid};HttpOnly`, 'testCookie=1']);//httpOnly 表示客户端无法用js获取

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
		if(!this.Client) Promise.resolve(JSON.stringify({'err':'err'}));
		// console.log('正在查询reg');
		if(obj.type=='reg')  selectSql = "SELECT * FROM userdata WHERE name = " + this.Client.escape(obj.name);
		else if(obj.type=='login') selectSql = "SELECT * FROM userdata WHERE name = " + this.Client.escape(obj.name) + " and password= " + this.Client.escape(obj.password);
		return super.search(selectSql);
	}

}

module.exports = Reg;
