//处理上传文件的
var formidable = require('formidable');

class UploadFile{

	constructor(){
	}

	query(req,res){
		
		this.req = req;
		this.res = res;

		var f = new formidable.IncomingForm();
		f.encoding = 'utf-8'; //设置编辑
		f.uploadDir = './upload/'; //设置上传目录
		f.keepExtensions = true; //保留后缀
		f.maxFieldsSize = 2 * 1024 * 1024; //文件大小
		// f.multiples = true;//处理多文件
		
		//该方法会转换请求中所包含的表单数据，callback会包含所有字段域和文件信息
		f.parse(this.req,(err, fields, files)=>{


			if(err){
				var u={"error" :1,"message":'请上传2M以图片'};
				this.res.end(JSON.stringify(u));
				console.log(err);
				return false;
			}

			//获取路径 file 为FormData 的append的key
			//上传多个文件时必须多次append
			// console.log(files);

			//处理多文件时
			// for(var k in files){
			// 	console.log(files[k],'--');
			// }
			
			var oldpath=files.iconImg.path;
			var reg  = /\.\w+$/.exec(oldpath);

			
			let suffix = reg[0];

			//不符合规定格式
			// var u={"error" :1,"message":'请上传正确格式'};
			// res.end(JSON.stringify(u));
			// return false;

			var url='./upload/'+Date.now()+suffix;
			var fs=require('fs');
			//给图片修改名称
			fs.renameSync(oldpath,url);
			var u={ "error" : 0, "url" : url}
			this.res.end(JSON.stringify(u)); 
		})

	}
}

module.exports = UploadFile;