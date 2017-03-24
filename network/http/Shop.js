
let url = require('url');
let mysql = require('mysql');
let HttpParent = require('./HttpParent');
let LiveClient = require('../manager/LiveClient');
//登录注册
class Shop extends HttpParent{

	constructor(){
		super();
		this.moth = 'POST';
	}

	//查询商品
	query(req,res,query){
	
		super.query(req,res,query);	


		this.data = {value:[]};

		let u = LiveClient.SerachUqid(req);
		let name = u[1];
		let sqlStr = '';

		if(query.buyName){
			//购买商品
			sqlStr = 'SELECT price FROM shop_data WHERE nameEng='+ this.Client.escape(query.buyName);

			let money = 0;
			let price = 0;
			let bal = 0;
			let pro = this.search(sqlStr);
			pro.then(d=>{
				
				if(d.length==0){
					return Promise.reject({err:0,mess:'商品不存在'});
				}
				price = Array.from(d)[0]['price'];
				sqlStr = 'SELECT money FROM user_info WHERE name=' + this.Client.escape(name) + 'LIMIT 1';
				// console.log(d,sqlStr);
				return this.search(sqlStr);
			}).then(data=>{

				money = Array.from(data)[0]['money'];
				if(money>=price){
					bal = money - price;
				}
				else{
					return Promise.reject({err:1,mess:'余额不足'});
				}
				
				sqlStr = `UPDATE user_info SET ${query.buyName} = 1,money = ` + bal + ` WHERE name = ` + this.Client.escape(name);
				// console.log(sqlStr);
				return this.search(sqlStr);

			}).then(data=>{
				LiveClient.writeRes(res,200,JSON.stringify({err:0}));
				this.close();
			}).catch(e=>{
				// console.log(e);
				LiveClient.writeRes(res,200,JSON.stringify(e));
				this.close();
			})


		}
		else{

			sqlStr = 'SELECT nameCh,price,nameEng FROM shop_data;';
			//查询商品
			let pro = this.search(sqlStr);
			pro.then(d=>{
			
				if(Array.isArray(d)){
					this.data.value = Array.from(d);
				}
				// console.log(d);
				
				sqlStr = 'SELECT * FROM user_info WHERE name = ' + this.Client.escape(name);
				return this.search(sqlStr);

			}).then(data=>{

				let o = Array.from(data)[0];
				
				for(let i =0;i<this.data.value.length;i++){
					let name = this.data.value[i].nameEng;
					if(o.hasOwnProperty(name)){
						this.data.value[i].have = 1;
					}
					delete this.data.value[i].nameEng;
				}

				LiveClient.writeRes(res,200,JSON.stringify(this.data));
				this.close();
			}).catch(err=>{
				console.log(err);
				this.close();
			})

		}
		

	}



}

module.exports = Shop;
