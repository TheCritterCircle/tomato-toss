function findImage(name) {
	let img = new Image();
	img.src = "Sprites/" + name + ".png";
	return img;
}

function findSpecialImage(file, name){
	try{
		let img = new Image();
		img.src = "Sprites/" + file + name + ".png";
		ctx.draw(img);
		return img;
	}
	catch(err){
		return findImage(name);
	}
}

function findAudio(name) {
	return new Audio("Sounds/" + name + ".wav");
}

class GameObject {
	constructor(x, y, width, height, img, depth = 0){
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
	
	main(){}

	draw(){
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
    constructor(){
        this.background = new GameObject(0, 0, canvas.width, canvas.height, BACKGROUND_IMG);
        this.buttons = [];
        this.mainRequest;
        this.drawRequest;
        this.isActive = true;
    }

    mainLoop() {
        if (this.isActive) {
            this.main();
            this.mainRequest = requestAnimationFrame(_ => {this.mainLoop()}, 10);
        }
    }

    drawLoop() {
        if (this.isActive) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.draw();
            this.drawRequest = requestAnimationFrame(_ => {this.drawLoop()}, 10);
        }
    }

    start(){
        this.isActive = true;
        if (this.main) this.mainLoop();
        if (this.draw) this.drawLoop();
    }

    end(){
        this.isActive = false;
        if (this.mainRequest) cancelAnimationFrame(this.mainRequest);
        if (this.drawRequest) cancelAnimationFrame(this.drawRequest);
    }
    
    main(){getFPS()}
    draw(){}

    getEventPos(e){
        return {
            x: e.pageX - canvas.getBoundingClientRect().left,
            y: e.pageY - canvas.getBoundingClientRect().top,
        };
    }

    clickButton(x, y){
        this.buttons.forEach(btn => {
            if (x > btn.x &&
                y > btn.y &&
                x < btn.x + btn.width &&
                y < btn.y + btn.height
            ) btn.handleClick();
        })
    }

    mouseDown(e){
        let pos = this.getEventPos(e);
        this.clickButton(pos.x, pos.y);
    }

    touchDown(e){this.mouseDown(e.touches[0])}
    handlePause(){}
    keyDownHandler(){}
    keyUpHandler(){}
}