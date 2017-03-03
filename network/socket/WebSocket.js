
let net = require('nodejs-websocket');

let TcpRouter = require('./TcpRouter');
let LiveClient = require('../manager/LiveClient');

class WebSocket{
	constructor(){
		this.server = net.createServer();
		this.server.listen(8080);
		
		//下列为server事件
		this.server.on('connection',this.connect.bind(this));
		this.server.on('listening',this.listening.bind(this));
		// this.server.on('data',this.parseData.bind(this));
		this.server.on('close',this.close);
		this.server.on('error',this.error);
		
		this.len = 0;
    	this.respone = "";
	}

	static get instance(){
		if(!WebSocket.__instance){
			WebSocket.__instance  = new WebSocket();
		}
		return WebSocket.__instance;
	}

	connect(socket){

		// console.log(socket.socket.remotePort,socket.socket.remoteAddress);
		
		// if(socket.headers.origin != 'http://www.mcrspace.com'){
		// 	socket.socket.end();
		// 	return;
		// }

		socket.on('text',data=>{
			// console.log('ok');
			if(socket.readyState !== socket.OPEN) return;
			this.respone += data;
			// console.log(this.respone);
			    //判断下bytes的长度，类型等

			    if( this.respone.length>8&&this.respone.match(/^start(.+)end$/g)){
			     	     
			     	     let str = RegExp.$1;	
			     	     // console.log('---1',str);
				      try{

				      	let obj = JSON.parse(str);
				      	this.sendAll(obj,socket);
				      	this.respone = '';
				      }
				      catch(e){
				      	// this.send(e);
				      	this.respone = '';
				      	// console.log('---2',e);
				      }
			    }
			
		});

		socket.on("close",e=>{
			// console.log('gameOver');
			this.sendAll({KPI:'gameOver'},socket);
		});
		socket.on("error",e=>{
			this.sendAll({KPI:'gameOver'},socket);
			// console.log('socketClient is err',e)
		});
		
	}

	//分发数据去不同的地方解析
	sendAll(data,socket){

		let dataArr = TcpRouter.instance.subscr(data,socket);
		for(let i =0;i<dataArr.length;i++){
			dataArr[i]&&this.send(dataArr[i]);
		}
	}

	//数据和允许列表
	send(data,aList=null){

		// let L = this.server.connections.length;
		// console.log('send',data);
		let allowList = aList||LiveClient.allowList;
		let isA = Array.isArray(allowList);

		if(isA){
			for(let i=0,L=allowList.length;i<L;i++){
				let con =allowList[i];
				if(!con||con.readyState !== con.OPEN) continue;

				try{
					// console.log(data,'--1');
					con.sendText('start'+JSON.stringify(data) + 'end');
				}
				catch(e){
					this.sendAll({KPI:'gameOver'},con);
					console.log('客户端不存在',e);
				}

			}
		}
		else{
				if(!allowList||allowList.readyState !== allowList.OPEN) return;
				try{
					// console.log(data,'--2');
					allowList.sendText('start'+JSON.stringify(data) + 'end');
				}
				catch(e){
					this.sendAll({KPI:'gameOver'},allowList);
					console.log('客户端不存在1',e);
				}

		}

		LiveClient.allowList = null;
		// for(let str in LiveClient.data){
		// 	let con =LiveClient.data[str];
		// 	//客户端本身的数据如需返回，需加上backData == '1'属性,其他客户端收不到
		// 	if(con.readyState !== con.OPEN||!con||con=='1'||(!data.backData&&con===forbidList)) continue;
		// 	if(data.backData == '1'&&con!==forbidList) continue;
		// 	try{
		// 		con.sendText('start'+JSON.stringify(data) + 'end');
		// 	}
		// 	catch(e){
		// 		this.sendAll({KPI:'gameOver'},con);
		// 		console.log('客户端不存在',e);
		// 	}
		// }
			
	}

	listening(){
		console.log('websocket服务器开始监听:8080');
	}
	close(){
		console.log('服务器关闭');
	}
	error(e){
		console.log(e,'服务器错误');
	}
}
WebSocket.__instance = null;
module.exports = WebSocket;
