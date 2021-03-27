class PlayState{
    constructor(game){
        this.main(game);
        this.draw(game);
    }

    main(game){
        objects.forEach(o => {o.main()});
        Object.keys(effects).forEach(updateEffect);
    
        splattedTomatoes.forEach(deleteTomato);
        splattedTomatoes = [];
        if (tomatoes.length < 1) endGame();
        //if (lastSlideTime > 0) tryEndSlide();
    
        cleanUp();
        getFPS();
    
        if (game == currentGame)
            setTimeout(function(){currentState.main(currentGame);}, 10);
    }
    draw(game){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        background.draw();
        let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
        toDraw.forEach(o => {o.draw()});
    
        drawUI();
    
        if (game == currentGame)
            setTimeout(function(){currentState.draw(currentGame);}, 10);
    }
}