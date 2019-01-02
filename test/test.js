var Parking =  artifacts.require("./Parking.sol");

var indexDestinatario = 4;

var prezzi = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var maxIndex = 11;
// var index = 0;
var durata = 3600;
var idPosto = 5;
var targa="AB123WW";
var destAddr = web3.eth.accounts[indexDestinatario];
var costo = idPosto*Math.pow(10, 18);
var timeStamp = 1740482231;
var timePrenotazione = 1840482231;
var maxTime = 10000000000;
var maxDurata = 86400;

contract("Parking", function(){


	it("Test acquisto funzionante", function(){
		return Parking.deployed().then(function(instance){
				parkingInstance = instance;
				return parkingInstance.acquisto(durata, idPosto, targa,{from:web3.eth.accounts[5], value:costo});
			}).then(function(receipt){
			 		assert.equal(receipt.logs.length, 1, "Non è scattato l'evento");
			      	assert.equal(receipt.logs[0].event, "Pagamento", "L'evento non è del tipo corretto");
			      	assert.equal(receipt.logs[0].args._from, web3.eth.accounts[5], "Mittente non corretto");
			      	assert.equal(receipt.logs[0].args._to, destAddr, "Destinatario non corretto");

			      	idSosta = receipt.logs[0].args._ricevuta;
			      	assert.equal(receipt.logs[0].args._costo, costo, "Prezzo non corretto");
			      	return parkingInstance.posti(idPosto);
			}).then(function(posto){
			      	assert.equal(posto[2], idSosta.toNumber(), "Sosta non creata");
      				return parkingInstance.soste(idSosta);
      		}).then(function(sosta){
			      	//assert.equal(sosta[0], ora, "Orario non corretto");
			      	assert.equal(sosta[1], durata, "Durata non corretta");
			      	assert.equal(sosta[2], targa, "Targa non corretta");
			      	assert.equal(sosta[3], maxIndex, "Tappo non corretto");
			      	assert.equal(sosta[4], idPosto, "Posto non corretto");
    	})
	});


	it("Test acquisto correttezza parametri", function(){
		return Parking.deployed().then(function(instance){
				parkingInstance = instance;
				return parkingInstance.acquisto(durata*24, idPosto, targa, {from:web3.eth.accounts[5], value:costo});
			}).then(assert.fail).catch(function(error) {
 					assert(error.message.indexOf("Acquisto: durata troppo lunga") >= 0, "Durata valida, entro il limite massimo");
					costo = maxIndex*Math.pow(10, 18);
					return parkingInstance.acquisto(durata, maxIndex, targa, {from:web3.eth.accounts[5], value:costo});
			}).then(assert.fail).catch(function(error) {
 					assert(error.message.indexOf("Acquisto: posto inesistente") >= 0, "Posto valido, esistente");
 					costo = idPosto*Math.pow(10, 18);
 					idPosto += 1;
 					return parkingInstance.acquisto(durata, idPosto, targa, {from:web3.eth.accounts[5], value:costo});
			}).then(assert.fail).catch(function(error) {
 					assert(error.message.indexOf("Acquisto: problemi con il pagamento") >= 0, "Nessun problema con il pagamento"); 	//questo è l'assert coi problemi, si dovrebbe risolvere
	    });
	});


	it("Test acquisto posto occupato", function(){
			return Parking.deployed().then(function(instance){
					parkingInstance = instance;
					costo = idPosto*Math.pow(10, 18);
					return parkingInstance.acquisto(durata, idPosto, targa, {from:web3.eth.accounts[5], value:costo});
			}).then(function(){
					return parkingInstance.acquisto(durata, idPosto, targa, {from:web3.eth.accounts[5], value:costo});
			}).then(assert.fail).catch(function(error) {
 					assert(error.message.indexOf("Acquisto: posto non disponibile") >= 0, "Posto disponibile");
	    });
	});


	it("Test prenotazione correttezza parametri", function(){
			return Parking.deployed().then(function(instance){
			  		parkingInstance = instance;
					return parkingInstance.prenotazione(0, durata, idPosto, targa,{from:web3.eth.accounts[5], value:costo});
				}).then(assert.fail).catch(function(error){
					assert(error.message.indexOf("Prenotazione: orario già passato") >= 0, "Orario valido, nel futuro");
					return parkingInstance.prenotazione(maxTime, durata, idPosto, targa, {from:web3.eth.accounts[5], value:costo});
				}).then(assert.fail).catch(function(error){
					assert(error.message.indexOf("Prenotazione: orario troppo avanti nel futuro") >= 0, "Orario valido, entro il limite massimo");
					return parkingInstance.prenotazione(timeStamp, maxDurata, idPosto, targa,{from: web3.eth.accounts[5], value: costo});
				}).then(assert.fail).catch(function(error){
					assert(error.message.indexOf("Prenotazione: durata troppo lunga") >= 0, "Durata valida, entro il limite massimo");
					return parkingInstance.prenotazione(timeStamp, durata, idPosto+100, targa, {from: web3.eth.accounts[5], value: costo});
				}).then(assert.fail).catch(function(error){
					assert(error.message.indexOf("Prenotazione: posto inesistente") >=0, "Posto valido, esistente");
					return parkingInstance.prenotazione(timeStamp, durata, idPosto, targa, {from:web3.eth.accounts[5], value:0});
				}).then(assert.fail).catch(function(error){
					assert(error.message.indexOf("Prenotazione: problemi con il pagamento") >= 0, "Nessun problema con il pagamento");
					return parkingInstance.prenotazione(timeStamp, durata, idPosto, targa,{from:web3.eth.accounts[5], value:costo});
				}).then(function(receipt){
					return parkingInstance.prenotazione(timeStamp, durata, idPosto, targa, {from:web3.eth.accounts[5], value:costo});
				}).then(assert.fail).catch(function(error){
					assert(error.message.indexOf("Prenotazione: posto non disponibile") >=0, "Posto disponibile");
 		});
	});


	it("Test prenotazione", function(){
			return Parking.deployed().then(function(instance){
					parkingInstance = instance;
					costo = idPosto*Math.pow(10, 18);
					return parkingInstance.prenotazione(timePrenotazione, durata, idPosto, targa, {from:web3.eth.accounts[5], value:costo});
				}).then(function(receipt){
				    idSosta = receipt.logs[0].args._ricevuta;
					assert.equal(receipt.logs.length, 1, "Non è scattato l'evento");
				    assert.equal(receipt.logs[0].event, "Pagamento", "L'evento non è del tipo corretto");
				    assert.equal(receipt.logs[0].args._from, web3.eth.accounts[5], "Mittente non corretto");
				    assert.equal(receipt.logs[0].args._to, destAddr, "Destinatario non corretto");
				    assert.equal(receipt.logs[0].args._costo, costo, "Prezzo non corretto");
				 	return parkingInstance.soste(idSosta);
			 	}).then(function(sosta){
		 			assert.equal(sosta[0].toNumber(), timePrenotazione, "Ora prenotazione non corretta");
		 			assert.equal(sosta[1].toNumber(), durata, "Durata non corretta");
			      	assert.equal(sosta[2], targa, "Targa non corretta");
			      	assert.equal(sosta[3], maxIndex, "Tappo non corretto");
			      	assert.equal(sosta[4], idPosto, "Posto non corretto");
	 	});

	});


	it("Test estensione funzionante", function(){
			return Parking.deployed().then(function(instance){//ottengo una istanza del contratto
					parkingInstance = instance;
					idPosto = 2;
					costo = idPosto*Math.pow(10, 18);
					return parkingInstance.acquisto(durata,idPosto,targa,{from:web3.eth.accounts[5], value:costo}); //compro il posto da estendere
				}).then(function(receipt){
			 		idSosta = receipt.logs[0].args._ricevuta;	//ottengo l'id della sosta da usare come parametro di estensione
			 		return parkingInstance.soste(idSosta);					//ottengo la sosta di cui sopra 
      			}).then(function(sosta){
		    		oraSosta = sosta[0].toNumber();
			    	return parkingInstance.estensione(idSosta, durata,{from:web3.eth.accounts[5], value:costo});	//a questo punto faccio l'estensione
		    	}).then(function(receipt){																		//controllo i vari campi della ricevuta
		    		assert.equal(receipt.logs.length, 1, "Non è scattato l'evento");
			    	assert.equal(receipt.logs[0].event, "Pagamento", "L'evento non è del tipo corretto");
			    	assert.equal(receipt.logs[0].args._from, web3.eth.accounts[5], "Mittente non corretto");
			    	assert.equal(receipt.logs[0].args._to, destAddr, "Destinatario non corretto");
			   	 	assert.equal(receipt.logs[0].args._costo, costo, "Prezzo non corretto");
  					return parkingInstance.soste(idSosta);														//ottengo la nuova sosta 
  				}).then(function(sosta){																		//vado a controllare che i campi della sosta si siano aggiornati bene
		      		assert.equal(sosta[0].toNumber(), oraSosta, "Ora non corretta");
		      		assert.equal(sosta[1], durata*2, "Durata non corretta");
		      		assert.equal(sosta[2], targa, "Targa non corretta");
					assert.equal(sosta[3], maxIndex, "Tappo non corretto");
		      		assert.equal(sosta[4], idPosto, "Posto non corretto");
      	})
	});


	it("Test estensione correttezza parametri", function(){
			return Parking.deployed().then(function(instance){//ottengo una istanza del contratto
					parkingInstance = instance;
					return parkingInstance.estensione(0,durata,{from:web3.eth.accounts[5], value:costo});//estendo una delle soste riservate
			}).then(assert.fail).catch(function(error) {
					assert(error.message.indexOf("Estensione: ID della sosta non valido") >= 0, "ID sosta valido");
					return parkingInstance.estensione(500,durata,{from:web3.eth.accounts[5], value:costo});//estendo una sosta valida ma che non è ancora instanziata quindi ha timestamp nullo quindi molto nel passato
			}).then(assert.fail).catch(function(error) {
					assert(error.message.indexOf("Estensione: sosta già scaduta") >= 0, "Sosta valida, ancora non scaduta");
					oraSosta += 36000;												//mi sposto avanti di 10 ore 
					return parkingInstance.prenotazione(oraSosta,durata,idPosto,targa,{from:web3.eth.accounts[5], value:costo}); //prenoto il posto da estendere
			}).then(function(receipt){
		 			idSosta = receipt.logs[0].args._ricevuta;	//ottengo l'id della sosta da usare come parametro di estensione
				    oraSosta += (3*durata);
					return parkingInstance.prenotazione(oraSosta,durata,idPosto,targa,{from:web3.eth.accounts[5], value:costo}); //prenoto il posto per far fallire l'estensione
			}).then(function(receipt){//mi tengo il vecchio idSosta
					return parkingInstance.estensione(idSosta,(2*durata),{from:web3.eth.accounts[5], value:(2*costo)});					//estendo la prima prenotazione effettuata senza riuscirci perchè sforo in quella successiva
			}).then(assert.fail).catch(function(error) {
					assert(error.message.indexOf("Estensione: posto non disponibile") >= 0, "Posto disponibile");
					return parkingInstance.estensione(idSosta,durata,{from:web3.eth.accounts[5], value:(2*costo)});					
			}).then(assert.fail).catch(function(error) {
					assert(error.message.indexOf("Estensione: problemi con il pagamento") >= 0, "Nessun problema con il pagamento");

      	});
	});


	it("Test ricercaPosto funzionante", function(){
			return Parking.deployed().then(function(instance){
					parkingInstance = instance;
					oraSosta = Math.floor(Date.now()/1000) + 7200;
					return parkingInstance.prenotazione(oraSosta,durata,idPosto,targa,{from:web3.eth.accounts[5], value:costo});
			}).then(function(receipt){
					oraSosta -= 3600;
					return parkingInstance.ricercaPosto.call(oraSosta, durata+20, {from:web3.eth.accounts[5]});
			}).then(function(disp){
					for (var i = 0; i < maxIndex-1; i++) {//nel vettore l'indice parte da 0
						if(i!=idPosto-1){
							assert.equal(disp[i], true, "Posto occupato");
						}else{
							assert.equal(disp[i], false, "Posto disponibile");
						}
					}     	
      	});
	});

	it("Test ricercaPosto correttezza parametri", function(){
		return Parking.deployed().then(function(instance){
			parkingInstance = instance;
			oraSosta = Math.floor(Date.now()/1000)-150;
			return parkingInstance.ricercaPosto(oraSosta, durata);
			}).then(assert.fail).catch(function(error) {
				assert(error.message.indexOf("Ricerca Posto: orario già passato") >= 0, "Orario valido, nel futuro");
				oraSosta += 10000000000;
				return parkingInstance.ricercaPosto(oraSosta, durata);
			}).then(assert.fail).catch(function(error) {
				assert(error.message.indexOf("Ricerca Posto: orario troppo avanti nel futuro") >= 0, "Orario valido, entro il limite massimo");
				oraSosta = Math.floor(Date.now()/1000);
				return parkingInstance.ricercaPosto(oraSosta, durata+86400);
			}).then(assert.fail).catch(function(error) {
				assert(error.message.indexOf("Ricerca Posto: durata troppo lunga") >= 0, "Durata valida, entro il limite massimo");
      		});
	});

});


