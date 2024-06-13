package com.breitling.chesster.uci.exceptions;

public class UCIExecutionException extends UCIRuntimeException 
{
    private static final long serialVersionUID = 6578828746672675023L;

	public UCIExecutionException(Throwable cause) {
        super(cause);
    }

    public UCIExecutionException(String message) {
        super(message);
    }
}
