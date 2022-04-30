/*
 * Copyright (c) Harizi Riyadh All Rights Reserved.
 * 
 * This source code belongs to project Infinity Engine, which is a JS Animation Engine hosted on GitHub,
 * and licensed under the MIT License.
 * 
 * GitHub : https://github.com/itsyurni/infinity-engine
 * 
 * Version: 0.4
 * 
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

var _defaultInfinityData = {
    stop : false,
    reverseData : {},
    Queue : undefined
}
var _defaultOption = {
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
var patternMultiple = {
    "padding" : ["paddingLeft","paddingRight","paddingTop","paddingBottom"],
    "margin" : ["marginLeft","marginRight","marginTop","marginBottom"],
    "border" : ["borderTop","borderRight","borderTop","borderBottom"],
    "borderRadius" : ["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],
    "radiusLeft" : ["borderTopLeftRadius","borderBottomLeftRadius"],
    "radiusRight" : ["borderTopRightRadius","borderBottomRightRadius"],
    "borderColor" : ["borderTopColor","borderBottomColor","borderLeftColor","borderRightColor"]
}
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
var tweensColor = [
    'color',
    'backgroundColor',
    'borderBottomColor',
    'borderLeftColor',
    'borderRightColor', 
    'borderTopColor', 
    'outlineColor'
];

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

it.setData = function(elem,prop,key,val){
    if(elem["infinity"]){
        elem["infinity"][prop] = {}
        elem["infinity"][prop][key] = val
        return true;
    }
    return false;
}
it.getData = function(elem,prop,key){
    if(elem["infinity"] && elem["infinity"][prop] && elem["infinity"][prop][key]){
      
        return elem["infinity"][prop][key];
    }
    return null;
}


it.loop = function(arr,callback){
    for(var i = 0;i < arr.length;i++){
        callback.call(arr[i],i);
    }
    
}


it.cssHooks = {

    opacity : {
        get : function(elem){
            return _getComputedStyle(elem,"opacity")
        },
        set : function(elem,val){
            elem.style["opacity"] = parseFloat(val);
        }
    },

}

/**
 *  Transform Hooks 
 */

 var hookTransform = [
    "scale",
    "scaleX",
    "scaleY",
    "scaleZ",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "translateX",
    "translateY",
    "translateZ",
    "skewX",
    "skewY"
];
it.loop(hookTransform,function(){
    var prop = this;
    it.cssHooks[prop] = {
        get : function(elem){
            return is.undefined(it.getData(elem,"hooks",prop)) ? 1 : parseFloat(it.getData(elem,"hooks",prop));
        },
        set : function(elem,val){
            it.setData(elem,"hooks",prop,val)
            elem.style["transform"] = ""+prop+"("+val+")";
        }
        
    }
})

it.style = function(elem,key,val = null){

    if(it.cssHooks.hasOwnProperty(key)){
        if(val === null)
            return it.cssHooks[key].get(elem);
        return it.cssHooks[key].set(elem,val)
    }
    if(val === null) 
        return _getComputedStyle(elem,key)
    else
        return elem.style[key] = val
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

        if(callback.stopInterval == true){
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


it.createTweens = function(elem,props,option){
    var arr = [],
    i = 0;
    
        for (key in props){

            if(patternMultiple.hasOwnProperty(key)){
                if(is.array(patternMultiple[key])){
                    for(; i < patternMultiple[key].length;i++){
                        
                        arr.push(TweenEngin(elem, patternMultiple[key][i], props[key],option));
                    }
                }else{
                    arr.push(TweenEngin(elem, patternMultiple[key], props[key],option));
                }
            }else{
                arr.push(TweenEngin(elem, key, props[key],option));
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



it.fn = it.init.prototype;
it.fn.macros = {};

it.fn.loadMacro = function(plug,option){
    if(this.macros.hasOwnProperty(plug)){
        return this.macros[plug].call(this,option,this.macros)
    }
}

it.fn.chain = function (callback){



    var i = 0,
    len = this.elem.length;
    
    for(; i < len;i++){
        if(is.undefined(this.elem[i]["infinity"])){

            this.elem[i]["infinity"] = it.extendsOptions( {} , _defaultInfinityData);
        }

        callback.call(this.elem[i],this.elem[i]["infinity"])
    }
	return this;	
};

it.fn.queueChain = function (callback){
    this.chain(function(data){
        if(is.undefined(data["Queue"]))
            data["Queue"] = new QueueEngine();
        
        callback.call(this,data["Queue"],data);
    })
    
	return this;	
};

it.fn.addQueue = function(callback){
    this.queueChain(function(Queue){
        Queue.addQueue(callback.bind(this));
    })
    return this;
}

it.fn.nextQueue = function(){
    this.queueChain(function(Queue){
        Queue.nextQueue();
    })
    return this;
}

it.fn.style = function(param,value){
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
    this.queueChain(function(Queue){
        Queue.addQueue(function(){
            setTimeout(function(){
                Queue.nextQueue();
            },delay)
        });
    })
    return this;
}


it.fn.stop = function(){
    this.queueChain(function(Queue,data){
        data["stop"] = true;
        Queue.clear(this)
    });
    return this;
}


it.extendsOptions = function(orginal,_default){
    for(key in _default){
        if(!orginal.hasOwnProperty(key))
            orginal[key] = _default[key]
    }
    return orginal
}

it.fn.animate = function(prop = {},opt = {}){
    var options = it.extendsOptions(opt,_defaultOption);
    
    var onStart = options.onStart;
    var onComplete = options.onComplete;
    var onStop = options.onStop;
    var onUpdate = options.onUpdate;

    if(options.delay){
        this.delay(options.delay)
    }

 
    
    this.queueChain(function(Queue,data){
        
        var elem = this;
        var reverseData = data["reverseData"];
        
        function animation(reverse = false){

            var tweens = it.createTweens(elem,prop,options);

            if(reverse == false){
                it.loop(tweens,function(){
                    if(!reverseData.hasOwnProperty(this.prop)){
                        reverseData[this.prop] = {}
                        reverseData[this.prop]["to"] = this.start
                        reverseData[this.prop]["ease"] = this.ease
                
                    }
                });
            }
            
            if(!is.undefined(onStart)  && reverse == false ){
                onStart.call(elem);
            }
    
            it.tick(options,{

                stopInterval: false,
                draw:function(progress){

        
                    if(!is.undefined(onUpdate) && reverse == false ){
                        onUpdate.call(elem,progress);
                    }
          
                    if(data["stop"] == true){
                                            
                        data["stop"] = false;   
                        this.stopInterval = true
                        Queue.nextQueue()
      
                        if(!is.undefined(onStop)  && reverse == false ) {
                            onStop.call(elem)
                        }
                        return;
                    }
                 
                    it.loop(tweens,function(){
                        if(reverse == true){
                            this.to = reverseData[this.prop].to;
                            this.ease = reverseData[this.prop].ease;
                        }
                        this.run(progress);   
                    });

                    if(progress == 1){

                        if(!is.undefined(onComplete) && reverse == false ){
                            onComplete.call(elem);
                        }

                        if(options.queue == true){
                            Queue.nextQueue();
                        }
                    }
                },
            });
        }

        if(options.queue == false){
            animation()
        }

        if(options.queue == true){
       
            if(options.repeat && options.repeat > 0){

 
                for (var i = 0; i < options.repeat;i++){

                    Queue.addQueue(animation)

          
                    if(options.reverse == true){
            
                        if(options.reverseDelay){
                            Queue.addQueue(function(){
                                setTimeout(function(){
                                    Queue.nextQueue();
                                },options.reverseDelay)
                            });
                        }
                        Queue.addQueue(animation.bind(this,true))
                    }
 
                               
                    if(options.repeatDelay){
                        Queue.addQueue(function(){
                            setTimeout(function(){
                                Queue.nextQueue();
                            },options.repeatDelay)
                        });
                    }
                }  
            }else{
              
                Queue.addQueue(animation)
      
                if(options.reverse == true){
                    if(options.reverseDelay){
                        Queue.addQueue(function(){
                            setTimeout(function(){
                                Queue.nextQueue();
                            },options.reverseDelay)
                        });
                    }
                    Queue.addQueue(animation.bind(this,true))
                }
            }
        }

    });

    return this;
}




