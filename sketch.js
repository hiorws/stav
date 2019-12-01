let bgColor = 0;

// KICK
var playKick;
var kick;
var kickLoop;


// SYNTH MELODY
var playSynthMelody;
var synthMelody;
var synthPattern;

// BASS
var playBass;
var bass;
var bassLoop;

// PIANO
var playPiano;
var piano;
var pianoLoop;

// analyser
var analyserKick;

var analyserSynthMelody;
let amplitudesSynthMelody;

var anaylserBass;
var amplitudesBass;

// speecher
var vocal = new p5.Speech();
var lyrics = "Yalnızlık kaplandı odam Anlatınca ben sana, \
        bakmazdın Olan umutlarım yok olunca yaşlardı \
        dolan İşte bende ağlamaya başlardım o an \
        İstediğim benim senin benim kadar ağlamaman \
        Senin gibi gülmesemde bi gün kahkahalar attığımı \
        Görürsen şayet o gün aşka tama etmediğim gündür \
        ve başka sana \
        Yalnızlıkların ardında yine sen varsın her zaman yanımda \
        Yok olmadı olmaz bu hatıralar yine sahipsiz günlerde kalınca..";

// speech recognizer
let speechRec;

let lastCommand = "";

let perform = false;

let bpm = 120;

let arpeggios = ["up", "down", "upDown", "downUp", "random", "alternateUp", "alternateDown", "randomWalk", "randomOnce"];

var NATURAL_MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10, 12];
var HARMONIC_MINOR_SCALE = [0, 2, 3, 5, 7, 8, 11, 12];
var MELODIC_MINOR_SCALE = [0, 2, 3, 5, 7, 9, 11, 12];

var ALPHA_NAMES = ['A','B','C','D','E','F','G'];

let arpej = [
    ["C2", "D#2", "G2", "C3", "G2", "D#2"],
    ["B1", "D2", "G2", "B2", "G2", "D2"],
    ["A#1", "D2", "F2", "A#2", "F2", "D2"],
    ["A1", "C2", "F2", "A2", "F2", "C2"],
    ["G#1", "C2", "D#2", "G#2", "D#2", "C2"],
    ["G1", "C2", "D#2", "G2", "D#2", "C2"],
    ["F#1", "C2", "D#2", "F#2", "D#2", "C2"],
    ["G1", "C2", "D2", "G2", "D2", "B1"]
  ];

function getScaleFormula() {
    let minorType = Math.floor(Math.random() * 3);
    if (minorType == 0) {
        return NATURAL_MINOR_SCALE;
    } else if (minorType == 1) {
        return HARMONIC_MINOR_SCALE;
    } else if (minorType == 2) {
        return MELODIC_MINOR_SCALE;
    } else {
        return NATURAL_MINOR_SCALE;
    }
}

function unlockAudioContext(audioCtx) {
    if (audioCtx.state === 'suspended') {
        var events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
        var unlock = function unlock() {
            events.forEach(function (event) {
                document.body.removeEventListener(event, unlock)
            });
            audioCtx.resume();
        };

        events.forEach(function (event) {
            document.body.addEventListener(event, unlock, false)
        });
    }
}

function preload() {
    unlockAudioContext(Tone.context);
}

function prepare() {

    let rootNoteValue = ALPHA_NAMES[Math.floor(Math.random() * ALPHA_NAMES.length)];
    let rootNoteOctave = 1 + Math.floor(Math.random() * 5);
    let rootNote = rootNoteValue + rootNoteOctave;

    // KICK
    let kickRootNote = rootNote;
    generateKick(kickRootNote, "8n");

    // SYNTH MELODY
    let pat = ['C3', 'E3', 'F3', 'G3'];
    generateSynthMelody(pat);

    // BASS
    let bassRootNote = rootNote;
    generateBass(bassRootNote, "4n");

    // PIANO
    let pianoRootNote = rootNote;
    let pianoTime = "4n";
    generatePiano(pianoRootNote, pianoTime);

}

function generateKick(note, time) {
    playKick = false;
    kick = new Tone.MembraneSynth().toMaster();
    kickLoop = new Tone.Loop(function (time) {
        kick.triggerAttackRelease(note, "8n");
    }, time).start(0);
    kickLoop.loop = true;
    let interVal = 1 + Math.floor(Math.random() * 10);
    kickLoop.interval = 2 * interVal + "n";

    // send to analysis
    analyserKick = new Tone.Analyser("waveform", 2048);
    kick.connect(analyserKick);
}

function generateSynthMelody(notesArray) {
    playSynthMelody = false;
    synthMelody = new Tone.PolySynth().toMaster();

    synthPattern = new Tone.Pattern(function (time, note) {
        synthMelody.triggerAttackRelease(note, "4n");
    }, notesArray, "updown");

    synthPattern.loop = true;
    let interVal = 1 + Math.floor(Math.random() * 10);
    synthPattern.interval = 2 * interVal + "n";

    // send to analysis
    analyserSynthMelody = new Tone.Analyser("fft", 1024);
    amplitudesSynthMelody = new Array(analyserSynthMelody.size).fill(0);
    synthMelody.connect(analyserSynthMelody);
}

function generateBass(note, time) {
    playBass = false;
    bass = new Tone.PolySynth().toMaster();
    bassLoop = new Tone.Loop(function (time) {
        bass.triggerAttackRelease(note, "8n");
    }, time).start(0);

    bassLoop.loop = true;
    let interVal = 1 + Math.floor(Math.random() * 10);
    bassLoop.interval = 2 * interVal + "n";

    // send to analysis
    anaylserBass = new Tone.Analyser("fft", 1024);
    amplitudesBass = new Array(anaylserBass.size).fill(0);
    bass.connect(anaylserBass);

}

function generatePiano(note, time){
    playPiano = false;
    piano = new Tone.PolySynth().toMaster();

    var keyName = "C";
    var scaleFormula = getScaleFormula();
    // TODO: choose according to key
    // var myScale = makeScale(scaleFormula, keyName);
    var myScale = arpej[Math.floor(Math.random()*arpej.length)];
    let randomPatternType = Math.floor(Math.random() * 10);

    pianoLoop = new Tone.Pattern(function(time, note){
        piano.triggerAttackRelease(note, '4n', time);
    }, myScale, arpeggios[randomPatternType]);

    pianoLoop.loop = true;
    let interVal = 1 + Math.floor(Math.random() * 10);
    pianoLoop.interval = 2 * interVal + "n";
 }

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    background(bgColor);

    // sketch configurations
    textAlign(CENTER, CENTER);

    // start transport
    let lang = 'tr';
    speechRec = new p5.SpeechRec(lang, gotSpeech);

    let continuous = true;
    // let interim = true;
    let interim = false;
    speechRec.start(continuous, interim);
    console.log("[+] Speech recognition started.");

    vocal.setLang('tr');
    vocal.setVoice("Cem");
    vocal.setRate(1.2);
}

function draw() {
    background(bgColor);
    if (perform) {
        playSounds();
    }

    noStroke();
    fill(255);
    textSize(32);
    text(lastCommand, width / 2, height / 2);

    drawVisuals();

    // if (getAudioContext().state !== 'running') {
    //     text('click to start audio', width / 2, height / 2 + 50);
    // } else {
    //     text('audio is enabled', width / 2, height / 2 + 50);
    // }

    // if (Tone.context.state !== 'running') {
    //     text('click to start audio', width / 2, height / 2 + 100);
    // } else {
    //     text('audio is enabled', width / 2, height / 2 + 100);
    // }

}

function drawVisuals() {
    if (perform) {

        if (playKick) {
            drawWaveForm();
        }

        if (playSynthMelody) {
            drawFFTBasic();
        }

        if (playBass) {
            drawFFT();
        }


    }

}

function drawFFT() {
    const dim = Math.min(width, height);

    // Black background
    // background(0);

    strokeWeight(dim * 0.0175);
    stroke(255);
    noFill();


    const valuesBass = anaylserBass.getValue();
    const dt = deltaTime / 1000;
    const power = 250;
    for (let i = 0; i < amplitudesBass.length; i++) {
        // Previous value
        const a = amplitudesBass[i];

        // Here we take the decibels and map it to some 0..1 value
        const minDb = -150;
        const maxDb = -10;
        const db = max(minDb, min(maxDb, valuesBass[i]));

        // New target (i.e. from audio)
        const b = inverseLerp(minDb, maxDb, db);

        // Spring toward
        amplitudesBass[i] = spring(a, b, power, dt);
    }

    // Draw FFT values
    stroke(255);
    strokeWeight(dim * 0.0175);
    noFill();
    const maxRadius = dim * 0.3;
    const minRadius = dim * 0.175;
    const bands = 10;
    const L = amplitudesBass.length;
    for (let i = 0; i < bands; i++) {
        const tStart = i / bands;
        const tEnd = tStart + (1 / bands);
        const bandStart = min(L, floor(tStart * L));
        const bandEnd = min(L, floor(tEnd * L));
        const avg = average(amplitudesBass, bandStart, bandEnd);

        const r = minRadius + maxRadius * tStart;

        // Min and max line thickness
        const maxThickness = maxRadius / bands * 1;
        const minThickness = maxRadius / bands * 0.1;
        const signal = max(0, min(1, avg));
        const thickness = lerp(minThickness, maxThickness, signal);

        strokeWeight(thickness);
        stroke(255);
        // draw an arc
        const d = r * 2; // diameter
        arc(width / 2, height / 2, d, d, 0, PI * 2);
    }

}

function average(list, startIndex, endIndex) {
    let sum = 0;
    const count = endIndex - startIndex;
    if (count <= 0) return 0;
    for (let i = startIndex; i < endIndex; i++) {
        sum += list[i];
    }
    return sum / count;
}

// Inverse of lerp()
// t = inverseLerp(min, max, current)
function inverseLerp(min, max, current) {
    if (Math.abs(min - max) < 1e-10) return 0;
    else return (current - min) / (max - min);
}

// Springs A toward B with a power, accepting deltaTime
function spring(a, b, power, dt) {
    return lerp(a, b, 1 - Math.exp(-power * dt));
}

function drawWaveForm() {
    const dim = Math.min(width, height);

    // Black background
    background(0, 0, 0, 20);
    strokeWeight(dim * 0.0175);
    stroke(255);
    noFill();

    // Draw waveform if playing
    if (perform) {
        const values = analyserKick.getValue();
        const radius = dim * 0.3;

        beginShape();
        for (let i = 0; i < analyserKick.size; i++) {
            const t = i / analyserKick.size;

            const angle = t * PI * 2;
            const amplitude = values[i];

            const r = radius + radius * 0.5 * amplitude;

            // Center the waveform
            const cx = width / 2;
            const cy = height / 2;

            // Draw points around a circle
            const x = cx + cos(angle) * r;
            const y = cy + sin(angle) * r;

            // Place vertex
            vertex(x, y);
        }
        endShape(CLOSE);
    }
}

function drawFFTBasic() {
    strokeWeight(2);
    const spectrum = analyserSynthMelody.getValue();
    noStroke();
    push();
    translate(width / 2, height / 2);
    for (var i = 0; i < spectrum.length; i++) {
        var angle = map(i, 0, spectrum.length, 0, 360);
        var amp = spectrum[i];
        var r = map(amp, 0, 256, 50, 120);
        //fill(i, 255, 255);
        var x = r * cos(angle);
        var y = r * sin(angle);
        stroke(i, 255, 255);
        line(0, 0, x * 10, y * 10);
    }
    pop();
}

function gotSpeech() {
    if (perform) {
        // Tone.Transport.start();
        console.log("[+] Got speech.");
        let textValue = speechRec.resultString;
        if (textValue) {
            console.log(textValue);
            if (textValue.includes("davul")) {
                if (playKick) {
                    playKick = false;
                } else {
                    playKick = true;
                }

            }

            if (textValue.includes("melodi")) {
                if (playSynthMelody) {
                    playSynthMelody = false;
                } else {
                    playSynthMelody = true;
                }
            }

            if (textValue.includes("bas")) {
                if (playBass) {
                    playBass = false;
                } else {
                    playBass = true;
                }
            }

            if (textValue.includes("ritim arttır")) {
                increaseBPM();
            }

            if (textValue.includes("ritim düşür")) {
                deccreaseBPM();
            }

            if (textValue.includes("söyle")) {
                vocal.speak(lyrics);
            }


            lastCommand = textValue;

            // createP(speechRec.resultString);

        }

    }
}


function keyPressed() {
    console.log("[+] Key pressed.")

    // kick
    if (key == 'k') {
        if (playKick) {
            playKick = false;
        } else {
            playKick = true;
        }
    }

    // synth
    if (key == 's') {
        if (playSynthMelody) {
            playSynthMelody = false;
        } else {
            playSynthMelody = true;
        }
    }

    // bass
    if (key == 'b') {
        if (playBass) {
            playBass = false;
        } else {
            playBass = true;
        }
    }

    if(key == 'p') {
        if (playPiano) {
            playPiano = false;
        } else {
            playPiano = true;
        }
    }

    if(key == 'p') {
        prepare();
    }
}

function playSounds() {
    Tone.Transport.start();
    bpm = Tone.Transport.bpm.value;

    if (playKick) {
        kickLoop.start(0);
    } else {
        kickLoop.stop();
    }

    if (playSynthMelody) {
        synthPattern.start(0);
    } else {
        synthPattern.stop();
    }

    if (playBass) {
        bassLoop.start(0);
    } else {
        bassLoop.stop();
    }

    if (playPiano) {
        pianoLoop.start(0);
    } else {
        pianoLoop.stop();
    }
}



function touchStarted() {
    console.log("[+] Screen touched.");
    // Tone.context.resume();

    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }

    if (Tone.context.state !== 'running') {
        Tone.context.resume();
    }


    if (!perform) {
        prepare();
        perform = true;
    }

}

function mousePressed() {
    console.log("[+] Mouse pressed.")
    if (!perform) {
        prepare();
        perform = true;
    }
}



function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function increaseBPM() {
    Tone.Transport.bpm.value += 5;
}

function deccreaseBPM() {
    Tone.Transport.bpm.value -= 5;
}