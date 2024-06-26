package com.breitling.chesster.uci.parser;

import java.util.regex.Matcher;

import com.breitling.chesster.uci.model.BestMove;

public class BestMoveParser extends AbstractParser<BestMove> 
{
    private static final String BEST_MOVE_REGEX = "bestmove\\s([\\d\\w]*)(\\sponder\\s([\\d\\w]*))?";

    private BestMoveParser(String regex) {
        super(regex);
    }

    public BestMoveParser() {
        this(BEST_MOVE_REGEX);
    }

    @Override
    protected BestMove doParse(String line, Matcher matcher)
    {
        var curr = matcher.group(1);
        var ponder = matcher.group(3);
        
        return new BestMove(curr, ponder);
    }
}
