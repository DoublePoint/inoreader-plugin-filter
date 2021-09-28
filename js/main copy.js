const storageKey = 'filterStorage';

var JSONformat = {
    _strMapToObj(strMap) {
        let obj = Object.create(null);
        for (let [k, v] of strMap) {
            obj[k] = v;
        }
        return obj;
    },
    _mapToJson(map) {
        if (map == null) {
            return '{}';
        }
        return JSON.stringify(this._strMapToObj(map));
    },
    _objToStrMap(obj) {
        let strMap = new Map();
        for (let k of Object.keys(obj)) {
            strMap.set(k, obj[k]);
        }
        return strMap;
    },
    _jsonToMap(jsonStr) {
        if (jsonStr == null) {
            return new Map();
        }
        return this._objToStrMap(JSON.parse(jsonStr));
    }
}
var vm = new Vue({
    el: "#app",
    data: {
        form: {
            name: '',
            filterList: [{ filterType: "", filterValue: "", color: randomHexColor() }],
        },
        tagItems: [
            // { type: '', label: '标签一' },
        ],
        filterTypeList: [
            { label: "Title", value: "value" }
        ],
        filterRelationList: [
            { label: "包含", value: "01" }
        ],
        ruleMap: JSONformat._jsonToMap(localStorage.getItem(storageKey)),
        showForm: false,
        selectedRuleMap: new Map(),
        checkList: [],
        activeName: "first",
        search: "",
        dialogVisible: false
    },
    mounted() {

    },
    computed: {
        tableData() {
            this.tableData = []
            var arr = []
            this.ruleMap.forEach((value, key, map) => {
                //value和key就是map的key，value，map是map本身
                arr.push(this.ruleMap.get(key))
            });
            return arr;
        }
    },
    methods: {
        save() {
            let ruleMap = JSONformat._jsonToMap(localStorage.getItem(storageKey));
            if (ruleMap == null) {
                ruleMap = new Map();
            }
            let rule = ruleMap.get(this.form.name);
            if (rule != null) {
                this.$message({
                    message: '名称重复了',
                    type: 'warning'
                });
                return;
            }
            ruleMap.set(this.form.name, this.form);
            localStorage.setItem(storageKey, JSONformat._mapToJson(ruleMap));

            this.ruleMap = ruleMap;
            // sendMessageToContentScript({cmd:'change', value:'你好，我是popup！'}, function(response)
            // {
            //     //alert('来自content的回复：'+response);
            // });
        },
        addNewRule() {
            this.dialogVisible = true;
            this.clearForm();
        },
        handleInputConfirm() {

        },
        initCreateForm() {
            this.form = {};
            this.form.isDefault = true;
        },
        newFilter() {
            this.form.filterList.push({
                filterType: "", filterValue: ""
            })
        },
        tagClick(key) {
            key = key + '';
            this.form = this.ruleMap.get(key);
            this.dialogVisible = true;

            var selected = this.selectedRuleMap.get(key);
            if (selected == undefined) {
                this.selectedRuleMap.set(key, this.form);
            }
            else {
                this.selectedRuleMap.delete(key);
            }
            this.selectedRuleMap = this.selectedRuleMap;
        },
        close(key) {
            key = key + '';
            this.ruleMap.delete(key);
            localStorage.setItem(storageKey, JSONformat._mapToJson(this.ruleMap));
            this.ruleMap = JSONformat._jsonToMap(localStorage.getItem(storageKey));
        },
        handleEdit(index, row) {
            this.initForm(row);
        },
        handleDelete(index, row) {
            key = row.name;
            this.ruleMap.delete(key);
            localStorage.setItem(storageKey, JSONformat._mapToJson(this.ruleMap));
            this.ruleMap = JSONformat._jsonToMap(localStorage.getItem(storageKey));
        },
        handleClick(index, row) {
            console.log(index, row);
        },
        initForm(formData,dialogVisible){
            this.form = formData;
            if(dialogVisible!=null)
                this.dialogVisible = dialogVisible;
            else
                this.dialogVisible = true;
        },
        clearForm(){
            this.form = {
                name: '',
                enable: true,
                filterList: [{ filterType: "", filterValue: "", color: randomHexColor() }],
            }
            this.dialogVisible = true;
        },
        localToStorage(data){
            let ruleMap = JSONformat._jsonToMap(localStorage.getItem(storageKey));
            if (ruleMap == null) {
                ruleMap = new Map();
            }
            ruleMap.set(data.name, data);
            localStorage.setItem(storageKey, JSONformat._mapToJson(ruleMap));
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