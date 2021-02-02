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
const keyMap = {
	"ArrowRight": 'right',
	"ArrowLeft": 'left',
	"ArrowDown": 'slide',
};

document.addEventListener("keydown", keyHandler(true), false);
document.addEventListener("keyup", keyHandler(false), false);
function keyHandler(state) {
	return function InternalKeyHandler(e) {
		if (keyMap[e.key])
			inputMap[keyMap[e.key]] = state;
	};
}

document.addEventListener("mousemove", mouseMoveHandler, false);
function mouseMoveHandler(e) {

}

/**
 * Game logic
 */

let score = 0,
	player = new Player(canvas.width / 2, canvas.height - 200),
	sprites = [player, new Ball(0, 0, 0)]; // first ball is always tomato

function updateLoop() {
	requestAnimationFrame(updateLoop);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (let sprite of sprites) {
		sprite.update();
		sprite.draw();
	}

	ctx.font = "30px Arial";
	ctx.fillText(score, 10, 30);

	addTomatoes();
}

function addTomatoes() {
	/*switch (balls.length) {
		case 1:
			if (score > 40)
				balls.push(new Ball(250, 10, 40, 40, tomatoImg, 0, 0, 200, 200));
			break;
		case 2:
			if (score > 200)
				balls.push(new Ball(250, 10, 40, 40, tomatoImg, 0, 0, 200, 200));
			break;
	}*/
}

requestAnimationFrame(updateLoop);