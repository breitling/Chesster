import { Variation } from "./Variation";

export interface Game {
	id : string;
	sourceId : string;
	white : string;
	whiteELO : string;
	black : string;
	blackELO : string;
	event : string;
	site : string;
	eventDate : string;
	timeControl : string;
	round : number;
	date : string;
	result : string;
	eco : string;
	fen : string;
	moveCount : number;
	moves : string;
	variations : Variation [];
}