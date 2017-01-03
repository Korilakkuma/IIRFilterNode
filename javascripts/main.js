(() => {

    document.addEventListener('DOMContentLoaded', () => {
        const context = new AudioContext();

        let filter    = null;
        let frequency = document.getElementById('range-frequency').valueAsNumber;
        let Q         = document.getElementById('range-quality-factor').valueAsNumber;
        let g         = document.getElementById('range-filter-gain').valueAsNumber;
        let buffer    = null;
        let source    = context.createBufferSource();;
        let gain      = context.createGain();

        const successCallback = audioBuffer => {
            buffer = audioBuffer;

            const playbackRate = source.playbackRate.value;

            source = context.createBufferSource();

            source.buffer = audioBuffer;
            source.playbackRate.value = playbackRate;

            filter = createLPFilter(frequency, Q, g);

            source.connect(filter).connect(gain).connect(context.destination);

            source.start(0);
        };

        const errorCallback = error => {
            console.error('decode error');
        };

        const createLPFilter = (fd, Q) => {
            const feedforwards = [];
            const feedbacks    = [];

            const fc = Math.tan((Math.PI * fd) / context.sampleRate) / (2 * Math.PI);

            const d = 1 + ((2 * Math.PI * fc) / Q) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2));

            feedforwards[0] = (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) / d;
            feedforwards[1] = (8 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) / d;
            feedforwards[2] = (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) / d;

            feedbacks[0] = 1;
            feedbacks[1] = ((8 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) - 2) / d;
            feedbacks[2] = (1 - ((2 * Math.PI * fc) / Q) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2))) / d;

            return context.createIIRFilter(feedforwards, feedbacks);
        };

        const createHPFilter = (fd, Q) => {
            const feedforwards = [];
            const feedbacks    = [];

            const fc = Math.tan((Math.PI * fd) / context.sampleRate) / (2 * Math.PI);

            const d = 1 + ((2 * Math.PI * fc) / Q) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2));

            feedforwards[0] = 1;
            feedforwards[1] = -2;
            feedforwards[2] = 1;

            feedbacks[0] = 1;
            feedbacks[1] = ((8 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) - 2) / d;
            feedbacks[2] = (1 - ((2 * Math.PI * fc) / Q) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2))) / d;

            return context.createIIRFilter(feedforwards, feedbacks);
        };

        const createBPFilter = (fd, Q) => {
            const feedforwards = [];
            const feedbacks    = [];

            const fc = Math.tan((Math.PI * fd) / context.sampleRate) / (2 * Math.PI);

            const d = 1 + ((2 * Math.PI * fc) / Q) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2));

            feedforwards[0] = (2 * Math.PI * fc) / Q;
            feedforwards[1] = 0;
            feedforwards[2] = -(2 * Math.PI * fc) / Q;

            feedbacks[0] = 1;
            feedbacks[1] = ((8 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) - 2) / d;
            feedbacks[2] = (1 - ((2 * Math.PI * fc) / Q) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2))) / d;

            return context.createIIRFilter(feedforwards, feedbacks);
        };

        const createNotchFilter = (fd, Q) => {
            const feedforwards = [];
            const feedbacks    = [];

            const fc = Math.tan((Math.PI * fd) / context.sampleRate) / (2 * Math.PI);

            const d = 1 + ((2 * Math.PI * fc) / Q) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2));

            feedforwards[0] = ((4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) + 1) / d;
            feedforwards[1] = ((8 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) - 2) / d;
            feedforwards[2] = ((4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) + 1) / d;

            feedbacks[0] = 1;
            feedbacks[1] = ((8 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) - 2) / d;
            feedbacks[2] = (1 - ((2 * Math.PI * fc) / Q) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2))) / d;

            return context.createIIRFilter(feedforwards, feedbacks);
        };

        const createLowShelvingFilter = (fd, Q, g) => {
            const feedforwards = [];
            const feedbacks    = [];

            const fc = Math.tan((Math.PI * fd) / context.sampleRate) / (2 * Math.PI);

            const d = 1 + ((2 * Math.PI * fc) / Q) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2));

            feedforwards[0] = (1 + (Math.sqrt(1 + g) * ((2 * Math.PI * fc) / Q)) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2) * (1 + g))) / d;
            feedforwards[1] = ((8 * Math.pow(Math.PI, 2) * Math.pow(fc, 2) * (1 + g)) - 2) / d;
            feedforwards[2] = (1 - (Math.sqrt(1 + g) * ((2 * Math.PI * fc) / Q)) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2) * (1 + g))) / d;

            feedbacks[0] = 1;
            feedbacks[1] = ((8 * Math.pow(Math.PI, 2) * Math.pow(fc, 2)) - 2) / d;
            feedbacks[2] = (1 - ((2 * Math.PI * fc) / Q) + (4 * Math.pow(Math.PI, 2) * Math.pow(fc, 2))) / d;

            return context.createIIRFilter(feedforwards, feedbacks);
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

        document.getElementById('range-frequency').addEventListener('input', event => {
            frequency = event.currentTarget.valueAsNumber;
            filter    = createLPFilter(frequency, Q, g);

            source.disconnect(0);
            source.connect(filter).connect(gain).connect(context.destination);

            document.getElementById('output-frequency').textContent = event.currentTarget.value;
        }, false);

        document.getElementById('range-quality-factor').addEventListener('input', event => {
            Q      = event.currentTarget.valueAsNumber;
            filter = createLPFilter(frequency, Q, g);

            source.disconnect(0);
            source.connect(filter).connect(gain).connect(context.destination);

            document.getElementById('output-quality-factor').textContent = event.currentTarget.value;
        }, false);

        document.getElementById('range-filter-gain').addEventListener('input', event => {
            g      = event.currentTarget.valueAsNumber;
            filter = createLPFilter(frequency, Q, g);

            source.disconnect(0);
            source.connect(filter).connect(gain).connect(context.destination);

            document.getElementById('output-filter-gain').textContent = event.currentTarget.value;
        }, false);

    }, true);
})();
