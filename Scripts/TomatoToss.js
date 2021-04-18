const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let timeScale = 1;

//Gameplay
let score = 0;
let combo = 0;
let xp = 0;

let xpBar = 0;
let comboBar = 0;
let level = 1;

let background = new GameObject(0, 0, canvas.width, canvas.height, BACKGROUND_IMG);
let player = new Player(canvas.width/2, canvas.height - 4, 120, 200, PLAYER_IMG);

let objects = [player];
let toDelete = [];
let effects = {};

let tomatoes = [];
let splattedTomatoes = [];

let timeMultiplier = 1;
let forkCooldown = 0;

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

let currentState = new MenuState();
let currentRuleset = DEFAULT_RULESET;

let forkTimer = setTimeout(function(){}, 1000);

function init_game(){
	currentRuleset = DEFAULT_RULESET;
	score = 0;
	combo = 0;
	xp = 0;

	level = 1;

	background.img = BACKGROUND_IMG;
	player = new Player(canvas.width/2, canvas.height - 4, 120, 200, PLAYER_IMG);

	objects = [player];
	toDelete = [];
	effects = {};

	tomatoes = [];
	splattedTomatoes = [];
	forkCooldown = currentRuleset.fork_cooldown;

	lastCalledTime = undefined;
	lastTouchTime = undefined;
	lastSlideTime = undefined;
	
	if (music) {music.pause(), delete music}
	music = findAudio("TonatoToss");
	music.play();
	music.loop = true;

	addTomato(canvas.width/2, NEW_ITEM_Y, currentRuleset.first_tomato);
	if (currentState) currentState.end();
	currentState = new PlayState();
}

function drawUI(){
	ctx.fillStyle = "#000000";
	ctx.font = "30px Arial";

	let scoreText = "Score: " + score;
	let levelText = "Level: " + level;
	let scoreW = Math.max(ctx.measureText(scoreText).width, ctx.measureText(levelText).width);
	
	let xpBarTarget = (canvas.width - scoreW - 35) * xp / (level * 10);
	let comboBarTarget = (canvas.width - scoreW - 35) * combo / currentRuleset.new_item_combo;
	xpBar += (xpBarTarget - xpBar) * 0.5;
	comboBar += (comboBarTarget - comboBar) * 0.5;

	ctx.fillText(scoreText, 10, 30);
	ctx.fillText(levelText, 10, 60);

	ctx.beginPath();
	ctx.rect(20 + scoreW, 5, canvas.width - scoreW - 25, 25);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.rect(25 + scoreW, 10, xpBar, 15);
	ctx.fillStyle = "#FF0000";
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.rect(20 + scoreW, 35, canvas.width - scoreW - 25, 25);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.rect(25 + scoreW, 40, comboBar, 15);
	ctx.fillStyle = "#009900";
	ctx.fill();
	ctx.closePath();
}

function endGame(){
	background.img = GAMEOVER_IMG;
	//background.draw();
	//return;
}

function incCombo(points) {
	combo += points / tomatoes.length;
	xp += points;

	if (combo >= currentRuleset.new_item_combo) {
		combo = 0;
		addItem("random");
	}

	if(xp >= level * 10){
		xp = 0;
		level++;
		for (let i = 0; i < tomatoes.length; i++) {
			let t = tomatoes[i];
			if (t.isSpawning) deleteTomato(t);
			else t.timeLeft = 2000 * i;
		};
		addTomato(canvas.width/2, NEW_ITEM_Y, currentRuleset.first_tomato);
	}
}

function breakCombo() {
	combo = 0;

	if(xp - 10 >= 0)
		xp -= 10;
	else
		xp = 0;
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
			let prob = currentRuleset.tomato_probs[type];
			if (rand <= prob) break;
			rand -= prob;
		}

	let tomato = new Tomato(x, y, 50, 50, type);
	tomatoes.push(tomato);
	objects.push(tomato);
}

function addPowerup(x, y, type){
	let rand = Math.random() * 100;

	if (type == "random")
		for (type of POWERUP_TYPES) {
			let prob = currentRuleset.powerup_probs[type];
			if (rand <= prob) break;
			rand -= prob;
		}
	
	let powerup = new PowerUp(x, y, 70, 70, type);
	objects.push(powerup);
}

function addFork(x, y){	
	let rand = Math.random() * 100;

	for (type of FORK_TYPES) {
		let prob = currentRuleset.fork_probs[type];
		if (rand <= prob) break;
		rand -= prob;
	}

	let fork = new Fork(x, y, 50, 75, 30, 30, FORK_DIRS[type]);
	objects.push(fork);
}

function addItem(type){
	let x = Math.random() * canvas.width * 0.9;

	if (type == "tomato")
		addTomato(x, NEW_ITEM_Y, "random");

	if (type == "powerup")
		addPowerup(x, NEW_ITEM_Y, "random");

	if (type == "fork")
		addFork(x, NEW_ITEM_Y);

	if (type == "random") {
		let rand = Math.random() * 100;
		console.log(rand);

		if (tomatoes.length > 1)
			for (type of ITEM_TYPES) {
				let prob = currentRuleset.item_probs[type];
				if (rand <= prob) break;
				rand -= prob;
			}
		else
			type = "tomato";
		
		if (type == "tomato")
			addTomato(x, NEW_ITEM_Y, "random");
		if (type == "powerup")
			addPowerup(x, NEW_ITEM_Y, "random");
		if (type == "fork")
			addFork(x, NEW_ITEM_Y);
	}
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
		//console.log("start right");
		rightPressed = true;
		player.face("Right");
    }
    if(INPUT_LEFT.includes(e.key)){
		//console.log("start left");
		leftPressed = true;
		player.face("Left");
	}
	if(INPUT_DOWN.includes(e.key)){
		//console.log("start down");
		player.startSlide();
	}
}

function keyUpHandler(e){
	if(INPUT_RIGHT.includes(e.key)){
		//console.log("end right");
		rightPressed = false;
		if (leftPressed) player.face("Left");
	}
    if(INPUT_LEFT.includes(e.key)){
		//console.log("end left");
		leftPressed = false;
		if (rightPressed) player.face("Right");
	}
	if(INPUT_DOWN.includes(e.key)){
		//console.log("end down");
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
	if(currentState.name == "PlayState"){
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
	}else if(currentState.name == "MenuState"){
		init_game();
	}
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