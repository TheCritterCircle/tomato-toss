class PlayState{
    constructor(){
        this.main();
        this.draw();
        this.mainTimeout;
        this.drawTimeout;
    }

    main(){
        objects.forEach(o => {o.main()});
        Object.keys(effects).forEach(updateEffect);
    
        splattedTomatoes.forEach(deleteTomato);
        splattedTomatoes = [];
        if (tomatoes.length < 1) endGame();
        //if (lastSlideTime > 0) tryEndSlide();
    
        cleanUp();
        getFPS();

        if (tomatoes.length > 0) {
            if (forkCooldown < 0) {
                addFork(Math.random() * canvas.width * 0.9, NEW_ITEM_Y);
                forkCooldown += currentRuleset.fork_cooldown;
            }
            if (delta) forkCooldown -= delta;
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

    end(){
        if (this.mainTimeout) clearTimeout(this.mainTimeout)
        if (this.drawTimeout) clearTimeout(this.drawTimeout)
        delete this;
    }
}