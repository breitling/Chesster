package com.breitling.chesster.model;

import com.breitling.chesster.uci.model.Move;

public class Analysis 
{
	private int    number;
	private String fen;
	private String move;
	private Move   bestMove;
	
	public Analysis(int n, String fen, String move, Move bestmove)
	{
		this.number = n;
		this.move = move;
		this.bestMove = bestmove;
		this.fen = fen;
	}
	
	public static Analysis create(int n, String fen, String move, Move bestmove) 
	{
		return new Analysis(n, fen, move, bestmove);
	}

//  GETTERS AND SETTERS
	
	public int getNumber() {
		return number;
	}

	public void setNumber(int number) {
		this.number = number;
	}

	public String getMove() {
		return move;
	}

	public void setMove(String move) {
		this.move = move;
	}

	public Move getBestMove() {
		return bestMove;
	}

	public void setBestMove(Move bestMove) {
		this.bestMove = bestMove;
	}

	public String getFen() {
		return fen;
	}

	public void setFen(String fen) {
		this.fen = fen;
	}
}
