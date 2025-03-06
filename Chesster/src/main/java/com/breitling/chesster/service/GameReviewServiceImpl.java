package com.breitling.chesster.service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.breitling.chesster.model.Analysis;
import com.breitling.chesster.uci.UCI;
import com.breitling.chesster.uci.model.Move;
import com.breitling.jclib.chess.Board;
import com.breitling.jclib.model.Game;

@Service
public class GameReviewServiceImpl implements GameReviewService 
{
	private static final Logger LOG = LoggerFactory.getLogger(GameReviewServiceImpl.class);
	
	private ExecutorService service;
	private GameReview review;
	private Future<?> task;
	
	public GameReviewServiceImpl()
	{
		this.service = Executors.newSingleThreadExecutor();
	}
	
	@Override
	public int startReview(String path, Game game, int depth) throws InterruptedException
	{
		this.review = new GameReview(game);
		this.task = this.service.submit(new GameReviewTask(review, path, depth));
		
		return this.review.getProgress();
	}

	@Override
	public int isRunning() throws InterruptedException
	{
		int progress = 0;
		
		try 
		{
			if (review != null)
				progress = review.getProgress();
		}
		catch (Exception e) 
		{
			LOG.debug("Progress Error: {}", e.getMessage());
			progress = 101;
		} 

		LOG.debug("Progress: {}", progress);
		
		return progress;
	}
	
	@Override
	public Boolean abortReview() 
	{
		if (this.task != null)
			return this.task.cancel(true);
		else
			return Boolean.FALSE;
	}
	
	@Override
	public Analysis [] getReviewAnalysis()
	{
		if (this.review != null)
			return review.getAnalysis().toArray(new Analysis[0]);
		else
			return new Analysis[0];
	}
	
//  PRIVATE METHODS
	
	private String [] getMoves(String moves) 
	{
		moves = moves.trim();
		
		int len = moves.length();
		
		if (moves.endsWith("1-0"))
			moves = moves.substring(0, len-4);
		else
		if (moves.endsWith("0-1"))
			moves = moves.substring(0, len-4);
		else
		if (moves.endsWith("1/2-1/2"))
			moves = moves.substring(0, len-8);
			
		String [] parts = moves.trim().split(" ");
		List<String> list = new ArrayList<String>();
		
		for (int i = 0; i < parts.length-1; i = i+3)
		{
			list.add(parts[i+1]);
			
			if (i+2 < parts.length)
				list.add(parts[i+2]);
			else
				list.add("");
		}
		
		return list.toArray( new String[0]);
	}
	
//  INNER CLASSES 
	
	private class GameReviewTask implements Runnable 
	{
		private GameReview review;
		private String path;
		private int depth;
		
		public GameReviewTask(GameReview review, String path, int depth) {
			this.review = review;
			this.path = path;
			this.depth = depth;
		}
		
		@Override
		public void run() 
		{
			Board board = Board.create();
			String [] moves = getMoves(review.getGame().getMoves());
			
			UCI uci = UCI.create();
			
	    	uci.start(this.path);
			uci.setOption("Threads", "12");
			uci.setOption("Hash", "4096");
			
			int n = 1;
			int moveCount = moves.length;
			
			LOG.info("Moves: {}", review.getGame().getMoves());
			
			String w;
			String b;
			String fen;
			
			for (int i = 0; i < moveCount; i = i+2)
			{
				w = moves[i];
				board.move(w);
				fen = board.toFEN();
				
				LOG.debug("{}. {} [{}]", n, w, fen);
									
				try
				{
					com.breitling.chesster.uci.model.Analysis wa = getAnalysis(uci, fen);
					com.breitling.chesster.uci.model.Move wbm = (wa != null) ? wa.getBestMove() : Move.create();
					
					this.review.addAnalysis(n, fen, w, wbm);
			
					LOG.debug("{}", wbm != null ? getScore(wbm) : 0.0D);

					b = moves[i+1];
					
					if (b.length() > 0)
					{
						board.move(b);
						fen = board.toFEN();
							
						LOG.debug("{}. ... {} [{}]", n, b, fen);
						
						com.breitling.chesster.uci.model.Analysis ba = getAnalysis(uci, fen);
						com.breitling.chesster.uci.model.Move bbm = (ba != null) ? ba.getBestMove() : Move.create();
						
						this.review.addAnalysis(n++, fen, b, bbm);
						
						LOG.debug("{}", bbm != null ? 0 - getScore(bbm) : 0.0D);
					}
				}
				catch (Exception e)
				{
					LOG.error("Stockfish Error: {}", e.getMessage());
				}

				this.review.setProgress(((i+1) * 100) / moveCount);
			}
			
			uci.close();
			this.review.setProgress(100);
			return;
		}
		
		private com.breitling.chesster.uci.model.Analysis getAnalysis(UCI uci, String fen)
		{
			var response = uci.positionFen(fen);
			var list = response.getResult();
			
			if (list != null)
			{
				list.forEach(s -> {
					LOG.debug(s);
				});
				
				return  uci.analysis(this.depth).getResult();
			}
			else
			{
				LOG.debug("Stockfish Error: position command failed: {}", fen);
			}
			
			return null;
		}
		
		private double getScore(Move m)
		{
			double score = 0.0D;
			
			if (m != null && m.getStrength() != null)
				score = m.getStrength().getScore();
			
			return score;
		}
	}
	
	@SuppressWarnings("unused")
	private class GameReview 
	{
		private Game game;
		private int progress;
		private List<Analysis> analysis;
		
		public GameReview(Game game)
		{
			this.game = game;
			this.progress = 1;
			this.analysis = new ArrayList<Analysis>();
		}
		
		public void addAnalysis(int n, String fen, String move, Move bestmove) {
			this.analysis.add(Analysis.create(n, fen, move, bestmove));
		}

    //  GETTERS AND SETTERS
		
		public Game getGame() {
			return game;
		}
		
		public void setGame(Game g) {
			this.game = g;
		}
		
		public int getProgress() {
			return progress;
		}
		
		public void setProgress(int p) {
			LOG.debug("Progress: {}", p);
			this.progress = p;
		}

		public List<Analysis> getAnalysis() {
			return analysis;
		}

		public void setAnalysis(List<Analysis> analysis) {
			this.analysis = analysis;
		}
	}
}
