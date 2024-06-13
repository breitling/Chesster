package com.breitling.chesster.uci.exceptions;

public class UCIUnknownCommandException extends UCIRuntimeException 
{
    private static final long serialVersionUID = 3217279751342245708L;

	public UCIUnknownCommandException(String msg) {
        super(msg);
    }
}
