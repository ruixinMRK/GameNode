
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

		let L = this.aiObj.value.length;
		console.log(L);
		if(L==0){

			for(let i = 0;i<3-L;i++){
				let rand = (this.disArr.length * Math.random())|0;
				let x = Math.floor(Math.random()*40) + this.disArr[rand].x;
				let y = Math.floor(Math.random()*40) + this.disArr[rand].y;
				let o = {id:this.aiId++,x:x,y:y,vx:0,vy:0,t:Date.now(),r:0,hp:100};
				this.aiObj.value.push(o);
			}
			
		}
		else{

			// console.log('刷新中...',L,this.heroPlan);
			for(let i =0;i<L;i++){
				
				let aiObj = this.aiObj.value[i];
				let minDis = 0;
				let minStr = '';
				let minT = 0;
				let minX = 0;
				let minY = 0;
				// console.log('刷新AI1');
				for(let str in this.heroPlan){
					let planObj = this.heroPlan[str];
					let X = Math.abs(aiObj.x - planObj.x);
					let Y = Math.abs(aiObj.y - planObj.y);
					let t = aiObj.t;
					// console.log(aiObj.x,planObj.x,aiObj.y,planObj.y);
					let dis = Math.sqrt(X * X + Y*Y);
					//如果多个飞机都在ai的打击范围内,选择最小的那个
					if(i==0) minDis = dis;
					if(minDis>dis){
						minDis = dis;
						minStr = str;
						minT = t;
						minX = planObj.x;
						minY = planObj.y;
					}
					
				}
				aiObj.vx += +(0.5*(Math.random()-0.5).toFixed(2));
				aiObj.vy += +(0.5*(Math.random()-0.5).toFixed(2));

				//目标x，y
				let aimX = aiObj.x + aiObj.vx;
				let aimY = aiObj.y + aiObj.vy;
				aiObj.r = Math.atan2(minY - aimY,minX - aimX)|0;
				aiObj.x += aiObj.vx;
				aiObj.y += aiObj.vy;

				if(aiObj.x <= 50) aiObj.x = 50;
				if(aiObj.x >= RoomParent.W) aiObj.x = RoomParent.W;
				if(aiObj.y <= 50) aiObj.y = 50;
				if(aiObj.x >= RoomParent.H) aiObj.y = RoomParent.H;

				aiObj.hasOwnProperty('attack')&&(delete aiObj.attack);
				//距离小于100
				if(minDis<100&&Date.now()-minT>300){
					// aiObj.aim = minStr;
					aiObj.attack = 1;
				}
				console.log('刷新AI2');
			}
			

		}

		this.fn(this.aiObj,this.name);

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