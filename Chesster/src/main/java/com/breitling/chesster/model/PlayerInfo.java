package com.breitling.chesster.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties
public class PlayerInfo 
{
	private String avatar;
	private Integer player_id;
	@JsonAlias("@id")
	private String id;
	private String url;
	private String name;
	private String username;
	private Integer followers;
	private String country;
	private String location;
	private Integer last_online;
	private Integer joined;
	private String status;
	private Boolean is_streamer;
	private Boolean verified;
	private String league;
	
//  GETTERS AND SETTERS
			
	public String getAvatar() {
		return avatar;
	}
	
	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}
	
	public Integer getPlayer_id() {
		return player_id;
	}
	
	public void setPlayer_id(Integer player_id) {
		this.player_id = player_id;
	}
	
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	public String getUrl() {
		return url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getUsername() {
		return username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	public Integer getFollowers() {
		return followers;
	}
	
	public void setFollowers(Integer followers) {
		this.followers = followers;
	}
	
	public String getCountry() {
		return country;
	}
	
	public void setCountry(String country) {
		this.country = country;
	}
	
	public String getLocation() {
		return location;
	}
	
	public void setLocation(String location) {
		this.location = location;
	}
	
	public Integer getLast_online() {
		return last_online;
	}
	
	public void setLast_online(Integer last_online) {
		this.last_online = last_online;
	}
	
	public Integer getJoined() {
		return joined;
	}
	
	public void setJoined(Integer joined) {
		this.joined = joined;
	}
	
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	
	public Boolean getIs_streamer() {
		return is_streamer;
	}
	
	public void setIs_streamer(Boolean is_streamer) {
		this.is_streamer = is_streamer;
	}
	
	public Boolean getVerified() {
		return verified;
	}
	
	public void setVerified(Boolean verified) {
		this.verified = verified;
	}
	
	public String getLeague() {
		return league;
	}
	
	public void setLeague(String league) {
		this.league = league;
	}
}
