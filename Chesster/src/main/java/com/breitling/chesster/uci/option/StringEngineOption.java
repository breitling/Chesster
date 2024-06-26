package com.breitling.chesster.uci.option;

public class StringEngineOption extends EngineOption<String> 
{
    public StringEngineOption(String name, String defaultValue) {
        super(name, defaultValue);
    }

    @Override
    public String toString() {
        return "StringEngineOption{name='" + name + '\'' + ", defaultValue=" + defaultValue + '}';
    }
}
