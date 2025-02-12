package com.breitling.chesster.service;

import com.breitling.chesster.model.DailyGame;
import com.breitling.chesster.model.Game;
import com.breitling.chesster.model.PlayerInfo;

public interface ChessDotComService 
{
	public DailyGame [] getDailyGames(String name);
	
	public Game [] getGames(String name, String year, String month);
	
	public PlayerInfo getPlayerInfo(String name);
}
