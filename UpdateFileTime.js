#!/usr/bin/env node
// 自動更新文章的修改時間

console.log('開始執行');
var fs = require("fs"); // 用於讀寫文件

var RegExp = /(updated:\s*)((\d{2}(([02468][048])|([13579][26]))[\-\/\s]?((((0?[13578])|(1[02]))[\-\/\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\-\/\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\-\/\s]?((0?[1-9])|([1-2][0-9])))))|(\d{2}(([02468][1235679])|([13579][01345789]))[\-\/\s]?((((0?[13578])|(1[02]))[\-\/\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\-\/\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\-\/\s]?((0?[1-9])|(1[0-9])|(2[0-8]))))))(\s((([0-1][0-9])|(2?[0-3]))\:([0-5]?[0-9])((\s)|(\:([0-5]?[0-9])))))/;

let toppath = "./source/_posts/";
function fn(path) {
    fs.readdir(path, (err, files) => {
        if (err) return console.log(err);
        files.forEach(function (item) {
            fs.stat(path + item, (err, data) => {
                if (err) return console.log(err);
                if (data.isFile()) {
                    if (item.indexOf(".md") > -1) {
                        writeFileTime(path + item, fs);
                    }
                } else {
                    fn(path + item + '/');
                }
            })
        })
    })
}
fn(toppath);

function writeFileTime(file, fs) {
    fs.readFile(file, 'utf8', function (err, data) {    // 讀取文件內容
        if (err) return console.log("讀取檔案內容錯誤：", err);
        if (RegExp.test(data)) {    // 尋找 updated 字串
            fs.stat(file, function (err, stats) {       // 讀取文件建立時間等資訊
                if (err) return console.log("讀取檔案資料錯誤：", err);
                var updateds = data.match(RegExp);
                var updated = updateds[0].replace("updated: ", "").replace(/-/g, "/");  // 時間格式化為 xxxx/xx/xx xx:xx:xx
                if (new Date(stats.mtime).getTime() - new Date(Date.parse(updated)) > 1000 * 60 * 10) { // 只要修改時間和文章內 updated 時間差大於 10 分鍾就觸發更新
                    var result = data.replace(RegExp, "updated: " + getFormatDate(stats.mtime));    // 替換更新時間
                    fs.writeFile(file, result, 'utf8', function(err) {  // 寫入新的檔案內容
                        if (err) return console.log(err);
                        fs.utimes(file, new Date(stats.atime), new Date(stats.mtime), function (err) {  // 還原訪問時間和修改時間
                            if (err) return console.log("修改時間失敗：", err);
                            console.log(file, "成功更新時間");
                        });
                    });
                }
            });
        }
    });
}

/*
 timeStr:時間，格式可為："September 16,2016 14:15:05、
 "September 16,2016"、"2016/09/16 14:15:05"、"2016/09/16"、
 '2014-04-23T18:55:49'和毫秒
 dateSeparator：年、月、日之間的分隔符，預設為"-"，
 timeSeparator：時、分、秒之間的分隔符，預設為":"
 */
function getFormatDate(timeStr, dateSeparator, timeSeparator) {
    dateSeparator = dateSeparator ? dateSeparator : "-";
    timeSeparator = timeSeparator ? timeSeparator : ":";
    var date = new Date(timeStr),
        year = date.getFullYear(),  // 四位數
        month = date.getMonth(),    // 0-11
        day = date.getDate(),       // 1-31
        hour = date.getHours(),     // 0-23
        minute = date.getMinutes(), // 0-59
        seconds = date.getSeconds(),    // 0-59
        Y = year + dateSeparator,
        M = ((month + 1) > 9 ? (month + 1) : ('0' + (month + 1))) + dateSeparator,
        D = (day > 9 ? day : ('0' + day)) + ' ',
        h = (hour > 9 ? hour : ('0' + hour)) + timeSeparator,
        m = (minute > 9 ? minute : ('0' + minute)) + timeSeparator,
        s = (seconds > 9 ? seconds : ('0' + seconds)),
        formatDate = Y + M + D + h + m + s;
    return formatDate;
}