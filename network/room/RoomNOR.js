
let LiveClient = require('../manager/LiveClient');
let RoomParent = require('./RoomParent');
let QuerySQL = require('../manager/QuerySQL');

//房间20人混战
class RoomNOR extends  RoomParent{

	constructor(name,fn,desFn){

		super(name,fn);
		this.milExp = [];//战绩存储
		this.name= name;
		this.desFn = desFn;
		this.totalTime = 120;
		this.timer = setInterval(e=>{

			let callObj = {KPI:'NorTime',room:this.name,time:this.totalTime};
			this.totalTime<=0?(callObj.value = this.calGrades()):'';
			this.fn(callObj,this.name);
			if(this.totalTime<=0){
				desFn(name);//销毁房间吧
				clearInterval(this.timer);
			}
			this.totalTime--;
		},1000);

	}

	//计算分数
	calGrades(){

		this.milExp.forEach(item=>{
			item.score = item.exp = item.money = (item.kill + item.holdAtt/2 - item.die) * 2;
			// item.exp = (item.kill + item.holdAtt/2 - item.die) * 2;
			// item.money = (item.kill + item.holdAtt/2 - item.die) * 2;

			let obj = {money:item.money,exp:item.exp,name:item.name,mode:'nor'};
			this.insertData(obj);
		})
		this.milExp.sort((a,b)=>b.score - a.score);
		
		// console.log(this.milExp,'----计算数据');
		return this.milExp;
	}

	createMil(client){
		let n = LiveClient.SearchName(client);
		if(n&&!this.milExp.find(item=>item.name == n)){
			let obj = {name:n,kill:0,die:0,holdAtt:0,score:0,exp:0,money:0};
			this.milExp.push(obj);
		}
		// n&&!this.milExp.milExp[n]&&this.milExp[n] = {kill:0,die:0,holdAtt:0,score:0};
	}

	die(obj){
		let n = obj.name;
		//计算助攻，击杀和死亡数
		let temp = this.milExp.find(item=>item.name == n);
		// console.log(obj);
		if(temp&&obj.attacker){
			
			temp.die +=1;
			let killer = obj.attacker[0];
			let holdAtter = obj.attacker.slice(1);
			this.milExp.forEach(item=>{item.name == killer?item.kill+=1:''});
			// this.milExp.find(item=>item.name == killer)&&this.milExp.killer.kill += 1;
			holdAtter.forEach(item=>{
				this.milExp.forEach(item=>{item.name == killer?item.holdAtt+=1:''});
			});

		}
	}

	get l(){
		return LiveClient.norRoomData[this.name].length;
	}

	clear(){
		super.clear();
		clearInterval(this.timer);
		this.desFn = null;
		
		for(let str in this.milExp){
			this.milExp[str] = null;
			delete this.milExp[str];
		}
		this.milExp = null;
	}

}

module.exports = RoomNOR;