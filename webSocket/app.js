console.log("WebSocket 服务启动中...");

const WebSocket = require('ws'); // 引入模块
var url = require('url');

const ws = new WebSocket.Server({ port: 9090 }, () => { // 监听接口
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

const close = 'CLOSE';
const quit = 'QUIT'
const over = 'OVER'

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

            const length = clients[roomId].length;
            client.send((new Enitiy(203, { type: length <= 2 ? length : 3 }, "")).toString());
        } else {
            clients[roomId].forEach((item) => {
                if (client != item) {
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
                        sendMessage(i, 201, quit, people + "方退出");
                        return false
                    }
                }
                return true;
            })
        })
        console.log("关闭服务器连接", msg)
    })
})

function sendMessage (roomId, status, data, msg) {

    clients[roomId].forEach((item) => {
        item.send((new Enitiy(status, data, msg)).toString());
    })
    clients[roomId] = [];
    // Object.keys(clients).forEach(i => {

    //     clients[i].forEach((item) => {
    //         if (item != client) {
    //             item.send((new Enitiy(status, data, msg)).toString());
    //         }
    //     })
    //     clients[i] = [];
    // })

}