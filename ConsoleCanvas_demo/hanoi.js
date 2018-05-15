// 汉诺伊塔动画
class Hanoi {
	constructor(width = 30, height = 10, discNum = 3) {
		// 最大圆盘的宽度
		this.maxDiscWidth = 2 * (discNum - 1) + 3;
		// 柱子高度
		this.pillarHeight = discNum * 2 + 1;
		// 控制最小长宽
		width = width > (this.maxDiscWidth * 3 + 2) ? width : (this.maxDiscWidth * 3 + 2);
		height = height > (this.pillarHeight + 1) ? height : (this.pillarHeight + 1);
		this.scene = new ConsoleCanvas.Scene();
		this.renderer = new ConsoleCanvas.Renderer();
		this.renderer.setSize(width, height);
		// 圆盘个数
		this.discNum = discNum;
		// 场景元素添加
		this.elementAdd();
		this.start();
	}
	elementAdd() {
		let pillar = [];
		for (let i = 0; i < this.pillarHeight; i++) {
			pillar.push(['‖']);
		}
		// 创建柱子A、B、C
		this.A = new ConsoleCanvas.Element(pillar, ['background: red', 'color: red']);
		this.A.position.y = 1;
		this.B = this.A.clone();
		this.C = this.A.clone();
		this.B.position.x = this.maxDiscWidth + 1;
		this.C.position.x = (this.maxDiscWidth + 1) * 2;
		this.A.currentDiscNum = this.discNum;
		this.A.name = 'A';
		this.B.currentDiscNum = 0;
		this.B.name = 'B';
		this.C.currentDiscNum = 0;
		this.C.name = 'C';
		this.group = new ConsoleCanvas.Group();
		// 柱子加入组合，通过整体组合调整位置
		this.group.add([this.A, this.B, this.C]);
		this.group.position.x = Math.floor((this.renderer.width - (3 * this.maxDiscWidth + 2)) / 2) + Math.floor(this.maxDiscWidth / 2);
		this.group.position.y = Math.ceil((this.renderer.height - this.pillarHeight - 1) / 2);
		this.discArray = [];
		let discItem;
		// 创建圆盘
		for (let j = 1; j <= this.discNum; j++) {
			discItem = new ConsoleCanvas.Element([new Array(j * 2 + 1).fill('Θ')], ['background: blue', 'color: blue']);
			discItem.position.x = -1 * j;
			discItem.position.y = 2 * j;
			this.discArray.push(discItem);
		}
		this.group.add(this.discArray);
		this.scene.add(this.group);
	}
	// 执行动画过程
	start() {
		this.moveArray = [];
		this.hanoi(this.discNum, this.A, this.B, this.C);
		// 监听事件
		document.addEventListener('GO_ON', () => {
			// 吐出下一个移动顺序并执行动画
			let moveItem = this.moveArray.pop();
			if (moveItem) {
				this.moveAnimation(moveItem.which, moveItem.from, moveItem.to);
			}
		});
		setTimeout(() => {
			// 倒序排列方便pop
			this.moveArray.reverse();
			alert(`${this.moveArray.length} steps to cost`);
			// 通知动画执行
			this.goOn();
		}, 500);
	}
	// 发送事件通知移动下一个圆盘
	goOn() {
		// 创建
		let event = document.createEvent("HTMLEvents");
		// 初始化
		event.initEvent("GO_ON", false, false);
		document.dispatchEvent(event);
	}
	// 递归
	hanoi(n, A, B, C) {
		if (n == 1) {
			this.move(1, A, C);
		} else {
			this.hanoi(n - 1, A, C, B);
			this.move(n, A, C);
			this.hanoi(n - 1, B, A, C);
		}
	}
	// 收集递归后的移动顺序结果，保存至moveArray
	move(which, from, to) {
		this.moveArray.push({
			which: which,
			from: from,
			to: to
		});
		// console.log(`${which}: ${from.name} -> ${to.name}`);
	}
	// 移动动画
	moveAnimation(which, from, to) {
		let disc = this.discArray[which - 1];
		let directionX = to.position.x > from.position.x ? 1 : -1;
		let _continue = true;
		// 圆盘移出当前圆柱
		if (disc.position.y > 0 && (disc.position.x + which) == from.position.x) {
			disc.position.y--;
			// 圆盘移向目标圆柱
		} else if (disc.position.y == 0 && (disc.position.x + which) != to.position.x) {
			disc.position.x += directionX;
			// 圆盘移入目标圆柱
		} else if ((disc.position.x + which) == to.position.x && disc.position.y < (this.discNum - to.currentDiscNum) * 2) {
			disc.position.y++;
		} else {
			//当下圆盘移动结束
			_continue = false;
			from.currentDiscNum--;
			to.currentDiscNum++;
			//发送事件通知移动下一个圆盘
			this.goOn();
		}
		if (_continue) {
			this.renderer.render(this.scene, true);
			setTimeout(() => {
				this.moveAnimation(which, from, to);
			}, 100);
		}
	}
}
let hanoi = new Hanoi(31, 10, 4);