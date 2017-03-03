
var url = require('url');
let LiveClient = require('../manager/LiveClient');

//登录注册
class Reg{
	constructor(){
	}

	query(req,res){
		
		let urlPath = req.url;
		let params = url.parse(urlPath,true).query;
		if(!params.name) return;

		this.close();
		this.connect();

		// console.log('请求'+urlPath);

		let pro = this.insert(params);
		pro.then(d=>{
			res.end(d);
			this.close();
		},e=>{
			res.end(e);
			this.close();
		})

	}

	insert(obj){
		
		var  userAddSql = 'INSERT INTO userdata VALUES(0,?,?,?)';
		var  userAddSql_Params = [obj.name,obj.password,new Date().getTime()];
		
		// console.log(JSON.stringify(obj));

		var pro = this.search(obj).then(data=>{
			
			//判断登陆成功了
			if(obj.type=='login'&&data.length!=0) {
				// LiveClient.scList[obj.name] = '1';
				console.log('登陆',obj.name);
				return Promise.resolve(JSON.stringify({'data':'1'}));	
			}
			if(obj.type=='login'&&data.length==0) return Promise.resolve(JSON.stringify({'data':'0'}));
			
			// console.log(data,'data');
			//写入数据
			if(data.length == 0){
				
				return new Promise((resolve,reject)=>{
				
					this.Client.query(userAddSql,userAddSql_Params,(err,results)=>{
					
						if(err){
							reject('error,insert');
						}
						else{
							resolve(JSON.stringify({'data':'1'}));
						}
				
					})
				
				});
				
			}
			//已经存在用户名了
			return Promise.resolve(JSON.stringify({'data':'0'}));
		
			
		},function(err){
			
			return Promise.reject('error');
			
		})

		return pro;
	}
	search(obj){
		
		var selectSql = '';
		if(obj.type=='reg')  selectSql = "SELECT * FROM userdata WHERE name = " + "'"+obj.name+"'";
		else if(obj.type=='login') selectSql = "SELECT * FROM userdata WHERE name = \'" +obj.name + "\' and password= \'" + obj.password + "\'" ;

		// console.log(selectSql);

		var pro = new Promise((resolve,reject)=>{
			
			
			this.Client.query(selectSql,function(err,results){
				
				if(err){

					reject(err,'error,select');
				}
				else{

					resolve(results);
				}
		
			})
			
		})
		return pro;
	}

	connect(){
		//链接数据库
		this.Client = require('mysql').createConnection({

			host:'localhost',
			user:'root',
			password:'maruokun',
			database:'testdata',
			port:3306

		});
		
		this.Client.connect(e=>{
			// console.log('testdata数据库开启成功');
		},err=>{
			console.log(err);
		});

	}

	close(){
		//destroy不管query是否访问完成 都直接取消
		// this.Client&&this.Client.end();destroy()
		this.Client&&this.Client.destroy();
		this.Client = null;
	}
}

module.exports = Reg;
