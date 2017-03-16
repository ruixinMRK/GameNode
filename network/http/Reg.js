
let url = require('url');
let LiveClient = require('../manager/LiveClient');
let mysql = require('mysql');
let poolModule = require('generic-pool');

//登录注册
class Reg{

	constructor(){
		this.connect();
	}

	query(req,res){
		
		let urlPath = req.url;
		let params = url.parse(urlPath,true).query;
		// querystring.parse(urlPath).name
		if(!params.name) return;
		// console.log('请求'+urlPath);

		let pro = this.insert(params);
		pro.then(d=>{
			res.end(d);
			// this.close();
		},e=>{
			res.end(e);
			// this.close();
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
				
				return new Promise((resolve,reject)=>{
				
					// this.Client.query(userAddSql,userAddSql_Params,(err,results)=>{
					
					// 	if(err){
					// 		reject('error,insert');
					// 	}
					// 	else{
					// 		resolve(JSON.stringify({'data':'1'}));
					// 	}
				
					// })

					const resourcePromise = this.mysqlPool.acquire();
					resourcePromise.then(conn=>{
					    conn.query(userAddSql,userAddSql_Params, (err, results)=> {
					        // return object back to pool
					        this.mysqlPool.release(conn);
					        err?reject(err,'error,insert'):resolve(JSON.stringify({'data':'1'}));
					        
					    });
					})
					.catch(function(err){
					   console.log(err);
					});

				
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

		
		var pro = new Promise((resolve,reject)=>{
			
			
			const resourcePromise = this.mysqlPool.acquire();
			resourcePromise.then(conn=>{
			    conn.query(selectSql, (err, results)=> {
			        // return object back to pool
			        this.mysqlPool.release(conn);
			        err?reject(err,'error,select'):resolve(results);
			        // this.mysqlPool.release(conn);
			    });
			})
			.catch(function(err){
			   console.log('数据库错误',err);
			});

		
			//普通版
			// this.Client.query(selectSql,function(err,results){
			// 	if(err){
			// 		reject(err,'error,select');
			// 	}
			// 	else{
			// 		resolve(results);
			// 	}
			// })
			
		})
		return pro;
	}

	connect(){
		//链接数据库
		// this.Client = mysql.createConnection({

		// 	host:'localhost',
		// 	user:'root',
		// 	password:'maruokun',
		// 	database:'plane_data',
		// 	port:3306

		// });
		
		// this.Client.connect(e=>{
		// 	// console.log('testdata数据库开启成功');
		// },err=>{
		// 	console.log(err);
		// });

		// myPool.drain().then(function() {
		//     myPool.clear();
		// });

		//使用mysql连接池
		this.mysqlPool = poolModule.createPool({
		    'name': 'mysql-pool',   // 连接池名称
		    'max': 100,             // 最大连接数           
		    'min': 0,               // 最小连接数  
		    'idleTimeoutMillis': 0,// 空闲等待时间
		    'log': false,           // 是否console.log输出日志
		    // 创建连接方法
		    'create':  ()=> {
		       
		       console.log('生成一个');
		        let pro = new Promise((res,rej)=>{

		        	var conn = mysql.createConnection({
			            'host': 'localhost',
			            'port': 3306,
			            'user': 'root',
			            'password': 'maruokun',
			            'database': 'plane_data',
			            // 'connectTimeout': 3
			            // 'charset':'utf-8',
			        });
			        conn.connect(err=>{
			        	// err&&console.log('数据库开启失败');
			        	if(err) rej(err);
			        	else res(conn);
			        });
			        

		        })
		       	
		       	return pro;
		    },
		    // 销毁方法
		    'destroy': function (conn) {
		        return new Promise(function(resolve){
					          conn.on('end', function(){
					          	console.log('释放完毕');
					            resolve()
					          })
					          conn.disconnect();
					        })
		    }
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
