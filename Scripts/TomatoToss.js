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
let player = new Player(canvas.width/2, canvas.height - 4, 120, 200);

let objects = [player];
let toDelete = [];
let effects = {};

let tomatoes = [];
let splattedTomatoes = [];

let timeMultiplier = 1;
let forkCooldown = 0;

let spikesRight = false;
let spikesLeft = false;
let rightSpikes = null;
let leftSpikes = null;
let leftSpikesTimer;
let rightSpikesTimer;

//Sound
let sounds = [];
let music;
let musicName;

//Input
let rightPressed = false;
let leftPressed = false;
let lastMoveTime;
let lastMoveDir;
let lastSlideTime;

//FPS
let lastCalledTime;
let delta;

function getFPS() {
	if (lastCalledTime) {
		delta = (Date.now() - lastCalledTime)/1000;
		let fps = 1/delta;
		timeScale = fps > 10 ? fps/90 : 10/90;
		displayFPS(fps);
	}
	lastCalledTime = Date.now();
}

function displayFPS(fps) {
	let fpsCount = document.getElementById("fpscount");
	if (fpsCount) fpsCount.innerHTML = "FPS:" + Math.round(fps);
}

//Functions

let currentRuleset = DEFAULT_RULESET;
let currentState;

function initSound() {
	canvas.removeEventListener("mousedown", initSound, false);
	canvas.removeEventListener("touchstart", initSound, false);

	music = new Audio();
	music.muted = true;
	music.play();
	music.muted = false;
	music.addEventListener('ended', _ => {music.play()});
	for (let i=0; i<10; i++) {
		sounds.push(new Audio());
		sounds[i].muted = true;
		sounds[i].play();
		sounds[i].muted = false;
	} 

	//if (musicName) setMusic(musicName);
}

function changeRuleset(r) {
	if (r === DEFAULT_RULESET) {
		currentRuleset = r;
	} else {
		let newRuleset = {};
		let keys = Object.keys(DEFAULT_RULESET);
		keys.forEach(key => {
			newRuleset[key] = r[key] || DEFAULT_RULESET[key];
		});
		currentRuleset = newRuleset;
	}
}

function getTargetXP() {
	return 3 + Math.floor(5 * Math.log2(level+1));
}

function initGame() {
	changeRuleset(LEVELS[0]);
	score = 0, xp = 0, level = 1, combo = 0;

	background.img = BACKGROUND_IMG;
	player = new Player(canvas.width/2, canvas.height - 4, 120, 200);

	objects = [player];
	toDelete = [];
	effects = {};

	tomatoes = [];
	splattedTomatoes = [];
	forkCooldown = currentRuleset.fork_cooldown;

	spikesRight = false;
	spikesLeft = false;
	rightSpikes = null;
	leftSpikes = null;
	leftSpikesTimer = null;
	rightSpikesTimer = null;

	lastCalledTime = undefined;
	lastMoveTime = undefined;
	lastSlideTime = undefined;

	addTomato(currentRuleset.first_tomato, canvas.width/2, NEW_ITEM_Y);
	changeState(new PlayState());
}

function addPoints(points, x, y) {
	score += points;
	let text = points >= 0 ? "+" + points : points;
	let color = points > 0 ? "#0080f0" : points < 0 ? "#800000" : "#808080";
	objects.push(new GhostText(x, y, text, color));
}

function drawUI() {
	ctx.fillStyle = "#000000";
	ctx.font = "30px Arial";

	let levelText = "Level: " + level;
	let scoreText = "Score: " + score;
	let textW = Math.max(ctx.measureText(scoreText).width, ctx.measureText(levelText).width);
	
	let xpBarTarget = xp / getTargetXP();
	let comboBarTarget = combo / currentRuleset.new_item_combo;
	xpBar += (xpBarTarget - xpBar) * 0.5;
	comboBar += (comboBarTarget - comboBar) * 0.5;

	ctx.fillText(levelText, 10, 30);
	ctx.fillText(scoreText, 10, 60);

	ctx.beginPath();
	ctx.rect(20 + textW, 5, canvas.width - textW - 85, 25);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.rect(25 + textW, 10, (canvas.width - textW - 95) * xpBar, 15);
	ctx.fillStyle = "#FF0000";
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.rect(20 + textW, 35, canvas.width - textW - 85, 25);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.rect(25 + textW, 40, (canvas.width - textW - 95) * comboBar, 15);
	ctx.fillStyle = "#009900";
	ctx.fill();
	ctx.closePath();
}

function showHelp() {
	changeState(new HelpState(currentState));
}

function incCombo(points) {
	combo += points / tomatoes.length;
	if (combo >= currentRuleset.new_item_combo) {
		combo = 0;
		addItem();
	}

	xp ++;
	if(xp >= getTargetXP()) {
		xp = 0;
		level++;
		if (level <= LEVELS.length) changeRuleset(LEVELS[level-1]);
		for (let i = 0; i < tomatoes.length; i++) {
			let t = tomatoes[i];
			if (t.isSpawning) deleteTomato(t);
			else t.timeLeft = 2000 * i;
		};
		objects.push(new BigText("LEVEL " + level));
		addTomato(currentRuleset.first_tomato, canvas.width/2, NEW_ITEM_Y);
	}
}

function breakCombo() {
	combo = 0;
	//xp = Math.max(xp - 10, 0);
}

function updateEffect(e) {
	if (effects[e] > 0)
		if (effects[e] > delta)
			effects[e] -= delta;
		else
			delete effects[e];
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
	toDelete = [];}

function playSound(name) {
	if (!sounds.length > 0) return;

	let i;
	for (i = 0; i < sounds.length; i++)
		if (sounds[i].ended) break;
	if (i >= sounds.length) i = 0;
	let s = sounds[i];

	s.src = "Sounds/" + name + ".wav";
	s.play();
	sounds.splice(i, 1);
	sounds.push(s);
}

function addTomato(type, x = 50 + (canvas.width - 100) * Math.random(), y = NEW_ITEM_Y) {
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

function addPowerup(type, x = 70 + (canvas.width - 140) * Math.random(), y = NEW_ITEM_Y) {
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

function addFork(x = 50 + (canvas.width - 100) * Math.random(), y = NEW_ITEM_Y) {	
	let rand = Math.random() * 100;
	for (type of FORK_TYPES) {
		let prob = currentRuleset.fork_probs[type];
		if (rand <= prob) break;
		rand -= prob;
	}

	let fork = new Fork(x, y, 1, FORK_DIRS[type]);
	objects.push(fork);
}

function activateSpikes(forkOutcome) {
	let tempRandom = Math.random() * 2;

	if(tempRandom > 1 && !spikesLeft && level > 5) {
		leftSpikes = new Spikes(false);
		objects.push(leftSpikes);
	}
	else if(tempRandom < 1 && !spikesRight && level > 5) {
		rightSpikes = new Spikes(true);
		objects.push(rightSpikes);
	}
	else{
		addFork(forkOutcome, NEW_ITEM_Y);
	}
}

function addItem(x, y) {
	let rand = Math.random() * 100;
	for (type of ITEM_TYPES) {
		let prob = currentRuleset.item_probs[type];
		if (rand <= prob) break;
		rand -= prob;
	}
	
	if (type === "tomato")
		addTomato("random", x, y);
	if (type === "powerup")
		addPowerup("random", x, y);
	if (type === "fork")
		addFork(x, y);
}

function deleteTomato(tomato) {
	let i = tomatoes.indexOf(tomato);
	let j = objects.indexOf(tomato);
	tomatoes.splice(i, 1);
	objects.splice(j, 1);
}

changeState(new MenuState());

canvas.addEventListener("mousedown", initSound, false);
canvas.addEventListener("touchstart", initSound, false);

document.addEventListener("keydown", e => {currentState.keyDown(e)}, false);
document.addEventListener("keyup", e => {currentState.keyUp(e)}, false);
canvas.addEventListener("mousedown", e => {currentState.mouseDown(e)}, false);
canvas.addEventListener("mouseup", e => {currentState.mouseUp(e)}, false);
canvas.addEventListener("mousemove", e => {currentState.mouseMove(e)}, false);
canvas.addEventListener("touchstart", e => {currentState.touchStart(e)}, false);
canvas.addEventListener("touchend", e => {currentState.touchEnd(e)}, false);
document.addEventListener("focusout", _ => {currentState.handlePause(true)}, false);