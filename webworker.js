// gameWorker.js
let interval;

self.onmessage = function(e) {
    if (e.data.command === 'start') {
        const fps = e.data.fps || 60; // Default to 60 frames per second
        interval = setInterval(() => {
            // Post message back to main thread
            self.postMessage({ status: 'tick' });
        }, 1000 / fps);
    } else if (e.data.command === 'stop') {
        clearInterval(interval);
    }
};
