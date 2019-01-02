/**
  ******************************************************************************
  * @file 	 Parking.c
  * @author  Umberto Coppola Bottazzi, Alfonso Fezza
  * @version V1.3
  * @date    22-Ottobre-2018
  * @brief   Questo è il contratto per un parcheggio sulla rete Ethereum. Il
  *			 file definisce tutte le funzioni necessarie al funzionamento.
  ******************************************************************************
  */

/**
  * @mainpage Parking Smart Contract
  * Parcheggio per il quale il pagamento è effettuato tramite la rete ethereum. 
  * I posti sono numerati e sono conosciute le coordinate di ciascun posto, 
  * inoltre ogni zona, in cui le strisce verdi sono situate, ha un prezzo che 
  * varia in base alla centralità. I servizi che si vogliono offrire sono: <br> 
  * - Ricerca dei posti disponibili in città <br> 
  * - Pagamento, in loco, del parcheggio <br> 
  * - Estensione del periodo di sosta <br> 
  * - Prenotazione in anticipo del parcheggio <br> 
  *   
  */
//contract Parking {

//uint [] public postiLiberi;					/* vettore di posti disponibili*/
// bool [] public postiLiberi;					/* vettore di posti disponibili*/
uint nPosti = 10;						    /*!< numero totale di posti nel parcheggio*/
string targaProva="AB000CD"; 				/*!< placeholder per la targa*/
uint maxTime = 10000000000; 				/*!< timestamp usato come limite superiore*/
uint maxDurata = 86400;						/*!< durata in secondi di un giorno, usato come limite superiore*/
uint ether1 = 1000000000000000000; 			/*!< valore in wei di 1 ether*/
address addr;								/*!< indirizzo del proprietario del parcheggio*/
address ownAddr;							/*!< indirizzo del proprietario del parcheggio*/

//DA eliminare
//uint[] public printedList;

/**
  * @struct Posto
  * @brief struttura del posto
*/
struct Posto{
	string coordinate; 						/*!< coordinate geografiche*/
	uint prezzo; 							/*!< prezzo in ether*/
	uint idSosta; 							/*!< indice della sosta acquistata più di recente*/
};

/**
  * @struct Sosta
  * @brief struttura della sosta
*/
struct Sosta{
	uint ora; 								/*!< ts dell'ora in cui è comincia la sosta*/
	uint durata; 							/*!< durata, in secondi, della sosta*/
	string targa; 							/*!< targa della macchina che si vuole parcheggiare*/
	uint nextSosta; 						/*!< indice della prossima sosta su quel posto*/
	uint idPosto; 							/*!< indice del posto*/
};

// mapping (uint => Posto) public posti; 		/*!< mapping per indicizzare i posti*/
// mapping (uint => Sosta) public soste;		/*!< mapping per indicizzare le soste*/

// event Pagamento(address _from, address _to, uint _ricevuta,  uint _costo);		/*!< evento di tipo Pagamento*/

/**
  * @brief  Costruttore del contratto, viene chiamato solo al momento del deploy.
  * @param _payAccount indirizzo dell'account che riceverà i pagamenti
  */
constructor(address _payAccount) public {
	addr = _payAccount;
	ownAddr = msg.sender;

	uint maxIndex = nPosti+1;

	for(uint i=1; i<maxIndex; i++){
		posti[i] = Posto("Coordinate...",i,i);
		/* Aggiungo sosta Limite Inferiore, una per ciascun posto --> GMT: Thursday 1 January 1970 00:00:00 */
		soste[i] = Sosta(0,0,targaProva,maxIndex,i);
	}

	/* Aggiungo sosta Limite Superiore --> GMT: Saturday 20 November 2286 17:46:40 */
	soste[maxIndex] = Sosta(maxTime,0,targaProva,maxIndex,0);
}

/**
  * @brief Controlla la disponibilità di un posto per un certo orario.
  * @param _tsOwn timestamp dell'orario in cui si desidera il posto
  * @param _dOwn durata della sosta
  * @param _headSoste riferimento alla testa della lista delle soste di un particolare posto
  *	@return _i: indice della prima sosta che ha il ts maggiore di quello cercato
  *	@return _iPrev: indice della sosta precedente a quella trovata
  *	@return _disp: informazione sulla disponibilità del posto.
  *   Questo parametro può assumere i seguenti valori:
  *   @arg true, se il posto è disponibile
  *   @arg false, se il posto non è disponibile
  */
function checkDisp(uint _tsOwn, uint _dOwn, uint _headSoste){// private view
	//returns (uint , uint , bool) {

	uint _i = _headSoste;
	uint _iPrev = _headSoste;

	while(_tsOwn > soste[_i].ora){
		_iPrev = _i;
		_i = soste[_i].nextSosta;
	}

	if(_tsOwn + _dOwn < soste[_i].ora){
		if((soste[_iPrev].ora + soste[_iPrev].durata) < _tsOwn) {
			return (_iPrev,_i,true);
		}
	}

	return (_iPrev,_i,false);
}

/**
  * @brief  Permette di pagare la sosta.
  * @param 	_prezzo costo in wei della sosta
  * @param 	_idSosta id della sosta appena generato, usato come ricevuta di pagamento
  *	@return _res: informazione sulla riuscita del pagamento.
  *   Questo parametro può assumere i seguenti valori:
  *     @arg true, se il pagamento è riuscito
  *     @arg false, se il pagamento non è riuscito
  */
function pago(uint _prezzo, uint _idSosta){// public payable returns (bool) {

	if(msg.value != _prezzo) return false;
	if(msg.sender.balance < _prezzo) return false;

	//addr.send(msg.value);							//sarebbe più corretto usare questa perchè ritorna true o false e pago è chiamata con una require
		addr.transfer(msg.value);						//se qua facciamo transfer non dovrebbe essere necessario usare require(non è vero va cmq usato per terminare con errore se prezzo non si trova) per chiamarla però potrebbe anche essere utile come raise
	emit Pagamento(msg.sender, addr,_idSosta, msg.value);

	return true;
}

/**
  * @brief  Permette di acquistare una sosta in questo momento.
  * @param  _dOwn durata della sosta
  * @param 	_idPosto indice del posto su cui si vuole sostare
  * @param 	_targa targa della macchina da parcheggiare
  */
function acquisto(uint _dOwn, uint _idPosto, string _targa){// public payable {
	bool _disp; 								/* disponibilità del posto*/
	uint _next; 								/* indice della prossima sosta*/
	uint _prev; 								/* indice della sosta precedente*/
	uint _ora = now; 							/* ts di questo momento*/

	require((_dOwn < maxDurata), "Acquisto: durata troppo lunga");
	require((_idPosto < nPosti), "Acquisto: posto inesistente");

	(_prev,_next,_disp) = checkDisp(_ora, _dOwn, posti[_idPosto].idSosta);
	require(_disp, "Acquisto: posto non disponibile");

	//sostituire ora con l'hash
	uint _idSosta = _ora;													/* hash usato come indice per le soste*/
	uint _prezzo =  ether1*(_dOwn/3600)*posti[_idPosto].prezzo; 	//credo si debba fare un arrotondamento	/*!< costo del posto, in wei*/
    require(pago(_prezzo,_idSosta), "Acquisto: problemi con il pagamento");

	soste[_idSosta] = Sosta(_ora, _dOwn, _targa, _next, _idPosto);
	posti[_idPosto].idSosta = _idSosta;
}

/**
  * @brief  Permette di acquistare una sosta per un momento futuro.
  * @param  _tsOwn timestamp dell'orario in cui si desidera il posto
  * @param  _dOwn durata della sosta
  * @param 	_idPosto indice del posto su cui si vuole sostare
  * @param 	_targa targa della macchina da parcheggiare
  */
function prenotazione(uint _tsOwn, uint _dOwn, uint _idPosto, string _targa){// public payable {
	bool _disp; 								/* disponibilità del posto*/
	uint _next; 								/* indice della prossima sosta*/
	uint _prev; 								/* indice della sosta precedente*/

	require((_tsOwn > (now - 120)), "Prenotazione: orario già passato");

	require((_tsOwn < maxTime), "Prenotazione: orario troppo avanti nel futuro");
	require((_dOwn < maxDurata), "Prenotazione: durata troppo lunga");
	require((_idPosto < nPosti), "Prenotazione: posto inesistente");

    (_prev,_next,_disp) = checkDisp(_tsOwn, _dOwn, posti[_idPosto].idSosta);
	require(_disp,"Prenotazione: posto non disponibile");  																						

	//sostituire ora con l'hash
   	uint _idSosta = _tsOwn;														/* hash usato come indice per le soste*/
    uint _prezzo =  ether1*(_dOwn/3600)*posti[_idPosto].prezzo;	/* costo del posto, in wei*/
    require(pago(_prezzo,_idSosta), "Prenotazione: problemi con il pagamento");

	soste[_idSosta] = Sosta(_tsOwn, _dOwn, _targa, _next, _idPosto);
	soste[_prev].nextSosta = _idSosta;
}

/**
  * @brief  Permette di ricercare tutti i posti disponibili per un particolare orario.
  * @param  _tsOwn timestamp dell'orario in cui si desidera il posto
  * @param  _dOwn durata della sosta
  *	@return vettore di posti liberi
  */
function ricercaPosto(uint _tsOwn, uint _dOwn){// public returns(bool []) {
	bool _disp; 								/* disponibilità del posto*/
	uint _next; 								/* indice della prossima sosta*/
	uint _prev; 								/* indice della sosta precedente*/

	require((_tsOwn > (now - 120)), "Ricerca Posto: orario già passato");

	require((_tsOwn < maxTime), "Ricerca Posto: orario troppo avanti nel futuro");
	require((_dOwn < maxDurata), "Ricerca Posto: durata troppo lunga");

	bool [] _posti;
		while(_posti.length != 0){
	    delete _posti[_posti.length-1];
	    _posti.length--;
	}
	uint maxIndex = nPosti+1;

	for(uint i=1; i<maxIndex; i++){
		(_prev,_next,_disp) = checkDisp(_tsOwn, _dOwn, posti[i].idSosta); 
		_posti.push(_disp);
	}

	return _posti;
}

/**
  * @brief  Permette di estendere una sosta già acquistata.
  * @param 	_idSosta indice della sosta già acquistata
  * @param  _dOwn nuova durata durata della sosta
  */
function estensione(uint _idSosta, uint _dOwn){// public payable {

	/* Le soste con ID da 0 a nPosti sono riservate*/
  	require(_idSosta > nPosti, "Estensione: ID della sosta non valido");

    uint _ora = soste[_idSosta].ora + soste[_idSosta].durata;						/* l'estensione comincia del termine della sosta*/
  	require(_ora > (now - 120),"Estensione: sosta già scaduta");		//voglio dare un tampone dallo scadere della sosta di 2 minuti

    uint _oraNext = soste[soste[_idSosta].nextSosta].ora; 							/* ts dell'orario di inizio della prossima sosta*/
    require(((_ora + _dOwn)<_oraNext), "Estensione: posto non disponibile");

    /* Se la sosta è valida, non è scaduta e non sfora in una sosta prenotata, allora posso estenderla*/
    soste[_idSosta].durata += _dOwn;

   	uint _prezzo =  ether1*(_dOwn/3600)*posti[soste[_idSosta].idPosto].prezzo;  	/* costo del posto, in wei*/
    require(pago(_prezzo, _idSosta), "Estensione: problemi con il pagamento");
}


// function stampaLista(uint _idPosto) public returns (uint) {//, uint[]) {
// 		uint _i = posti[_idPosto].idSosta;
//     uint _k = 0;

//     while(printedList.length != 0){
// 	    delete printedList[printedList.length-1];
// 	    printedList.length--;
// 		}

//     while(soste[_i].ora != maxTime){
//  	  printedList.push(_i);
//       _i = soste[_i].nextSosta;
//       _k++;
// 		}

//     _k++;
// 	printedList.push(_i);

// 	return _k;
// 	//return (_k, printedList);
// }

// }

