package com.breitling.chesster.model;

public class Game 
{
	private String url;
	private String pgn;
	private String time_control;
	private String end_time;
	private String rated;
	private Accuracy accuracies;
	private String tcn;
	private String uuid;
	private String initial_setup; //FEN
	private String fen;
	private String time_class;
	private String rules;
	private Player white;
	private Player black;
	private String eco;
	
	public String getUrl() {
		return url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
	public String getPgn() {
		return pgn;
	}
	
	public void setPgn(String pgn) {
		this.pgn = pgn;
	}
	
	public String getTime_control() {
		return time_control;
	}
	
	public void setTime_control(String time_control) {
		this.time_control = time_control;
	}
	
	public String getEnd_time() {
		return end_time;
	}
	
	public void setEnd_time(String end_time) {
		this.end_time = end_time;
	}
	
	public String getRated() {
		return rated;
	}
	
	public void setRated(String rated) {
		this.rated = rated;
	}
	
	public Accuracy getAccuracies() {
		return accuracies;
	}
	
	public void setAccuracies(Accuracy accuracies) {
		this.accuracies = accuracies;
	}
	
	public String getTcn() {
		return tcn;
	}
	
	public void setTcn(String tcn) {
		this.tcn = tcn;
	}
	
	public String getUuid() {
		return uuid;
	}
	
	public void setUuid(String uuid) {
		this.uuid = uuid;
	}
	
	public String getInitial_setup() {
		return initial_setup;
	}
	
	public void setInitial_setup(String initial_setup) {
		this.initial_setup = initial_setup;
	}
	
	public String getFen() {
		return fen;
	}
	
	public void setFen(String fen) {
		this.fen = fen;
	}
	
	public String getTime_class() {
		return time_class;
	}
	
	public void setTime_class(String time_class) {
		this.time_class = time_class;
	}
	
	public String getRules() {
		return rules;
	}
	
	public void setRules(String rules) {
		this.rules = rules;
	}
	
	public Player getWhite() {
		return white;
	}
	
	public void setWhite(Player white) {
		this.white = white;
	}
	
	public Player getBlack() {
		return black;
	}
	
	public void setBlack(Player black) {
		this.black = black;
	}

	public String getEco() {
		return eco;
	}

	public void setEco(String eco) {
		this.eco = eco;
	}
}
