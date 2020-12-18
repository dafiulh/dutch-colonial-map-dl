import 'alpinejs';
import axios from 'axios';
import {
    generateRegions,
    requestUrl,
    blobToBase64,
    combineImages,
    arrayToMatrix
} from './utils';

// TODO: user custom division area
const divisionArea = {
    low: [1, 1],
    medium: [1, 2],
    high: [2 ,2]
};

window.processor = () => ({
    name: '',
    quality: '',
    isLoading: false,
    isDownloadable: false,
    downloadUrl: '',
    start($dispatch) {
        // prevent multiple processing
        if (this.isLoading) {
            return;
        }

        if (this.name === '' || this.quality === '') {
            $dispatch('show-error', 'Please input the map name and quality');
            return;
        }

        this.isLoading = true;

        const mapName = this.name;
        const mapQlt = this.quality;
        // generate regions with selected map quality
        const regions = generateRegions.apply(null, divisionArea[mapQlt]);
        const fetchPromises = [];

        regions.forEach((region) => {
            fetchPromises.push(
                axios.get(requestUrl(mapName, region), {
                    responseType: 'blob'
                })
            );
        });

        Promise.all(fetchPromises).then((blobs) => {
            return Promise.all(
                blobs.map((blob) => blobToBase64(blob.data))
            );
        }).then((imageUrls) => {
            if (imageUrls.length === 1) {
                return imageUrls[0];
            } else {
                const maxElems = divisionArea[mapQlt][0];

                return combineImages(
                    arrayToMatrix(imageUrls, maxElems),
                    'image/jpeg'
                );
            }
        }).then((imageUrl) => {
            this.isDownloadable = true;
            this.downloadUrl = imageUrl;
        }).catch((err) => {
            if (err.message === 'Request failed with status code 404') {
                err.message = `No map named "${this.name}" was found`;
            }

            $dispatch('show-error', err.message);
        }).finally(() => {
            this.isLoading = false;
        });
    },
    // download image in jpeg format
    download() {
        const link = document.createElement('a');

        link.download = `${this.name}_${this.quality}.jpeg`;
        link.href = this.downloadUrl;
        link.click();
    }
});

window.errorAlert = () => ({
    show: false,
    message: ''
});
