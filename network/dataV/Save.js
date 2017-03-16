
let url = require('url');
let query = require('querystring');
let path = require('path')
let fs = require('fs');

//公司
class Save{

	constructor(){
		
	}

	query(obj,res){
		
		
		if(!obj.id){
			res.end();
			return;
		}
		
		let url = `./upload/${obj.id}.txt`;


		if(obj.str){
			fs.writeFile(url,obj.str, 'utf-8', (err) =>{
		        if (err){
		        	res.end(JSON.stringify({'err':'1'}));
		        	return;
		        }
		        res.end(JSON.stringify({'err':'0'}));
	    	});
		}
		else{
			fs.readFile(url, 'utf-8',  (err,data)=>{
		        if (err){
		        	res.end(JSON.stringify({'err':'1'}));
		        	return;
		        }
		        res.end(data.toString());
		    });
		}


		

	}

	
}

module.exports = Save;
