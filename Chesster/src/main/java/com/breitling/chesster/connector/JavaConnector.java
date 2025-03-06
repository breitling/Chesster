package com.breitling.chesster.connector;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.breitling.chesster.service.ChessDotComService;
import com.breitling.chesster.service.DirectoryService;
import com.breitling.chesster.service.GameReviewService;
import com.breitling.chesster.uci.UCI;
import com.breitling.jclib.model.Database;
import com.breitling.jclib.model.Game;
import com.breitling.jclib.model.Note;
import com.breitling.jclib.util.Factory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import netscape.javascript.JSObject;

/**
 *
 * @author Robert
 */

@Component
public class JavaConnector
{
    private static final Logger LOG = LoggerFactory.getLogger(JavaConnector.class);
    private static DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    private ObjectMapper mapper = new ObjectMapper();
    
    @SuppressWarnings("unused")
	private JSObject javascriptConnector;
    
    @Autowired
    private DirectoryService dirservice;
    
    @Autowired
    private ChessDotComService cdcservice;
    
    @Autowired
    private GameReviewService grservice;
    
//  JCL SERVICES
    
    @Autowired
    private com.breitling.jclib.service.DatabaseService databaseService;
    
    @Autowired
    private com.breitling.jclib.service.GameService gameService;
    
//  ERROR HANDLERS
    
    public boolean onError(String msg, String url, Integer line, Integer col, Object exception) {
        System.out.println("Javascript: " + url + ":" + line + " " + msg);
        return true;
    }
    
//  PUBLIC METHODS
    
    public void setJavascriptConnector(JSObject conn) {
        this.javascriptConnector = conn;
    }
    
    public String getAnalysis(String path, String fen)
    {
    	LOG.debug("Position: {}", fen);
    	
    	if (fen.matches("([pnbrqkPNBRQK1-8]+\\/){7}[pnbrqkPNBRQK1-8]+\\s[bw]\\s(-|[kqKQ]{1,4})\\s(-|[a-h][36])(\\s\\d+){2}"))
    	{
			try 
			{
		    	UCI uci = UCI.create();
		    	
		    	uci.start(path);
				uci.setOption("Threads", "12");
				uci.setOption("Hash", "4096");
				
				uci.positionFen(fen);
	
				var r = uci.analysis(28).getResult();
				
				uci.close();
				
			//	LOG.debug(r.getBestMove().toString());
				
				var json = mapper.writeValueAsString(r.getBestMove());
				
				LOG.debug(json);
				
				return json;
			} 
			catch (IOException e) 
			{
				LOG.error("Analysis failure: {}", e.getMessage());
				return null;
			}
    	}
    	else
    	{
    		LOG.error("Bad fen: {}", fen);
    		return null;
    	}
    }
    
    public String getDatabases()
    {
    	String json = "[]";
    	
    	LOG.debug("Reading database info from store...");
    	
    	try
    	{
	    	var databases = databaseService.getDatabases();
	    	
	    	json = mapper.writeValueAsString(databases);
    	}
    	catch (Exception e)
    	{
    		LOG.error(e.getMessage());
    	}
    	
    	return json;
    }
    
    public Boolean exists(String path) {
    	return dirservice.exists(path);
    } 
    
    public String getFiles(String location) {
    	return dirservice.getFiles(location);
    }

    public String getGames(String id) 
    {
    	String json = "[ ]";
    	
		try 
		{
			json = mapper.writeValueAsString(gameService.getGames(id));
		} 
		catch (JsonProcessingException e) 
		{
			LOG.error(e.getMessage());
		}
    	
    	return json;
    }
    
    public Boolean deleteGame(String id, String gid) {
    	return gameService.deleteGame(id, gid);
    }
    
    public String findGames(String id, String fen)
    {
    	String json = "[ ]";
    	
    	try
    	{
    		json = mapper.writeValueAsString(gameService.findGames(id, fen));
		} 
		catch (JsonProcessingException e) 
		{
			LOG.error(e.getMessage());
		}
    	
    	return json;
    }
    
    public Boolean saveGame(String id, String json, Boolean generatePositions) 
    {
    	boolean rc = false;
    	
    	try 
    	{
			Game g = mapper.readValue(json, Game.class);
			rc  = gameService.saveGame(id, g, generatePositions);
		}
    	catch (JsonMappingException e) 
    	{
    		e.printStackTrace();
		} 
    	catch (JsonProcessingException e) 
    	{
			e.printStackTrace();
		}
    	
    	return rc;
    }
    
    public Boolean updateGame(String id, String json) 
    {
    	boolean rc = false;
    	
    	try 
    	{
			Game g = mapper.readValue(json, Game.class);
			
			rc = gameService.updateGame(id, g);
		}
    	catch (JsonMappingException e) 
    	{
    		e.printStackTrace();
		} 
    	catch (JsonProcessingException e) 
    	{
			e.printStackTrace();
		}
    	
    	return rc;
    }
    
    public String importGames(String id)
    {
    	String rc = "Failed";
    	
    	if (gameService.importGames(id))
    		rc = "Success";
    	
    	return rc;
    }
    
    public Boolean databaseExists(String name)
    {
    	return dirservice.databaseExists(name);
    }
    
    public void exit(int value) 
    {
        LOG.debug("Exiting - exit code = {}", value);
        System.exit(value);
    }
    
    public void logIt(Object o)
    {
    	LocalDateTime now = LocalDateTime.now();
    	StringBuilder sb = new StringBuilder();
    	
    	if (o instanceof String)
    		sb.append(o).append(" ");
    	else
    		sb.append(o.toString()).append(" ");
 
        LOG.debug("LOG: {} - {}", now.format(formatter), sb.toString());
    }
    
    public String saveDatabase(String name, String path, String notes)
    {
    	String rc = "Failed";
    	boolean b = databaseService.saveDatabase(Database.create(Factory.DAO.generateId(), name, path, notes));
    	
    	if (b)
    		rc = "Database successfully saved.";
    	else
    		rc = "Save Failed";
    	
    	return rc;
    }
    
    public String updateDatabase(String id, String name, String path, String notes)
    {
    	String rc = "Failed";
    	boolean b = databaseService.updateDatabase(Database.create(id, name, path, notes));
    	
    	if (b)
    		rc = "Database successfully updated.";
    	else
    		rc = "Update Failed";
    	
    	return rc;
    }
    
    public Boolean deleteDatabase(String id)
    {
    	return databaseService.deleteDatabase(id);
    }
    
    public void consoleLog(String message) 
    {
    	StringBuilder sb = new StringBuilder();
    	
    	sb.append(LocalDateTime.now().format(formatter)).append(" CONSOLE - ").append(message);
    	
    	System.out.println(sb.toString());
    }
    
    public void consoleLog(String... msgs) 
    {
    	StringBuilder sb = new StringBuilder();
    	
    	sb.append(LocalDateTime.now().format(formatter)).append(" CONSOLE - ");
    	
    	for (String m : msgs)
    		sb.append(m).append(" ");
    	
    	System.out.println(sb.toString());
    }
    
    public String getGamesFromCDC(String account, String year, String month, String timeClass)
    {
    	try
    	{
    		var games = cdcservice.getGames(account, year, month);
    	//  REMOVE VARIANTS LIKE CHESS960, ETC
    		var list = Stream.of(games).filter(g -> g.getRules().equals("chess")).collect(Collectors.toList());
    		
    		if (timeClass.equals("all"))
    			return mapper.writeValueAsString(list);
    		else
    			return mapper.writeValueAsString(list.stream().filter(g -> g.getTime_class().equals(timeClass)).collect(Collectors.toList()));
    	} 
    	catch (Exception e)
    	{
    		LOG.error(e.getMessage());
    	}
    		
    	return "[]";
    }
    
    public int reviewGame(String enginePath, int depth, int progress, String json) 
    {
    	try
    	{
    		if (progress == 0)
    		{
    			Game g = mapper.readValue(json, Game.class);
    			progress = grservice.startReview(enginePath, g, depth);
    		}
    		else
    		{
    			progress = grservice.isRunning();
    		}
    	}
    	catch (Exception e)
    	{
    		LOG.error(e.getMessage());
    	}
    	
//    	System.out.println(progress);
    	
    	return progress;
    }
    
    public String getReviewAnalysis() 
    {
    	try
    	{
    		var a = grservice.getReviewAnalysis();
    		String data = mapper.writeValueAsString(a);
//   		System.out.println(data);
    		return data;
    	} 
    	catch (Exception e)
    	{
    		LOG.error(e.getMessage());
    	}
    		
    	return "[]";
    }
    
    public String abortReview() 
    {
    	String rc = "Error aborting review";
    	
    	try
    	{
	    	if (grservice.isRunning() > 0)
	    	{
	    		if (grservice.abortReview())
	    			rc = "Aborted";
	    	}
    	}
    	catch(Exception e)
    	{
    		LOG.error(e.getMessage());
    	}
    	
    	return rc;
    }
    
    public String doGC()
    {
    	System.gc();
    	return "Done";
    }
    
    public String getNotes(String id, String gameId)
    {
    	String json = "[ ]";
    	Optional<List<Note>> list = gameService.getGameNotes(id, gameId);
    	
    	try 
    	{
    		if (list.isPresent())
    			json = mapper.writeValueAsString(list.get());
    	}
    	catch (JsonProcessingException e) 
		{
			LOG.error(e.getMessage());
		}
    	
    	return json;
    }
    
    public Boolean saveNote(String id, String json)
    {
    	boolean rc = false;
    	
    	try 
    	{
			Note note = mapper.readValue(json, Note.class);
			
			if (note.getId().length() == 0)
				rc = gameService.saveNote(id, note);
			else
				rc = gameService.updateNote(id, note);
		}
    	catch (JsonMappingException e) 
    	{
    		e.printStackTrace();
		} 
    	catch (JsonProcessingException e) 
    	{
			e.printStackTrace();
		}
    	
    	return rc;
    }
    
    public Boolean deleteNote(String id, String nid)
    {
    	boolean rc = false;
    	
    	rc = gameService.deleteNote(id, nid);
    	
    	return rc;
    }
}
