package com.breitling.chesster.connector;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.breitling.chesster.uci.UCI;
import com.fasterxml.jackson.databind.ObjectMapper;

import netscape.javascript.JSObject;

/**
 *
 * @author Robert
 */

public class JavaConnector
{
    private static final Logger LOG = LoggerFactory.getLogger(JavaConnector.class);
    private static DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    private ObjectMapper mapper = new ObjectMapper();
    
    @SuppressWarnings("unused")
	private JSObject javascriptConnector;
    
    public void setJavascriptConnector(JSObject conn) {
        this.javascriptConnector = conn;
    }
    
    public String getAnalysis(String path, String fen)
    {
    	if (fen.matches("([pnbrqkPNBRQK1-8]+\\/){7}[pnbrqkPNBRQK1-8]+\\s[bw]\\s(-|[kqKQ]{1,4})\\s(-|[a-h][36])(\\s\\d+){2}"))
    	{
	    	LOG.debug("Position: {}", fen);
	    	
			try 
			{
		    	UCI uci = new UCI();
		    	
		    	uci.start(path);
				uci.setOption("Threads", "12");
				uci.setOption("Hash", "4096");
				
				uci.positionFen(fen);
	
				var r = uci.analysis(28).getResult();
				
				uci.close();
				
				LOG.debug(r.getBestMove().toString());
				
				return mapper.writeValueAsString(r.getBestMove());
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
    
    public void exit(int value) 
    {
        LOG.debug("Exiting - exit code = {}", value);
        System.exit(value);
    }
    
    public void logIt(String... parts)
    {
    	LocalDateTime now = LocalDateTime.now();
    	StringBuilder sb = new StringBuilder();
    	
    	for (String p : parts)
    		sb.append(p).append(" ");
    	
        LOG.debug("LOG: {} - {}", now.format(formatter), sb.toString());
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
}
