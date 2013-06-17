//Harrison Hartley 2012

// z index system! do eeet
var G = {};
Math.TAU = Math.PI*2;

Math.toDeg = function(a){
    return a * (180/Math.PI);
}

Math.toRad = function(a){
    return a * (Math.PI/180);
}

Math.toCartesian = function(o){
    var x = 6371 * Math.cos(Math.toRad(o.x)) * Math.cos(Math.toRad(o.y));
    var y = 6371 * Math.cos(Math.toRad(o.x)) * Math.sin(Math.toRad(o.y));
    return new G.Vector2(x,y);
}

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

G.CollisionCheck = function(x,xVel,floor){
  x = (floor - x) / xVel;
  if(x > 0 && x < 1){
   return true;
  }
  return false;
}

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
this.camera = new G.Vector2();
this.cameraShake = new G.Vector2();
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
    backwards = backwards || false;
    ctx.beginPath();
    size = Math.abs(size);
    ctx.arc(x,y,size,start,end,backwards); // Outer circle
    ctx.fill();
}

ctx.fillTriangle = function(size,x,y,rot){
 size *= 0.5;
 ctx.beginPath();
    var xR = Math.sin(rot)*size;
    var yR = Math.cos(rot)*size;
   ctx.moveTo(x+size,y+size);
   ctx.lineTo(xR+x-size,yR+y+size);
   ctx.lineTo(xR+x,yR+y-size);
   ctx.lineTo(xR+x+size,yR+y+size);
  ctx.fill();
};

ctx.fillTriangle=function(size,x,y,rot){
  size*=0.5;
  var tau = Math.PI * 2;
  var f = tau / 3;
  ctx.beginPath();
  ctx.lineTo(x+Math.sin(rot+f)*size,y+Math.cos(rot+f)*size);
  ctx.lineTo(x+Math.sin(rot+f*2)*size,y+Math.cos(rot+f*2)*size);
  ctx.lineTo(x+Math.sin(rot+tau)*size,y+Math.cos(rot+tau)*size);
  ctx.lineTo(x+Math.sin(rot+f)*size,y+Math.cos(rot+f)*size);
  ctx.fill();
}

ctx.strokeTriangle=function(size,x,y,rot){
  size*=0.5;
  var tau = Math.PI * 2;
  var f = tau / 3;
  ctx.beginPath();
  ctx.lineTo(x+Math.sin(rot+f)*size,y+Math.cos(rot+f)*size);
  ctx.lineTo(x+Math.sin(rot+f*2)*size,y+Math.cos(rot+f*2)*size);
  ctx.lineTo(x+Math.sin(rot+tau)*size,y+Math.cos(rot+tau)*size);
  ctx.lineTo(x+Math.sin(rot+f)*size,y+Math.cos(rot+f)*size);
  ctx.stroke();
}



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

G.FontFace = function(size,ctx,foreground,background){
  var _this = this;
  this.letters = {};
  var s = new G.Scene(size * 5,size * 5,0,0);
  var c = s.ctx;
  for(var key in G.Letters){
    var width = G.Letters[key].width || 4;
    width++;
    s.width = s.canvas.width = width * size;
    if(background){
      c.fillStyle = background;
      c.fillRect(0,0,s.width,s.height);
    }else{
     c.clearRect(0,0,s.width,s.height);
    }
    if(foreground){
      c.fillStyle = foreground;
    }
    c.fillText8Bit(key,0,0,size);
    var img = new Image();
    img.src = s.canvas.toDataURL();
    this.letters[key] = img;
  }
  this.drawLetter = function(l,x,y){
    if(_this.letters[l]){
        ctx.drawImage(_this.letters[l],x,y);
        var width = G.Letters[l].width || 4;
        width++;
        return  width * size;
    }
    return 4 * size;
  }
  this.fillText = function(string,x,y){
    var xOffset = 0;
    string = string.toUpperCase();
    if(ctx.textAlign === 'right'){
        x -= Math.floor(G.Get8BitTextWidth(string,size));
    }else if(ctx.textAlign === 'center'){
        x -= Math.floor(G.Get8BitTextWidth(string,size) * 0.5);
    }
    for(var i = 0; i < string.length; i++){
        xOffset += this.drawLetter(string[i],x +xOffset,y);
    }
  };
}

G.Get8BitTextHeight = function(string,scale){
    scale = scale || 2;
    return 5 * scale;
};

CanvasRenderingContext2D.prototype.fillText8Bit = function(string,x,y,scale){
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

CanvasRenderingContext2D.prototype.clearText8Bit = function(string,x,y,scale){
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

CanvasRenderingContext2D.prototype.strokeText8Bit = function(string,x,y,scale){
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
    backwards = backwards || false;
    ctx.beginPath();
    if(size < 0){size = 0};
    ctx.arc(x,y,size,start,end,backwards); // Outer circle
    ctx.lineTo(x,y);
    ctx.fill();

    //  ctx.arc(x,y,size * 0.25,start,end,!backwards); // Outer circle
    //  ctx.arc(x,y,size,start,end,backwards); // Outer circle
}
ctx.strokeCircle = function(size,x,y,start,end,backwards){
    start = start || 0;
    end = end || Math.PI*2;
    backwards = backwards || false;
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
if(parent !== 0){
    parent = parent || document.body;
    parent.appendChild(this.canvas);
}
this.canvas.width = this.width;
this.canvas.height = this.height;
this.camera = new G.Vector2();
this.length = 0;
this.updateList = {};
this.renderList = objects || {};

this.add = function(o){
    o.GeroSoupID = this.length;
    o.GeroSoupScene = this;
    if(o.update){
        this.updateList[o.GeroSoupID] = o;
    }
    if(o.render){
        this.renderList[o.GeroSoupID] = o;
    }
    this.length++;
};
this.remove = function(o){
    if(this.updateList[o.GeroSoupID]){
        delete this.updateList[o.GeroSoupID];
    }
    if(this.renderList[o.GeroSoupID]){
        delete this.renderList[o.GeroSoupID];
    }
}

this.render = function(){
    var ctx = this.ctx;
    ctx.save();
    ctx.scale(this.scale.x,this.scale.y);
    this.cameraShake.zero();
    ctx.translate(-(this.camera.x+this.cameraShake.x),-(this.camera.y+this.cameraShake.y));
    if(this.updateOnly){
        for(i in this.updateList){
            var o = this.updateList[i];
            o.update(ctx,this);
        }
    }else if(this.renderOnly){
        for(i in this.renderList){
            var o = this.renderList[i];
            o.render(ctx,this);
        }
    }else{
        for(i in this.updateList){
            var o = this.updateList[i];
            o.update(ctx,this);
        }
        for(i in this.renderList){
            var o = this.renderList[i];
            o.render(ctx,this);
        }
    }
    ctx.restore();
}

this.dump = this.empty = function(){
    this.renderList = {};
    this.updateList = {};
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
    ctx.translate(-(this.camera.x+this.cameraShake.x),-(this.camera.y+this.cameraShake.y));
    for(var i in this.renderList){
        var o = this.renderList[i];
        if(o.clear){o.clear(ctx); continue;}
        ctx.clearRect(o.x-2,o.y-2,o.width+4,o.height+4);
    }
    ctx.restore();
}

this.setFill = function(color){
    this.ctx.fillStyle = color;
}

}

G.Vector2 = function(x,y){
    this.x = x || 0;
    this.y = y || 0;
};

G.Vector2.prototype = {
    add:function(n){
        this.x += n.x || 0;
        this.y += n.y || 0;
    },
    sub:function(n){
        this.x -= n.x || 0;
        this.y -= n.y || 0;
    },
    mul:function(n){
        this.x *= n.x || 0;
        this.y *= n.y || 0;
    },
    divide:function(n){
        this.x /= n.x || 0;
        this.y /= n.y || 0;
    },
    zero:function(){
        if(this.x > 0){
         this.x--;
        }else if(this.x < 0){
         this.x++;
        }
        if(this.y > 0){
         this.y--;
        }else if(this.y < 0){
         this.y++;
        }
    }
}


G.Vector3 = function(x,y,z){
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

G.Vector3.prototype = {
    add:function(vec){
        this.x += vec.x || vec;
        this.y += vec.y || vec;
        this.z += vec.z || vec;
    },sub:function(vec){
        this.x -= vec.x || vec;
        this.y -= vec.y || vec;
        this.z -= vec.z || vec;
    },mul:function(vec){
        this.x *= vec.x || vec
        this.y *= vec.y || vec;
        this.z *= vec.z || vec;
    },div:function(vec){
        this.x /= vec.x || vec;
        this.y /= vec.y || vec;
        this.z /= vec.z || vec;
    }
}

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

G.LoadImage = function(src,callback){
    var image = new Image();
    if(callback){
        image.onload = callback;
    }
    image.onerror = function(e){
        console.log('failed to load '+src);
    }
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
                if(_this.gamepads[key].axisMove[a]){
                    _this.gamepads[key].axisMove[a](g.axes[a]);
                }
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
        this.axisMove = {};
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
        this.keyUp = function(event){
            if(_this.pause){return};
            var key = event.which || event.keyCode;
            console.log("keyUp:"+key);
            _this.catchUp(key);
            _this.repeat[key] = 0;
            if(_this.up[key]){_this.up[key](event)};
        }
    }else{
        this.keyDown = function(event){
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
        this.keyUp = function(event){
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
    this.set = function(key,down,up){
        if(typeof key === "string"){
            key = key.toLowerCase();
            key = this.keys[key];
        }
        if(down){
            this.down[key] = down;
        }
        if(up){
            this.up[key] = up;
        }
    }
    this.unset = this.remove = function(key){
        if(typeof key === "string"){
            key = key.toLowerCase();
            key = this.keys[key];
        }
        delete this.down[key];
        delete this.up[key];
    }
    document.addEventListener('keydown',_this.keyDown,false);
    document.addEventListener('keyup',_this.keyUp,false);

return this;
}

G.KeyListener.prototype = {
    keys:{'mute':174,'esc':27,'`':192,'1':49,'2':50,'3':51,'4':52,'5':53,'6':54,'7':55,'8':56,'9':57,'0':48,'-':189,'=':187,'backspace':8,'tab':9,'q':81,'w':87,'e':69,'r':82,'t':84,'y':89,'u':85,'i':73,'o':79,'p':80,'[':219,']':221,'\\':220,'a':65,'s':83,'d':68,'f':70,'g':71,'h':72,'j':74,'k':75,'l':76,';':186,'\'':222,'enter':13,'z':90,'x':88,'c':67,'v':86,'b':66,'n':78,'m':77,',':188,'.':190,'/':191,'space':32,'delete':46,'~':192,'!':49,'@':50,'#':51,'$':52,'%':53,'^':54,'&':55,'*':56,'(':57,')':48,'_':189,'+':187,'{':219,'}':221,'|':220,':':186,'"':222,'<':188,'>':190,'?':191,'up':38,'down':40,'left':37,'right':39}
};

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

G.GetDir2 = function(b,a){
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
    var dir = new G.Vector2(dirX,dirY);
    return dir;
}
//######################
//Beta Stoof
//######################

//returns closest object to o in a with a max distance of distance or infinity
G.FindClosest = function(o,a,distance,ignoreZ){
    var distance = distance || Infinity;
    var targetPosition;
    var targetObject;
    for(var key in a){
        var t = a[key].position || a[key];
        var d = G.GetDistanceCheap(o,t,ignoreZ);
        if(d < distance && a[key] != o){
            targetPosition = t;
            distance = d;
            targetObject = a[key];
        }
    }
    return {entity:targetObject,distance:distance};
}

G.FindFarthest = function(o,a,distance,ignoreZ){
    var distance = distance || -Infinity;
    var targetPosition;
    var targetObject;
    for(var key in a){
        var t = a[key].position || a[key];
        var d = G.GetDistanceCheap(o,t,ignoreZ);
        if(d > distance && a[key] != o){
            targetPosition = t;
            distance = d;
            targetObject = a[key];
        }
    }
    return {entity:targetObject,distance:distance};
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

G.RGB = function(r,g,b){
    return 'rgb('+r+','+g+','+b+')';
};

G.RGBA = function(r,g,b,a){
    a = G.MapNumber(a,0,255,0,1);
    return 'rgba('+r+','+g+','+b+','+a+')';
};

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

G.Limit = function(n,min,max){
  min = min || 0;
  max = max || 0;
  return Math.max(Math.min(n,max),min);
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
    var s = document.createElement('style');//#GeroSoupNotificationBox{}.GeroSoupNotification{}
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

G.Particle = function(x,y,vel){
    this.x = x || 0;
    this.y = y || 0;
    this.vel = vel || new G.Vector2();
}

G.ParticleSystem = function(count,particle,render,colors){
  this.particles = [];
  while(count--){
   this.particles.push(particle(count));
  }
  this.render = function(ctx){
    ctx.fillStyle = G.RandomArray(colors);
    var i = this.particles.length;
    var deadCount = 0;
    while(i--){
      var p = this.particles[i];
      if(p.dead){
       deadCount++;
       continue;
      }else{
        render(p,ctx);
      }
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
        canvas = canvas || document.body;
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

        this.analogRect.prototype.type = 'AnalogRect';

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
                        y:G.MapNumber(dir.y * distance + b.height*0.5,0,b.height,-1,1)
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
                        y:G.MapNumber(dir.y * distance + b.height*0.5,0,b.height,-1,1)
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

G.Scene.prototype = {
    startLoop:function(){
        if(this.looping){return;}
        this.looping = true;
        var _this = this;
        var loop = function(){
            if(_this.pause || !_this.looping){return;}
            _this.blank();
            _this.render();
            if(_this.hud){
             _this.hud(_this.ctx);
            }
            requestAnimFrame(loop);
        }
        loop();
    },stopLoop:function(){
        this.looping = false;
    },setNearestNeighbor:function(bool){
        this.ctx.mozImageSmoothingEnabled = this.ctx.webkitImageSmoothingEnabled = !bool;
    },shakeCamera:function(n){
        this.cameraShake.x += Math.floor(G.RandomDir() * Math.random() * n);
        this.cameraShake.y += Math.floor(G.RandomDir() * Math.random() * n);
    }
}

G.Grid = function(width,height,scaleX,scaleY,def){
    var _this = this;
    if(def === 0 || def){ // it works but its rather wonky and confusing
        this.data = this.GenerateGrid(width,height,def);
        this.scaleX = scaleX || 0;
        this.scaleY = scaleY || 0;
        this.width = width || 0;
        this.height = height || 0;
    }else{
        this.data = this.GenerateGrid(width,width,scaleX);
        this.scaleX = height || 0;
        this.scaleY = height || 0;
        this.width = width || 0;
        this.height = width || 0;
    }
    this.halfX = this.scaleX * 0.5;
    this.halfY = this.scaleY * 0.5;
    this.x = 0;
    this.y = 0;
}
//add y first and backwards options
G.Grid.prototype = {
    updateEmptyBlocks:1,
    heatmap:0,
    emptyBlocks:[],
    get:function(x,y,f){
        f = f || false;
        if(x >= 0 && x < this.width && y >= 0 && y < this.height){
            return this.data[x][y];
        }
        return f;
    },
    toImage:function(callback,flip){
        var _this = this;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = this.data.length * this.scaleX;
        canvas.height = this.data[0].length * this.scaleY;
        if(flip){
            this.forEach(function(b,x,y){
                if(!b){
                    ctx.fillRect(x*_this.scaleX,y*_this.scaleY,_this.scaleX,_this.scaleY);
                }
            });
        }else{
            this.forEach(function(b,x,y){
                if(b){
                    ctx.fillRect(x*_this.scaleX,y*_this.scaleY,_this.scaleX,_this.scaleY);
                }
            });
        }
        var img = new Image();
        if(callback){
            img.onload = function(){
                callback(img);
            }
        }
        img.src = canvas.toDataURL();
        return img;
    },
    buildFrame:function(){
        var _this = this;
        var path = [];
        var pen = 0;
        var old = 0;
        console.log(123);
        this.forEach(function(b,x,y){
            if(b != old){
                pen = 1 - pen;
                old = b;
                scene.ctx.fillRect(x*_this.scaleX,y*_this.scaleY,_this.scaleX,_this.scaleY);
            }
        });

        this.forEach(function(b,x,y){
            if(b != old){
                pen = 1 - pen;
                old = b;
                scene.ctx.fillRect(x*_this.scaleX,y*_this.scaleY,_this.scaleX,_this.scaleY);
            }
        },1);
                console.log(123);
        return path;
    },
    FindNext:function(x,y,t){
        var n = Infinity;
        var dir = new G.Vector2(0,0);
        var count = 0;
        var startX = x;
        var startY = y;
        var target = new G.Vector2();
        for(var x2 = x-1; x2 < x+2; x2++){
            for(var y2 = y-1; y2 < y+2; y2++){
                //if((x2%2 || y2%2)){continue;}//skip diagonals
                var b = this.get(x2,y2);
                count+=b;
                if(b !== 0 && b !== false && b < n){
                    dir.x = x2 - x;
                    dir.y = y2 - y;
                    target.x = x2;
                    target.y = y2;
                    n = b;
                }
            }
        }
        if(count < 9){
            target = false;
            target.status = 404;
            dir = new G.Vector2();
        }
        if(t){
            target.status = 303;
            target.value = this.get(target.x,target.y);
            target.x *= this.scaleX;
            target.y *= this.scaleY;
            target.x += this.halfX;
            target.y += this.halfY;
            return target;
        }
        return dir;
    },
    EnableEditor:function(){
        var _this = this;
        if(!this.GeroSoupScene){
            console.log('Grid must be added to Scene first!');
            return;
        }
        var mouseMove = function(event){
            var x = event.clientX - this.offsetLeft + _this.GeroSoupScene.camera.x;
            var y = event.clientY - this.offsetTop + _this.GeroSoupScene.camera.y;
            x = _this.toGrid(x);
            y = _this.toGrid(y);
            if(event.shiftKey){
                _this.set(x,y,1);
            }else{
                _this.set(x,y,0);
            }
        }
        this.GeroSoupScene.canvas.addEventListener('mousedown',function(event){
            var x = event.clientX - this.offsetLeft + _this.GeroSoupScene.camera.x;
            var y = event.clientY - this.offsetTop + _this.GeroSoupScene.camera.y;
            x = _this.toGrid(x);
            y = _this.toGrid(y);
            if(event.shiftKey){
                _this.set(x,y,1);
            }else{
                _this.set(x,y,0);
            }
            _this.GeroSoupScene.canvas.addEventListener('mousemove',mouseMove,false);
        },false);
        this.GeroSoupScene.canvas.addEventListener('mouseup',function(){
            _this.GeroSoupScene.canvas.removeEventListener('mousemove',mouseMove,false);
        },false);

    },
    onEdit:function(){},
    onChange:function(){},
    findEmptyBlock:function(a){
        this.updateEmptyBlockList();
        return G.RandomArray(this.emptyBlocks);
    },
    updateEmptyBlockList:function(){
        if(this.updateEmptyBlocks){
            this.updateEmptyBlocks = 0;
            for(var x = 0; x < this.width; x++){
                for(var y = 0; y < this.height; y++){
                    if(this.data[x][y] === 0){
                        this.emptyBlocks.push(new G.Vector2(x,y));
                    }
                }
            }
            this.onChange();
        }
    },
    flatten:function(){
        var a = [];
        for(var x = 0; x < this.data.length; x++){
            for(var y = 0; y < this.data[0].length; y++){
                a.push({
                    x:x,
                    y:y,
                    value:this.data[x][y]
                });
            }
        }
        return a;
    },GenerateGrid:function(x,y,def){ // should this directly affect this.data?
      var g = [];
      def = def || 0;
      for(var x2 = 0; x2 < x; x2++){
        g[x2] = [];
        for(var y2 = 0; y2 < y; y2++){
          g[x2][y2] = def;
        }
      }
      updateEmptyBlocks = 1;
      return g;
    },forEach:function(callback,mode){
        if(mode === 2){//left to right bottom to top
            var x = this.data.length;
            var y;
            for(var x = 0; x < this.data.length; x++){
                y = this.data[0].length;
                while(y--){
                    callback(this.data[x][y],x,y,this.data);
                }
            }
        }else if(mode === 1){// y first left to right top to bottom
            for(var y = 0; y < this.data[0].length; y++){
                for(var x = 0; x < this.data.length; x++){
                    callback(this.data[x][y],x,y,this.data);
                }
            }
        }else{// left to right top to bototum
            for(var x = 0; x < this.data.length; x++){
                for(var y = 0; y < this.data[0].length; y++){
                    callback(this.data[x][y],x,y,this.data);
                }
            }
        }
    },update:function(){
        this.updateEmptyBlockList();
    },render:function(ctx){
        if(this.heatmap){
            this.renderHeatMap(ctx);
            return;
        }
        if(this.around){
            console.log('implement me!');
            this.renderAround(ctx);
            return;
        }
        var scaleX = this.scaleX;
        var scaleY = this.scaleY;
        var _this = this;
        this.forEach(function(b,x,y,g){
            if(b){
                ctx.fillRect(_this.x+x*scaleX,_this.y+y*scaleY,scaleX,scaleY);
            }else{
                ctx.strokeRect(_this.x+x*scaleX-0.5,_this.y+y*scaleY-0.5,scaleX,scaleY);
            }
        });
    },renderHeatMap:function(ctx){
        var scaleX = this.scaleX;
        var scaleY = this.scaleY;
        this.forEach(function(b,x,y,g){
            if(b){
                ctx.fillStyle = getHeatColor(b,0,10);
                ctx.fillRect(x*scaleX,y*scaleY,scaleX,scaleY);
            }else{
                ctx.strokeRect(x*scaleX-0.5,y*scaleY-0.5,scaleX,scaleY);
            }
        });
    },toGrid:function(x,scale){
        scale = scale || this.scaleX;
        return Math.floor(x / scale);
    },set:function(x,y,n){
        if(x >= 0 && x < this.data.length && y >= 0 && y < this.data[0].length){
            if(this.data[x][y] !== n){
                this.updateEmptyBlocks = 1;
            }
            this.data[x][y] = n;
        }
    },add:function(x,y,n){
        if(x >= 0 && x < this.data.length && y >= 0 && y < this.data[0].length){
            this.data[x][y] += n;
            this.updateEmptyBlocks = 1;
        }
    },sub:function(x,y,n,limit){
        if(x >= 0 && x < this.data.length && y >= 0 && y < this.data[0].length){
            if(limit !== undefined){
             this.data[x][y] = G.Limit(this.data[x][y] -= n,limit,Infinity);
            }else{
             this.data[x][y] -= n;
            }
            this.updateEmptyBlocks = 1;
        }
    },setRect:function(x,y,width,height,n){
        var x2 = x;
        var y2 = y;
        var h = height;
        while(width--){//#optimize
            h = height;
            while(h--){
                if(this.data[x+width]){
                    this.data[x+width][y+h] = n;
                }
            }
        }
        this.updateEmptyBlocks = 1;
    },addRect:function(x,y,width,height,n){
        var x2 = x;
        var y2 = y;
        var h = height;
        while(width--){//#optimize
            h = height;
            while(h--){
                if(this.data[x+width]){
                    this.data[x+width][y+h] += n;
                }
            }
        }
        this.updateEmptyBlocks = 1;
    },subRect:function(x,y,width,height,n,limit){
        var x2 = x;
        var y2 = y;
        var h = height;
        while(width--){//#optimize
            h = height;
            while(h--){
                if(this.data[x+width]){
                    if(limit !== undefined){
                        this.data[x+width][y+h] = G.Limit(this.data[x+width][y+h] - n,limit,Infinity);
                    }else{
                       this.data[x+width][y+h] -= n;
                    }
                }
            }
        }
        this.updateEmptyBlocks = 1;
    },losCheap:function(o,o2){
      var dir = G.GetDir2(o2,o);
      var x = o.x;
      var y = o.y;
      var x2 = x;
      var y2 = y;
      var end = 0;
      while(!(x === o2.x && y === o2.y)){
        if(this.data[x] && this.data[x][y]){
          return false;
        }else{
          if(x !== o2.x){
            x2 += dir.x;
            x = Math.floor(x2);
          }
          if(y != o2.y){
            y2 += dir.y;
            y = Math.floor(y2);
          }
        }
      }
      return true;
    },LOS:function(o,o2){
        if(this.losCheap(o,o2) && this.losCheap(o2,o)){
            return true;
        }
        return false;
    },findPath:function(from,to,callback){
      var frontlines = [];
      var visited = this.GenerateGrid(this.width,this.height);
      var time = Date.now();
      var found;
      var grid = this.data;
      frontlines.push({x:from.x,y:from.y,path:[]});

      while(!found && frontlines.length > 0 && Date.now() - time < 2000){
        var f = frontlines.shift();
        if(f.x === to.x && f.y === to.y){
          found = f.path;
        }
        f.path.push({x:f.x,y:f.y});
        var x = f.x;
        var y = f.y;
        var path = f.path;
        if(x+1 >= 0 && x+1 < grid.length && y >= 0 && y < grid[0].length && grid[x+1][y] === 0 && visited[x+1][y] === 0){
          frontlines.push({x:x+1,y:y,path:G.DuplicateObject(path)});
          visited[x+1][y] = 1;
        }
        if(x-1 >= 0 && x-1 < grid.length && y >= 0 && y < grid[0].length && grid[x-1][y] === 0 && visited[x-1][y] === 0){
          frontlines.push({x:x-1,y:y,path:G.DuplicateObject(path)});
          visited[x-1][y] = 1;
        }
        if(x >= 0 && x < grid.length && y-1 >= 0 && y-1 < grid[0].length && grid[x][y-1] === 0 && visited[x][y-1] === 0){
          frontlines.push({x:x,y:y-1,path:G.DuplicateObject(path)});
          visited[x][y-1] = 1;
        }
        if(x >= 0 && x < grid.length && y+1 >= 0 && y+1 < grid[0].length && grid[x][y+1] === 0 && visited[x][y+1] === 0){
          frontlines.push({x:x,y:y+1,path:G.DuplicateObject(path)});
          visited[x][y+1] = 1;
        }
      }
      callback(found);
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
    0,1,0   ]
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
  },'#':{
    width:5,
    pattern:[0,1,0,1,0,
             1,1,1,1,1,
             0,1,0,1,0,
             1,1,1,1,1,
             0,1,0,1,0
            ]
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
'?':{
    width:3,
    pattern:[
    1,1,1,
    0,0,1,
    0,1,0,
    0,0,0,
    0,1,0]
  },
            '.':{
              width:2,
            pattern:[0,0,0,0,0,0,0,0,1]
            }

}

G.GenerateGrid = function(x,y,def){
        var g = [];
        def = def || 0;
        for(var x2 = 0; x2 < x; x2++){
            g[x2] = [];
            for(var y2 = 0; y2 < y; y2++){
                g[x2][y2] = def;
            }
        }
        return g;
    }

G.Animator = function(src,size,frames,timeLimit,pause,scale){
  var image = new Image();
  image.src = src.src || src;
  var time = 0;
  var frameX = 0;
  var frameY = 0;
  var x = 0;
  var y = 0;
  var flip = 1;
  scale = scale || size;
  this.pause = pause || 0;
  this.hold = 0;
  this.update = function(ctx,parent){
    if(!this.pause && !this.hold){
     time++;
     if(time > timeLimit){
       frameX += size;
       if(frameX / size >= frames){
        frameX = 0;
       }
       time = 0;
     }
    }
  };
  this.setImage = function(img){
    image = img;
  }
  this.render = function(ctx,parent){
    if(flip){
        ctx.save();
        ctx.translate(x,y);
        ctx.scale(-1,1);
        ctx.drawImage(image, frameX, frameY, size, size, -size, 0, scale,scale);
        ctx.restore();
    }else{
        ctx.drawImage(image, frameX, frameY, size, size, x, y, scale,scale);
    }
  }

  this.returnCurrentFrame = function(){
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = canvas.height = scale;

    if(flip){
        ctx.save();
        ctx.scale(-1,1);
        ctx.drawImage(image, frameX, frameY, size, size, -size, 0, scale,scale);
        ctx.restore();
    }else{
        ctx.drawImage(image, frameX, frameY, size, size, 0, 0, scale,scale);
    }

    var img2 = new Image();
    img2.src = canvas.toDataURL();
    return img2;
  }

  this.setAnim = function(f){
    frameY = f * size;
  }

  this.setFrame = function(f){
    frameX = f * size;
  }

  this.setFlip = function(n){
    flip = n;
  }

  this.set = function(x2,y2){
    x = x2;
    y = y2;
  }
}

G.MouseLock = function(){
    var _this = this;
    var enableMouseLock = function(e){
      var movementX = e.movementX       ||
                      e.mozMovementX    ||
                      e.webkitMovementX ||
                      0,
          movementY = e.movementY       ||
                      e.mozMovementY    ||
                      e.webkitMovementY ||
                      0;
      console.log("movementX=" + movementX, "movementY=" + movementY);
    }
    this.enable = function(elem){
        _this.lockedElem = elem;
        elem.requestPointerLock = elem.requestPointerLock    ||
                                  elem.mozRequestPointerLock ||
                                  elem.webkitRequestPointerLock;
        elem.requestPointerLock();
    }
    this.disable = function(){
        _this.lockedElem.removeEventListener("mousemove",enableMouseLock,false);
    }
    var pointerLockChange = function(){
        var elem = _this.lockedElem;
        if (document.mozPointerLockElement === elem ||
            document.webkitPointerLockElement === elem) {
            console.log("Pointer Lock was successful.");
        } else {
            console.log("Pointer Lock was lost.");
        }
    }
    document.addEventListener('pointerlockchange', pointerLockChange, false);
    document.addEventListener('mozpointerlockchange', pointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
}


G.RemoveFromArray=function(item,array){
  for(var i = 0; i < array.length; i++){
    if(item === array[i]){
      array.splice(i,1);
      // cehck this bit
      G.RemoveFromArray(item,array);
      return;
    }
  }
}

G.ParseGet = function(url){
 var s = url || window.location.href;
 s = s.split('?');
 s = s[s.length-1];
 s = s.split('&');
 var o = {};
 for(var i = 0; i < s.length; i++){
   var k = s[i];
   k = k.split('=');
   o[k[0]] = k[1];
 }
 return o;
}

G.DuplicateObject=function(o){
  return JSON.parse(JSON.stringify(o));
}

G.TopDownEntity = function(x,y,grid,gravity){
    var _this = this;
    this.x = x || 0;
    this.y = y || 0;
    this.noclip = 0;
    this.gravity = gravity || 0;
    this.width = this.height = 16;
    this.vel = new G.Vector2();
    this.lookDir = new G.Vector2();
    this.totalVel = new G.Vector2();//this and movementx/y and vel need better names
    this.extVel = new G.Vector2();
    this.movementX = [0,0];
    this.movementY = [0,0];
    this.triggerHurtBoxes = [];
    this.grid = grid || false;
    this.node = false;
    this.movementSpeed = 1;
    this.friction = 0.1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.stepHeight = 0;
    this.addWASD = function(kb,disableVertical){
        if(!disableVertical){
            kb.down[87] = function(){
                _this.movementY[0] = -1;
            }
            kb.up[87] = function(){
                _this.movementY[0] = 0;
            }
            kb.down[83] = function(){
                _this.movementY[1] = 1;
            }
            kb.up[83] = function(){
                _this.movementY[1] = 0;
            }
        }
        kb.down[65] = function(){
            _this.movementX[0] = -1;
        }
        kb.up[65] = function(){
            _this.movementX[0] = 0;
        }
        kb.down[68] = function(){
            _this.movementX[1] = 1;
        }
        kb.up[68] = function(){
            _this.movementX[1] = 0;
        }
    }
}

G.TopDownEntity.prototype = {
    weight:1,
    setNode:function(node){
        this.node = node;
    },
    checkTriggerHurtBoxes:function(){
     for(var i = 0; i < this.triggerHurtBoxes.length; i++){
        var a = this.triggerHurtBoxes[i];
        for(var x = 0; x < a.length; x++){
           var hitbox = this.hitbox || this;
            if(G.RectCollision(a[x],hitbox)){
                this.triggerHurt(a[x]);
            }
        }
     }
    },
    triggerHurt:function(a){
        if(this.damageTimer>0){return;}// feels like this shouldn't be specified by the engine
        this.damageTimer = 5;
        this.hurt(a.damage,a.parent);
        var dir = G.GetDir2(a.parent,this);
        this.extVel.x = Math.floor(dir.x * 100);
        this.extVel.y = Math.floor(dir.y * 100);
    },
    hurt:function(){},
    followNode:function(n){
        n = n || 5;
        if(this.node.status === 302){
            this.vel.x = this.vel.y = 0;
            this.node = false;
            this.foundNode();
            return;
        }else if(this.node.status === 404){
            this.vel.x = this.vel.y = 0;
            this.node = false;
            this.cannotReachNode();
        }
        if(G.GetDistanceCheap(this.node,this) < n){
            this.node = false;
            this.nextNode();
            return;
        }
        this.vel = G.GetDir2(this,this.node);
    },
    foundNode:function(){},
    nextNode:function(){},
    cannotReachNode:function(){},
    render:function(ctx){
        ctx.fillCircle(5,this.x,this.y);
    },
    update:function(){
        this.move();
        this.checkTriggerHurtBoxes();
        if(this.damageTimer){
            this.damageTimer--;
        }
    },
    collisionCheck:function(){},
    render:function(ctx){
        ctx.fillStyle = '#f80';
        ctx.fillCircle(5,this.x,this.y);
    },
    move:function(velX,velY){
        this.extVel.y += this.gravity;
        velX = velX || this.vel.x;
        velY = velY || this.vel.y;
        velX += this.movementX[0] + this.movementX[1];
        velY += this.movementY[0] + this.movementY[1];
        if(velX || velY){
         this.lookDir.x = velX;
         this.lookDir.y = velY;
        }
        velX *= this.movementSpeed;
        velY *= this.movementSpeed;
        velX += (this.extVel.x / 100)*this.weight;
        velY += (this.extVel.y / 100)*this.weight;
        var update = new G.Vector2();

        if(this.extVel.x > 0){
         this.extVel.x -= 1;
        }else if(this.extVel.x < 0){
         this.extVel.x += 1;
        }

        if(this.extVel.y > 0){
         this.extVel.y -= 1;
        }else if(this.extVel.y < 0){
         this.extVel.y += 1;
        }

        this.totalVel.x = velX;
        this.totalVel.y = velY;

        if(this.noclip){
            this.x += velX;
            this.y += velY;
        }else{
            if(this.grid){
                var grid = this.grid;
                var x = grid.toGrid(this.x + velX);
                var y = grid.toGrid(this.y);
                if(this.grid.data[x] && this.grid.data[x][y] === 0){
                    update.x = 1;
                }
                /*
                if(this.stepHeight){
                    scene.ctx.fillRect(x*this.grid.scaleX,y*this.grid.scaleY,this.grid.scaleX,this.grid.scaleY);
                    for(var i = 0; i < this.stepHeight; i++){
                        if(this.grid.get(x,y-i) === 0 && this.grid.get(x+velX,y) > 0){
                            this.y -= this.grid.scaleY;
                        }
                    }
                }
                */
                x = grid.toGrid(this.x);
                y = grid.toGrid(this.y + velY);
                if(this.grid.data[x] && this.grid.data[x][y] === 0){
                    update.y = 1;
                }
            }
            if(this.entityCollisions){
                if(this.entityCollisions.length !== undefined){
                    for(var i = 0; i < this.entityCollisions.length; i++){
                        var k = this.checkEntityCollisions(this.entityCollisions[i],update,new G.Vector2(velX,velY));
                    }
                }else{
                    var k = this.checkEntityCollisions(this.entityCollisions,update,new G.Vector2(velX,velY));
                }
                /*
                if(this.entityCollisions.length !== undefined){
                    for(var i = 0; i < this.entityCollisions.length; i++){
                        var k = this.checkHitboxCollisions(this.entityCollisions[i],update,new G.Vector2(velX,velY));
                    }
                }else{
                    var k = this.checkHitboxCollisions(this.entityCollisions,update,new G.Vector2(velX,velY));
                }
                */
            }
            if(update.x){
                this.x += velX;
            }
            if(update.y){
                this.y += velY;
            }else if(this.gravity){
                this.extVel.y = 0;
            }
        }
    },
    checkEntityCollisions:function(array,update,vel){
        if(this.size){
            var size = this.size;
        }else{
            var size = (this.width+this.height)/2
        }
        for(var i = 0; i < array.length; i++){
            if(array[i].GeroSoupID === this.GeroSoupID){continue;}
            var pos = new G.Vector2(this.x,this.y);
            var entity = array[i];
            if(entity.size){
                var entitySize = entity.size;
            }else{
                var entitySize = (entity.width+entity.height)/2
            }
            entitySize += size;
            entitySize /= 2;
            entitySize *= 0.7;
            var startingDistance = G.GetDistance(pos,entity);
                pos.x += vel.x;
            var xDistance = G.GetDistance(pos,entity);
                pos.x -= vel.x;
                pos.y += vel.y;
            var yDistance = G.GetDistance(pos,entity);

            if(xDistance < entitySize){
                update.x = 0;
            }
            if(yDistance < entitySize){
                update.y = 0;
            }
        }
    },
    checkHitboxCollisions:function(array,update,vel){
        if(this.hitbox){
            var hitbox = new G.Rect(this.hitbox.x,this.hitbox.y,this.hitbox.width,this.hitbox.height);
        }else{
            var hitbox = new G.Rect(this.x,this.y,this.width,this.height);
        }
        var pos = new G.Vector(hitbox.x,hitbox.y);
        var newPos = new G.Vector(hitbox.x+vel.x,hitbox.y+vel.y);

        hitbox.x += vel.x;
        for(var i = 0; i < array.length; i++){
            if(array[i].GeroSoupID === this.GeroSoupID){continue;}
            var otherHitbox = array[i].hitbox || array[i];
            if(G.RectCollision(otherHitbox,hitbox)){
                update.x = 0;
            }
        }
        hitbox.x -= vel.x;
        hitbox.y += vel.y;
        for(var i = 0; i < array.length; i++){
            if(array[i].GeroSoupID === this.GeroSoupID){continue;}
            var otherHitbox = array[i].hitbox || array[i];
            if(G.RectCollision(otherHitbox,hitbox)){
                update.y = 0;
            }
        }
    }
}

// change grid to tileSystem and add gravity and whatnot?

G.LoadTileset = function(src,size,callback,list){
    if(list){
        var tiles = {};
    }else{
        var tiles = [];
    }
    var img = new Image();
    img.onload = function(){
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = canvas.height = size;
        var count = 0;
        for(var y = 0; y < img.height/size; y++){
            for(var x = 0; x < img.width / size; x++){
                ctx.drawImage(img,-x*size,-y*size);
                var i = new Image();
                i.src =canvas.toDataURL();
                if(list){
                    var s = list[count] || count;
                    tiles[s] = i;
                }else{
                    tiles.push(i);
                }
                ctx.clearRect(0,0,canvas.width,canvas.height);
                count++;
            }
        }
        callback(tiles);
    }
    img.src = src;
}


G.AudioManager = function(){
  this.volume = 1;
  this.sounds = {};
  this.loaded = 0;
  this.soundCount = 0;
}

G.AudioManager.prototype = {
  load:function(name,url){
    var audio = new Audio();
    var _this = this;
    _this.soundCount++;
    //console.log('loading ' + name);
    audio.addEventListener('canplaythrough', function() {
      _this.sounds[name] = audio;
      //console.log(name + ' loaded');
      _this.loaded++;
      if(_this.loaded == _this.soundCount){
        _this.Log();
      }
    }, false);
    audio.id = name;
    audio.src = url;
    document.body.appendChild(audio);
  },
  Log:function(){
    console.groupCollapsed('Loaded Sounds');
    for(key in this.sounds){
        console.log(key);
    }
    console.groupEnd();
  },
  play:function(name){
    if(this.sounds[name]){
      var click=this.sounds[name];
      click.volume=this.volume;
      click.currentTime = 0;
      click.play();
    }
  },
  remove:function(name){
    delete this.sounds[name];
  }
};


G.SplitString =function(file,n){
n = n || 30;
var a = [];
var s = '';
var i = 0;
while(file[i]){
  s += file[i];
  if(!(i%n) && i > 3){
    a.push(s);
    s ='';
  }
  i++;
}
a.push(s);
  return a;
}

G.SplitFile = function(file){
    var a = [];
    var i = 0;
    while(file[i]){
        i++;
        if(i === 950){
            a.push(a.length+':::'+file.substr(0,i));
            file = file.substr(i);
            i = 0;
        }
    }
    a.push(a.length+':::'+file);
    return a;
}

G.AssembleFile = function(parts){
    var o = [];
    for(var i = 0; i < parts.length; i++){
        var data = parts[i].split(':::');
        var index = data[0];
        data = parts[i].replace(data[0],'');
        data = data.split(':::').join('');
        o[index] = data;
    }
    return o.join('');
}

G.MouseListener = function(elem){
    var _this = this;
    this.down = function(){};
    this.up = function(){};
    this.drag = function(){};
    this.systemdrag = function(event){
        var pos = new G.Vector2(event.clientX - elem.offsetLeft,event.clientY - elem.offsetTop);
        _this.drag(pos,event);
    }
    elem = elem || document.body;
    elem.addEventListener('mousedown',function(event){
        var pos = new G.Vector2(event.clientX - elem.offsetLeft,event.clientY - elem.offsetTop);
        _this.down(pos,event);
        elem.addEventListener('mousemove',_this.systemdrag,false);
    },false);

    elem.addEventListener('mouseup',function(event){
        var pos = new G.Vector2(event.clientX - elem.offsetLeft,event.clientY - elem.offsetTop);
        _this.up(pos,event);
        elem.removeEventListener('mousemove',_this.systemdrag,false);
    },false);
}


G.Request = function(url,callback){
var xmlhttp;
if (window.XMLHttpRequest){
  xmlhttp=new XMLHttpRequest();
}else{
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}
xmlhttp.onreadystatechange=function(){
  if(xmlhttp.readyState==4 && xmlhttp.status==200){
    callback(xmlhttp.responseText);
  }
}
xmlhttp.open("GET",url,true);
xmlhttp.send();
}
