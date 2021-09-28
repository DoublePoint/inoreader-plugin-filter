var i=0;
function addReadBtn(){
    var btn1 = document.createElement("input");
    btn1.type="button";
    btn1.id ="btnRead"
    var inputValue1 = document.createElement("textarea");
    inputValue1.id="iptRead";

    var btn2 = document.createElement("input");
    btn2.type="button";
    btn2.id ="btnViewStyle"
    var inputValue2 = document.createElement("textarea");
    inputValue2.id="iptViewStyle";

    var div = document.createElement("div");
    div.appendChild(btn1);
    div.appendChild(inputValue1);
    div.appendChild(btn2);
    div.appendChild(inputValue2);
    div.style.display = "none";

    document.body.appendChild(div);
    btn1.addEventListener("click",function(){
        var ids = document.getElementById("iptRead").value;
        var idArr = ids.split(',');
        for(var i=0;i<idArr.length;i++){
            mark_read(idArr[i]);
        }
    })
    btn2.addEventListener("click",function(){
        var style = document.getElementById("iptViewStyle").value;
        set_view_style(style)
    })
}
addReadBtn();