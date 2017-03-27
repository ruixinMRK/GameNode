

let LiveClient = require('../manager/LiveClient');
let QuerySQL = require('../manager/QuerySQL');

//个人信息
class UserInfo{

	constructor(){
		this.moth = 'POST';
	}

	//查询经验和金钱
	query(req,res,query){
	
		
		let name = LiveClient.SerachUqid(req);
		if(!name){
			LiveClient.writeRes(res,401,"{'errcode':401,'errmsg':'非法!!'}");
			return;
		}
		QuerySQL.instance.start();
		// console.log(name);
		name = name[1];
		let sqlStr  = '';
		let params = [];

		if(query.money&&query.exp){
			//更改金钱和经验
			sqlStr = 'SELECT exp,money FROM user_info WHERE name = ? LIMIT 1';
			params = [name];

			let money = 0;
			let exp = 0;

			let pro = QuerySQL.instance.querySql(sqlStr,params);
			// console.log(sqlStr);
			pro.then(d=>{
				let obj = Array.from(d)[0];
				money = parseInt(obj['money']) + parseInt(query.money);
				exp = parseInt(obj['exp']) + parseInt(query.exp);
				
				sqlStr = 'UPDATE user_info SET money = ?, exp = ? WHERE name = ?';
				params = [money,exp,name];

				return QuerySQL.instance.querySql(sqlStr,params);
			}).then(d=>{
				LiveClient.writeRes(res,200,JSON.stringify({err:0}));
				QuerySQL.instance.close();
			}).catch(err=>{
				LiveClient.writeRes(res,200,JSON.stringify({err:1,mess:'数据库出错'}));
				QuerySQL.instance.close();
			})

		}
		else{

			
			sqlStr = 'SELECT exp,money,lastuse FROM user_info WHERE name = ?';
			params = [name];

			if(query.default){
				//设置默认飞机
				sqlStr = 'UPDATE user_info SET lastuse = ? WHERE name = ?';
				params = [query.default,name];
			}

			let pro = QuerySQL.instance.querySql(sqlStr,params);
			pro.then(d=>{
				if(query.default) LiveClient.writeRes(res,200,JSON.stringify({err:0}));
				else{
					
					if(Array.isArray(d)){
						let obj  = d[0];
						LiveClient.writeRes(res,200,JSON.stringify(obj));
					}
				}
				QuerySQL.instance.close();
			}).catch(err=>{
				LiveClient.writeRes(res,200,JSON.stringify({err:1,mess:'数据库出错'}));
				QuerySQL.instance.close();
			})



		}

		

	}

	

}

module.exports = UserInfo;
