
let url = require('url');
let mysql = require('mysql');
let HttpParent = require('./HttpParent');

//登录注册
class Shop extends HttpParent{

	constructor(){
		super();
	}

	//查询商品
	query(req,res){
		
		
		super.query(req,res);

		let sqlStr = 'SELECT * FROM shop_data';

		let pro = this.search(sqlStr);
		pro.then(d=>{

			let obj = {value:[]};
			if(Array.isArray(d)){
				obj.value = Array.from(d);
			}

			res.end(JSON.stringify(obj));
		}).catch(err=>{
			console.log(err);
		})

	}

}

module.exports = Shop;
