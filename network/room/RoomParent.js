
let LiveClient = require('../manager/LiveClient');

//房间
class RoomParent{

	constructor(name,fn){
		this.name = name;
		this.fn  = fn;
		this.id = 0;
		//道具数据
		this.propObj = {KPI:"planProp",value:[]};
		//位置数据
		this.disArr = [];
		
		this.aiId = 0;
	
		//记录英雄飞机和AI
		this.planeData = {KPI:'plane',heroPlane:{},ai:[]};

		//用于道具进行定位
		for(let i =0;i<Math.floor(RoomParent.W/100);i++){
			for(let j =0;j<Math.floor(RoomParent.H/100);j++){
				this.disArr.push({x:i*100,y:j*100});
			}
		}

		this.createProp();
		this.createAi();

		this.timer = setInterval(e=>{

			//重新刷新AI
			if(!this.planeData) return;
			this.createAi();
			//发送数据
			this.fn&&this.fn(this.planeData,this.name);

		},25);

	}

	//创建道具
	createProp(id = null){

		let L = id?id:15;

		
		if(!id){
			//在初始化时发送15个道具
			for(let i =0;i<L;i++){
				let rand = (this.disArr.length * Math.random())|0;

				let obj = {};
				obj.x = Math.floor(Math.random()*40) + this.disArr[rand].x;
				obj.y = Math.floor(Math.random()*40) + this.disArr[rand].y;
				obj.type = Math.floor(i/5);
				obj.id = this.id++;
				this.propObj.value[i] = obj;
			}	


		}
		else{

			let arr = this.propObj.value.filter(item=>{
				return item.id === id;
			});

			if(arr.length<1) return;
			let obj = arr[0];
			let index = this.propObj.value.indexOf(obj);

			let rand = (this.disArr.length * Math.random())|0;
			obj.x = Math.floor(Math.random()*100) + this.disArr[rand].x;
			obj.y = Math.floor(Math.random()*100) + this.disArr[rand].y;
			// totalObj.value = [obj];
			this.propObj.value[index] = obj;
			this.fn({KPI:'planProp',value:[obj]},this.name);
		}

		// console.log(this.propObj,'---');
		// this.fn(this.propObj,this.name);
	}

	//存储英雄数据
	handleHeroPlan(obj){
		if(typeof obj == 'object') this.planeData.heroPlan[obj.n] = obj;
	}

	// 检测对应AI 的血量
	checkAI(obj){
		
		for(let str in obj['AI']){
			
				for(let i=0;i<this.planeData.ai.length;i++){
					let o = this.planeData.ai[i];
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
	//创建AI
	createAi(){

		
		let L = this.planeData.ai.length;
		if(L==0){

			for(let i = 0;i<3;i++){
				this.ai('AI_'+this.aiId++);
			}
			
		}
		else{

			//刷新AI的位置
			for(let i =0;i<L;i++){
				
				let aiObj = this.planeData.ai[i];
				let minDis = 10000;
				let minStr = '';
				let minT = 0;
				let XD = 0;
				let YD = 0;
				for(let str in this.planeData.heroPlane){
					let planObj = this.planeData.heroPlane[str];
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
				
				if(aiObj.x <= 50) {aiObj.x = 50;aiObj.vx*=-0.5};
				if(aiObj.x >= RoomParent.W) {aiObj.x = RoomParent.W;aiObj.vx*=-0.5};
				if(aiObj.y <= 50) {aiObj.y = 50;aiObj.vy*=-0.5};
				if(aiObj.y >= RoomParent.H){aiObj.y = RoomParent.H;aiObj.vy*=-0.5};

				aiObj.hasOwnProperty('attack')&&(delete aiObj.attack);
				
				//攻击操作
				if(minDis<280){
					aiObj.r = (Math.atan2(YD - aiObj.y,XD - aiObj.x)*180/Math.PI)|0;
					if(Date.now()-minT>350&&minT!=0){
						aiObj.attack = 1;
						aiObj.t = Date.now();
					}					
				}
				else if(Date.now() - aiObj.t > 500){

					//AI移动操作
					if(Math.random()>0.92||(aiObj.vy==0&&aiObj.vx==0)){
						//拐弯操作
						aiObj.vx += +(1.6*(Math.random()-0.5).toFixed(2));
						aiObj.vy += +(1.6*(Math.random()-0.5).toFixed(2));
						let aimX = aiObj.x + aiObj.vx;
						let aimY = aiObj.y + aiObj.vy;
						aiObj.r = (Math.atan2(aimY - aiObj.y,aimX - aiObj.x)*180/Math.PI)|0;
					}
					
					aiObj.x += aiObj.vx;
					aiObj.y += aiObj.vy;
				}
				
			}
			
			// this.fn(this.aiObj,this.name);
		}

		// console.log(this.aiObj,'---this.aiObj');

	}

	//创建一个AI
	ai(id,i){

		let rand = (this.disArr.length * Math.random())|0;
		let x = Math.floor(Math.random()*40) + this.disArr[rand].x;
		let y = Math.floor(Math.random()*40) + this.disArr[rand].y;
		let o = {id:id,x:x,y:y,vx:0,vy:0,t:Date.now(),r:0,hp:100};
		i?this.planeData.ai[i] = o:this.planeData.ai.push(o);

	}

	get aiO(){
		return this.planeData.ai;
	}

	get prop(){
		return this.propObj.value;
	}

	clear(){

		clearInterval(this.timer);
		this.fn = null;
		this.propObj.value.length = this.disArr.length = this.planeData.ai.length = 0;
		this.propObj = null;
		this.planeData.planHero = null;
		this.planeData = null;
		
	}


}

//地图的宽和高
RoomParent.W = 1800;
RoomParent.H = 1800;
module.exports = RoomParent;