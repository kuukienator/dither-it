import { dither, DEFAULT_COLORS } from './dithering.js';
import { hexToRgb } from './colors.js';

let currentMethod = 0;
let currentImage = null;
let currentFile = null;
let colors = { ...DEFAULT_COLORS };

const readImageFile = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result), false);
        reader.addEventListener(
            'error',
            () => {
                reject(reader.error);
                reader.abort();
            },
            false
        );

        reader.readAsDataURL(file);
    });

const loadImage = (data) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.src = data;
        image.onload = () => resolve(image);
    });

const ditherImageFromFile =
    (canvas) => async (file, method, colors, dropZoneController) => {
        const imageData = await readImageFile(file);
        const image = await loadImage(imageData);

        currentImage = image;

        dither(canvas, image, method, colors);
        dropZoneController.toggleLoaded();
    };

const ditherImage =
    (canvas) => async (image, method, colors, dropZoneController) => {
        dither(canvas, image, method, colors);
        dropZoneController.toggleLoaded();
    };

const dropHandler = (dropZoneController, canvasElement) => (ev) => {
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === 'file') {
                let file = ev.dataTransfer.items[i].getAsFile();
                currentFile = file;
                dropZoneController.toggleLoading();
                ditherImageFromFile(canvasElement)(
                    file,
                    currentMethod,
                    colors,
                    dropZoneController
                );
            }
        }
    } else {
        for (let i = 0; i < ev.dataTransfer.files.length; i++) {
            let file = ev.dataTransfer.files[i];
            currentFile = file;
            dropZoneController.toggleLoading();
            ditherImageFromFile(canvasElement)(
                file,
                currentMethod,
                colors,
                dropZoneController
            );
        }
    }
};

const getNewFileName = (filename) => {
    const parts = filename.split('.');

    return [
        ...parts.slice(0, parts.length - 1),
        '-dithered.',
        ...parts.slice(-1),
    ].join('');
};

const saveImage = (canvas, { name, type = 'image/jpg' }) => {
    const fileName = getNewFileName(name);
    const a = document.createElement('a');
    a.download = fileName;
    a.href = canvas.toDataURL(type);
    setTimeout(() => a.click(), 50);
};

const controller = (element) => {
    const STATES = ['is-waiting', 'is-loading', 'is-loaded'];
    const toggle = (states) => (state) => {
        states
            .filter((s) => s !== state)
            .forEach((s) => element.classList.remove(s));
        element.classList.add(state);
    };

    return {
        toggleWaiting: () => toggle(STATES)('is-waiting'),
        toggleLoading: () => toggle(STATES)('is-loading'),
        toggleLoaded: () => toggle(STATES)('is-loaded'),
    };
};

export const init = ({
    methodSelectElement,
    dropZoneElement,
    waitingContainerElement,
    filePickerElement,
    canvasElement,
    saveImageButton,
    primaryColorInput,
    secondaryColorInput,
}) => {
    const dropZoneController = controller(dropZoneElement);

    methodSelectElement.addEventListener('change', (e) => {
        currentMethod = Number(methodSelectElement.value);
        dropZoneController.toggleLoading();
        ditherImage(canvasElement)(
            currentImage,
            currentMethod,
            colors,
            dropZoneController
        );
    });

    dropZoneElement.ondrop = dropHandler(dropZoneController, canvasElement);
    dropZoneElement.ondragover = (event) => {
        event.preventDefault();
        waitingContainerElement.classList.add('is-hovering');
    };

    dropZoneElement.ondragleave = (event) => {
        event.preventDefault();
        waitingContainerElement.classList.remove('is-hovering');
    };

    filePickerElement.addEventListener('change', (event) => {
        event.preventDefault();
        for (let i = 0; i < filePickerElement.files.length; i++) {
            const file = filePickerElement.files[i];
            currentFile = file;

            dropZoneController.toggleLoading();
            ditherImageFromFile(canvasElement)(
                file,
                currentMethod,
                colors,
                dropZoneController
            );
        }
    });

    saveImageButton.addEventListener('click', () => {
        saveImage(canvasElement, {
            name: currentFile.name,
            type: currentFile.type,
        });
    });

    primaryColorInput.addEventListener('change', () => {
        colors.primary = hexToRgb(primaryColorInput.value);
        ditherImage(canvasElement)(
            currentImage,
            currentMethod,
            colors,
            dropZoneController
        );
    });

    secondaryColorInput.addEventListener('change', () => {
        colors.secondary = hexToRgb(secondaryColorInput.value);
        ditherImage(canvasElement)(
            currentImage,
            currentMethod,
            colors,
            dropZoneController
        );
    });
};
