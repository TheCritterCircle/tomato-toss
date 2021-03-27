class PlayState{
    constructor(){
        this.main();
        this.draw();
        this.ended = false;
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

        if (!this.ended) setTimeout(_ => {this.main()}, 10);
    }

    draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        background.draw();
        let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
        toDraw.forEach(o => {o.draw()});
    
        drawUI();
    
        if (!this.ended) setTimeout(_ => {this.draw()}, 10);
    }

    end(){
        this.ended = true;
        delete this;
    }
}