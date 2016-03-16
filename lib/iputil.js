var fs = require('fs');

var IpData = function () {
    this.dataBuffer = undefined;
    this.offset = undefined;
    this.indexBuffer = undefined;
    this.index = new Array();
}

var enableFileWatch = false;
var ipFile = undefined;
var lastModifyTime = 0;
var ipDataInstance = new IpData();

var IpUtil = function () {
}

IpUtil.prototype.load = function (filename) {
    ipFile = filename;
    this._load()
    if (enableFileWatch) {
        this._watch();
    }
}

IpUtil.prototype._load = function () {
    var stats = fs.statSync(ipFile);
    lastModifyTime = stats.mtime;
    var data = fs.readFileSync(ipFile)
    var ipData = new IpData();
    ipData.dataBuffer = new Buffer(data);
    ipData.offset = ipData.dataBuffer.readInt32BE(0);
    ipData.indexBuffer = new Buffer(ipData.offset)
    ipData.dataBuffer.copy(ipData.indexBuffer, 0, 4, ipData.offset)

    for (var i = 0; i < 256; i++) {
        for (var j = 0; j < 256; j++) {
            var k = i * 256 + j
            ipData.index[k] = ipData.indexBuffer.readInt32LE(k * 4);
        }
    }
    ipDataInstance = ipData;
}

IpUtil.prototype._watch = function () {
    var that = this;
    setInterval(function () {
        fs.stat(ipFile, function (error, stats) {
            if (error) {
                console.error(error);
            }
            else {
                if (lastModifyTime < stats.mtime) {
                    that._load()
                }
            }
        })
    }, 60000);
}

IpUtil.prototype._str2Ip = function (ip) {
    var ss = ip.split('.');
    var a, b, c, d;
    a = parseInt(ss[0]);
    b = parseInt(ss[1]);
    c = parseInt(ss[2]);
    d = parseInt(ss[3]);
    return (a << 24) | (b << 16) | (c << 8) | d;
}

IpUtil.prototype._bytesToLong = function (a, b, c, d) {
    return ((((a & 0xff) << 24) | ((b & 0xff) << 16) | ((c & 0xff) << 8) | (d & 0xff)));
}


IpUtil.prototype.find = function (ip) {
    var instance = ipDataInstance;
    var ips = ip.split('.');
    var prefix_value = parseInt(ips[0]) * 256 + parseInt(ips[1]);
    var ip2long_value = this._str2Ip(ip);
    var start = instance.index[prefix_value];
    var max_comp_len = instance.offset - 262144 - 4;
    var tmpInt;
    var index_offset = -1;
    var index_length = -1;
    var b = 0;
    for (start = start * 9 + 262144; start < max_comp_len; start += 9) {
        tmpInt = instance.indexBuffer.readInt32BE(start);
        if (tmpInt >= ip2long_value) {
            index_offset = this._bytesToLong(b, instance.indexBuffer.readInt8(start + 6), instance.indexBuffer.readInt8(start + 5), instance.indexBuffer.readInt8(start + 4));
            index_length = (0xFF & instance.indexBuffer.readInt8(start + 7) << 8) + (0xFF & instance.indexBuffer.readInt8(start + 8));
            break;
        }
    }
    var areaBytes = new Buffer(index_length)
    instance.dataBuffer.copy(areaBytes, 0, instance.offset + index_offset - 262144, instance.offset + index_offset - 262144 + index_length);
    return new String(areaBytes).split('\t', -1);
}

module.exports = IpUtil