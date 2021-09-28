
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

window.onload = function(){ 
	window.XPathJS.bindDomLevel3XPath();
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
	{
		// console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
		if(request.cmd == 'change') {
			treeClick();
		};
	});
	injectCustomJs();
}
var lastUnReadCount = "-1";
var maxTreeNode = 0;
var treeResult=null;

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
	treeNodeClick()
	
}
var currentIndex =0;
function treeNodeClick(){
	console.log("点击树节点："+currentIndex+",总共节点："+maxTreeNode);
	if(currentIndex==maxTreeNode){
		console.log("currentIndex==maxTreeNode-1");
		return;
	}
	var node = treeResult.snapshotItem(currentIndex);
	node.click();
	console.log("Node click");
	console.log(node);
	setTimeout(function(){
		console.log("点击未读按钮");
		unread_cnt_top.click();
		setTimeout(function(){
			console.log("点击刷新按钮");
			sb_rp_refresh.click();//刷更新按钮
			setTimeout(function(){
				read()
			},5000)
		},5000)
	},5000)
}

function read(){
	console.log("开始读取")
	var allItemsXpathUrl = "//div[@id='reader_pane']/div[contains(@id,'article_')]/attribute::data-aid";
	var itemResult = document.evaluate(
		allItemsXpathUrl, // XPath expression
		document, // context node
		null, // namespace resolver
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
	);
	//console.log(itemResult)
	// loop through results
	var intReadValue = "";
	var arr = itemResult._value;
	for(var i=0;i<arr.length;i++){
		if(i==0){
			intReadValue = arr[0].nodeValue
		}
		else{
			intReadValue = intReadValue+","+arr[i].nodeValue
		}
	}
	lastUnReadCount=getUnReadValue();
	document.getElementById("iptRead").value = intReadValue;
	document.getElementById("btnRead").click();
	console.log("已经读取完毕");
	setTimeout(function(){
		console.log("延时3秒查看结果");
		console.log("上次未读取数量:"+lastUnReadCount);
		console.log("读取之后数量:"+getUnReadValue());
		setTimeout(function(){
			if(lastUnReadCount!=0&&lastUnReadCount!=getUnReadValue()&&0!=getUnReadValue()){
				sb_rp_refresh.click();//刷更新按钮
				console.log("5秒后再次读取");
				setTimeout(function(){
					console.log("开始再次读取");
					read()
				},5000)
			}
			else{
				currentIndex = currentIndex+1;
				treeNodeClick()
			}
		},5000)
	},3000)
}

function getUnReadValue(){
	var domArr = document.getElementsByClassName("inno_toolbar_switcher_button_shadow_label");
	return domArr[0].textContent.split(" ")[0];
}