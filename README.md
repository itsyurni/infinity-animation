## Infinity-Engine v0.4

Infinity-Animation is a very **lightweight** and **powerful** javascript **Animation** engine. 

It also has very **simple**, **beautiful**, **easy-to-understand** source code and **"Make-You-Happy"** API.


## Features

* Support CSS and Transform properties animation.
* Support color and backgrounds properties animation.
* Support queue animation.
* Support delay animation.
* Support repeat and reverse animation with delay of loops and delay of reverse.
* Support a group of elements animation.
* Support complete callback
* Support fully compatible standard easing effect and more.

  ```js
  linear,        smooth,
  quadraticIn,   quadraticOut,   quadraticInOut
  cubicIn,       cubicOut,       cubicInOut
  quarticIn,     quarticOut,     quarticInOut
  quinticIn,     quinticOut,     quinticInOut
  exponentialIn, exponentialOut, exponentialInOut
  sineIn,        sineOut,        sineInOut
  circularIn,    circularOut,    circularInOut
  elasticIn,     elasticOut,     elasticInOut
  backIn,        backOut,        backInOut,  backInExponentialOut
  , backInElasticOut , bounceIn,      bounceOut,      bounceInOut,
  ```
## How to use

  ```js
  /**
   * Create an animation object.
   *
   * @param {String (selector) | Array<HTMLElement> | NodeList | HTMLElement} targets
   */
   infiniy(targets).animate({
      height : {to : "+=200px", ease : "bounce"},
      backgroundColor : {to : "#000"},
      margin : {to : "-=20px"},
      opacity : {to : 0.6},
      borderRadius : {to : "+=10px"},
      rotate : {to : "360deg"},
      scrollLeft : {to : "+=60px"}
   },{
         queue : true,
         delay : 2000,
         repeat : 10,
         repeatDelay : 3000,
         reverse : true,
         reverseDelay : 1000,
         duration : 1000,       
         onComplete : function(){},
         onUpdate : function(){},
         onStart : function(){},
         onStop : function(){},
         onUpdate : function(){},
         onStep : function(){},
        
   }).delay(2000)

   infiniy(targets).stop()
 
 


## Thank You
