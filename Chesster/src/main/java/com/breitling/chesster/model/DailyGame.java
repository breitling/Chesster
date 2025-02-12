package com.breitling.chesster.model;

public class DailyGame 
{
	private String  url;
	private Integer move_by;
	private String  pgn;
	private String  time_control;
	private Integer last_activity;
	private Boolean rated;
	private String  turn;
	private String  fen;
	private Integer start_time;
	private String  time_class;
	private String  rules;
	private String  white;
	private String  black;
	
	public String getUrl() {
		return url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
	public Integer getMove_by() {
		return move_by;
	}
	
	public void setMove_by(Integer move_by) {
		this.move_by = move_by;
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
	
	public Integer getLast_activity() {
		return last_activity;
	}
	
	public void setLast_activity(Integer last_activity) {
		this.last_activity = last_activity;
	}
	
	public Boolean getRated() {
		return rated;
	}
	
	public void setRated(Boolean rated) {
		this.rated = rated;
	}
	
	public String getTurn() {
		return turn;
	}
	
	public void setTurn(String turn) {
		this.turn = turn;
	}
	
	public String getFenrl() {
		return fen;
	}
	
	public void setFen(String fen) {
		this.fen = fen;
	}
	
	public Integer getStart_time() {
		return start_time;
	}
	
	public void setStart_time(Integer start_time) {
		this.start_time = start_time;
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
	
	public String getWhite() {
		return white;
	}
	
	public void setWhite(String white) {
		this.white = white;
	}
	
	public String getBlack() {
		return black;
	}
	
	public void setBlack(String black) {
		this.black = black;
	}
}
