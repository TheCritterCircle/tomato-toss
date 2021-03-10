class GameObject {
	constructor(x, y, width, height, img, depth = 0, sx = 0, sy = 0, sWidth = 0, sHeight = 0){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.offsetX = 0;
		this.offsetY = 0;
		this.angle = 0;
		this.visible = true;

		this.img = img;
		this.sx = sx;
		this.sy = sy;
		this.sWidth = sWidth;
		this.sHeight = sHeight;
		this.depth = depth;

		this.velX = 0;
		this.velY = 0;
		this.velAng = 0;
	}

	draw(){
		if (!this.visible) return;
		if (this.sWidth == 0) this.sWidth = this.img.width;
		if (this.sHeight == 0) this.sHeight = this.img.height;
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle * Math.PI / 180);
		ctx.translate(-this.x, -this.y);
		ctx.drawImage(this.img, this.sx, this.sy, this.sWidth, this.sHeight, this.x + this.offsetX, this.y + this.offsetY, this.width, this.height);
		ctx.restore();
	}

	drawMore(img, x, y, width, height, sx, sy, sWidth, sHeight){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle * Math.PI / 180);
		ctx.translate(-this.x, -this.y);
		ctx.drawImage(img, sx, sy, sWidth, sHeight, x + this.offsetX + this.x, y + this.offsetY + this.y, width, height);
		ctx.restore();
	}
}

class Player extends GameObject{
	constructor(x, y, width, height, img, sx, sy, sWidth, sHeight, hitX, hitY, hitWidth, hitHeight){
		super(x, y - width/2, width, height, img, 0, sx, sy, sWidth, sHeight);

		this.velX = 0;
		this.velY = 0;
		this.offsetX = -width/2;
		this.offsetY = -height + width/2;
		this.targetAng = 0;

		this.facing = "Right";
		this.speed = WALK_SPEED;
		this.isSliding = false;

		this.hitX;
		this.hitY;
		this.hitWidth;
		this.hitHeight;

		this.updateHitbox();
	}

	main(){
		this.move();
		this.updateHitbox();
		this.x += this.velX / timeScale;
		this.y += this.velY / timeScale;
		this.angle += (this.targetAng - this.angle) * 0.4 / timeScale;
		this.collision();
	}

	draw(){
		super.draw();
		this.drawMore(this.img, 27, 30, 80, 90, 63, 203, 40, 45);
	}

	drawHitbox() {
		ctx.beginPath();
		ctx.rect(this.hitX, this.hitY, this.hitWidth, this.hitHeight);
		ctx.stroke();
	}

	updateHitbox(){
		if (!this.isSliding) {
			this.hitX = this.x + this.offsetX;
			this.hitY = this.y + this.offsetY;
			this.hitWidth = this.width;
			this.hitHeight = this.height;
		} else {
			this.hitWidth = this.height;
			this.hitHeight = this.width;
			this.hitY = canvas.height - this.width;

			if (this.facing == "Left")
				this.hitX = this.x - this.width/2;
			else
				this.hitX = this.x + this.width/2 - this.height;
		}
	}

	move(){
		if(!this.isSliding){
			if(rightPressed){
				this.velX = this.speed;
			}
			else if(leftPressed){
				this.velX = -this.speed;
			}
			else{
				this.velX = 0;
			}
		}else{
			if(this.isSliding && player.facing == "Right"){
				this.velX = this.speed;
			}
			else if(this.isSliding && player.facing == "Left"){
				this.velX = -this.speed;
			}
		}
	}

	collision(){
		// Left Wall
		if(this.hitX < 0){
			if(this.isSliding && this.facing == "Left"){
				this.endSlide();
			}
			this.x = 0 + this.x - this.hitX;
		}

		// Right Wall
		if(this.hitX + this.hitWidth > canvas.width){
			if(this.isSliding && this.facing == "Right"){
				this.endSlide();
			}
			this.x = canvas.width - this.hitWidth + this.x - this.hitX;
		}
	}

	startSlide(){
		if (!this.isSliding) {
			if (this.hitX > 0 && this.hitX + this.hitWidth < canvas.width) {
				this.speed = SLIDE_SPEED;

				if (this.facing == "Left")
					this.targetAng = 90;
				else
					this.targetAng = -90;
				
				this.isSliding = true;
			}
		}
	}
	
	endSlide(){
		if (this.isSliding) {
			this.speed = WALK_SPEED;
			this.targetAng = 0;

			if (leftPressed)
				this.facing = "Left";
			else if (rightPressed)
				this.facing = "Right";
			
			this.isSliding = false;
		}		
	}
}

class Splat extends GameObject{
	constructor(x, y, targetW, targetH, img){
		super(x, y, 0, 0, img, 1);

		this.targetW = targetW;
		this.targetH = targetH;
		this.alpha = 1;
	}

	main(){
		if (this.width < this.targetW * 0.995) {
			// appears
			this.width += (this.targetW - this.width) * 0.2 / timeScale;
			this.height += (this.targetH - this.height) * 0.2 / timeScale;

			this.offsetX = -this.width / 2;
			this.offsetY = -this.height / 2;
		} else if (this.alpha > 0) {
			// fades
			this.alpha -= 0.01 / timeScale;
		} else {
			// ends
			finishedEffects.push(this);
		}
	}

	draw(){
		if (this.alpha > 0) {
			ctx.globalAlpha = this.alpha;
			super.draw();
			ctx.globalAlpha = 1;
		}
	}
}

class Tomato extends GameObject{
	constructor(x, y, width, height, type){
		super(x, y, width, height, TOMATO_IMGS[type], -1);

		this.velX = 0;
		this.velY = 0;
		this.type = type;

		this.offsetX = -this.width / 2;
		this.offsetY = -this.height / 2;

		this.hasScored = false;
		this.animTimer = 0;
	}

	main(){
		if (this.animTimer < BLINK_DUR * NUM_BLINKS) {
			this.visible = this.animTimer / BLINK_DUR % 1 < 1/2;
			this.animTimer += 90 / timeScale;
		} else {
			this.visible = true;
			this.gravity();
			this.collision();

			this.x += this.velX / timeScale;
			this.y += this.velY / timeScale;
			this.angle += this.velAng / timeScale;
			this.velAng *= 0.995 ** (1 / timeScale);
			this.velX *= 0.995 ** (1 / timeScale);

		}
	}

	gravity(){
		this.velY += GRAVITY / timeScale;
	}

	collision(){
		//Wall & Ceiling
		if(this.x + this.offsetX <= 0){
			this.x = 0 + this.width / 2;
			this.velX = -this.velX;
			this.velAng -= this.velX;
		}

		if(this.x + this.offsetX >= canvas.width - this.width){
			this.x = canvas.width - this.width / 2;
			this.velX = -this.velX;
			this.velAng += this.velY;
		}

		if(this.y + this.offsetY <= 0){
			this.y = 0 + this.height / 2;
			this.velY = -this.velY;
			this.velAng -= this.velY;
		}

		//Player
		if (this.x + this.offsetX <= player.hitX + player.hitWidth
		&& this.x + this.offsetX >= player.hitX - this.width
		&& this.y + this.offsetY >= player.hitY - this.height
		&& this.hasScored == false) {
			this.velY = MIN_BOUNCE + Math.random() * (MAX_BOUNCE - MIN_BOUNCE);
			this.velX += CONTROL * (this.x - (player.hitX + player.hitWidth / 2));
			this.velAng -= player.velX - this.velX;

			score += 10;
			combo += 1;
			this.hasScored = true;
		}

		if (this.velY > 0) {
			this.hasScored = false;
		}

		//Ground
		if (this.y - this.offsetY > canvas.height) {
			combo = 0;
			let splat = new Splat(this.x, this.y, this.width * 2, this.height * 0.75, SPLAT_IMGS[this.type])
			objects.push(splat);
			splattedTomatoes.push(this);
		}
	}
}