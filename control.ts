import { query } from "./shared/database"

export class Control {

    /**
     * Creates marker in event, returns marker's unique ID
     */
    static addMarker(eventId: number): number {

        return 0
    }

    /**
     * Update marker by unique ID
     */
    static updateMarker(markerId: number) {

    }

    /**
     * Delete marker by unique ID
     */
    static deleteMarker(markerId: number) {

    }

    static createEvent(eventName: string, eventBounds: any) {
        
    }
}