package com.breitling.chesster.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.breitling.chesster.model.Accuracy;
import com.breitling.chesster.model.DailyGame;
import com.breitling.chesster.model.Game;
import com.breitling.chesster.model.PlayerInfo;

@Service
public class ChessDotComServiceImpl implements ChessDotComService
{
	private final RestClient restClient;
	
	public ChessDotComServiceImpl(RestClient.Builder restClientBuilder) {
		this.restClient = restClientBuilder.baseUrl("https://api.chess.com").build();
	}

	public DailyGame [] getDailyGames(String name)
	{
		DailyGames games = this.restClient.get().uri("/pub/player/{name}/games", name).retrieve().body(DailyGames.class);
		
		return games.getGames();
	}
	
	public Game [] getGames(String name, String year, String month)
	{
		Games games = this.restClient.get().uri("/pub/player/{name}/games/{year}/{month}", name, year, month).retrieve().body(Games.class);
		
		for (Game g : games.getGames())
		{
			if (g.getAccuracies() == null)
				g.setAccuracies(Accuracy.create());
		}
			
		return games.getGames();
	}
	
	public PlayerInfo getPlayerInfo(String name) 
	{
		return this.restClient.get().uri("/pub/player/{name}", name).retrieve().body(PlayerInfo.class);
	}
	
//  INNER CLASSES FOR CHESS.COM JSON CRAZINESS...
	
	private static class DailyGames 
	{
		private DailyGame [] games;

		public DailyGame[] getGames() {
			return games;
		}
	}
	
	private static class Games 
	{
		private Game [] games;

		public Game[] getGames() {
			return games;
		}
	}
}
