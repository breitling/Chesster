package com.breitling.chesster.uci;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.SQLException;
import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.breitling.chesster.uci.model.EngineInfo;
import com.breitling.chesster.uci.option.EngineOption;

public class UCITests 
{
	private UCI uci;
	
	@BeforeEach
	public void setupForTest() throws SQLException
	{
		this.uci = UCI.create();
	}
	
	@Test
	public void testFactory_NoArgs_Object()
	{	
		assertNotNull(this.uci);
	}
	
	@Test
	public void testStart_GoodPath_IsAlive()
	{
		this.uci.start("/Users/bobbr/Desktop/Chess/Stockfish/stockfish-16/stockfish-windows-x86-64-avx2.exe");
		
		assertTrue(this.uci.isRunning());
	}
	
	@Test
	@SuppressWarnings("rawtypes")
	public void testGetEngineInfo_Engine_List()
	{
		var info = this.uci.start("/Users/bobbr/Desktop/Chess/Stockfish/stockfish-16/stockfish-windows-x86-64-avx2.exe");
		
		assertNotNull(info);
		
		EngineInfo result = (EngineInfo) info.getResult();
		Map<String,EngineOption> options = result.getOptions();
		
		assertEquals(21, options.size());
		assertEquals(1, options.get("MultiPV").getDefaultValue());
//
//		System.out.println(options.keySet());
//		System.out.println(options.get("MultiPV"));
	}
	
	@Test
	@SuppressWarnings("unused")
	public void testPosition_GoodFen_Move()
	{
		var info = this.uci.start("/Users/bobbr/Desktop/Chess/Stockfish/stockfish-16/stockfish-windows-x86-64-avx2.exe");
		
		this.uci.positionFen("8/3KP2k/1Rp5/7P/p2P4/1p6/8/4r3 b - - 0 64");
		var m1 = this.uci.analysis(30).getResult();
		
		assertEquals("c6c5", m1.getBestMove().getLan());
		
		this.uci.positionFen("8/3KP2k/1R6/2p4P/p2P4/1p6/8/4r3 w - - 0 65");
		var m2 = this.uci.analysis(30).getResult();
		
		assertEquals("d4c5", m2.getBestMove().getLan());
		
		System.out.println(m2.toString());
	}
	
	@Test
	@SuppressWarnings("unused")
	public void testAnalysis_Fen_BestMove()
	{
		var info = this.uci.start("/Users/bobbr/Desktop/Chess/Stockfish/stockfish-16/stockfish-windows-x86-64-avx2.exe");
		this.uci.setOption("Threads", "12");
		this.uci.setOption("Hash", "4096");
		
		this.uci.positionFen("q4rk1/1n1Qbppp/2p5/1p2p3/1P2P3/2P4P/6P1/2B1NRK1 b - - 0 40");

		var r = this.uci.analysis(32).getResult();
		
		assertEquals("a8c8", r.getBestMove().getLan());
		
		System.out.println(r);
	}
	
	@AfterEach
	public void teardownForTest()
	{
		if (this.uci.isRunning())
			this.uci.close();
	}
}
