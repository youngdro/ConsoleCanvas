window.PixelCanvas = new function() {
	// 场景
	this.Scene = function(target, name = '', style) {
		// 场景最终被渲染至的目标dom
		this.target = target;
		if (target) {
			// 给目标dom加上class和其基本样式
			target.className = target.className == '' ? 'pixel-canvas' : target.className + ' ' + 'pixel-canvas';
			let styleNode = document.createElement("style");
			styleNode.type = "text/css";
			styleNode.innerHTML = `
			.pixel-canvas span{
				display: inline-block;
				width: 15px;
				height: 15px;
				text-align: center;
				font-size: 12px;
				line-height: 15px;
				overflow: hidden;
			}`;
			document.getElementsByTagName("head")[0].appendChild(styleNode);
		}
		// 场景元素集合
		this.elements = [];
		// 场景样式
		this.style = Object.prototype.toString.call(style) === '[object Array]' ? style : [];
		// 场景名称
		this.name = name.toString();
	};
	// 场景添加元素
	this.Scene.prototype.add = function(ele) {
		if (!ele) {
			return;
		}
		ele.belong = this;
		// 添加的元素是组合元素
		if (ele.isGroup) {
			// 提出组合里的元素归入场景
			this.elements.push(...ele.elements);
			return;
		}
		this.elements.push(ele);
	};
	// 元素
	//vals:元素字符内容，style：元素样式，z_index：层叠优先级，position：位置
	this.Element = function(vals = [
		[]
	], style = [], z_index = 1, position) {
		// 元素随机id
		this.id = Number(Math.random().toString().substr(3, 1) + Date.now()).toString(36);
		this.vals = vals;
		this.style = style;
		this.z_index = z_index;
		this.scale_x = 1;
		this.scale_y = 1;
		this.position = {
				x: position && position.x ? position.x : 0,
				y: position && position.y ? position.y : 0
			},
			// 元素所属的组合
			this.group = null;
		// 元素所属的场景
		this.belong = null;
	};
	// 元素克隆
	this.Element.prototype.clone = function() {
		return new this.constructor(JSON.parse(JSON.stringify(this.vals)), this.style.concat(), this.z_index, this.position);
	};
	// 元素删除
	this.Element.prototype.remove = function() {
		let scene = this.group ? this.group.belong : this.belong;
		let index = scene.elements.findIndex((ele) => {
			return ele.id === this.id;
		});
		if (index >= 0) {
			scene.elements.splice(index, 1);
		}
	};
	// 元素获取宽度或者设置宽度（裁剪）
	this.Element.prototype.width = function(width) {
		width = parseInt(width);
		if (width && width > 0) {
			// 设置宽度，只用于裁剪
			for (let j = 0; j < this.vals.length; j++) {
				this.vals[j].splice(width);
			}
			return width;
		} else {
			// 获取宽度
			return Math.max.apply(null, this.vals.map((v) => {
				return v.length;
			}));
		}
	};
	// 元素获取高度或者设置高度（裁剪）
	this.Element.prototype.height = function(height) {
		height = parseInt(height);
		if (height && height > 0) {
			// 设置高度，只用于裁剪
			this.vals.splice(height);
			return height;
		} else {
			// 获取高度
			return this.vals.length;
		}
	};
	// 元素缩放
	this.Element.prototype.scale = function(x, y) {
		this.scaleX(+x);
		this.scaleY(+y);
	};
	// 元素横坐标缩放
	this.Element.prototype.scaleX = function(multiple, flag) {
		let i, j;
		let scaleY = this.scale_y;
		multiple = +multiple;

		if (this.valsCopy) {
			// 每次变换使用原始图案
			this.vals = JSON.parse(JSON.stringify(this.valsCopy));
		} else {
			// 首次使用时保存原图案副本
			this.valsCopy = JSON.parse(JSON.stringify(this.vals));
		}
		if (!flag) {
			// 使用原始图案重新缩放横坐标（避免失真），flag用于避免循环嵌套
			this.scaleY(this.scale_y, true);
		}
		if (multiple < 1) {
			for (j = 0; j < this.vals.length; j++) {
				for (i = 0; i < this.vals[j].length; i++) {
					[this.vals[j][Math.ceil(i * multiple)], this.vals[j][i]] = [this.vals[j][i], ' ']
				}
			}
			// 裁去缩小后的多余部分
			for (j = 0; j < this.vals.length; j++) {
				this.vals[j].splice(Math.ceil(this.vals[j].length * multiple));
			}
			this.scale_x = multiple;
		} else if (multiple > 1) {
			for (j = 0; j < this.vals.length; j++) {
				for (i = this.vals[j].length - 1; i > 0; i--) {
					[this.vals[j][Math.ceil(i * multiple)], this.vals[j][i]] = [this.vals[j][i], ' ']
				}
			}
			// 填充放大后的未定义像素
			for (j = 0; j < this.vals.length; j++) {
				for (i = this.vals[j].length - 1; i > 0; i--) {
					if (this.vals[j][i] === undefined) {
						this.vals[j][i] = ' ';
					}
				}
			}
			this.scale_x = multiple;
		} else {
			this.scale_x = 1;
			return;
		}
	}
	// 元素纵坐标缩放
	this.Element.prototype.scaleY = function(multiple, flag) {
		let i, j;
		multiple = +multiple;
		if (this.valsCopy) {
			// 每次变换使用原始图案
			this.vals = JSON.parse(JSON.stringify(this.valsCopy));
		} else {
			// 首次使用时保存原图案副本
			this.valsCopy = JSON.parse(JSON.stringify(this.vals));
		}
		if (!flag) {
			// 使用原始图案重新缩放纵坐标（避免失真），flag用于避免循环嵌套
			this.scaleX(this.scale_x, true);
		}
		let length = this.width();
		if (multiple < 1) {
			for (i = 0; i < length; i++) {
				for (j = 0; j < this.vals.length; j++) {
					[this.vals[Math.floor(j * multiple)][i], this.vals[j][i]] = [this.vals[j][i], ' '];
				}
			}
			// 裁去缩小后的多余部分
			this.vals.splice(Math.ceil(this.vals.length * multiple));
			for (j = 0; j < this.vals.length; j++) {
				for (i = 0; i < this.vals[j].length; i++) {
					if (this.vals[j][i] === undefined) {
						this.vals[j].splice(i);
						break;
					}
				}
			}
			this.scale_y = multiple;
		} else if (multiple > 1) {
			let colLength = this.vals.length;
			for (i = 0; i < length; i++) {
				for (j = colLength - 1; j >= 0; j--) {
					if (!this.vals[Math.floor(j * multiple)]) {
						this.vals[Math.floor(j * multiple)] = [];
					}
					[this.vals[Math.floor(j * multiple)][i], this.vals[j][i]] = [this.vals[j][i], ' '];
				}
			}
			// 填充放大后的未定义像素
			for (j = 0; j < this.vals.length; j++) {
				if (this.vals[j]) {
					for (i = 0; i < this.vals[j].length; i++) {
						if (this.vals[j][i] === undefined) {
							this.vals[j].splice(i);
							break;
						}
					}
				} else {
					this.vals[j] = [' '];
				}
			}
			this.scale_y = multiple;
		} else {
			this.scale_y = 1;
			return;
		}
	};
	// 元素组合
	this.Group = function() {
		// 组合标志
		this.isGroup = true;
		// 存放的子元素
		this.elements = [];
		// 组合位置
		this.position = {
			x: 0,
			y: 0
		};
		// 组合层叠优先级
		this.z_index = 0;
	};
	// 组合添加子元素
	this.Group.prototype.add = function(ele) {
		if (ele) {
			// 以数组形式添加多个子元素
			if (Object.prototype.toString.call(ele) === '[object Array]') {
				ele.forEach((item) => {
					this.elements.push(item);
					item.group = this;
				});
				return;
			}
			// 添加单个子元素
			this.elements.push(ele);
			ele.group = this;
		}
	};
	// 删除组合
	this.Group.prototype.remove = function() {
		this.elements.forEach((ele) => {
			ele.remove();
		})
	};
	// 渲染器
	this.Renderer = function() {
		this.width = 10;
		this.height = 10;
		this.canvas = [];
	};
	// 用于渲染的像素点
	this.Renderer.prototype.Pixel = function() {
		this.val = ' ';
		this.style = [];
		this.z_index = 0;
	};
	// 渲染画布的尺寸
	this.Renderer.prototype.setSize = function(width, height) {
		this.width = parseInt(width);
		this.height = parseInt(height);
		this.canvas = [];
		for (let j = 0; j < height; j++) {
			this.canvas.push(new Array(width));
			for (let i = 0; i < width; i++) {
				this.canvas[j][i] = new this.Pixel();
			}
		}
	};
	// 清除画布
	// x：开始清除的横坐标，y：开始清除的纵坐标，width：清除宽度，height：清除长度
	this.Renderer.prototype.clear = function(x = 0, y = 0, width, height) {
		width = parseInt(width ? width : this.width);
		height = parseInt(height ? height : this.height);
		for (let j = y; j < y + height && j < this.height; j++) {
			for (let i = x; i < x + width && i < this.width; i++) {
				this.canvas[j][i].val = ' ';
				this.canvas[j][i].style = [];
				this.canvas[j][i].z_index = 0;
			}
		}
	};
	// 输出像素字符到指定dom
	// target:目标dom, noStyle: 不显示样式, noBorder: 不显示左右边框
	this.Renderer.prototype.print = function(target, noStyle, noBorder) {
		let row = '';
		let style = [];
		let rows = '';
		let border = noBorder ? '' : '<span>|</span>';
		for (let j = 0; j < this.canvas.length; j++) {
			row = border;
			style = [];
			for (let i = 0; i < this.canvas[j].length; i++) {
				row += `<span style='${noStyle?"":this.canvas[j][i].style.join(";")}'>${this.canvas[j][i].val}</span>`;
			}
			rows += row + border + '</br>';
		}
		if (target) {
			target.innerHTML = rows;
		}
	};
	// 画布渲染
	this.Renderer.prototype.render = function(scene, noStyle, noBorder) {
		// 先清屏
		this.clear();
		// 逐个取出场景中的元素，计算位置后取值替换画布的对应的像素点
		scene.elements.forEach((ele, i) => {
			let style = ele.style.concat();
			let z_index = ele.z_index;
			let positionY = Math.floor(ele.position.y);
			let positionX = Math.floor(ele.position.x);
			if (ele.group) {
				// 从组合里的相对坐标转换为画布上的绝对坐标
				positionY += ele.group.position.y;
				positionX += ele.group.position.x;
				// 叠加上组合的层叠优先级
				z_index += ele.group.z_index;
			}
			for (let y = positionY; y < positionY + ele.vals.length; y++) {
				if (y >= 0 && y < this.height) {
					for (let x = positionX; x < positionX + ele.vals[y - positionY].length && x < this.width; x++) {
						if (x >= 0 && x < this.width) {
							// 层叠优先级大的元素会覆盖优先级小的元素
							if (z_index >= this.canvas[y][x].z_index && ele.vals[y - positionY][x - positionX] && ele.vals[y - positionY][x - positionX].toString().trim() != '') {
								this.canvas[y][x].val = ele.vals[y - positionY][x - positionX];
								this.canvas[y][x].style = style.concat();
								this.canvas[y][x].z_index = z_index;
							}
						}
					}
				}
			}
		});
		this.print(scene.target, noStyle, noBorder);
	};
}