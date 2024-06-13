package com.breitling.chesster.uci;

import static com.breitling.chesster.uci.Break.breakOn;
import static java.lang.String.format;
import static java.util.concurrent.CompletableFuture.supplyAsync;
import static java.util.function.Function.identity;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.Function;
import java.util.function.Predicate;

import com.breitling.chesster.uci.exceptions.UCIExecutionException;
import com.breitling.chesster.uci.exceptions.UCIInterruptedException;
import com.breitling.chesster.uci.exceptions.UCIRuntimeException;
import com.breitling.chesster.uci.exceptions.UCITimeoutException;
import com.breitling.chesster.uci.exceptions.UCIUncheckedIOException;
import com.breitling.chesster.uci.exceptions.UCIUnknownCommandException;
import com.breitling.chesster.uci.model.Analysis;
import com.breitling.chesster.uci.model.BestMove;
import com.breitling.chesster.uci.model.EngineInfo;
import com.breitling.chesster.uci.processor.AnalysisProcessor;
import com.breitling.chesster.uci.processor.BestMoveProcessor;
import com.breitling.chesster.uci.processor.EngineInfoProcessor;

public class UCI 
{
	private static final long DEFAULT_TIMEOUT_VALUE = 60_000L;
	
    private final long defaultTimeout;

    private Process process = null;
    private BufferedReader reader = null;
    private OutputStreamWriter writer = null;
    
//  PROCESSORS
    
    public static final BestMoveProcessor bestMove = new BestMoveProcessor();
    public static final AnalysisProcessor analysis = new AnalysisProcessor();    
    public static final EngineInfoProcessor engineInfo = new EngineInfoProcessor();
    
//  FACTORIES
    
    public static UCI create() {
    	return new UCI();
    }
    
    public static UCI create(long timeout) {
    	return new UCI(timeout);
    }
    
//  CONSTRUCTORS
    
    public UCI() {
        this(DEFAULT_TIMEOUT_VALUE);
    }
    
    public UCI(long defaultTimeout) {
        this.defaultTimeout = defaultTimeout;
    }

//  PUBLIC METHODS
    
    public UCIResponse<EngineInfo> start(String cmd) 
    {
        var pb = new ProcessBuilder(cmd);
        UCIResponse<EngineInfo> options = null;
        
        try 
        {
            this.process = pb.start();
            this.reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            this.writer = new OutputStreamWriter(process.getOutputStream());

            options = getEngineInfo();
        } 
        catch (IOException e) 
        {
            throw new UCIRuntimeException(e);
        }
        
        return options;
    }
    
    public Boolean isRunning()
    {
    	if (this.process == null)
    		return false;
    	else
    		return this.process.isAlive();
    }
    
    public void close() 
    {
    	if (this.process != null)
    	{
//	        try 
//	        {
//	            reader.close();
//	            writer.flush();
//	            writer.close();
//	        } 
//	        catch (IOException e) 
//	        {
//	            e.printStackTrace();
//	        }
	        
	        if (this.process.isAlive())
	            this.process.destroy();	
    	}
    }

    public long getDefaultTimeout() {
        return defaultTimeout;
    }
    
//  UCI COMMANDS
    
    public <T> UCIResponse<T> command(String cmd, Function<List<String>, T> commandProcessor, Predicate<String> breakCondition) {
        return command(cmd, commandProcessor, breakCondition, defaultTimeout);
    }
    
    public UCIResponse<EngineInfo> getEngineInfo() {
        return command("uci", engineInfo::process, breakOn("readyok"), defaultTimeout);
    }
    
    public UCIResponse<List<String>> uciNewGame(long timeout) {
        return command("ucinewgame", identity(), breakOn("readyok"), timeout);
    }

    public UCIResponse<List<String>> uciNewGame() {
        return command("ucinewgame", identity(), breakOn("readyok"), defaultTimeout);
    }

    public UCIResponse<List<String>> setOption(String optionName, String value, long timeout) {
        return command(format("setoption name %s value %s", optionName, value), identity(), breakOn("readyok"), timeout);
    }

    public UCIResponse<List<String>> setOption(String optionName, String value) {
        return setOption(optionName, value, defaultTimeout);
    }

    public UCIResponse<List<String>> positionFen(String fen, long timeout) {
        return command(format("position fen %s", fen), identity(), breakOn("readyok"), timeout);
    }

    public UCIResponse<List<String>> positionFen(String fen) {
        return positionFen(fen, defaultTimeout);
    }

    public UCIResponse<BestMove> bestMove(int depth, long timeout) {
        return command(format("go bestmove depth %d", depth), bestMove::process, breakOn("bestmove"), timeout);
    }

    public UCIResponse<BestMove> bestMove(int depth) {
        return bestMove(depth, defaultTimeout);
    }

    public UCIResponse<BestMove> bestMove(long moveTime, long timeout) {
        return command(format("go bestmove movetime %d", moveTime), bestMove::process, breakOn("bestmove"), timeout);
    }

    public UCIResponse<BestMove> bestMove(long moveTime) {
        return bestMove(moveTime, defaultTimeout);
    }

    public UCIResponse<Analysis> analysis(long moveTime, long timeout) {
        return command(format("go movetime %d", moveTime), analysis::process, breakOn("bestmove"), timeout);
    }

    public UCIResponse<Analysis> analysis(long moveTime) {
        return analysis(moveTime, defaultTimeout);
    }

    public UCIResponse<Analysis> analysis(int depth, long timeout) {
        return command(format("go depth %d", depth), analysis::process, breakOn("bestmove"), timeout);
    }

    public UCIResponse<Analysis> analysis(int depth) {
        return analysis(depth, defaultTimeout);
    }
    
//  PRIVATE METHODS
    
    private <T> UCIResponse<T> command(String cmd, Function<List<String>, T> commandProcessor, Predicate<String> breakCondition, long timeout)
    {
        CompletableFuture<List<String>> command = supplyAsync(() -> {
            final List<String> output = new ArrayList<>();
            
            try 
            {
                writer.flush();
                writer.write(cmd + "\n");
                writer.write("isready\n");
                writer.flush();
                
                String line = "";
                
                while ((line = reader.readLine()) != null) 
                {
                    if (line.contains("Unknown command")) {
                        throw new UCIUnknownCommandException(line);
                    }
                    if (line.contains("Unexpected token")) {
                        throw new UCIUnknownCommandException("Unexpected token: " + line);
                    }
                    
                    output.add(line);
                    
                    if (breakCondition.test(line)) {
                        break;
                    }
                }
            } 
            catch (IOException e) 
            {
                throw new UCIUncheckedIOException(e);
            } 
            catch (RuntimeException e) 
            {
                throw new UCIRuntimeException(e);
            }
            return output;
        });

        CompletableFuture<UCIResponse<T>> processorFuture = command.handle((list, ex) -> {
            try 
            {
                var result = commandProcessor.apply(list);
                return new UCIResponse<>(result, (UCIRuntimeException) ex);
            } 
            catch (RuntimeException e) 
            {
                return new UCIResponse<T>(null, new UCIRuntimeException(e));
            }
        });

        try 
        {
            return processorFuture.get(timeout, TimeUnit.MILLISECONDS);
        } 
        catch (TimeoutException e) 
        {
            return new UCIResponse<>(null, new UCITimeoutException(e));
        } 
        catch (RuntimeException e ) 
        {
            return new UCIResponse<>(null, new UCIRuntimeException(e));
        } 
        catch (InterruptedException e) 
        {
           return new UCIResponse<>(null, new UCIInterruptedException(e));
        } 
        catch (ExecutionException e) 
        {
           return new UCIResponse<>(null, new UCIExecutionException(e));
        }
    }
}
