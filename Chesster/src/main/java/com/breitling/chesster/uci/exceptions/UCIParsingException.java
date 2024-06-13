package com.breitling.chesster.uci.exceptions;

public class UCIParsingException extends UCIRuntimeException 
{
    private static final long serialVersionUID = 2500627021402476921L;

	public UCIParsingException(String line) {
        super("Cannot parse line: " + line);
    }
}
