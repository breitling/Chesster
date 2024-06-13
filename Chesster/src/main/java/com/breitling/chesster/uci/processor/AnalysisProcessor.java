package com.breitling.chesster.uci.processor;

import static java.util.stream.Collectors.toMap;

import java.util.List;
import java.util.TreeMap;
import java.util.function.Function;

import com.breitling.chesster.uci.model.Analysis;
import com.breitling.chesster.uci.model.Move;
import com.breitling.chesster.uci.parser.InfoDepthParser;

public class AnalysisProcessor extends UCICommandProcessor<Analysis> 
{
    protected static InfoDepthParser infoDepthParser = new InfoDepthParser();
    
	@Override
    public Analysis process(List<String> list) 
    {
        TreeMap<Integer,Move> map = list.stream().filter(infoDepthParser::matches).map(infoDepthParser::parse)
                       .collect(toMap(Move::getPv, Function.identity(), (existing, replacement) -> replacement, TreeMap::new));
        
        if (map.isEmpty()) 
        {
            for(String line : list) 
            {
                if (line.equals("info depth 0 score cp 0")) 
                {
                    // is draw
                    return new Analysis(map, false, true);
                }
                if (line.equals("info depth 0 score mate 0")) 
                {
                    return new Analysis(map, true, false);
                }
            }
        }
        
        return new Analysis(map);
    }
}
