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
		this.flipped = false;

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
		let x = this.x;
		if (this.flipped) {
			ctx.save();
			ctx.scale(-1, 1);
			x *= -1;
		}
		ctx.drawImage(this.img, this.sx, this.sy, this.sWidth, this.sHeight, x + this.offsetX, this.y + this.offsetY, this.width, this.height);
		if (this.flipped) {
			ctx.restore();
		}
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

class Plate extends GameObject{
	constructor(x, y, width, height, hitWidth, hitHeight){
		super(x, y, width, height, PLATE_IMG, 0);
		this.offsetX = -width/2;

		this.hitX = x - hitWidth/2;
		this.hitY = y + 12;
		this.hitWidth = hitWidth;
		this.hitHeight = hitHeight
	}

	updatePos(x, y) {
		this.x = x;
		this.y = y;
		this.hitX = x - this.hitWidth/2;
		this.hitY = y + 12;
	}

	drawHitbox() {
		ctx.beginPath();
		ctx.rect(this.hitX, this.hitY, this.hitWidth, this.hitHeight);
		ctx.stroke();
	}

	/*
	draw() {
		super.draw();
		this.drawHitbox();
	}
	*/
}

class Player extends GameObject{
	constructor(x, y, width, height, img){
		super(
			x,
			y - width/2 * PLAYER_SIZE,
			width * PLAYER_SIZE,
			height * PLAYER_SIZE,
			img,
			0
		);

		this.velX = 0;
		this.velY = 0;
		this.offsetX = -this.width/2;
		this.offsetY = -this.height + this.width/2;
		this.targetAng = 0;
		this.animTimer = 0;

		this.baseW = width * PLAYER_SIZE;
		this.baseH = height * PLAYER_SIZE;
		this.baseY = y;

		this.facing = "Right";
		this.speed = WALK_SPEED;
		this.isSliding = false;
		this.isMoving = false;

		this.plate = new Plate(
			this.x,
			this.y - 152,
			208 * PLAYER_SIZE,
			60 * PLAYER_SIZE,
			215 * PLAYER_SIZE,
			60 * PLAYER_SIZE
		);

		this.hitX;
		this.hitY;
		this.hitWidth;
		this.hitHeight;

		this.newX = this.x;
		this.newY = this.y;

		this.updateHitbox();
	}

	face(direction){
		if (!player.isSliding) {
			this.facing = direction;
			this.flipped = direction == "Left";
			this.plate.flipped = this.flipped;
		}
	}

	main(){
		this.move();
	}

	updatePlate() {
		let plateY = (- 152 + 40/90 * Math.abs(this.angle)) * PLAYER_SIZE;
		let plateX = 0;

		if (this.isSliding) {
			if (this.facing == "Left")
				plateX = 30 * PLAYER_SIZE;
			else
				plateX = -30 * PLAYER_SIZE;
		} else {
			plateY -= 1 * (this.height - this.baseH);
		}

		this.plate.updatePos(this.x + plateX, this.y + plateY);
	}

	animate() {
		if (this.velX != 0 && !this.isSliding) {
			let sine = Math.sin(this.animTimer * WALK_ANIM_SPEED);
			let stretch = 1 - WALK_ANIM_SCALE * sine;
			let squash = 1 + WALK_ANIM_SCALE * sine;

			this.width = this.baseW * squash;
			this.height = this.baseH * stretch;
			this.y = this.baseY - this.width/2;
		}
		else {
			this.width = this.baseW;
			this.height = this.baseH;
		}

		this.offsetX = -this.width/2;
		this.offsetY = -this.height + this.width/2;
		this.animTimer += 90 / timeScale;
	}

	draw(){
		this.animate();
		super.draw();
		this.plate.draw();
	}

	drawHitbox() {
		ctx.beginPath();
		ctx.rect(this.hitX, this.hitY, this.hitWidth, this.hitHeight);
		ctx.stroke();
	}

	updateHitbox(x, y){
		if (!this.isSliding) {
			this.hitX = x + this.offsetX;
			this.hitY = y + this.offsetY;
			this.hitWidth = this.baseW;
			this.hitHeight = this.baseH;
		} else {
			this.hitWidth = this.baseH;
			this.hitHeight = this.baseW;
			this.hitY = canvas.height - this.baseW;

			if (this.facing == "Left")
				this.hitX = x - this.baseW/2;
			else
				this.hitX = x + this.baseW/2 - this.baseH;
		}
	}

	move(){
		let speedBoost = (effects["speed_up"] ? 1.5 : 1);

		if(!this.isSliding){
			if(rightPressed){
				this.velX = this.speed * speedBoost;
			}
			else if(leftPressed){
				this.velX = -this.speed * speedBoost;
			}
			else{
				this.velX = 0;
			}
		}else{
			if(this.isSliding && player.facing == "Right"){
				this.velX = this.speed * speedBoost;
			}
			else if(this.isSliding && player.facing == "Left"){
				this.velX = -this.speed * speedBoost;
			}
		}

		this.newX = this.x + this.velX / timeScale;
		this.newY = this.y + this.velY / timeScale;
		this.angle += (this.targetAng - this.angle) * 0.4 / timeScale;

		this.updateHitbox(this.newX, this.newY);
		this.collision();

		this.x = this.newX;
		this.y = this.newY;
		
		this.updatePlate();
	}

	collision(){
		// Left Wall
		if(this.hitX < 0){
			if(this.isSliding && this.facing == "Left"){
				this.endSlide();
			}
			this.newX = 0 + this.newX - this.hitX;
		}

		// Right Wall
		if(this.hitX + this.hitWidth > canvas.width){
			if(this.isSliding && this.facing == "Right"){
				this.endSlide();
			}
			this.newX = canvas.width - this.hitWidth + this.newX - this.hitX;
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
		super(x, y, 0, 0, img, 5);

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
			toDelete.push(this);
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
		super(x, y, width, height, TOMATOES[type].img, -1);

		this.hp = TOMATOES[type].hp;

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
			this.velAng *= (1 - DECEL) ** (1 / timeScale);
			this.velX *= (1 - DECEL) ** (1 / timeScale);

			if (effects["magnet"]) {
				let dist = Math.abs(player.x - this.x);
				let force = MAGNET_STR * Math.log(dist);

				this.velX += force * (player.x - this.x) / dist;

				//this.velX += MAGNET_STR * (player.x - this.x);
			}
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
			if(this.velX != 0)
				findAudio("collision").play();
		}

		if(this.x + this.offsetX >= canvas.width - this.width){
			this.x = canvas.width - this.width / 2;
			this.velX = -this.velX;
			this.velAng += this.velY;
			if(this.velX != 0)
				findAudio("collision").play();
		}

		if(this.y + this.offsetY <= 0){
			this.y = 0 + this.height / 2;
			this.velY = -this.velY;
			this.velAng -= this.velY;
			findAudio("collision").play();
		}

		//Player
		let plate = player.plate;
		if (this.x + this.offsetX <= plate.hitX + plate.hitWidth
		&& this.y + this.offsetY <= plate.hitY + plate.hitHeight
		&& this.x + this.offsetX >= plate.hitX - this.width
		&& this.y + this.offsetY >= plate.hitY - this.height
		&& this.hasScored == false) {
			this.velY = MIN_BOUNCE + Math.random() * (MAX_BOUNCE - MIN_BOUNCE);
			this.velX += CONTROL * (this.x - (plate.hitX + plate.hitWidth / 2));
			this.velAng -= player.velX - this.velX;

			score += 10;
			incCombo(1);
			this.hasScored = true;
			findAudio("collision").play();

			if(tomatoes.length > 1 && this.hp > 0) {
				this.hp--;
				if (this.hp == 0){
					splattedTomatoes.push(this);
					findAudio("splat").play();
				} 
			}
		}

		if (this.velY > 0) {
			this.hasScored = false;
		}

		//Ground
		if (this.y - this.offsetY > canvas.height) {
			breakCombo();
			let splat = new Splat(this.x, this.y, this.width * 2, this.height * 0.75, TOMATOES[this.type].splatImg)
			findAudio("splat").play();
			objects.push(splat);
			splattedTomatoes.push(this);
		}
	}
}

class PowerUp extends GameObject {
	constructor(x, y, width, height, type){
		super(x, y, width, height, POWERUP_IMGS[POWERUP_TYPES.indexOf(type)], -1);

		this.baseW = width;
		this.velX = 0;
		this.velY = 0;
		this.type = type;

		this.offsetX = -this.width / 2;
		this.offsetY = -this.height / 2;

		this.animTimer = 0;
	}

	main(){
		if (this.animTimer < BLINK_DUR * NUM_BLINKS) {
			this.visible = this.animTimer / BLINK_DUR % 1 < 1/2;
		} else {
			this.visible = true;
			this.animate();

			this.y += POWERUP_SPEED / timeScale;
			this.collision();
		}

		this.animTimer += 90 / timeScale;
	}
	
	animate() {
		let sine = Math.sin(this.animTimer * SPIN_ANIM_SPEED);

		this.width = this.baseW * Math.abs(sine);
		this.flipped = sine < 0;

		this.offsetX = -this.width/2;
	}

	collision(){
		//Player
		let plate = player.plate;
		if (this.x + this.offsetX <= plate.hitX + plate.hitWidth
		&& this.x + this.offsetX >= plate.hitX - this.width
		&& this.y + this.offsetY >= plate.hitY - this.height) {

			this.hasScored = true;
			findAudio("powerup").play();

			switch (this.type) {
				case "speed_up":
				case "magnet":
					effects[this.type] = 7;
					break;
			}

			toDelete.push(this);
		}

		//Exited screen
		if (this.y + this.offsetY > canvas.height) {
			toDelete.push(this);
		}
	}
}