(function(global){
	function Bingo(){
		this.idListPermainan = "#list-permainan";
	}
	
	Bingo.prototype = {
		updateListPermainan : function(permainan){
			var template = '<li><a href="#">text</a></li>'
				, i = 0;
			
			console.log($(this.idListPermainan));
			$(this.idListPermainan).empty();
			
			if ($.isArray(permainan)){
				for (;i<permainan.length; i++){
					$(this.idListPermainan).append(template.replace('text', permainan[0]['name']));
				}
			} else {
				$(this.idListPermainan).append("<li>Tidak ada yang bermain. Silakan membuat permainan baru.</li>");
			}
			$(this.idListPermainan).listview('refresh');
		},
		
		emptyListPermainan : function(){
			$(this.idListPermainan).empty();
		},
		
		signup: function(){
			
		}
	};
	
	global['BingoCtrl'] = new Bingo();
}(this));