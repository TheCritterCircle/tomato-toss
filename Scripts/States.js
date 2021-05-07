class State {
    constructor(){
        this.buttons = [];
        if (this.main) this.mainLoop();
        if (this.draw) this.drawLoop();
        this.mainRequest;
        this.drawRequest;
    }

    mainLoop() {
        this.main();
        this.mainRequest = requestAnimationFrame(_ => {this.mainLoop()}, 10);
    }

    drawLoop() {
        this.draw();
        this.drawRequest = requestAnimationFrame(_ => {this.drawLoop()}, 10);
    }

    end(){
        if (this.mainRequest) cancelAnimationFrame(this.mainRequest)
        if (this.drawRequest) cancelAnimationFrame(this.drawRequest)
        delete this;
    }
    
    main(){getFPS()}

    getEventPos(e){
        return {
            x: e.pageX - canvas.getBoundingClientRect().left,
            y: e.pageY - canvas.getBoundingClientRect().top,
        };
    }

    clickButton(x, y){
        this.buttons.forEach(btn => {
            if (x > btn.x &&
                y > btn.y &&
                x < btn.x + btn.width &&
                y < btn.y + btn.height
            ) btn.handleClick();
        })
    }

    mouseDown(e){
        let pos = this.getEventPos(e);
        this.clickButton(pos.x, pos.y);
    }

    touchDown(e){this.mouseDown(e.touches[0])}
    handlePause(){}
    keyDownHandler(){}
    keyUpHandler(){}
}

function changeState(newState) {
    currentState.end();
    currentState = newState;
}

class PlayState extends State {
    constructor() {
        super();
        this.buttons.push(new Button(
            canvas.width - 60, 5,
            55, 55,
            PAUSE_BTN, this.handlePause
        ));
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
    }

    draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        background.draw();
        let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
        toDraw.forEach(o => {o.draw()});
    
        drawUI();
        this.buttons.forEach(btn => {btn.draw()});
    }

    mouseDown(e){
        let pos = this.getEventPos(e);
		let now = Date.now();
		let dir;

        // clicking buttons
        this.clickButton(pos.x, pos.y);

        // moving
		if (pos.x > canvas.width / 2) {
			rightPressed = true;
			dir = "Right";
			player.face(1);
		}
		if (pos.x < canvas.width / 2) {
			leftPressed = true;
			dir = "Left";
			player.face(-1);
		}

        // sliding
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

    keyDownHandler(e){
        if(INPUT_RIGHT.includes(e.key)){
            rightPressed = true;
            player.face(1);
        }
        if(INPUT_LEFT.includes(e.key)){
            leftPressed = true;
            player.face(-1);
        }
        if(INPUT_DOWN.includes(e.key)){
            player.startSlide();
        }
        if(INPUT_PAUSE.includes(e.key)){
            currentState.handlePause();
        }
    }

    keyUpHandler(e){
        if(INPUT_RIGHT.includes(e.key)){
            rightPressed = false;
            if (leftPressed) player.face(-1);
        }
        if(INPUT_LEFT.includes(e.key)){
            leftPressed = false;
            if (rightPressed) player.face(1);
        }
        if(INPUT_DOWN.includes(e.key)){
            player.endSlide();
        }
    }

    handlePause() {
        changeState(new PauseState());
    }
}

class MenuState extends State {
    constructor() {
        super();
        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height/2 - 25,
            200, 50,
            START_BTN, init_game
        ));
    }

    draw(){
        ctx.drawImage(LOGO, 200, 0);
        this.buttons.forEach(btn => {btn.draw()});
    }
}

class PauseState extends State {
    constructor() {
        super();
        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height/2 - 50,
            200, 50,
            UNPAUSE_BTN, this.handlePause
        ))
        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height/2 + 50,
            200, 50,
            START_BTN, init_game
        ));
    }

    draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw();
        let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
        toDraw.forEach(o => {o.draw()});

        ctx.drawImage(PAUSE_IMG, 0, 0);
        this.buttons.forEach(btn => {btn.draw()});
    }

    keyDownHandler(e){
        if(INPUT_PAUSE.includes(e.key)){
            currentState.handlePause();
        }
    }

    handlePause() {
        changeState(new PlayState());
    }
}