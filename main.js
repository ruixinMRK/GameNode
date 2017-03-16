
var http = require('http');
var url = require('url');
var qs = require('querystring');
var Router = require('./network/http/Router');
var WebSocket = require('./network/socket/WebSocket');
var ManagerParser = require('./network/manager/ManagerParser');


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

			if(!Router.checkRouter(path)){

			           response.writeHead(404, {'Content-Type': 'text/plain;charset=utf-8'});
			           response.write("{'errcode':404,'errmsg':'404 页面不见啦'}");
			           response.end();

			}
			else{

				// response.setHeader('Access-Control-Allow-Origin','http://60.205.222.103');
				// http://www.mcrspace.com
				response.setHeader('Access-Control-Allow-Origin','http://localhost:4004');//设置了支持跨域发送cookie时,这里的值不能为*
				response.setHeader('Access-Control-Allow-Credentials','true');//支持跨域发送cookie
				!request.headers.cookie&&response.setHeader('Set-Cookie','raw2=test;Max-Age=100;HttpOnly');//httpOnly 表示客户端无法用js获取
				response.writeHeader(200,{'Content-Type':'text/plain;charset=utf-8'});

				

				if (request.method.toUpperCase() == 'POST') {
				            var postData = "";
				            /**
				             * 因为post方式的数据不太一样可能很庞大复杂，
				             * 所以要添加监听来获取传递的数据
				             * 也可写作 request.on("data",function(data){});
				             */
				            request.addListener("data", dat => {
				                postData += dat;
				            });
				            /**
				             * 这个是如果数据读取完毕就会执行的监听方法
				             */
				             let query = '';
				            request.addListener("end", () =>{
				                query = qs.parse(postData);
				                this.router.query(path,query,response);
				            });
				            
				}
			        else if (request.method.toUpperCase() == 'GET') {
			            /**
			             * 也可使用var query=qs.parse(url.parse(request.url).query);
			             * 区别就是url.parse的arguments[1]为true：
			             * ...也能达到‘querystring库’的解析效果，而且不使用querystring
			             */
			             // console.log(request.url);
			             let urlPath = request.url;
			            var params = url.parse(urlPath,true).query;

						// console.log(params);
						// this.reg = new Reg();
						// var pro = this.reg.insert(params);
						// response.write('---')
						// pro.then(data=>{
						// 	response.write(data);
						// 	this.close();
						// },err=>{
						// 	response.write(JSON.stringify({'data':'error'}));
						// 	this.close();
						//  })
						this.router.query(path,request,response);
			        } else {
			            //head put delete options etc.
			        }


		}
			

		})
		this.server.listen(8000,()=>{
    		console.log("srver listen on port 8000");
		});

	}
}

new Main();
