package com.breitling.chesster.uci.exceptions;

public class UCITimeoutException extends UCIRuntimeException 
{
    private static final long serialVersionUID = -314843009915284870L;

	public UCITimeoutException(Throwable cause) {
        super(cause);
    }
}
