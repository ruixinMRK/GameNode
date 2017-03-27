

let mysql = require('mysql');
//操作数据库
class QuerySQL{
	
	constructor(){
		this.Client = null;//数据库连接
	}

	static get instance(){
		if(!QuerySQL.__client){
			QuerySQL.__client = new QuerySQL();
		}
		return QuerySQL.__client;
	}
	
	start(){
		this.connect();
	}

	//查询语句(使用此种方案,无需再为进行编码,防止SQL注入)
	querySql(sqlStr,sqlParams){

		return new Promise((resolve,reject)=>{

			this.Client.query(sqlStr,sqlParams,(err,results)=>{
				if(err){
					reject(JSON.stringify(err));
				}
				else{
					resolve(results);
				}
			})

		})

	}

	//已经不再使用
	insert(sqlStr,sqlParams){

		return new Promise((resolve,reject)=>{
				
					this.Client.query(sqlStr,sqlParams,(err,results)=>{
					
						if(err){
							reject(err);
							
						}
						else{
							resolve(JSON.stringify({'data':'1'}));
							
						}
				
					})
				
				});

		// const resourcePromise = this.mysqlPool.acquire();
					// resourcePromise.then(conn=>{
					//     conn.query(userAddSql,userAddSql_Params, (err, results)=> {
					//         // return object back to pool
					//         this.mysqlPool.release(conn);
					//         err?reject(err,'error,insert'):resolve(JSON.stringify({'data':'1'}));
					        
					//     });
					// })
					// .catch(function(err){
					//    console.log(err);
					// });

	}	

	//链接数据库
	connect(){
		
		this.Client = mysql.createConnection({

			host:'localhost',
			user:'root',
			password:'maruokun',
			database:'plane_data',
			port:3306

		});
		
		this.Client.connect(e=>{
			e&&console.log('数据库开启失败');
		});

		// myPool.drain().then(function() {
		//     myPool.clear();
		// });

		//使用mysql连接池
		// this.mysqlPool = poolModule.createPool({
		//     'name': 'mysql-pool',   // 连接池名称
		//     'max': 100,             // 最大连接数           
		//     'min': 0,               // 最小连接数  
		//     'idleTimeoutMillis': 0,// 空闲等待时间
		//     'log': false,           // 是否console.log输出日志
		//     // 创建连接方法
		//     'create':  ()=> {
		       
		//        console.log('生成一个');
		//         let pro = new Promise((res,rej)=>{

		//         	var conn = mysql.createConnection({
		// 	            'host': 'localhost',
		// 	            'port': 3306,
		// 	            'user': 'root',
		// 	            'password': 'maruokun',
		// 	            'database': 'plane_data',
		// 	            // 'connectTimeout': 3
		// 	            // 'charset':'utf-8',
		// 	        });
		// 	        conn.connect(err=>{
		// 	        	// err&&console.log('数据库开启失败');
		// 	        	if(err) rej(err);
		// 	        	else res(conn);
		// 	        });
			        

		//         })
		       	
		//        	return pro;
		//     },
		//     // 销毁方法
		//     'destroy': function (conn) {
		//         return new Promise(function(resolve){
		// 			          conn.on('end', function(){
		// 			          	console.log('释放完毕');
		// 			            resolve()
		// 			          })
		// 			          conn.disconnect();
		// 			        })
		//     }
		// });

	}

	close(){
		//destroy不管query是否访问完成 都直接取消
		// this.Client&&this.Client.end();destroy()
		this.Client&&this.Client.destroy();
		this.Client = null;
		this.httpData = null;
	}

	

}

QuerySQL.__client = null;

module.exports = QuerySQL;