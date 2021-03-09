const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let timeScale = 1;

//Functions & Code
let currentGame = 0;
let score = 0;
let combo = 0;

let background = new GameObject(0, 0, canvas.width, canvas.height, BACKGROUND_IMG);
let player = new Player(canvas.width/2, canvas.height - 200, 140, 196, PLAYER_IMG, 134, 100, 70, 98, canvas.width/2, canvas.height - 200, 140, 196);

let objects = [player];
let finishedEffects = [];

let tomatoes = [];
let splattedTomatoes = [];

//Input
let rightPressed = false;
let leftPressed = false;
//let lastTouchedTime;
//let lastTouchedDir;

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
	player = new Player(canvas.width/2, canvas.height - 200, 140, 196, PLAYER_IMG, 134, 100, 70, 98, canvas.width/2, canvas.height - 200, 140, 196);

	objects = [player];
	finishedEffects = [];
	tomatoes = [];
	splattedTomatoes = [];
	lastCalledTime = undefined;

	currentGame++;

	addTomato();
	main(currentGame);
	draw(currentGame);
}

function main(game){
	objects.forEach(o => {o.main()});

	while (combo >= 5) {
		addTomato();
		combo %= 5;
	}

	splattedTomatoes.forEach(deleteTomato);
	splattedTomatoes = [];
	//if (tomatoes.length < 1) return;

	removeFinishedEffects();
	getFPS();
	if (game == currentGame)
		setTimeout(main, 10, game);
}

function removeFinishedEffects() {
	finishedEffects.forEach(e => {
		let i = objects.indexOf(e);
		objects.splice(i, 1);
	});
	finishedEffects = [];
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

function addTomato(){
	let type = 0;
	if (tomatoes.length % 3 == 2) type = 1;

	let tomato = new Tomato(250, 60, 50, 50, type);
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

init_game();

//Keyboard Controls

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e){
	if(INPUT_RIGHT.includes(e.key)){
		rightPressed = true;
		if(!player.isSliding){
			player.facing = "Right";
		}
    }
    else if(INPUT_LEFT.includes(e.key)){
		leftPressed = true;
		if(!player.isSliding){
			player.facing = "Left";
		}
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
    if(e.clientX > rect.left + canvas.width / 2){
		rightPressed = true;
	}
	else if(e.clientX < rect.left + canvas.width / 2){
		leftPressed = true;
	}
}
function mouseUp(e){
	rightPressed = false;
	leftPressed = false;
}

function touchDown(e){
	let rect = canvas.getBoundingClientRect();
	/*
	let dir;
	let now = Date.now();
	*/

    if (e.touches[0].clientX > rect.left + canvas.width / 2){
		rightPressed = true;
		dir = "Right"
	}
	else if (e.touches[0].clientX < rect.left + canvas.width / 2){
		leftPressed = true;
		dir = "Left";
	}

	/*
	if (!lastTouchedTime) {
		lastTouchedTime = now;
	}
	else if (now - lastTouchedTime < DOUBLE_TAP_MAX && dir == lastTouchedDir) {
		player.startSlide();
	}

	lastCalledTime = now;
	lastTouchedDir = dir;
	*/
}
function touchUp(e){
	rightPressed = false;
	leftPressed = false;
}