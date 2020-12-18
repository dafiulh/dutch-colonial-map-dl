// generate IIPImage rgn protocol
// see https://iipimage.sourceforge.io/documentation/protocol
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

// combine multiple images into one using canvas
// rowOfSources contains "two dimensional array", sub array (row) as the x axis
export function combineImages(rowsOfSources = [], format = 'image/png') {
    const images = [];

    // loop through rows of sources (source = image src/url)
    rowsOfSources.forEach((rowOfSources, rowIndex) => {
        if (!Array.isArray(rowOfSources)) {
            rowOfSources = [rowOfSources];
        }

        // loop through sources of current row
        rowOfSources.forEach((source, sourceIndex) => {
            images.push(new Promise((resolve, reject) => {
                const image = new Image();

                image.src = source;
                image.onload = () => resolve({
                    // <img/> element to be used on canvas drawImage
                    elem: image,
                    // horizontal order
                    orderX: sourceIndex,
                    // vertical order
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

        // set widest rows as canvas width
        canvas.width = Math.max.apply(null, rowsOfImages.map((rowOfImages) => {
            let rowWidth = 0;

            rowOfImages.forEach((image) => {
                rowWidth += image.elem.width;
            });

            return rowWidth;
        }));
        // set sum of all tallest image of all rows as canvas height
        canvas.height = rowsOfImages.map((rowOfImages) => {
            // this will return tallest image in current row
            return Math.max.apply(null, rowOfImages.map((image) => {
                return image.elem.height;
            }));
        }).reduce((acc, curr) => acc + curr, 0);

        let xCoord = 0;
        let yCoord = 0;

        // loop through rows of images
        rowsOfImages.forEach((rowOfImages) => {
            // loop through images on current row
            rowOfImages.forEach((image) => {
                // draw image to canvas
                ctx.drawImage(image.elem, xCoord, yCoord);

                // increment x coordinate by current image width
                xCoord += image.elem.width;
            });

            // reset x coordinate because row will change (next row)
            xCoord = 0;
            // increment y coordinate by current row height
            yCoord += Math.max.apply(null, rowOfImages.map((image) => {
                return image.elem.height;
            }));
        });

        // convert canvas element to base64
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

// creates an array of elements split into groups the length of size
// same as lodash.chunk
export function arrayToMatrix(arr, size) {
    const matrix = [];

    for (let i = 0, j = -1; i < arr.length; i++) {
        if (i % size === 0) {
            j++;
            matrix[j] = [];
        }

        matrix[j].push(arr[i]);
    }

    return matrix;
}