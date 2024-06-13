package com.breitling.chesster.uci.processor;

import java.util.List;

import com.breitling.chesster.uci.exceptions.UCIRuntimeException;
import com.breitling.chesster.uci.model.BestMove;
import com.breitling.chesster.uci.parser.BestMoveParser;

public class BestMoveProcessor extends UCICommandProcessor<BestMove> 
{
    protected static BestMoveParser bestMoveParser = new BestMoveParser();

    @Override
    public BestMove process(List<String> list) {
        return list.stream().filter(bestMoveParser::matches).findFirst().map(bestMoveParser::parse)
                    .orElseThrow(()->new UCIRuntimeException("Cannot find best movement in engine output!\n"));
    }
}
