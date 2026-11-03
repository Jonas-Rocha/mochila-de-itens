export class BagError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "BagError"
    }
}