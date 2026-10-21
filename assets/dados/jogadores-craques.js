/* Posição exata dos craques no "Monte seu time" (monte-seu-time.html). A busca usa os elencos atuais
   (assets/dados/jogadores-todos.js), que só dizem defensor, meio-campista ou atacante; quem está aqui entra na
   posição certa. Nomes de jogadores aposentados não aparecem (não estão em nenhum elenco).
   Formato "Nome|POSIÇÃO". Posições: GOL, LD, ZAG, LE, VOL, MC, MEI, PD, PE, CA. */
window.JOGADORES_CRAQUES = [
  /* goleiros */
  'Gianluigi Buffon|GOL', 'Lev Yashin|GOL', 'Manuel Neuer|GOL', 'Iker Casillas|GOL', 'Oliver Kahn|GOL', 'Peter Schmeichel|GOL',
  'Dino Zoff|GOL', 'Gordon Banks|GOL', 'Taffarel|GOL', 'Marcos|GOL', 'Rogério Ceni|GOL', 'Júlio César|GOL', 'Dida|GOL',
  'Alisson Becker|GOL', 'Ederson|GOL', 'Thibaut Courtois|GOL', 'Jan Oblak|GOL', 'Marc-André ter Stegen|GOL', 'Gianluigi Donnarumma|GOL',
  'Emiliano Martínez|GOL', 'Edwin van der Sar|GOL', 'Petr Čech|GOL', 'Gilmar|GOL', 'Cássio|GOL', 'Weverton|GOL', 'Hugo Souza|GOL',
  'Fábio|GOL', 'Rossi|GOL', 'Bento|GOL', 'John|GOL', 'David de Gea|GOL', 'Mike Maignan|GOL', 'Yann Sommer|GOL',
  /* laterais direitos */
  'Cafu|LD', 'Carlos Alberto Torres|LD', 'Djalma Santos|LD', 'Jorginho|LD', 'Dani Alves|LD', 'Maicon|LD', 'Philipp Lahm|LD',
  'Trent Alexander-Arnold|LD', 'Achraf Hakimi|LD', 'Kyle Walker|LD', 'Dani Carvajal|LD', 'Jules Koundé|LD', 'Reece James|LD',
  'Danilo|LD', 'Vanderson|LD', 'Wesley|LD', 'Javier Zanetti|LD', 'Lilian Thuram|LD', 'Gary Neville|LD', 'Varela|LD', 'Mariano|LD',
  /* zagueiros */
  'Franz Beckenbauer|ZAG', 'Paolo Maldini|ZAG', 'Franco Baresi|ZAG', 'Fabio Cannavaro|ZAG', 'Sergio Ramos|ZAG', 'Carles Puyol|ZAG',
  'Bobby Moore|ZAG', 'Virgil van Dijk|ZAG', 'Rio Ferdinand|ZAG', 'John Terry|ZAG', 'Alessandro Nesta|ZAG', 'Gerard Piqué|ZAG',
  'Thiago Silva|ZAG', 'Marquinhos|ZAG', 'Lúcio|ZAG', 'Aldair|ZAG', 'Juan|ZAG', 'Mauro Galvão|ZAG', 'Ricardo Rocha|ZAG',
  'Gabriel Magalhães|ZAG', 'Éder Militão|ZAG', 'William Saliba|ZAG', 'Rúben Dias|ZAG', 'Antonio Rüdiger|ZAG', 'Joško Gvardiol|ZAG',
  'Alessandro Bastoni|ZAG', 'Ronald Araújo|ZAG', 'Pau Cubarsí|ZAG', 'Leny Yoro|ZAG', 'Giorgio Chiellini|ZAG', 'Leonardo Bonucci|ZAG',
  'Mats Hummels|ZAG', 'Matthijs de Ligt|ZAG', 'Daniel Passarella|ZAG', 'Elías Figueroa|ZAG', 'Gamarra|ZAG', 'Miranda|ZAG',
  'Léo Ortiz|ZAG', 'Gustavo Gómez|ZAG', 'Murilo|ZAG', 'Fabrício Bruno|ZAG',
  /* laterais esquerdos */
  'Roberto Carlos|LE', 'Marcelo|LE', 'Nílton Santos|LE', 'Júnior|LE', 'Branco|LE', 'Leonardo|LE', 'Ashley Cole|LE', 'Jordi Alba|LE',
  'Alphonso Davies|LE', 'Theo Hernández|LE', 'Andrew Robertson|LE', 'Alex Sandro|LE', 'Filipe Luís|LE', 'Alex Telles|LE',
  'Nuno Mendes|LE', 'Alejandro Balde|LE', 'Marc Cucurella|LE', 'Federico Dimarco|LE', 'Ayrton Lucas|LE', 'Piquerez|LE',
  /* volantes */
  'Claude Makélélé|VOL', 'Sergio Busquets|VOL', 'Rodri|VOL', 'Casemiro|VOL', 'N\'Golo Kanté|VOL', 'Dunga|VOL', 'Mauro Silva|VOL',
  'Gilberto Silva|VOL', 'Fernandinho|VOL', 'Clodoaldo|VOL', 'Falcão|VOL', 'Cerezo|VOL', 'Declan Rice|VOL', 'Bruno Guimarães|VOL',
  'Aurélien Tchouaméni|VOL', 'Moisés Caicedo|VOL', 'João Neves|VOL', 'Joshua Kimmich|VOL', 'Fabinho|VOL', 'Roy Keane|VOL',
  'Patrick Vieira|VOL', 'Gennaro Gattuso|VOL', 'Javier Mascherano|VOL', 'Erick Pulgar|VOL', 'Allan|VOL', 'André|VOL',
  /* meio-campistas */
  'Xavi|MC', 'Andrés Iniesta|MC', 'Luka Modrić|MC', 'Toni Kroos|MC', 'Andrea Pirlo|MC', 'Steven Gerrard|MC', 'Frank Lampard|MC',
  'Paul Scholes|MC', 'Lothar Matthäus|MC', 'Johan Neeskens|MC', 'Gérson|MC', 'Didi|MC', 'Toninho Cerezo|MC', 'Jude Bellingham|MC',
  'Pedri|MC', 'Gavi|MC', 'Frenkie de Jong|MC', 'Vitinha|MC', 'Federico Valverde|MC', 'Bernardo Silva|MC', 'Kevin De Bruyne|MC',
  'Bruno Fernandes|MC', 'Martin Ødegaard|MC', 'Alexis Mac Allister|MC', 'Enzo Fernández|MC', 'Nicolò Barella|MC', 'Jamal Musiala|MC',
  'Florian Wirtz|MC', 'Arthur|MC', 'Paulinho|MC', 'Lucas Paquetá|MC', 'Raphael Veiga|MEI', 'Rodrigo De Paul|MC',
  /* meias */
  'Pelé|MEI', 'Diego Maradona|MEI', 'Zico|MEI', 'Johan Cruyff|MEI', 'Zinedine Zidane|MEI', 'Michel Platini|MEI', 'Ronaldinho|MEI',
  'Kaká|MEI', 'Rivaldo|MEI', 'Sócrates|MEI', 'Rivelino|MEI', 'Tostão|MEI', 'Alex|MEI', 'Juan Román Riquelme|MEI', 'Francesco Totti|MEI',
  'Roberto Baggio|MEI', 'Mesut Özil|MEI', 'Ferenc Puskás|MEI', 'Alfredo Di Stéfano|MEI', 'Bobby Charlton|MEI', 'Neymar|PE',
  'Giorgian de Arrascaeta|MEI', 'Philippe Coutinho|MEI', 'Oscar|MEI', 'Douglas Costa|PE', 'Ganso|MEI', 'Diego|MEI', 'Djalminha|MEI',
  'Cole Palmer|MEI', 'Phil Foden|MEI', 'Dani Olmo|MEI', 'James Rodríguez|MEI', 'Bruno Henrique|PE', 'Luiz Henrique|PD',
  /* pontas direitas */
  'Garrincha|PD', 'Lionel Messi|PD', 'Mohamed Salah|PD', 'Lamine Yamal|PD', 'Arjen Robben|PD', 'Luís Figo|PD', 'David Beckham|PD',
  'Raphinha|PD', 'Bukayo Saka|PD', 'Rodrygo|PD', 'Ousmane Dembélé|PD', 'Antony|PD', 'Estêvão|PD', 'Jairzinho|PD', 'Bebeto|PD',
  'Edmundo|PD', 'Stanley Matthews|PD', 'Michael Olise|PD', 'Désiré Doué|PD', 'Khvicha Kvaratskhelia|PE', 'Savinho|PD', 'Willian|PD',
  /* pontas esquerdas */
  'Cristiano Ronaldo|PE', 'Vinícius Júnior|PE', 'Thierry Henry|PE', 'Ryan Giggs|PE', 'Franck Ribéry|PE', 'Eden Hazard|PE',
  'Sadio Mané|PE', 'Kylian Mbappé|PE', 'Rafael Leão|PE', 'Gabriel Martinelli|PE', 'Zagallo|PE', 'Denílson|PE',
  'Leroy Sané|PE', 'Kingsley Coman|PE', 'Jack Grealish|PE', 'Nico Williams|PE', 'Luis Díaz|PE', 'Gabriel Jesus|CA', 'Samuel Lino|PE',
  /* centroavantes */
  'Ronaldo|CA', 'Romário|CA', 'Adriano|CA', 'Careca|CA', 'Vavá|CA', 'Ademir|CA', 'Leônidas da Silva|CA', 'Friedenreich|CA', 'Reinaldo|CA',
  'Fred|CA', 'Luís Fabiano|CA', 'Roberto Dinamite|CA', 'Serginho Chulapa|CA', 'Washington|CA', 'Jô|CA', 'Hulk|CA', 'Pedro|CA',
  'Gabigol|CA', 'Endrick|CA', 'Richarlison|CA', 'Firmino|CA', 'Vitor Roque|CA', 'Kaio Jorge|CA', 'Yuri Alberto|CA', 'Germán Cano|CA',
  'Erling Haaland|CA', 'Harry Kane|CA', 'Robert Lewandowski|CA', 'Karim Benzema|CA', 'Luis Suárez|CA', 'Zlatan Ibrahimović|CA',
  'Gerd Müller|CA', 'Marco van Basten|CA', 'Eusébio|CA', 'Gabriel Batistuta|CA', 'Hernán Crespo|CA', 'Sergio Agüero|CA',
  'Didier Drogba|CA', 'Samuel Eto\'o|CA', 'Wayne Rooney|CA', 'Alan Shearer|CA', 'Filippo Inzaghi|CA', 'Andriy Shevchenko|CA',
  'Raúl|CA', 'David Villa|CA', 'Fernando Torres|CA', 'Miroslav Klose|CA', 'Thomas Müller|MEI', 'Lautaro Martínez|CA',
  'Julián Álvarez|CA', 'Victor Osimhen|CA', 'Darwin Núñez|CA', 'Alexander Isak|CA', 'Viktor Gyökeres|CA', 'Ollie Watkins|CA',
  'Dušan Vlahović|CA', 'Romelu Lukaku|CA', 'Olivier Giroud|CA', 'Edinson Cavani|CA', 'Radamel Falcao|CA', 'Hugo Sánchez|CA',
  'Jonathan Tah|ZAG', 'Dayot Upamecano|ZAG', 'João Cancelo|LD', 'Kim Min-jae|ZAG', 'Ibrahima Konaté|ZAG', 'Cristian Romero|ZAG', 'Micky van de Ven|ZAG',
  'Nathan Aké|ZAG', 'John Stones|ZAG', 'Manuel Akanji|ZAG', 'Willian Pacho|ZAG', 'Dean Huijsen|ZAG', 'Castello Lukeba|ZAG', 'Lisandro Martínez|ZAG',
  'Pedro Porro|LD', 'Diogo Dalot|LD', 'Ben White|LD', 'Jeremie Frimpong|LD', 'Denzel Dumfries|LD', 'Giovanni Di Lorenzo|LD', 'Josko Gvardiol|LE',
  'Luke Shaw|LE', 'Raphaël Guerreiro|LE', 'Ferland Mendy|LE', 'Miguel Gutiérrez|LE', 'Destiny Udogie|LE', 'Milos Kerkez|LE', 'Álex Grimaldo|LE',
  'Martín Zubimendi|VOL', 'Manuel Ugarte|VOL', 'Ryan Gravenberch|VOL', 'Joelinton|MC', 'Eduardo Camavinga|MC', 'Mikel Merino|MC',
  'Arthur Melo|MC', 'Kobbie Mainoo|MC', 'Leon Goretzka|MC', 'Warren Zaïre-Emery|MC', 'Fabián Ruiz|MC', 'Scott McTominay|MC',
  'Teun Koopmeiners|MC', 'Joan García|GOL', 'Robert Sánchez|GOL', 'André Onana|GOL', 'Guglielmo Vicario|GOL', 'Gregor Kobel|GOL', 'Lucas Chevalier|GOL',
  'Bradley Barcola|PE', 'Jérémy Doku|PE', 'Anthony Gordon|PE', 'Marcus Rashford|PE', 'Ademola Lookman|PE',
  'Mohammed Kudus|PD', 'Jarrod Bowen|PD', 'Brahim Díaz|MEI', 'Morgan Rogers|MEI',
  'Eberechi Eze|MEI', 'Hugo Ekitiké|CA', 'Benjamin Šeško|CA', 'Jonathan David|CA', 'Randal Kolo Muani|CA', 'Gonçalo Ramos|CA', 'Mateo Retegui|CA',
  'Victor Boniface|CA', 'Serhou Guirassy|CA', 'Nicolas Jackson|CA', 'Dominic Solanke|CA', 'Alexander Sørloth|CA', 'Ferran Torres|CA', 'João Pedro|CA',
  'Alexandre Pato|CA', 'Lucas Moura|MEI', 'Everton Ribeiro|MEI', 'Gerson Santos|MC', 'Matheus Pereira|MEI',
  'Arda Güler|MEI', 'Kenan Yıldız|PE', 'Xavi Simons|MEI', 'Hakan Çalhanoğlu|VOL', 'Granit Xhaka|MC', 'Federico Chiesa|PD', 'Son Heung-min|PE',
  'Christian Pulisic|PD', 'Takefusa Kubo|PD', 'Dominik Szoboszlai|MC', 'Matheus Cunha|CA', 'Igor Jesus|CA',
  'Diego Forlán|CA', 'Kevin Viveros|CA', 'Flaco López|CA', 'Vitinho|PD', 'Tiquinho Soares|CA', 'Calleri|CA', 'Deyverson|CA'
];
