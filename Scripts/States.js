class State {
    constructor(){
        if (this.main) this.main();
        if (this.draw) this.draw();
        this.mainTimeout;
        this.drawTimeout;
    }

    end(){
        if (this.mainTimeout) clearTimeout(this.mainTimeout)
        if (this.drawTimeout) clearTimeout(this.drawTimeout)
        delete this;
    }

    changeState(newState) {
        currentState = newState;
        this.end();
    }
    
    mouseDown(e){}
    handlePause(e){}
}

class PlayState extends State {
    constructor() {
        super();
        this.name = "play";
    }

    main() {
        getFPS();
        let timeSpeed = effects["slow_time"] ? 0.75 : 1;
        objects.forEach(o => {o.main();});
        Object.keys(effects).forEach(updateEffect);
    
        splattedTomatoes.forEach(deleteTomato);
        splattedTomatoes = [];
        if (tomatoes.length < 1) endGame();
        //if (lastSlideTime > 0) tryEndSlide();
    
        cleanUp();

        if (tomatoes.length > 0) {
            if (forkCooldown < 0) {
                addFork(Math.random() * canvas.width * 0.9, NEW_ITEM_Y);
                forkCooldown += currentRuleset.fork_cooldown;
            }
            if (delta && level != 1)
                forkCooldown -= delta / Math.log2(level) * timeSpeed;
        }

        this.mainTimeout = setTimeout(_ => {this.main()}, 10);
    }

    draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        background.draw();
        let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
        toDraw.forEach(o => {o.draw()});
    
        drawUI();
        this.drawTimeout = setTimeout(_ => {this.draw()}, 10);
    }

    pause() {

    }

    mouseDown(e){
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

    handlePause() {
        this.changeState(new PauseState());
    }
}

class MenuState extends State {
    constructor() {
        super();
        this.name = "menu";
    }

    draw(){
        ctx.drawImage(LOGO, 200, 0);
        this.drawTimeout = setTimeout(_ => {this.draw()}, 10);
    }

    mouseDown(e){
        console.log("test");
        init_game();
    }
}

class PauseState extends State {
    constructor() {
        super();
        this.name = "pause";
    }

    draw(){
        getFPS();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw();
        let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
        toDraw.forEach(o => {o.draw()});

        ctx.drawImage(LOGO, 200, 0);
        this.drawTimeout = setTimeout(_ => {this.draw()}, 10);
    }

    mouseDown(e) {
        console.log("test2");
        this.handlePause();
    }

    handlePause() {
        this.changeState(new PlayState());
    }
}