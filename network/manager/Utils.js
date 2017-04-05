let qs = require('querystring');
let crypto = require('crypto');
let fs = require('fs');

//工具方法
class Utils{
	constructor(){
	}

	//解析rang头 断点续传
	static parseRange(str,size){

		if (str.indexOf(",") != -1) {
        	return;
	    }
	    str = str.replace(/bytes=/ig,'');
	    var range = str.split("-"),
	        start = parseInt(range[0], 10),
	        end = parseInt(range[1], 10);
	    // Case: -100
	    if (isNaN(start)) {
	        start = size - end;
	        end = size - 1;
	        // Case: 100-
	    } else if (isNaN(end)) {
	        end = size - 1;
	    }
	    // rang头错误处理
	    // console.log(start,end,start>end,end>start);
	    if (isNaN(start) || isNaN(end) || start > end || end > size) {
	        return;
	    }
	    return {start,end};

	}

	//判断项目是否存在
	static existFile(url){
		return new Promise((res,rej)=>{
			fs.exists(url, (exists) => {
				if(!exists) rej();
				else res();
			})
		})
	}

	//读取文件
	static readF(path,type){

		return new Promise((res,rej)=>{
			fs.readFile(path, type, (err, file) => {
				if(err) rej();
				else res(file);
			})
		})
	}

}

module.exports = Utils;