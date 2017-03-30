
let url = require('url');
let mysql = require('mysql');
let LiveClient = require('../manager/LiveClient');
let QuerySQL = require('../manager/QuerySQL');

//登录注册
class Shop{

	constructor(){
		this.moth = 'POST';
	}

	//查询商品
	query(req,res,query){
	
		QuerySQL.instance.start();

		this.data = {value:[]};

		let u = LiveClient.SerachUqid(req);
		let name = u[1];
		let sqlStr = '';
		let sqlPar = [];

		if(query.buyName){
			//购买商品
			sqlStr = 'SELECT price FROM shop_data WHERE nameEng = ?';
			sqlPar = [query.buyName];

			let money = 0;
			let price = 0;
			let bal = 0;
			let pro = QuerySQL.instance.querySql(sqlStr,sqlPar);
			// console.log(sqlStr,sqlPar);
			pro.then(d=>{
				
				if(d.length==0){
					return Promise.reject({err:0,mess:'商品不存在'});
				}
				price = Array.from(d)[0]['price'];
				sqlStr = 'SELECT money FROM user_info WHERE name= ? LIMIT 1';
				sqlPar = [name];

				// console.log(d,sqlStr);
				return QuerySQL.instance.querySql(sqlStr,sqlPar);
			}).then(data=>{

				money = Array.from(data)[0]['money'];
				if(money>=price){
					bal = money - price;
				}
				else{
					return Promise.reject({err:1,mess:'余额不足'});
				}
				
				sqlStr = `UPDATE user_info SET ${query.buyName} = 1,money = ? WHERE name = ?`;
				// console.log(sqlStr);
				sqlPar = [bal,name];
				return QuerySQL.instance.querySql(sqlStr,sqlPar);

			}).then(data=>{
				LiveClient.writeRes(res,200,JSON.stringify({err:0}));
				QuerySQL.instance.close();
			}).catch(e=>{
				// console.log(e);
				LiveClient.writeRes(res,200,JSON.stringify(e));
				QuerySQL.instance.close();
			})


		}
		else{

			sqlStr = 'SELECT nameCh,price,nameEng FROM shop_data;';
			//查询商品
			let pro = QuerySQL.instance.querySql(sqlStr);
			pro.then(d=>{
			
				if(Array.isArray(d)){
					this.data.value = Array.from(d);
				}
				
				sqlStr = 'SELECT * FROM user_info WHERE name = ?';

				return QuerySQL.instance.querySql(sqlStr,[name]);

			}).then(data=>{

				let o = Array.from(data)[0];
				
				for(let i =0;i<this.data.value.length;i++){
					let nameEng = this.data.value[i].nameEng;
					if(o[nameEng]==1){
						this.data.value[i].have = 1;
					}
					// delete this.data.value[i].nameEng;
				}

				LiveClient.writeRes(res,200,JSON.stringify(this.data));
				QuerySQL.instance.close();
			}).catch(err=>{
				console.log(err);
				QuerySQL.instance.close();
			})

		}
		

	}



}

module.exports = Shop;
