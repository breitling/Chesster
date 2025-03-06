package com.breitling.chesster;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Import;

import com.breitling.jclib.SharedConfigurationReference;

@SpringBootApplication(scanBasePackages="com.breitling.chesster")
@Import(SharedConfigurationReference.class)
public class ChessterApp 
{
	private static ApplicationContext context;
	
	@SuppressWarnings("unused")
	private static final Logger LOG = LoggerFactory.getLogger(ChessterApp.class);

	public static void main(String... args) 
	{
		context = SpringApplication.run(ChessterApp.class, args);
		FxApp.main(args);
	}
	
	public static <T extends Object> T getBean(Class<T> beanClass) {
        return context.getBean(beanClass);
    }
}
