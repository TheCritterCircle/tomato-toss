const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let timeScale = 1;

//Functions & Code
let currentGame = 0;
let score = 0;
let combo = 0;

let background = new GameObject(0, 0, canvas.width, canvas.height, BACKGROUND_IMG);
let player = new Player(canvas.width/2, canvas.height, 120, 200, PLAYER_R_IMG);

let objects = [player];
let finishedEffects = [];

let tomatoes = [];
let splattedTomatoes = [];

//Input
let rightPressed = false;
let leftPressed = false;
let lastTouchTime;
let lastTouchDir;
let lastSlideTime;

//FPS
let lastCalledTime;
let fps;
let delta;

function getFPS() {

  if(!lastCalledTime) {
     lastCalledTime = Date.now();
     fps = 0;
     return;
  }
  delta = (Date.now() - lastCalledTime)/1000;
  lastCalledTime = Date.now();
  fps = 1/delta;
  timeScale = fps / 90;
  displayFPS();
}

function displayFPS(){
	document.getElementById("fpscount").innerHTML = "FPS:" + fps.toString();
}


//Functions

function init_game(){
	score = 0;
	combo = 0;

	background.img = BACKGROUND_IMG;
	player = new Player(canvas.width/2, canvas.height - 4, 120, 200, PLAYER_R_IMG);

	objects = [player];
	finishedEffects = [];
	tomatoes = [];
	splattedTomatoes = [];
	lastCalledTime = undefined;
	lastTouchTime = undefined;
	lastSlideTime = undefined;

	currentGame++;

	addTomato();
	main(currentGame);
	draw(currentGame);
}

function main(game){
	objects.forEach(o => {o.main()});

	while (combo >= NEW_TOMATO_COMBO) {
		addTomato();
		combo %= NEW_TOMATO_COMBO;
	}

	splattedTomatoes.forEach(deleteTomato);
	splattedTomatoes = [];
	//if (tomatoes.length < 1) return;
	if (lastSlideTime > 0) tryEndSlide();

	removeFinishedEffects();
	getFPS();

	if (game == currentGame)
		setTimeout(main, 10, game);
}

function draw(game){
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (tomatoes.length < 1){
		background.img = GAMEOVER_IMG;
		//background.draw();
		//return;
	}

	background.draw();
	let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
	toDraw.forEach(o => {o.draw()});

	ctx.font = "30px Arial";
	ctx.fillText(score, 10, 30);

	if (game == currentGame)
		setTimeout(draw, 10, game);
}

function tryEndSlide() {
	let now = Date.now();

	if (now - lastSlideTime > SLIDE_DURATION) {
		player.endSlide();
		lastSlideTime = 0;
	}
}

function removeFinishedEffects() {
	finishedEffects.forEach(e => {
		let i = objects.indexOf(e);
		objects.splice(i, 1);
	});
	finishedEffects = [];
}

function addTomato(){
	let type = 0;
	if (tomatoes.length % 3 == 2) type = 1;
	let x = Math.random() * canvas.width * 0.9;

	let tomato = new Tomato(x, NEW_TOMATO_Y, 50, 50, type);
	tomatoes.push(tomato);
	objects.push(tomato);

	return tomato;
}

function deleteTomato(tomato){
	let i = tomatoes.indexOf(tomato);
	let j = objects.indexOf(tomato);
	tomatoes.splice(i, 1);
	objects.splice(j, 1);
	
	delete tomato;
}

//Keyboard Controls

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e){
	if(INPUT_RIGHT.includes(e.key)){
		rightPressed = true;
		player.face("Right");
    }
    else if(INPUT_LEFT.includes(e.key)){
		leftPressed = true;
		player.face("Left");
	}
	else if(INPUT_DOWN.includes(e.key)){
		player.startSlide();
	}
}

function keyUpHandler(e){
	if(INPUT_RIGHT.includes(e.key)){
		rightPressed = false;
	}
    else if(INPUT_LEFT.includes(e.key)){
		leftPressed = false;
	}
	else if(INPUT_DOWN.includes(e.key)){
		if(player.isSliding == true){
			player.endSlide();
		}
	}
}

//Touch & Mouse Controls

document.addEventListener("mousedown", mouseDown, false);
document.addEventListener("mouseup", mouseUp, false);

canvas.addEventListener("touchstart", touchDown, false);
canvas.addEventListener("touchend", touchUp, false);

function mouseDown(e){
	let rect = canvas.getBoundingClientRect();
	let dir;
	let now = Date.now();

    if(e.clientX > rect.left + canvas.width / 2){
		rightPressed = true;
		dir = "Right";
		player.face("Right");
	}
	else if(e.clientX < rect.left + canvas.width / 2){
		leftPressed = true;
		dir = "Left";
		player.face("Left");
	}

	if (!lastTouchTime) {
		lastTouchTime = now;
	}
	else if (now - lastTouchTime < DOUBLE_TAP_MAX && dir == lastTouchDir) {
		player.startSlide();
		lastSlideTime = now;
	}

	lastTouchTime = now;
	lastTouchDir = dir;
}
function mouseUp(e){
	rightPressed = false;
	leftPressed = false;

	/*
	if (player.isSliding)
		player.endSlide();
	*/
}

function touchDown(e){
	let rect = canvas.getBoundingClientRect();
	let dir;
	let now = Date.now();

    if (e.touches[0].clientX > rect.left + canvas.width / 2){
		rightPressed = true;
		dir = "Right";
		player.face("Right");
	}
	else if (e.touches[0].clientX < rect.left + canvas.width / 2){
		leftPressed = true;
		dir = "Left";
		player.face("Left");
	}

	if (!lastTouchTime) {
		lastTouchTime = now;
	}
	else if (now - lastTouchTime < DOUBLE_TAP_MAX && dir == lastTouchDir) {
		player.startSlide();
		lastSlideTime = now;
	}

	lastTouchTime = now;
	lastTouchDir = dir;
}
function touchUp(e){
	rightPressed = false;
	leftPressed = false;
}