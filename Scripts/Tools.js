function findImage(name) {
	let img = new Image();
	img.src = "Sprites/" + name + ".png";
	return img;
}

function findSpecialImage(file, name) {
	try{
		let img = new Image();
		img.src = "Sprites/" + file + name + ".png";
		ctx.draw(img);
		return img;
	}
	catch(err) {
		return findImage(name);
	}
}

function findAudio(name) {
	return new Audio("Sounds/" + name + ".wav");
}

function getEventPos(e) {
	return {
		x: e.pageX - canvas.getBoundingClientRect().left,
		y: e.pageY - canvas.getBoundingClientRect().top,
	};
}

class GameObject {
	constructor(x, y, width, height, img, depth = 0) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.img = img;
		this.depth = depth;

		this.offsetX = 0;
		this.offsetY = 0;
		this.angle = 0;

		this.visible = true;
		this.flipped = false;
		this.alpha = 1;
	}
	
	main() {}

	draw() {
		if (!this.visible || this.alpha <= 0) return;
		if (this.sWidth == 0) this.sWidth = this.img.width;
		if (this.sHeight == 0) this.sHeight = this.img.height;
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle * Math.PI / 180);
		ctx.translate(-this.x, -this.y);
		let x = this.x;
		if (this.flipped) {
			ctx.save();
			ctx.scale(-1, 1);
			x *= -1;
		}
		ctx.globalAlpha = this.alpha;
		ctx.drawImage(this.img, x + this.offsetX, this.y + this.offsetY, this.width, this.height);
		ctx.globalAlpha = 1;
		if (this.flipped) {
			ctx.restore();
		}
		ctx.restore();
	}

	isTouching(other) {
		return this.hitX < other.hitX + other.hitWidth
		&& this.hitY < other.hitY + other.hitHeight
		&& this.hitX + this.hitWidth > other.hitX
		&& this.hitY + this.hitHeight > other.hitY
	}
}

class State {
    constructor() {
        this.background = new GameObject(0, 0, canvas.width, canvas.height, BACKGROUND_IMG);
        this.buttons = [];
        this.loopRequest;
        this.isActive = true;
    }

    start() {
        this.isActive = true;
        this.loop();
    }

    loop() {
        if (this.isActive) {
			getFPS();
            if (this.main) this.main();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (this.draw) this.draw();
            this.loopRequest = requestAnimationFrame(_ => {this.loop()}, 10);
        }
    }

    end() {
        this.isActive = false;
        if (this.loopRequest) cancelAnimationFrame(this.loopRequest);
    }

	checkHover(x, y){
		this.buttons.forEach(btn => {
			if (x > btn.baseX
			&& y > btn.baseY
			&& x < btn.baseX + btn.baseW
			&& y < btn.baseY + btn.baseH)
				btn.hover();
			else
				btn.reset();
		});
	}

	checkPress(x, y){
		this.buttons.forEach(btn => {
			if (x > btn.baseX
			&& y > btn.baseY
			&& x < btn.baseX + btn.baseW
			&& y < btn.baseY + btn.baseH)
				btn.press();
			else
				btn.reset();
		});
	}

    mouseDown(e) {
        let pos = getEventPos(e);
		this.checkPress(pos.x, pos.y);
	}

    mouseUp() {
        this.buttons.forEach(btn => {if (btn.pressed) btn.handleClick()})
		this.buttons.forEach(btn => {btn.reset()});
    }

    mouseMove(e) {
        //let pos = getEventPos(e);
		//this.checkHover(pos.x, pos.y);
    }

    touchStart(e) {
		this.mouseDown(e.changedTouches[0]);
	}

    touchEnd(e) {
		this.mouseUp(e.changedTouches[0]);
	}

    handlePause() {}
    keyDown() {}
    keyUp() {}

    main() {}
    draw() {}
}