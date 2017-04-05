
let LiveClient = require('../manager/LiveClient');
let manager = require('../manager/Manager');

let http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");
let zlib = require("zlib");
let crypto = require("crypto");

//简单的静态资源处理器(后期可以不断优化,需要增加gzip和rang断点续传功能)
class StaticResServer{

	constructor(){
	}

	query(req,res){
		

		this.req = req;
		this.res = res;
		
		let pathName = url.parse(req.url).pathname;//获取请求路径
		pathName = pathName == '/'?'/index.html':pathName;

		//html文件和其他文件单独处理 html用utf8  其他文件用binary
		let realPath = path.join(manager.assetsPath,path.normalize(pathName.replace(/\.\./g, "")));//真是资源路径
		let encode = pathName=='/index.html'?'utf8':'binary';
		// console.log(manager.assetsPath,realPath);
		this.existFile(realPath).then(e=>{
				return this.readF(realPath,encode);
			}	
		).then(data=>{
				let extName = path.extname(realPath);//后缀名
				extName = extName ? extName.slice(1) : "";
				//匹配资源对应的类型
				let contentType = StaticResServer.type[extName] || "text/plain";

				// console.log(realPath,contentType);
				
				//定义资源缓存时间,防止服务器压力增加
				let expiresObj = {
				    fileMatch: /^(gif|png|jpg|js|css|wav|mp3)$/ig,
				    maxAge: 60 * 60 * 4
				};

				// Expires / Cache-Control: max-age=xxxx：设置文件的最大缓存时间
				//Last-Modified 服务器返回  If-Modified-Since请求
				// Last-Modified / If-Modified-Since：把浏览器端文件缓存的最后修改时间一起发到服务器去，服务器会把这个时间与服务器上实际文件的最后修改时间进行比较。如果没有修改，则返回304状态码。
				// ETag头：用来判断文件是否已经被修改，区分不同语言和Session等等。

				//设置缓存时间
				if (extName.match(expiresObj.fileMatch)) {
				    let expires = new Date();
				    expires.setTime(expires.getTime() + expiresObj.maxAge * 1000);
				    res.setHeader("Expires", expires.toUTCString());
				    res.setHeader("Cache-Control", "max-age=" + expiresObj.maxAge);
				}
				
				//获取文件被修改的时间
				let stat = fs.statSync(realPath);
		        let lastModified = stat.mtime.toUTCString();
		        res.setHeader("Last-Modified", lastModified);
		       	
		       	
		  		//浏览器在接受到服务器发过来的 Etag 后，会保存下来，下次请求的时候会将它放在请求头中，其 key 值为 If-None-Match。
				//服务器拿到 If-None-Match 之后，对比之前的 Etag，如果没变，则返回 304 Not Modified.
				let hashStr = lastModified + '';
				let hash = crypto.createHash('sha1').update(hashStr).digest('base64');
				if(req.headers['if-none-match'] == hash){
				    LiveClient.writeRes(res,304,"Not Modified","Not Modified");
				    return;
				} else {
				    res.setHeader("Etag", hash);
				}

		        //把传来的最后文件最后修改时间和真实的修改时间对比
		        if (req.headers["if-modified-since"] && lastModified == req.headers["if-modified-since"]) {
		            LiveClient.writeRes(res,304,"Not Modified","Not Modified");
		            return;
		        }
				
				//匹配需要压缩的资源
				let compress = /css|js|html/ig;
				
		        //对文本文件进行gzip压缩，可以将文件压缩得很小，大大减少网络流量。
				// 为了满足zlib模块的调用模式，将读取文件改为流的形式。
				// 对于支持压缩的文件格式以及浏览器端接受gzip或deflate压缩，则调用相对应的压缩方式。
				// 对于不支持的，则以管道方式转发给response
		        // let raw = fs.createReadStream(realPath);
		        // let acceptEncoding = request.headers['accept-encoding'] || '';
		        // if (acceptEncoding.match(/\bdeflate\b/)) {
		        //   res.writeHead(200, { 'Content-Encoding': 'deflate' });
		        //   raw.pipe(zlib.createDeflate()).pipe(res);
		        // } else if (acceptEncoding.match(/\bgzip\b/)) {
		        //   res.writeHead(200, { 'Content-Encoding': 'gzip' });
		        //   raw.pipe(zlib.createGzip()).pipe(res);
		        // } else {
		        //   res.writeHead(200, {});
		        //   raw.pipe(res);
		        // }

		        LiveClient.writeRes(res,200,data,{'Content-Type':contentType},encode);

			}
		).catch((obj)=>{
			LiveClient.writeRes(res,obj.status,obj.mess);
		});

	}

	//判断项目是否存在
	existFile(url){
		return new Promise((res,rej)=>{
			fs.exists(url, (exists) => {
				if(!exists) rej({status:404,mess:'文件不存在!'});
				else res();
			})
		})
	}

	//读取文件
	readF(path,type){

		return new Promise((res,rej)=>{
			fs.readFile(path, type, (err, file) => {
				if(err) rej({status:500,mess:'读取文件错误!'});
				else res(file);
			})
		})
	}	

}

StaticResServer.type = {
    "txt": "text/plain",
    "xml": "text/xml",
    "html": "text/html",
    "css": "text/css",
    "js": "text/javascript",
    "json": "application/json",
    "gif": "image/gif",
    "png": "image/png",
    "ico": "image/png",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",
    "pdf": "application/pdf",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "wav": "audio/x-wav",
    "mp3":'audio/mp3',
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv"
};


module.exports = StaticResServer;
