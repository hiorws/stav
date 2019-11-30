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

// analyser
var analyser;

// speecher
var vocal = new p5.Speech();
var rap = "Yalnızlık kaplandı odam Anlatınca ben sana, \
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
    // KICK
    generateKick();

    // SYNTH MELODY
    generateSynthMelody();

    // BASS
    generateBass();

    // analyser
    createAnalyser();

}

function createAnalyser() {
    // analyser = new Tone.Analyser("waveform", 2048);

}

function generateKick() {
    playKick = false;
    kick = new Tone.MembraneSynth().toMaster();
    kickLoop = new Tone.Loop(function (time) {
        kick.triggerAttackRelease("C2", "8n");
    }, "8n").start(0);
}

function generateSynthMelody() {
    playSynthMelody = false;
    synthMelody = new Tone.PolySynth().toMaster();
    analyser = new Tone.Analyser("waveform", 2048);
    synthMelody.connect(analyser);

    synthPattern = new Tone.Pattern(function (time, note) {
        synthMelody.triggerAttackRelease(note, "4n");
    }, ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'], "updown");
    // ['E2', 'D4', 'C3', 'D3']
    synthPattern.loop = true;
    synthPattern.interval = "8n";
}

function generateBass() {
    playBass = false;
    bass = new Tone.MembraneSynth().toMaster();
    bassLoop = new Tone.Loop(function (time) {
        bass.triggerAttackRelease("C2", "8n");
    }, "8n").start(0);


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

    const dim = Math.min(width, height);

    // Black background
    background(0, 0, 0, 20);
    strokeWeight(dim * 0.0175);
    stroke(255);
    noFill();

    // Draw waveform if playing
    if (perform) {
        const values = analyser.getValue();
        const radius = dim * 0.3;

        beginShape();
        for (let i = 0; i < analyser.size; i++) {
            const t = i / analyser.size;

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


            if (textValue.includes("söyle")) {
                vocal.speak(rap);
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
}

function playSounds() {
    Tone.Transport.start();
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