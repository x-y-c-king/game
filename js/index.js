// 实列
const app = document.getElementById('app');

/**
 * 观察者模式 奖励棋子的点击
 */
class eventBus {
    constructor() {
        this.handlers = {}
    }

    $on (eventName, callback) {
        if (typeof this.handlers[eventName] === 'undefined') {
            this.handlers[eventName] = [];
        } else {
            if (this.handlers[eventName].length !== 0) {
                const callback = this.handlers[eventName].pop();
                callback(false, 1)
            }
        }
        this.handlers[eventName].push(callback);
    }

    $emit (eventName, args) {

        if (this.handlers[eventName]) {
            this.handlers[eventName].forEach(callback => {
                callback(true, args)
                this.handlers[eventName].pop();
            })
        }
    }

    getLength (eventName) {
        return this.handlers[eventName] ? this.handlers[eventName].length : 0;
    }
}

let maps = []; //棋盘
let position = [];  //地址map 存放对应坐标的位置;
let readonlyMap = [];

let redText = ['兵', '炮', '車', '馬', '相', '士', '帥'];
let blueText = ['卒', '炮', '車', '馬', '象', '士', '將'];

const RED = '红';
const BLUE = '蓝';

let toggle = RED;
const caption = document.createElement("div");
caption.innerText = `出棋方 ${RED}方`
caption.className = 'caption'
document.body.insertBefore(caption, app);

let red = {
    bing: [{ top: 325, left: 25 }, { top: 325, left: 225 }, { top: 325, left: 425 }, { top: 325, left: 625 }, {
        top: 325,
        left: 825
    }],
    // (325 - 25) / 100
    pao: [{ top: 225, left: 125 }, { top: 225, left: 725 }],
    che: [{ top: 25, left: 25 }, { top: 25, left: 825 }],
    ma: [{ top: 25, left: 125 }, { top: 25, left: 725 }],
    xiang: [{ top: 25, left: 225 }, { top: 25, left: 625 }],
    shi: [{ top: 25, left: 325 }, { top: 25, left: 525 }],
    jiang: [{ top: 25, left: 425 }]
}
let blue = {
    bing: [{ top: 625, left: 25 }, { top: 625, left: 225 }, { top: 625, left: 425 }, { top: 625, left: 625 }, {
        top: 625,
        left: 825
    }],
    pao: [{ top: 725, left: 125 }, { top: 725, left: 725 }],
    che: [{ top: 925, left: 25 }, { top: 925, left: 825 }],
    ma: [{ top: 925, left: 125 }, { top: 925, left: 725 }],
    xiang: [{ top: 925, left: 225 }, { top: 925, left: 625 }],
    shi: [{ top: 925, left: 325 }, { top: 925, left: 525 }],
    jiang: [{ top: 925, left: 425 }]
}

const bus = new eventBus();

/**
 * 空位置
 */
class Position {
    constructor(x, y) {
        const _ = this;
        this.x = x;
        this.y = y;

        let el = document.createElement("div");
        el.style.top = position[x][y].top + 'px';
        el.style.left = position[x][y].left + 'px';
        el.className = 'hidden';

        app.appendChild(el);

        el.onclick = this.handleClick.bind(_, el)
    }

    handleClick (e) {
        console.log('移动到：', this.x, this.y)
        bus.$emit("handle", { x: this.x, y: this.y });
    }
}

/**
 * 兵 马 车 炮 象（相） 士 将（帅）
 */
let isOver = false;

class Piece {
    constructor(x, y, text, isRed) {
        const _ = this;

        this.text = text;
        this.x = x;
        this.y = y;

        const color = isRed ? "piece-red" : "piece-blue";

        this.people = isRed ? RED : BLUE;

        this.el = document.createElement("div")

        this.el.className = `piece ${color}`;
        this.el.style.top = position[x][y].top + 'px';
        this.el.style.left = position[x][y].left + 'px';
        this.el.innerText = text;

        this.el.onclick = this.handleClick.bind(_, this.el);

        app.appendChild(this.el);
    }

    handleClick (e) {
        if (isOver) {
            return;
        }
        if (bus.getLength("handle") === 0) {
            if (toggle !== this.people) {
                return;
            }
            e.style.transform = `scale(1.1)`

            console.log(`${this.text}坐标为：` + this.x, this.y)

            bus.$on("handle", (isFinished, { x, y }) => {

                e.style.transform = `scale(1)`
                if (isFinished) { //是否成功
                    let element = maps[x][y];
                    if (this.isMobile(x, y)) {

                        if (element) {
                            // alert("有棋子")
                            if (maps[x][y].people !== this.people) {
                                toggle = this.people === RED ? BLUE : RED;
                                console.log('吃')
                                console.log(maps[x][y])
                                const flag = maps[x][y].isStop()
                                maps[x][y].el.style.display = 'none';

                                // [maps[x][y], maps[this.x][this.y]] = [maps[this.x][this.y], maps[x][y]]
                                maps[x][y] = maps[this.x][this.y];
                                maps[this.x][this.y] = null

                                this.x = x;
                                this.y = y;
                                e.style.top = position[x][y].top + 'px'
                                e.style.left = position[x][y].left + 'px'
                                console.log(flag)
                                if (flag) {
                                    setTimeout(() => {
                                        alert('游戏结束');
                                    }, 300)
                                    isOver = true;
                                    caption.innerText = `游戏结束，胜利者 ${this.people}方`
                                }

                            } else {
                                toggle = this.people === RED ? RED : BLUE;

                                console.log('不吃')
                            }
                            caption.innerText = `出棋方 ${toggle}方`
                        } else {
                            toggle = this.people === RED ? BLUE : RED;
                            caption.innerText = `出棋方 ${toggle}方`;
                            [maps[x][y], maps[this.x][this.y]] = [maps[this.x][this.y], maps[x][y]]
                            // maps[this.x, this.y] = null;
                            // maps[x, y] = this;
                            this.x = x;
                            this.y = y;
                            e.style.top = position[x][y].top + 'px'
                            e.style.left = position[x][y].left + 'px'
                        }
                    } else {
                        // console.log()
                        if (this == element) {
                            console.log('自己点自己')
                        } else {
                            console.log("不可以移动到这")
                        }
                    }
                }
            })
        } else {
            bus.$emit('handle', { x: this.x, y: this.y })
        }
    }

    isMobile (x, y) {
        return true
    }

    isStop () {
        return false;
    }
}

class Bing extends Piece {
    constructor(x, y, text = '兵', isRed) {
        super(x, y, text, isRed)
    }

    isMobile (x, y) {
        let move = []
        if (this.people === RED) {
            let boundary = this.x > 4;
            move.push({ x: this.x + 1, y: this.y });
            if (boundary) {
                move.push({ x: this.x, y: this.y + 1 });
                move.push({ x: this.x, y: this.y - 1 });
            }
        } else {
            let boundary = this.x <= 4;
            move.push({ x: this.x - 1, y: this.y });
            if (boundary) {
                move.push({ x: this.x, y: this.y - 1 });
                move.push({ x: this.x, y: this.y + 1 });
            }
        }

        return move.some((item, index) => {
            return item.x == x && item.y === y
        })
    }

    isStop () {
        return super.isStop();
    }
}

class Pao extends Piece {
    constructor(x, y, text = '炮', isRed) {
        super(x, y, text, isRed)
    }

    isStop () {
        return super.isStop();
    }

    /**
     * 同一条线上移动多个长度
     * @param x
     * @param y
     */
    isMobile (x, y) {
        // return super.isMobile(x, y);
        //同一条线上
        let flag = false;
        if (x === this.x && y === this.y) {
            return false;
        }
        if (x === this.x || y === this.y) {
            let i, j, k = 0, count = 0;
            if (x == this.x) {
                i = y;
                j = this.y;
                k = 1;
            } else {
                i = x;
                j = this.x;
            }
            if (i > j) {
                [i, j] = [j + 1, i]
            } else {
                i += 1;
            }
            for (; i < j; i++) {
                if (k === 0) {
                    if (maps[i][y] !== null) {
                        count++;
                        console.log('移动log:' + k + "  " + maps[i][y].text)
                        // break;
                    }
                } else {
                    if (maps[x][i] !== null) {
                        count++;
                        console.log('移动log:' + maps[x][i].text)
                        // break;
                    }
                }
            }
            if ((count === 1 && maps[x][y] != null) || (i == j && count == 0)) {
                flag = true;
            }
        }
        return flag;
    }
}

class Che extends Piece {
    constructor(x, y, text = '车', isRed) {
        super(x, y, text, isRed)
    }

    isStop () {
        return super.isStop();
    }

    /**
     * 同一条线上移动多个长度
     * @param x
     * @param y
     */
    isMobile (x, y) {
        // return super.isMobile(x, y);
        //同一条线上
        let flag = false;
        if (x === this.x && y === this.y) {
            return false;
        }
        if (x === this.x || y === this.y) {
            let i, j, k = 0;
            if (x === this.x) {
                i = y;
                j = this.y;
                k = 1;
            } else {
                i = x;
                j = this.x;
            }
            if (i > j) {
                [i, j] = [j + 1, i]
            } else {
                i += 1;
            }
            for (; i < j; i++) {
                if (k === 0) {
                    if (maps[i][y] !== null) {
                        console.log('移动log:' + k + "  " + maps[i][y].text)
                        break;
                    }
                } else {
                    if (maps[x][i] !== null) {
                        console.log('移动log:' + maps[x][i].text)
                        break;
                    }
                }
            }
            if (i === j) {
                flag = true;
            }
        }
        return flag;
    }
}

class Ma extends Piece {
    constructor(x, y, text = '马', isRed) {
        super(x, y, text, isRed)
    }

    isStop () {
        return super.isStop();
    }

    isMobile (x, y) {
        let flag = false;
        if (x === this.x && y === this.y) {
            return false;
        }
        let m = this.x, n = this.y;
        const ma = [
            { x: m - 1, y: n - 2, limit: { x: m, y: n - 1 } },
            { x: m + 1, y: n - 2, limit: { x: m, y: n - 1 } },
            { x: m - 1, y: n + 2, limit: { x: m, y: n + 1 } },
            { x: m + 1, y: n + 2, limit: { x: m, y: n + 1 } },

            { x: m - 2, y: n - 1, limit: { x: m - 1, y: n } },
            { x: m - 2, y: n + 1, limit: { x: m - 1, y: n } },
            { x: m + 2, y: n - 1, limit: { x: m + 1, y: n } },
            { x: m + 2, y: n + 1, limit: { x: m + 1, y: n } }
        ];
        flag = ma.some((item) => {
            // console.log(item);
            if (x === item.x && y === item.y) {
                const post = maps[item.limit.x][item.limit.y]

                //马埤脚
                if (post) {
                    console.log('受制于' + post.text);
                    return false
                }
                return true;
            }
            return false;
        })
        return flag;
    }
}

class Xiang extends Piece {
    constructor(x, y, text = '象', isRed) {
        super(x, y, text, isRed)
    }

    isStop () {
        return super.isStop();
    }

    isMobile (x, y) {
        let flag = false;
        if (x === this.x && y === this.y) {
            return false;
        }
        const xiang = [
            [{ x: 2, y: 0 }, { x: 2, y: 8 }, { x: 4, y: 2 }, { x: 4, y: 6 }, { x: 0, y: 2 }, { x: 0, y: 6 }, { x: 2, y: 4 }],
            [{ x: 7, y: 0 }, { x: 7, y: 8 }, { x: 5, y: 2 }, { x: 5, y: 6 }, { x: 9, y: 2 }, { x: 9, y: 6 }, { x: 7, y: 4 }]
        ]

        let attr = xiang[0]
        if (this.people === BLUE) {
            attr = xiang[1]
        }
        flag = attr.some((item) => {
            if (x == item.x && y == item.y) {
                let m = Math.abs(this.x - x);
                let n = Math.abs(this.y - y);
                let i = Math.abs(this.x + x) / 2;
                let j = Math.abs(this.y + y) / 2;
                if (m === n && maps[i][j] === null) {
                    return true;
                } else {
                    if (maps[i][j]) {
                        console.log("阻止" + this.text + "跳转的是：" + maps[i][j].text)
                    }
                }
            }
            return false;
        })
        return flag;
    }
}

class Shi extends Piece {
    constructor(x, y, text = '士', isRed) {
        super(x, y, text, isRed)
    }

    isStop () {
        return super.isStop();
    }

    isMobile (x, y) {
        const m = this.x;
        const n = this.y;

        const shi = [
            { x: m + 1, y: n - 1 },
            { x: m + 1, y: n + 1 },
            { x: m - 1, y: n - 1 },
            { x: m - 1, y: n + 1 },
        ]
        return shi.some((item) => {
            if (x === item.x && y == item.y) {
                if ([0, 1, 2, 7, 8, 9].includes(x) && [3, 4, 5].includes(y)) {
                    return true;
                }
            }
        })
    }

}

class Jiang extends Piece {
    constructor(x, y, text = '将', isRed) {
        super(x, y, text, isRed)
    }

    isMobile (x, y) {
        const m = this.x;
        const n = this.y;
        const stop = [
            { x: m, y: n - 1 },
            { x: m, y: n + 1 },
            { x: m - 1, y: n },
            { x: m + 1, y: n }
        ]
        return stop.some(item => {
            if (x === item.x && y === item.y) {
                return ([0, 1, 2, 7, 8, 9].includes(x) && [3, 4, 5].includes(y))
            }
        })
    }

    isStop () {
        return true;
    }

}

let element = [Bing, Pao, Che, Ma, Xiang, Shi, Jiang]

/**
 * 新的开始
 * @param index
 * @returns {{top: number, left: number}}
 */
function getPosition (i, j) {
    let top = 25 + i * 100;
    let left = 25 + j * 100;
    return { top, left }
}

function initMap () {

    const line = Array(72).fill(0)
    // 初始化棋盘线
    line.forEach((item, index) => {
        const el = document.createElement("div");
        let className = ["type"]

        //中间一行 不显示一部分线
        if (Math.floor(index / 8) !== 4 || index % 8 === 7) {
            className.push("border-right");
        }
        className.push("border-bottom");
        //第一行
        if (index < 8) {
            className.push("border-top");
        }
        // 第一列
        if (index % 8 === 0) {
            className.push("border-left");
        }
        el.className = className.join(' ')
        app.appendChild(el);
    })

    const lines = [];
    for (let i = 0; i < 4; i++) {
        lines.push(document.createElement('div'))
        const width = Math.sqrt(200 * 200 + 200 * 200);
        const posts = ['rotate-top-left', 'rotate-top-right', 'rotate-bottom-left', 'rotate-bottom-right'];
        const className = ['rotate',];
        className.push(posts[i]);
        lines[i].style.width = width + 'px';
        lines[i].style.height = width + 'px';

        if (i % 2 === 0) {
            lines[i].style.left = '350px'
        } else {
            lines[i].style.right = '350px'
        }
        if (i < 2) {
            className.push('border-bottom');
            lines[i].style.bottom = '50px'
        } else {
            className.push('border-top');
            lines[i].style.top = '50px'
        }

        lines[i].className = className.join(" ");
        app.appendChild(lines[i]);
    }

    // 初始化按钮点击
    for (let i = 0; i < 10; i++) {
        let post = [];
        for (let j = 0; j < 9; j++) {
            const { top, left } = getPosition(i, j);
            post.push({ top, left })

        }
        position.push(post);
    }

    for (let i = 0; i < 10; i++) {
        let read = [];
        let arr = [];
        for (let j = 0; j < 9; j++) {
            read.push(new Position(i, j))
            arr.push(null)
        }
        readonlyMap.push(read);
        maps.push(arr);
    }

    // 初始化红色棋子
    Object.keys(red).forEach((item, index) => {

        red[item].forEach((item) => {
            const i = (item.top - 25) / 100;
            const j = (item.left - 25) / 100;
            maps[i][j] = new element[index](i, j, redText[index], true);
        })
    })

    // 初始化蓝色棋子
    Object.keys(blue).forEach((item, index) => {

        blue[item].forEach((item) => {
            const i = (item.top - 25) / 100;
            const j = (item.left - 25) / 100;
            maps[i][j] = new element[index](i, j, blueText[index], false);
        })
    })
}

initMap();



