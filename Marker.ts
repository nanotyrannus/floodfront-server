export class Marker {
    private _lat: number
    private _lon: number
    private _angle: number
    private _isDirectional: boolean

    constructor(lat: number, lon: number, angle: number = null) {
        this._lat = lat
        this._lon = lon
        if (angle === null) {
            this._isDirectional = false
        } else {
            this._angle = angle
            this._isDirectional = true
        }
    }

    get lat(): number {
        return this._lat
    }

    set lat(lat: number) {
        this._lat = lat
    }

    get lon(): number {
        return this._lon
    }

    set lon(lon: number) {
        this._lon = lon
    }

    get angle(): number {
        return this._angle
    }

    set angle(angle: number) {
        if (angle < 0 ) {
            this._angle = null
            this._isDirectional = false
        } else {
            this._angle = angle
            this._isDirectional = true
        }
    }


}