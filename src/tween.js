

/**
 *  Tween Engine Class 
 */
 function TweenEngin( elem, prop, end, option) {
	return new TweenEngin.prototype.init( elem, prop, end, option);
}

Tween = TweenEngin.prototype;


Tween.init = function( elem,prop, end, option) {	
	this.elem = elem;
	this.prop = prop;
	this.end = end;
	this.option = option;
	this.ease = !is.undefined(this.end.ease) ? this.end.ease : this.option.ease;
	this.unit = !is.undefined(this.end.to) ? Tween.parsing.unit(this.end.to) : Tween.parsing.unit(this.end);
	this.start = this.currentVal();

	
	if (is.object(this.end) && this.end.to){
		this.to = !isNaN(Tween.parsing.to(this.start,this.end.to)) ? Tween.parsing.to(this.start,this.end.to) : this.end.to;
	}else{
		this.to = !isNaN(Tween.parsing.to(this.start,this.end)) ? Tween.parsing.to(this.start,this.end) : this.end;
	}

};

Tween.fn = Tween.init.prototype;

Tween.fn.currentVal = function() {
	var tweens = this.tweens[this.prop];

	if(tweens && tweens.get)
		return tweens.get(this)
	return this.tweens._default.get(this);
};

Tween.fn.run =  function( progress ) {
	this.progress = Tween.eases[this.ease](progress);

    this.step = (this.to - this.start) * this.progress + this.start;

    if(!is.undefined(this.option.onStep)){
        this.option.onStep.call(self.elem,this.progress,this);
    }
	var tweens = this.tweens[this.prop];
	if (tweens && tweens.set) {
		tweens.set( this );
	}else{
		this.tweens._default.set( this );
	}
	return this;
};

Tween.eases = {
    _default : function (a) {
        return a
    },
}


Tween.parsing = {
	computedStyle : function(elem,prop){
		return it.style(elem,prop)
	},
	to : function(from,to){

		if(is.undefined(to) || is.undefined(from)){
			return;
		}

		var reg = new RegExp("[0-9.,]+","g");
		if(to.toString().indexOf("+=") == 0)
			return parseFloat(from) + parseFloat(reg.exec(to));
		else if(to.toString().indexOf("-=") == 0)
			return parseFloat(from) - parseFloat(reg.exec(to));
		else
			return parseFloat(to);
	},
	from : function(elem,prop,unit){
		if((prop == "height" || prop == "top" || prop == "bottom")  && unit == "%")
			if(elem.parentNode.tagName == "BODY")		
				return parseFloat(this.computedStyle(elem,prop)) / window.innerHeight * 100;
			else
				return parseFloat(this.computedStyle(elem,prop)) / parseFloat(this.computedStyle(elem.parentNode,"height")) * 100;

		if((prop == "width" || prop == "left" || prop == "right") && unit == "%")
			if(elem.parentNode.tagName == "BODY")		
				return parseFloat(this.computedStyle(elem,prop)) / window.innerWidth * 100;
			else
				return parseFloat(this.computedStyle(elem,prop)) / parseFloat(this.computedStyle(elem.parentNode,"width")) * 100;
		return parseFloat(this.computedStyle(elem,prop)) || 0
	},
	unit : function(str){
		if(is.undefined(str)){
			return;
		}
			
		str = str.toString()
		res = str.match(/(-?[\d.]+)([a-z%]*)/);	
		return res && res[2] ? res[2] : null
	},
    colorToRGBA : function(color) {
		var match, quadruplet;

		// Match #aabbcc
		if (match = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/.exec(color)) {
			quadruplet = [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16), 1];

			// Match #abc
		} else if (match = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/.exec(color)) {
			quadruplet = [parseInt(match[1], 16) * 17, parseInt(match[2], 16) * 17, parseInt(match[3], 16) * 17, 1];

			// Match rgb(n, n, n)
		} else if (match = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color)) {
			quadruplet = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), 1];

		} else if (match = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9\.]*)\s*\)/.exec(color)) {
			quadruplet = [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10),parseFloat(match[4])];

			// No browser returns rgb(n%, n%, n%), so little reason to support this format.
		} else {
			quadruplet = colors[color];
		}
		return quadruplet;
	}
};


/**
 *  Default Tween
 */
 Tween.fn.tweens = {
	_default : {
		get : function(tween){
			return Tween.parsing.from(tween.elem,tween.prop,tween.unit) || 0;
		},
    	set: function( tween ) {
            it.style(tween.elem,tween.prop,tween.step + (tween.unit ?? "px"))	
    	}
	},
};




it.loop(tweensColor,function(){
    var prop = this;
    it.tweenPlugin(this,{
        get : function(tw){
            return it.style(tw.elem,prop);
        },
        set : function(tw){
            var begin = Tween.parsing.colorToRGBA(tw.start)
            var end = Tween.parsing.colorToRGBA(tw.to)

            tw.run = function(progress){
                var R =  parseInt((begin[0] + progress * (end[0] - begin[0])), 10)
                var G = parseInt((begin[1] + progress * (end[1] - begin[1])), 10)
                var B = parseInt((begin[2] + progress * (end[2] - begin[2])), 10)
                var A = (begin && end ? parseFloat(begin[3] + progress * (end[3] - begin[3])) : 1);
                this.elem.style[prop] = 'rgba('+R+','+G+','+B+','+A+')';
            }
        }
    });    
});

/**
 *  ScrollTop & scrollLeft Tween
 */
 Tween.fn.tweens.scrollTop = Tween.fn.tweens.scrollLeft = {

    set: function( tween ) {
        tween.elem.style[tween.prop] = Tween.step ;
    }
};



