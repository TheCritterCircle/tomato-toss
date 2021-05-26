class State {
    constructor(){
        this.background = new GameObject(0, 0, canvas.width, canvas.height, BACKGROUND_IMG);
        this.buttons = [];
        this.mainRequest;
        this.drawRequest;
        this.isActive = true;
    }

    mainLoop() {
        if (this.isActive) {
            this.main();
            this.mainRequest = requestAnimationFrame(_ => {this.mainLoop()}, 10);
        }
    }

    drawLoop() {
        if (this.isActive) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.draw();
            this.drawRequest = requestAnimationFrame(_ => {this.drawLoop()}, 10);
        }
    }

    start(){
        this.isActive = true;
        if (this.main) this.mainLoop();
        if (this.draw) this.drawLoop();
    }

    end(){
        this.isActive = false;
        if (this.mainRequest) cancelAnimationFrame(this.mainRequest);
        if (this.drawRequest) cancelAnimationFrame(this.drawRequest);
    }
    
    main(){getFPS()}
    draw(){}

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
    if (currentState) currentState.end();
    currentState = newState;
    currentState.start();
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
        if (tomatoes.length < 1) changeState(new GameoverState());
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
        this.background.draw();
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

    handlePause(pause = true) {
        if (pause) changeState(new PauseState());
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

    draw(){
        this.background.draw();
        if (this.logo) this.logo.draw();
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
            canvas.width/2 - 100, canvas.height/2 + 15,
            200, 50,
            HELP_BTN, showHelp
        ));
        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height/2 + 80,
            200, 50,
            START_BTN, initGame
        ));
    }

    draw(){
        this.background.draw();
        let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
        toDraw.forEach(o => {o.draw()});

        ctx.drawImage(PAUSE_IMG, 0, 0);
        this.buttons.forEach(btn => {btn.draw()});
    }

    keyDownHandler(e){
        if (INPUT_PAUSE.includes(e.key)) currentState.handlePause();
    }

    handlePause(pause = false) {
        if (!pause) changeState(new PlayState());
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

    draw(){
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
        this.lastState = lastState;
        this.page = 0;
        this.background.img = HELP_PAGES[0];

        this.prevBtn = new Button(
            canvas.width/4 - 100, canvas.height - 40,
            200, 50,
            PREV_BTN, _ => {this.prevPage()}
        );
        this.nextBtn = new Button(
            canvas.width*3/4 - 100, canvas.height + 25,
            200, 50,
            NEXT_BTN, _ => {this.nextPage()}
        );
        this.prevBtn.visible = false;
        this.buttons.push(this.prevBtn);
        this.buttons.push(this.nextBtn);

        this.buttons.push(new Button(
            canvas.width/2 - 100, canvas.height - 75,
            200, 50,
            BACK_BTN, _ => {changeState(lastState)}
        ));
    }

    draw(){
        this.background.draw();
        this.buttons.forEach(btn => {btn.draw()});
    }

    prevPage(){
        if (this.page > 0) {
            if (this.page === HELP_PAGES.length - 1)
                this.nextBtn.visible = true;
            this.page--;
            if (this.page === 0)
                this.prevBtn.visible = false;
        }
        this.background.img = HELP_PAGES[this.page];
    }
    nextPage(){
        if (this.page < HELP_PAGES.length - 1) {
            if (this.page === 0)
                this.prevBtn.visible = true;
            this.page++;
            if (this.page === HELP_PAGES.length - 1)
                this.nextBtn.visible = false;
        }
        this.background.img = HELP_PAGES[this.page];
    }
}