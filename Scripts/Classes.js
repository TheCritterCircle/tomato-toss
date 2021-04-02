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

		if (rightPressed || leftPressed || this.isSliding) {
			if(this.facing == "Right")
					this.velX = this.speed * speedBoost;
			if(this.facing == "Left")
					this.velX = -this.speed * speedBoost;
		} else {
			this.velX = 0;
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
				this.isSliding = true;
				this.speed = SLIDE_SPEED;

				if (this.facing == "Left")
					this.targetAng = 90;
				if (this.facing == "Right")
					this.targetAng = -90;
			}
		}
	}
	
	endSlide(){
		if (this.isSliding) {
			this.isSliding = false;
			this.speed = WALK_SPEED;
			this.targetAng = 0;

			if (leftPressed && this.facing == "Right")
				this.face("Left");
			if (rightPressed && this.facing == "Left")
				this.face("Right");
		}		
	}
}

class Splat extends GameObject{
	constructor(x, y, targetW, targetH, img){
		super(x, y, 0, 0, img, 5);

		this.targetW = targetW;
		this.targetH = targetH;
		this.alpha = 1;

		objects.push(this);
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

class PlateSplat extends Splat {
	constructor(x, y, targetW, targetH, img) {
		super(x, y, targetW, targetH, img);
		this.relX = x - player.plate.x;
		this.depth = -1;
	}

	main() {
		super.main();
		this.x = player.plate.x + this.relX;
		this.y = player.plate.y + 20;
	}
}

class Tomato extends GameObject{
	constructor(x, y, width, height, type){
		super(x, y, width, height, TOMATOES[type].img, -2 + 0.5 * Math.random());

		this.hp = TOMATOES[type].hp || -1;

		this.velX = 0;
		this.velY = 0;
		this.type = type;

		this.offsetX = -this.width / 2;
		this.offsetY = -this.height / 2;

		this.hitX = this.x + this.offsetX;
		this.hitY = this.y + this.offsetY;
		this.hitWidth = this.width;
		this.hitHeight = this.height;

		this.hasScored = false;
		this.animTimer = 0;
		this.isSpawning = true;
	}

	main(){
		let timeSpeed = effects["slow_time"] ? 0.75 : 1;

		if (this.isSpawning) {
			this.visible = this.animTimer / BLINK_DUR % 1 < 1/2;
			this.animTimer += 90 / timeScale;

			if (this.animTimer > BLINK_DUR * NUM_BLINKS)
				this.isSpawning = false;
		} else {
			this.visible = true;
			
			this.velX *= (1 - DECEL) ** (1 / timeScale * timeSpeed);
			this.velY += GRAVITY / timeScale * timeSpeed;
			this.velAng *= (1 - DECEL) ** (1 / timeScale * timeSpeed);
			
			this.x += this.velX / timeScale * timeSpeed;
			this.y += this.velY / timeScale * timeSpeed;
			this.angle += this.velAng / timeScale * timeSpeed;

			this.hitX = this.x + this.offsetX;
			this.hitY = this.y + this.offsetY;
			this.hitWidth = this.width;
			this.hitHeight = this.height;

			if (effects["magnet"]) {
				let dist = Math.abs(player.x - this.x);
				let force = MAGNET_STR * Math.log(dist);

				this.velX += force * (player.x - this.x) / dist;

				//this.velX += MAGNET_STR * (player.x - this.x);
			}

			this.collision();
		}
	}

	collision(){
		//Wall & Ceiling
		if(this.hitX <= 0){
			this.x = 0 + this.width / 2;
			this.velX = -this.velX;
			this.velAng -= this.velX;
			if(this.velX != 0)
				findAudio("collision").play();
		}

		if(this.hitX + this.hitWidth >= canvas.width) {
			this.x = canvas.width - this.width / 2;
			this.velX = -this.velX;
			this.velAng += this.velY;
			if(this.velX != 0)
				findAudio("collision").play();
		}

		if(this.hitY <= 0){
			this.y = 0 + this.height / 2;
			this.velY = -this.velY;
			this.velAng -= this.velY;
			findAudio("collision").play();
		}

		//Player
		let plate = player.plate;
		if (this.hitX <= plate.hitX + plate.hitWidth
		&& this.hitY <= plate.hitY + plate.hitHeight
		&& this.hitX + this.hitWidth >= plate.hitX
		&& this.hitY + this.hitHeight >= plate.hitY
		&& this.hasScored == false) {

			if (this.hp > 0) {
				this.hp--;
				if (this.hp == 0){
					score += TOMATOES[this.type].pinata_pts || 0;
					findAudio("splat").play();
					new PlateSplat(this.x, this.y, this.width * 2, this.height * 0.75, TOMATOES[this.type].splatImg);
					addItem("tomato");
					combo = 0;
					splattedTomatoes.push(this);
					return;
				} 
			}

			this.velY = MIN_BOUNCE + Math.random() * (MAX_BOUNCE - MIN_BOUNCE);
			this.velX += CONTROL * (this.x - (plate.hitX + plate.hitWidth / 2));
			this.velAng -= player.velX - this.velX;

			score += TOMATOES[this.type].bounce_pts || 0;
			incCombo(1);
			this.hasScored = true;
			findAudio("collision").play();
		}

		if (this.velY > 0) {
			this.hasScored = false;
		}

		//Ground
		if (this.hitY + this.hitHeight > canvas.height) {
			breakCombo();
			findAudio("splat").play();
			new Splat(this.x, this.y, this.width * 2, this.height * 0.75, TOMATOES[this.type].splatImg)
			splattedTomatoes.push(this);
		}
	}

	kill() {
		breakCombo();
		findAudio("splat").play();
		new Splat(this.x, this.y, this.width * 1.5, this.height * 1.5, TOMATOES[this.type].splatImg)
		splattedTomatoes.push(this);
	}
}

class PowerUp extends GameObject {
	constructor(x, y, width, height, type){
		super(x, y, width, height, POWERUP_IMGS[POWERUP_TYPES.indexOf(type)], -2);

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
				case "slow_time":
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

class Fork extends GameObject{
	constructor(x, y, width, height, hitWidth, hitHeight){
		super(x, y, width, height, FORK_IMG, -2);
		this.offsetX = -width/2;
		this.offsetY = -height + width/2;

		this.hitX = x - hitWidth/2;
		this.hitY = y - hitHeight/2;
		this.hitWidth = hitWidth;
		this.hitHeight = hitHeight;

		this.animTimer = 0;
		this.alpha = 1;

		this.isSpawning = true;
		this.onGround = false;
		this.onPlate = false;
		this.relX = 0;
	}

	main(){
		if (this.isSpawning) {
			this.visible = this.animTimer / BLINK_DUR % 1 < 1/2;
			this.animTimer += 90 / timeScale;

			if (this.animTimer > BLINK_DUR * NUM_BLINKS)
				this.isSpawning = false;
		} 
		else if (this.onGround || this.onPlate) {
			if (this.onPlate) {
				this.x = player.plate.x + this.relX;
				this.y = player.plate.y + 20;
			}

			if (this.alpha > 0) {
				// fades
				this.alpha -= 0.01 / timeScale;
			} else {
				// ends
				toDelete.push(this);
			}
		} 
		else {
			this.visible = true;
				
			this.y += FORK_SPEED / timeScale;
			this.hitY = this.y - this.hitWidth/2;
			this.collision();
		}
	}
	
	/*
	draw(){
		super.draw();
		this.drawHitbox();
	}
	*/

	collision(){
		//Plate
		let plate = player.plate;
		if (this.hitX <= plate.hitX + plate.hitWidth
		&& this.hitY <= plate.hitY + plate.hitHeight
		&& this.hitX + this.hitWidth >= plate.hitX
		&& this.hitY + this.hitHeight >= plate.hitY) {
			this.onPlate = true;
			this.relX = this.x - player.plate.x;
			this.depth = -1;
			this.animTimer = 0;
		}

		//Ground
		if (this.hitY + this.hitHeight > canvas.height) {
			this.ground = true;
			this.depth = 1;
			this.animTimer = 0;
		}

		//Tomatoes
		for (let t of tomatoes)
			if (!t.isSpawning
			&& this.hitX <= t.hitX + t.hitWidth
			&& this.hitY <= t.hitY + t.hitHeight
			&& this.hitX + this.hitWidth >= t.hitX
			&& this.hitY + this.hitHeight >= t.hitY) {
				t.kill();
			}
	}

	draw(){
		if (this.alpha > 0) {
			ctx.globalAlpha = this.alpha;
			super.draw();
			ctx.globalAlpha = 1;
		}
	}

	drawHitbox() {
		ctx.beginPath();
		ctx.rect(this.hitX, this.hitY, this.hitWidth, this.hitHeight);
		ctx.stroke();
	}
}