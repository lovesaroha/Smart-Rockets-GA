"use-strict";
/*  Love Saroha
    lovesaroha1994@gmail.com (email address)
    https://www.lovesaroha.com (website)
    https://github.com/lovesaroha  (github)
*/

// Choose theme at random.
const colors = ["#D64163", "#fa625f", "#4874E2"];
const colorsDark = ["#c13b59", "#e15856", "#4168cb"];
const selColor = Math.floor(Math.random() * colors.length);
document.documentElement.style.setProperty('--primary', colors[selColor]);
document.documentElement.style.setProperty('--primary-dark', colorsDark[selColor]);

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var lifeSpan = 400;
var totalPopulation = 10;
var target = { x: (canvas.width / 2), y: 40 };
var targetCenter = { x: canvas.width / 2, y: 42 };
var barriers = [];
var totalBarriers = 1;
var newTotalBarriers = 1;
var mutation = 0.01;
var newMutationRate = 0.01;

// Update dom elements.
document.getElementById("maxpop_id").value = totalPopulation;
document.getElementById("barriers_id").value = totalBarriers;
document.getElementById("mutation_rate_id").value = mutation;

// Start algorithm function.
function startAlgorithm() {
    count = 0;
    pop = new Population();
    mutation = newMutationRate;
    totalBarriers = newTotalBarriers;
    prepareBarriers();
    document.getElementById("result_id").className = ``;
    // Draw function
    draw();
}

// Show barriers function show barriers on canvas.   
function showBarriers() {
    for (let i = 0; i < totalBarriers; i++) {
        ctx.textAlign = 'center';
        ctx.font = '900 32px "Font Awesome 5 Pro"';
        ctx.fillText("\uf773", barriers[i].x, barriers[i].y);
    }
}

// Prepare barriers
function prepareBarriers() {
    for (let i = 0; i < totalBarriers; i++) {
        barriers[i] = loakuMath.createRandomVector(canvas.height - 300, 100);
    }
}

// Population class defined.
class Population {
    constructor() {
        this.members = [];
        this.generations = 0;
        this.totalFitness = 0;
        this.maxFitness = 1;
        for (let i = 0; i < totalPopulation; i++) {
            this.members[i] = new Rocket();
        }
    }

    // Evaluate function evaluate each member of population.
    evaluate() {
        this.totalFitness = 0;
        for (let i = 0; i < this.members.length; i++) {
            let d = loakuMath.euclideanDistance(targetCenter.x, targetCenter.y, this.members[i].position.x, this.members[i].position.y);
            if (d < 30) {
                this.members[i].completed = true;
            }
            if (this.members[i].position.x < 0 || this.members[i].position.x > canvas.width || this.members[i].position.y < 0 || this.members[i].position.y > canvas.height) {
                this.members[i].crashed = true;
            }
            for (let j = 0; j < totalBarriers; j++) {
                if (this.members[i].position.x > (barriers[j].x - 16) && this.members[i].position.x < (barriers[j].x + 16) && this.members[i].position.y < barriers[j].y && this.members[i].position.y > (barriers[j].y - 32)) {
                    this.members[i].crashed = true;
                }
            }
            this.members[i].calculateFitness();
            this.totalFitness = this.totalFitness + this.members[i].fitnessScore;
            this.members[i].run();
            this.members[i].show();
        }
    }

    // Calculate fitness of each member.
    calculateFitness() {
        this.totalFitness = 0;
        for (let i = 0; i < this.members.length; i++) {
            this.members[i].calculateFitness();
            this.totalFitness = this.totalFitness + this.members[i].fitnessScore;
        }
    }

    // Population reproduction or generate new members.
    reproduce() {
        let newPopulation = [];
        for (let i = 0; i < this.members.length; i++) {
            let partnerA = pickOne(this.members, this.totalFitness);
            let partnerB = pickOne(this.members, this.totalFitness);
            let child = partnerA.crossOver(partnerB);
            child.mutate();
            newPopulation[i] = child;
        }
        this.members = newPopulation.slice();
        this.generations++;
    }
}


// Pick one froem given list based on probablity.
function pickOne(list, totalFitness) {
    let index = 0;
    let r = Math.random();
    while (r > 0) {
        if (list[index].pickChance == -1) {
            list[index].pickChance = list[index].fitnessScore / totalFitness;
        }
        if(list[index].completed) {
            return list[index];
        }
        r = r - list[index].pickChance;
        index++;
        if (index >= list.length) {
            break;
        }
    }
    index--;
    if (index >= list.length) {
        return list[Math.floor(Math.random() * list.length)];
    }
    return list[index];
}

// Rocket object defined.
function Rocket() {
    this.position = { x: (canvas.width / 2), y: (canvas.height - 60) };
    this.velocity = { x: 0, y: 0 };
    this.genes = [];
    for (let i = 0; i < lifeSpan; i++) {
        this.genes[i] = randomVector(0.2);
    }
    this.acceleration = { x: 0, y: 0 };
    this.angleDeg = (Math.atan2(0 - this.velocity.y, 0 - this.velocity.x) * 180 / Math.PI) - 180;
    this.fitnessScore = 0;
    this.pickChance = 0;
    this.completed = false;
    this.crashed = false;
}

// Rocket fitness.
Rocket.prototype.calculateFitness = function () {
    let d = loakuMath.euclideanDistance(targetCenter.x, targetCenter.y, this.position.x, this.position.y);
    this.fitnessScore = 1 / d;
    if (this.crashed == false) {
        this.fitnessScore = this.fitnessScore * 4;
    }
    if (this.completed == true) {
        this.fitnessScore = 100000;
    }
}

// Rocket crossover.
Rocket.prototype.crossOver = function (partner) {
    let rand = Math.random();
    let child = new Rocket();
    for (let i = 0; i < lifeSpan; i++) {
        if (this.pickChance > rand) {
            child.genes[i] = this.genes[i];
        } else {
            child.genes[i] = partner.genes[i];
        }
    }
    return child;
}

// Rocket mutate function.
Rocket.prototype.mutate = function () {
    let mr = 1 - mutation;
    for (let i = 0; i < lifeSpan; i++) {
        if (Math.random() > mr) {
            this.genes[i] = randomVector(0.2);
        }
    }
}

// Rocket show function.
Rocket.prototype.show = function () {
    ctx.save();
    ctx.translate(this.position.x, this.position.y - 10);
    ctx.rotate(this.angleDeg * Math.PI / 180);
    ctx.translate(-(this.position.x), -(this.position.y - 10));
    ctx.textAlign = 'center';
    ctx.font = '400 20px "Font Awesome 5 Pro"';
    ctx.fillText("\uf197", this.position.x, this.position.y);
    ctx.restore();
}

// Rocket run function move rockets.
Rocket.prototype.run = function () {
    if (this.completed == false && this.crashed == false) {
        this.acceleration = { x: (this.acceleration.x + this.genes[count].x), y: (this.acceleration.y + this.genes[count].y) };
        this.velocity = { x: (this.velocity.x + this.acceleration.x), y: (this.velocity.y + this.acceleration.y) };
        this.position = { x: (this.position.x + this.velocity.x), y: (this.position.y + this.velocity.y) };
        this.acceleration = { x: 0, y: 0 };
        this.angleDeg = (Math.atan2(0 - this.velocity.y, 0 - this.velocity.x) * 180 / Math.PI) - 180;
    }
}

let count = 0;
let pop = new Population();

// Show targets function.
function showTargets() {
    ctx.font = '400 40px "Font Awesome 5 Pro"';
    ctx.fillStyle = colors[selColor];
    ctx.textAlign = 'center';
    ctx.fillText("\uf111", target.x, target.y);
    ctx.font = '400 40px "Font Awesome 5 Pro"';
    ctx.textAlign = 'center';
    ctx.fillText("\uf111", (canvas.width / 2), canvas.height - 40);
}

showTargets();

function draw() {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
    document.getElementById("count_id").innerHTML = count;
    document.getElementById("generation_id").innerHTML = pop.generations;
    showTargets();
    showBarriers();

    // Evaluate population.
    pop.evaluate();

    count++;

    if (count > lifeSpan - 1) {
        // Reproduce population.
        pop.reproduce();
        count = 0;
    }
    window.requestAnimationFrame(draw);
}
window.pop = pop;


// Random vector.
function randomVector(scale) {
    let dirx = (Math.floor((Math.random() * 10) + 1) > 5) ? 1 : -1;
    let diry = (Math.floor((Math.random() * 10) + 1) > 5) ? 1 : -1;
    return { x: (Math.random() * scale) * dirx, y: diry * (Math.random() * scale) };
}
