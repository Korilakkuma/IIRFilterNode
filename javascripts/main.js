(() => {

    document.addEventListener('DOMContentLoaded', () => {
        const context = new AudioContext();

        let buffer    = null;
        let source    = context.createBufferSource();;
        let iirFilter = null;
        let gain      = context.createGain();

        const successCallback = audioBuffer => {
            buffer = audioBuffer;

            const playbackRate = source.playbackRate.value;

            source = context.createBufferSource();

            source.buffer = audioBuffer;
            source.playbackRate.value = playbackRate;

            source.connect(gain).connect(context.destination);

            source.start(0);
        };

        const errorCallback = error => {
            console.error('decode error');
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

    }, true);
})();
