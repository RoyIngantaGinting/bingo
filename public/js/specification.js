(function (global){
	function Specification(){
		this.marker = 0;
		this.size = 5;
		this.row = [0, 1, 2, 3, 4];
		this.column = [0, 5, 10, 15, 20];
		this.slash = [4, 8, 12, 16, 20];
		this.backSlash = [0, 6, 12, 18, 24];
		
		this.getRow = function(index){
			return this.adjustValues(this.row, index, this.size);
		},
		
		this.getColumn = function(index){
			return this.adjustValues(this.column, index, 1);
		},
		
		this.getSlash = function(){
			return this.getDiagonal(this.slash);
		},
		
		this.getBackSlash = function(){
			return this.getDiagonal(this.backSlash);
		},
		
		this.getDiagonal = function(slash){
			var i = 0, result = new Array();
			
			for (;i<this.size; i++){
				result.push(slash[i]);
			}
			return result;
		},
		
		this.isMarked = function(value){
			return value == this.marker;
		},
		
		this.adjustValues = function(tab, index, multiplier){
			var i = 0, limit = tab.length,
				result = new Array(), temp,
				multiply = index * multiplier;
			
			if (index >=0 && index < limit){
				for (;i<limit; i++){
					temp = tab[i] + multiply;
					result.push(temp);
				}
			}
			return result;
		};
	}
	
	var spec = Specification;
	
	if (typeof module !== "undefined" && module.exports){
		module.exports = spec; 
	} else {
		global['Specification'] = spec;
	}
}(this));