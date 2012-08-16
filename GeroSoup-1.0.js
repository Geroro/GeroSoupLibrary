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
G.padDebounce = [];

G.NotificationTime = 2000;

G.Scene = function(width, height){
this.width = width || 0;
this.height = height || 0;
this.ctx = document.createElement('canvas').getContext('2d');
var ctx = this.ctx;
ctx.fillCircle = function(size,x,y){
	ctx.beginPath();
	if(size < 0){size = Math.abs(size)};
	ctx.arc(x,y,size,0,Math.PI*2,true); // Outer circle
	ctx.fill();
}
ctx.strokeCircle = function(size,x,y){
	ctx.beginPath();
	if(size < 0){size = Math.abs(size)};
	ctx.arc(x,y,size,0,Math.PI*2,true); // Outer circle
	ctx.stroke();
}
this.canvas = this.ctx.canvas;
this.canvas.className = 'GeroSoupCanvas';
document.body.appendChild(this.canvas);
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
	o.GeroSoupOldWidth = o.GeroSoupOldY = o.GeroSoupOldX = 	o.GeroSoupOldHeight = 0;
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
	ctx.translate(-this.camera.x,-this.camera.y);
	for(i in this.objects){
		var o = this.objects[i];
		o.GeroSoupOldX = o.x;
		o.GeroSoupOldY = o.y;
		o.GeroSoupOldWidth = o.width;
		o.GeroSoupOldHeight = o.width;
		o.render(ctx);
	}
	ctx.restore();
	for(i in this.hud){
		var o = this.hud[i];
		o.render(ctx);
	}
}

this.empty = function(){
	this.objects = {};
}

this.blank = function(){
	this.ctx.clearRect(0,0,this.width,this.height);
}

this.clear = function(){
	var ctx = this.ctx;
	ctx.translate(this.camera.x, this.camera.y);
	for(i in this.objects){
		var o = this.objects[i];
		if(o.clear){o.clear(); continue;}
		ctx.clearRect(o.GeroSoupOldX - 2, o.GeroSoupOldY - 2, o.GeroSoupOldWidth + 4, o.GeroSoupOldHeight) + 4;
	}
	ctx.translate(-this.camera.x, -this.camera.y);
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
	this.render = function(xOffset, yOffset,ctx){
		ctx.font = this.font;
		ctx.textAlign = this.align;
		ctx.fillText(this.text, this.x, this.y);
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
		ctx.fillRect(x,y,width,height);
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
  n.innerText = text;
  d.appendChild(n);
  setTimeout(function(){d.removeChild(n);},time);
};

G.StringifyObject = function(o,objectName,suffix,limit,current){
  var string = '';
  limit = limit || 2;
  current = current || -1;
  current++;
  if(current > limit){
  	return '';
  }
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

G.DefaultStyle = function(){
    var s = document.createElement('style');
    s.innerText = '#GeroSoupNotificationBox{position:absolute;right:0px;top:0px;width:25%;}.GeroSoupNotification{text-align:center;display:block;border:solid 1px black;border-radius:10px;padding:5px;margin:5px;background-color:white;color:black;} ';
    document.body.appendChild(s);
}