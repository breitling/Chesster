package com.breitling.chesster.uci.model;

import java.util.Map;

import com.breitling.chesster.uci.option.EngineOption;

@SuppressWarnings("rawtypes")
public class EngineInfo 
{
    private final String name;
	private final Map<String,EngineOption> options;

    public EngineInfo(String name, Map<String, EngineOption> options) 
    {
        this.name = name;
        this.options = options;
    }

    public String getName() {
        return name;
    }

    public Map<String,EngineOption> getOptions() {
        return options;
    }

    @Override
    public String toString() {
        return "EngineInfo{name='" + name + '\'' + ", options=" + options + '}';
    }
}