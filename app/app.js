// Your program here
const Meyda = require("meyda");
const p5 = require("p5");
const StartAudioContext = require("startaudiocontext");
const dat = require('dat.gui');


function readAudioFromFile(callback) {
    const audioContext = new AudioContext();
    StartAudioContext(audioContext);
    const htmlAudioElement = document.getElementById("audio");
    const source = audioContext.createMediaElementSource(htmlAudioElement);
    source.connect(audioContext.destination);
    if (callback) callback(audioContext, source);
}

let lastFeatures = null;
const bufferSize = 512;
function setupAnalyzer(context, source) {
    // Set up Meyda
    const analyzer = Meyda.createMeydaAnalyzer({
        audioContext: context,
        source,
        bufferSize, // this must be a power of two
        featureExtractors: ["loudness","spectralSpread","spectralFlatness"],
        callback: (features) => {
            lastFeatures = features;
        }
    });
    analyzer.start();
}

let width = window.innerWidth - 10;
let height = window.outerHeight - 20;

const p5DrawWeather = (p) => {
    let fHistory, sHistory;

    p.setup = () => {
        p.createCanvas(height,height,p.P3D);
        p.textAlign(p.CENTER, p.CENTER);
        p.background(255);
    }

    p.draw = () => {

        p.colorMode(p.RGB, 255);
        p.background(255, 255, 255);

        if (lastFeatures && !Number.isNaN(lastFeatures.spectralFlatness)) {
            let Flat = lastFeatures.spectralFlatness * lastFeatures.loudness.total * 0.05;
            if (fHistory === undefined) fHistory = Flat;
            if (Flat > fHistory) {
                fHistory = Flat;
            } else {
                fHistory = Flat * (1.0 - 0.99) + fHistory * 0.99;
            }

            let Spread = lastFeatures.spectralSpread; 
            if (sHistory === undefined) sHistory = Spread;
            if (Spread > sHistory) {
                sHistory = Spread;
            } else {
                sHistory = Spread * (1.0 - 0.99) + sHistory * 0.5;
            }
            console.log(fHistory, sHistory);

            p.textSize(50);
            let t;
            for(let i = 1000; i >=50; i = i - 50){
                let theta = p.frameCount*0.05;
                let v = p.noise(i * 0.05, theta);
                if(sHistory > 42) {
                    t = p.map(sHistory, 42, 100, 10, 50);
                } else {
                    t = 255;
                }
                p.fill(0, t);
                p.textSize(fHistory * 350 * v);
                p.text("a weather report", i-p.frameCount%50, i-p.frameCount%50);
            }
        }
    }
}

const p5text = (p) => {
    p.setup = () => {
        p.createCanvas(500,500,p.P3D);
        p.textAlign(p.CENTER, p.CENTER);
        p.smooth();
    }

    p.draw = () => {
        p.background(255);
        p.textSize(50);
        p.fill(0,0,0);
        for(let i = 1000; i >=50; i = i - 50){
            let theta = p.frameCount*0.05;
            let v = p.noise(i * 0.05, theta);
            let t = p.map(v, 1, 0, 20, 80);
            p.textSize(t);
            p.text("testing", i-p.frameCount%50, i-p.frameCount%50);
    }
    }
}

readAudioFromFile(setupAnalyzer);

//let myp5 = new p5(p5text, "drawing");
let myp5 = new p5(p5DrawWeather, "drawing");
