
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

let FILTER_TYPE_TITLE_LABEL="Title",FILTER_TYPE_TITLE_VALUE="01";
let FILTER_TYPE_CONTENT_LABEL="Content",FILTER_TYPE_CONTENT_VALUE="02";
let FILTER_RELATION_LIKE_LABEL="包含",FILTER_RELATION_LIKE_VALUE="01";
let FILTER_RELATION_NOT_LIKE_LABEL="不包含",FILTER_RELATION_NOT_LIKE_VALUE="02";
const storageKey = 'filterStorage';