var vm = new Vue({
    el: "#app",
    data: {
        form: {
            name: '',
            filterList: [{ filterType: "",filterRelation:"", filterValue: ""}],
            remark:''
        },
        filterTypeList: [
            { label: FILTER_TYPE_TITLE_LABEL, value:  FILTER_TYPE_TITLE_VALUE},
            { label: FILTER_TYPE_CONTENT_LABEL, value: FILTER_TYPE_CONTENT_VALUE }
        ],
        filterRelationList: [
            { label: FILTER_RELATION_NOT_LIKE_LABEL, value: FILTER_RELATION_NOT_LIKE_VALUE }
        ],
        ruleMap: JSONformat._jsonToMap(localStorage.getItem(storageKey)),
        selectedRuleMap: new Map(),
        checkList: [],
        activeName: "first",
        search: "",
        dialogVisible: false,
        closeTag:localStorage.getItem("closeTag")
    },
    mounted() {

    },
    watch:{
        form:{
            handler(newVal,oldVal){
                // if(newVal.name!=""){

                // }
                // if(newVal.filterList)
                // console.log("form发生了变更");
            },
            deep:true
        }
    },
    computed: {
        tableData() {
            var arr = []
            this.ruleMap.forEach((value, key, map) => {
                //value和key就是map的key，value，map是map本身
                arr.push(this.ruleMap.get(key))
            });
            return arr;
        }
    },
    methods: {
        getFilterRemark(form){
            // if(form.name!=""){

            // }
            // if(form.filterList.length>0){
            //     for(var i=0;i<filterList.length;i++){
            //         var ite = filterList[i];
            //         if(ite.filterValue!=""){

            //         }
            //     }
            // }
            // console.log("form发生了变更");
        },
        save() {
            let ruleMap = JSONformat._jsonToMap(localStorage.getItem(storageKey));
            if (ruleMap == null) {
                ruleMap = new Map();
            }
            // let rule = ruleMap.get(this.form.name);
            // if (rule != null) {
            //     this.$message({
            //         message: '名称重复了',
            //         type: 'warning'
            //     });
            //     return;
            // }
            ruleMap.set(this.form.name, this.form);
            localStorage.setItem(storageKey, JSONformat._mapToJson(ruleMap));

            this.ruleMap = ruleMap;
            this.$message({
             message: 'Save Success',
             type: 'success'
            });
            this.dialogVisible = false;
        },
        saveAndAdd(){
            this.save()
            this.addNewRule();
        },
        addNewRule() {
            this.dialogVisible = true;
            this.clearForm();
        },
        newFilter() {
            this.form.filterList.push({
                filterType: FILTER_TYPE_TITLE_VALUE, filterValue: "",filterRelation:FILTER_RELATION_NOT_LIKE_VALUE
            })
        },
        handleCloseTag(){
            this.closeTag = "1";
            localStorage.setItem("closeTag", '1');
        },
        // tagClick(key) {
        //     key = key + '';
        //     this.form = this.ruleMap.get(key);
        //     this.dialogVisible = true;

        //     var selected = this.selectedRuleMap.get(key);
        //     if (selected == undefined) {
        //         this.selectedRuleMap.set(key, this.form);
        //     }
        //     else {
        //         this.selectedRuleMap.delete(key);
        //     }
        //     this.selectedRuleMap = this.selectedRuleMap;
        // },
        // close(key) {
        //     key = key + '';
        //     this.ruleMap.delete(key);
        //     localStorage.setItem(storageKey, JSONformat._mapToJson(this.ruleMap));
        //     this.ruleMap = JSONformat._jsonToMap(localStorage.getItem(storageKey));
        // },
        handleEdit(index, row) {
            var dat = JSON.stringify(row);
            dat = JSON.parse(dat);
            this.initForm(dat);
        },
        handleDelete(index, row) {
            this.$confirm('Do you want to continue?', 'Tips', {
                confirmButtonText: 'Ok',
                cancelButtonText: 'Cancel',
                type: 'warning'
              }).then(() => {
                key = row.name;
                this.ruleMap.delete(key);
                this.saveTmpToStorage();
                this.$message({
                  type: 'success',
                  message: 'Delete Success'
                });
              }).catch(() => {
              });
            
        },
        handleClick(index, row) {
            //console.log(index, row);
        },
        handleDialogCancel(){
            this.dialogVisible = false;
        },
        initForm(formData,dialogVisible){
            this.form = formData;
            if(dialogVisible!=null)
                this.dialogVisible = dialogVisible;
            else
                this.dialogVisible = true;
        },
        tableSwitchChange(){
            this.saveTmpToStorage();
        },
        clearForm(){
            this.form = {
                name: '',
                enable: true,
                filterList: [{ filterType: FILTER_TYPE_TITLE_VALUE, filterValue: "",filterRelation:FILTER_RELATION_NOT_LIKE_VALUE,color: randomHexColor() }],
                remark:''
            }
            this.dialogVisible = true;
        },
        saveTmpToStorage(){
            localStorage.setItem(storageKey, JSONformat._mapToJson(this.ruleMap));
            this.ruleMap = JSONformat._jsonToMap(localStorage.getItem(storageKey));
        },
        handleFilter(){
            sendMessageToContentScript({cmd:'change', value:localStorage.getItem(storageKey)}, function(response)
            {
                //alert('来自content的回复：'+response);
            });
        }

    }
})

function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            if (callback) callback(response);
        });
    });
}

function randomHexColor() { //随机生成十六进制颜色
    var hex = Math.floor(Math.random() * 16777216).toString(16); //生成ffffff以内16进制数
    while (hex.length < 6) { //while循环判断hex位数，少于6位前面加0凑够6位
        hex = '0' + hex;
    }
    return '#' + hex; //返回‘#'开头16进制颜色
}