var Specification = require('./specification');

function Kontainer(){
	this.spec = new Specification();
	this.tab = new Array();
	this.numberOfLines = 0;
	
	// Return total number of lines to win
	this.size = function(){
		return this.spec.size;
	}
	
	// Generate values (1-25)
	this.generate = function(){
		var i = 1, limit = this.size() * this.size(),
			temp = new Array();
		
		for (;i<=limit; i++){
			this.tab[i-1] = i;
		}
		this.shuffle(this.tab);
	},
	
	// Set value to be 0 at given value
	this.markByValue = function(value){
		var index = this.tab.indexOf(value);
		
		if (index >= 0){
			this.markByIndex(index);
		}
	},
	
	// Set value to be 0 at given index
	this.markByIndex = function(index){
		var lines;
		
		if (!this.spec.isMarked( this.tab[index] )){
			this.tab[index] = this.spec.marker;
			lines = this.getPossibleLines(index);
			this.checkLines(lines);
		}
	},
	
	this.minimize = function(){
		var object = {
			values: this.tab,
			lines: this.numberOfLines
		};
		
		return object;
	},
	
	this.maximize = function(object){
		this.tab = object.values;
		this.numberOfLines = object.lines;
	}
	
	// Convert object into string so it will be save easily
	this.serialize = function(){
		return JSON.stringify(this.minimize());
	},
	
	// Convert serialized kontainer object into kontainer object
	this.deserialize = function(literal){
		var object = JSON.parse(literal);
		this.tab = object.values;
		this.numberOfLines = object.lines;
	},
	
	// Check whether game is completed or not
	this.isLinesComplete = function(){
		var limit = this.size();
		
		return this.numberOfLines >= limit;
	},
	
	this.toString = function(){
		return this.serialize();
	}
	
	this.getRow = function(index){
		var tabIndexes = this.spec.getRow(index);
		
		return this.getLine(tabIndexes);
	},
	
	this.getColumn = function(index){
		var tabIndexes = this.spec.getColumn(index);
		
		return this.getLine(tabIndexes);
	},
	
	this.getBackSlash = function(){
		var tabIndexes = this.spec.getBackSlash();
		
		return this.getLine(tabIndexes);
	},
	
	this.getSlash = function(){
		var tabIndexes = this.spec.getSlash();
		
		return this.getLine(tabIndexes);
	},
	
	this.getLine = function(tabIndexes){
		var i = 0, limit = this.spec.size
			,result = new Array();

		for (;i<limit; i++){
			result.push( this.tab[ tabIndexes[i] ] );
		}
		return result;
	},
	
	this.getPossibleLines = function(index){
		var row = Math.floor(index / this.spec.size)
			, col = index - (row * this.spec.size)
			, slash = this.spec.getSlash()
			, backSlash = this.spec.getBackSlash()
			, result = new Array();
		
		result.push(this.getRow(row));
		result.push(this.getColumn(col));
		if (backSlash.indexOf(index) >= 0){
			result.push(this.getBackSlash());
		}
		if (slash.indexOf(index) >= 0){
			result.push(this.getSlash());
		}
		return result;
	},
	
	this.checkLines = function(lines){
		var i = 0, limit = lines.length;
		
		for (;i<limit; i++){
			if (this.isLineMarked(lines[i])){
				this.numberOfLines++;
			}
		}
	},
	
	this.isLineMarked = function(line){
		var i = 0, limit = this.spec.size
			,result = true;

		while ( i<limit && result){
			result = this.spec.isMarked(line[i]);
			i++;
		}
		return result;
	},
	
	this.shuffle = function( myArray ) {
		var i = myArray.length, j, tempi, tempj;
		if ( i == 0 ) return false;
		while ( --i ) {
			 j = Math.floor( Math.random() * ( i + 1 ) );
			 tempi = myArray[i];
			 tempj = myArray[j];
			 myArray[i] = tempj;
			 myArray[j] = tempi;
		}
	}
	
	//this.generate();
}

module.exports = Kontainer;