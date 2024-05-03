package com.breitling.chesster.connector;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import netscape.javascript.JSObject;

/**
 *
 * @author Robert
 */

public class JavaConnector
{
    private static final Logger LOG = LoggerFactory.getLogger(JavaConnector.class);
    
    @SuppressWarnings("unused")
	private JSObject javascriptConnector;
    
    public void setJavascriptConnector(JSObject conn) {
        this.javascriptConnector = conn;
    }
    
    public String getUsers()
    {
    	return "Fred,Stan,Rodney,Chris";
    }
    
    public void exit(int value) 
    {
        LOG.debug("Exiting - exit code = {}", value);
        System.exit(value);
    }
    
    public void logIt(String... parts)
    {
    	StringBuilder sb = new StringBuilder();
    	
    	for (String p : parts)
    		sb.append(p).append(" ");
    	
        LOG.debug("LOG: {}", sb.toString());
    }
    
    public void log(String message) 
    {
    	System.out.print("CONSOLE.LOG: ");
    	System.out.println(message);
    }
}
