// 弹球动画
class PinBall {
	constructor(width = 30, height = 10) {
		this.scene = new ConsoleCanvas.Scene();
		this.renderer = new ConsoleCanvas.Renderer();
		this.renderer.setSize(width, height);
		// 场景元素添加
		this.elementAdd();
		// 开始动画循环
		this.loop();
	}
	elementAdd() {
		this.ball = new ConsoleCanvas.Element([
			['●']
		], ['background: transparent', 'color: blue', 'border-radius: 50%']);
		// 在上半区域随机小球起始坐标
		this.ball.position.x = Math.floor(Math.random() * this.renderer.width);
		this.ball.position.y = Math.floor(Math.random() * this.renderer.height / 2);
		this.scene.add(this.ball);
	}
	animation() {
		let gap = 1;
		this.ball.kx = this.ball.kx ? this.ball.kx : 1;
		this.ball.ky = this.ball.ky ? this.ball.ky : 1;
		let x = this.ball.position.x + this.ball.kx * gap;
		let y = this.ball.position.y + this.ball.ky * gap;
		// 触碰边界时回弹
		if (x > this.renderer.width - this.ball.vals[0].length || x < 0) {
			this.ball.kx = -1 * this.ball.kx;
		}
		if (y > this.renderer.height - this.ball.vals.length || y < 0) {
			this.ball.ky = -1 * this.ball.ky;
		}
		this.ball.position.x = this.ball.position.x + (this.ball.kx * gap);
		this.ball.position.y = this.ball.position.y + (this.ball.ky * gap);
	}
	loop() {
		this.renderer.render(this.scene, true);
		this.animation();
		setTimeout(() => {
			this.loop();
		}, 500);
	}
}

let pinBall = new PinBall(30, 10);