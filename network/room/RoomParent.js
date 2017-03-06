
let LiveClient = require('../manager/LiveClient');

//房间
class RoomParent{

	constructor(name,fn){
		this.name = name;
		this.fn  = fn;
		this.id = 0;
		//道具数据
		this.propArr = [];
		//位置数据
		this.disArr = [];
		//电脑ai数据
		this.aiObj = {KPI:'AI',value:[]};
		this.aiId = 0;
		//记录英雄数据
		this.heroPlan = {};

		//用于道具进行定位
		for(let i =0;i<Math.floor(RoomParent.W/100);i++){
			for(let j =0;j<Math.floor(RoomParent.H/100);j++){
				this.disArr.push({x:i*100,y:j*100});
			}
		}

		this.createProp();
		this.createAi(this.name);

	}

	//创建道具
	createProp(id = null){

		let L = id?id:15;

		let totalObj = {};
		totalObj.KPI = 'planProp';

		if(!id){
			//在初始化时发送15个道具
			for(let i =0;i<L;i++){
				let rand = (this.disArr.length * Math.random())|0;

				let obj = {};
				obj.x = Math.floor(Math.random()*40) + this.disArr[rand].x;
				obj.y = Math.floor(Math.random()*40) + this.disArr[rand].y;
				obj.type = Math.floor(i/5);
				obj.id = this.id++;
				this.propArr[i] = obj;
			}	
			totalObj.value = this.propArr;

		}
		else{

			let arr = this.propArr.filter(item=>{
				return item.id === id;
			});

			if(arr.length<1) return;
			let obj = arr[0];
			let rand = (this.disArr.length * Math.random())|0;
			obj.x = Math.floor(Math.random()*100) + this.disArr[rand].x;
			obj.y = Math.floor(Math.random()*100) + this.disArr[rand].y;
			totalObj.value = [obj];
		}

		this.fn(totalObj,this.name);
	}

	//创建AI
	createAi(obj){

		//初次创建时,生成三个AI
		if((typeof obj == 'object'&&obj.room!=this.name)||(typeof obj == 'string'&&obj!=this.name)) return;
		if(typeof obj == 'object') this.heroPlan[obj.n] = obj;

		//obj['AI'] 检测对应AI 的血量
		if(typeof obj == 'object'&&obj['AI']){
			for(let str in obj['AI']){
				
					for(let i=0;i<this.aiObj.value.length;i++){
						let o = this.aiObj.value[i];
						if(o.id === str) {
							o.hp = obj['AI'][str];
							if(obj['AI'][str]<=1) {
								let id = o.id;
								this.ai(id,i);
							}
							break;
						}
							
					}
			}
		}

		let L = this.aiObj.value.length;
		if(L==0){

			for(let i = 0;i<3;i++){
				this.ai('AI_'+this.aiId++);
			}
			
		}
		else{

			// console.log('刷新中...',L,this.heroPlan);
			//刷新AI的位置
			for(let i =0;i<L;i++){
				
				let aiObj = this.aiObj.value[i];
				let minDis = 10000;
				let minStr = '';
				let minT = 0;
				let XD = 0;
				let YD = 0;
				for(let str in this.heroPlan){
					let planObj = this.heroPlan[str];
					let X = Math.abs(aiObj.x - planObj.x);
					let Y = Math.abs(aiObj.y - planObj.y);
					let t = aiObj.t;
					let dis = Math.sqrt(X * X + Y*Y);
					//如果多个飞机都在ai的打击范围内,选择最小的那个
					
					if(minDis>dis){
						minDis = dis;
						minStr = str;
						minT = t;
						XD = planObj.x;
						YD = planObj.y;
					}
					
				}
				aiObj.vx += +(0.2*(Math.random()-0.5).toFixed(2));
				aiObj.vy += +(0.2*(Math.random()-0.5).toFixed(2));

				//目标x，y
				let aimX = aiObj.x + aiObj.vx;
				let aimY = aiObj.y + aiObj.vy;
				aiObj.r = (Math.atan2(aimY - aiObj.y,aimX - aiObj.x)*180/Math.PI)|0;

				aiObj.x += aiObj.vx;
				aiObj.y += aiObj.vy;

				if(aiObj.x <= 50) {aiObj.x = 50;aiObj.vx*=-0.5};
				if(aiObj.x >= RoomParent.W) {aiObj.x = RoomParent.W;aiObj.vx*=-0.5};
				if(aiObj.y <= 50) {aiObj.y = 50;aiObj.vy*=-0.5};
				if(aiObj.y >= RoomParent.H){aiObj.y = RoomParent.H;aiObj.vy*=-0.5};

				aiObj.hasOwnProperty('attack')&&(delete aiObj.attack);
				//距离小于600
				if(minDis<300&&Date.now()-minT>600){
					aiObj.attack = 1;
					aiObj.t = Date.now();
					aiObj.r = (Math.atan2(aimY - YD,aimX - XD)*180/Math.PI)|0;
				}
				
			}
			

		}

		this.fn(this.aiObj,this.name);

	}

	//创建一个AI
	ai(id,i){

		let rand = (this.disArr.length * Math.random())|0;
		let x = Math.floor(Math.random()*40) + this.disArr[rand].x;
		let y = Math.floor(Math.random()*40) + this.disArr[rand].y;
		let o = {id:id,x:x,y:y,vx:0,vy:0,t:Date.now(),r:0,hp:100};
		i?this.aiObj.value[i] = o:this.aiObj.value.push(o);

	}

	clear(){
		
		this.fn = null;
		this.propArr.length = this.disArr.length = this.aiObj.value.length = 0;
		this.aiObj = null;
		this.heroPlan = null;
	}

}

//地图的宽和高
RoomParent.W = 1800;
RoomParent.H = 1800;
module.exports = RoomParent;