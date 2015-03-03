function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameDuration = frameDuration;
    this.frames = frames;
    this.loop = loop;
    this.reverse = reverse;

    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
}
Animation.prototype.drawFrame = function(tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1.1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    }

    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    if ((index + 1) * this.frameWidth > this.frames * this.frameWidth) {
        index -= this.frameWidth;
    }

    var locX = x;
    var locY = y;
    var offset = this.startY;
    ctx.drawImage(this.spriteSheet, this.startX, index * this.frameHeight + offset,
        this.frameWidth, this.frameHeight,
        locX, locY, this.frameWidth * scaleBy,
        this.frameHeight * scaleBy);
}
Animation.prototype.currentFrame = function() {
    return Math.floor(this.elapsedTime / this.frameDuration);
}
Animation.prototype.isDone = function() {
    return (this.elapsedTime >= this.totalTime);
}
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Unit(game) {
    
    this.radius = 20;
    this.visualRadius = 200;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 100, y: Math.random() * 100 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
    this.frameWidth = 74;
    this.direction = 2;
    this.animation_frame = this.frameWidth * this.direction;
    this.updateAnimation(2);
    this.attacking = false;
    
};

Unit.prototype = new Entity();
Unit.prototype.constructor = Unit;
Unit.prototype.updateAnimation = function(i) {
    this.direction = i;
    this.animation_frame = this.frameWidth * this.direction;
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/ogre-2.png"), this.animation_frame, 0, this.frameWidth, this.frameWidth, 0.10, 5, true, true);

}
Unit.prototype.updateKnight = function(i) {
    this.direction = i;
    this.animation_frame = this.frameWidth * this.direction;
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/knight-2.png"), this.animation_frame, 0, this.frameWidth, this.frameWidth, 0.10, 5, true, true);
    this.attackAnimation = new Animation(ASSET_MANAGER.getAsset("./img/knight-2.png"), this.animation_frame, 365, this.frameWidth, this.frameWidth, 0.10, 4, true, true);
    

}

Unit.prototype.collide = function (other) {
    if (this.it && distance(this, other) < 50){
        this.attacking = true;
        this.updateKnight(this.direction);
        other.removeFromWorld = true;
    }
    return distance(this, other) < this.radius + other.radius;
};

Unit.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Unit.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Unit.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Unit.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Unit.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        if (this.it){
            this.updateKnight(3-this.direction);
        }else{
            this.updateAnimation(3-this.direction);
        }
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        if (this.it){
            this.updateKnight(3-this.direction);
        }else{
            this.updateAnimation(3-this.direction);
        }
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && !(ent.it) && this.collide(ent)) {
            if (this.it) {
                ent.removeFromWorld = true;
                this.attacking.false;
            }
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;


            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Unit.prototype.draw = function (ctx) {
    if(this.attacking){
        this.attackAnimation.drawFrame(this.game.clockTick, ctx, this.x-37, this.y-37);
    }
    else{
        this.animation.drawFrame(this.game.clockTick, ctx, this.x-37, this.y-37);
    }
    

};



// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 100;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/knight-2.png");
ASSET_MANAGER.queueDownload("./img/ogre-2.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
    var unit = new Unit(gameEngine);
    unit.it = true;
    unit.color = 0;
    unit.visualRadius = 500;
    unit.updateKnight(2);
    gameEngine.addEntity(unit);
    for (var i = 0; i < 12; i++) {
        unit = new Unit(gameEngine);
        gameEngine.addEntity(unit);
    }
    gameEngine.init(ctx);
    gameEngine.start();
});
