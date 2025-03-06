package com.breitling.chesster.service;

import com.breitling.chesster.model.Analysis;
import com.breitling.jclib.model.Game;

public interface GameReviewService 
{
	public int startReview(String path, Game game, int depth) throws InterruptedException;
	
	public int isRunning() throws InterruptedException;
	
	public Boolean abortReview();
	
	public Analysis [] getReviewAnalysis();
}
