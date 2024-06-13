package com.breitling.chesster.uci.processor;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

import java.util.List;
import java.util.Map;

import com.breitling.chesster.uci.model.EngineInfo;
import com.breitling.chesster.uci.option.EngineOption;
import com.breitling.chesster.uci.parser.EngineNameParser;
import com.breitling.chesster.uci.parser.EngineOptionParser;

public class EngineInfoProcessor extends UCICommandProcessor<EngineInfo> 
{
    protected static EngineNameParser engineNameParser = new EngineNameParser();
    protected static EngineOptionParser engineOptionParser = new EngineOptionParser();

	@Override
    @SuppressWarnings("rawtypes")
    public EngineInfo process(List<String> list) 
    {
        final var engineName = list.stream().filter(engineNameParser::matches).map(engineNameParser::parse)
                                    .findFirst().orElse("<<Unknown>>");
        
        final Map<String, EngineOption> options = list.stream().filter(engineOptionParser::matches)
        		                 .map(engineOptionParser::parse)
                        		 .collect(toMap(EngineOption::getName, identity()));
        
        return new EngineInfo(engineName, options);
    }
}