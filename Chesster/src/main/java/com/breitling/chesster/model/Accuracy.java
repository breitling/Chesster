package com.breitling.chesster.model;

public class Accuracy 
{
	private Double white;
	private Double black;
	
//  FACTORIES
	
	public static Accuracy create() 
	{
		var a = new Accuracy();
		
		a.white = 0.0D;
		a.black = 0.0D;
		
		return a;
	}
	
//  GETTERS AND SETTERS
	
	public Double getWhite() {
		return white;
	}
	
	public void setWhite(Double white) {
		this.white = white;
	}
	
	public Double getBlack() {
		return black;
	}
	
	public void setBlack(Double black) {
		this.black = black;
	}	
}
