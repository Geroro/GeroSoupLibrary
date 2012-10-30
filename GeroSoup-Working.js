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

G.Scene = function(width, height, parent){
this.width = width || 0;
this.height = height || 0;
this.camera = {x:0,y:0};
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
y:0,
}
this.length = 0;
this.objects = {};
this.hud = {};

this.add = function(o){
	o.GeroSoupID = this.length;
	this.objects[o.GeroSoupID] = o;
	this.length++;
};
this.remove = function(o){
	delete this.objects[o.GeroSoupID];
}

this.addHud = function(o){
	o.GeroSoupID = this.length;
	this.hud[o.GeroSoupID] = o;
	this.length++;
};
this.removeHud = function(o){
	delete this.hud[o.GeroSoupID];
}

this.render = function(){
	var ctx = this.ctx;
	ctx.save();
	ctx.scale(this.scale.x,this.scale.y);
	ctx.translate(-this.camera.x,-this.camera.y);
	for(i in this.objects){
		var o = this.objects[i];
		o.render(ctx);
	}
	ctx.restore();
	for(i in this.hud){
		var o = this.hud[i];
		o.render(ctx);
	}
}

this.dump = this.empty = function(){
	this.objects = {};
}

this.dumpHud = this.emptyHud = function(){
	this.hud = {};
};

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
G.GamePadListener = function(d){
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
				if(g.buttons[b] > 0.2 || g.buttons[b] < -0.2){
					if(!d){
						if(_this.gamepads[key].buttonDown[b]){
							_this.gamepads[key].buttonDown[b](g.buttons[b],b);
						}else{
							console.log(g.buttons[b]);
						}
					}
					_this.gamepads[key].buttonDebounce[b] = 1;
				}else{
					if(d){
						if(_this.gamepads[key].buttonUp[b]){
							_this.gamepads[key].buttonUp[b](g.buttons[b],b);
						}else{
							console.log(b);
						}
					}
					_this.gamepads[key].buttonDebounce[b] = 0;
				}
			}
			for(var a in g.axes){
				var d = _this.gamepads[key].axisDebounce[a];
				if(g.axes[a] > 0.2 || g.axes[a] < -0.2){
					if(!d){
						if(_this.gamepads[key].axisDown[a]){
							_this.gamepads[key].axisDown[a](g.axes[a],a);
						}else{
							console.log(a);
						}
					}
					_this.gamepads[key].axisDebounce[a] = 1;
				}else{
					if(d){
						if(_this.gamepads[key].axisUp[a]){
							_this.gamepads[key].axisUp[a](g.axes[a],a);
						}else{
							console.log(a);
						}
					}
					_this.gamepads[key].axisDebounce[a] = 0;
				}
			}
		}
	}
	this.debugger = function(){
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
	}
	this.gamepad = function(){
		this.active = 0;
		this.buttonDown = {};
		this.buttonUp = {};
		this.buttonDebounce = {};
		this.axisDown = {};
		this.axisUp = {};
		this.axisDebounce = {};
	}
	if(gamepadSupportAvailable){
		console.log('Gamepads Enabled');
		this.init();
	}else{
		console.log('Gamepads Failed');
		return false;
	}

}

G.KeyListener=function(debug){
	var _this = this;
	this.pause = 0;
	this.down = {};
	this.up = {};
	if(debug){
	this.keyDown = function(){
		if(_this.pause){return};
		var key = event.which || event.keyCode;
		console.log(key);
		//console.log("keyDown:" + key);
		if(_this.down[key]){_this.down[key]()};
	}
	
	this.keyUp = function(){
		if(_this.pause){return};
		var key = event.which || event.keyCode;
		console.log(key);
		//console.log("keyUp:"+key);
		if(_this.up[key]){_this.up[key]()};
	}
	}else{
	this.keyDown = function(){
		if(_this.pause){return};
		var key = event.which || event.keyCode;
		//console.log("keyDown:" + key);
		if(_this.down[key]){_this.down[key]()};
	}
	
	this.keyUp = function(){
		if(_this.pause){return};
		var key = event.which || event.keyCode;
		//console.log("keyUp:"+key);
		if(_this.up[key]){_this.up[key]()};
	}
	}
	document.addEventListener('keydown',_this.keyDown,false);
	document.addEventListener('keyup',_this.keyUp,false);

return this;
}

G.GetDistance = function(a,b){
	var xDis = b.x - a.x;
	xDis = xDis * xDis;

	var yDis = b.y - a.y;
	yDis = yDis * yDis;
	
	var dis = xDis + yDis;
	return Math.sqrt(dis);
}

//3d Function
G.GetDistance3 = function(a,b){
	var xDis = b.x - a.x;
	var yDis = b.y - a.y;
	var zDis = b.z - a.z;
	xDis = xDis * xDis;
	yDis = yDis * yDis;
	zDis = zDis * zDis;
	var dis = xDis + yDis + zDis;
	return Math.sqrt(dis);
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

G.Rect = function(x,y,width,height){
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.render = function(ctx){
		ctx.fillRect(this.x,this.y,this.width,this.height);
	}
}

G.FillRect = function(x,y,width,height,rotation){
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.rotation = rotation || 0;
	this.render = function(ctx){
		if(this.rotation){
			ctx.translate(this.x, this.y);
			ctx.rotate(this.rotation);
			ctx.fillRect(-this.width * 0.5,-this.height*0.5,this.width,this.height);
			ctx.rotate(-this.rotation);
			ctx.translate(-this.x, -this.y);
		}else{
			ctx.fillRect(this.x,this.y,this.width,this.height);
		}
	}
}

G.StrokeRect = function(x,y,width,height,rotation){
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.rotation = rotation || 0;
	this.render = function(ctx){
		if(this.rotation){
			ctx.translate(this.x, this.y);
			ctx.rotate(this.rotation);
			ctx.strokeRect(-this.width * 0.5,-this.height*0.5,this.width,this.height);
			ctx.rotate(-this.rotation);
			ctx.translate(-this.x, -this.y);
		}else{
			ctx.strokeRect(this.x,this.y,this.width,this.height);
		}
	}
}

G.RectCollision = function(a,b){
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
G.GetClosest = function(o,a,distance){
	var distance = distance || Infinity;
	var target;
	for(var key in a){
		var t = a[key];
		if(t.alive === 0){continue;}
		var d = G.GetDistance(o,t);
		if(d < distance){
			target = t;
			distance = d;
		}
	}
	return target;
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
  		ctx.strokeStyle = this.color;
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

G.TouchControls = function(o){//touchListener
		o = o || {};
		var tc = this;
		this.digital = {};
		this.analog = {};
		this.buttonSize = 32;
		this.color = o.color || G.RandomColor();
		this.render = function(ctx){
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = this.color;
			for(var key in this.digital){
				var b = this.digital[key];
				ctx.drawButton(b.x,b.y,b.size,b.size);
			}
			ctx.globalAlpha = 1;
		}
		this.touchButton = function(index,x,y,size,down,up){
			var _this = this;
			this.index = index;
			this.x = x || 0;
			this.y = y || 0;
			this.pressed = 0;
			this.size = size || 10;
			this.down = down || function(){console.log(_this.index)};
			this.up = up || function(){console.log(_this.index)};
		}
		this.addDigitalButton = function(index,x,y,size,down,up){
			this.digital[index] = new this.touchButton(index,x,y,size,down,up);
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
			t.x -= scene.canvas.offsetLeft;
			t.y -= scene.canvas.offsetTop;
			for(var key in this.digital){
				var b = this.digital[key];
				if(G.GetDistance(b,t) < b.size){
					b.down();
					b.pressed = 1;
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
			t.x -= scene.canvas.offsetLeft;
			t.y -= scene.canvas.offsetTop;

			for(var key in this.digital){
				var b = this.digital[key];
				if(G.GetDistance(b,t) < b.size){
					b.up();
				}
			}
		}
		scene.canvas.addEventListener('touchstart',this.touchstart,false);
		scene.canvas.addEventListener('touchend',this.touchend,false);
		scene.addHud(this);
	}