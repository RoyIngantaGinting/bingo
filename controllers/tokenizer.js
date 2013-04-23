var lowerUC = 65
	, lowerLC = 97
	, range = 26
	, tokenLength = 25;

exports.nextInt = function(limit){
	return Math.floor(Math.random() * limit);
};

exports.nextCharUC = function(){
	var chr = lowerUC + exports.nextInt(range);
	return String.fromCharCode(chr);
};

exports.nextCharLC = function(){
	var chr = lowerLC + exports.nextInt(range);
	return String.fromCharCode(chr);
};

exports.nextAlnum = function(){
	var value = lowerUC + exports.nextInt( 2*range + 10 )
		, candidate
		, rangeUC = lowerUC + range
		, rangeLC = lowerLC + range;

	if ((value >= lowerUC && value < rangeUC ) || (value >= lowerLC && value < rangeLC )){
		candidate = String.fromCharCode(value);
	} else if (value >= rangeUC && value < lowerLC){
		candidate = value - rangeUC;
	} else {
		candidate = value - lowerUC - 2 * range;
	}
	return candidate;
};

exports.genToken = function(){
	return exports.nextToken(tokenLength);
};

exports.nextToken = function(length){
	var token = ''
		, i = 0;
	
	for (; i<length; i++){
		token += exports.nextAlnum();
	}
	return token;
}
