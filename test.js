var path = require('path');
var IpUtil = require('./lib/iputil.js');
var iputil = new IpUtil();


iputil.load(path.join(__dirname, 'mydata4vipday2.datx'));
console.log(iputil.find('2.2.2.2'));