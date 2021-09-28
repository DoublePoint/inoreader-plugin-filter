var ruleMap;
// 向页面注入JS
function injectCustomJs(jsPath)
{
	jsPath = jsPath || 'js/inject.js';
	var temp = document.createElement('script');
	temp.setAttribute('type', 'text/javascript');
	// 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
	temp.src = chrome.extension.getURL(jsPath);
	temp.onload = function()
	{
		// 放在页面不好看，执行完后移除掉
		this.parentNode.removeChild(this);
	};
	document.head.appendChild(temp);
}
var initVariable = {
	templateType:""
}
window.onload = function(){ 
	window.XPathJS.bindDomLevel3XPath();
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
	{
		// console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
		if(request.cmd == 'change') {
			ruleMap = JSONformat._jsonToMap(request.value);
			lastUnReadCount = "-1";
			initVariable.templateType = getActiveTemplate();
			maxTreeNode = 0;
			treeResult = null;
			currentIndex = 0;
			treeClick();
		};
	});
	injectCustomJs();
}
var lastUnReadCount = "-1";
var maxTreeNode = 0;
var treeResult=null;
var currentIndex =0;

function treeClick(){
	console.log("开始点击树节点")
	var allItemsXpathUrl = "//div[@id='tree']/div[contains(@id,'parent')]/div[contains(@id,'child')]//div[contains(@id,'linkdiv_')]";
	treeResult = document.evaluate(
		allItemsXpathUrl, // XPath expression
		document, // context node
		null, // namespace resolver
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
	);
	maxTreeNode = treeResult.snapshotLength;
	setStyle(0);
	treeNodeClick();
}
let scrollToBottom=()=>{
	return new Promise(function(resolve,reject){
		let interval = setInterval(function(){
			var t = $("#reader_pane").scrollTop();
			$('#reader_pane').scrollTop(t+10);
			let notHaveUnreadDom = document.getElementById("no_more_div");
			if(notHaveUnreadDom!=null){
				clearInterval(interval);
				resolve()
			}
		},30)
	})
}


function treeNodeClick(){
	console.log("点击树节点："+currentIndex+",总共节点："+maxTreeNode);
	if(currentIndex==maxTreeNode){
		console.log("currentIndex==maxTreeNode-1");
		handleEndFilter();
		return;
	}
	var node = treeResult.snapshotItem(currentIndex);
	node.click();
	console.log("点击树节点");
	console.log(node);
	sleep(5000).then(()=>{
		console.log("未读节点数"+getUnReadValue())
		if(getUnReadValue()=="0"){
			currentIndex = currentIndex+1;
			treeNodeClick()
		}
		else{
			Fkey(1).then(()=>{
				return sleep(5000);
			}).then(()=>{
				return scrollToBottom();
			}).then(function(){
				read();
				console.log("滚动完毕");
			})
		}
	})
	
	// sleep(5000).then(function(){
	// 	console.log("点击未读按钮");
	// 	unread_cnt_top.click();
	// 	return "1";
	// }).then(function(){
	// 	return sleep(5000)
	// }).then(()=>{
	// 	console.log("点击刷新按钮");
	// 	sb_rp_refresh.click();//刷更新按钮
	// 	return "2";
	// }).then(function(){
	// 	return sleep(5000);
	// }).then(()=>{
	// 	read()
	// })
}

let sleep=(milsecond)=>{
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve();
		},milsecond);
	})
}

//div[@id='reader_pane']/div[contains(@id,'article_')]//div[@class='article_short_contents']/self::text()
var readyItemXpathUrl = "//div[@id='reader_pane']/div[contains(@id,'article_')]//div[@class='article_title_wrapper']/a[contains(span,'1')]//ancestor::div[contains(@id,'article_')]/attribute::data-aid";

function read(){
	console.log("开始读取")
	var allItemsXpathUrl = "//div[@id='reader_pane']/div[contains(@id,'article_')]/attribute::data-aid";
	var baseItemXpath = "//div[@id='reader_pane']/div[contains(@id,'article_')]";
	var data_aidXpath = "attribute::data-aid";
	var titleXpath = "div[@class='article_header']//div[@class='article_title_wrapper']/a/span";
	var contentXpath = "div[@class='article_header']//div[@class='article_short_contents']";
	//var allItemsXpathUrl = readyItemXpathUrl;
	var itemResult = document.evaluate(
		baseItemXpath, // XPath expression
		document, // context node
		null, // namespace resolver
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
	);
	//console.log(itemResult)
	// loop through results
	var intReadValue = "";
	var arr = itemResult._value;
	for(var i=0;i<arr.length;i++){
		let dataid = (document.evaluate(data_aidXpath,arr[i],null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE)._value)[0].nodeValue;
		let title = (document.evaluate(titleXpath,arr[i],null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE)._value)[0].innerText;
		let content = (document.evaluate(contentXpath,arr[i],null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE)._value)[0].innerText;
		
		var readState = isReadThisItem(title,content);
		if(!readState){
			continue;
		}
		console.log("dataid:"+dataid)
		console.log("title:"+title)
		console.log("content:"+content)
		console.log("Read:"+readState)
		if(intReadValue==""){
			intReadValue = dataid;
		}
		else{
			intReadValue = intReadValue+","+dataid
		}
	}
	document.getElementById("iptRead").value = intReadValue;
	document.getElementById("btnRead").click();
	currentIndex = currentIndex+1;
	treeNodeClick()
}

function getUnReadValue(){
	var domArr = document.getElementsByClassName("inno_toolbar_switcher_button_shadow_label");
	return domArr[0].textContent.split(" ")[0];
}

function isReadThisItem(title,content){
	var arr = []
	var READ = true;
	var UNREAD = false;
	var isRead = false;
	
		ruleMap.forEach((value, key, map) => {
			//value和key就是map的key，value，map是map本身
			let rule = ruleMap.get(key);
			var filterList = rule.filterList;
			if(rule.enable){
				try{
					for(var i=0;i<filterList.length;i++){
						if(!isRead){
							var filter = filterList[i];
							if(filter.filterType===FILTER_TYPE_TITLE_VALUE){
								let filterContent = filter.filterValue;
								if(filterContent!=null&&filterContent!=""){
									if(filter.filterRelation==FILTER_RELATION_NOT_LIKE_VALUE){
										if(title.toLowerCase().indexOf(filterContent)!=-1){
											isRead = READ;
										}
									}
									else{
										if(title.toLowerCase().indexOf(filterContent)==-1){
											isRead = READ;
										}
									}
								}
							}
						}
				}
				}
				catch(e){
					console.error(e)
				}
			}
		});
	
	return isRead;

}
function getTitleLikeXpath(val){
	var title_base_xpath = "//div[@id='reader_pane']/div[contains(@id,'article_')]//div[@class='article_title_wrapper']/a[contains(span,'"+val+"')]//ancestor::div[contains(@id,'article_')]/attribute::data-aid";
	return title_base_xpath;
}
function getActiveTemplate(){
	var templateItemXpath = "//div[@id='sb_rp_tools']/div[@class='inno_toolbar_button_wrapper']/div[2]/div[contains(@class,'inno_toolbar_button_menu_item ')]";
	var resul = document.evaluate(
		templateItemXpath, // XPath expression
		document, // context node
		null, // namespace resolver
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
	);
	//console.log(itemResult)
	// loop through resul
	var arr = resul._value;
	var templateType = '';
	for(var i=0;i<arr.length;i++){
		let className = arr[i].className;
		if(className=='inno_toolbar_button_menu_item'){
			templateType = i;
			return templateType;
		}
	}
}
function Fkey(keyname){ 
	console.log("Press the key "+ keyname);
	return new Promise(function(resolve,reject){
		setStyle(0);
		resolve();
	})
} 

function handleEndFilter(){
	var viewTemplate = initVariable.templateType;
	setStyle(viewTemplate);
	var adXpath = "//div[@id='sinner_container']|//div[contains(@id,'leaderboard_ad')]|//div[contains(@class,'ad_title')]";
	var resul = document.evaluate(
		adXpath, // XPath expression
		document, // context node
		null, // namespace resolver
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
	);
	var arr = resul._value;
	var templateType = '';
	for(var i=0;i<arr.length;i++){
		console.log(arr[i]);
		arr[i].style.display='none';
	}
}

function setStyle(viewTemplate){
	document.getElementById("iptViewStyle").value = viewTemplate;
	document.getElementById("btnViewStyle").click();
}