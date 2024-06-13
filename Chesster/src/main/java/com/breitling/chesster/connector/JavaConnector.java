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
		try 
		{
	    	UCI uci = new UCI();
	    	
	    	uci.start(path);
			uci.setOption("Threads", "12");
			uci.setOption("Hash", "4096");
			
			uci.positionFen(fen);

			var r = uci.analysis(28).getResult();
			
			uci.close();
			
			return mapper.writeValueAsString(r.getBestMove());
		} 
		catch (IOException e) 
		{
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
