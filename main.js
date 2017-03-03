
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
				response.setHeader('Access-Control-Allow-Origin','*');
				response.writeHeader(200,{'Content-Type':'text/plain;charset=utf-8'});

				this.router.query(path,request,response);

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
				            request.addListener("end", () =>{
				                var query = qs.parse(postData);
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
