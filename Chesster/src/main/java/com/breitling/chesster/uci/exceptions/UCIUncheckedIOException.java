package com.breitling.chesster.uci.exceptions;

public class UCIUncheckedIOException extends UCIRuntimeException 
{
    private static final long serialVersionUID = 5458057261733071397L;

	public UCIUncheckedIOException(Throwable cause) {
        super(cause);
    }

    public UCIUncheckedIOException(String message) {
        super(message);
    }
}
