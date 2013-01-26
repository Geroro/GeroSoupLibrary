//Harrison Hartley 2012
var G = {};

window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

function $(id){
	return document.getElementById(id);
}

G.padDebounce = [];

G.NotificationTime = 2000;

G.Logic = function(){
	this.objects = {};
	this.length = 0;
	this.add = function(o){
		o.GeroSoupID = this.length;
		this.objects[o.GeroSoupID] = o;
		this.length++;
	};
	this.remove = function(o){
		delete this.objects[o.GeroSoupID];
	}
	this.update = function(){
		for(i in this.objects){
			var o = this.objects[i];
			o.update();
		}
	}
	this.dump = function(){
		this.objects = {};
	}
}

G.Scene = function(width, height, objects,parent){
this.width = width || 0;
this.height = height || 0;
this.camera = {x:0,y:0};
this.renderOnly = !!(objects) || false;
this.scale = {x:1,y:1};
this.ctx = document.createElement('canvas').getContext('2d');
var ctx = this.ctx;
this.screenshot = function(){
	window.open(this.canvas.toDataURL());
}
ctx.fillCircle = function(size,x,y,start,end,backwards){
	start = start || 0;
	end = end || Math.PI*2;
	backwards = backwards || true;
	ctx.beginPath();
	if(size < 0){size = Math.abs(size)};
	ctx.arc(x,y,size,start,end,backwards); // Outer circle
	ctx.fill();
}

ctx.fillTriangle = function(size,x,y,flip){ 
 size *= 0.5;
 ctx.beginPath();
  if(flip){
   ctx.moveTo(x+size,y+size); 
   ctx.lineTo(x-size,y+size);
   ctx.lineTo(x,y-size);
   ctx.lineTo(x+size,y+size); 
  }else{
   ctx.moveTo(x-size,y-size); 
   ctx.lineTo(x+size,y-size);
   ctx.lineTo(x,y+size);
   ctx.lineTo(x-size,y-size); 
  }
  ctx.fill();
};
  
ctx.strokeTriangle = function(size,x,y,flip){
 size *= 0.5;
 ctx.beginPath();
  if(flip){
   ctx.moveTo(x+size,y+size); 
   ctx.lineTo(x-size,y+size);
   ctx.lineTo(x,y-size);
   ctx.lineTo(x+size,y+size); 
  }else{
   ctx.moveTo(x-size,y-size); 
   ctx.lineTo(x+size,y-size);
   ctx.lineTo(x,y+size);
   ctx.lineTo(x-size,y-size); 
  }
  ctx.stroke();
}; 

//why do these two break scene.render when they're added as prototypes?
G.Get8BitTextWidth = function(string,scale){
	scale = scale || 2;
	var width = 0;
	for(var i = 0; i < string.length; i++){
		if(G.Letters[string[i]]){
			width += G.Letters[string[i]].width || 4;
		}else{
			width += 4;
		}
		width++;
	}
	return width * scale;
};

G.Get8BitTextHeight = function(string,scale){
	scale = scale || 2;
	return 5 * scale;
};

ctx.__proto__.fillText8Bit = function(string,x,y,scale){
	var drawLetter = function(l,x,y,scale){ 
	  l = l.toUpperCase();
	  if(G.Letters[l]){
	    l = G.Letters[l];
	    var width = l.width || 4;
	    var xOffset = 0;
	    var yOffset = 0;
	    for(var i = 0; i < l.pattern.length;i++){
	      if(l.pattern[i]){
	       ctx.fillRect(x+xOffset,y+yOffset,scale,scale);
	      }
	      xOffset+=scale;
	      if(xOffset === width * scale){
	       xOffset = 0;
	       yOffset += scale;
	      }
	    }
	    width++;
	    return width * scale;
	  }
	  return 4 * scale;  
	}
	if(ctx.textAlign === 'center'){
		x -= Math.floor(G.Get8BitTextWidth(string,scale) * 0.5);
	}
  scale = scale || 2;
  var xOffset = 0;
  //x -= string.length * scale;
  for(var i = 0; i < string.length; i++){
    xOffset += drawLetter(string[i],x +xOffset,y,scale);
  }
};

ctx.__proto__.clearText8Bit = function(string,x,y,scale){
	var drawLetter = function(l,x,y,scale){ 
	  l = l.toUpperCase();
	  if(G.Letters[l]){
	    l = G.Letters[l];
	    var width = l.width || 4;
	    var xOffset = 0;
	    var yOffset = 0;
	    for(var i = 0; i < l.pattern.length;i++){
	      if(l.pattern[i]){
	       ctx.clearRect(x+xOffset,y+yOffset,scale,scale);
	      }
	      xOffset+=scale;
	      if(xOffset === width * scale){
	       xOffset = 0;
	       yOffset += scale;
	      }
	    }
	    width++;
	    return width * scale;
	  }
	  return 4 * scale;  
	}
	if(ctx.textAlign === 'center'){
		x -= Math.floor(G.Get8BitTextWidth(string,scale) * 0.5);
	}
  scale = scale || 2;
  var xOffset = 0;
  //x -= string.length * scale;
  for(var i = 0; i < string.length; i++){
    xOffset += drawLetter(string[i],x +xOffset,y,scale);
  }
};

ctx.__proto__.strokeText8Bit = function(string,x,y,scale){
	var drawLetter = function(l,x,y,scale){ 
	  l = l.toUpperCase();
	  if(G.Letters[l]){
	    l = G.Letters[l];
	    var width = l.width || 4;
	    var xOffset = 0;
	    var yOffset = 0;
	    for(var i = 0; i < l.pattern.length;i++){
	      if(l.pattern[i]){
	       ctx.strokeRect(x+xOffset,y+yOffset,scale,scale);
	      }
	      xOffset+=scale;
	      if(xOffset === width * scale){
	       xOffset = 0;
	       yOffset += scale;
	      }
	    }
	    width++;
	    return width * scale;
	  }
	  return 4 * scale;  
	}
  scale = scale || 2;
  var xOffset = 0;
  //x -= string.length * scale;
  for(var i = 0; i < string.length; i++){
    xOffset += drawLetter(string[i],x +xOffset,y,scale);
  }
};
ctx.cutCircle = function(size,x,y,start,end,backwards){
	start = start || 0;
	end = end || Math.PI*2;
	backwards = backwards || true;
	ctx.beginPath();
	if(size < 0){size = 0};
	ctx.arc(x,y,size,start,end,backwards); // Outer circle
	ctx.lineTo(x,y);
	ctx.fill();

	//	ctx.arc(x,y,size * 0.25,start,end,!backwards); // Outer circle
	//	ctx.arc(x,y,size,start,end,backwards); // Outer circle
}
ctx.strokeCircle = function(size,x,y,start,end,backwards){
	start = start || 0;
	end = end || Math.PI*2;
	backwards = backwards || true;
	ctx.beginPath();
	if(size < 0){size = Math.abs(size)};
	ctx.arc(x,y,size,start,end,backwards); // Outer circle
	ctx.stroke();
}
ctx.drawButton = function(x,y,width,height,text,buttonColor,textColor){
	x -= width * 0.5;
	y -= height * 0.5;
	height = height * 0.5;
	width = width * 0.5;
	y += height;
	x += width * 0.5;
	ctx.fillStyle = buttonColor || '#000';
	ctx.beginPath();
	ctx.arc(x,y,height,Math.PI * -0.50,Math.PI * 0.50,true); // Outer circle
	ctx.arc(x + width,y,height,Math.PI * 0.50,Math.PI * -0.50,true); // Outer circle
	ctx.lineTo(x,y - height);
	ctx.fill();
	if(text){
		ctx.fillStyle = textColor || '#fff';
		ctx.textAlign = 'center';
		ctx.font = '12pt Helvetica';
		ctx.fillText(text,x + width * 0.5 - 2,y + 6);
	}
}
this.canvas = this.ctx.canvas;
this.canvas.className = 'GeroSoupCanvas';
parent = parent || document.body;
parent.appendChild(this.canvas);
this.canvas.width = this.width;
this.canvas.height = this.height;
this.camera = {
x:0,
y:0
}
this.length = 0;
this.objects = objects || {};
this.hud = {};

this.add = function(o){
	o.GeroSoupID = this.length;
	this.objects[o.GeroSoupID] = o;
	this.length++;
};
this.remove = function(o){
	delete this.objects[o.GeroSoupID];
}

this.render = function(){
	var ctx = this.ctx;
	ctx.save();
	ctx.scale(this.scale.x,this.scale.y);
	ctx.translate(-this.camera.x,-this.camera.y);
	if(this.renderOnly){
		for(i in this.objects){
			var o = this.objects[i];
			o.render(ctx,this);
		}
	}else{
		for(i in this.objects){
			var o = this.objects[i];
			o.update(this);
			o.render(ctx,this);
		}
	}
	ctx.restore();
}

this.dump = this.empty = function(){
	this.objects = {};
}

this.blank = function(){
	this.ctx.clearRect(0,0,this.width,this.height);
}

this.translate = function(callback){
	var ctx = this.ctx;
	ctx.save();
	ctx.scale(this.scale.x,this.scale.y);
	ctx.translate(-this.camera.x,-this.camera.y);
	callback();
	ctx.restore();
}

this.clear = function(){
	var ctx = this.ctx;
	ctx.save();
	ctx.scale(this.scale.x,this.scale.y);
	ctx.translate(this.camera.x, this.camera.y);
	for(var i in this.objects){
		var o = this.objects[i];
		if(o.clear){o.clear(); continue;}
		ctx.clearRect(o.x-2,o.y-2,o.width+4,o.height+4);
	}
	ctx.translate(-this.camera.x, -this.camera.y);
	ctx.restore();
}	

this.setFill = function(color){
	this.ctx.fillStyle = color;
}

}

G.Vector2 = function(x,y){
	x = x || 0;
	y = y || 0;
	return {x:x,y:y};
};

G.Vector3 = function(x,y,z){
	x = x || 0;
	y = y || 0;
	z = z || 0;
	return {x:x,y:y,z:z};
};

G.Text = function(text,x,y,font,align){
	this.align = align || "center";
	this.font = font || "16pt sans-serif";
	this.text = text;
	this.type = "text";
	this.x = x || 0;
	this.y = y || 0;
	this.render = function(ctx){
		ctx.font = this.font;
		ctx.textAlign = this.align;
		ctx.fillText(this.text, this.x, this.y);
	}
}

G.StrokeText = function(text,x,y,font,align){
	this.align = align || 0;
	this.font = font || 0;
	this.text = text;
	this.type = "text";
	this.x = x || 0;
	this.y = y || 0;
	this.render = function(ctx){
		if(this.font){
			ctx.font = this.font;
		}
		if(this.textAlign){
			ctx.textAlign = this.align;
		}
		ctx.strokeText(this.text, this.x, this.y);
	}
}

G.RandomColor = function(){
	return '#'+Math.floor(Math.random()*16777215).toString(16);
}

G.LoadImage = function(name,src,callback){
	var image = new Image();
	image.onload = callback || function(){};
	image.src = src;
	return image;
}

G.MapNumber = function(x,a,b,c,d){
	return (x-a)/(b-a) * (d-c) + c;
}
//debugger is a reserved word :/
G.GamePadListener = function(o){
	if(o){
		var threshold = o.threshold || 0.2;
	}else{
		var threshold = 0.2;
	}
	var d;
	var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;

	var _this = this;

	this.stop = function(){
		this.stopped = 1;
	}
	this.start = function(){
		this.stopped = 0;
		this.loop();
	}
	this.init = function(){
		navigator.Gamepads = navigator.webkitGamepads || navigator.webkitGetGamepads();
		this.stopped = 0;
		this.gamepads = [];
		i = 4;
		this.gamepadCount = 0;
		while(i--){
			this.gamepads.push(new this.gamepad());
		}
		this.loop();
	}
	this.loop = function(){
		if(!_this.stopped){requestAnimFrame(_this.loop)};
		var gamepads = navigator.webkitGamepads || navigator.webkitGetGamepads();
		for(var key in gamepads){
			var g = gamepads[key];
			for(var b in g.buttons){
				var d = _this.gamepads[key].buttonDebounce[b];
				if(g.buttons[b] > threshold || g.buttons[b] < -threshold){
					if(!d){
						_this.gamepads[key].catchButtonDown(b,g.buttons[b]);
						if(_this.gamepads[key].buttonDown[b]){
							_this.gamepads[key].buttonDown[b](b,g.buttons[b]);
						}
					}
					_this.gamepads[key].buttonDebounce[b] = 1;
				}else{
					if(d){
						_this.gamepads[key].catchButtonUp(b,g.buttons[b]);
						if(_this.gamepads[key].buttonUp[b]){
						_this.gamepads[key].buttonUp[b](b,g.buttons[b]);
						}
					}
					_this.gamepads[key].buttonDebounce[b] = 0;
				}
			}
			for(var a in g.axes){
				var d = _this.gamepads[key].axisDebounce[a];
				if(g.axes[a] > threshold || g.axes[a] < -threshold){
					_this.gamepads[key].catchAxisDown(g.axes[a],a,1);
					if(!d && _this.gamepads[key].axisDown[a]){
						_this.gamepads[key].axisDown[a](g.axes[a],a,1);
					}
					_this.gamepads[key].axisDebounce[a] = 1;
				}else{
					_this.gamepads[key].catchAxisUp(g.axes[a],a,1);
					if(d && _this.gamepads[key].axisUp[a]){
						_this.gamepads[key].axisUp[a](g.axes[a],a,1);
					}
					_this.gamepads[key].axisDebounce[a] = 0;
				}
			}
		}
	}
	this.inputMonitor = function(){
		this.render = function(ctx){
			//ctx.clearRect(0,0,200,300);
			var y = 0;
			for(var g in gp.gamepads){
				ctx.fillText('Gamepad '+g,10,20 + y);
				for(var i in gp.gamepads[g].buttonDebounce){
					ctx.fillText(gp.gamepads[g].buttonDebounce[i],10 + 10 * i,30 + y);
				}
				for(var i in gp.gamepads[g].axisDebounce){
					ctx.fillText(gp.gamepads[g].axisDebounce[i],10 + 10 * i,40 + y);
				}
				y+=40;
			}
		}
		this.update = function(){

		}
	}
	this.gamepad = function(){
		this.active = 0;
		this.buttonDown = {};
		this.buttonUp = {};
		this.buttonDebounce = {};
		this.axisDown = {};
		this.axisUp = {};
		this.axisDebounce = {};
		this.catchButtonDown = function(){};
		this.catchButtonUp = function(){};
		this.catchAxisDown = function(){};
		this.catchAxisUp = function(){};
	}
	if(gamepadSupportAvailable){
		console.log('Gamepads Enabled');
		this.init();
	}else{
		console.log('Gamepads Failed');
		return false;
	}
}

G.KeyListener=function(repeat,debug){
	var _this = this;
	this.pause = 0;
	this.down = {};
	this.up = {};
	this.repeat = {};
	if(debug){
		this.keyDown = function(event){
			if(_this.pause){return};
			var key = event.which || event.keyCode;
			console.log("keyDown:" + key);
			if(!_this.repeat[key] || repeat){
				_this.catchDown(key);
				if(_this.down[key]){
					_this.down[key](event);
				}
			};
			_this.repeat[key] = 1;
		}
		this.keyUp = function(e){
			if(_this.pause){return};
			var key = event.which || event.keyCode;
			console.log("keyUp:"+key);
			_this.catchUp(key);
			_this.repeat[key] = 0;
			if(_this.up[key]){_this.up[key](event)};
		}
	}else{
		this.keyDown = function(e){
			if(_this.pause){return};
			var key = event.which || event.keyCode;
			if(!_this.repeat[key] || repeat){
				_this.catchDown(key);
				if(_this.down[key]){
					_this.down[key](event);
				}
			};
			_this.repeat[key] = 1;
		}	
		this.keyUp = function(e){
			if(_this.pause){return};
			var key = event.which || event.keyCode;
			_this.catchUp(key);
			_this.repeat[key] = 0;
			if(_this.up[key]){_this.up[key](event)};
		}
	}
	this.catchDown = function(){};
	this.catchUp = function(){};
	this.setDown = function(a,callback){
		for(var i = 0; i < a.length; i++){
			this.down[a[i]] = callback;
		}
	}
	this.setUp = function(a,callback){
		for(var i = 0; i < a.length; i++){
			this.up[a[i]] = callback;
		}
	}
	document.addEventListener('keydown',_this.keyDown,false);
	document.addEventListener('keyup',_this.keyUp,false);

return this;
}

G.GetDistance = function(a,b,ignoreZ){
	var xDis = b.x - a.x;
	xDis = xDis * xDis;
	var yDis = b.y - a.y;
	yDis = yDis * yDis;
	if(!ignoreZ && a.z && b.z){
		var zDis = b.z - a.z;
		var dis = xDis + yDis + zDis;
	}else{
		var dis = xDis + yDis;
	}
	return Math.sqrt(dis);
}

G.GetDistanceCheap = function(a,b,ignoreZ){
	var xDis = b.x - a.x;
	xDis = xDis * xDis;
	var yDis = b.y - a.y;
	yDis = yDis * yDis;
	if(!ignoreZ && a.z && b.z){
		var zDis = b.z - a.z;
		var dis = xDis + yDis + zDis;
	}else{
		var dis = xDis + yDis;
	}
	return dis;
}

G.RandomDir = function(){
	var x = Math.floor(Math.random() * 2);
	if(x){
		return 1;
	}else{
		return -1;
	}
}

G.length = function(x,y){
	return Math.sqrt(x * x + y * y);
}

G.Rect = function(x,y,width,height,stroke){
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.width+=0.5;
	this.height+=0.5;
	if(!stroke){
		this.draw = 'fillRect';
	}else{
		this.draw = 'strokeRect';
	}
	this.render = function(ctx){
		ctx[this.draw](this.x,this.y,this.width,this.height);
	}
}

G.Circle = function(size,x,y,stroke,start,end,backwards){
	this.size = size || 0;
	this.x = x || 0;
	this.y = y || 0;
	this.start = start || 0;
	this.end = end || 0;
	this.backwards = backwards || 0;
	this.size+=0.5;
	if(!stroke){
		this.draw = 'fillCircle';
	}else{
		this.draw = 'strokeCircle';
	}
	this.render = function(ctx){
		ctx[this.draw](this.size,this.x,this.y,this.start,this.end,this.backwards);
	}
}

G.RectCollision = function(a,b){
	a.width = a.width || a.size || 0;
	b.width = b.width || a.size ||0;
	a.height = a.height || b.size || 0;
	b.height = b.height || b.size ||0;
  if(a.x > b.x + b.width){
   return 0; 
  }
  if(a.y > b.y + b.height ){
   return 0; 
  }
  if(a.x + a.width < b.x){
    return 0;
  }
  if(a.y + a.height < b.y){
   return 0; 
  }
  return 1;
}
			
G.GetDir2 = function(a,b){
	var dirX = a.x - b.x;
	var dirY = a.y - b.y;
	var hyp = G.length(dirX, dirY);
	dirX /= hyp;
	dirY /= hyp;
	if(isNaN(dirX)){
		dirX = 0;
	}
	if(isNaN(dirY)){
		dirY = 0;
	}
	var dir = {x:dirX,y:dirY};
	return dir;
}
//######################
//Beta Stoof
//######################

//returns closest object to o in a with a max distance of distance or infinity
G.FindClosest = function(o,a,distance){
	var distance = distance || Infinity;
	var targetPosition;
	var targetObject;
	for(var key in a){
		var t = a[key].position || a[key];
		var d = G.GetDistanceCheap(o,t);
		if(d < distance){
			targetPosition = t;
			distance = d;
			targetObject = a[key];
		}
	}
	return {closest:targetObject,distance:distance};
}

G.AddScript = function(src){
  var script = document.createElement('script');
  script.src = src;
  document.body.appendChild(script);
}

G.Color = function(color){
 this.color = color || "#000000";
  this.render = function(ctx){
   ctx.fillStyle = this.color; 
  };
}
  
G.SetScore = function(name,score,scoreboard){
 G.AddScript('http://pinguinogelato.com/scoreboards/?scoreboard='+scoreboard+'&score='+score+'&name='+name);
}
  
G.GetScores = function(scoreboard){
 G.AddScript('http://pinguinogelato.com/scoreboards/?getscores=' + scoreboard);   
}

G.Notification = function(text,time){
  text = text || '';
  time = time || G.NotificationTime;
  var d;
  if(!G.NotificationDiv){
    d = document.createElement('div');
    d.id = 'GeroSoupNotificationBox';
    document.body.appendChild(d);
    G.NotificationDiv = d;
  }
  d = G.NotificationDiv;
  var n = document.createElement('div');
  n.className = 'GeroSoupNotification';
  n.innerHTML = text;
  d.appendChild(n);
  setTimeout(function(){d.removeChild(n);},time);
};

G.StringifyObject = function(o,objectName,suffix,limit,current){
  var string = '';
  limit = limit || 0;
  current = current || 0;
  if(limit && current > limit){
  	return '';
  }
  current++;
  if(!objectName){
    objectName = '';
  }else{
    objectName = objectName + '.';
  }
  suffix = suffix || '';
  for(var key in o){
    if(typeof o[key] === 'object'){
      string += G.StringifyObject(o[key],key,suffix,limit,current);
    }else{
      if(typeof o[key] === 'function'){
        string += 'Func: '+objectName + key + suffix; 
      }else{
        string += objectName + key + ': ' + o[key] + suffix; 
      }
    }
  }
  return string;
}

G.RandomArray = function(a){
	return a[Math.floor(Math.random() * a.length)];
}

G.RandomFixedColor = function(a){
	var i = 3;
	color = '#';
	while(i--){
		color += G.RandomArray(a);
	}
	return color;
}

G.Count = function(o){
	var count = 0;
	for(var key in o){
		count++;
	}
	return count;
}

G.Touchable = function() {
  return !!('ontouchstart' in window);
}

G.GamePadSupport = function(){
	return !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
}

G.DefaultStyle = function(){
    var s = document.createElement('style');
    s.innerText = '#GeroSoupNotificationBox{position:absolute;right:0px;top:0px;width:25%;}.GeroSoupNotification{text-align:center;display:block;border:solid 1px black;border-radius:10px;padding:5px;margin:5px;background-color:white;color:black;} ';
    document.body.appendChild(s);
}

G.Rotate = function(object,rotation){ // what if I used a callback instead of a weird hacky modification?
  object.rotation = rotation || 0;
  object.render2 = object.render;
  object.render = function(ctx){
      var x = object.x;
      var y = object.y;
      var width = object.width || object.image.width;
      var height = object.height || object.image.height;
      ctx.translate(x, y);
      ctx.rotate(object.rotation);
      object.render2(ctx);
      ctx.rotate(-object.rotation);
      ctx.translate(-x, -y);
  };
}

G.Image = function(url,x,y,rotation,axisX,axisY){ // add a flip / mirror option
  this.x = x || 0;
  this.y = y || 0;
  this.image = new Image();
  this.image.src = url;
  this.rotation = rotation || 0;
  if(axisX === undefined){
    this.axisX = this.image.width * 0.5;
  }else{
    this.axisX = axisX || 0;
  }
  if(axisY === undefined){
    this.axisY = this.image.height * 0.5;
  }else{
    this.axisY = axisY || 0;
  }
  this.render = function(ctx){
    if(this.rotation){
      var x = this.x;
      var y = this.y;
      var width = this.image.width;
      var height = this.image.height;
      ctx.translate(x, y);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.image, -this.axisX, -this.axisY, width, height);
      ctx.rotate(-this.rotation);
      ctx.translate(-x, -y);
    }else{
      ctx.drawImage(this.image,this.x - this.axisX,this.y - this.axisY);
    }
  };
}

G.Random = function(a){
 return Math.floor(Math.random() * a); 
}

G.FloorParticle = function(size,x,y,dirX,dirY){
  this.x = x || 0;
  this.initY = this.y = y || 0;
  this.size = size || 5;
  this.dirX = G.RandomDir() * dirX * Math.random() || 0;
  this.dirY = -dirY * Math.random() - 3 || 0;
  this.bounces = 0;
  this.render = function(ctx){
    this.x += this.dirX;
    this.y += this.dirY;
    this.dirY += 0.5;
    if(this.y > this.initY){
      this.dirY = -this.dirY; 
      this.bounces++;
      if(this.bounces > 0){
        this.dead = 1;
      } 
    }
    ctx.globalAlpha = 0.7;
    ctx.fillRect(this.x + 3,this.y + 3,this.size,this.size);
	ctx.globalAlpha = 1;
    ctx.fillRect(this.x,this.y,this.size,this.size);
  };
}

G.ParticleSystem = function(x,y,count,type,size,dirX,dirY,color){
  this.particles = [];
  this.color = color || 0;
  type = type || G.FloorParticle;
  while(count--){
   this.particles.push(new type(size,x,y,dirX,dirY)); 
  }
  this.render = function(ctx){
  	if(this.color){
  		ctx.fillStyle = ctx.strokeStyle = this.color;
  	}
    var i = this.particles.length;
    var deadCount = 0;
    while(i--){
      var p = this.particles[i];
      if(p.dead){
      	deadCount++;
       continue; 
      }
      p.render(ctx);
    }
    if(deadCount == this.particles.length){
    	scene.remove(this);
    }
  };
}

G.TouchControls = function(canvas,color,alpha){//touchListener
		var tc = this;
		this.digital = {};
		this.analog = {};
		this.buttonSize = 32;
		this.color = color || G.RandomColor();
		alpha = alpha || 1;
		this.render = function(ctx){
			ctx.globalAlpha = alpha;
			ctx.fillStyle = this.color;
			for(var key in this.digital){
				var b = this.digital[key];
				if(b.color){
					ctx.fillStyle = b.color;
				}
				ctx.fillRect(b.x,b.y,b.width,b.height);
			}
			for(var key in this.analog){
				var b = this.analog[key];
				if(b.color){
					ctx.fillStyle = b.color;
				}
				ctx.fillRect(b.x,b.y,b.width,b.height);
				ctx.strokeCircle(10,b.x + b.width*0.5,b.y+b.height*0.5);
			}
			ctx.globalAlpha = 1;
		}
		this.touchButton = function(index,x,y,width,height,down,up,color){
			var _this = this;
			this.index = index;
			this.x = x || 0;
			this.y = y || 0;
			this.pressed = 0;
			this.width = width || 10;
			this.height = height || 10;
			this.down = down || function(){console.log(_this.index)};
			this.up = up || function(){console.log(_this.index)};
			this.color = color;
		}

		this.analogRect = function(index,x,y,width,height,down,up,color){
			var _this = this;
			this.index = index;
			this.x = x || 0;
			this.y = y || 0;
			this.width = width || 10;
			this.height = height || 10;
			this.down = down || function(a,b){console.log(_this.index,a,b);};
			this.up = up || function(a,b){console.log(_this.index,a,b);};
			this.color = color;
		}

		this.analogRect.__proto__.type = 'AnalogRect';

		this.addAnalogRect = function(index,x,y,width,height,down,up,color){
			this.analog[index] = new this.analogRect(index,x,y,width,height,down,up,color);
		}

		this.addDigitalButton = function(index,x,y,width,height,down,up,color){
			this.digital[index] = new this.touchButton(index,x,y,width,height,down,up,color);
		}
		this.touchstart = function(a){
			for(var key in a.touches){
				tc.touchStartCheck(a.touches[key]);
			}
		}
		this.touchStartCheck = function(a){
			var t = {
				x: a.clientX || a.pageX,
				y: a.clientY || a.pageY
			};
			t.x -= canvas.offsetLeft;
			t.y -= canvas.offsetTop;
			if(isNaN(t.x) || isNaN(t.y)){return;}
			for(var key in this.digital){
				var b = this.digital[key];
				if(G.RectCollision(b,t)){
					b.down();
					b.pressed = 1;
					return;
				}
			}
			for(var key in this.analog){
				var b = this.analog[key];
				if(G.RectCollision(b,t)){
					var center = {
						x:b.x + b.width * 0.5,
						y:b.y + b.height * 0.5
					};

					var dir = G.GetDir2(t,center);
					var distance = G.GetDistance(center,t);
					var result = {
						x:G.MapNumber(dir.x * distance + b.width * 0.5,0,b.width,-1,1),
						y:G.MapNumber(dir.y * distance + b.height*0.5,0,b.height,-1,1),
					}; 
					b.down(result.x,result.y);
					return;
				}
			}
		}
		this.touchmove = function(a){
			for(var key in a.touches){
				tc.touchMoveCheck(a.touches[key]);
			}
		}
		this.touchMoveCheck = function(a){
			var t = {
				x: a.clientX || a.pageX,
				y: a.clientY || a.pageY
			};
			t.x -= canvas.offsetLeft;
			t.y -= canvas.offsetTop;
			if(isNaN(t.x) || isNaN(t.y)){return;}
			for(var key in this.analog){
				var b = this.analog[key];
				if(G.RectCollision(b,t)){
					var center = {
						x:b.x + b.width * 0.5,
						y:b.y + b.height * 0.5
					};
					var dir = G.GetDir2(t,center);
					var distance = G.GetDistance(center,t);
					var result = {
						x:G.MapNumber(dir.x * distance + b.width * 0.5,0,b.width,-1,1),
						y:G.MapNumber(dir.y * distance + b.height*0.5,0,b.height,-1,1),
					};
					b.active = 1;
					b.down(result.x,result.y);
					return;
				}else if(b.active){
					b.active = 0;
					b.up(0,0);
				}
			}
		}
		this.touchend = function(a){
			for(var key in a.changedTouches){
				tc.touchEndCheck(a.changedTouches[key]);
			}
		}
		this.touchEndCheck = function(a){
			var t = {
				x: a.clientX || a.pageX,
				y: a.clientY || a.pageY
			};
			t.x -= canvas.offsetLeft;
			t.y -= canvas.offsetTop;
			if(isNaN(t.x) || isNaN(t.y)){return;}
			for(var key in this.digital){
				var b = this.digital[key];
				if(G.RectCollision(b,t)){
					b.up();
					return;
				}
			}
			for(var key in this.analog){
				var b = this.analog[key];
				if(G.RectCollision(b,t)){
					b.up(0,0);
					return;
				}
			}
		}
		canvas.addEventListener('touchstart',this.touchstart,false);
		canvas.addEventListener('touchend',this.touchend,false);
		canvas.addEventListener('touchmove',this.touchmove,false);
	}


	G.CreateLabel = function(string,width,height,color,fontColor){
		var c = document.createElement('canvas');
		var ctx = c.getContext('2d');
		c.width = width || 256;
		c.height = height || 256;
		ctx.fillStyle = color || '#f5f'
		ctx.fillRect(0,0,c.width,c.height);
		ctx.font = Math.floor(width * 0.25)+'px helvetica'; 
		ctx.textAlign = 'center';
		ctx.fillStyle = fontColor||'#fff';
		var t = ctx.measureText(string); 
		if(t.width > width){
		  var a = string.split(' ');
		  var y = height*0.5 - a.length * 8;
		  a.forEach(function(s,i){
		    ctx.fillText(s,width*0.5,y+24 * i);
		  });
		}else{
		  ctx.fillText(string,width * 0.5,height * 0.5);
		}
		return c.toDataURL();
	}

//Testing Stuff


function Grid(gridData,gridScale){ 
  var _this = this;
  var levels = [];
  
  this.render = function(ctx){ 
      for(var x = 0; x < 32; x++){
       for(var y = 0; y < 24; y++){  
         this.renderBlock(x,y);
       } 
      } 
  }
  this.set = function(x,y,w){
    if(x >= 0 && x < gridData.length && y >= 0  && y < gridData[0].length){
      gridData[y][x] = w; 
    }
  }

  this.closest = function(x2,y2,type){ // optimize me!
    var blocks = [];
    for(var x = 0; x < 32; x++){
      for(var y = 0; y < 24; y++){  
        if(this.getType(x,y) === type){
          blocks.push({
            xDis:Math.abs(x-x2),
            yDis:Math.abs(y-y2),
            x:x,
            y:y
          });
        }
      } 
    }
    var dis = Infinity;
    var closest = false;
    for(var key in blocks){
      var b = blocks[key];
      if (b.xDis + b.yDis < dis){
        dis = b.xDis + b.yDis;
        closest = b;
      }
    }
    return closest;
  }

  this.targetCount = function(player,currentLevel){
      var targets = 0;
      var y = 2;
      if(player === 1){
       var x = 1;
      }else{
       var x = 17;
      } 
      for(var y2 = y; y2 < 20 + y; y2++){
        for(var x2 = x; x2 < 14 + x; x2++){
          if(gridData[y2][x2] === 2){
            targets++;
          }
        }
      }
      return targets;
  }
      
  this.isSolid = function(x,y){
     return !!gridData[y][x];
  }
  
  this.getType = function(x,y){
   return gridData[y][x]; 
  }
    
  this.fillArea = function(count){
    var newGrid = [];
    for(var y = 0; y < 20; y++){
     newGrid[y] = []; 
     for(var x = 0; x < 14; x++){
       newGrid[y][x] = 0;
     }
    }
    while(count--){
     newGrid[G.Random(20)][G.Random(14)] = 2;
    }
    count = 100;
    while(count--){
     if(G.Random(100) > 50){
        newGrid[G.Random(20)][G.Random(14)] = 1;
      } 
    }
    newGrid[0][5] = newGrid[0][6] = newGrid[0][7] = newGrid[0][8] = 1;
    return newGrid;
  }
    
  this.loadArea = function(level,player){
    var targets = 0;
    var y = 2;
    if(player === 1){
     var x = 1;
    }else{
     var x = 17;
    } 
    for(var y2 = 0; y2 < 20; y2++){
      for(var x2 = 0; x2 < 14; x2++){
        this.set(x+x2,y+y2,levels[level][y2][x2]); 
        if(levels[level][y2][x2] === 2){
          targets++;
        }
      }
    }
  }

  this.clearArea = function(player){
    var y = 2;
    if(player === 1){
     var x = 1;
    }else{
     var x = 17;
    } 
    for(var y2 = 0; y2 < 20; y2++){
      for(var x2 = 0; x2 < 14; x2++){
        this.set(x+x2,y+y2,0); 
      }
    }     
  }
 
  levels.push(this.fillArea(20));
  levels.push(this.fillArea(20));
  levels.push(this.fillArea(20)); 
  
  this.loadArea(0,1,p1);
  this.loadArea(0,2,p2);
  
  this.renderBlock = function(x,y){
   //scene.ctx.fillText(x+':'+y,x*gridScale,y*gridScale);
    switch(gridData[y][x]){
      case 0:
        scene.ctx.clearRect(x*gridScale+0.5,y*gridScale+0.5,gridScale,gridScale);
      break;
      case 1:
        scene.ctx.fillRect(x*gridScale,y*gridScale,gridScale,gridScale);
      break;
      case 2:
        scene.ctx.strokeRect(x*gridScale+0.5,y*gridScale+0.5,gridScale,gridScale);
      break;
    }
  }
  
  this.drawBlock = function(x,y){
    switch(gridData[y][x]){
      case 0:
        scene.ctx.drawImage(images.floor, x*gridScale, y*gridScale,gridScale,gridScale);
      break;
      case 1:
        scene.ctx.drawImage(images.wall, x*gridScale, y*gridScale,gridScale,gridScale);
      break;
      case 2:
        scene.ctx.drawImage(images.target, x*gridScale, y*gridScale,gridScale,gridScale);
      break;
    }
  }
      
  this.getScale = function(){
   return gridScale; 
  }
        
  this.getJSON = function(){
   return JSON.stringify(gridData);          
  }       

	this.toGrid = function(a){
	 return Math.floor(a / gridScale); 
	}
}

  function enableEditor(){ 
    var toGrid = function(x){
      return Math.floor(x / 25);
    }
    var draw = function(event){
      var x = toGrid(event.clientX - scene.canvas.offsetLeft);
      var y = toGrid(event.clientY - scene.canvas.offsetTop);
      grid.set(x,y,event.button);
      grid.renderBlock(x,y);
    }
    var mouseDown = function(event){ 
      draw(event);
      scene.canvas.addEventListener('mousemove',draw,false);
      scene.canvas.addEventListener('mouseup',function(event){
        scene.canvas.removeEventListener('mousemove',draw,false);
      },false);
    }
   scene.canvas.addEventListener('mousedown',mouseDown,false); 
  }


G.Letters = {
  A:{
    pattern:[0,1,1,0,
             1,0,0,1,
             1,1,1,1,
             1,0,0,1,
             1,0,0,1]
  },
  B:{
    pattern:[1,1,1,0,
             1,0,0,1,
             1,1,1,0,
             1,0,0,1,
             1,1,1,0
            ]
  },
  C:{
    pattern:[0,1,1,1,
             1,0,0,0,
             1,0,0,0,
             1,0,0,0,
             0,1,1,1
            ]
  },
  D:{
    pattern:[1,1,1,0,
             1,0,0,1,
             1,0,0,1,
             1,0,0,1,
             1,1,1,0]
},
  E:{
    pattern:[1,1,1,1,
             1,0,0,0,
             1,1,1,1,
             1,0,0,0,
             1,1,1,1
      ]
  },
  F:{
             pattern:[
             1,1,1,1,
             1,0,0,0,
             1,1,1,0,
             1,0,0,0,
             1,0,0,0
      ]
  },
  G:{
    pattern:[1,1,1,1,
             1,0,0,0,
             1,0,1,1,
             1,0,0,1,
             1,1,1,1
      
      ]
  },
  H:{
    pattern:[1,0,0,1,
             1,0,0,1,
             1,1,1,1,
             1,0,0,1,
             1,0,0,1] 
  },
  I:{
    width:3,
    pattern:[1,1,1,
             0,1,0,
             0,1,0,
             0,1,0,
             1,1,1]   
  },
  J:{
    width:3,
    pattern:[0,0,1,
             0,0,1,
             0,0,1,
             1,0,1,
             1,1,1]
},
             K:{
             pattern:[1,0,0,1,
                      1,0,1,0,
                      1,1,0,0,
                      1,0,1,0,
                      1,0,0,1]
             },
  L:{
    width:3,
    pattern:[1,0,0,
             1,0,0,
             1,0,0,
             1,0,0,
             1,1,1
      ]
  },
             M:{width:5,
             pattern:[
             1,0,0,0,1,
             1,1,0,1,1,
             1,0,1,0,1,
             1,0,0,0,1,
             1,0,0,0,1
             ]
             },
  N:{
    width:5,
    pattern:[1,1,0,0,1,
             1,0,1,0,1,
             1,0,1,0,1,
             1,0,1,0,1,
             1,0,0,1,1] 
  },
  O:{
    pattern:[0,1,1,0,
             1,0,0,1,
             1,0,0,1,
             1,0,0,1,
             0,1,1,0]
  },
  P:{
    pattern:[1,1,1,1,
             1,0,0,1,
             1,1,1,1,
             1,0,0,0,
             1,0,0,0]
  },
  Q:{
    pattern:[1,1,1,1,
             1,0,0,1,
             1,0,0,1,
             1,0,1,1,
             1,1,1,1
      ]
  },
             R:{
             pattern:[
             1,1,1,1,
             1,0,0,1,
             1,1,1,1,
             1,0,1,0,
             1,0,0,1]
             },
  S:{
    pattern:[
     0,1,1,1,
     1,0,0,0,
     0,1,1,0,
     0,0,0,1,
     1,1,1,0]
  },
  T:{
    width:3,
    pattern:[1,1,1,
             0,1,0,
             0,1,0,
             0,1,0,
             0,1,0           
            ]
  },
             U:{
             pattern:[
             1,0,0,1,
             1,0,0,1,
             1,0,0,1,
             1,0,0,1,
             0,1,1,0]
             },
  
             V:{
             width:3,
             pattern:[
             1,0,1,
             1,0,1,
             1,0,1,
             1,0,1,
             0,1,0]
             },
  W:{//kinda funky
    width:7,
    pattern:[1,0,0,0,0,0,1,
             1,0,0,1,0,0,1,
             1,0,1,0,1,0,1,
             1,0,1,0,1,0,1,
             0,1,0,0,0,1,0]
  },
  X:{// also funky
    width:5,
    pattern:[1,0,0,0,1,
             0,1,0,1,0,
             0,0,1,0,0,
             0,1,0,1,0,
             1,0,0,0,1]
  },
  Y:{
  	width:3,
  	pattern:[
  	1,0,1,
  	1,0,1,
  	0,1,0,
  	0,1,0,
  	0,1,0  	]
  },
  Z:{// i think its too late, this ones funky too, gonna get some sleep and go again
    pattern:[1,1,1,1,
             0,0,0,1,
             0,1,1,0,
             1,0,0,0,
             1,1,1,1
            ]
  },
  '1':{
  	pattern:[
  	0,1,1,0,
  	0,0,1,0,
  	0,0,1,0,
  	0,0,1,0,
  	0,1,1,1]
  },
  '2':{
  	pattern:[
  	0,1,1,0,
  	1,0,0,1,
  	0,0,1,0,
  	0,1,0,0,
  	1,1,1,1
  	]
  },
  '3':{
  	pattern:[
  	1,1,1,1,
  	0,0,0,1,
  	1,1,1,1,
  	0,0,0,1,
  	1,1,1,1
  	]
  },
  '4':{
  	pattern:[
  	1,0,0,1,
  	1,0,0,1,
  	1,1,1,1,
  	0,0,0,1,
  	0,0,0,1]
  },
  '5':{
  	pattern:[
  	1,1,1,1,
  	1,0,0,0,
  	1,1,1,1,
  	0,0,0,1,
  	1,1,1,1]
  },'6':{
  	pattern:[
  	1,1,1,1,
  	1,0,0,0,
  	1,1,1,1,
  	1,0,0,1,
  	1,1,1,1]
  },'7':{
  	pattern:[
  	1,1,1,1,
  	0,0,0,1,
  	0,0,1,0,
  	0,1,0,0,
  	1,0,0,0]
  },'8':{
  	pattern:[
  	1,1,1,1,
  	1,0,0,1,
  	1,1,1,1,
  	1,0,0,1,
  	1,1,1,1]
  },'9':{
  	pattern:[
  	1,1,1,1,
  	1,0,0,1,
  	1,1,1,1,
  	0,0,0,1,
  	0,0,0,1]
  },'0':{
  	pattern:[
  	1,1,1,1,
  	1,0,0,1,
  	1,0,0,1,
  	1,0,0,1,
  	1,1,1,1]
  },

  '\'':{
  	width:1,
  	pattern:[1]
  },
  '&':{
  	pattern:[
  	0,1,0,0,
  	1,0,1,0,
  	0,1,0,0,
  	1,0,1,0,
  	0,1,0,1]
  },
  ':':{
  	width:3,
  	pattern:[
  	0,0,0,
  	0,1,0,
  	0,0,0,
  	0,1,0,
  	0,0,0]
  },
  '{':{
  	width:5,
  	pattern:[
  	0,0,1,0,0,
  	0,1,0,0,0,
  	1,1,1,1,1,
  	0,1,0,0,0,
  	0,0,1,0,0]
  },
  '}':{
  	width:5,
  	pattern:[
  	0,0,1,0,0,
  	0,0,0,1,0,
  	1,1,1,1,1,
  	0,0,0,1,0,
  	0,0,1,0,0]
  },
  '[':{
  	width:5,
  	pattern:[
  	0,0,1,0,0,
  	0,1,1,1,0,
  	1,0,1,0,1,
  	0,0,1,0,0,
  	0,0,1,0,0]
  },
  ']':{
  	width:5,
  	pattern:[
  	0,0,1,0,0,
  	0,0,1,0,0,
  	1,0,1,0,1,
  	0,1,1,1,0,
  	0,0,1,0,0]
  },
  '*':{
  	pattern:[
  	0,1,0,0,
  	1,0,1,0,
  	0,1,0,0]
  },
  '!':{
    width:2, 
  pattern:[1,0,
           1,0,
           1,0,
           0,0,
           1,0]
},
            '.':{
              width:2,
            pattern:[0,0,0,0,0,0,0,0,1]
            }
  
}

G.Animator = function(src,size,frames,speed,timeLimit,pause){
  var image = new Image();
  image.src = src.src || src;
  var time = 0;
  var frameX = 0;
  var frameY = 0;
  var x = 0;
  var y = 0;
  this.pause = pause || 0;
  this.hold = 0;
  this.update = function(ctx,parent){
    if(!this.pause && !this.hold){
     time++;
     if(time > timeLimit){
       frameY += size;
       if(frameY / size >= frames){
        frameY = 0; 
       }
       time = 0;
     }
    }
  };
  this.setImage = function(img){
  	image = img;
  }
  this.render = function(ctx,parent){
  	ctx.drawImage(image, frameX, frameY, size, size, x, y, size,size);
  }  

  this.setAnim = function(f){
    frameX = f * size;
  }

  this.setFrame = function(f){
  	frameY = f * size;
  }

  this.set = function(x2,y2){
  	x = x2;
  	y = y2;
  }
}
