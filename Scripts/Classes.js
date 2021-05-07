class GameObject {
	constructor(x, y, width, height, img, depth = 0){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.offsetX = 0;
		this.offsetY = 0;
		this.angle = 0;
		this.visible = true;
		this.flipped = false;
		this.alpha = 1;

		this.img = img;
		this.depth = depth;
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
}

class Button extends GameObject{
	constructor(x, y, width, height, img, handleClick){
		super(x, y, width, height, img)
		this.handleClick = handleClick;
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
}

class Player extends GameObject{
	constructor(x, y, width, height){
		super(
			x,
			y - width/2 * PLAYER_SIZE,
			width * PLAYER_SIZE,
			height * PLAYER_SIZE,
			PLAYER_IMG,
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

		this.facing = 1;
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

		this.updateHitbox();
	}

	face(direction){
		if (!player.isSliding) {
			this.facing = direction;
			this.flipped = direction === -1;
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
			plateX = -30 * PLAYER_SIZE * this.facing;
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

			if (this.facing === 1)
				this.hitX = x + this.baseW/2 - this.baseH;
			else
				this.hitX = x - this.baseW/2;
		}
	}

	move(){
		let speedBoost = (effects.speed_up ? 1.5 : 1);
		let newX = this.x, newY = this.y;

		if (rightPressed || leftPressed || this.isSliding) {
			this.velX = this.speed * this.facing * speedBoost;
			if (effects.mirror) this.velX *= -1;
		} else {
			this.velX = 0;
		}

		newX = this.x + this.velX / timeScale;
		newY = this.y + this.velY / timeScale;
		this.angle += (this.targetAng - this.angle) * 0.4 / timeScale;

		this.updateHitbox(newX, newY);
		newX = this.collision(newX);

		this.x = newX, this.y = newY;
		this.updatePlate();
	}

	collision(newX){
		// Left Wall
		if(this.hitX < 0){
			if(this.isSliding && this.facing === -1){
				this.endSlide();
			}
			newX = 0 + newX - this.hitX;
		}

		// Right Wall
		if(this.hitX + this.hitWidth > canvas.width){
			if(this.isSliding && this.facing === 1){
				this.endSlide();
			}
			newX = canvas.width - this.hitWidth + newX - this.hitX;
		}
		return newX;
	}

	startSlide(){
		if (!this.isSliding) {
			if (this.hitX > 0 && this.hitX + this.hitWidth < canvas.width) {
				this.isSliding = true;
				this.speed = SLIDE_SPEED;
				this.targetAng = -90 * this.facing;
			}
		}
	}
	
	endSlide(){
		if (this.isSliding) {
			this.isSliding = false;
			this.speed = WALK_SPEED;
			this.targetAng = 0;

			if (leftPressed && this.facing === 1)
				this.face(-1);
			if (rightPressed && this.facing === -1)
				this.face(1);
		}		
	}
}

class Splat extends GameObject{
	constructor(x, y, targetW, targetH, img){
		super(x, y, 0, 0, img, 5);

		this.targetW = targetW;
		this.targetH = targetH;

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
		this.velAng = 0;
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

		this.beenHit = false;
		this.fork = null;
		this.relX, this.relY;
		this.timeLeft = -1;
	}

	main(){
		let timeSpeed = effects.slow_time ? 0.75 : 1;

		if (this.isSpawning) {
			this.visible = this.animTimer / BLINK_DUR % 1 < 1/2;
			this.animTimer += 90 / timeScale;

			if (this.animTimer > BLINK_DUR * NUM_BLINKS)
				this.isSpawning = false;
		} else {
			this.visible = true;

			if (this.fork != null) {
				this.y = this.fork.y + this.relY;
				this.x = this.fork.x + this.relX;
			} else {
				this.velY += GRAVITY / timeScale * timeSpeed;
				if (effects.magnet) this.beAtracted();
			}
			
			this.x += this.velX / timeScale * timeSpeed;
			this.y += this.velY / timeScale * timeSpeed;
			this.angle += this.velAng / timeScale * timeSpeed;

			this.hitX = this.x + this.offsetX;
			this.hitY = this.y + this.offsetY;
			this.hitWidth = this.width;
			this.hitHeight = this.height;

			this.velX *= (1 - DECEL) ** (1 / timeScale * timeSpeed);
			this.velAng *= (1 - DECEL) ** (1 / timeScale * timeSpeed);

			this.collision();
		}

		if (this.timeLeft >= 0) {
			this.timeLeft -= 90 / timeScale;
			if (this.timeLeft < 0) {
				score += 5*TOMATOES[this.type].bounce_pts || 0;
				score += TOMATOES[this.type].pinata_pts || 0;
				this.splat();
			}
		}
	}

	beAtracted(){
		let timeSpeed = effects.slow_time ? 0.75 : 1;
		let dist = Math.abs(player.x - this.x);
		let force = MAGNET_STR * Math.log(dist);

		this.velX += force * (player.x - this.x) / timeScale * timeSpeed / dist;

		//this.velX += MAGNET_STR * (player.x - this.x);
	}

	stickTo(fork){
		this.velX = 0;
		this.velY = 0;
		this.velAng = 0;
		this.hp = 1;

		this.fork = fork;
		this.beenHit = true;

		let relX = this.x - fork.x;
		let relY = this.y - fork.y;

		let rel =
			relX * Math.sin(fork.direction) +
			relY * Math.cos(fork.direction);
		
		this.relX = rel * Math.sin(fork.direction);
		this.relY = rel * Math.cos(fork.direction);
	}

	detach(){
		this.fork = null;
	}

	collision(){
		//Wall & Ceiling
		if(this.hitX <= 0){
			if(spikesLeft){
				this.splat();
			}
			else{
				this.x = 0 + this.width / 2;
				this.velX = -this.velX;
				this.velAng -= this.velX;
				if(this.velX != 0)
					findAudio("collision").play();
			}
		}

		if(this.hitX + this.hitWidth >= canvas.width) {
			if(spikesRight){
				this.splat();
			}
			else{
				this.x = canvas.width - this.width / 2;
				this.velX = -this.velX;
				this.velAng += this.velY;
				if(this.velX != 0)
					findAudio("collision").play();
			}
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
					if (!this.beenHit) addTomato("random");
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

	splat() {
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
				default:
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
	constructor(x, y, width, height, hitWidth, hitHeight, direction){
		super(x, y, width, height, FORK_IMG, -2);
		this.offsetX = -width/2;
		this.offsetY = -height + width/2;

		this.hitX = x - hitWidth/2;
		this.hitY = y - hitHeight/2;
		this.hitWidth = hitWidth;
		this.hitHeight = hitHeight;

		this.animTimer = 0;

		this.isSpawning = true;
		this.onGround = false;
		this.onPlate = false;
		this.relX = 0;

		this.tomatoes = [];
		this.direction = direction;
		this.angle = direction * 180 / Math.PI - 90;
	}

	main(){
		let timeSpeed = effects.slow_time ? 0.75 : 1;

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
			
			let dr = FORK_SPEED / timeScale;
			this.x += dr * Math.cos(this.direction) * timeSpeed;
			this.y += dr * Math.sin(this.direction) * timeSpeed;
	
			this.hitX = this.x - this.hitWidth/2;
			this.hitY = this.y - this.hitHeight/2;
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
		//Tomatoes
		for (let t of tomatoes)
			if (!t.isSpawning
			&& t.fork == null
			&& this.hitX <= t.hitX + t.hitWidth
			&& this.hitY <= t.hitY + t.hitHeight
			&& this.hitX + this.hitWidth >= t.hitX
			&& this.hitY + this.hitHeight >= t.hitY) {
				t.stickTo(this);
				this.tomatoes.push(t);
			}
		
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
			this.tomatoes.forEach(t => {t.detach()})
		}

		//Ground
		if (this.hitY + this.hitHeight > canvas.height) {
			this.ground = true;
			this.depth = 1;
			this.animTimer = 0;
			this.tomatoes.forEach(t => {t.detach()})
		}
	}

	drawHitbox() {
		ctx.beginPath();
		ctx.rect(this.hitX, this.hitY, this.hitWidth, this.hitHeight);
		ctx.stroke();
	}
}

class Spikes extends GameObject{
	constructor(isRight){
		if(isRight == true){
			super(canvas.width, 0, 100, 480, BW_SPIKE_IMG, 10);
			rightSpikes = this;
			this.warningsign = new GameObject(canvas.width - 200, canvas.height / 2 + 50, 100, 100, WARNING, 50);
			//objects.push(this.warningsign);
		}
		else{
			super(-100, 0, 100, 480, SPIKE_IMG, 10);
			leftSpikes = this;
			this.warningsign = new GameObject(200, canvas.height / 2 + 50, 100, 100, WARNING, 50);
			//objects.push(this.warningsign);
		}
		this.warningflash = setInterval(function(){
			if(this.warningsign.visible){
				this.warningsign.visible = false;
			}
			else{
				this.warningsign.visible = true;
			}
		}, BLINK_DUR / NUM_BLINKS * timeScale);

		this.stopwarningflash = setTimeout(function(){
			clearInterval(this.warningflash);
			this.closingin = true;
		}, BLINK_DUR * timeScale);

		this.closingin = false;
		this.isRight = isRight;
	}

	main(){
		if(!this.isRight){
			if(this.closingin){
				this.x += (5 * timeScale);
				if(this.x > 100){
					this.closingin = false;
					spikesLeft = true;
				}
			}
		}
		else{
			if(this.closingin){
				this.x -= (5 * timeScale);
				if(this.x < canvas.width - 100){
					this.closingin = false;
					spikesRight = true;
				}
			}
		}
	}

	stop(){

	}
}