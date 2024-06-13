package com.breitling.chesster.uci.exceptions;

public class UCIRuntimeException extends RuntimeException 
{
    private static final long serialVersionUID = -6097785181678605472L;

	public UCIRuntimeException(Throwable cause) {
        super(cause);
    }

    public UCIRuntimeException(String message) {
        super(message);
    }
}