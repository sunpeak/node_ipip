# node_ipip

适用于 Node.js 的 [ipip.net](http://ipip.net) IP 数据库查询模块。
只解析datx格式的ip库

## 入门

代码示例

    var IpUtil = require('./lib/iputil.js');
    var iputil = new IpUtil();

    iputil.load(path.join(__dirname, 'mydata4vipday2.datx'));
    console.log(iputil.find('2.2.2.2'));


