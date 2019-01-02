# SmartContract-Parking

distributedApplication(dApp) per un parcheggio su blockchain ethereum tramite smart contract. L'applicazione prevede l'acquisto di un posto al momento dell'arrivo, la possibilità di prenotarlo in anticipo, la possibilità di cercare i posti disponibili e di estendere una sosta acquistata in precedenza.  

## Dipendenze e Tool Necessari

Prima di compilare la dApp è necessario risolvere alcune dipendenze.

### Node Package Manager - NPM

La prima cosa di cui abbiamo bisogno è NPM, che è fornito con [Node.js](https://nodejs.org/en/). Si può controllare se node è già installato digitando nel terminale:

`node -v`

Altrimenti si può installare node scaricandolo dal sito ufficiale. 

### Truffle Framework 

La seconda cosa che serve è [Truffle](https://truffleframework.com/truffle). Truffle fornisce una serie di strumenti, che ci permette di scrivere smart contracts con il linguaggio di programmazione Solidity. Inoltre permette di testare i contratti e di metterli a deploy nella blockchain.

Si può installare truffle digitando nel terminale:

`npm install truffle -g` 

### Ganache

La prossima dipendenza è [Ganache](https://truffleframework.com/ganache), una blockchain di sviluppo locale, che fornisce 10 account con relativi indirizzi e 100 ether "fake" già caricati. Si può installare Ganache scaricandolo dal sito ufficiale.    

## Compilare il Progetto

Per prima cosa bisogna scaricare il codice da git tramite il comando:

```
git clone http://dev.conf.meetecho.com/AT-Projects/EthereumParking.git
```

Dopodichè occorre spostarsi nella cartella dello smart contract:

```
cd EthereumParking
```

A questo punto abbiamo bisogno di avviare Ganache, dopodichè apriamo il terminale e digitiamo:

```
truffle migrate --reset
```

... che effettuerà una migrazione della nostra applicazione. In parole povere, una migrazione è una serie di script che effettuano il deploy dello smart contract. Per effettuare test locali è necessaria una rete di test come Ganache.

## Interagire con lo Smart Contract 

Una volta effettuata la migrazione dello smart contract, è possibile ottenerne una instanza con cui poter interagire. Per fare ciò digitiamo nel terminale:

```
truffle console
```
Ed otteniamo una shell di questo tipo

`truffle(development)> `

La console truffle ha il vantaggio di avere disponibile al suo interno la libreria web3, già impostata e pronta per la connessione alla rete di test. A questo punto otteniamo una istanza del contratto:

```
> Parking.deployed().then(function(instance) { dApp = instance })
```
Ora possiamo interagire con il nostro contratto, tramite la variabile dApp, e chiamare le sue funzioni pubbliche. Per sapere quali sono le funzioni chiamabili sul contratto fare riferimento alla documentazione. Da notare che se il costo per un posto non è corretto e il pagamento non è fatto per un multiplo intero di un'ora, verrà sollevata un'eccezione "problemi con il pagamento".

## Testing

La suite Truffle permette di effettuare dei test semplicemente creando un file `test.js` nella cartella `test/`. Sono forniti dei test per verificare che tutti i controlli di correttezza, implementati nel contratto, vengano attivati. Per lanciare i test basta digitare nel terminale:

```
truffle test
```

Oppure nella console truffle:

```
> test
``` 

Da notare che eseguire il comando `test` consuma gli ether "fake" nella rete di test, quindi è necessario riavviare Ganache se si usa il comando troppe volte. 

## Resources

* La documentazione è disponibile alla directory git di questo progetto ed è stata realizzata con [Doxygen](http://www.doxygen.org/).

