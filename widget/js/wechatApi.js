
// 默认配置属性定义
var config = {
	nonceStr : null,
	timestamp : null,
	signature : null,
	wxAppId : 'wx489c60cb27c364c0'
	},
	code = "",
	Request = new UrlSearch();

$(function () {  
    	
	// 签名校验方法
	var signPromise = this.sign(location.href);
		// sign方法完成后执行
		signPromise.done(function() {
			wx.config({
				debug : false,//是否开启微信api调试模式
				appId : config.wxAppId,
				timestamp : config.timestamp,
				nonceStr : config.nonceStr,
				signature : config.signature,
				jsApiList : ['onMenuShareTimeline', 'onMenuShareAppMessage']
			});
		}).fail(function(res) {
			// Utils.logCallback('_init()', false)(JSON.stringify(res));
		});
    
    // 获取code参数
    code = Request.code;
     
    if (code == null)  
    {     
        var fromurl = location.href;  
        var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.wxAppId + '&redirect_uri='+encodeURIComponent(fromurl)+'&response_type=code&scope=snsapi_base&state='+ Math.random() +'#wechat_redirect';  
        location.href = url;  
    }  
    else  
    {     
    	sessionStorage.setItem('code',code);                   
        $.ajax({  
            type:'get',  
            // url:ApiUrl+'/weixin/user/get.json',   
            url:'http://youplus.yg-link.com/zhzgh-svr/weixin/user/get.json',   
            async:false,  
            cache:false,  
            data:{code:code},  
            dataType:'json',  
            success:function(result){
            	// console.log(result.body.openId);
            	sessionStorage.setItem('wxopenid',result.body.openId);
            	// 获取到openId之后才执行的方法
            	loadData();
                },  
            error:function(result){
            	console.log("error",result);
            	}      
            });
    }  


});  

// 签名校验方法
function sign(url){
	var ticketDtd = $.Deferred();
	// 获取临时票据后执行
	this.getTicket().done(function(jsapiTicket) {
		// 设置加密字符串1
		if (!config.nonceStr) {
			config.nonceStr = Math.random().toString(36).substr(2, 15);
			;
		}
		;
		// 设置加密字符串2
		if (!config.timestamp) {
			config.timestamp = parseInt(new Date().getTime() / 1000) + '';
		}
		;
		// 封装所需属性
		var ret = {
			jsapi_ticket : jsapiTicket.body,
			nonceStr : config.nonceStr,
			timestamp : config.timestamp,
			url : url
		};
		// 转换属性对象
		var result = raw(ret);
		// 加密转换结果
		ret.signature = Sha1.hash(result);
		ret.appId = config.wxAppId;
		// 提交加密结果
		config.signature = ret.signature;
		delete ret.jsapi_ticket;
		delete ret.url;
		ticketDtd.resolve(ret);
	}).fail(function(data) {
		ticketDtd.reject(data);
	});
	return ticketDtd.promise();
}

// 从后台获取临时票据
function getTicket(){

	if (this.jsapiTicket) {
		var dtd = $.Deferred();
		dtd.resolve(this.jsapiTicket);
		return dtd.promise();
	};

	return $.ajax({
		method : "GET",
		url : "http://youplus.yg-link.com/zhzgh-svr/weixin/jsticket/get.json",
		cache : false,
		data : {
			action : "getTicket"
		}
	});

}

// json格式转化为字符串
function raw(args){
	var keys = Object.keys(args);
	keys = keys.sort();
	var newArgs = {};
	keys.forEach(function(key) {
		newArgs[key.toLowerCase()] = args[key];
	});
	var result = '';
	for ( var k in newArgs) {
		if (newArgs.hasOwnProperty(k)) {
			result += '&' + k + '=' + newArgs[k];
		}
	}
	result = result.substr(1);
	return result;
}

// 获取地址栏参数
function UrlSearch(){
	var name,value; 
	var str=location.href; //取得整个地址栏
	var num=str.indexOf("?") 
	str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]

	arr=str.split("&"); //各个参数放到数组里
	for(var i=0;i < arr.length;i++){ 
		num=arr[i].indexOf("="); 
		if(num>0){ 
		 name=arr[i].substring(0,num);
		 value=arr[i].substr(num+1);
		 this[name]=value;
		 } 
	} 
}