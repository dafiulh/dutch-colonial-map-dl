export function generateRegions(horizontalDiv, verticalDiv) {
    const f_ = (num) => parseFloat(num.toFixed(6));
    const width = 1 / horizontalDiv;
    const height = 1 / verticalDiv;
    const regions = [];

    for (let y = 0; y < 1; y += height) {
        for (let x = 0; x < 1; x += width) {
            regions.push(
                `${f_(x)},${f_(y)},${f_(width)},${f_(height)}`
            );
        }
    }

    return regions;
}

export function requestUrl(name, region) {
    // TODO: make a request without using proxy
    const proxy = 'https://cors-anywhere.herokuapp.com';
    const baseUrl = 'http://maps.library.leiden.edu/fcgi-bin/iipsrv.fcgi';

    return `${proxy}/${baseUrl}?FIF=/home/maps/tif/${name}.tif&rgn=${region}&cvt=jpeg`
}

export function combineImages(rowsOfSources = [], format = 'image/png') {
    const images = [];

    rowsOfSources.forEach((rowOfSources, rowIndex) => {
        if (!Array.isArray(rowOfSources)) {
            rowOfSources = [rowOfSources];
        }

        rowOfSources.forEach((source, sourceIndex) => {
            images.push(new Promise((resolve, reject) => {
                const image = new Image();

                image.src = source;
                image.onload = () => resolve({
                    elem: image,
                    orderX: sourceIndex,
                    orderY: rowIndex
                });
                image.onerror = () => reject(
                    new Error('Couldn\'t load image')
                );
            }));
        });
    });

    return new Promise((resolve) => Promise.all(images).then((images) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const rowsOfImages = images.reduce((acc, image) => {
            if (!acc[image.orderY]) {
                acc[image.orderY] = [];
            }
            
            acc[image.orderY].push(image);

            return acc;
        }, []);

        canvas.width = Math.max.apply(null, rowsOfImages.map((rowOfImages) => {
            let rowWidth = 0;

            rowOfImages.forEach((image) => {
                rowWidth += image.elem.width;
            });

            return rowWidth;
        }));
        canvas.height = rowsOfImages.map((rowOfImages) => {
            return Math.max.apply(null, rowOfImages.map((image) => {
                return image.elem.height;
            }));
        }).reduce((acc, curr) => acc + curr, 0);

        let xCoord = 0;
        let yCoord = 0;

        rowsOfImages.forEach((rowOfImages) => {
            rowOfImages.forEach((image) => {
                ctx.drawImage(image.elem, xCoord, yCoord);

                xCoord += image.elem.width;
            });

            xCoord = 0;
            yCoord += Math.max.apply(null, rowOfImages.map((image) => {
                return image.elem.height;
            }));
        });

        const base64Result = canvas.toDataURL(format);

        resolve(base64Result);
    }));
}

export function blobToBase64(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    return new Promise((resolve) => {
        reader.onloadend = () => {
            resolve(reader.result);
        }
    });
}

export function arrayToMatrix(arr, elementsPerSubArray) {
    const matrix = [];

    for (let i = 0, j = -1; i < arr.length; i++) {
        if (i % elementsPerSubArray === 0) {
            j++;
            matrix[j] = [];
        }

        matrix[j].push(arr[i]);
    }

    return matrix;
}