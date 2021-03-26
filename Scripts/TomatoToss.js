const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let timeScale = 1;

//Functions & Code
let currentGame = 0;
let score = 0;
let combo = 0;
let trueCombo = 0;

let level = 1;

let background = new GameObject(0, 0, canvas.width, canvas.height, BACKGROUND_IMG);
let player = new Player(canvas.width/2, canvas.height - 4, 120, 200, PLAYER_IMG);

let objects = [player];
let toDelete = [];
let effects = {};

let tomatoes = [];
let splattedTomatoes = [];

let timeMultiplier = 1;

//Music
let music;

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
	trueCombo = 0;

	level = 1;

	background.img = BACKGROUND_IMG;
	player = new Player(canvas.width/2, canvas.height - 4, 120, 200, PLAYER_IMG);

	objects = [player];
	toDelete = [];
	effects = {};

	tomatoes = [];
	splattedTomatoes = [];

	lastCalledTime = undefined;
	lastTouchTime = undefined;
	lastSlideTime = undefined;

	if(currentGame <= 0){
		music = findAudio("TonatoToss");
		music.play();
		music.loop = true;
	}

	currentGame++;

	addTomato(canvas.width/2, NEW_ITEM_Y, "tomato");
	main(currentGame);
	draw(currentGame);
}

function main(game){
	objects.forEach(o => {o.main()});
	Object.keys(effects).forEach(updateEffect);

	splattedTomatoes.forEach(deleteTomato);
	splattedTomatoes = [];
	if (tomatoes.length < 1) endGame();
	//if (lastSlideTime > 0) tryEndSlide();

	cleanUp();
	getFPS();

	if (game == currentGame)
		setTimeout(main, 10, game);
}

function draw(game){
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	background.draw();
	let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
	toDraw.forEach(o => {o.draw()});

	drawUI();

	if (game == currentGame)
		setTimeout(draw, 10, game);
}

function drawUI(){
	ctx.beginPath();
	ctx.rect(5, 5, canvas.width - 10, 30);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.rect(10, 10, (canvas.width - 20) / (level * 10) * trueCombo, 20);
	ctx.fillStyle = "#FF0000";
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#000000";
	ctx.font = "30px Arial";

	ctx.fillText("Score: " + score, 10, 65);
	ctx.fillText("Level: " + level, 10, 95);
}

function endGame(){
	background.img = GAMEOVER_IMG;
	//background.draw();
	//return;
}

function incCombo(points) {
	combo += points;
	trueCombo += points;

	if (combo >= NEW_ITEM_COMBO) {
		combo = 0;
		addItem();
	}

	if(trueCombo >= level * 10){
		trueCombo = 0;
		level++;
	}
}

function breakCombo() {
	combo = 0;

	if(trueCombo - level * 10 / 3 >= 0)
		trueCombo -= level * 10 / 3;
	else
		trueCombo = 0;
}

function updateEffect(e){
	if (effects[e] <= 0) return;

	effects[e] -= delta;
	if (effects[e] < 0) delete effects[e];
}

function tryEndSlide() {
	let now = Date.now();

	if (now - lastSlideTime > SLIDE_DURATION) {
		player.endSlide();
		lastSlideTime = 0;
	}
}

function cleanUp() {
	toDelete.forEach(e => {
		let i = objects.indexOf(e);
		objects.splice(i, 1);
	});
	toDelete = [];
}

function addTomato(x, y, type){
	let rand = Math.random() * 100;

	if (type == "random")
		for (type of Object.keys(TOMATOES)) {
			if (rand <= TOMATOES[type].prob) break;
			rand -= TOMATOES[type].prob;
		}

	let tomato = new Tomato(x, y, 50, 50, type);
	tomatoes.push(tomato);
	objects.push(tomato);
}

function addPowerup(x, y, type){
	let rand = Math.random() * 100;

	if (type == "random")
		for (type of POWERUP_TYPES) {
			if (rand <= POWERUP_PROBS[type]) break;
			rand -= POWERUP_PROBS[type];
		}
	
	let powerup = new PowerUp(x, y, 70, 70, type);
	objects.push(powerup);
}

function addItem(){
	let x = Math.random() * canvas.width * 0.9;

	if (Math.random() < 0.6)
		addTomato(x, NEW_ITEM_Y, "random");
	else
		addPowerup(x, NEW_ITEM_Y, "random");
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

canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mouseup", mouseUp, false);

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

	player.endSlide();
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

	player.endSlide();
}