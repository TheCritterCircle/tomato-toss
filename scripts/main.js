"use strict";

let canvas = document.getElementById("gameCanvas"),
	ctx = canvas.getContext("2d");

/**
 * Get input
 */

let inputMap = {
	'right': false,
	'left': false,
	'slide': false,
};
const KEYMAP = {
	"ArrowRight": 'right',
	"ArrowLeft": 'left',
	"ArrowDown": 'slide',
};

document.addEventListener("keydown", keyHandler(true), false);
document.addEventListener("keyup", keyHandler(false), false);
function keyHandler(state) { // note that this function returns the function that is acutally used in the event listener
	return function InternalKeyHandler(e) {
		if (KEYMAP[e.code])
			inputMap[KEYMAP[e.code]] = state;
	};
}

document.addEventListener("mousemove", mouseMoveHandler, false);
function mouseMoveHandler(e) {

}

/**
 * Game logic
 */

let score = 0,
	player = new Player((canvas.width - Player.width) / 2, canvas.height - 200),
	balls = [new Ball(undefined, undefined, 0)], // first ball is always tomato
	sprites = [player, balls];

function mainLoop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	nestedForEach(sprites, function updateSprite(sprite) {
		sprite.update();
		sprite.draw();
	});
	addTomatoes();

	ctx.font = "30px Arial";
	ctx.fillText(score, 10, 30);

	requestAnimationFrame(mainLoop);
}

function addTomatoes() {
	switch (balls.length) {
		case 1:
			if (score > 40)
				balls.push(new Ball);
			break;
		case 2:
			if (score > 200)
				balls.push(new Ball);
			break;
	}
}

requestAnimationFrame(mainLoop);