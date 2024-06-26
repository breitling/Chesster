package com.breitling.chesster.uci.parser;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.breitling.chesster.uci.exceptions.UCIParsingException;

public abstract class AbstractParser<T> 
{
    protected final String regex;
    protected final Pattern pattern;

    public AbstractParser(String regex) 
    {
        this.regex = regex;
        this.pattern = Pattern.compile(regex);
    }

    public boolean matches(String line) {
        return pattern.matcher(line).matches();
    }

    protected abstract T doParse(String line, Matcher matcher);

    public T parse(String line) 
    {
        var matcher = pattern.matcher(line);
        
        if (matcher.matches()) {
            return doParse(line, matcher);
        }
        
        throw new UCIParsingException(line);
    }
}