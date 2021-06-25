function changeState(newState) {
    if (currentState) currentState.end();
    currentState = newState;
    currentState.start();
}

function setMusic(name = "") {
    if (music && !muted) {
        let src = "Sounds/" + name + ".wav"
        if (!music.src.endsWith(src)) {
            music.src = src;
            music.play();
        }
    } 
    /*
    else {
        musicName = name;
    }
    */
}

class PlayState extends State {
    constructor() {
        super();

        this.buttons.push(new Button(
            canvas.width - 60, 5, 55, 55,
            PAUSE_BTN, _ => {this.handlePause()}
        ));
        
        setMusic();
        setMusic("TomatoToss");
    }

    main() {
        let timeSpeed = effects["slow_time"] ? 0.75 : 1;
        objects.forEach(o => {o.main();});
        Object.keys(effects).forEach(updateEffect);
    
        splattedTomatoes.forEach(deleteTomato);
        splattedTomatoes = [];
        if (tomatoes.length < 1) {
            leftPressed = false;
            rightPressed = false;
            player.endSlide();
            changeState(new GameoverState());
        }
        //if (lastSlideTime > 0) tryEndSlide();
    
        cleanUp();

        if (tomatoes.length > 0) {
            if (forkCooldown < 0) {
                if(Math.random > 0.8){
                    addFork(Math.random() * canvas.width * 0.9, NEW_ITEM_Y);
                }
                else{
                    activateSpikes(Math.random() * canvas.width * 0.9);
                }
                forkCooldown += currentRuleset.fork_cooldown;
            }
            if (delta && level != 1) {
                forkCooldown -= delta / Math.log2(level) * timeSpeed;
            }
        }
    }

    draw() {
        this.background.draw();
        let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
        toDraw.forEach(o => {o.draw()});
    
        drawUI();
        this.buttons.forEach(btn => {btn.draw()});
    }

    mouseDown(e) {
        let pos = getEventPos(e);
		let now = Date.now();

		if (this.checkPress(pos.x, pos.y)) return;

        // moving
		if (pos.x > canvas.width / 2) {
			rightPressed = true;
			player.face(1);
		}
		if (pos.x < canvas.width / 2) {
			leftPressed = true;
			player.face(-1);
		}

        // sliding
		if (!lastMoveTime) {
			lastMoveTime = now;
		}
		else if (now - lastMoveTime < DOUBLE_TAP_MAX && player.facing == lastMoveDir) {
			player.startSlide();
			lastSlideTime = now;
		}

		lastMoveTime = now;
		lastMoveDir = player.facing;
    }

    mouseUp(e) {
        super.mouseUp(e);
        rightPressed = false;
        leftPressed = false;
        player.endSlide();
    }

    keyDown(e) {
        switch (CONTROLS[e.code]) {
            case "left":
                leftPressed = true;
                player.face(-1);
                break;

            case "right":
                rightPressed = true;
                player.face(1);
                break;

            case "down":
                player.startSlide();
                break;

            case "pause":
                this.handlePause();
                break;

            case "mute":
                handleMute();
                break;
        }
    }

    keyUp(e) {        
        switch (CONTROLS[e.code]) {
            case "left":
                leftPressed = false;
                if (rightPressed) player.face(1);
                break;

            case "right":
                rightPressed = false;
                if (leftPressed) player.face(-1);
                break;

            case "down":
                player.endSlide();
                break;
        }
    }

    handlePause(pause = true) {
        if (pause) changeState(new PauseState(this));
    }
}

class MenuState extends State {
    constructor() {
        super();

        this.logo = new GameObject(canvas.width/2, 0, 500*3/4, 400*3/4, LOGO);
        this.logo.offsetX = -this.logo.width/2;
        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height/2 + 25,
            200, 50,
            START_BTN, initGame
        ));
        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height/2 + 90,
            200, 50,
            HELP_BTN, showHelp
        ));
    }

    draw() {
        this.background.draw();
        if (this.logo) this.logo.draw();
        this.buttons.forEach(btn => {btn.draw()});
    }
}

class PauseState extends State {
    constructor(lastState) {
        super();

        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height/2 - 50,
            200, 50,
            UNPAUSE_BTN, _ => {this.handlePause()}
        ))
        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height/2 + 15,
            200, 50,
            HELP_BTN, showHelp
        ));
        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height/2 + 80,
            200, 50,
            START_BTN, initGame
        ));
        this.buttons.push(new Button(
            canvas.width/2 - 25, canvas.height - 65,
            50, 50,
            MUTE_BTN, handleMute
        ));

        this.lastState = lastState;
    }

    draw() {
        this.background.draw();
        let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
        toDraw.forEach(o => {o.draw()});

        ctx.drawImage(PAUSE_IMG, 0, 0);
        this.buttons.forEach(btn => {btn.draw()});
    }

    keyDown(e) {
        switch (CONTROLS[e.code]) {
            case "pause":
                this.handlePause();
                break;

            case "mute":
                handleMute();
                break;
        }
    }

    handlePause(pause = false) {
        if (!pause) changeState(this.lastState);
    }
}

class GameoverState extends State {
    constructor() {
        super();

        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height/2 - 50,
            200, 50,
            START_BTN, initGame
        ))
    }

    main() {
        objects.forEach(o => {o.main();});
        cleanUp();
    }

    draw() {
        this.background.draw();
        let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
        toDraw.forEach(o => {o.draw()});

        ctx.drawImage(GAMEOVER_IMG, 0, 0);
        this.buttons.forEach(btn => {btn.draw()});

        ctx.fillStyle = "#000000";
        ctx.font = "30px Arial";
		ctx.textAlign = "center";
        ctx.fillText("Level: " + level, canvas.width/2, canvas.height/2 + 50);
        ctx.fillText("Score: " + score, canvas.width/2, canvas.height/2 + 100);
		ctx.textAlign = "left";
    }
}

class HelpState extends State {
    constructor(lastState) {
        super();
        this.page = 0;
        this.background.img = HELP_PAGES[0];

        this.prevBtn = new Button(
            canvas.width/4 - 100, canvas.height - 75,
            200, 50,
            PREV_BTN, _ => {this.prevPage()}
        );
        this.nextBtn = new Button(
            canvas.width*3/4 - 100, canvas.height - 75,
            200, 50,
            NEXT_BTN, _ => {this.nextPage()}
        );
        this.prevBtn.visible = false;
        this.buttons.push(this.prevBtn);
        this.buttons.push(this.nextBtn);

        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height - 75,
            200, 50,
            BACK_BTN, _ => {changeState(this.lastState)}
        ));
        
        this.lastState = lastState;
        this.oldVolume = music.volume;
        music.volume = 0.5*this.oldVolume;
    }

    draw() {
        this.background.draw();
        this.buttons.forEach(btn => {btn.draw();});
    }

    prevPage() {
        if (this.page > 0) {
            if (this.page === HELP_PAGES.length - 1)
                this.nextBtn.visible = true;
            this.page--;
            if (this.page === 0)
                this.prevBtn.visible = false;
        }
        this.background.img = HELP_PAGES[this.page];
    }

    nextPage() {
        if (this.page < HELP_PAGES.length - 1) {
            if (this.page === 0)
                this.prevBtn.visible = true;
            this.page++;
            if (this.page === HELP_PAGES.length - 1)
                this.nextBtn.visible = false;
        }
        this.background.img = HELP_PAGES[this.page];
    }

    end() {
        music.volume = this.oldVolume;
        super.end();
    }
}