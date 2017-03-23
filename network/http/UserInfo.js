
let HttpParent = require('./HttpParent');
let LiveClient = require('../manager/LiveClient');

//个人信息
class UserInfo extends HttpParent{

	constructor(){
		super();
		this.moth = 'POST';
	}

	//查询经验和金钱
	query(req,res,query){
	
		super.query(req,res,query);	
		let name = LiveClient.SerachUqid(req);
		if(!name){
			LiveClient.writeRes(res,401,"{'errcode':401,'errmsg':'非法!!'}");
			this.close();
			return;
		}

		// console.log(name);
		name = name[1];
		let sqlStr  = '';

		if(query.money&&query.exp){
			//更改金钱和经验
			sqlStr = 'SELECT exp,money FROM user_info WHERE name = ' + this.Client.escape(name) + ' LIMIT 1';

			let money = 0;
			let exp = 0;

			let pro = this.search(sqlStr);
			// console.log(sqlStr);
			pro.then(d=>{
				let obj = Array.from(d)[0];
				money = parseInt(obj['money']) + parseInt(query.money);
				exp = parseInt(obj['exp']) + parseInt(query.exp);
				
				sqlStr = 'UPDATE user_info SET money = ' + money + ', exp=' + exp + ' WHERE name = ' + this.Client.escape(name);
				return this.search(sqlStr)
			}).then(d=>{
				LiveClient.writeRes(res,200,JSON.stringify({err:0}));
				this.close();
			}).catch(err=>{
				LiveClient.writeRes(res,200,JSON.stringify({err:1,mess:'数据库出错'}));
				this.close();
			})

		}
		else{

			sqlStr = 'SELECT exp,money FROM user_info WHERE name = ' + this.Client.escape(name) + ' LIMIT 1';
			let pro = this.search(sqlStr);
			pro.then(d=>{
				let obj = {value:[]};
				if(Array.isArray(d)){
					obj.value = Array.from(d);
				}
				LiveClient.writeRes(res,200,JSON.stringify(obj));
				this.close();
			}).catch(err=>{
				LiveClient.writeRes(res,200,JSON.stringify({err:1,mess:'数据库出错'}));
				this.close();
			})

		}
		

	}

	

}

module.exports = UserInfo;
