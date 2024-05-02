package com.breitling.chesster;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ChessterApp 
{
	@SuppressWarnings("unused")
	private static final Logger LOG = LoggerFactory.getLogger(ChessterApp.class);

	public static void main(String... args) 
	{
		@SuppressWarnings("unused")
		var context = SpringApplication.run(ChessterApp.class, args);
		FxApp.main(args);
	}
}
