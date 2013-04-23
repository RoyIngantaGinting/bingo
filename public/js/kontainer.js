function Kontainer(){
	this.spec = new Specification();
	this.tab = new Array();
	this.numberOfLines = 0;
	
	this.generate = function(){
		var i = 1, limit = this.spec.size * this.spec.size,
			temp = new Array();
		
		for (;i<=limit; i++){
			this.tab[i-1] = i;
		}
		this.shuffle(this.tab);
	},
	
	this.markByValue = function(value){
		var index = this.tab.indexOf(value);
		
		if (index >= 0){
			this.markByIndex(index);
		}
	},
	
	this.markByIndex = function(index){
		var lines;
		
		if (!this.spec.isMarked( this.tab[index] )){
			this.tab[index] = this.spec.marker;
			lines = this.getPossibleLines(index);
			
		}
	},
	
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
	
	this.isLinesComplete = function(){
		var limit = this.spec.size;
		
		return this.numberOfLines >= limit;
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
	},
	
	this.serialize = function(){
		var object = new Array();
		
		object.push(this.tab);
		object.push(this.numberOfLines);
		return JSON.stringify(object);
	},
	
	this.deserialize = function(literal){
		var object = JSON.parse(literal);
		this.tab = object[0];
		this.numberOfLines = object[1];
	},
	
	this.toString = function(){
		return this.serialize();
	}
}