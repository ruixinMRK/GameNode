let qs = require('querystring');
let crypto = require('crypto');

//工具方法
class Utils{
	constructor(){
	}

	//解析rang头 断点续传
	static parseRange(str,size){

		if (str.indexOf(",") != -1) {
        	return;
	    }
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
	    if (isNaN(start) || isNaN(end) || start > end || end > size) {
	        return;
	    }
	    return {start,end};

	}

}

module.exports = Utils;