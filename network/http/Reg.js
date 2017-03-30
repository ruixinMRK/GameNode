
let url = require('url');
let LiveClient = require('../manager/LiveClient');
let mysql = require('mysql');
let poolModule = require('generic-pool');
let QuerySQL = require('../manager/QuerySQL');
let crypto = require('crypto');

//登录注册
class Reg{

	constructor(){
		this.moth = 'GET';
		this.fristReg = false;
	}

	query(req,res,query){
		

		if(!query['name']){
			LiveClient.writeRes(res,401,"{'errcode':401,'errmsg':'非法!!'}");
			return;
		}
		this.req = req;
		this.res = res;

		QuerySQL.instance.start();
		let pro = this.insert(query);
		pro.then(d=>{

			//注册成功数据特殊处理
			
			this.fristReg&&(d = JSON.stringify({data:1}));

			LiveClient.writeRes(res,200,d);
			//新增一条个人私有产品数据
			if(query.type==='reg'&&this.fristReg){
				let sql = 'INSERT INTO user_info (id,name,lastuse) VALUES (0,?,?)';
				QuerySQL.instance.querySql(sql,[query.name,'A']).then(e=>{
					QuerySQL.instance.close();
				});
				this.fristReg = false;
			}
			else{
				QuerySQL.instance.close();
			}

			
		}).catch(e=>{
			console.log(e);
			QuerySQL.instance.close();
		})

	}

	insert(obj){
		
		var  userAddSql = "INSERT INTO userdata VALUES(0,?,?,?,'')";
		var  userAddSql_Params = [obj.name,obj.password,new Date().getTime()];
		
		// console.log(JSON.stringify(obj));

		var pro = this.search(obj).then(data=>{
			
			//判断登陆成功了
			if(obj.type=='login'&&data.length!=0) {
				
				// if(LiveClient.uqid[obj.name]) return Promise.resolve(JSON.stringify({'err':'1','mess':'账号已被登陆'}));

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
				//本地无法获取此cookie  因为跨域了
				this.res.setHeader('Set-Cookie',[`uqid=${uqid};path=/;HttpOnly;`, 'testCookie=1;path=/']);//httpOnly 表示客户端无法用js获取

				return Promise.resolve(JSON.stringify({'data':'1'}));	
			}
			if(obj.type=='login'&&data.length==0) return Promise.resolve(JSON.stringify({'data':'0'}));
			
			// console.log(data,'data');
			//写入数据
			if(data.length == 0){
				this.fristReg = true;
				return QuerySQL.instance.querySql(userAddSql,userAddSql_Params);	
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
		var params = [obj.name];
		if(obj.type=='reg') selectSql = "SELECT * FROM userdata WHERE name = ?";
		else if(obj.type=='login'){
			selectSql = "SELECT * FROM userdata WHERE name = ? and password= ?";
			params.push(obj.password);
		} 
		return QuerySQL.instance.querySql(selectSql,params);
	}

}

module.exports = Reg;
