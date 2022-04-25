/*
 * Copyright (c) Harizi Riyadh All Rights Reserved.
 * 
 * This source code belongs to project Infinity Engine, which is a JS Animation Engine hosted on GitHub,
 * and licensed under the MIT License.
 * 
 * GitHub : https://github.com/itsyurni/infinity-engine
 * 
 * Version: 0.3
 * 
 */


function infinity(elem,plug,option){
    return new infinity.prototype.init(elem,plug,option)
}

it = infinity.prototype;

it.init = function(elem,macro = null,option = {}){

    if(is.string(elem))
        this.elem =  document.querySelectorAll(elem);
    else if(elem.length)
        this.elem = elem
    else
        this.elem = [elem]


    if(macro != null){
        return this.loadMacro(macro,option);
    } 
    return this;
}

it.fn = it.init.prototype;
it.fn.macros = {};



it.fn.loadMacro = function(plug,option){
    if(this.macros.hasOwnProperty(plug)){
        return this.macros[plug].call(this,option,this.macros)
    }
}




it.fn.chain = function (callback){
    for(var i = 0;i < this.elem.length;i++){
        if(!is.undefined(this.elem[i]["infinity-Queue"]))
            queue = this.elem[i]["infinity-Queue"]
        else
            queue = this.elem[i]["infinity-Queue"] = new QueueEngine();

        callback.call(this.elem[i],queue);
    }

	return this;	
};



it.fn.queue = function(callback){
    if(!is.undefined(callback)){
        
        this.chain(function(Queue){
      
            Queue.addQueue(callback.bind(this,Queue));
        })
    }else{
        return this.elem[0]["infinity-Queue"]
    }
}

it.fn.stop = function(){
    this.chain(function(Queue){
        this['infinity-stop'] = true;
        Queue.clear(this)
    });
    return this;
}

it.fn.css = function(param,value){
    if(is.string(param) && is.undefined(value)){
		return it.style(this.elem[0],param);
	}
    this.chain(function(){
        if(is.object(param) && is.undefined(value)){
            for (var prop in param) {
                it.style(this,prop,param[prop]);
            }
	    }else if(is.string(param) && !is.undefined(value)){
            it.style(this,param,value);
        }
    });

    return this;
};

it.fn.delay = function(delay){
    this.chain(function(Queue){
        Queue.addQueue(function(){
            setTimeout(function(){
                Queue.nextQueue();
            },delay)
        });
    })
    return this;
}




it.fn.animate = function(prop = {},generalOption = {}){
    /**
    *  Generate the option of the animation
    */
     generalOption = it.generateOptions(generalOption)
   
    /**
     *  add delay before the animation
    */
    if(generalOption.delay){
        this.delay(generalOption.delay)
    }
    
    /**
    *  Chain the animation to all elements
    */
    this.chain(function(Queue){

        /**
        *  Create Copy the start position for reverse 
        */
        var reverseData;
        if(is.undefined(this["infinity-reverseData"])){
            reverseData = this["infinity-reverseData"] = {}
        }else{
            reverseData = this["infinity-reverseData"]
        }
        

        /**
        *  turn infinity stop to false  to run the animation
        */
        this['infinity-stop'] = false;
    
        var elem = this;
    
        function animation(reverse = false){

            /**
             *  Turn the props to tweens array
             */
            var tweens = it.createTweens(elem,prop,generalOption);

            /**
             *  Create Copy the start position for reverse 
             */

            if(reverse == false){
                it.loop(tweens,function(){
                    if(!reverseData.hasOwnProperty(this.prop)){
                        reverseData[this.prop] = {}
                        reverseData[this.prop]["to"] = this.start
                        reverseData[this.prop]["ease"] = this.ease   

                    }
                })
            }
            
            /**
            *  Add the callback of on onStart
            */

            if(!is.undefined(generalOption.onStart)  && reverse == false ){
                generalOption.onStart.call(elem);
            }
    
            it.tick(generalOption,{

                /**
                 *  The default position parametre of Interval if we Stop the animation that's turn true
                 */
                stop : false,
                draw:function(progress){

                    /**
                     *  Add the callback of on onUpdate
                     */

                    if(!is.undefined(generalOption.onUpdate) && reverse == false ){
                        generalOption.onUpdate.call(elem,progress);
                    }
                    
                    /**
                     *  Detect the Stop action in the attrs of the elements
                     */

                    if(elem['infinity-stop'] == true){
                                                    
                        /**
                         * we stop the tick interval and we Jump to next queue
                         */
                        this.stop = true
                        Queue.nextQueue()
                                            
                        /**
                         *  Add Callback onStop ()
                         */
                        if(!is.undefined(generalOption["onStop"])  && reverse == false ) {
                            generalOption.onStop.call(elem)
                        }
                        return;
                    }
                 
                    it.loop(tweens,function(){

                        /**
                         *  put the reverse data to the tweens
                         */

                        if(reverse == true){
                            this.to = reverseData[this.prop].to;
                            this.ease = reverseData[this.prop].ease;
                        }
                        
                        this.run(progress);   
                    })
                
                    if(progress == 1){

                        /**
                         *  add the callback onComplete 
                         */
                        if(!is.undefined(generalOption.onComplete) && reverse == false ){
                            generalOption.onComplete.call(elem);
                        }

                        /**
                         *  Jump to next queue 
                         */
                        if(generalOption.queue == true){
                            Queue.nextQueue();
                        }
                    }
                },
            });
        }

        if(generalOption.queue == false){
            animation()
        }

        if(generalOption.queue == true){
            /**
            *  Check if repeat
            */       
            if(generalOption.repeat && generalOption.repeat > 0){

                /**
                *  Run a loop to repeat animation 
                */ 
                for (var i = 0; i < generalOption.repeat;i++){

                    Queue.addQueue(animation)

                    /**
                    *  Active Reverse
                    */ 
                    if(generalOption.reverse == true){
                        /**
                        *  Active Reverse Delay
                        */ 
                        if(generalOption.reverseDelay){
                            Queue.addQueue(function(){
                                setTimeout(function(){
                                    Queue.nextQueue();
                                },generalOption.reverseDelay)
                            });
                        }
                        Queue.addQueue(animation.bind(this,true))
                    }
 
                    /**
                    *  add Delay to Queue after the first animation 
                    */                    
                    if(generalOption.repeatDelay){
                        Queue.addQueue(function(){
                            setTimeout(function(){
                                Queue.nextQueue();
                            },generalOption.repeatDelay)
                        });
                    }
                }  
            }else{
              
                Queue.addQueue(animation)
                /**
                *  Active Reverse
                */ 
                if(generalOption.reverse == true){
                    if(generalOption.reverseDelay){
                        Queue.addQueue(function(){
                            setTimeout(function(){
                                Queue.nextQueue();
                            },generalOption.reverseDelay)
                        });
                    }
                    Queue.addQueue(animation.bind(this,true))
                }
            }
        }

    });

    return this;
}


/**
 * utils For library 
 */
 is = {
	string : function(obj){return typeof obj === "string"},
	number : function(obj){return typeof obj === "number"},
	bool : function(obj){return typeof obj === "boolean"},
	func : function(obj){return typeof obj === "function" && typeof obj.nodeType !== "number";},
	undefined : function(obj){return typeof obj === "undefined"},
	object : function(obj){return typeof obj === "object"},
	window : function ( obj ) {return obj != null && obj === obj.window;},
	array : Array.isArray ||
      function(object){ return object instanceof Array }
}

function _getComputedStyle(el, styleProp) {
        
	var value, defaultView = el.ownerDocument.defaultView;
	// W3C standard way:
	if (defaultView && defaultView.getComputedStyle) {
	  // sanitize property name to css notation (hypen separated words eg. font-Size)
	  styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
	  return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
	} else if (el.currentStyle) { // IE
	  // sanitize property name to camelCase
	  styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
		return letter.toUpperCase();
	  });
	  value = el.currentStyle[styleProp];
	  // convert other units to pixels on IE
	  if (/^\d+(em|pt|%|ex)?$/i.test(value)) { 
		return (function(value) {
		  var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
		  el.runtimeStyle.left = el.currentStyle.left;
		  el.style.left = value || 0;
		  value = el.style.pixelLeft + "px";
		  el.style.left = oldLeft;
		  el.runtimeStyle.left = oldRsLeft;
		  return value;
		})(value);
	  }
	  return value;
	}
	
}

it._defaultOption = {
    repeat : false,
    reverse : false,
    reverseDelay : false,
    queue : true,
    duration : 400, 
    repeatDelay : false,
    delay : false,
    ease : '_default',
    onComplete : undefined,
    onStart : undefined,
    onFinish : undefined,
    onUpdate : undefined,
    onStep : undefined
}
it.loop = function(arr,callback){
    for(var i = 0;i < arr.length;i++){
        callback.call(arr[i],i);
    }
}


it.hook = {
    opacity : {
        get : function(elem){
            return _getComputedStyle(elem,"opacity")
        },
        set : function(elem,val){
            elem.style["opacity"] = parseFloat(val);
        }
    },


}



it.style = function(elem,key,val = null){

    if(it.hook.hasOwnProperty(key)){
        if(val === null)
            return it.hook[key].get(elem);
        return it.hook[key].set(elem,val)
    }
    if(val === null) 
        return _getComputedStyle(elem,key)
    else
        return elem.style[key] = val
}
it.getData = function(elem,prop){
    var data = elem["infinity-data"];
    if(data && !is.undefined(data[prop]))
        return data[prop]
    else
        return infinity(elem).css(prop)
}
it.setData = function(elem,key,val){
    var data;
    if(is.undefined(elem["infinity-data"]))
        elem["infinity-data"] = {}
    data = elem["infinity-data"] 

    if(is.undefined(data[key]))
        data[key] = val;
}

it.clearData = function(elem){
    if(!is.undefined(elem["infinity-data"]))
        delete elem["infinity-data"]
}

it.patternProps = {
    "padding" : ["paddingLeft","paddingRight","paddingTop","paddingBottom"],
    "margin" : ["marginLeft","marginRight","marginTop","marginBottom"],
    "border" : ["borderTop","borderRight","borderTop","borderBottom"],
    "borderRadius" : ["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],
    "radiusLeft" : ["borderTopLeftRadius","borderBottomLeftRadius"],
    "radiusRight" : ["borderTopRightRadius","borderBottomRightRadius"],
    "borderColor" : ["borderTopColor","borderBottomColor","borderLeftColor","borderRightColor"]
}

it.extends = function(obj,prop){
	for (key in prop){
		obj[key] = prop[key];
	}	
}

it.generateOptions = function(option){
    for(key in it._defaultOption){
        if(!option.hasOwnProperty(key))
            option[key] = it._defaultOption[key]
    }
    return option
}


it.interval = function(callback){
	if (!document.hidden) {
		window.requestAnimationFrame(callback);
	} else {
		window.setTimeout(callback);
	}
}

it.tick = function(option,callback){
  
    var start = performance.now();
    var animate = function () {
        var progress = (performance.now() - start) / option.duration;

        if (progress > 1) {
            progress = 1;
        }

        if(callback.stop == true){
			return;
		}

        if (progress < 1) {
			
			it.interval(animate)
        } 
        callback.draw(progress);
    };
    animate();
    return this;
}


it.createTweens = function(elem,prop,option){
    var arr = []
        for (key in prop){
            var unit = !is.undefined(prop[key].unit) ? prop[key].unit : Tween.parsing.unit(prop[key]["to"]);
            if(it.patternProps.hasOwnProperty(key)){
                if(is.array(it.patternProps[key])){
                    for(var i = 0; i < it.patternProps[key].length;i++){
                        
                        arr.push(TweenEngin(elem, it.patternProps[key][i], prop[key],option,unit));
                    }
                }else{
                    arr.push(TweenEngin(elem, it.patternProps[key], prop[key],option,unit));
                }
            }else{
                arr.push(TweenEngin(elem, key, prop[key],option,unit));
            }
        }
    return arr;
}


it.tweenPlugin = function(name,val){
    if(!Tween.fn.tweens.hasOwnProperty(name))
        Tween.fn.tweens[name] = val;
    else
        console.log("Tween alreasy exists !")
}


it.macro = function(name,val){
    if(!it.fn.macros.hasOwnProperty(name))
        if(is.func(val))
            it.fn.macros[name] = val;
        else
            console.log("second param must be function !")  
    else
        console.log("Plugin already exists  !")
}

/**
 * Queue Engine Start 
 */

 class QueueEngine {
    constructor(){
        this.list = [];
        this.running = false;
    }
    addQueue(val = null){
        if(val != null){
            this.list.push(val)
            if(!this.running){
                this.nextQueue();
            }
        }else{
            return this.list;
        }
    }

    nextQueue(){
        this.running = true;
        if(this.list.length < 1){
            this.running = false;
            return;
        }
        var callback = this.list.shift()
        if(is.func(callback)){
           return callback()
        }
        return callback
    }
    clear(){
        return this.list = []
    }
}

/**
 *  Tween Engine Class 
 */
 function TweenEngin( elem, prop, end, option,unit) {
	return new TweenEngin.prototype.init( elem, prop, end, option,unit);
}

Tween = TweenEngin.prototype;


Tween.init = function( elem,prop, end, option,unit) {	
	this.elem = elem;
	this.prop = prop;
	this.end = end;
	this.option = option;
	this.ease = !is.undefined(this.end.ease) ? this.end.ease : this.option.ease;
	this.unit = unit;
    this.start = this.currentVal();

	this.to = !isNaN(Tween.parsing.to(this.start,this.end.to)) ? Tween.parsing.to(this.start,this.end.to) : this.end.to;
    
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
            it.style(tween.elem,tween.prop,tween.step + tween.unit)	
    	}
	},
};

/**
 *  Transform Tween
 */

var transforms = ["scale","scaleX","scaleY","scaleZ",
"rotate","rotateX","rotateY","rotateZ",
"translateX","translateY","translateZ",
"skewX","skewY"];
it.loop(transforms,function(){
    var prop = this;
    
    it.hook[prop] = {
        get : function(elem){
            return is.undefined(elem["it-"+prop]) ? 1 : parseFloat(elem["it-"+prop]);
        },
        set : function(elem,val){
            elem["it-"+prop] = val
            elem.style["transform"] = ""+prop+"("+val+")";
        }
        
    }
})

/**
 *  colors Tween
 */
 var colors = {
    'aqua': [0,255,255,1],
    'azure': [240,255,255,1],
    'beige': [245,245,220,1],
    'black': [0,0,0,1],
    'blue': [0,0,255,1],
    'brown': [165,42,42,1],
    'cyan': [0,255,255,1],
    'darkblue': [0,0,139,1],
    'darkcyan': [0,139,139,1],
    'darkgrey': [169,169,169,1],
    'darkgreen': [0,100,0,1],
    'darkkhaki': [189,183,107,1],
    'darkmagenta': [139,0,139,1],
    'darkolivegreen': [85,107,47,1],
    'darkorange': [255,140,0,1],
    'darkorchid': [153,50,204,1],
    'darkred': [139,0,0,1],
    'darksalmon': [233,150,122,1],
    'darkviolet': [148,0,211,1],
    'fuchsia': [255,0,255,1],
    'gold': [255,215,0,1],
    'green': [0,128,0,1],
    'indigo': [75,0,130,1],
    'khaki': [240,230,140,1],
    'lightblue': [173,216,230,1],
    'lightcyan': [224,255,255,1],
    'lightgreen': [144,238,144,1],
    'lightgrey': [211,211,211,1],
    'lightpink': [255,182,193,1],
    'lightyellow': [255,255,224,1],
    'lime': [0,255,0,1],
    'magenta': [255,0,255,1],
    'maroon': [128,0,0,1],
    'navy': [0,0,128,1],
    'olive': [128,128,0,1],
    'orange': [255,165,0,1],
    'pink': [255,192,203,1],
    'purple': [128,0,128,1],
    'violet': [128,0,128,1],
    'red': [255,0,0,1],
    'silver': [192,192,192,1],
    'white': [255,255,255,1],
    'yellow': [255,255,0,1],
    'transparent': [255,255,255,0]
};

it.loop(['color', 'backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'outlineColor'],function(){
    var prop = this;
    it.tweenPlugin(this,{
        get : function(tw){
            return Tween.parsing.computedStyle(tw.elem,prop);
        },
        set : function(tw){
            var begin = Tween.parsing.colorToRGBA(tw.start)
            var end = Tween.parsing.colorToRGBA(tw.to)

            tw.run = function(progress){
                var A =  parseInt((begin[0] + progress * (end[0] - begin[0])), 10)
                var B = parseInt((begin[1] + progress * (end[1] - begin[1])), 10)
                var C = parseInt((begin[2] + progress * (end[2] - begin[2])), 10)
                var D = (begin && end ? parseFloat(begin[3] + progress * (end[3] - begin[3])) : 1);
                this.elem.style[prop] = 'rgba('+A+','+B+','+C+','+D+')';
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


/**
 *  ScrollTop & scrollLeft Tween
 */
 Tween.fn.tweens.test = {

    set: function( tween ) {
        console.log(tween.progress)
        tween.elem.style.transform = "translate("+tween.end.x+","+tween.end.y+")" ;
    }
};




/**
 * Easing 
 */
 it.extends(Tween.eases ,{
  
    linear: function(time) {
        return time;
    },

    smooth: function(time) {
        return time * time * (3.0 - 2.0 * time);
    },


    quadraticIn: function(time) {
        return time * time;
    },
    quadraticOut: function(time) {
        return time * (2.0 - time);
    },
    quadraticInOut: function(time) {
        if (time < 0.5) {
            return time * time * 2.0;
        } 
            
        return 2.0 * time * (2.0 - time) - 1.0;
    },


    cubicIn: function(time) {
        return time * time * time;
    },
    cubicOut: function(time) {
        time -= 1.0;
        return time * time * time + 1.0;
    },
    cubicInOut: function(time) {
        if (time < 0.5) {
            return 4.0 * time * time * time;
        } 

        time -= 1.0;
        return 4.0 * time * time * time + 1.0;
    },


    quarticIn: function(time) {
        return time * time * time * time;
    },
    quarticOut: function(time) {
        time -= 1.0;
        return 1.0 - time * time * time * time;
    },
    quarticInOut: function(time) {
        if (time < 0.5) {
            return 8.0 * time * time * time * time;
        } 

        time -= 1.0;
        return 1.0 - 8.0 * time * time * time * time;
    },


    quinticIn: function(time) {
        return time * time * time * time * time;
    },
    quinticOut: function(time) {
        time -= 1.0;
        return time * time * time * time * time + 1.0;
    },
    quinticInOut: function(time) {
        if (time < 0.5) {
            return 16.0 * time * time * time * time * time;
        } 

        time -= 1.0;
        return 16.0 * time * time * time * time * time + 1.0;
    },      
    

    exponentialIn: function(time) {
        if (time <= 0.0) {
            return time;
        } 

        return Math.pow(2.0, 10.0 * (time - 1.0));
    },
    exponentialOut: function(time) {
        if (time >= 1.0) {
            return time;
        }

        return 1.0 - Math.pow(2.0, -10.0 * time);
    },
    exponentialInOut: function(time) {
        if (time <= 0.0 || time >= 1.0) {
            return time;
        }
    
        if (time < 0.5) {
            return 0.5 * Math.pow(2.0, 20.0 * time - 10.0);
        } 

        return 0.5 * (2.0 - Math.pow(2.0, -20.0 * time + 10.0));
    }, 


    sineIn: function(time) {
        return 1.0 - Math.cos(time * 1.570796326794897);
    },
    sineOut: function(time) {
        return Math.sin(time * 1.570796326794897);
    },
    sineInOut: function(time) {
        return 0.5 * (1.0 - Math.cos(time * 3.141592653589793));
    }, 


    circularIn: function(time) {
        return 1.0 - Math.sqrt(1.0 - time * time);
    },
    circularOut: function(time) {
        return Math.sqrt((2.0 - time) * time);
    },
    circularInOut: function(time) {
        if (time < 0.5) {
            return 0.5 * (1.0 - Math.sqrt(1.0 - 4.0 * time * time));
        }

        time = time * 2.0 - 2.0;
        return 0.5 * (Math.sqrt(1.0 - time * time) + 1.0);
    }, 


    elasticIn: function(time) {
        if (time <= 0.0 || time >= 1.0)
        {
            return time;
        }
    
        return -Math.pow(2.0, 10.0 * time - 10.0) * Math.sin(20.923007 * time - 22.493803);
    },
    elasticOut: function(time) {
        if (time <= 0.0 || time >= 1.0)
        {
            return time;
        }
    
        return Math.pow(2.0, -10.0 * time) * Math.sin(20.923007 * time - 1.570796) + 1.0;
    },
    elasticInOut: function(time) {
        if (time <= 0.0 || time >= 1.0) {
            return time;
        }
    
        if (time < 0.5) {
            return -0.5 * Math.pow(2.0, 20.0 * time - 10.0) * Math.sin(27.960175 * time - 15.550884);
        } 

        return Math.pow(2.0, -20.0 * time + 10.0) * Math.sin(27.960175 * time - 15.550884) * 0.5 + 1.0;
    }, 


    backIn: function(time) {
        return time * time * (2.70158 * time - 1.70158);
    },
    backOut: function(time) {
        time -= 1.0;
        return time * time * (2.70158 * time + 1.70158) + 1.0;
    },
    backInOut: function(time) {
        if (time < 0.5) {
            return time * time * (14.379636 * time - 5.189818);
        } 

        time -= 1.0;
        return time * time * (14.379636 * time + 5.189818) + 1.0;
    },
    backInExponentialOut: function(time) {
        if (time < 0.5) {
            return time * time * (14.379636 * time - 5.189818);
        } 

        return 0.5 * (2.0 - Math.pow(2.0, -20.0 * time + 10.0));
    },
    backInElasticOut: function(time) {
        if (time < 0.5) {
            return time * time * (14.379636 * time - 5.189818);
        } 

        if (time >= 1.0) {
            return time;
        }

        return Math.pow(2.0, -20.0 * time + 10.0) * Math.sin(27.960175 * time - 15.550884) * 0.5 + 1.0;
    },


    bounceIn: function(time) {
        if (time > 0.636364) {
            time = 1.0 - time;
            return 1.0 - 7.5625 * time * time;
        } 

        if (time > 0.27273) {
            time = 0.454546 - time;
            return 0.25 - 7.5625 * time * time;
        } 

        if (time > 0.090909) {
            time = 0.181818 - time;
            return 0.0625 - 7.5625 * time * time;
        } 
        
        if (time >= 1.0) {
            return time;
        }

        time = 0.045455 - time;
        return 0.015625 - 7.5625 * time * time;
    },
    bounceOut: function(time) {
        if (time < 0.363636) {
            return 7.5625 * time * time;
        } 
        
        if (time < 0.72727) {
            time -= 0.545454;
            return 7.5625 * time * time + 0.75;
        } 
        
        if (time < 0.909091) {
            time -= 0.818182;
            return 7.5625 * time * time + 0.9375;
        } 
        
        if (time >= 1.0) {
            return time;
        }

        time -= 0.954545;
        return 7.5625 * time * time + 0.984375;
    },
    bounceInOut: function(time) {
        if (time < 0.5) {
            // bounce in
            if (time > 0.318182) {
                time = 1.0 - time * 2.0;
                return 0.5 - 3.78125 * time * time;
            } 
            
            if (time > 0.136365) {
                time = 0.454546 - time * 2.0;
                return 0.125 - 3.78125 * time * time;
            } 

            if (time > 0.045455) {
                time = 0.181818 - time * 2.0;
                return 0.03125 - 3.78125 * time * time;
            } 
            
            time = 0.045455 - time * 2.0;
            return 0.007813 - 3.78125 * time * time;
        } 

        // bounce out
        if (time < 0.681818) {
            time = time * 2.0 - 1.0;
            return 3.78125 * time * time + 0.5;
        } 
        
        if (time < 0.863635) {
            time = time * 2.0 - 1.545454;
            return 3.78125 * time * time + 0.875;
        } 
        
        if (time < 0.954546) {
            time = time * 2.0 - 1.818182;
            return 3.78125 * time * time + 0.96875;
        } 
        
        if (time >= 1.0) {
            return time;
        }

        time = time * 2.0 - 1.954545;
        return 3.78125 * time * time + 0.992188;
    },



});