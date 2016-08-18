$(document).ready(function() {

	Crafty.init();
	Crafty.canvas();
	

	Crafty.load(["images/sprite.png", "images/bg.png"], function() {

		Crafty.sprite(64, "images/sprite.png", {
			ship: [0,0],
			big: [1,0],
			medium: [2,0],
			small: [3,0]
		});
		
		//Inicia a cena
		Crafty.scene("main");
	});
	
	Crafty.scene("main", function() {
		Crafty.background("url('images/bg.png')");
		
		//Pontuação na tela
		var score = Crafty.e("2D, DOM, Text")
			.text("Sylvester's Brick - Score: 0")
			.attr({x: Crafty.viewport.width - 300, y: Crafty.viewport.height - 50, w: 200, h:50})
			.css({color: "#fff"});
			
		//Player
		var player = Crafty.e("2D, Canvas, ship, Controls, Collision")
			.attr({move: {left: false, right: false, up: false, down: false}, xspeed: 0, yspeed: 0, decay: 0.9, 
				x: Crafty.viewport.width / 2, y: Crafty.viewport.height / 2, score: 0})
			.origin("center")
			.bind("keydown", function(e) {
			
				if(e.keyCode === Crafty.keys.RIGHT_ARROW) {
					this.move.right = true;
				} else if(e.keyCode === Crafty.keys.LEFT_ARROW) {
					this.move.left = true;
				} else if(e.keyCode === Crafty.keys.UP_ARROW) {
					this.move.up = true;
				} else if(e.keyCode === Crafty.keys.SPACE) {
					//Cria a bala
					Crafty.e("2D, DOM, background-image, bullet")
						.attr({
							x: this._x, 
							y: this._y, 
							w: 100, 
							h: 50, 
							rotation: this._rotation, 
							xspeed: 10 * Math.sin(this._rotation / 57.3), 
							yspeed: 10 * Math.cos(this._rotation / 57.3)
						})
						.css("background-image", "url(images/weaponori.png)")
						.bind("enterframe", function() {	
							this.x += this.xspeed;
							this.y -= this.yspeed;
							
							
							if(this._x > Crafty.viewport.width || this._x < 0 || this._y > Crafty.viewport.height || this._y < 0) {
								this.destroy();
							}
						});
				}
			}).bind("keyup", function(e) {
			
				if(e.keyCode === Crafty.keys.RIGHT_ARROW) {
					this.move.right = false;
				} else if(e.keyCode === Crafty.keys.LEFT_ARROW) {
					this.move.left = false;
				} else if(e.keyCode === Crafty.keys.UP_ARROW) {
					this.move.up = false;
				}
			}).bind("enterframe", function() {
				if(this.move.right) this.rotation += 5;
				if(this.move.left) this.rotation -= 5;
				
				//Aceleração e movimento do vetor
				var vx = Math.sin(this._rotation * Math.PI / 180) * 0.3,
					vy = Math.cos(this._rotation * Math.PI / 180) * 0.3;
				
		
				if(this.move.up) {
					this.yspeed -= vy;
					this.xspeed += vx;
				} else {
					
					this.xspeed *= this.decay;
					this.yspeed *= this.decay;
				}
				
			
				this.x += this.xspeed;
				this.y += this.yspeed;
				
				
				if(this._x > Crafty.viewport.width) {
					this.x = -64;
				}
				if(this._x < -64) {
					this.x =  Crafty.viewport.width;
				}
				if(this._y > Crafty.viewport.height) {
					this.y = -64;
				}
				if(this._y < -64) {
					this.y = Crafty.viewport.height;
				}
				
			
				if(asteroidCount <= 0) {
					initRocks(lastCount, lastCount * 2);
				}
			}).collision()
			.onHit("asteroid", function() {
				
				Crafty.scene("main");
			});
		
		
		var asteroidCount,
			lastCount;
		
		//Asteroide componente
		Crafty.c("asteroid", {
			init: function() {
				this.origin("center");
				this.attr({
					x: Crafty.randRange(0, Crafty.viewport.width), //posição, rotação e velocidade
					x: Crafty.randRange(0, Crafty.viewport.height),
					xspeed: Crafty.randRange(1, 5), 
					yspeed: Crafty.randRange(1, 5), 
					rspeed: Crafty.randRange(-5, 5)
				}).bind("enterframe", function() {
					this.x += this.xspeed;
					this.y += this.yspeed;
					this.rotation += this.rspeed;
					
					if(this._x > Crafty.viewport.width) {
						this.x = -64;
					}
					if(this._x < -64) {
						this.x =  Crafty.viewport.width;
					}
					if(this._y > Crafty.viewport.height) {
						this.y = -64;
					}
					if(this._y < -64) {
						this.y = Crafty.viewport.height;
					}
				}).collision()
				.onHit("bullet", function(e) {
					
					player.score += 5;
					score.text("Sylvester's Brick - Score: "+player.score);
					e[0].obj.destroy(); 					
					var size;
			
					if(this.has("big")) {
						this.removeComponent("big").addComponent("medium");
						size = "medium";
					} else if(this.has("medium")) {
						this.removeComponent("medium").addComponent("small");
						size = "small";
					} else if(this.has("small")) { 
						asteroidCount--;
						this.destroy();
						return;
					}
					
					var oldxspeed = this.xspeed;
					this.xspeed = -this.yspeed;
					this.yspeed = oldxspeed;
					
					asteroidCount++;
					
					Crafty.e("2D, DOM, "+size+", Collision, asteroid").attr({x: this._x, y: this._y});
				});
				
			}
		});
		
		
		function initRocks(lower, upper) {
			var rocks = Crafty.randRange(lower, upper);
			asteroidCount = rocks;
			lastCount = rocks;
			
			for(var i = 0; i < rocks; i++) {
				Crafty.e("2D, DOM, big, Collision, asteroid");
			}
		}
		
		initRocks(1, 10);
	});
	
});