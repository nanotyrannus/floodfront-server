"use strict";
class Marker {
    constructor(lat, lon, angle = null) {
        this._lat = lat;
        this._lon = lon;
        if (angle === null) {
            this._isDirectional = false;
        }
        else {
            this._angle = angle;
            this._isDirectional = true;
        }
    }
    get lat() {
        return this._lat;
    }
    set lat(lat) {
        this._lat = lat;
    }
    get lon() {
        return this._lon;
    }
    set lon(lon) {
        this._lon = lon;
    }
    get angle() {
        return this._angle;
    }
    set angle(angle) {
        if (angle < 0) {
            this._angle = null;
            this._isDirectional = false;
        }
        else {
            this._angle = angle;
            this._isDirectional = true;
        }
    }
}
exports.Marker = Marker;
