"use strict";

class Sprite {
	constructor(img, x, y, xVel = 0, yVel = 0, width = img.width, height = img.height) {
		this.img = img;
		this.x = x;
		this.y = y;
		this.xVel = xVel;
		this.yVel = yVel;
		this.width = width || img.width;
		this.height = height || img.height;
	}

	update() {
		this.x += this.xVel;
		this.y += this.yVel;
	}

	draw() {
		ctx.drawImage(
			this.img,
			this.x,
			this.y,
			this.width,
			this.height
		);
	}
}

class Player extends Sprite {
	constructor(x, y, width = Player.width, height = Player.height) {
		super(Player.img, x, y, 0, 0, width, height);
	}

	update() { // TODO: improve this
		let xDir = inputMap.right - inputMap.left;
		this.xVel = xDir * (inputMap.slide ? 2 : 1);

		super.update();
	}

	draw() {
		ctx.drawImage(
			this.img,
			0, 188, 66, 90,
			this.x,
			this.y,
			this.width,
			this.height
		);
		ctx.drawImage(
			this.img,
			27, 30, 80, 90,
			this.x + 63,
			this.y + 203,
			40,
			45
		);
	}
}
Player.img = makeImg("sprites/hamster.png");
Player.speed = 5;
Player.width = 140;
Player.height = 196;

class Ball extends Sprite {
	constructor(
		x = Math.random() * canvas.width - 40,
		y = canvas.height,
		img = Math.floor(Math.random() * Ball.imgs.length)
	) {
		if (typeof img == 'number')
			img = Ball.imgs[img];
		super(
			img, x, y,
			Math.random() * 2, Math.random() - 2,
			40, 40
		);
		this.fell = this.y + this.height > player.y; // goes to true when ball falls below player, since at that point it's no longer possible to catch
	}

	update() {
		super.update();
		this.yVel += Ball.gravity;

		if (this.x <= 0 || this.x >= canvas.width - this.width)
			this.xVel *= -1;
		if (this.y <= 0)
			this.yVel *= -1;

		if (this.y + this.height > player.y) { // below players head
			let playerXCollide = // if inside or above player
				this.x <= player.x + player.width &&
				this.x >= player.x - this.width;
			if (this.fell || this.yVel < 0) {
				if (playerXCollide) {
					if (this.xVel - player.xVel > 0) // if on left of player
						this.x = player.x - this.width; // move to left of player
					else
						this.x = player.x + player.width; // move to right of player
					this.xVel *= -1; // entered player from side, bounce to the side
					this.xVel += player.xVel; // carry momentum from player
				}
			} else {
				if (playerXCollide) {
					this.yVel = -Math.random() * 3 - 1; // entered player from above, bounce up
					this.xVel += Math.random * .1;
					this.xVel += player.xVel; // carry momentum from player
					score++;
				} else
					this.fell = true; // player didn't catch ball
			}
		} else
			this.fell = false;
	}
}
Ball.gravity = .01;
Ball.imgs = [
	makeImg("sprites/tomato.png"),
];