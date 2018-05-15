class PinBallPaddleDom {
	constructor(width = 30, height = 10, noStyle = false) {
		this.scene = new PixelCanvas.Scene(document.getElementById('canvas'));
		this.renderer = new PixelCanvas.Renderer();
		this.renderer.setSize(width, height);
		this.noStyle = noStyle;
		// 场景元素添加
		this.elementAdd();
		// 挡板移动控制
		this.paddleMove();
		// 开始游戏
		this.loop();
	}
	elementAdd() {
		this.ball = new PixelCanvas.Element([
			['☢']
		], ['background: transparent', 'color: blue', 'border-radius: 50%']);
		this.paddle = new PixelCanvas.Element([
			Array(5).fill('█')
		], ['background: red', 'color: red', 'border-radius:3px']);
		this.score = new PixelCanvas.Element([
			['0']
		], ['background: #fff', 'color: #ccc']);
		this.scoreNum = 0;
		this.ball.position.x = Math.floor(Math.random() * this.renderer.width);
		this.ball.position.y = Math.floor(Math.random() * this.renderer.height / 2);
		this.paddleWidth = this.paddle.vals[0].length;
		this.paddle.position.x = Math.floor(Math.random() * (this.renderer.width - this.paddleWidth));
		this.paddle.position.y = this.renderer.height - 1;
		this.score.position.x = this.renderer.width - this.score.vals[0].length - 1;
		this.scene.add(this.ball);
		this.scene.add(this.paddle);
		this.scene.add(this.score);
	}
	paddleMove() {
		document.onkeydown = (event) => {
			switch (event.keyCode) {
				// 左
				case 37:
					if (this.paddle.position.x > 0) {
						this.paddle.position.x--;
						this.renderer.render(this.scene, this.noStyle);
					};
					break;
					// 右
				case 39:
					if (this.paddle.position.x < (this.renderer.width - this.paddleWidth)) {
						this.paddle.position.x++;
						this.renderer.render(this.scene, this.noStyle);
					};
					break;
				default:
					;
			}
		}
	}
	animation() {
		let gap = 1;
		this.ball.kx = this.ball.kx ? this.ball.kx : 1;
		this.ball.ky = this.ball.ky ? this.ball.ky : 1;
		let x = this.ball.position.x + (this.ball.kx * gap);
		let y = this.ball.position.y + (this.ball.ky * gap);
		if (x > this.renderer.width - this.ball.vals[0].length || x < 0) {
			this.ball.kx = -1 * this.ball.kx;
		}
		if (y < 0) {
			this.ball.ky = -1 * this.ball.ky;
		}
		if ((y > this.renderer.height - this.ball.vals.length - 1) && x >= this.paddle.position.x && (x <= this.paddle.position.x + this.paddleWidth)) {
			this.ball.ky = -1 * this.ball.ky;
			this.scoreNum++;
			this.score.vals[0] = (this.scoreNum + '').split('');
			this.score.position.x = this.renderer.width - this.score.vals[0].length - 1;
		}
		this.ball.position.x = this.ball.position.x + (this.ball.kx * gap);
		this.ball.position.y = this.ball.position.y + (this.ball.ky * gap);
	}
	loop() {
		this.renderer.render(this.scene, this.noStyle);
		this.animation();
		if (this.ball.position.y < this.renderer.height + 1) {
			setTimeout(() => {
				this.loop();
			}, 300);
		} else {
			console.log(`score: ${this.scoreNum}, refresh to restart ╮(￣▽￣)╭`);
			alert(`score: ${this.scoreNum}, refresh to restart ╮(￣▽￣)╭`);
		}
	}
}
alert('ready?');
let pinBallPaddleDom = new PinBallPaddleDom(30, 10);