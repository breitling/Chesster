package com.breitling.chesster.service;

public interface DirectoryService 
{
	public Boolean databaseExists(String name);
	
	public Boolean exists(String path);
	
	public String getFiles(String d);
}
