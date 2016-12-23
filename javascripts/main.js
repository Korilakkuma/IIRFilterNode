(() => {

    document.addEventListener('DOMContentLoaded', () => {
        const context = new AudioContext();

        const Q = 1 / Math.sqrt(2);

        let filter    = null
        let frequency = document.getElementById('range-cutoff-frequency').valueAsNumber;
        let buffer    = null;
        let source    = context.createBufferSource();;
        let gain      = context.createGain();

        const successCallback = audioBuffer => {
            buffer = audioBuffer;

            const playbackRate = source.playbackRate.value;

            source = context.createBufferSource();

            source.buffer = audioBuffer;
            source.playbackRate.value = playbackRate;

            filter = createLPFilter(frequency, Q);

            source.connect(filter).connect(gain).connect(context.destination);

            source.start(0);
        };

        const errorCallback = error => {
            console.error('decode error');
        };

        const createLPFilter = (fd, Q) => {
            const denominators = [];
            const numerators   = [];

            const fc = Math.tan((Math.PI * fd) / context.sampleRate) / (2.0 * Math.PI);

            const d = 1.0 + ((2.0 * Math.PI * fc) / Q) + (4.0 * Math.pow(Math.PI, 2) * Math.pow(fc, 2));

            denominators[0] = 1.0;
            denominators[1] = ((8.0 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) - 2.0) / d;
            denominators[2] = (1.0 - ((2.0 * Math.PI * fc) / Q) + (4.0 * Math.pow(Math.PI, 2) * Math.pow(fc, 2))) / d;

            numerators[0] = (4.0 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) / d;
            numerators[1] = (8.0 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) / d;
            numerators[2] = (4.0 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) / d;

            return context.createIIRFilter(numerators, denominators);
        };

        document.querySelector('[type="file"]').addEventListener('change', event => {
            const file = event.target.files[0];

            if (!(file instanceof File)) {
                alert('Please Upload File');
            } else if (file.type.indexOf('audio') === -1) {
                alert('Please Upload Audio File');
            } else {
                const reader = new FileReader();

                reader.onload = () => {
                    context.decodeAudioData(reader.result, successCallback, errorCallback);
                };

                reader.readAsArrayBuffer(file);
            }
        }, false);

        document.getElementById('range-gain').addEventListener('input', event => {
            gain.gain.value = event.currentTarget.valueAsNumber;
            document.getElementById('output-gain').textContent = event.currentTarget.value;
        }, false);

        document.getElementById('range-playback-rate').addEventListener('input', event => {
            source.playbackRate.value = event.currentTarget.valueAsNumber;
            document.getElementById('output-playback-rate').textContent = event.currentTarget.value;
        }, false);

        document.getElementById('range-cutoff-frequency').addEventListener('input', event => {
            frequency = event.currentTarget.valueAsNumber;
            filter    = createLPFilter(frequency, Q);

            source.disconnect(0);
            source.connect(filter).connect(gain).connect(context.destination);

            document.getElementById('output-cutoff-frequency').textContent = event.currentTarget.value;
        }, false);

    }, true);
})();
