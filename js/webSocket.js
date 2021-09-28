const WebSocket = require('ws'); // 引入模块
var url = require('url');

// import WebSocket from 'ws'
console.log(WebSocket);
const ws = new WebSocket.Server({ port: 3000 }, () => { // 监听接口
    // console.log(args)
    console.log("socket start")
})

let clients = {};

class Enitiy {
    constructor(status, data, msg) {
        this.status = status;
        this.data = data;
        this.msg = msg;
    }
    toString () {
        return JSON.stringify(this);
    }
}

ws.on('connection', (client) => {
    client.on("open", function () {

    })

    client.on('message', (msg) => {
        let result = JSON.parse(msg.toString());
        const { type, roomId } = result;
        if (type == 1) {
            if (clients[roomId]) {
                clients[roomId].push(client);
            } else {
                clients[roomId] = [client];
            }

            let str = '';
            let status = 200;
            if (clients[roomId].length <= 2) {
                const people = clients[roomId].length == 1 ? '红' : '蓝';
                str = `欢迎光临，你是${people}方`
            } else {
                status = 500;
                str = '对战席位也满，请耐心观战'
            }

            client.send((new Enitiy(status, str, "")).toString());
        } else {
            clients[roomId].forEach((item) => {
                if(client != item) {
                    item.send((new Enitiy(200, result, "")).toString())
                }  
            })
        }
    })
    client.on('close', (msg) => {
        Object.keys(clients).every(i => {
            return clients[i].every((item, index) => {
                if (item._closeCode == 1001) {
                    clients[i].splice(index, 1);
                    if (index < 2) {
                        const people = index == 0 ? '红' : '蓝';
                        sendMessage(201, { operating: 'closer' }, people + "方退出");
                        return false
                    }
                }
                return true;
            })
        })
        console.log("关闭服务器连接", msg)
    })
})

function sendMessage (status, data, msg) {
    Object.keys(clients).forEach(i => {
        clients[i].forEach((item) => {
            if (item._closeCode != 1001) {
                item.send((new Enitiy(status, data, msg)).toString());
            }
        })
        clients[i] = [];
    })

}