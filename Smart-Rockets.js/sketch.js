var lifespan = 200;
var population;
var rocket;
var count = 0;
var lifeP;
var gen = 0;
var genP;

var rx = 50;
var ry = 80;
var rw = 350;
var rh = 20;

function setup() {
  createCanvas(500, 500);
  population = new Population();
  target = createVector(width/2, 40);
  lifeP = createP();
  genP = createP();
}

function draw() {
  background(0);
  population.run();
  if (this.count == lifespan) {
    population.evaluate();
    population.selection();
    count = 0;
    // console.log("GENERATION")
    gen++
  }
  count++;
  genP.html("Generation : "+gen);
  lifeP.html("Lifespan : "+count);

  ellipse(target.x,target.y,10,10)
  rect(rx,ry,rw,rh);
}

function DNA(genes){
  if (genes) {
    this.genes = genes;
  }else {
    this.genes = [];
    for (var i = 0; i < lifespan; i++) {
      this.genes[i] = p5.Vector.random2D();
      // this.genes[i].setMag(0.1);
    }
  }

  this.crossOver = function(partner){
    var newgenes = [];
    var mid = floor(random(this.genes.length))
    for (var i = 0; i < this.genes.length; i++) {
      if (i < mid) {
        newgenes[i] = this.genes[i]
      }else{
        newgenes[i] = partner.genes[i];
      }
    }
    return new DNA(newgenes);
  }

  this.mutate = function(){
    r = random(1);
    for (var i = 0; i < this.genes.length; i++) {
      if (r < 0.5) {
        this.genes[i] = p5.Vector.random2D();
        // this.genes[i].setMag(0.1);
      }
    }
  }
}


function Population(){
  this.popsize = 150;
  this.rockets = [];
  this.sum = 0;

  for (var i = 0; i < this.popsize; i++) {
    this.rockets[i] = new Rocket();
  }

  this.evaluate = function(){
    this.maxfit = 0;
    this.sum = 0;
    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].calcFitness();
      if (this.rockets[i].fitness > this.maxfit) {
        this.maxfit = this.rockets[i].fitness;
      }
    }

    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].fitness /= this.maxfit;
      this.rockets[i].prob = 0;
    }

    for (var i = 0; i < this.rockets.length; i++) {
      this.sum += this.rockets[i].fitness;
    }

    for (var i = 0; i < this.rockets.length; i++) {
      this.rockets[i].prob = this.rockets[i].fitness / this.sum;
      console.log(this.rockets[i].prob)
    }
  }


  this.selection = function(){
    var newRockets = []
    for (var i = 0; i < this.rockets.length; i++) {
      var parentA = this.pickParent();
      var parentB = this.pickParent();
      var child = parentA.crossOver(parentB);
      child.mutate();
      newRockets[i] = new Rocket(child);
    }
    this.rockets = newRockets;
  }

  this.pickParent = function(){
    var index = 0;
    r = random(1);
    while(r > 0 && index <= this.rockets.length - 1){
      r = r - this.rockets[index].prob;
      index++;
    }
    index--;

    return this.rockets[index].dna;
  }

  this.run = function(){
    for (var i = 0; i < this.rockets.length; i++) {
      this.rockets[i].update();
      this.rockets[i].show();
    }
  }
}

function Rocket(dna){
  this.crashed = false;
  this.crashedByObstacle = false;
  this.completed = false;
  this.prob = 0;
  this.pos = createVector(width/2, height);
  this.vel = createVector();
  this.acc = createVector();
  if (dna) {
    this.dna = dna;
  }else {
    this.dna = new DNA();
  }
  this.count = 0;
  this.fitness = 0

  this.applyForce = function(force){
    this.acc.add(force)
  }

  this.update = function(){
    if (this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0) {
      this.crashed = true;
    }

    if (this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh) {
      this.crashedByObstacle = true;
    }

    this.d = dist(this.pos.x, this.pos.y, target.x, target.y);

    if (this.d < 10) {
      this.completed = true;
      this.pos.x = target.x;
      this.pos.y = target.y;
    }

    if (!this.crashed && !this.completed && !this.crashedByObstacle) {
      this.applyForce(this.dna.genes[count])

      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0)
    }
  }

  this.show = function(){
    push();
    noStroke();
    fill(255, 100);
    translate(this.pos.x, this.pos.y)
    rotate(this.vel.heading())
    rectMode(CENTER);
    rect(0,0, 20, 5);
    pop();
  }

  this.calcFitness = function(){
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    this.fitness = map(d, 0, width, width, 0);
    if (this.crashed == true) {
      this.fitness /= 10;
    }

    if (this.crashedByObstacle == true) {
      this.fitness /= 20;
    }

    if (this.completed == true) {
      this.fitness *= 10;
    }

    if (this.pos.y > ry) {
      this.fitness /= 2;
    }

    if (this.pos.y < ry) {
      this.fitness *= 2;
    }

    this.fitness = this.fitness / (lifespan / 20);
  }
}
