package com.breitling.chesster.uci.exceptions;

public class UCIInterruptedException extends UCIRuntimeException
{
    private static final long serialVersionUID = -4679770985753837620L;

	public UCIInterruptedException(Throwable cause) {
        super(cause);
    }

    public UCIInterruptedException(String message) {
        super(message);
    }
}
