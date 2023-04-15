class Button extends GameObject{
	constructor(x, y, width, height, img, handleClick) {
		super(x, y, width, height, img)
		if (this.visible) this.handleClick = handleClick;
		this.baseX = x, this.baseY = y;
		this.baseW = width, this.baseH = height;
		this.hovered = false;
		this.pressed = false;
	}

	press() {
		if (!this.pressed) {
			this.width = 0.95 * this.baseW;
			this.height = 0.95 * this.baseH;
			this.x = this.baseX - (this.width - this.baseW) / 2
			this.y = this.baseY - (this.height - this.baseH) / 2
			this.pressed = true;
		}
	}

	hover() {
		if (!this.hovered) {
			this.width = 1.1 * this.baseW;
			this.height = 1.1 * this.baseH;
			this.x = this.baseX - (this.width - this.baseW) / 2
			this.y = this.baseY - (this.height - this.baseH) / 2
			this.hovered = true;
		}
	}

	reset() {
		if (this.pressed || this.hovered) {
			this.x = this.baseX, this.y = this.baseY;
			this.width = this.baseW, this.height = this.baseH;
			this.hovered = false;
			this.pressed = false;
		}
	}
}

class Plate extends GameObject{
	constructor(x, y, width, height, hitWidth, hitHeight) {
		super(x, y, width, height, PLATE_IMG, 0);
		this.offsetX = -width/2;
		
		this.hitWidth = hitWidth;
		this.hitHeight = hitHeight;
		this.updatePos(x, y);
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
	constructor(x, y, width, height) {
		super(
			x, y - width/2 * PLAYER_SIZE,
			width * PLAYER_SIZE, height * PLAYER_SIZE,
			PLAYER_IMG
		);

		this.baseX = x;
		this.baseY = y;
		this.baseW = width * PLAYER_SIZE;
		this.baseH = height * PLAYER_SIZE;

		this.velX = 0, this.velY = 0;
		this.offsetX = -this.width/2;
		this.offsetY = -this.height + this.width/2;
		this.targetAng = 0;
		this.animTimer = 0;

		this.updateHitbox();

		this.facing = 1;
		this.speed = WALK_SPEED;
		this.isSliding = false;

		this.plate = new Plate(
			this.x, this.y - 152,
			208 * PLAYER_SIZE, 60 * PLAYER_SIZE,
			215 * PLAYER_SIZE, 60 * PLAYER_SIZE
		);
		this.spdGhosts = [];
		this.effectIcon = new GameObject(0, 0, 50, 50, FORK_IMG);
		this.effectIcon.alpha = 0.75;
		this.effectIcon.offsetX = -this.effectIcon.width/2;
		this.effectIcon.offsetY = -this.effectIcon.height/2;
	}

	face(direction) {
		if (!this.isSliding) {
			this.facing = direction;
			this.flipped = direction === -1;
			this.plate.flipped = this.flipped;
		}
	}

	main() {
		this.move();
		this.speedImages();
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

	draw() {
		this.animate();
		this.spdGhosts.forEach(o => {o.draw()});
		super.draw();
		this.plate.draw();

		this.effectIcon.x = this.plate.x - 30 * (Object.keys(effects).length - 1);
		this.effectIcon.y = this.plate.y - 40;
		this.drawEffects(Object.keys(effects));
	}

	drawEffects(toDraw) {
		toDraw.forEach(e => {
			this.effectIcon.img = POWERUP_IMGS[POWERUP_TYPES.indexOf(e)];
			if (effects[e] < 0 || effects[e] > 1 || effects[e] % 0.2 < 0.1) {
				this.effectIcon.draw();
			}
			this.effectIcon.x += 60;
		})
	}

	drawHitbox() {
		ctx.beginPath();
		ctx.rect(this.hitX, this.hitY, this.hitWidth, this.hitHeight);
		ctx.stroke();
	}

	updateHitbox(x, y) {
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

	move() {
		let speedBoost = (effects.speed_up ? 1.5 : 1);

		if (rightPressed || leftPressed || this.isSliding) {
			this.velX = this.speed * this.facing * speedBoost;
			if (effects.mirror) this.velX *= -1;
		} else {
			this.velX = 0;
		}

		this.baseX = this.baseX + this.velX / timeScale;
		this.baseY = this.baseY + this.velY / timeScale;
		this.angle += (this.targetAng - this.angle) * 0.4 / timeScale;

		this.updateHitbox(this.baseX, this.baseY);
		this.collision();

		this.x = this.baseX;
		this.y = this.baseY - this.width/2;
		this.updatePlate();
	}

	collision() {
		// Left Wall
		if(this.hitX < 0) {
			if(this.isSliding && this.facing === -1) {
				this.endSlide();
			}
			this.baseX = 0 + this.baseX - this.hitX;
		}

		// Right Wall
		if(this.hitX + this.hitWidth > canvas.width) {
			if(this.isSliding && this.facing === 1) {
				this.endSlide();
			}
			this.baseX = canvas.width - this.hitWidth + this.baseX - this.hitX;
		}
	}

	startSlide() {
		if (!this.isSliding) {
			if (this.hitX > 0 && this.hitX + this.hitWidth < canvas.width) {
				this.isSliding = true;
				this.speed = SLIDE_SPEED;
				this.targetAng = -90 * this.facing;
			}
		}
	}
	
	endSlide() {
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

	speedImages() {
		if (effects.speed_up) {
			if (this.spdGhosts.length < MAX_GHOSTS) {
				let newGhost = new GameObject(
					0, this.y, this.width, this.height, SPD_GHOST_IMG,
				);
				newGhost.offsetX = this.offsetX;
				newGhost.offsetY = this.offsetY;
				newGhost.alpha = 1 - this.spdGhosts.length/MAX_GHOSTS;
				this.spdGhosts.unshift(newGhost);
			}

			let n = this.spdGhosts.length;
			for (let i=0; i<n-1; i++) {
				this.spdGhosts[i].x = this.spdGhosts[i+1].x;
				this.spdGhosts[i].angle = this.spdGhosts[i+1].angle;
				this.spdGhosts[i].flipped = this.spdGhosts[i+1].flipped;
			}
			this.spdGhosts[n-1].x = this.x - this.velX;
			this.spdGhosts[n-1].angle = this.angle;
			this.spdGhosts[n-1].flipped = this.flipped;
		} else {
			this.spdGhosts = [];
		}
	}
}

class Splat extends GameObject{
	constructor(x, y, targetW, targetH, img) {
		super(x, y, 0, 0, img, 5);

		this.targetW = targetW;
		this.targetH = targetH;

		objects.push(this);
	}

	main() {
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
	constructor(x, y, width, height, type) {
		super(x, y, width, height, TOMATOES[type].img, -2 + 0.5 * Math.random());

		this.type = type;
		this.hp = this.get("hp") || -1;

		this.velX = 0;
		this.velY = 0;
		this.velAng = 0;

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

	main() {
		let timeSpeed = effects.slow_time ? 0.75 : 1;

		if (this.isSpawning) {
			this.visible = this.animTimer / BLINK_DUR % 1 < 1/2;
			this.animTimer += delta;

			if (this.animTimer > BLINK_DUR * NUM_BLINKS)
				this.isSpawning = false;
				this.velX = Math.random() * 2;
				if(this.x > canvas.width / 2){
					this.velX *= -1;
				}
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

			if (this.type == "banana") {
				let newVel = rotVector(this.velX, this.velY, this.get("spin") * this.velAng / timeScale * timeSpeed);
				this.velX, this.velY = newVel.x, newVel.y;
			}
			
			this.velAng *= 0.99 ** (1 / timeScale * timeSpeed);
			this.velX *= 0.99 ** (1 / timeScale * timeSpeed);				

			this.collision();
		}

		if (this.timeLeft >= 0) {
			this.timeLeft -= 90 / timeScale;
			if (this.timeLeft < 0) {
				addPoints(
					5 * this.get("bounce_pts") || 0 + this.get("pinata_pts") || 0,
					this.x, this.y
				);
				this.splat();
			}
		}
	}
	
	get(property) {
		return TOMATOES[this.type][property];
	}

	beAtracted() {
		let timeSpeed = effects.slow_time ? 0.75 : 1;
		let diff = player.x - this.x

		let force = Math.sign(diff) * MAGNET_STR * Math.log(1+Math.abs(diff));
		this.velX += force / timeScale * timeSpeed;

		//this.velX += MAGNET_STR * (player.x - this.x);
	}

	stickTo(fork) {
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

	detach() {
		this.fork = null;
	}

	collision() {
		//Wall & Ceiling
		if(this.hitX <= 0) {
			if(spikesLeft) {
				this.splat();
			}
			else{
				this.x = 0 + this.width / 2;
				this.velX = -this.velX;
				this.velAng -= this.velX;
				if(this.velX != 0)
					//findAudio("collision").play();
					playSound("collision");
			}
		}

		if(this.hitX + this.hitWidth >= canvas.width) {
			if(spikesRight) {
				this.splat();
			}
			else{
				this.x = canvas.width - this.width / 2;
				this.velX = -this.velX;
				this.velAng += this.velY;
				if(this.velX != 0)
					//findAudio("collision").play();
					playSound("collision");
			}
		}

		if(this.hitY <= 0) {
			this.y = 0 + this.height / 2;
			this.velY = -this.velY;
			this.velAng -= this.velY;
			//findAudio("collision").play();
			playSound("collision");
		}

		//Player
		if (this.isTouching(player.plate) && !this.hasScored) {
			if (this.hp > 0) {
				this.hp--;
				if (this.hp == 0) {
					addPoints(this.get("pinata_pts") || this.get("bounce_pts") || 0,
						this.x, this.y)
					//findAudio("splat").play();
					playSound("splat");
					new PlateSplat(this.x, this.y, this.width * 2, this.height * 0.75, this.get("splatImg"));
					if (!this.beenHit) addTomato();
					combo = 0;
					splattedTomatoes.push(this);
					return;
				} 
			}

			this.velX += CONTROL * (this.x - (player.plate.hitX + player.plate.hitWidth / 2));
			//Gets lowest (lower means higher) number between max bounce or based on velX.
			this.velY = Math.max(MIN_BOUNCE - Math.abs(1/this.velX), MAX_BOUNCE)
			this.velAng -= 2 * player.velX - this.velX;

			addPoints(this.get("bounce_pts") || 0, this.x, this.y);
			incCombo(1);
			this.hasScored = true;
			//findAudio("collision").play();
			playSound("collision");
		}

		if (this.velY > 0) {
			this.hasScored = false;
		}

		//Ground
		if (this.hitY + this.hitHeight > canvas.height) {
			breakCombo();
			//findAudio("splat").play();
			playSound("splat");
			new Splat(this.x, this.y, this.width * 2, this.height * 0.75, this.get("splatImg"))
			splattedTomatoes.push(this);
		}
	}

	splat() {
		//findAudio("splat").play();
		playSound("splat");
		new Splat(this.x, this.y, this.width * 1.5, this.height * 1.5, this.get("splatImg"))
		splattedTomatoes.push(this);
	}
}

class PowerUp extends GameObject {
	constructor(x, y, width, height, type, isMystery) {
		super(x, y, width, height, POWERUP_IMGS[POWERUP_TYPES.indexOf(type)], -2);

		this.offsetX = -this.width/2;
		this.offsetY = -this.height/2;
		this.baseW = width;

		this.hitX = this.x + this.offsetX;
		this.hitY = this.y + this.offsetY;
		this.hitWidth = this.width;
		this.hitHeight = this.height;

		this.velX = 0;
		this.velY = 0;
		this.animTimer = 0;

		this.type = type;
		if (isMystery) this.img = POWERUP_IMGS[POWERUP_TYPES.indexOf("mystery")];
	}

	main() {
		if (this.animTimer < BLINK_DUR * NUM_BLINKS) {
			this.visible = this.animTimer / BLINK_DUR % 1 < 1/2;
		} else {
			this.visible = true;
			this.animate();

			this.y += POWERUP_FALL_SPEED / timeScale;
			this.hitY = this.y + this.offsetY;
			this.collision();
		}

		this.animTimer += delta;
	}
	
	animate() {
		let sine = Math.sin(this.animTimer * POWERUP_SPIN_SPEED);

		this.width = this.baseW * Math.abs(sine);
		this.flipped = sine < 0;

		this.offsetX = -this.width/2;
	}

	collision() {
		//Player
		if (this.isTouching(player.plate)) {
			switch (this.type) {
				case "coin":
					addPoints(COIN_POINTS, this.x, this.y, "+"+COIN_POINTS, "#FFD700");
					break;

				default:
					let quality = POWERUPS[this.type].quality;
					let color = quality > 0 ? "#0080f0" : quality < 0 ? "#800000" : "#808080";
					let text = POWERUPS[this.type].name + "!";
					objects.push(new GhostText(this.x, this.y, text, color));
					effects[this.type] = 7;
					break;
			}

			//findAudio("powerup").play();
			playSound("powerup");
			toDelete.push(this);
		}

		//Fell off screen
		if (this.y + this.offsetY > canvas.height)
			toDelete.push(this);
	}
}

class Fork extends GameObject{
	constructor(x, y, size, direction) {
		super(x, y, 50, 75, FORK_IMG, -2);
		this.offsetX = -25*size;
		this.offsetY = -50*size;

		this.hitX = x - 15*size;
		this.hitY = y - 15*size;
		this.hitWidth = 30*size;
		this.hitHeight = 30*size;

		this.animTimer = 0;

		this.isSpawning = true;
		this.onGround = false;
		this.onPlate = false;
		this.relX = 0;

		this.tomatoes = [];
		this.direction = direction;
		this.angle = direction * 180 / Math.PI - 90;
	}

	main() {
		let timeSpeed = effects.slow_time ? 0.75 : 1;

		if (this.isSpawning) {
			this.visible = this.animTimer / BLINK_DUR % 1 < 1/2;
			this.animTimer += delta;

			if (this.animTimer > BLINK_DUR * NUM_BLINKS)
				this.isSpawning = false;
		} 
		else if (this.onGround || this.onPlate) {
			if (this.onPlate) {
				this.x = player.plate.x + this.relX;
				this.y = player.plate.hitY - this.height - this.offsetY;
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

	collision() {
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
		if (this.isTouching(player.plate)) {
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

class BigText {
	constructor(text) {
		this.text = text;
		this.depth = -10, this.timer = 2;
	}

	draw() {
		ctx.fillStyle = "#000000";
		ctx.font = "70px Arial";
		ctx.textAlign = "center";
		ctx.fillText(this.text, canvas.width/2, canvas.height/2);
		ctx.textAlign = "left";
	}

	main() {
		this.timer -= delta;
		if (this.timer < 0) toDelete.push(this);
	}
}

class GhostText {
	constructor(x, y, text, color) {
		this.x = x, this.y = y;
		this.text = text;
		this.color = color;
		this.depth = -5, this.alpha = 255;
	}

	draw() {
		let alphaHex = Math.floor(this.alpha).toString(16);
		while (alphaHex.length < 2) alphaHex = "0" + alphaHex;
		
		ctx.fillStyle = this.color + alphaHex;
		ctx.font = "30px Arial";
		ctx.textAlign = "center";
		ctx.fillText(this.text, this.x, this.y);
		ctx.textAlign = "left";
	}

	main() {
		this.alpha -= 2/timeScale;
		this.y -= 0.2/timeScale;
		if (this.alpha < 0) toDelete.push(this);
	}
}

class Spikes extends GameObject{
	constructor(isRight) {
		super(isRight ? canvas.width + 100 : -100, 0, 100, 480, SPIKE_IMG, 10);
		this.warningsign = new GameObject(isRight ? canvas.width - 150 : 50, canvas.height / 2 - 50, 100, 100, WARNING, 50);
		
		if (isRight) {
			this.flipped = true;
			rightSpikes = this;
		} else {
			leftSpikes = this;
		}

		this.isRight = isRight;
		this.state = "spawning";
		this.timer = 0;
	}

	draw() {
		if (this.state === "spawning")
			this.warningsign.draw();
		else
			super.draw();
	}

	main() {
		if (this.state === "spawning") {
			this.warningsign.visible = this.timer / BLINK_DUR % 1 < 1/2;
			this.timer += delta;

			if (this.timer > BLINK_DUR * NUM_BLINKS) {
				delete this.warningsign;
				this.state = "extending";
			}
		}

		if (this.state === "extending") {
			if (this.isRight) {
				this.x -= 10 * timeScale;
				if (this.x < canvas.width) {
					this.x = canvas.width;
					this.state = "active";
					this.timer = 2 * level;
					spikesRight = true;
				}
			}
			else {
				this.x += 10 * timeScale;
				if (this.x > 0) {
					this.x = 0;
					this.state = "active";
					this.timer = 2 * level;
					spikesLeft = true;
				}
			}
		}

		if (this.state === "active") {
			this.timer -= delta;
			if (this.timer < 0)
				this.state = "retracting";
		}

		if (this.state == "retracting") {
			if (this.isRight) {
				this.x += 10 * timeScale;
				if (this.x > canvas.width + 100) {
					toDelete.push(this);
					spikesRight = false;
					rightSpikes = null;
				}
			} 
			else {
				this.x -= 10 * timeScale;
				if (this.x < -100) {
					toDelete.push(this);
					spikesLeft = false;
					leftSpikes = null;
				}
			}
		}
	}
}