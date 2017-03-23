
var http = require('http');
var url = require('url');
var qs = require('querystring');
var Router = require('./network/http/Router');
var WebSocket = require('./network/socket/WebSocket');
var ManagerParser = require('./network/manager/ManagerParser');
var crypto = require('crypto');
var LiveClient = require('./network/manager/LiveClient');


//主类，分析各种请求状态
class Main{
	
	constructor(){
		this.init();
		this.response = null;
		this.request = null;
		this.router = new Router();
		this.webSocket =  WebSocket.instance;
		let manager = new ManagerParser();
	}
	
	init(){

		this.server = http.createServer((request,response)=>{

			this.response = response;
			this.request = request;

			// console.log(url.parse(request.url).pathname,'--pathname');
			// console.log(request.headers.referer);
			if(request.url.indexOf('favicon.ico')>0) return;
			let path = url.parse(request.url).pathname;

			let params = qs.parse(url.parse(request.url).query);

			
			if(!Router.checkRouter(path)){
			    LiveClient.writeRes(response,404,"{'errcode':404,'errmsg':'404 木有对应的资源'}");
			    return;
			}
			else{

				// response.setHeader('Access-Control-Allow-Origin','http://60.205.222.103');
				// http://www.mcrspace.com
				response.setHeader('Access-Control-Allow-Origin','http://localhost:4004');//设置了支持跨域发送cookie时,这里的值不能为*
				response.setHeader('Access-Control-Allow-Credentials','true');//支持跨域发送cookie

				let params = qs.parse(url.parse(request.url).query);
				if(path==='/user'&&!request.headers.cookie){
					//登陆和注册
				}
				else{

					// console.log(request.url,request.headers.cookie,'---cookie');
					if(!request.headers.cookie){
						LiveClient.writeRes(response,401,"{'errcode':401,'errmsg':'非法!!'}");
			           	return;
					}
					else{

						let name = LiveClient.SerachUqid(request);
						//验证失败
						if(!name){
							LiveClient.writeRes(response,401,"{'errcode':401,'errmsg':'非法!!'}");
				           	return;
						}
					}
					
				}

				// response.writeHeader(200,{'Content-Type':'text/plain;charset=utf-8'});


				if (request.method.toUpperCase() == 'POST') {
		            var postData = "";
		            request.addListener("data", dat => {
		                postData += dat;
		            });
		            request.addListener("end", () =>{
		                let query = qs.parse(postData);
		                this.router.query(path,request,response,query);
		            });            
				}
		        else if (request.method.toUpperCase() == 'GET') {
					this.router.query(path,request,response,params);
		        } else {
		            //head put delete options etc.
		        }


		}
			

		})
		this.server.listen(8000,()=>{
    		console.log("server listen on port 8000");
		});

	}


}

new Main();
